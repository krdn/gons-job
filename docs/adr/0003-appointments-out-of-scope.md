# 약속(Appointment)은 도메인 밖이다

To-do와 캘린더는 사용자 머릿속에서는 가까이 있지만 시간 모델이 본질적으로 다르다. **Task**의 시간은 점(**Deadline**: "그때까지 끝")인 반면, 약속의 시간은 구간(`startAt`–`endAt`: "그 시간에 거기 있음")이다. To-do 도구가 약속까지 흡수하면 도메인의 시간 모델이 두 배로 복잡해지고, 외부 캘린더(Google Calendar 등)와 책임이 겹친다.

**결정:** **Task**는 "자기 주도 작업(self-directed work)"만 표현한다. 시각이 정해진 만남·미팅·예약은 캘린더 도메인이며 이 도구가 다루지 않는다. `Appointment`/`Event`/`Meeting`/`CalendarEvent`/`startAt`/`endAt`/`duration` 어휘는 _Avoid_.

**되돌리는 조건:** 외부 캘린더와의 통합이 도메인 요구로 명시적으로 제기되고, 단순한 "Task에서 캘린더로 export" 정도로는 부족할 때. 그 시점에서 별도 entity(`Appointment`)로 도입할지 **Task**의 변종으로 둘지를 후속 ADR에서 결정한다.
