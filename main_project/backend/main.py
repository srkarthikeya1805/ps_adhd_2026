"""
Root main entrypoint. Re-exports the FastAPI app from app.main.
Allows running `uvicorn main:app --reload` or `python main.py`.
"""

from app.main import app
import uvicorn

if __name__ == "__main__":
    # Hot-reload enabled for development and interactive testing
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)