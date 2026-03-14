import { createReadStream } from "node:fs";
import { createHash } from "node:crypto";
import { pipeline } from "node:stream/promises";
import { readFile } from "node:fs/promises";
import { supportedHashAlgorithms } from "./hash.js";
import { resolvePath, checkPath } from "../utils/pathResolver.js";

export default async function hashCompare(args) {
  try {
    const inputFile = resolvePath(args.input);
    const inputFileWithHash = resolvePath(args.hash);
    const algorithm = args.algorithm ?? "sha256";

    const inputExists = await checkPath(inputFile);
    const hashFileExists = await checkPath(inputFileWithHash);
    if (!inputExists || !hashFileExists) {
      throw new Error();
    }

    if (!supportedHashAlgorithms[algorithm]) {
      console.log("Operation failed");
      return;
    }

    const inputFileStream = createReadStream(inputFile);
    const hash = createHash(algorithm);

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
