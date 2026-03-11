import { cwd, stdin, stdout, env, chdir } from "node:process";
import readline from "node:readline/promises";
import { commandParser } from "./repl.js";

console.log("Welcome to Data Processing CLI!");
chdir(env.HOME || env.USERPROFILE);
console.log("You are currently in:", cwd());

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
  await commandParser(line);
  console.log("You are currently in:", cwd());
  rl.prompt();
});

rl.on("close", () => {
  console.log("Thank you for using Data Processing CLI!");
  process.exit(0);
});

rl.on("SIGINT", () => {
  rl.close();
});
