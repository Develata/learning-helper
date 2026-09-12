# Learning Helper 运行壳

本仓库是 DeepSeek Harness 的薄 fork，负责运行壳、upstream pin 与后续发行配置。学习业务、产品范围与 Agent 开工文档统一在 [dsh-learning-helper](https://github.com/Develata/dsh-learning-helper)；本地对应 `../dsh-learning-helper`。

已验证的第一轮插件实现支持确定性学习反馈与计划修订。运行与验收方法见插件的 [Harness integration](https://github.com/Develata/dsh-learning-helper/blob/fa7fb8f9ad03351c9533a737c41cb4dac2aa115a/docs/operations/harness-integration.md)，能力状态见 [CURRENT](https://github.com/Develata/dsh-learning-helper/blob/fa7fb8f9ad03351c9533a737c41cb4dac2aa115a/docs/CURRENT.md)。这些提交目前仅在本地，需经用户批准 push 后远端链接才可用。

版本基线由 [UPSTREAM_BASE](UPSTREAM_BASE.md) 拥有，core patch 清单由 [UPSTREAM_PATCHES](UPSTREAM_PATCHES.md) 拥有。默认 Learning Helper profile、Docker 与完整 MVP 发行尚未实现；本仓 upstream Web 构建/启动已在插件 smoke 中验证。
