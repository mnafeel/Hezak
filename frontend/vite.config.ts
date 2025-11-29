import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// GitHub Pages base path - change this to your repository name
// If your repo is "username/repo-name", use "/repo-name/"
// For root domain, use "/"
// Update this to match your GitHub repository name!
const REPO_NAME = 'Hezak'; // Repository name
const base = process.env.GITHUB_PAGES ? `/${REPO_NAME}/` : '/';

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 4173
  }
});


