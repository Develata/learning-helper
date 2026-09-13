# Learning Helper 运行壳

本仓库是 DeepSeek Harness 薄 fork，拥有固定 runtime、profile 与本机 Docker 发行。学习产品、业务与 Agent control plane 统一由 [独立插件](https://github.com/Develata/dsh-learning-helper/tree/a0fa0c6a851cb106ac00b02b3381b5c126110837) 拥有。

v0.2 在 `feat/workspace-v02` 演进，尚未打 tag；默认分支和 v0.1.0 保留已发布版本。一个 Workspace 对应一个学习项目：资料、PDF原件、canonical assets、双库状态与历史引用都位于 Workspace。原有错题 → Weak → ReviewQueue → PlanRevision 闭环和原生学生界面保留。

从 [部署说明](deploy/learning-helper/README.zh.md) 开始，默认宿主 `127.0.0.1:3010`。模型凭证只通过运行时官方设置提供。PDF.js本地可用；自动/高精度视觉需要模型公开声明image能力，MinerU是可选外部官方protocol2服务。两者实际验证边界见 [CURRENT](https://github.com/Develata/dsh-learning-helper/blob/a0fa0c6a851cb106ac00b02b3381b5c126110837/docs/CURRENT.md)。

旧全局课程不会自动迁移。备份并停写后按 [migration](https://github.com/Develata/dsh-learning-helper/blob/a0fa0c6a851cb106ac00b02b3381b5c126110837/docs/operations/migration-v1.md) 显式迁入 Workspace；不要让新版覆盖v0.1数据。保留旧镜像、旧卷与v0.1.0标签用于回退。

精确版本及部署回执由 [UPSTREAM_BASE](UPSTREAM_BASE.md) 拥有；runtime改动清单见 [UPSTREAM_PATCHES](UPSTREAM_PATCHES.md)。产品证明见 [验收矩阵](https://github.com/Develata/dsh-learning-helper/blob/a0fa0c6a851cb106ac00b02b3381b5c126110837/docs/acceptance/matrix.md)，演示见 [DEMO](https://github.com/Develata/dsh-learning-helper/blob/a0fa0c6a851cb106ac00b02b3381b5c126110837/docs/DEMO.md)。
