#!/usr/bin/env bun
import { Command } from "commander";

const program = new Command();
program
  .name("job")
  .description("gons-job — input friction killer with a morning ritual")
  .version("0.0.0");

// 서브명령들은 Task 6 이후에 등록
program.parseAsync(process.argv).catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
