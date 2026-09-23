#!/usr/bin/env bash
# Start the static demo server. Logs: run/bibi.log  PID: run/bibi.pid
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
RUN_DIR="$ROOT/run"
PID_FILE="$RUN_DIR/bibi.pid"
LOG_FILE="$RUN_DIR/bibi.log"
PORT="${PORT:-8765}"
HOST="${HOST:-0.0.0.0}"

mkdir -p "$RUN_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "未找到 node。请先安装 Node.js 18 或更高版本。" >&2
  exit 1
fi

node -e 'const major=Number(process.versions.node.split(".")[0]); if(major<18){console.error("需要 Node.js 18+，当前 "+process.version); process.exit(1)}'

if ! [[ "$PORT" =~ ^[0-9]+$ ]] || (( PORT < 1 || PORT > 65535 )); then
  echo "PORT 必须是 1-65535 的整数，当前为: $PORT" >&2
  exit 1
fi

if [[ -f "$PID_FILE" ]]; then
  old_pid="$(tr -d '[:space:]' < "$PID_FILE")"
  if [[ "$old_pid" =~ ^[0-9]+$ ]] && kill -0 "$old_pid" 2>/dev/null; then
    echo "服务已在运行 pid=$old_pid"
    echo "本机访问 http://127.0.0.1:${PORT}/"
    echo "日志 $LOG_FILE"
    exit 0
  fi
  rm -f "$PID_FILE"
fi

export PORT HOST
if ! node -e 'const net=require("net"); const server=net.createServer(); server.once("error",()=>process.exit(1)); server.listen(Number(process.env.PORT), process.env.HOST, ()=>server.close(()=>process.exit(0)));'; then
  echo "端口 ${PORT} 已被其他进程占用。请换一个端口再启动，例如: PORT=8766 bash run.sh" >&2
  echo "不要结束无关进程。" >&2
  exit 1
fi

nohup env PORT="$PORT" HOST="$HOST" node "$ROOT/scripts/static-server.js" >>"$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"
new_pid="$(cat "$PID_FILE")"

health_host="127.0.0.1"
if [[ "$HOST" != "0.0.0.0" && "$HOST" != "::" ]]; then
  health_host="$HOST"
fi

ready=0
for _ in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
  if node -e "fetch('http://${health_host}:${PORT}/').then((res)=>process.exit(res.ok?0:1)).catch(()=>process.exit(1))"; then
    ready=1
    break
  fi
  if ! kill -0 "$new_pid" 2>/dev/null; then
    echo "进程已退出。请查看日志: $LOG_FILE" >&2
    rm -f "$PID_FILE"
    exit 1
  fi
  sleep 0.2
done

if [[ "$ready" -ne 1 ]]; then
  echo "启动超时。请查看日志: $LOG_FILE" >&2
  exit 1
fi

echo "已启动 pid=$new_pid"
echo "本机访问 http://127.0.0.1:${PORT}/"
echo "监听 ${HOST}:${PORT}，静态目录 demo/"
echo "日志 $LOG_FILE"
