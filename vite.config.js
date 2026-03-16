import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Raise warning limit — Firebase SDK is large
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Use a function for manualChunks (required by rolldown in Vite 8)
        manualChunks(id) {
          if (id.includes('node_modules/firebase')) return 'vendor-firebase';
          if (id.includes('node_modules/react-dom')) return 'vendor-react-dom';
          if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router')) return 'vendor-router';
          if (id.includes('node_modules/lucide-react')) return 'vendor-icons';
        },
      },
    },
  },
})
