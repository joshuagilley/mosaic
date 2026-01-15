# Mosaic

A sandbox environment for mathematical computing and exploration. Built with Nuxt 4 and deployed on Fly.io.

## Features

- **Vektor**: Interactive linear algebra playground (all computations happen in the browser)
- Hexagonal mosaic interface for navigating different tools
- Nuxt 4 frontend with SSR and Tailwind CSS

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

### Linting

```bash
npm run lint
```

### Code Formatting

Use your preferred formatter (Nuxt/Tailwind do not add one by default).

## Pre-commit Hooks

The pre-commit hook runs `npm run lint`. If it fails, the commit will be blocked. To bypass (not recommended):
```bash
git commit --no-verify
```

## Project Structure

```
mosaic/
├── pages/                 # Nuxt routes
│   ├── index.vue          # Home page with mosaic layout
│   ├── data-science/      # Data science routes
│   └── ...
├── components/            # Vue components
├── assets/                # Global styles
├── nuxt.config.ts         # Nuxt configuration
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
