# gons-job

1인용 터미널 to-do — 입력 마찰을 없애고 매일 아침 의식으로 오늘 할 일을 고른다.

## 도메인

자세한 내용: [`CONTEXT.md`](./CONTEXT.md), [`docs/adr/`](./docs/adr/), 디자인: [`docs/design/v0.md`](./docs/design/v0.md).

## 설치 (개인 머신)

```bash
bun install
bun run build         # dist/job 단일 바이너리
ln -sf "$(pwd)/dist/job" ~/.local/bin/job
job --help
```

DB 위치: `~/.gons-job/tasks.db` (자동 생성).

## 사용

```bash
job add 도메인 그림 그리기 #design
job add "보고서 보내기" -d 2026-05-20
job              # = job morning  (활 장면)
job ls
job ls --tag design
job ls --status in_progress
job done 12
job tag 12 important     # toggle
job rm 12
job set deadline 12 +1w
```

## morning 의식

```
gons-job morning — 2026-05-08
==================================================
[ ]  3  ink hello world 띄우기   #setup   in_progress
[*]  2  CLI commander 라이브러리 평가   #setup #cli
[ ]  1  도메인 그림 그리기   #design   (deadline: 2026-05-20)

j/k 또는 ↑/↓ 이동  space 토글  enter 확정  q 취소
```

- 토글 후 enter — open이면 in_progress로, in_progress면 open으로.
- 무토글은 그대로 — 어제 in_progress가 자연스럽게 오늘로 이어진다.

## 측정

```bash
scripts/measure-add.sh 100 "./dist/job"
```

목표: avg ≤ 100ms.
