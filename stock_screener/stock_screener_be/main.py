import sys
import os

# Ensure the project root is always on the path (needed for uvicorn subprocess)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import uvicorn

if __name__ == "__main__":
    print("[stock_screener_be] 서버 시작 - DB 비밀번호 로테이션 재배포 (2026-06)")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8005)
