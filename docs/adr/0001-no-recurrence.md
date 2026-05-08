# 도메인에 반복(Recurrence) 개념을 두지 않는다

To-do 도구에서 반복은 거의 항상 1순위 기능 후보로 떠오르지만, 도입 순간 모든 **Task**가 "이건 occurrence인가, 템플릿인가, 일회성인가?"라는 질문에 답해야 한다. 모든 쿼리·UI·통계가 두 갈래로 갈라지고, 1인 운영에서 그 비용을 정당화할 만큼 반복 패턴이 빈번하다는 증거가 아직 없다.

**결정:** 반복 개념을 도메인에서 의식적으로 제외한다. 매주 운동처럼 반복되는 일도 매번 새 **Task**를 만든다. `Recurrence`/`RecurringTask`/`Schedule`/`Template`/`Occurrence`/`Series`/`RRule` 어휘는 `CONTEXT.md`에서 _Avoid_로 차단한다.

**되돌리는 조건:** 본인이 매주 5건 이상 같은 **Task**를 손으로 다시 만들고 있다는 패턴이 한 달 이상 지속될 때. 그때는 이 ADR을 superseded로 표시하고 후속 ADR에서 도입 모델(필드 vs 별도 entity)을 결정한다.
