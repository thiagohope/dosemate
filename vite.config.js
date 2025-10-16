import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/dosemate/",
    build: { // <-- ADICIONE ESTA SEÇÃO
    outDir: 'docs'
    },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'assets/*.svg'],
      manifest: {
        name: 'DoseMate',
        short_name: 'DoseMate',
        description: 'Calculadora de infusão contínua e matriz de incompatibilidade de medicamentos para UTI e emergência.',
        theme_color: '#31B4D3',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/dosemate/',
        start_url: '/dosemate/',
        icons: [
          {
            src: 'web-app-manifest-192x192.png', // Ícone 192x192 na pasta public
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'web-app-manifest-512x512.png', // Ícone 512x512 na pasta public
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
