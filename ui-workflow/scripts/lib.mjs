import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

export const require = createRequire(import.meta.url);
export const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function resolveRun(arg) {
  if (!arg) {
    console.error('用法: node scripts/<script>.mjs runs/<run-name>');
    process.exit(2);
  }
  const abs = path.resolve(process.cwd(), arg);
  if (!fs.existsSync(abs)) {
    console.error(`找不到 run 目录: ${abs}`);
    process.exit(2);
  }
  return {abs, rel: path.relative(KIT, abs)};
}

export const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

export const list = (dir, ext) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => ext.some((e) => f.toLowerCase().endsWith(e))).sort().map((f) => path.join(dir, f))
    : [];

/** Playwright 可能装在项目里，也可能是机器预装的全局版本。 */
export function loadPlaywright() {
  try {
    return require('playwright');
  } catch {
    console.error('需要 Playwright: npm i -D playwright && npx playwright install chromium');
    process.exit(2);
  }
}

export class Report {
  constructor() {
    this.items = [];
  }
  add(level, check, message, where) {
    this.items.push({level, check, message, ...(where ? {where} : {})});
  }
  fail(check, message, where) {
    this.add('fail', check, message, where);
  }
  warn(check, message, where) {
    this.add('warn', check, message, where);
  }
  pass(check, message) {
    this.add('pass', check, message);
  }
  count(level) {
    return this.items.filter((i) => i.level === level).length;
  }
  print() {
    const icon = {fail: 'FAIL', warn: 'WARN', pass: 'ok  '};
    for (const i of this.items) console.log(`${icon[i.level]}  [${i.check}] ${i.message}${i.where ? `  (${i.where})` : ''}`);
    console.log(`\n${this.count('pass')} ok · ${this.count('warn')} warn · ${this.count('fail')} fail`);
  }
}
