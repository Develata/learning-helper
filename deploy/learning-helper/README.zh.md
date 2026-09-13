# Learning Helper 本机部署

[English](README.md) | 中文

这是发行层；学习业务与产品 authority 在 [插件 docs](https://github.com/Develata/dsh-learning-helper/tree/main/docs)。需要 Docker Engine 28+ / Docker Desktop、Compose、约 8 GiB 可用构建内存。目标平台 linux/amd64，实际验收状态见插件 CURRENT。

发布镜像见同版本 [GitHub Release](https://github.com/Develata/learning-helper/releases/tag/v0.2.2)。附带的 Compose 固定实测镜像 digest，无需本地 Node/pnpm 或源码构建：

```bash
mkdir learning-helper-deploy
cd learning-helper-deploy
curl -fL https://github.com/Develata/learning-helper/releases/download/v0.2.2/compose.yml -o compose.yml
docker compose pull
docker compose up -d
docker compose exec learning-helper node /opt/learning-helper/open.mjs
```

也可直接执行 `docker pull ghcr.io/develata/learning-helper:0.2.2`。首次 GHCR 包默认私有：包管理员需改为 Public 才可匿名拉取，否则使用已登录凭据。详见 [发布操作](https://github.com/Develata/dsh-learning-helper/blob/main/docs/operations/release.md)。

最后一条输出 Harness 官方临时登录 URL，打开后换取 HttpOnly cookie。不要截图、分享或持久保存 token；容器日志将它隐去。首次进入在 Harness 模型设置配置 provider。无凭证时仍可初始化 Workspace 学习项目、上传资料和查看状态，但 Agent 不生成新学习内容。

默认浏览器地址为 **[127.0.0.1:3010](http://127.0.0.1:3010)**。需要其他空闲宿主端口时，在本目录已忽略的 `.env` 文件设置 `LEARNING_HELPER_PORT`，或创建容器时传入：

```bash
LEARNING_HELPER_PORT=3011 docker compose up -d
docker compose exec learning-helper node /opt/learning-helper/open.mjs
```

Compose 用同一个配置生成 loopback 端口映射和容器环境变量。`open.mjs` 读取运行中容器的配置，只替换官方登录 URL 的端口，保留 token，无需 Docker socket。端口必须是 1–65535 的十进制整数，不支持自动分配端口 0。请通过此配置调整端口，不要独立手改 `ports`；自定义 Compose override 或 `docker run` 时也必须使映射与 `LEARNING_HELPER_PORT` 一致。镜像升级先 `pull` 再 `up -d`，端口变更通过 `up -d` 生效；单独 `restart` 不会更换镜像或映射。已有 volume 保留；切换 origin 后可能需要重新登录或从会话列表打开学习会话，浏览器书签不会跨 origin 迁移。

## 构建与运行

需要源码构建时，克隆同版本 tag，使用原有带 build 的 compose.yml：

```bash
git clone --branch v0.2.2 https://github.com/Develata/learning-helper.git
cd learning-helper/deploy/learning-helper
docker compose up --build -d
```


[versions.lock.json](versions.lock.json) 是构建输入 authority：Node/pnpm、两仓 SHA、upstream baseline、基础镜像 digest。`harnessForkSha` 指获取 Harness 源码的已发布输入提交，不是包含这个 JSON 的元数据提交，避免自引用 SHA；发行 HEAD 由 Git 追踪。插件 SHA 固定到已经推送的源码提交；[UPSTREAM_BASE](../../UPSTREAM_BASE.md) 分别记录插件包验证与 Docker 镜像验收范围。

Docker build 获取 exact SHA，使用 frozen lockfile；构建 Harness 后以其 upstream runtime closure 为基础，按公开 package.json 补齐插件与 Web 所需的 required workspace peers，再用 pnpm deploy 导出生产依赖。构建阶段的 manifest overlay 不改 Harness 实现；只补入 workspace importer 的相对 link 记录，不重新解析外部 semver，并断言全部外部包版本/integrity 与原 lockfile 完全一致。只在 build stage 为同一个已审核的 subprocess-local postinstall 补充绝对路径许可。插件独立 build/pack 后通过正式 `dsh plugin` 安装，peer 复用固定 Harness runtime。runtime 不 install/clone/update，不带 Git history、构建缓存或测试源码。

预构建 profile 在 image 内，插件所需 peer 显式链接到固定 runtime。Harness vendored schemastery 为 3.18.2，而插件锁定 3.18.1；后者连同其小型依赖集合从插件 frozen install 复制，不替换 Harness 版本，也不放宽 peer 声明。运行集合没有顶层 React 时，同样从插件锁定安装复制 React 18.3.1 及其依赖；浏览器仍使用 Harness 共享的 React。首次启动原子复制到 `/data/profiles/learning-helper-<插件SHA前12位>`，由 Harness 自己维护模块链接。相同版本重启复用，不安装依赖；新版本使用独立 profile，Harness 设置仍使用 DSH_HOME，v0.2 学习数据库位于各自 Workspace，旧 profile 保留。不要在交付 profile 安装/改写包；自定义组合使用源码开发流程。

## 网络与状态

Harness 只监听容器内 127.0.0.1:3000。TCP bridge 监听容器 3001；Compose 默认发布 **127.0.0.1:3010 → 3001**。桥接不改写 Host/Origin/cookie/WebSocket，Harness 仍检查信任与认证。没有 trust-all、auth bypass 或写死 token。参考 [Docker localhost port publishing](https://docs.docker.com/engine/network/port-publishing/)；低于 28 的旧 Docker 不在此部署支持范围内。

`learning-data` volume 挂载 DSH_HOME=/data，保存学习 DB、Evidence DB、会话、设置与运行时凭证；uid/gid 1000 的 node 用户拥有新 volume。已有 bind mount 由操作者准备权限，程序不递归 chown 用户目录。不要将 .env 或 key COPY/ARG 进入镜像。

healthcheck 用本进程官方 launch token 换取 cookie，再请求受保护的 `/learning-helper/v1/health`，总限时 7 秒，输出不含 token。bridge 限定连接数、连接等待和空闲时间；停止时转发信号并有界等待。Docker 日志最多 3×10 MiB。

```bash
docker compose ps
docker compose logs --tail 100
docker compose restart
docker compose stop
```

stop/restart 保留 volume；不要用 `down --volumes` 处理日常数据。独立演示重置见 [DEMO](https://github.com/Develata/dsh-learning-helper/blob/main/docs/DEMO.md)。

## 最终验收

```bash
node --test scripts/bridge.test.mjs scripts/open.test.mjs
node scripts/acceptance.mjs /absolute/path/to/dsh-learning-helper
```

验收执行 build --no-cache，使用唯一 project/new volume，挂载仅测试用 observer（正常 image/profile 没有）；真实 Chromium 创建/上传/练习/Weak/v2/刷新，容器重启后核对学习和 Source。结束只移除本次 fixture project/volume。浏览器复用固定 Harness checkout 的 Playwright；sanitized 回执在插件 artifacts/docker-result.json。排障可设置 `LH_DOCKER_USE_CACHE=1` 复用构建层，回执会明确记录；最终验收不设置该变量，必须 no-cache。

端口占用时选择其他 `LEARNING_HELPER_PORT`；volume profile 路径冲突时明确退出，不覆盖用户文件。远程公网、额外 auth、多用户不属于 v0.2。

## v0.2 Workspace 持久化与升级

一个 Harness Workspace 对应一个 Learning Project。选择 `/data/workspace` 下的目录（如 `/data/workspace/analysis`）；其 learning-assets 与 .learning-helper（state.db/evidence.db/PDF archive）一起落入持久化 volume。容器其他位置的目录可能随重建丢失；需要时显式挂载持久化目录。每个 Workspace 一个 Host，只支持本地磁盘，不支持网络共享文件系统。

升级不会自动读取或覆盖 v0.1 全局课程。先停止旧 Host 并备份完整 volume，再从离线副本按 [迁移说明](https://github.com/Develata/dsh-learning-helper/blob/main/docs/operations/migration-v1.md) 显式逐 Course 迁移到独立 Workspace，验证后切换正常部署。保留原卷与 v0.1 镜像；回退使用未修改的旧卷，不能让 v0.1 打开 v0.2 数据库。启动脚本不进行破坏性迁移。

PDF.js 本地解析无需外部服务；视觉模式要求当前 Harness model 声明 image，失败保留已有资料。MinerU 是可选官方自托管 protocol 2 API，不加入主镜像。Workspace UI 只配置可信 base URL；若服务要求 token，以私有运行时 Compose override 注入 LEARNING_HELPER_MINERU_TOKEN，禁止 build ARG/COPY 或提交 .env。未配置 MinerU 时本地 PDF 仍可使用。

构建网络可选项：GitHub/npm 下载需要代理时，设置 LEARNING_HELPER_BUILD_PROXY 为构建容器可达的可信代理地址（Docker Desktop 通常用 host.docker.internal）。仅通过 Docker 预定义 HTTP_PROXY/HTTPS_PROXY build args 传入，不写入 image ENV，也不改变运行时网络。不要在已提交 Compose/.env 写凭证。源码拉取使用 HTTP/1.1、限时10分钟；失败停止构建，不改成 mutable 版本。
