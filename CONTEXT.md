# gons-job

`gon` 한 사람이 자신의 할일을 기록·관리하기 위한 1인용 개인 도구. 다중 사용자·공유·테넌시 개념은 도메인에 존재하지 않는다.

## Language

**Task**:
사용자가 "해야 한다"고 기록한 일 한 건. 이 도메인의 1급 단위.
_Avoid_: Job, Todo, TodoItem, Item, 할일(영문 표기 `Halil` 등 한글 음차)

> 저장소 이름의 `job`은 "내가 할 일"이라는 비공식 카테고리(=프로젝트 이름)일 뿐, 도메인의 1급 단위는 항상 **Task**다. 코드·이슈·UI 라벨에서 단위를 가리킬 때는 일관되게 **Task**를 쓴다.

**Status**:
**Task**가 현재 어느 단계에 있는지 나타내는 상태값. 정확히 셋 중 하나: `open`(아직 손대지 않음) · `in_progress`(현재 작업 중) · `done`(완료).
_Avoid_: pending, todo, doing, wip, completed, finished, closed, cancelled, archived

> "안 할래"는 별도 상태가 아니라 **Task** 삭제로 표현한다. 1인 도구이므로 의사결정 흔적을 보존할 도메인 요구가 없다.

**Deadline**:
**Task**가 그 시점까지 완료되어야 한다는 외부 제약(약속·마감). 옵셔널 — 없는 **Task**도 정상이다.
_Avoid_: DueDate, TargetDate, EndDate, dueAt, deadlineAt(필드명 접미사 형태), 마감일(영문 표기)

> 자기 의도("오늘 하자", "이번 주에 처리하자")는 **Deadline** 이 아니다. 도메인에 "계획된 시점(PlannedFor)" 개념은 의식적으로 두지 않는다 — 그건 UI 필터(예: "오늘 생성된 Task")나 외부 캘린더의 영역이다.

**Tag**:
**Task**를 분류하기 위한 자유 라벨. 하나의 **Task**는 0개 이상의 **Tag**를 가질 수 있고, 하나의 **Tag**는 여러 **Task**에 붙을 수 있다(다대다). 옵셔널 — 태그 없는 **Task**도 정상이다.
_Avoid_: Label, Category, Folder, Bucket, 카테고리(영문 표기)

> **Tag**는 이 도메인에서 유일한 그룹화 수단이다. **Task**가 "어디에 속하는지"를 강제하는 컨테이너 개념(**Project** 등)은 두지 않는다 — 1인 운영에서 그 강제는 거의 항상 과한 의식이 된다.

## Non-terms (도메인에 존재하지 않는 개념)

다음 단어들은 이 프로젝트의 도메인 어휘로 채택하지 않는다. 코드/이슈/문서에서 등장하면 모델링이 잘못된 신호다:

- **User**, **Account** — 사용자 한 명뿐이므로 "현재 사용자"라는 1급 개념이 없다.
- **Workspace**, **Tenant**, **Organization** — 멀티테넌시 없음.
- **Sharing**, **Owner**, **Sharee**, **Visibility**, **Permission** — 공유 개념 없음.
- **Auth**, **Login**, **Session** (도메인 의미로) — 도메인 모델에는 존재하지 않음. 인프라 레벨의 보호(예: 로컬 파일 접근 권한)는 도메인 어휘가 아니다.
- **Recurrence**, **RecurringTask**, **Schedule**, **Template**, **Occurrence**, **Series**, **RRule** — 반복 개념을 도메인에서 의식적으로 제외한다. 매주 운동처럼 반복되는 일도 매번 새 **Task**를 만들어 처리한다. 근거: [ADR-0001](docs/adr/0001-no-recurrence.md).
- **PlannedFor**, **ScheduledAt**, **PlannedDate**, **DoOn** — "이 Task를 언제 할 의도인지"는 도메인에 두지 않는다. **Deadline**(외부 제약)과 별개로 자기 의도를 도메인 필드로 추적하지 않는다. 도입 시 **ADR로 명시적으로 가져온다**.
- **Project**, **List**, **Folder**, **Bucket**, **Area** — **Task**를 강제로 묶는 컨테이너 개념을 두지 않는다. 그룹화는 다대다·옵셔널인 **Tag**로만 한다. 근거: [ADR-0002](docs/adr/0002-tags-only-no-projects.md).
- **Appointment**, **Event**, **Meeting**, **CalendarEvent** — 특정 시각에 일어나는 약속은 캘린더 도메인이며, 이 도구가 다루지 않는다. **Task**는 "자기 주도 작업(self-directed work)"만 표현한다. 시작 시각·종료 시각·기간 같은 구간 시간 모델은 도메인에 없다. 근거: [ADR-0003](docs/adr/0003-appointments-out-of-scope.md).
- **Sync**, **Replication**, **Merge**, **Conflict**, **CRDT**, **VectorClock**, **CausalOrder**, **Tombstone** — 멀티 디바이스 충돌 해소는 도메인 책임이 아니다. 한 디바이스가 단일 truth이고 다른 디바이스는 단순 복제(파일 동기화나 git, 또는 last-write-wins)로 충분하다. 도메인 모델은 "현재 상태"만 표현하면 된다. 근거: [ADR-0004](docs/adr/0004-single-truth-no-crdt.md).

## Relationships

- 하나의 **Task**는 정확히 하나의 **Status**를 가진다 (`open` · `in_progress` · `done`).
- 하나의 **Task**는 0개 또는 1개의 **Deadline**을 가진다 (옵셔널).
- 하나의 **Task**는 0..N개의 **Tag**를 가지고, 하나의 **Tag**는 0..N개의 **Task**에 붙는다 (다대다).
- **Task**는 자기 주도 작업만 표현한다 — 외부 약속(시각이 정해진 만남)은 이 도메인 밖.

## Example dialogue

> **본인:** "내일 오전 11시에 치과 예약 있는데, 이거 **Task**로 넣을까?"
> **도메인 관점:** "아니. 그건 **Appointment**라서 캘린더 영역이다. 이 도구의 **Task**는 '자기 주도 작업'만 다룬다. 다만 '치과 가기 전에 보험증 챙기기'는 자기 주도 작업이니까 **Task**다 — 그리고 이 **Task**의 **Deadline**은 내일 오전 11시(약속 시각)로 둘 수 있다."

> **본인:** "매주 수요일 운동 같은 건 어떻게?"
> **도메인 관점:** "도메인에 반복은 없다. 매번 새 **Task**를 만들거나, 운동 자체는 도구 밖(습관 추적 영역)에서 관리한다."

> **본인:** "업무 관련 Task만 모아보고 싶다."
> **도메인 관점:** "업무용 **Tag**(예: `work`)를 붙이고 그 **Tag**로 필터링한다. 별도의 'Project' 컨테이너는 없다."

## Flagged ambiguities

- "할일"이라는 한국어 표현이 **Task**, **Appointment**, "막연한 의도(의식적으로 도메인에서 뺀 PlannedFor)" 모두를 가리킬 수 있음 — 해소: 도메인 1급 단위는 항상 **Task**(자기 주도 작업)만. 시각 약속은 **Appointment**(도메인 밖). 의도/계획은 도메인 외 영역.
- "마감"이라는 단어가 **Deadline**(외부 제약)과 자기 의도의 마감(=PlannedFor) 둘 다로 쓰일 위험 — 해소: 도메인의 "마감"은 항상 외부 제약(**Deadline**) 의미만. 자기 의도는 도메인 어휘로 두지 않음.
