#!/usr/bin/env node
// 安装 skills/ 目录下的全部内置技能到各编码 agent 的技能目录（幂等：已存在跳过）。
// 用法（项目根执行）：node skills/install.mjs [--agents claude,cursor]
// 本项目保持零依赖；只做"复制"，不执行技能内容。
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** 各 agent 在项目内的技能目录（相对项目根） */
const AGENTS = {
  claude: (root) => path.join(root, '.claude', 'skills'),
  cursor: (root) => path.join(root, '.cursor', 'skills'),
};

function parseArgs() {
  const argv = process.argv.slice(2);
  const idx = argv.indexOf('--agents');
  const agents =
    idx > -1 && argv[idx + 1] ? argv[idx + 1].split(',').map((s) => s.trim()) : Object.keys(AGENTS);
  for (const a of agents) {
    if (!AGENTS[a]) {
      console.error(`未知 agent：${a}（支持 ${Object.keys(AGENTS).join(' / ')}）`);
      process.exit(1);
    }
  }
  return agents;
}

/** 解析技能名：SKILL.md frontmatter name 优先，否则用目录名 */
function skillName(skillDir) {
  const head = readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8').split('\n').slice(0, 40).join('\n');
  const m = head.match(/^name:\s*"?([^"\s]+)"?\s*$/m);
  return (m?.[1] || path.basename(skillDir)).trim();
}

const agents = parseArgs();
const skillsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url))); // <项目根>/skills
const root = path.dirname(skillsDir); // 项目根

const skillDirs = readdirSync(skillsDir, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => path.join(skillsDir, e.name))
  .filter((d) => existsSync(path.join(d, 'SKILL.md')));

if (skillDirs.length === 0) {
  console.log('✔ 内置技能 0 个（技能入库标准见 skills/README.md；首批技能入库后本命令自动生效）');
  process.exit(0);
}

console.log(`装 ${skillDirs.length} 个内置技能 → ${agents.join(' / ')}`);
for (const dir of skillDirs) {
  const name = skillName(dir);
  for (const agent of agents) {
    const targetDir = AGENTS[agent](root);
    mkdirSync(targetDir, { recursive: true });
    const target = path.join(targetDir, name);
    if (existsSync(target)) {
      console.log(`  ↷ ${agent}: ${name} 已存在，跳过`);
    } else {
      cpSync(dir, target, { recursive: true });
      console.log(`  ✔ ${agent}: ${name} 已安装 → ${path.relative(root, target)}`);
    }
  }
}
console.log('提示：技能源在 skills/；重装后如需更新请删除对应已装目录再运行。');
