#!/usr/bin/env bash
# Stop only the demo server recorded in run/bibi.pid.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$ROOT/run/bibi.pid"

if [[ ! -f "$PID_FILE" ]]; then
  echo "服务未在运行（没有 pid 文件）"
  exit 0
fi

pid="$(tr -d '[:space:]' < "$PID_FILE")"
if ! [[ "$pid" =~ ^[0-9]+$ ]]; then
  echo "pid 文件内容无效: $PID_FILE" >&2
  exit 1
fi

if ! kill -0 "$pid" 2>/dev/null; then
  echo "进程 $pid 已不存在，已清理 pid 文件"
  rm -f "$PID_FILE"
  exit 0
fi

cmd=""
if [[ -r "/proc/$pid/cmdline" ]]; then
  cmd="$(tr '\0' ' ' < "/proc/$pid/cmdline")"
else
  cmd="$(ps -p "$pid" -o args= 2>/dev/null || true)"
fi

case "$cmd" in
  *scripts/static-server.js*) ;;
  *)
    echo "拒绝停止：pid $pid 不是本项目静态服务。" >&2
    echo "命令行: ${cmd:-无法读取}" >&2
    exit 1
    ;;
esac

kill -TERM "$pid" 2>/dev/null || true
for _ in 1 2 3 4 5 6 7 8 9 10; do
  if ! kill -0 "$pid" 2>/dev/null; then
    rm -f "$PID_FILE"
    echo "已停止 pid=$pid"
    exit 0
  fi
  sleep 0.3
done

echo "优雅退出超时，强制结束 pid=$pid"
kill -KILL "$pid" 2>/dev/null || true
rm -f "$PID_FILE"
echo "已强制停止 pid=$pid"
