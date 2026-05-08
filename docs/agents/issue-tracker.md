# 이슈 트래커: GitHub

이 저장소의 이슈와 PRD는 GitHub Issues에 저장됩니다. 모든 작업에 `gh` CLI를 사용하세요.

## 컨벤션

- **이슈 생성**: `gh issue create --title "..." --body "..."`. 여러 줄 본문에는 heredoc을 사용하세요.
- **이슈 조회**: `gh issue view <number> --comments`. 댓글은 `jq`로 필터링하고 라벨도 함께 가져옵니다.
- **이슈 목록**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` (적절한 `--label`, `--state` 필터 적용).
- **이슈 댓글**: `gh issue comment <number> --body "..."`
- **라벨 적용 / 제거**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **이슈 닫기**: `gh issue close <number> --comment "..."`

저장소는 `git remote -v`에서 추론합니다 — `gh`는 클론 내부에서 실행 시 자동으로 인식합니다.

## 스킬이 "이슈 트래커에 게시"라고 할 때

GitHub 이슈를 생성합니다.

## 스킬이 "관련 티켓 가져오기"라고 할 때

`gh issue view <number> --comments` 를 실행합니다.
