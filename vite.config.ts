import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

interface DevQaPreviewBinding {
  mode: 'aistudio_dev_serve';
  expectedOrigin: string;
  expectedHostname: string;
  serviceIdPrefix: 'ais-dev-';
}

function resolveDevQaPreviewBinding(
  command: 'serve' | 'build',
  mode: string,
  env: Record<string, string | undefined>,
  isPreview?: boolean,
): DevQaPreviewBinding | null {
  if (command !== 'serve' || isPreview) return null;
  if (mode === 'production' || env.NODE_ENV !== 'development') return null;

  const flag = (env.VOXVOYAGE_DEV_QA_PREVIEW ?? 'auto').trim().toLowerCase();
  if (flag !== 'auto' && flag !== 'true' && flag !== '1' && flag !== 'on') {
    return null;
  }

  const kService = (env.K_SERVICE ?? '').trim();
  const appUrlRaw = (env.APP_URL ?? '').trim();
  if (!kService || !appUrlRaw) return null;
  if (!/^ais-dev-[a-z0-9-]+$/i.test(kService)) return null;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(appUrlRaw);
  } catch {
    return null;
  }

  if (parsedUrl.protocol !== 'https:') return null;
  const hostname = parsedUrl.hostname.toLowerCase();
  if (hostname.startsWith('ais-pre-')) return null;
  if (!/^ais-dev-[a-z0-9-]+\.[a-z0-9-]+\.run\.app$/.test(hostname)) return null;
  if (!hostname.startsWith(`${kService.toLowerCase()}-`)) return null;

  const allowedHostsRaw = (env.NG_ALLOWED_HOSTS ?? '').trim();
  if (allowedHostsRaw) {
    const hosts = allowedHostsRaw
      .split(',')
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean);
    if (hosts.some((h) => h.startsWith('ais-pre-'))) return null;
    if (!hosts.includes(hostname)) return null;
  }

  const cspRaw = (env.CSP_HEADER_VALUE ?? '').trim();
  if (cspRaw && (!cspRaw.includes('frame-ancestors') || /frame-ancestors[^;]*\s\*(?:\s|;|$)/.test(cspRaw))) {
    return null;
  }

  return {
    mode: 'aistudio_dev_serve',
    expectedOrigin: parsedUrl.origin,
    expectedHostname: hostname,
    serviceIdPrefix: 'ais-dev-',
  };
}

export default defineConfig(({command, mode, isPreview}) => {
  const loadedEnv = loadEnv(mode, process.cwd(), '');
  const runtimeEnv: Record<string, string | undefined> = {
    ...loadedEnv,
    ...process.env,
  };
  const devQaPreviewBinding = resolveDevQaPreviewBinding(command, mode, runtimeEnv, isPreview);

  return {
    define:
      command === 'build'
        ? {
            'import.meta.env.DEV': 'false',
            'import.meta.env.PROD': 'true',
            __VOXVOYAGE_DEV_QA_PREVIEW_BINDING__: 'null',
          }
        : {
            __VOXVOYAGE_DEV_QA_PREVIEW_BINDING__: JSON.stringify(devQaPreviewBinding),
          },
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'inject-dev-qa-preview-binding',
        apply: 'serve',
        transform(code, id) {
          if (!devQaPreviewBinding) return null;
          const cleanId = id.split('?')[0];
          if (!cleanId.endsWith('/src/qa/qaAccess.ts') && !cleanId.endsWith('\\src\\qa\\qaAccess.ts')) {
            return null;
          }
          return {
            code: `globalThis.__VOXVOYAGE_DEV_QA_PREVIEW_BINDING__ = ${JSON.stringify(devQaPreviewBinding)};\n${code}`,
            map: null,
          };
        },
      },
      {
        name: 'exclude-dev-qa-in-production',
        apply: 'build',
        enforce: 'pre',
        resolveId(source) {
          if (
            source.includes('/qa/') ||
            source.startsWith('./qa/') ||
            source.startsWith('./components/qa/')
          ) {
            return '\0voxvoyage-qa-excluded';
          }
          return null;
        },
        load(id) {
          if (id === '\0voxvoyage-qa-excluded') {
            return 'export default null;';
          }
          return null;
        },
      },
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
