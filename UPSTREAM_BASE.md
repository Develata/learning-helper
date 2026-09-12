# Upstream compatibility baseline

| 字段 | 固定值 |
|---|---|
| Upstream | deepseek-ai/deepseek-harness |
| Upstream SHA | `c291e7961a515f6d7af9304e7fd1d257929aef26` |
| Harness package version | `0.1.5-rc.2` |
| Baseline / sync reference date | `2026-09-12`，固定既有 runtime；P4 未更新或合并 upstream |
| Node | `24.18.0` |
| pnpm | `11.7.0` |
| Compatible plugin SHA | `7d44fa3a9228720432cb2997208178adcda03a1d`（已推送 origin/main） |

本地 remotes：origin 指向 Develata/learning-helper，upstream 指向 deepseek-ai/deepseek-harness。此基线不是对 latest 的兼容承诺。

验证：插件最终 clean commit 的 prebuilt tgz 安装、config dump、client discovery、authenticated Harness Web、七工具与 P1–P3 双库重启恢复通过。真实 Chromium 完成创建/上传/答题/反馈、Weak/v2/Why changed、响应丢失重试与刷新恢复；1440/1024/390 和 light/dark 已自审，1024 使用原生全屏。插件 typecheck/build、94 tests、三种 demo、pack、无 sibling checkout 验证通过；真实 LLM smoke 未运行（无模型凭证）。具体证据与限制由 [插件控制面](LEARNING_HELPER.md) 拥有。
