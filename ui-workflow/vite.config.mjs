// 每个 run 是一个独立的小应用：RUN=runs/<name> npx vite build
import path from 'node:path';
import {defineConfig} from 'vite';

const run = process.env.RUN;
if (!run) throw new Error('用 RUN=runs/<name> 指定要构建的 run');

export default defineConfig({
  root: path.resolve(run),
  base: './',
  esbuild: {jsx: 'automatic'},
  oxc: {jsx: {runtime: 'automatic'}},
  build: {outDir: 'dist', emptyOutDir: true},
  server: {fs: {allow: [path.resolve('.')]}},
});
