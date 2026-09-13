# Learning Helper local deployment

English | [中文](README.zh.md)

This directory owns distribution. Learning behavior and product authority live in the [plugin docs](https://github.com/Develata/dsh-learning-helper/tree/main/docs). Requirements: Docker Engine 28+ / Docker Desktop, Compose, and about 8 GiB of available build memory. The target is linux/amd64; the plugin CURRENT records actual acceptance results.

```bash
git clone https://github.com/Develata/learning-helper.git
cd learning-helper/deploy/learning-helper
docker compose up --build -d
docker compose exec learning-helper node /opt/learning-helper/open.mjs
```

The last command prints the official temporary Harness login URL. Opening it exchanges the token for an HttpOnly cookie. Do not capture, share, or persist the token; container logs redact it. Configure a provider in Harness model settings. Without credentials, course creation, uploads, and state views work, but the Agent cannot generate learning content.

The default browser address is **[127.0.0.1:3010](http://127.0.0.1:3010)**. To use another available host port, set `LEARNING_HELPER_PORT` in this directory's ignored `.env` file, or pass it when creating the container:

```bash
LEARNING_HELPER_PORT=3011 docker compose up --build -d
docker compose exec learning-helper node /opt/learning-helper/open.mjs
```

Compose uses this one setting for both its loopback port mapping and the container environment. `open.mjs` reads the running container's setting and changes only the port in the official login URL; it preserves the token and needs no Docker socket. Use a decimal port from 1 to 65535; automatic port 0 is unsupported. Configure ports through this setting, rather than editing `ports` independently. With a custom Compose override or `docker run`, keep the mapping and `LEARNING_HELPER_PORT` identical. Apply script or port changes with `up --build -d`; `restart` alone does not replace the image or mapping. Existing volumes remain, but browser cookies and task bookmarks may require login or reopening sessions after changing the origin.

## Build and runtime

[versions.lock.json](versions.lock.json) owns build inputs: Node/pnpm, both repository SHAs, the upstream baseline, and base-image digests. `harnessForkSha` identifies the published Harness source input, not the metadata commit containing this JSON; Git tracks the release HEAD without a self-referential hash. The plugin SHA pins a pushed acceptance commit.

Docker build fetches exact SHAs and uses frozen lockfiles. After building Harness, it starts from the upstream runtime closure, includes required workspace peers declared by public package.json files for the plugin and Web, and exports production dependencies with pnpm deploy. The build-only manifest overlay changes no Harness implementation. It adds only relative workspace importer links, never re-resolves external semver ranges, and asserts that all external versions/integrities remain identical to the original lockfile. Only the same reviewed subprocess-local postinstall receives an additional absolute-path permission in the build stage. The independently built and packed plugin is installed through official `dsh plugin`; peers reuse the pinned Harness runtime. Runtime performs no install/clone/update and contains no Git history, build cache, or test sources.

The prebuilt profile carries explicit peer links into the fixed runtime. Harness vendors schemastery 3.18.2 while the plugin pins 3.18.1; the latter and its small dependency closure are copied from the plugin's frozen install, without replacing the Harness version or broadening peer declarations. When the runtime closure has no top-level React, React 18.3.1 and its dependencies are likewise copied from the plugin frozen install; the browser still uses Harness shared React. First startup atomically copies the profile to `/data/profiles/learning-helper-<first12PluginSHA>`; Harness maintains its own module links. Restarts reuse the same version without installing dependencies. New versions use separate profiles while learning databases/settings share DSH_HOME; old profiles remain. Do not install or modify packages inside the delivered profile; use source development for custom compositions.

## Network and state

Harness listens only on container 127.0.0.1:3000. A TCP bridge listens on container port 3001; Compose defaults to **127.0.0.1:3010 → 3001**. The bridge preserves Host/Origin/cookie/WebSocket bytes, and Harness still validates trust and authentication. There is no trust-all, authentication bypass, or hard-coded token. See [Docker localhost port publishing](https://docs.docker.com/engine/network/port-publishing/); Docker versions below 28 are unsupported.

The `learning-data` volume mounts DSH_HOME=/data and preserves learning and evidence databases, sessions, settings, and runtime credentials. The node user, uid/gid 1000, owns a new volume. Operators prepare permissions for existing bind mounts; startup never recursively chowns user directories. Do not COPY or ARG .env files or keys into the image.

The healthcheck exchanges this process's official launch token for a cookie, then calls protected `/learning-helper/v1/health`, with a seven-second total limit and no token output. The bridge bounds connections, connection waits, and idle time. Shutdown forwards signals and waits within a deadline. Docker logs are limited to 3×10 MiB.

```bash
docker compose ps
docker compose logs --tail 100
docker compose restart
docker compose stop
```

Stop/restart preserve the volume. Do not use `down --volumes` for everyday data. See [DEMO](https://github.com/Develata/dsh-learning-helper/blob/main/docs/DEMO.md) for an isolated demonstration reset.

## Final acceptance

```bash
node --test scripts/bridge.test.mjs scripts/open.test.mjs
node scripts/acceptance.mjs /absolute/path/to/dsh-learning-helper
```

Acceptance runs build --no-cache with a unique project/new volume and a test-only mounted observer, absent from the normal image/profile. Real Chromium exercises creation/upload/practice/Weak/v2/refresh, then verifies learning state and sources after a container restart. Cleanup removes only this invocation's fixture project/volume. The browser uses the pinned Harness checkout's Playwright; the sanitized receipt is plugin artifacts/docker-result.json. Diagnosis may set `LH_DOCKER_USE_CACHE=1` to reuse build layers, explicitly recorded in the receipt; final acceptance leaves it unset and requires no-cache.

Choose another `LEARNING_HELPER_PORT` if the port is occupied. A conflicting volume profile path causes a clear exit without overwriting user files. Public remote hosting, additional authentication, and multiple users are outside v0.1.
