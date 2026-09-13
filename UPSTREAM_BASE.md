# Upstream compatibility baseline

| 字段 | 固定值 |
|---|---|
| Upstream | deepseek-ai/deepseek-harness |
| Upstream SHA | `c291e7961a515f6d7af9304e7fd1d257929aef26` |
| Harness package version | `0.1.5-rc.2` |
| Baseline / sync reference date | `2026-09-12`；v0.2未更新upstream |
| Node / pnpm | `24.18.0` / `11.7.0` |
| Compatible plugin SHA | `ff9090ca9fc284f7ca2634e3ed070ce124a2a438`（origin/feat/workspace-v02） |
| Docker Harness source input | `e56ee57feb140241be6ce9ac9559e83854f7e6ac`；已发布、runtime与upstream相同 |

origin是Develata/learning-helper，upstream是deepseek-ai/deepseek-harness。部署的 [versions.lock.json](deploy/learning-helper/versions.lock.json) 固定源码SHA与两个base-image digest。harnessForkSha是实际构建输入；包含此lock的metadata HEAD由Git记录，不建立自引用。

插件运行代码基线为`635009c2679ff8e7cb46faf63710aaa4942d55f9`，后续只增加测试、录制和文档。已保存的验证：151 tests（129 backend/script + 22 client）、typecheck/build、五个demo、pack及standalone通过；packed Harness/Chromium覆盖Workspace A/B、TXT/MD/PDF、数学显示、原生卡片、丢包重试、Weak/v2、刷新及重启。本次发布复用同一运行代码的证据，未为push重复跑全套测试。当前Harness packages/apps相对固定upstream仍0 diff。

真实Harness Agent：newapi/gpt-5.6-luna，2026-09-13。QA、资料不足、注入、PDF页码引用的工具轨迹与数学语义检查通过；outline/plan/quiz在计划文字回执修复后独立复验通过。上述验收时模型未声明image capability，未配置官方MinerU端点；本次未重跑真实模型或外部服务，fake protocol测试不等于真实服务验收。

Docker验收（2026-09-13）：runtime提交`aad1263221da277f70ca1d724aff4e83fad29be2`的build --no-cache、新volume冷启动、真实Chromium、认证/Origin检查、重启后dashboard/sources完整快照一致，全部PASS。镜像manifest list digest为`sha256:b928a43414dc76156a482bd7dfb7026032a6ea205cdbf87cbb5d76c2af34b6bc`，Docker Engine29.7.2 / Compose5.5.0 / linux-amd64；只清理了本次测试project/volume，没有替换日常v0.1部署，镜像未推送registry。

上述实测镜像与此前插件`a0fa0c6a851cb106ac00b02b3381b5c126110837`的184个运行文件等价，证据在plugin artifacts/docker-result.json、v02-runtime-equivalence.json。本次新pin包含数学显示、PDF缓存代激活/默认模式/上传deadline、plan卡片修复和新版演示；它不等价于旧镜像。本次只更新源码与构建输入，未重新构建/冷启动验收或替换日常容器，不能将旧Docker PASS继承给新pin。

依赖审查记录（2026-09-13）：插件production audit0；上述实测Docker runtime closure为24 advisory（11 high / 12 moderate / 1 low），本次未重新audit。不把旧TXT路径适用性判断套到新增PDF/image路径；风险范围见插件COMPATIBILITY，未擅自升级固定Harness生态。仅支持本机单用户loopback部署。

发布顺序：先推送插件并确认远端SHA，再固定部署版本，最后提交/推送运行壳。两仓v0.2分支为feat/workspace-v02；不改写v0.1.0、不自动打v0.2tag。
