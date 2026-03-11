import { upDir, changeDir, listFilesAndDirs } from "./navigation.js";

async function commandParser(cmd) {
  const commandWithArguments = cmd.trim().toLowerCase().split(" ");
  const command = commandWithArguments.shift(0);
  const commandArgs = commandWithArguments.join(" ");

  if (command === "up") {
    upDir();
  } else if ((command === "cd") & (commandWithArguments.length > 0)) {
    changeDir(commandArgs);
  } else if (command === "ls") {
    await listFilesAndDirs();
  } else {
    console.error("Invalid input");
  }
}

export { commandParser };
