# BOOTSTRAP.md

这份文件定义用本模板开新项目时的必填 / 必装 / 必跑清单，避免每次 bootstrap 都依赖主人逐条口述。

模板只放规则骨架，**机械配置与产品代码落在新项目里**，按本清单装配。

## 1. 建仓

- `npx harness-tool init <项目>`（推荐，合并而不覆盖），或把本模板当 GitHub Template 建仓。
- 结果应该包含：`AGENTS.md`、`ARCHITECTURE.md`、`README.md`、`scripts/verify.mjs`、`.github/workflows/verify.yml`、`docs/`（BOOTSTRAP / PLANS / QUALITY_SCORE / EVALS / 12 份工程规范基线 / references / product-specs / design-docs / lessons / generated / HISTORY.md / exec-plans）。
- `git init` 后第一次提交前，先做完第 2、3 步。

## 2. 必填文档（开写代码之前完成）

- [ ] `ARCHITECTURE.md`：填系统形态（产品 / 主流程 / 运行面）、领域地图，并按实际栈改写「工程约定」一节
- [ ] `docs/QUALITY_SCORE.md`：填产品领域与架构层两栏（未填写的项 agent 不得自行假设等级）
- [ ] **工程规范基线按实际栈改写**：`CODE_STANDARDS` / `TESTING` / `FRONTEND` / `MODULE_STRUCTURE` / `SECURITY` / `CI_CD` / `DESIGN` / `REVIEW` / `RELIABILITY` / `MEMORY` / `AGENT_TOOLING` / `PRODUCT_SENSE`——用不上的删掉、缺的补上，别原样留着当摆设（它们给的是基线，不是每项都适用）
- [ ] `docs/product-specs/`：写第一份用户可见行为规格（索引里挂一行）
- [ ] `docs/exec-plans/active/`：建第一份执行计划（格式见 `docs/PLANS.md`）
- [ ] `docs/design-docs/`：把"为什么这么选"的第一个决策写下来（可选，但一旦有争议就补）

## 3. 必装机械配置（含"为什么"）

| 配置 | 为什么 | 备注 |
|------|--------|------|
| `package.json` scripts：`dev / build / typecheck / lint / test` | `AGENTS.md` 完成定义引用的验证命令必须有落点 | 命令名保持这套，别发明新名 |
| `tsconfig` 开 `strict` | 类型即契约 | 非 TS 项目换成对应的静态检查 |
| ESLint（+ 格式化工具） | 风格机械执行，不靠口头约定 | 需要时再加分层依赖检查 |
| 测试框架（Vitest / pytest / …） | 行为证据 | 测试文件命名先定一种，禁混用 |
| 样式方案 | 落地方式定一次 | 只选一个；设计 token 集中在一个文件 |

## 4. 必跑验证（声明"完成"之前）

```text
node scripts/verify.mjs                 # 守卫（BOM / 文档引用）+ 五件套，一条命令
typecheck && lint && test && build      # 全绿才可宣布完成
```

- 对应 `AGENTS.md` 的完成定义；任一失败先修 baseline，再加新范围。
- 机械项目把它接进 CI：模板已带 `.github/workflows/verify.yml`，跑的就是同一个脚本（见 `docs/CI_CD.md`）。

## 5. 自进化机制（模板已带，确认它在位）

模板不只是"规则文档"，它带了一套**零成本的自进化闭环**。开新项目后确认它在位、并知道怎么用：

| 件 | 在哪 | 干什么 |
|----|------|--------|
| 记忆 | `docs/lessons/` | 踩过的坑 → 症状 / 证据 / 诊断 / 候选改动 / 验证 / 棘轮 |
| 准入 | `AGENTS.md`「工作约定」 | 没验证过的规则不许写成规则；改规则必须配一个检查 |
| 棘轮 | `scripts/verify.mjs` + `.github/workflows/verify.yml` | 把验证过的规则变成机械检查，回归即变红 |
| 裁决 | `docs/EVALS.md` | 零成本验证裁不了的争议，跑一次 A/B |

闭环：**观测 → 诊断 → 候选改动 → 验证 → 固化（棘轮）→ 定期回归**。

- 老项目（模板新增机制之前建的）用 `harness-tool upgrade` 补齐这些文件：只新增、绝不覆盖；加 `--diff` 会打印**模板新增了哪几行 / 你独有哪几行**，规则类文件（`AGENTS.md`、`docs/*.md`）照抄那几行即完成合并。工具的规矩是"分不清哪句是你写的就绝不替你改"。
- 大部分改动走零成本验证（守卫 / 测试 / 引用自检）；只有行为类争议才值一次真评测。
- "已验证有效"的判据是**检查变绿**：先弄坏它 → 变红 → 修好 → 变绿，这才算数（"我说我做了"不算）。
- 只加规则不加检查 = 提示词膨胀。宁可少一条规则，也不要一条没人验证的口号。

## 6. 能力（技能 / 子代理 / MCP，按需）

- 本模板**不带**能力内容。需要什么就按名字装：

  ```bash
  harness-tool add <name>                 # 默认从评测仓库 harness-lab 的 adopted/ 找
  harness-tool add <name> --from <源>      # 指定别的源（本地路径 / owner/repo）
  ```

- 类型自动识别（技能 / 子代理 / MCP）；`harness-tool mcp add` 也可直接写命令行配置。MCP 默认关、按需开，密钥只写 `${ENV_VAR}`。
- 来源与试用证据都在 `harness-lab`；装完在 `ARCHITECTURE.md`「横切接口」记一行。
- 只装本项目实际会用到的，不要整目录全量复制。

## 7. 收尾检查

- 一个新 agent（无聊天上下文）能否只靠仓库：读 AGENTS → ARCHITECTURE → 找到 active plan → 跑通验证？
- `node scripts/verify.mjs` 是否全绿（守卫 + 五件套，一条命令）？
- `harness-tool doctor` 是否全绿（关键文件齐全、无模板占位残留、五件套脚本到位、自进化机制在位）？
- 本次踩的坑记进 `docs/lessons/` 了吗？改过的规则有没有配套检查？
- 若不能，补文档或清单，而不是继续口头交代。
