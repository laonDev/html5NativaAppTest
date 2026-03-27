import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';
import type { Connect } from 'vite';

// ── Spine manifest plugin ─────────────────────────────────────────────────────
// GET /_spine/manifest  →  { items: [{ name, json, atlas }] }
// Convention: public/assets/spine/{name}/*.json + *.atlas
function spineManifestPlugin() {
  return {
    name: 'spine-manifest',
    configureServer(server: { middlewares: Connect.Server }) {
      server.middlewares.use('/_spine/manifest', (_req, res) => {
        const spineDir = path.resolve(__dirname, 'public/assets/spine');
        const items: { name: string; json: string; atlas: string }[] = [];

        try {
          const entries = fs.readdirSync(spineDir, { withFileTypes: true });

          // Folder-based: public/assets/spine/{name}/
          for (const entry of entries) {
            if (!entry.isDirectory()) continue;
            const folder = entry.name;
            const files = fs.readdirSync(path.join(spineDir, folder));
            const jsonFile = files.find((f) => f.endsWith('.json'));
            const atlasFile = files.find((f) => f.endsWith('.atlas'));
            if (jsonFile && atlasFile) {
              items.push({
                name: folder,
                json: `/assets/spine/${folder}/${jsonFile}`,
                atlas: `/assets/spine/${folder}/${atlasFile}`,
              });
            }
          }

          // Flat-based: public/assets/spine/{name}.json + {name}.atlas
          const jsonFiles = entries.filter((e) => e.isFile() && e.name.endsWith('.json'));
          for (const jf of jsonFiles) {
            const base = jf.name.slice(0, -5);
            if (entries.some((e) => e.name === `${base}.atlas`)) {
              items.push({
                name: base,
                json: `/assets/spine/${jf.name}`,
                atlas: `/assets/spine/${base}.atlas`,
              });
            }
          }
        } catch {
          /* directory empty or missing */
        }

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ items }));
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), spineManifestPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
});
