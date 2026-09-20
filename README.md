# harness-template

**agent-first 工程化仓库模板** —— 一套"开工即规范"的基线：AGENTS 路由 + 系统地图 + 计划/质量/规格骨架 + **12 份工程规范文档**（代码规范 / 测试 / 安全 / CI / 前端 / 模块边界 / 设计 / 记忆 / 评审 / 可靠性 / 产品判断 / agent 工具视图），让你的每个项目从一开始就具备 AI 可开工、可验证、可长期演化的工程环境。

> 理念出处：[OpenAI《Harness Engineering》](https://openai.com/index/harness-engineering/) 与 [walkinglabs/learn-harness-engineering](https://github.com/walkinglabs/learn-harness-engineering)。

**模板只放规则骨架，不放产品内容**：技能 / 子代理 / MCP 这类能力不在本仓库分发（用 `harness-tool` 按需安装，见下），机械配置（依赖、lint、测试配置）在 bootstrap 时落入具体项目。

## 快速开始

```bash
# 一键：把工程层装进新项目（推荐）
npx harness-tool init my-app

# 或者：GitHub 上把本仓库当 Template → New repository
```

装好后最小三步开工：

1. **交给 AI**：把 `harness-tool init` 输出的那段交接话发给你的编码 agent（DSH / Claude Code / Cursor / Codex）；
2. **照文档落地**：填 `ARCHITECTURE.md`（系统形态 + 领域地图 + 工程约定）与 `docs/QUALITY_SCORE.md`，装配五件套脚本，建第一份 active plan（见 `docs/BOOTSTRAP.md`）；
3. **验证闭环**：`node scripts/verify.mjs`（守卫 + 五件套，CI 用同一条命令）与 `harness-tool doctor`（工程层就绪自检）双双确认。

## 生成的仓库长这样

```text
my-app/
├── AGENTS.md                       # AI 入口：开工流程 + 路由地图（短，只做路由）
├── ARCHITECTURE.md                 # 系统地图：领域 / 分层 / 依赖规则 / 工程约定
├── README.md
├── scripts/
│   └── verify.mjs                  # 零成本验证回路：守卫（BOM / 文档引用）+ 五件套
├── .github/workflows/
│   └── verify.yml                  # 门禁：跑的就是 node scripts/verify.mjs
└── docs/
    ├── BOOTSTRAP.md                # 开新项目的必填 / 必装 / 必跑清单
    ├── PLANS.md                    # 计划生命周期
    ├── QUALITY_SCORE.md            # 领域与分层健康度（每轮更新）
    ├── EVALS.md                    # 轻量评测方法学（争议件的一次 A/B 裁决）
    ├── CODE_STANDARDS.md           # 代码规范（命名 / 结构 / 错误处理 / 日志）
    ├── TESTING.md                  # 测试分层与"什么算测过"
    ├── SECURITY.md                 # 密钥 / 权限档位 / 危险操作
    ├── CI_CD.md                    # 流水线与门禁
    ├── FRONTEND.md                 # 前端栈契约
    ├── MODULE_STRUCTURE.md         # 模块边界与依赖方向
    ├── DESIGN.md                   # 界面与交互约定
    ├── MEMORY.md                   # 跨会话记忆与交接
    ├── AGENT_TOOLING.md            # 各 agent 工具的薄视图 + 技能登记
    ├── RELIABILITY.md              # 稳定性与可观测
    ├── REVIEW.md                   # 评审口径
    ├── PRODUCT_SENSE.md            # 产品判断与取舍
    ├── HISTORY.md                  # 历史索引（空表起步，检索件不是必读件）
    ├── lessons/                    # 教训台账：诊断 + 候选改动 + 验证 + 棘轮（自进化的记忆）
    ├── generated/                  # 机器产物与归档（不是事实来源）
    ├── references/                 # 面向模型的外部参考（*-llms.txt 等，按需抓取）
    ├── product-specs/              # 用户可见行为规格
    ├── design-docs/                # 设计决策与理由（根信念 core-beliefs.md）
    └── exec-plans/
        ├── active/                 # 当前计划
        ├── completed/              # 做完的计划（记忆面，不要删）
        └── tech-debt-tracker.md    # 延期处理的债务
```

规范文档是**基线**：开了新项目就按实际栈把它们改写成"这个项目的规矩"（用不上的删掉、缺的补上），别原样留着当摆设。业务向的文档（比如 `docs/DATA.md`、`docs/DEPLOY.md`）等真有内容时再新增一份小的，并在 `AGENTS.md` 路由地图里挂一行 —— 不要预先生成一堆空壳。

## 能力从哪来

| | 放什么 | 怎么装 |
|---|---|---|
| `harness-template`（本仓库） | 只有规则骨架，不含能力 | — |
| `harness-lab`（评测仓库） | 候选池 `candidates/` 与已采纳能力 `adopted/`，带来源、许可与试用证据 | `harness-tool add <name>`（在项目里执行，默认从 lab 的 `adopted/` 找） |

只装当前项目真的会用到的能力，不要整目录全量复制；装完在 `ARCHITECTURE.md` 的「横切接口」里记一行。

## 设计原则

- **仓库是唯一事实来源** —— agent 在仓库里找不到的事实，视为运行上不存在。
- **短入口、深链接、渐进披露** —— AGENTS 保持短，细节按需下钻。
- **机械约束优先于口头约定** —— 能交给 lint / 脚本 / CI 的，不靠聊天重复解释。
- **规则要能被弄坏** —— 每条规则都该有个检查能证明它被违反过；没检查的规则只是口号。
- **零成本验证优先** —— 守卫 / 测试 / 链接自检能钉死的事，不要留给"下次注意"。
- **验证证据高于自信** —— 改动必须跑过验证，证据挂进 plan 或质量文档才算完成。
- **只收真实项目用过的件** —— 能力与规则由"使用中的痛点"驱动增长，不做收藏夹式集成。

## 配套工具

[`harness-tool`](https://github.com/auki-zy/harness-tool)（npm：`harness-tool`）：`init`（把本模板装进新项目，合并而不覆盖）、`upgrade`（给老项目补模板后来新增的机制文件，如 `docs/lessons/` 与 `scripts/verify.mjs`；只增不改）、`doctor`（就绪自检 + 自进化健康度）、`skills install` / `agents install` / `mcp add`（从 lab 或任意源安装能力）。
