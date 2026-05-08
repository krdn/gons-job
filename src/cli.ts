#!/usr/bin/env bun
import { Command } from "commander";
import { openDb } from "./db/connection";
import { runAdd } from "./commands/add";
import { parseDate } from "./lib/parse-date";

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

program.parseAsync(process.argv).catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
