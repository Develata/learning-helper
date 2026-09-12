# Upstream patches

当前 Harness runtime patches：**0**。`packages/` 与 `apps/` 相对 [固定基线](UPSTREAM_BASE.md) 没有变更。

P5 仅增加 `deploy/learning-helper/` 的固定版本 Docker/profile、保留 HTTP 字节与认证语义的 TCP bridge、health/冷启动验收和部署文档，并更新三份根发行说明。Docker build 使用公开 package manifest 的 workspace peer closure；构建阶段的配置组合不修改 Harness implementation。

`.codegraph/` 仍由本地 `.git/info/exclude` 忽略；没有修改 upstream `.gitignore`，没有 submodule。学习逻辑、UI 与 grounding 全在独立插件。

未来 core patch 必须先证明 bundle、profile patch、Host plugin、dsh.client 与 UI slot 均不足，再记录位置、理由、upstream SHA 与维护方式。v0.1 当前不需要任何 core patch。
