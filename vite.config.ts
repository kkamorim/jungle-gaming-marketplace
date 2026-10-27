import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  build: {
    rolldownOptions: {
      output: {
        manualChunks: (id: string) => {
          // React core — carregado em toda rota, chunk separado para cache longo
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          // TanStack (Router + Query) — compartilhado mas raramente muda
          if (id.includes('@tanstack')) {
            return 'vendor-tanstack';
          }
          // Socket.IO client — necessário apenas quando conectado
          if (id.includes('socket.io-client') || id.includes('engine.io-client')) {
            return 'vendor-socketio';
          }
          // MSW — usado apenas em dev/demo, não bloqueia o carregamento inicial
          if (id.includes('msw') || id.includes('@mswjs')) {
            return 'vendor-msw';
          }
          // Lucide icons — tree-shakeable mas ainda volumoso
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }
        },
      },
    },
  },
})

