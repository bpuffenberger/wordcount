import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// If your site is going to a project repo like:
// https://bpuffenberger.github.io/word-count-tool/
// replace './' with '/YOUR-REPO/' for the most canonical GitHub Pages setup.
// Using './' keeps asset paths relative and is convenient for a reusable template.
export default defineConfig({
  plugins: [react()],
  base: '/word-count-tool/',
})
