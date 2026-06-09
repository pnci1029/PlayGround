import sys
import os

# Ensure the project root is always on the path (needed for uvicorn subprocess)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import uvicorn

if __name__ == "__main__":
    print("[stock_screener_be] 서버 시작 - KIS 연동 활성화 재배포 (KR 시세 KIS 전환, 2026-06)")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8005)
