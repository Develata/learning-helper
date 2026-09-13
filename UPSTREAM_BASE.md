# Upstream compatibility baseline

| 字段 | 固定值 |
|---|---|
| Upstream | deepseek-ai/deepseek-harness |
| Upstream SHA | `c291e7961a515f6d7af9304e7fd1d257929aef26` |
| Harness package version | `0.1.5-rc.2` |
| Baseline / sync reference date | `2026-09-12`；本轮未更新upstream |
| Node / pnpm | `24.18.0` / `11.7.0` |
| Compatible plugin SHA | `5e8f2f2bbceccea23bfdb9987046e3cea4f410fd`（插件main / annotated v0.2.2） |
| Docker Harness source input | `e56ee57feb140241be6ce9ac9559e83854f7e6ac`；已发布、runtime与upstream相同 |

origin是Develata/learning-helper，upstream是deepseek-ai/deepseek-harness。正式分支为main，旧master与开发分支保留。部署的 [versions.lock.json](deploy/learning-helper/versions.lock.json) 固定源码SHA与两个base-image digest。harnessForkSha是实际构建输入；包含此lock的metadata HEAD由Git记录，不建立自引用。

本版提供mineru.net云端API、Workspace凭据管理、Web设置与旧视觉警告修复。插件typecheck、165 tests、build/pack、standalone与真实packed Harness/Chromium/重启已验；用户真实24页PDF转换为471个active chunks，原件checksum、canonical文件、页码与Host检索读取已核对。未逐页审阅公式，未重新进行Harness视觉模型验收。详细范围由插件 [CURRENT](https://github.com/Develata/dsh-learning-helper/blob/5e8f2f2bbceccea23bfdb9987046e3cea4f410fd/docs/CURRENT.md) 拥有。

两仓annotated v0.2.2分别发布插件与Docker镜像。[镜像CI](https://github.com/Develata/learning-helper/actions/workflows/learning-helper-release.yml)对同一构建进行冷启动、完整Chromium、Host/Origin认证和重启验收，再原样发布GHCR。[Release](https://github.com/Develata/learning-helper/releases/tag/v0.2.2)附件拥有最终image digest、Compose、versions.lock.json、docker-result.json与校验和；tag推送本身不等于CI成功。

插件production audit0；固定Harness runtime既有24 advisory（11 high / 12 moderate / 1 low）分类见插件 [COMPATIBILITY](https://github.com/Develata/dsh-learning-helper/blob/5e8f2f2bbceccea23bfdb9987046e3cea4f410fd/COMPATIBILITY.md)。不擅自升级固定生态，不声称全部不可达。仅支持本机单用户loopback部署，日常容器不会因发布自动升级。
