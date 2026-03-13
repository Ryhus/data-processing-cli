import path from "node:path";
import { createReadStream } from "node:fs";
import { createHash } from "node:crypto";
import { pipeline } from "node:stream/promises";
import { readFile } from "node:fs/promises";
import { supportedHashAlgorithms } from "./hash.js";

async function hashCompare(args) {
  const inputFile = path.resolve(args.input);
  const inputFileWithHash = path.resolve(args.hash);
  const algorithm = args.algorithm ?? "sha256";

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
