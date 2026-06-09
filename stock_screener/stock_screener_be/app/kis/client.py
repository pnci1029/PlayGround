"""
KIS (한국투자증권) OpenAPI 클라이언트.

- 접근토큰(access token) 발급 + 파일 캐싱 (24h 유효, 분당 재발급 제한 회피)
- REST GET 요청 래퍼 (실전/모의 도메인 자동 선택)

⚠️ 조회(시세) 전용입니다. 주문 관련 API는 의도적으로 포함하지 않았습니다.
"""
import os
import json
import time
import logging

import requests

from app.config import KIS_ENV, KIS_APP_KEY, KIS_APP_SECRET

log = logging.getLogger("kis.client")

# 실전 / 모의 도메인
_DOMAINS = {
    "real": "https://openapi.koreainvestment.com:9443",
    "paper": "https://openapivts.koreainvestment.com:29443",
}


class KISError(Exception):
    """KIS API가 rt_cd != '0' 으로 응답했을 때."""

    def __init__(self, code, msg, payload=None):
        super().__init__(f"[{code}] {msg}")
        self.code = code
        self.msg = msg
        self.payload = payload


class KISClient:
    def __init__(self, env=None, app_key=None, app_secret=None, token_path=None):
        self.env = (env or KIS_ENV or "real").lower()
        if self.env not in _DOMAINS:
            raise ValueError(f"KIS_ENV must be 'real' or 'paper', got {self.env!r}")
        self.base = _DOMAINS[self.env]
        self.app_key = app_key or KIS_APP_KEY
        self.app_secret = app_secret or KIS_APP_SECRET
        if not self.app_key or not self.app_secret:
            raise RuntimeError(
                "KIS_APP_KEY / KIS_APP_SECRET 가 비어 있습니다. .env 를 확인하세요."
            )
        # 토큰 캐시 파일 (be 루트). app/kis/client.py → 상위 3단계가 be 루트.
        be_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.token_path = token_path or os.path.join(be_root, f".kis_token_{self.env}.json")
        self._token = None
        self._token_exp = 0.0

    # ── 토큰 ────────────────────────────────────────────────
    def _load_cached(self):
        try:
            with open(self.token_path, encoding="utf-8") as f:
                data = json.load(f)
            if data.get("app_key") == self.app_key and data.get("expires_at", 0) > time.time() + 60:
                return data["access_token"], data["expires_at"]
        except Exception:
            pass
        return None, 0.0

    def _save_cached(self, token, expires_at):
        try:
            with open(self.token_path, "w", encoding="utf-8") as f:
                json.dump(
                    {"app_key": self.app_key, "access_token": token, "expires_at": expires_at},
                    f,
                )
        except Exception as e:
            log.warning("token cache write failed: %s", e)

    def get_token(self) -> str:
        # 1) 메모리 캐시
        if self._token and self._token_exp > time.time() + 60:
            return self._token
        # 2) 파일 캐시 (재시작/다른 프로세스 공유)
        token, exp = self._load_cached()
        if token:
            self._token, self._token_exp = token, exp
            return token
        # 3) 신규 발급
        resp = requests.post(
            f"{self.base}/oauth2/tokenP",
            json={
                "grant_type": "client_credentials",
                "appkey": self.app_key,
                "appsecret": self.app_secret,
            },
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        token = data["access_token"]
        expires_in = int(data.get("expires_in", 86400))
        exp = time.time() + expires_in
        self._token, self._token_exp = token, exp
        self._save_cached(token, exp)
        log.info("KIS token issued (env=%s, expires_in=%ss)", self.env, expires_in)
        return token

    # ── 요청 ────────────────────────────────────────────────
    def get(self, path: str, tr_id: str, params: dict, extra_headers: dict | None = None) -> dict:
        headers = {
            "content-type": "application/json; charset=utf-8",
            "authorization": f"Bearer {self.get_token()}",
            "appkey": self.app_key,
            "appsecret": self.app_secret,
            "tr_id": tr_id,
            "custtype": "P",  # 개인
        }
        if extra_headers:
            headers.update(extra_headers)
        resp = requests.get(f"{self.base}{path}", headers=headers, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        # rt_cd: "0" 성공. 시세 일부 응답엔 rt_cd가 없을 수 있어 None도 허용.
        if data.get("rt_cd") not in (None, "0"):
            raise KISError(data.get("msg_cd"), data.get("msg1"), data)
        return data


# 모듈 싱글톤
_client: KISClient | None = None


def get_client() -> KISClient:
    global _client
    if _client is None:
        _client = KISClient()
    return _client
