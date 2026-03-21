import { stdin, stdout } from "node:process";
import { getCurrentDir } from "./utils/pathResolver.js";
import readline from "node:readline/promises";
import parseCmdAndDispatch from "./repl.js";

console.log("Welcome to Data Processing CLI!");
console.log("You are currently in:", getCurrentDir());

const rl = readline.createInterface({
  input: stdin,
  output: stdout,
});

rl.prompt();

rl.on("line", async (line) => {
  if (line.trim() === ".exit") {
    rl.close();
    return;
  }
  await parseCmdAndDispatch(line);
  console.log("You are currently in:", getCurrentDir());
  rl.prompt();
});

rl.on("close", () => {
  console.log("Thank you for using Data Processing CLI!");
  process.exit(0);
});

rl.on("SIGINT", () => {
  rl.close();
});
