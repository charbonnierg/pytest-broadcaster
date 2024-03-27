import react from "@astrojs/react"
import { defineConfig } from "astro/config"
import { viteStaticCopy } from "vite-plugin-static-copy"

// https://astro.build/config
export default defineConfig({
  output: "static",
  integrations: [react()],
  vite: {
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: "node_modules/@shoelace-style/shoelace/dist/assets/**/*",
            dest: "./shoelace/assets",
          },
        ],
      }),
    ],
  },
})
