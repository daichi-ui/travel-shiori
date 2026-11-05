import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages では https://daichi-ui.github.io/travel-shiori/ で公開する
  base: command === 'build' ? '/travel-shiori/' : '/',
}))
