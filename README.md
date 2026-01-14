# Mosaic

A sandbox environment for mathematical computing and exploration. Built with Next.js and deployed on Fly.io.

## Features

- **Vektor**: Interactive linear algebra playground (all computations happen in the browser)
- Hexagonal mosaic interface for navigating different tools
- Next.js frontend with TypeScript

## Setup

### Prerequisites

- Node.js 20+ and npm

### Installation

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Set up pre-commit hook (optional but recommended):**
   ```bash
   chmod +x pre-commit.sh
   ln -sf ../../pre-commit.sh .git/hooks/pre-commit
   chmod +x .git/hooks/pre-commit
   ```

## Development

### Running the Application

```bash
npm run dev
```

Open your browser: http://localhost:3000

### Testing / linting

```bash
npm run lint
```

### Code Formatting

```bash
npm run format
```

## Pre-commit Hooks

The pre-commit hook runs ESLint. If it fails, the commit will be blocked. To bypass (not recommended):
```bash
git commit --no-verify
```

## Project Structure

```
mosaic/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page with mosaic layout
│   ├── vektor/            # Vektor linear algebra playground
│   └── ...
├── Dockerfile             # Docker configuration
├── fly.toml               # Fly.io deployment config
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
