import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';
import type { Connect } from 'vite';

// ── Spine manifest — shared scanner ───────────────────────────────────────────
/**
 * [Spine 로직] public/assets/spine 폴더를 스캔하여 manifest.json을 자동 생성합니다.
 */
function scanSpineAssets(spineDir: string) {
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

const isGitHubPages = !!process.env.GITHUB_ACTIONS;

export default defineConfig(({ mode }) => {
    // 환경별 .env 로드
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
            /**
             * [Phase 2] CORS 보안 정책 대응 및 API 경로 최적화
             * - 브라우저의 동일 출처 정책(CORS)을 우회하기 위한 리버스 프록시 설정입니다.
             * - [4/10 정교화] 정규표현식을 활용하여 하위 경로 치환 시의 매핑 오류를 방지합니다.
             */
            proxy: {
                '^/api/.*': {
                    target: env.VITE_API_BASE_URL || 'http://10.11.2.37:24080',
                    changeOrigin: true, // CORS 우회를 위해 Origin 헤더를 Target 주소에 맞게 변조
                    secure: false,
                    // /api/v1 -> /v1 형태로 정확히 경로 치환
                    rewrite: (path) => path.replace(/^\/api/, ''),
                },
                '^/supr/.*': {
                    target: env.VITE_SUPR_API_BASE_URL || 'https://api-staging.nyspins.com',
                    changeOrigin: true,
                    secure: false,
                    rewrite: (path) => path.replace(/^\/supr/, ''),
                }
            }
        },
    };
});