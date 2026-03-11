import { upDir, changeDir, listFilesAndDirs } from "./navigation.js";

const commands = {
  up: upDir,
  cd: changeDir,
  ls: listFilesAndDirs,
};

async function commandParser(cmd) {
  const commandTokens = cmd.trim().toLowerCase().split(/\s+/);
  const command = commandTokens.shift();

  const handler = commands[command];

  if (!command) {
    console.log("Invalid input");
    return;
  }

  await handler(commandTokens);
}

export { commandParser };
