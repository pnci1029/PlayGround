import sys
import os

# Ensure the project root is always on the path (needed for uvicorn subprocess)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8005)
