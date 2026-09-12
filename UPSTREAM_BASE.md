# Upstream compatibility baseline

| 字段 | 固定值 |
|---|---|
| Upstream | deepseek-ai/deepseek-harness |
| Upstream SHA | `c291e7961a515f6d7af9304e7fd1d257929aef26` |
| Harness package version | `0.1.5-rc.2` |
| Baseline / sync reference date | `2026-09-12`，固定既有 runtime；P2 未更新或合并 upstream |
| Node | `24.18.0` |
| pnpm | `11.7.0` |
| Compatible plugin SHA | `ea48e81f1b44c90ed5999fd0bb4ec78edc7e5713`（已推送 origin/main） |

本地 remotes：origin 指向 Develata/learning-helper，upstream 指向 deepseek-ai/deepseek-harness。此基线不是对 latest 的兼容承诺。

验证：插件最终 clean commit 的 prebuilt tgz 安装、config dump、authenticated Web、standard preset Agent-scoped course_list/search/read、grounding assembly、Course/import/dedupe、双 DB 进程重启与 P1 学习闭环通过。插件 typecheck/build、69 tests、两种 demo、pack、无 sibling checkout 验证通过；真实 LLM smoke 未运行（无模型凭证）。本 runtime 基线的此前 install/build 与 storage 49 tests 证据不变，本次没有 runtime 修改。能力详情由 [插件控制面](LEARNING_HELPER.md) 拥有。
