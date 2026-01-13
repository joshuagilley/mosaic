# Mosaic

A sandbox environment for mathematical computing and exploration. Built with Next.js, FastAPI, and deployed on Fly.io.

## Features

- **Vektor**: Interactive linear algebra playground with matrix transformations, eigenvalues, eigenvectors, and PCA
- Hexagonal mosaic interface for navigating different tools
- FastAPI backend for mathematical computations
- Next.js frontend with TypeScript

## Setup

### Prerequisites

- Node.js 20+ and npm
- Python 3.11+
- pip or uv (for Python package management)

### Installation

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Install Python dependencies:**
   ```bash
   cd api
   pip install -r requirements.txt
   # or if using uv:
   # uv pip install -r requirements.txt
   cd ..
   ```

3. **Set up pre-commit hooks:**
   ```bash
   # Make the script executable (if not already)
   chmod +x pre-commit.sh
   
   # Install the git hook
   ln -sf ../../pre-commit.sh .git/hooks/pre-commit
   chmod +x .git/hooks/pre-commit
   ```

## Development

### Running the Application

1. **Start the FastAPI backend:**
   ```bash
   npm run api
   # or
   cd api && uvicorn main:app --reload --port 8000
   ```

2. **Start the Next.js frontend:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   - Frontend: http://localhost:3000
   - API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Testing

**Run Python tests:**
```bash
npm run test
# or
cd api && python -m pytest ../tests -v
```

**Run ESLint:**
```bash
npm run lint
```

**Run all checks:**
```bash
npm run test:all
```

### Code Formatting

**Format Python code:**
```bash
npm run format:python
# or manually:
cd api && ruff format ../api ../tests && ruff check --fix ../api ../tests
```

**Format JavaScript/TypeScript:**
```bash
npm run format:js
# or
npm run lint:fix
```

**Format everything:**
```bash
npm run format
```

## Pre-commit Hooks

The pre-commit hook automatically runs:
1. **Ruff formatting** - Formats Python code
2. **Ruff linting** - Checks Python code quality
3. **Pytest** - Runs all Python tests
4. **ESLint** - Checks JavaScript/TypeScript code

If any check fails, the commit will be blocked. To bypass (not recommended):
```bash
git commit --no-verify
```

## Project Structure

```
mosaic/
├── api/                    # FastAPI backend
│   ├── main.py            # FastAPI app and routes
│   ├── linear_algebra.py  # Core NumPy linear algebra functions
│   └── requirements.txt   # Python dependencies
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page with mosaic layout
│   ├── vektor/            # Vektor linear algebra playground
│   └── ...
├── tests/                  # Test suite
│   ├── test_linear_algebra.py  # Unit tests for linear algebra
│   └── test_api.py        # API endpoint tests
├── Dockerfile             # Docker configuration
├── fly.toml               # Fly.io deployment config
├── pyproject.toml         # Ruff and pytest configuration
├── pytest.ini             # Pytest configuration
├── pre-commit.sh          # Pre-commit hook script
└── package.json           # Node.js dependencies and scripts
```

## Deployment

Deploy to Fly.io:
```bash
flyctl deploy
```

## License

This project is open source and available for educational purposes.
