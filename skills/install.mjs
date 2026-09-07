#!/usr/bin/env node
// 安装 skills/ 目录下的内置技能到各编码 agent 的技能目录（幂等：默认已存在跳过）。
// 用法（项目根执行）：
//   node skills/install.mjs [--agents claude,cursor]  安装缺失的（已存在跳过）
//   node skills/install.mjs --update                   用当前 skills/ 源覆盖已安装副本
//   node skills/install.mjs --force                   --update 的别名
// 只做"复制"，不执行技能内容；安装记录写入 skills/.installed.json（供审计/更新）。
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AGENTS = {
  claude: (root) => path.join(root, '.claude', 'skills'),
  cursor: (root) => path.join(root, '.cursor', 'skills'),
};

function parseArgs() {
  const argv = process.argv.slice(2);
  const idx = argv.indexOf('--agents');
  const agents = idx > -1 && argv[idx + 1] ? argv[idx + 1].split(',').map((s) => s.trim()) : Object.keys(AGENTS);
  for (const a of agents) {
    if (!AGENTS[a]) {
      console.error(`未知 agent：${a}（支持 ${Object.keys(AGENTS).join(' / ')}）`);
      process.exit(1);
    }
  }
  return { agents, update: argv.includes('--update') || argv.includes('--force') };
}

function skillName(skillDir) {
  const head = readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8').split('\n').slice(0, 40).join('\n');
  const m = head.match(/^name:\s*"?([^"\s]+)"?\s*$/m);
  return (m?.[1] || path.basename(skillDir)).trim();
}

const { agents, update } = parseArgs();
const skillsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const root = path.dirname(skillsDir);
const MANIFEST = path.join(skillsDir, '.installed.json');

// 只扫顶层技能；experimental/ 等子目录不会被自动安装
const skillDirs = readdirSync(skillsDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => path.join(skillsDir, e.name))
  .filter((d) => existsSync(path.join(d, 'SKILL.md')));

if (skillDirs.length === 0) {
  console.log('✔ 内置技能 0 个（技能入库标准见 skills/README.md）');
  process.exit(0);
}

console.log(`${update ? '更新' : '安装'} ${skillDirs.length} 个内置技能 → ${agents.join(' / ')}`);
const entries = [];
for (const dir of skillDirs) {
  const name = skillName(dir);
  for (const agent of agents) {
    const agentDir = AGENTS[agent](root);
    mkdirSync(agentDir, { recursive: true });
    const target = path.join(agentDir, name);
    const rel = path.relative(root, target).replace(/\\/g, '/');
    let action;
    if (existsSync(target)) {
      if (update) {
        rmSync(target, { recursive: true, force: true });
        cpSync(dir, target, { recursive: true });
        action = 'updated';
      } else {
        action = 'skipped';
      }
    } else {
      cpSync(dir, target, { recursive: true });
      action = 'installed';
    }
    console.log(`  ${action === 'skipped' ? '↷' : action === 'updated' ? '⇅' : '✔'} ${agent}: ${name} ${action} → ${rel}`);
    entries.push({ name, agent, target: rel, action, at: new Date().toISOString() });
  }
}
writeFileSync(
  MANIFEST,
  JSON.stringify({ updatedAt: new Date().toISOString(), entries }, null, 2) + '\n',
  'utf8',
);
console.log(`记录已写入 skills/.installed.json（含 ${entries.length} 条）`);
console.log('提示：技能源在 skills/；experimental/ 下的草案技能不会自动安装。');
