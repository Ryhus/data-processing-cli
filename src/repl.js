import { upDir, changeDir, listFilesAndDirs } from "./navigation.js";
import { csvToJson } from "./commands/csvToJson.js";
import { jsonToCsv } from "./commands/jsonToCsv.js";

const commands = {
  up: upDir,
  cd: changeDir,
  ls: listFilesAndDirs,
  "csv-to-json": csvToJson,
  "json-to-csv": jsonToCsv,
};

async function commandParser(cmd) {
  const commandTokens = cmd.trim().toLowerCase().split(/\s+/);
  const command = commandTokens.shift();

  const handler = commands[command];

  if (command in commands) {
    await handler(commandTokens);
  } else console.log("Invalid input");
}

export { commandParser };
