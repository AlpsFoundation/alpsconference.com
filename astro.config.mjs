import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

const site = process.env.SITE_URL;

export default defineConfig({
  output: "static",
  site,
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
