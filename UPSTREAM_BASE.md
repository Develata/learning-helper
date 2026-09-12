# Upstream compatibility baseline

| 字段 | 固定值 |
|---|---|
| Upstream | deepseek-ai/deepseek-harness |
| Upstream SHA | `c291e7961a515f6d7af9304e7fd1d257929aef26` |
| Harness package version | `0.1.5-rc.2` |
| Baseline / sync reference date | `2026-09-12`；P5 未更新或合并 upstream |
| Node / pnpm | `24.18.0` / `11.7.0` |
| Compatible plugin SHA | `958cf67627736232d06a9eeee70cdcb2c0369248`（已确认 origin/main） |
| Docker Harness source input | `e56ee57feb140241be6ce9ac9559e83854f7e6ac`；已发布、runtime 与 upstream 相同 |

本地 origin 指向 Develata/learning-helper，upstream 指向 deepseek-ai/deepseek-harness。不承诺 latest。Docker 的 [versions.lock.json](deploy/learning-helper/versions.lock.json) 保存源码 SHA 与 base-image digest；harnessForkSha 是构建输入，最终发行 metadata HEAD 由 Git 记录，避免自引用。

插件验证：100 tests（92 backend/script + 8 client）、typecheck/build、三个 demo、pack、无 sibling install/peers/typecheck/tests/build/pack 通过。最终 clean plugin commit 的 packed Harness/Chromium 完成课程创建、TXT/MD 导入、原生卡片、交互练习、丢失响应重试、Weak/v2/Why changed 与刷新；两个 Host 进程复验双库持久化。

真实 Harness Agent：newapi / gpt-5.6-luna，2026-09-12。QA、资料不足、注入、grounded outline/三天计划/五题发布通过实际轨迹、引用与逐项数学检查。浏览器故障恢复另用确定性 fixture 验证，不冒充同一条自主录像。具体范围由 [插件控制面](LEARNING_HELPER.md) 拥有。

最终 Docker 验收（2026-09-12）：上述 plugin SHA，`build --no-cache`、新 volume 冷启动、真实 Chromium、未认证/错误 Origin 拒绝、容器重启后 dashboard/source/feedback 保留，全部 PASS。Docker Engine 29.7.2 / Compose v5.5.0，linux/amd64。镜像 manifest list digest：`sha256:dc5376f7d833f5507335934c4a019c5675fb8cb70cb3765e28f10a1759cb7e98`。本次隔离测试项目/volume 已清理，仅保留本机回执；镜像未推送 registry，Compose 从固定源码构建。

发布顺序：插件先 push 并确认 origin/main，再固定此部署版本并验收，最后提交/推送 fork。最终 fork HEAD 由 Git/远端分支记录。插件和 Harness runtime 的完整边界、已知传递依赖 advisory 与语义验收范围见插件 final-delivery 文档。
