# Learning Helper 运行壳

本仓库是 DeepSeek Harness 的薄 fork，负责运行壳、upstream pin 与后续发行配置。学习业务、产品范围与 Agent 开工文档统一在 [dsh-learning-helper](https://github.com/Develata/dsh-learning-helper)；本地对应 `../dsh-learning-helper`。

已验证并发布的插件支持课程资料驱动的学习闭环，并提供 Harness 原生 Learning 面板：课程创建/选择、TXT/Markdown 上传、交互练习与反馈、进度、学习计划，以及错题导致的计划调整解释。生成快捷动作经聊天交给 Agent；学生提交由确定性代码评分。普通 Quiz 界面与工具卡片在提交前不展示答案，原始 session/debug/export 不作为考试防作弊边界。运行方法见固定版本的 [Harness integration](https://github.com/Develata/dsh-learning-helper/blob/7d44fa3a9228720432cb2997208178adcda03a1d/docs/operations/harness-integration.md)，能力、浏览器证据与真实 LLM 验收缺口见 [CURRENT](https://github.com/Develata/dsh-learning-helper/blob/7d44fa3a9228720432cb2997208178adcda03a1d/docs/CURRENT.md)。

版本基线由 [UPSTREAM_BASE](UPSTREAM_BASE.md) 拥有，core patch 清单由 [UPSTREAM_PATCHES](UPSTREAM_PATCHES.md) 拥有。默认 Learning Helper profile、Docker 与完整 MVP 发行尚未实现；本仓 upstream Web 构建/启动已在插件 smoke 中验证。
