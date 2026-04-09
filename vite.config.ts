import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';
import type { Connect } from 'vite';

// ── Spine manifest — shared scanner ───────────────────────────────────────────
function scanSpineAssets(spineDir: string) {
    // ... (기존 Spine 로직 동일 유지) ...
    const items: { name: string; json: string; atlas: string }[] = [];
    try {
        const entries = fs.readdirSync(spineDir, { withFileTypes: true });
        for (const entry of entries) {
            if (!entry.isDirectory()) continue;
            const folder = entry.name;
            const files = fs.readdirSync(path.join(spineDir, folder));
            const jsonFile = files.find((f) => f.endsWith('.json'));
            const atlasFile = files.find((f) => f.endsWith('.atlas'));
            if (jsonFile && atlasFile) {
                items.push({ name: folder, json: `assets/spine/${folder}/${jsonFile}`, atlas: `assets/spine/${folder}/${atlasFile}` });
            }
        }
        const jsonFiles = entries.filter((e) => e.isFile() && e.name.endsWith('.json'));
        for (const jf of jsonFiles) {
            if (jf.name === 'manifest.json') continue;
            const base = jf.name.slice(0, -5);
            if (entries.some((e) => e.name === `${base}.atlas`)) {
                items.push({ name: base, json: `assets/spine/${jf.name}`, atlas: `assets/spine/${base}.atlas` });
            }
        }
    } catch { }
    return items;
}

// ── Vite plugin ───────────────────────────────────────────────────────────────
function spineManifestPlugin() {
    const spineDir = path.resolve(__dirname, 'public/assets/spine');
    return {
        name: 'spine-manifest',
        configureServer(server: { middlewares: Connect.Server }) {
            server.middlewares.use('/assets/spine/manifest.json', (_req, res) => {
                const items = scanSpineAssets(spineDir);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ items }));
            });
        },
        writeBundle(options: { dir?: string }) {
            const outDir = options.dir || path.resolve(__dirname, 'dist');
            const manifestDir = path.join(outDir, 'assets/spine');
            const items = scanSpineAssets(spineDir);
            if (!fs.existsSync(manifestDir)) fs.mkdirSync(manifestDir, { recursive: true });
            fs.writeFileSync(path.join(manifestDir, 'manifest.json'), JSON.stringify({ items }, null, 2));
        },
        closeBundle() {
            const outDir = path.resolve(__dirname, 'dist');
            const indexPath = path.join(outDir, 'index.html');
            if (fs.existsSync(indexPath)) fs.copyFileSync(indexPath, path.join(outDir, '404.html'));
        },
    };
}

// GitHub Actions 세팅
const isGitHubPages = !!process.env.GITHUB_ACTIONS;

// defineConfig를 함수 형태로 변경하여 env 환경 변수를 로드할 수 있도록 구성
export default defineConfig(({ mode }) => {
    // 현재 디렉토리 기준 .env 파일 로드
    const env = loadEnv(mode, process.cwd(), '');

    return {
        base: isGitHubPages ? '/html5NativaAppTest/' : '/',
        plugins: [react(), tailwindcss(), spineManifestPlugin()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        server: {
            port: 3000,
            // [Phase 2] CORS 트러블슈팅: 로컬 개발 환경에서 실서버 API 호출 시 Origin 헤더 우회 프록시
            proxy: {
                '/api': {
                    target: env.VITE_API_BASE_URL || 'http://10.11.2.37:24080',
                    changeOrigin: true, // Target URL의 Origin으로 헤더 변조 (CORS 우회 핵심)
                    secure: false,
                    rewrite: (path) => path.replace(/^\/api/, ''),
                },
                '/supr': {
                    target: env.VITE_SUPR_API_BASE_URL || 'https://api-staging.nyspins.com',
                    changeOrigin: true,
                    secure: false,
                    rewrite: (path) => path.replace(/^\/supr/, ''),
                }
            }
        },
    };
});