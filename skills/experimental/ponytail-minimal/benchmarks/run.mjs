#!/usr/bin/env node
// ponytail-minimal 试点：对照"无技能基线 vs 带技能"两版实现的正确性与代码量。
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const task = path.join(here, 'tasks', 'email-validator');
const { isEmail: base } = await import(pathToFileURL(path.join(task, 'baseline.mjs')).href);
const { isEmail: skill } = await import(pathToFileURL(path.join(task, 'skill.mjs')).href);
const { cases } = await import(pathToFileURL(path.join(task, 'cases.mjs')).href);

function linesOf(file) {
  return readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0 && !l.trim().startsWith('//')).length;
}

let fail = 0;
for (const [input, expected] of cases) {
  const b = base(input);
  const s = skill(input);
  if (s !== expected || b !== expected) {
    fail++;
    console.log(`✗ input=${JSON.stringify(input)} 期望=${expected} 基线=${b} 技能=${s}`);
  }
}
const baseLines = linesOf(path.join(task, 'baseline.mjs'));
const skillLines = linesOf(path.join(task, 'skill.mjs'));
const verdict = fail === 0 && skillLines <= baseLines;
console.log(`用例：${cases.length}，失败：${fail}`);
console.log(`基线实现行数：${baseLines} | 技能实现行数：${skillLines} | 减 ${baseLines - skillLines} 行`);
console.log(`结论（本任务）：${verdict ? '✅ 有效（更少且正确）' : '⚠ 未达优（看备注）'}`);

const date = new Date().toISOString().slice(0, 10);
const result = `# benchmark result — email-validator\n\n- 日期: ${date}\n- 执行者: human-dryrun（待真实模型 A/B 补充）\n- 用例: ${cases.length} / 失败: ${fail}\n- 基线行数: ${baseLines}；技能行数: ${skillLines}（减 ${baseLines - skillLines}）\n- 结论: ${verdict ? '有效（本任务）' : '待分析'}\n`;
const outDir = path.join(here, 'results');
mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, `${date}-human-dryrun.md`), result, 'utf8');
console.log(`结果已写入 benchmarks/results/${date}-human-dryrun.md`);
process.exit(fail > 0 ? 1 : 0);
