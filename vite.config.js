import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" keeps asset paths relative, so dist/ can be hosted from any sub-folder.
export default defineConfig({
  base: "./",
  plugins: [react()],
  // ReactBits' DecryptedText imports "motion/react"; point it at framer-motion so it ships once.
  resolve: { alias: { "motion/react": "framer-motion" } },
  server: { host: true },
  build: { chunkSizeWarningLimit: 1300 },
});
