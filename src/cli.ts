#!/usr/bin/env bun
import { Command } from "commander";
import { openDb } from "./db/connection";
import { runAdd } from "./commands/add";
import { runLs } from "./commands/ls";
import { runDone } from "./commands/done";
import { runTag } from "./commands/tag";
import { runRm } from "./commands/rm";
import { runSetDeadline } from "./commands/set-deadline";
import { parseDate } from "./lib/parse-date";
import { runMorning } from "./morning/index";

const program = new Command();
program
  .name("job")
  .description("gons-job — input friction killer with a morning ritual")
  .version("0.0.0");

program
  .command("add")
  .description("새 task 캡처")
  .argument("<text...>", "task 내용 (공백 포함 가능)")
  .option("-d, --deadline <date>", "외부 마감 (ISO 8601 또는 +Nd/+Nw/tomorrow)")
  .action((textParts: string[], opts: { deadline?: string }) => {
    const db = openDb();
    try {
      const deadline = opts.deadline ? parseDate(opts.deadline) : null;
      const id = runAdd(db, { textParts, deadline });
      console.log(`#${id} 추가됨`);
    } finally {
      db.close();
    }
  });

program
  .command("ls")
  .description("task 목록 출력")
  .option("--status <status>", "open|in_progress|done")
  .option("--tag <name>", "태그 필터")
  .action((opts: { status?: string; tag?: string }) => {
    const db = openDb();
    try {
      if (opts.status && !["open", "in_progress", "done"].includes(opts.status)) {
        throw new Error(`알 수 없는 status: ${opts.status}`);
      }
      const lines = runLs(db, {
        status: opts.status as "open" | "in_progress" | "done" | undefined,
        tag: opts.tag,
      });
      for (const l of lines) console.log(l);
    } finally {
      db.close();
    }
  });

program
  .command("done")
  .description("task를 done으로 전이")
  .argument("<id>", "task id")
  .action((idStr: string) => {
    const id = Number(idStr);
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error(`유효하지 않은 id: ${idStr}`);
    }
    const db = openDb();
    try {
      runDone(db, id);
      console.log(`#${id} done`);
    } finally {
      db.close();
    }
  });

program
  .command("tag")
  .description("task에 태그 토글")
  .argument("<id>", "task id")
  .argument("<name>", "태그 이름")
  .action((idStr: string, name: string) => {
    const id = Number(idStr);
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error(`유효하지 않은 id: ${idStr}`);
    }
    const db = openDb();
    try {
      runTag(db, id, name);
    } finally {
      db.close();
    }
  });

program
  .command("rm")
  .description("task 영구 삭제")
  .argument("<id>", "task id")
  .action((idStr: string) => {
    const id = Number(idStr);
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error(`유효하지 않은 id: ${idStr}`);
    }
    const db = openDb();
    try {
      runRm(db, id);
      console.log(`#${id} 삭제됨`);
    } finally {
      db.close();
    }
  });

const setCmd = program.command("set").description("set 하위 명령");
setCmd
  .command("deadline")
  .description("task의 deadline 설정/해제")
  .argument("<id>", "task id")
  .argument("[date]", "ISO 8601 또는 +Nd/+Nw/tomorrow. 생략 시 deadline 제거")
  .action((idStr: string, date: string | undefined) => {
    const id = Number(idStr);
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error(`유효하지 않은 id: ${idStr}`);
    }
    const dl = date ? parseDate(date) : null;
    const db = openDb();
    try {
      runSetDeadline(db, id, dl);
    } finally {
      db.close();
    }
  });

program
  .command("morning", { isDefault: true })
  .description("아침 의식 — 오늘 할 일을 고르기")
  .action(async () => {
    await runMorning();
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
