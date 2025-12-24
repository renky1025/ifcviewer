import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { URL } from 'node:url'

const bufferGeometryUtilsShim = fileURLToPath(
  new URL('./src/three-fix/BufferGeometryUtils.ts', import.meta.url),
)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'three/examples/jsm/utils/BufferGeometryUtils': bufferGeometryUtilsShim,
    },
  },
})
