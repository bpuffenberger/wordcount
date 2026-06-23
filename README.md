# Word Count Exclusion Tool (React + GitHub Actions)

This is a **real React app** built with **Vite** and configured to deploy to **GitHub Pages using GitHub Actions**.

## What is included
- React + Vite app
- GitHub Actions workflow for Pages deployment
- Single-page word count tool with exclusions and optional number filtering

## Files you will upload to GitHub
Upload the *contents* of this folder to the root of a GitHub repository.

## Quick deploy steps
1. Create a new GitHub repository.
2. Upload all files and folders from this package to the root of the repository.
3. In GitHub go to **Settings > Pages**.
4. Under **Build and deployment**, choose **GitHub Actions** as the source.
5. Commit/push to the `main` branch.
6. GitHub Actions will build and deploy the app automatically.

## Important base path note
In `vite.config.js`, the configuration uses:

```js
base: './'
```

That is convenient for a reusable template and often works well for GitHub Pages project repos because asset paths stay relative.

If you want the canonical Vite GitHub Pages setup, replace it with your repository path:

```js
base: '/YOUR-REPO-NAME/'
```

Example:
If your repo is `word-count-tool`, use:

```js
base: '/word-count-tool/'
```

## Local development
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
npm run preview
```
