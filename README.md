# Sample React Project

A simple React application that can be served locally with Python or deployed to GitHub Pages.

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Serve with Python:
```bash
python serve.py
```

The application will be available at http://localhost:8000

## GitHub Pages Deployment

This project is configured for GitHub Pages deployment.

1. Push your code to a GitHub repository
2. Go to your repository Settings → Pages
3. Under "Source", select "GitHub Actions"
4. The GitHub Actions workflow will automatically build and deploy your site when you push to the `main` branch

**Note:** If your repository name is different from `Sample-React-Project`, update the `base` path in `vite.config.js` to match your repository name (e.g., if your repo is `my-app`, change it to `'/my-app/'`).

