# Upstream compatibility baseline

| 字段 | 固定值 |
|---|---|
| Upstream | deepseek-ai/deepseek-harness |
| Upstream SHA | `c291e7961a515f6d7af9304e7fd1d257929aef26` |
| Harness package version | `0.1.5-rc.2` |
| Baseline / sync reference date | `2026-09-12`，核实已有 checkout 与 upstream/master；本轮未执行 upstream 合并 |
| Node | `24.18.0` |
| pnpm | `11.7.0` |
| Compatible plugin SHA | `fa7fb8f9ad03351c9533a737c41cb4dac2aa115a`（本地） |

本地 remotes：origin 指向 Develata/learning-helper，upstream 指向 deepseek-ai/deepseek-harness。此基线不是对 latest 的兼容承诺。

验证：本基线 install/build 通过；storage-domain 与 storage-sqlite 两个测试文件共 49 项通过；插件的 prebuilt tarball install、config dump、Web Host 提交与重启恢复通过。完整执行入口与能力缺口由 [插件控制面](LEARNING_HELPER.md) 拥有。
