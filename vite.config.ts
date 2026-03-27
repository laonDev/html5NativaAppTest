import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';
import type { Connect } from 'vite';

// ── Spine manifest — shared scanner ───────────────────────────────────────────
function scanSpineAssets(spineDir: string) {
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
          json: `assets/spine/${folder}/${jsonFile}`,
          atlas: `assets/spine/${folder}/${atlasFile}`,
        });
      }
    }

    // Flat-based: public/assets/spine/{name}.json + {name}.atlas
    const jsonFiles = entries.filter((e) => e.isFile() && e.name.endsWith('.json'));
    for (const jf of jsonFiles) {
      if (jf.name === 'manifest.json') continue;
      const base = jf.name.slice(0, -5);
      if (entries.some((e) => e.name === `${base}.atlas`)) {
        items.push({
          name: base,
          json: `assets/spine/${jf.name}`,
          atlas: `assets/spine/${base}.atlas`,
        });
      }
    }
  } catch {
    /* directory empty or missing */
  }

  return items;
}

// ── Vite plugin ───────────────────────────────────────────────────────────────
function spineManifestPlugin() {
  const spineDir = path.resolve(__dirname, 'public/assets/spine');

  return {
    name: 'spine-manifest',

    // Dev: serve manifest at /assets/spine/manifest.json
    configureServer(server: { middlewares: Connect.Server }) {
      server.middlewares.use('/assets/spine/manifest.json', (_req, res) => {
        const items = scanSpineAssets(spineDir);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ items }));
      });
    },

    // Build: write manifest.json into dist
    writeBundle(options: { dir?: string }) {
      const outDir = options.dir || path.resolve(__dirname, 'dist');
      const manifestDir = path.join(outDir, 'assets/spine');
      const items = scanSpineAssets(spineDir);

      if (!fs.existsSync(manifestDir)) {
        fs.mkdirSync(manifestDir, { recursive: true });
      }
      fs.writeFileSync(
        path.join(manifestDir, 'manifest.json'),
        JSON.stringify({ items }, null, 2),
      );
    },

    // SPA fallback: copy index.html → 404.html for GitHub Pages routing
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist');
      const indexPath = path.join(outDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, path.join(outDir, '404.html'));
      }
    },
  };
}

// GitHub Actions sets GITHUB_ACTIONS=true — use repo base path only in CI
const isGitHubPages = !!process.env.GITHUB_ACTIONS;

export default defineConfig({
  base: isGitHubPages ? '/html5NativaAppTest/' : '/',
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
