# Upstream compatibility baseline

| 字段 | 固定值 |
|---|---|
| Upstream | deepseek-ai/deepseek-harness |
| Upstream SHA | `c291e7961a515f6d7af9304e7fd1d257929aef26` |
| Harness package version | `0.1.5-rc.2` |
| Baseline / sync reference date | `2026-09-12`；v0.2未更新upstream |
| Node / pnpm | `24.18.0` / `11.7.0` |
| Compatible plugin SHA | `b63399cae9a647667baa36b44bfb3ad9ead39f84`（origin/feat/workspace-v02） |
| Docker Harness source input | `e56ee57feb140241be6ce9ac9559e83854f7e6ac`；已发布、runtime与upstream相同 |

origin是Develata/learning-helper，upstream是deepseek-ai/deepseek-harness。部署的 [versions.lock.json](deploy/learning-helper/versions.lock.json) 固定源码SHA与两个base-image digest。harnessForkSha是实际构建输入；包含此lock的metadata HEAD由Git记录，不建立自引用。

本轮插件补丁`8c18da1`修复任务会话创建回执早于Workspace follow时误拒绝的竞态，使用公开订阅、有界等待和取消；不修改Harness。已重跑typecheck、156 tests（130 backend/script +26 client）、build、五个demo、pack、standalone和真实packed/Chromium/重启。当前Harness packages/apps相对固定upstream仍0 diff。

真实Harness Agent：newapi/gpt-5.6-luna，2026-09-13。QA、资料不足、注入、PDF页码引用的工具轨迹与数学语义检查通过；outline/plan/quiz在计划文字回执修复后独立复验通过。上述验收时模型未声明image capability，未配置官方MinerU端点；本次未重跑真实模型或外部服务，fake protocol测试不等于真实服务验收。

v0.2.1 已由两仓 tag-only CI 发布：插件 tag `b63399cae9a647667baa36b44bfb3ad9ead39f84`，运行壳 tag `6e057f5c26e1899f6e81bf291a94223b123ddec3`。本页为发布后记录；后续文档提交不是镜像构建输入。

[镜像CI](https://github.com/Develata/learning-helper/actions/runs/34778266086)构建一次后，以EXTERNAL模式验收同一镜像；冷启动、完整Chromium、Host/Origin认证与重启持久化全部PASS，再原样传至publish job。不是声称每次都no-cache。[Release](https://github.com/Develata/learning-helper/releases/tag/v0.2.1)包含固定digest的Compose、versions.lock.json、docker-result.json、image-digest.txt与SHA256SUMS，附件校验通过。

已验证空Docker凭据目录可以匿名拉取 `ghcr.io/develata/learning-helper:0.2.1`；digest为 `sha256:9a413606f9c1b15053a98372b279da9fe8d955fe3bb0c3549275eddf6a39f032`。运行壳packages/apps保持0 diff，未替换日常容器。旧v0.1/v0.2历史回执不用于替代本次CI结果。

依赖审查记录（2026-09-13）：插件production audit0；此前实际Docker runtime closure为24 advisory（11 high / 12 moderate / 1 low），本次未重新audit。不把旧TXT路径适用性判断套到新增PDF/image路径；风险范围见插件COMPATIBILITY，未擅自升级固定Harness生态。仅支持本机单用户loopback部署。

发布顺序：先推送插件并确认远端SHA，再固定部署版本，最后提交/推送运行壳。两仓v0.2分支为feat/workspace-v02；本轮已授权创建两仓annotated v0.2.1；不改写v0.1.0。
