import * as esbuild from 'esbuild';

// Plugin to exclude vite.ts from bundle
const excludeVitePlugin = {
  name: 'exclude-vite',
  setup(build) {
    build.onResolve({ filter: /\/vite\.ts$/ }, args => {
      return { path: args.path, external: true };
    });
  },
};

await esbuild.build({
  entryPoints: ['server/_core/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outdir: 'dist',
  packages: 'external',
  banner: {
    js: `import { createRequire } from 'module';import { fileURLToPath } from 'url';import { dirname } from 'path';const require = createRequire(import.meta.url);const __filename = fileURLToPath(import.meta.url);const __dirname = dirname(__filename);`
  },
  plugins: [excludeVitePlugin],
  external: [
    'vite',
    '@vitejs/plugin-react'
  ]
});
