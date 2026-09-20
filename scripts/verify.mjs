#!/usr/bin/env node
/**
 * 零依赖验证脚本：本模板自带的"零成本验证回路"。
 *
 * 用法：node scripts/verify.mjs [--no-suite]
 *   --no-suite  只跑守卫，不跑五件套（守卫本身很快，适合 pre-commit）
 *
 * 顺序（呼应 docs/CI_CD.md 的门禁顺序）：
 *   守卫 G1  BOM    ：所有文本文件不得带 UTF-8 BOM
 *   守卫 G2  引用   ：文档里的链接与 `*.md` 引用必须真实存在（防文档断链漂移）
 *   五件套          ：package.json 里声明的 typecheck / lint / test / build，顺序跑
 *   警告 G3  占位   ：模板占位残留（bootstrap 期必然存在，只提醒不阻断）
 *
 * 退出码：0 全绿；1 有阻断项失败。
 * 加新检查的规矩：先在 docs/CI_CD.md 登记一行（谁 / 跑什么 / 为什么），再在这里实现。
 * 守卫的纪律：**误报比漏报更致命**——一个天天喊狼来了的守卫会被整个无视。G2 因此只判
 * "本来应该是本仓库文件"的引用（见下方 EXTERNAL_NAMES / NAME_TEMPLATE_RE / EXAMPLE_CUE_RE）。
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.next', 'out', '.turbo', '.cache', 'vendor', 'target', '.venv', '__pycache__']);
const SUITE = ['typecheck', 'lint', 'test', 'build'];
const PLACEHOLDER_RE = /\[替换|\[domain-|\[spec path|\[模块 \/ 路由|\[项目名|\[职责\]|模板占位/;
const DOC_DIRS = ['', 'docs', 'docs/design-docs', 'docs/exec-plans', 'docs/exec-plans/active', 'docs/product-specs', 'docs/references', 'docs/generated', 'docs/lessons'];

// G2 的"不判"清单：守卫要能长期留在仓库里，靠的是误报少。
// 判据：只判"本来应该是本仓库文件"的引用。以下三类不是：
//   ① 外部工具约定名（按约定存在于别的工具 / 技能目录，本项目可能永远没有）；
//   ② 命名模板（带 YYYY / <name> 这类占位段，本来就是让人改的）；
//   ③ 同行写明"比如 / 例如 / 样例"的举例引用。
const EXTERNAL_NAMES = new Set(['CLAUDE.md', 'AGENT.md', 'GEMINI.md', 'SKILL.md', 'copilot-instructions.md', '.cursorrules']);
const NAME_TEMPLATE_RE = /YYYY|MM|DD|XX+|<[^>]+>|skill-name|domain-a/;
const EXAMPLE_CUE_RE = /比如|例如|举例|样例|如 `|e\.g\./;

const failures = [];
const warnings = [];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name), out);
    } else if (entry.isFile()) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');

// ── 守卫 G1：BOM ────────────────────────────────────────────────────────────
function guardBom(files) {
  const bad = [];
  for (const f of files) {
    const head = readFileSync(f).subarray(0, 3);
    if (head.length === 3 && head[0] === 0xef && head[1] === 0xbb && head[2] === 0xbf) bad.push(rel(f));
  }
  if (bad.length) {
    failures.push(`守卫 G1（BOM）：${bad.length} 个文件带 UTF-8 BOM —— ${bad.slice(0, 10).join(', ')}${bad.length > 10 ? ` …还有 ${bad.length - 10} 个` : ''}`);
    return false;
  }
  console.log(`✔ 守卫 G1：${files.length} 个文件无 UTF-8 BOM`);
  return true;
}

// ── 守卫 G2：文档引用完整性 ─────────────────────────────────────────────────
function resolveRef(fromFile, target) {
  const clean = target.trim().replace(/^<|>$/g, '').split('#')[0].split('?')[0];
  if (!clean) return true; // 纯锚点
  if (/^[a-z][a-z0-9+.-]*:/i.test(clean)) return true; // 协议：http(s)/mailto/...
  if (clean.startsWith('/') || clean.includes('*') || clean.includes('{')) return true; // 绝对路径与通配不判
  const tries = [path.resolve(path.dirname(fromFile), clean), path.resolve(ROOT, clean)];
  for (const t of tries) if (existsSync(t)) return true;
  if (!clean.includes('/')) {
    for (const d of DOC_DIRS) if (existsSync(path.join(ROOT, d, clean))) return true;
  }
  return false;
}

function guardRefs(mdFiles) {
  const bad = [];
  for (const f of mdFiles) {
    const lines = readFileSync(f, 'utf8').split('\n');
    lines.forEach((line, i) => {
      const targets = [];
      // ① markdown 链接：真正的交叉引用，严格判（举例一般写成反引号，不会走这里）
      for (const m of line.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) targets.push({ target: m[1], strict: true });
      // ② 反引号里的 .md 引用：先按上面三类"不判"过滤
      for (const m of line.matchAll(/`([A-Za-z0-9_\-./]+\.md)`/g)) targets.push({ target: m[1], strict: false });
      for (const { target, strict } of targets) {
        const base = target.trim().split('/').pop();
        if (!strict && (EXTERNAL_NAMES.has(base) || NAME_TEMPLATE_RE.test(base) || EXAMPLE_CUE_RE.test(line))) continue;
        if (!resolveRef(f, target)) bad.push(`${rel(f)}:${i + 1} → ${target.trim()}`);
      }
    });
  }
  if (bad.length) {
    failures.push(`守卫 G2（文档引用）：${bad.length} 处引用指向不存在的文件 —— ${bad.slice(0, 8).join(' | ')}${bad.length > 8 ? ` …还有 ${bad.length - 8} 处` : ''}`);
    return false;
  }
  console.log(`✔ 守卫 G2：${mdFiles.length} 份文档的链接与 md 引用全部落地`);
  return true;
}

// ── 警告 G3：模板占位残留 ──────────────────────────────────────────────────
function warnPlaceholders(mdFiles) {
  const hits = [];
  for (const f of mdFiles) {
    readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
      if (PLACEHOLDER_RE.test(line)) hits.push(`${rel(f)}:${i + 1}`);
    });
  }
  if (hits.length) {
    warnings.push(`警告 G3（占位残留）：${hits.length} 处，开新项目后按 docs/BOOTSTRAP.md 第 2 步填写 —— ${hits.slice(0, 5).join(' ')}${hits.length > 5 ? ' …' : ''}`);
  } else {
    console.log('✔ 警告 G3：未见模板占位残留');
  }
}

// ── 五件套 ─────────────────────────────────────────────────────────────────
function runSuite() {
  const pkgPath = path.join(ROOT, 'package.json');
  if (!existsSync(pkgPath)) {
    console.log('↷ 五件套：无 package.json（纯文档项目可忽略；否则按 docs/BOOTSTRAP.md 第 3 步装配）');
    return true;
  }
  let scripts = {};
  try {
    scripts = JSON.parse(readFileSync(pkgPath, 'utf8')).scripts ?? {};
  } catch {
    failures.push('五件套：package.json 不是合法 JSON，无法读取 scripts');
    return false;
  }
  const absent = SUITE.filter((s) => !scripts[s]);
  if (absent.length) warnings.push(`警告：package.json 缺 scripts：${absent.join(', ')}（命名以 BOOTSTRAP.md 为准，不要发明新名）`);
  let ok = true;
  for (const name of SUITE) {
    if (!scripts[name]) continue;
    console.log(`→ npm run ${name}`);
    const r = spawnSync('npm', ['run', name], { cwd: ROOT, stdio: 'inherit', shell: true });
    if (r.status !== 0) {
      failures.push(`五件套：npm run ${name} 失败（退出码 ${r.status ?? '?'}）—— 先修 baseline，再加新范围`);
      ok = false;
      break;
    }
  }
  if (ok) console.log('✔ 五件套：typecheck / lint / test / build 全绿');
  return ok;
}

// ── 主流程 ─────────────────────────────────────────────────────────────────
const files = walk(ROOT);
const mdFiles = files.filter((f) => f.endsWith('.md'));
console.log(`harness verify @ ${ROOT}\n`);
guardBom(files);
guardRefs(mdFiles);
warnPlaceholders(mdFiles);
if (!process.argv.includes('--no-suite')) runSuite();

console.log('');
for (const w of warnings) console.log(`⚠ ${w}`);
if (failures.length) {
  for (const f of failures) console.log(`✘ ${f}`);
  console.log(`\n结果：${failures.length} 项阻断失败`);
  process.exit(1);
}
console.log('结果：全绿');
