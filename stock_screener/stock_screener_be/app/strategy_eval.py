"""
전략 조건 평가 (순수 로직).

watchlist 의 strategy-fit 매트릭스와 backtest 의 종목 필터가 동일한 규칙을 쓰므로
규칙을 한 곳에서 관리한다. DB/네트워크 의존성이 없어 단위 테스트가 쉽다.
"""
from typing import Optional

# 비교 연산자 → 함수
OPS_FN = {
    ">":  lambda a, b: a > b,
    "<":  lambda a, b: a < b,
    ">=": lambda a, b: a >= b,
    "<=": lambda a, b: a <= b,
    "=":  lambda a, b: a == b,
}


def evaluate_conditions(funds: dict, conditions: list, logic: str = "AND") -> Optional[bool]:
    """
    주어진 펀더멘털(funds)이 전략 조건을 만족하는지 평가한다.

    - 값이 없거나(None), 미지원 연산자거나, 숫자 변환 실패한 조건은 '평가 불가'로 건너뛴다.
    - 평가 가능한 조건이 하나도 없으면 None(데이터 없음)을 반환한다.
    - logic="AND" 면 모두 충족해야 True, 그 외(OR)면 하나라도 충족 시 True.
    """
    evals = []
    for c in conditions:
        fval = funds.get(c["field"])
        if fval is None:
            continue
        fn = OPS_FN.get(c["op"])
        if fn is None:
            continue
        try:
            evals.append(fn(float(fval), float(c["value"])))
        except (TypeError, ValueError):
            continue

    if not evals:
        return None
    return all(evals) if logic == "AND" else any(evals)
