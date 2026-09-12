# Upstream patches

当前 Harness core patches：**0**。`packages/` 与 `apps/` 相对 [固定基线](UPSTREAM_BASE.md) 没有变更。

P2 仅更新运行壳说明和跨仓基线/patch 元数据；`.codegraph/` 在本地 `.git/info/exclude` 忽略，未修改 upstream `.gitignore`，没有 submodule。

未来 core patch 必须先证明 bundle、profile patch、Host plugin、dsh.client 与 UI slot 均不足，再在此记录修改位置、理由、upstream SHA 与维护方式。学习架构与产品决定由 [插件文档](LEARNING_HELPER.md) 单独维护。
