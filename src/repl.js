import { upDir, changeDir, listFilesAndDirs } from "./navigation.js";
import { csvToJson } from "./commands/csvToJson.js";
import { jsonToCsv } from "./commands/jsonToCsv.js";
import { countChar } from "./commands/count.js";
import { calcHash } from "./commands/hash.js";
import { hashCompare } from "./commands/hashCompare.js";
import { encryptFile } from "./commands/encrypt.js";
import { decryptFile } from "./commands/decrypt.js";

const commands = {
  up: upDir,
  cd: changeDir,
  ls: listFilesAndDirs,
  "csv-to-json": csvToJson,
  "json-to-csv": jsonToCsv,
  count: countChar,
  hash: calcHash,
  "hash-compare": hashCompare,
  encrypt: encryptFile,
  decrypt: decryptFile,
};

async function commandParser(cmd) {
  const commandTokens = cmd.trim().split(/\s+/);
  const command = commandTokens.shift();

  const handler = commands[command];

  if (command in commands) {
    await handler(commandTokens);
  } else console.log("Invalid input");
}

export { commandParser };
