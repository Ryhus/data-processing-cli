import { validateArgs } from "./utils/argparser.js";
import { upDir, changeDir, listFilesAndDirs } from "./navigation.js";
import { csvToJson } from "./commands/csvToJson.js";
import { jsonToCsv } from "./commands/jsonToCsv.js";
import { countChar } from "./commands/count.js";
import { calcHash } from "./commands/hash.js";
import { hashCompare } from "./commands/hashCompare.js";
import { encryptFile } from "./commands/encrypt.js";
import { decryptFile } from "./commands/decrypt.js";
import { logStats } from "./commands/logStats.js";

const commandHandlers = {
  up: upDir,
  cd: changeDir,
  ls: listFilesAndDirs,
  count: countChar,
  hash: calcHash,
  encrypt: encryptFile,
  decrypt: decryptFile,
  "hash-compare": hashCompare,
  "csv-to-json": csvToJson,
  "json-to-csv": jsonToCsv,
  "log-stats": logStats,
};

async function parseCmdAndDispatch(cmd) {
  const commandTokens = cmd.trim().split(/\s+/);
  const command = commandTokens.shift();

  const handler = commandHandlers[command];
  if (!handler) {
    console.log("Invalid input");
    return;
  }

  const validatedArgs = validateArgs(command, commandTokens);

  if (validatedArgs === null) {
    console.log("Invalid input");
    return;
  }

  await handler(validatedArgs ?? {});
}

export { parseCmdAndDispatch };
