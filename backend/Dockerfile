# Use official lightweight Python 3.12 image
FROM python:3.12-slim

# Install uv from official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Set working directory inside container
WORKDIR /app

# Configure uv and Python environment
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    PYTHONUNBUFFERED=1

# Copy project dependency files first for layer caching
COPY pyproject.toml uv.lock README.md ./

# Install project dependencies with uv
RUN uv sync --frozen --no-install-project --no-dev

# Copy application source code
COPY . /app

# Ensure virtualenv binaries are available in PATH
ENV PATH="/app/.venv/bin:$PATH"

# Expose FastAPI port
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=5s \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

# Run FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
