import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react-swc'
// import XMLLoader from 'vite-plugin-xml-loader' 
import XMLLoader2 from './vite-plugins/plugin-xml-loader'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // react(),

    XMLLoader2(),

    //@ts-ignore
    // XMLLoader.default(),
  ],
})
