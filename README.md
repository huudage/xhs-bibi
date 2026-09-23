# 比比 · AI 维度对比 demo

小红书站内功能提案「比比」的可运行演示。用户勾选 2–3 件同类商品后，页面按维度拉齐笔记证据并给出决策收尾。报告数据由 `demo/src/pipeline/` 的抽取与汇编规则生成，检索和 LLM 使用 mock。

本仓库部署形态是静态站点：服务器只托管 `demo/`，不启动数据库，也不暴露 PRD 与看板。

## 环境

- Node.js 18 或更高版本
- Linux 服务器，或本机 Git Bash / WSL
- 默认端口 `8765`，默认监听 `0.0.0.0`

## 脚本用法

在仓库根目录执行。

启动：

```bash
bash run.sh
```

停止（只结束 `run/bibi.pid` 里记录、且命令行包含 `scripts/static-server.js` 的进程）：

```bash
bash stop.sh
```

重启时先停再起，避免端口残留：

```bash
bash stop.sh
bash run.sh
```

换端口或只监听本机：

```bash
PORT=8766 HOST=127.0.0.1 bash run.sh
```

## 参数

| 变量 | 默认 | 作用 |
|------|------|------|
| `PORT` | `8765` | 监听端口，必须是 1–65535 的整数 |
| `HOST` | `0.0.0.0` | 监听地址。`0.0.0.0` 表示本机所有网卡，便于服务器对外访问 |

## 访问与返回

启动成功后打开：

- 本机：http://127.0.0.1:8765/
- 服务器：`http://<服务器IP>:8765/`

| 请求 | 结果 |
|------|------|
| `GET /` | `demo/index.html`，`200`，`text/html` |
| `GET /market.html`、`/assets/*`、`/src/*` | `demo/` 内对应文件，`200` |
| 不存在的路径 | `404`，正文 `not found` |
| 试图访问 `demo/` 以外的文件 | `400` 或 `403`，不返回仓库内文档 |
| 非 `GET`/`HEAD` | `405` |

日志是 JSON 行，写入 `run/bibi.log`。进程号写入 `run/bibi.pid`。这两个文件不进 Git。

## 服务器部署

在目标机器上：

```bash
git clone https://github.com/huudage/xhs-bibi.git
cd xhs-bibi
bash run.sh
curl -I http://127.0.0.1:8765/
```

确认本机返回 `HTTP/1.1 200` 后，再在云厂商安全组放行 `8765`。然后用浏览器打开首页，点「市集」进入商品，再从购物车勾选同类商品进入「比比」。

当前没有配置域名和 HTTPS。若要挂域名，在服务器上用已有反向代理把 443 转到 `127.0.0.1:8765`，并把启动命令改成 `HOST=127.0.0.1 bash run.sh`。不要为这个 demo 改系统 nginx 配置，除非单独备份后再改。

## 管线测试

静态服务不参与对比规则。规则回归：

```bash
node --test demo/tests/ scripts/static-server.test.js
```

## 常见问题

**端口已被占用。** `run.sh` 不会杀掉别的进程。换端口：`PORT=8766 bash run.sh`。

**`stop.sh` 拒绝停止。** pid 文件指向的进程命令行里没有 `scripts/static-server.js`。脚本会停手，避免误杀。看一下 `run/bibi.pid` 和 `ps -p <pid> -o args=`。

**页面能开但样式丢失。** 确认访问的是 `bash run.sh` 给出的地址，而不是直接双击 HTML。相对路径依赖站点根目录就是 `demo/`。

**外网打不开。** 先在服务器上 `curl -I http://127.0.0.1:8765/`。本机 200、外网不通时，检查安全组和防火墙是否放行端口，而不是重启服务。

**日志里启动失败。** 看 `run/bibi.log` 最后一行的 `startup_failed`。常见原因是 Node 版本低于 18，或 `PORT` 不是整数。
