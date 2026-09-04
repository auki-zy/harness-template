# harness-template

一套面向 **agent-first 工程化**的高级仓库模板（源自 [walkinglabs/learn-harness-engineering](https://github.com/walkinglabs/learn-harness-engineering) 高级仓库模板，已按主人工程实践扩展为前端友好的开箱基线）。

## 快速使用

```bash
# 方式一：CLI（配合 harness-tool）
npx harness-tool init my-app

# 方式二：GitHub Template（本仓库已标记为 template）
# New repository → Choose a template → auki-zy/harness-template

# 方式三：手动复制
# 复制文件 → 按 index.md 复制顺序 → 按 docs/BOOTSTRAP.md 落地
```

配套 CLI：[`harness-tool`](https://github.com/auki-zy/harness-tool)（把本模板一键带进新项目：`init` 合并不覆盖 + `doctor` 就绪自检）。

## 内置能力（模板 v1，渐进披露——AGENTS 是入口，细节在 docs/）

**治理与流程**
- `AGENTS.md` 开工/路由/完成定义/收尾（canonical 入口）；`ARCHITECTURE.md` 领域地图与分层
- 计划生命周期 `PLANS.md` + `exec-plans/{active,completed}/`、技术债、质量评分 `QUALITY_SCORE.md`
- 可靠性 `RELIABILITY.md`、安全 `SECURITY.md`、长期记忆纪律 `MEMORY.md`（分层/历史索引/收尾卫生）

**前端工程规范**
- `FRONTEND.md`：默认栈契约（React+Vite+TS(strict)+Vitest）与样式方案（**Less Modules**）、可访问性、UI 验证闭环
- `CODE_STANDARDS.md`：命名/文件拆分/TS/副作用/提交约定
- `MODULE_STRUCTURE.md`：**FSD** 分层规则（pages/widgets/features/components/shared；详解见 `docs/references/fsd-guide.md`）
- `TESTING.md` / `CI_CD.md` / `REVIEW.md`：测试策略、CI 门禁蓝图、Code Review 与反馈升级回路

**AI 生态与工具**
- `AGENT_TOOLING.md`：AGENTS.md ↔ CLAUDE.md/`.cursor/rules` 的 canonical/薄视图约定（含样例）
- `skills/`：技能源目录与入库标准（只收真实项目验证过的技能）
- `BOOTSTRAP.md`：开新项目的必填文档/必装机械配置/必跑验证清单（含技能安装）

## Agent 入口

- [`AGENTS.md`](AGENTS.md)：开工流程 + 路由地图（唯一 canonical 入口）
- [`ARCHITECTURE.md`](ARCHITECTURE.md)：领域地图、分层模型、依赖规则
- 治理与规范文档集中在 `docs/`（见 AGENTS 路由地图，渐进披露）

## 定位与原则

- 模板仓库只放**规则与治理骨架**；依赖、配置等机械内容在 bootstrap 时落入具体项目（`docs/BOOTSTRAP.md`）。
- 默认工程基线偏前端（React + Vite + TS + Less Modules）；非默认栈在 `ARCHITECTURE.md` / `docs/FRONTEND.md` 声明覆盖。
- **只收被真实项目验证过的件**（技能/规则/流程）：模板由"使用中的痛点"驱动增长，不做收藏夹式集成。
