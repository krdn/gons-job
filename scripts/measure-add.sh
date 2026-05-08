#!/usr/bin/env bash
# Usage: scripts/measure-add.sh [runs] [bin]
#   runs: 측정 횟수 (default 100)
#   bin:  실행할 명령 (default 'bun run src/cli.ts')
set -euo pipefail
runs="${1:-100}"
bin="${2:-bun run src/cli.ts}"
db="$(mktemp /tmp/gons-perf-XXXX.db)"
export GONS_JOB_DB="$db"

times=()
for ((i=1; i<=runs; i++)); do
  start=$(date +%s%N)
  $bin add "perf $i" >/dev/null
  end=$(date +%s%N)
  ms=$(( (end - start) / 1000000 ))
  times+=("$ms")
done
rm -f "$db"

# sort 후 통계 계산
IFS=$'\n' sorted=($(printf '%s\n' "${times[@]}" | sort -n))
sum=0
for t in "${sorted[@]}"; do sum=$((sum + t)); done
avg=$((sum / runs))
p50=${sorted[$((runs / 2))]}
p95=${sorted[$((runs * 95 / 100))]}
p99=${sorted[$((runs * 99 / 100))]}

echo "runs=$runs avg=${avg}ms p50=${p50}ms p95=${p95}ms p99=${p99}ms"
echo "PASS_THRESHOLD=100ms"
if [ "$avg" -le 100 ]; then
  echo "RESULT: PASS"
  exit 0
else
  echo "RESULT: FAIL — fallback to 'bun build --compile'"
  exit 1
fi
