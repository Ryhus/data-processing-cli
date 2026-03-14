import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { resolvePath } from "../utils/pathResolver.js";

const supportedHashAlgorithms = {
  sha256: "sha256",
  md5: "md5",
  sha512: "sha512",
};

function calcHash(args) {
  let inputPath = resolvePath(args.input);
  let algorithm = args.algorithm ?? "sha256";
  let save = args.save ?? false;

  if (!supportedHashAlgorithms[algorithm]) {
    console.log("Operation failed");
    return;
  }

  const hash = createHash(algorithm);
  const readStream = createReadStream(inputPath);
  let writeStream;
  if (save) {
    const pathToWriteHash = resolvePath(`${inputPath}.${algorithm}`);
    writeStream = createWriteStream(pathToWriteHash);
    writeStream.on("error", () => console.log("Operation failed"));
  }

  readStream.on("error", () => console.log("Operation failed"));

  readStream.on("data", (chunk) => {
    hash.update(chunk);
  });

  readStream.on("end", () => {
    const result = hash.digest("hex");
    console.log(`${algorithm}: ${result}`);

    if (writeStream) {
      writeStream.write(result);
      writeStream.end();
    }
  });
}

export { calcHash, supportedHashAlgorithms };
