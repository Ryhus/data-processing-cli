import { parseArgs } from "node:util";
import path from "node:path";
import { createReadStream } from "node:fs";
import { createHash } from "node:crypto";
import { pipeline } from "node:stream/promises";
import { readFile } from "node:fs/promises";
import { supportedHashAlgorithms } from "./hash.js";

async function hashCompare(args) {
  let inputFile;
  let inputFileWithHash;
  let algorithm;

  try {
    const { values } = parseArgs({
      args,
      options: {
        input: { type: "string", required: true },
        hash: { type: "string" },
        algorithm: { type: "string" },
      },
    });

    inputFile = path.resolve(values.input);
    inputFileWithHash = path.resolve(values.hash);
    algorithm = values.algorithm ?? "sha256";
  } catch (eror) {
    console.log("Invalid input");
    return;
  }

  if (!supportedHashAlgorithms[algorithm]) {
    console.log("Operation failed");
    return;
  }

  const inputFileStream = createReadStream(inputFile);
  const hash = createHash(algorithm);

  try {
    const [cachedHash] = await Promise.all([
      readFile(inputFileWithHash, "utf-8"),
      pipeline(inputFileStream, hash),
    ]);

    const fileHash = hash.digest("hex");
    const processedCashedHash = cachedHash.trim().toLocaleLowerCase();

    if (processedCashedHash === fileHash) {
      console.log("OK");
    } else {
      console.log("MISMATCH");
    }
  } catch (err) {
    console.log("Operation failed");
  }
}

export { hashCompare };
