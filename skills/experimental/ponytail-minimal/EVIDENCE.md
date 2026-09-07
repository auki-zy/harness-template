# EVIDENCE：ponytail-minimal（experimental 试点）

状态：Tier0（候选）。本技能用于跑通"experimental + 固定任务基准 + 对照结论"的验证闭环。

## L0 静态自检（无需运行）

- [x] frontmatter `description` 可判定触发（"要简单/少写点/yagni/别过度设计"）
- [x] 步骤 = 动词 + 产物；含"验证"小节，验证可运行
- [x] 无工具绑定（工具中立表述）；来源标注（ponytail 哲学，MIT）
- [x] 与模板 `CODE_STANDARDS` 互补：技能给"操作步骤"，无规则重复
- [x] 体量小（约 40 行）

## L1/L2 受控验证

- 固定任务：`benchmarks/tasks/email-validator`（12 个用例断言正确性 + 实现行数对比）
- 运行：`node skills/experimental/ponytail-minimal/benchmarks/run.mjs`（零依赖）
- 结果（`benchmarks/results/2026-09-07-human-dryrun.md`）：
  - 正确性：12/12 通过（基线=技能版，均符合期望）
  - 代码量：基线 31 行 vs 技能版 2 行（减 29 行）
  - 结论：本任务 ✅ 有效（更少且正确）
- 执行者：human-dryrun（由人类按技能步骤产出技能版实现）
- **待补充**：真实模型 A/B（同任务，无技能 vs 加载技能，记录行数与通过率）

## 卡点与备注

- Windows 下 run.mjs 动态 import 需 `pathToFileURL`（ERR_UNSUPPORTED_ESM_URL_SCHEME）——已修。
- 技能版用单行正则：更短但可读性略降——"最少"不应牺牲可读，已在 SKILL.md"验证"里提醒"多写 30% 说明理由"。
- 单项任务不足以证明普适，需扩展任务集（debounce / CSV sum / rate limiter 等）与多模型对照后再评估"是否提升内置"。
