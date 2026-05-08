// 디자인 명세:
//  - 패턴: '#' + (영문/숫자/한글/'-'/'_') 1~32자.
//  - '##' (두 번)은 escape, tag 추출 안 함.
//  - 공백/이모지/한자 등은 tag 종료.
//  - text는 변형하지 않음. 추출만.
const TAG_RE = /(?<!#)#([A-Za-z0-9가-힣_-]{1,32})/g;

export function parseTags(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of text.matchAll(TAG_RE)) {
    const tag = m[1];
    if (!tag) continue;
    // 다음 문자가 한글/영숫자면 32자 제한을 넘긴 케이스 — 무시.
    const after = text[m.index! + 1 + tag.length];
    if (after && /[A-Za-z0-9가-힣_-]/.test(after)) continue;
    if (!seen.has(tag)) {
      seen.add(tag);
      out.push(tag);
    }
  }
  return out;
}
