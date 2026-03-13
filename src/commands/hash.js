import { parseArgs } from "node:util";
import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import path from "node:path";

const supportedHashAlgorithms = {
  sha256: "sha256",
  md5: "md5",
  sha512: "sha512",
};

async function calcHash(args) {
  let inputPath;
  let algorithm;
  let save;

  try {
    const { values } = parseArgs({
      args,
      options: {
        input: { type: "string" },
        algorithm: { type: "string" },
        save: { type: "boolean" },
      },
    });

    inputPath = path.resolve(values.input);
    algorithm = values.algorithm ?? "sha256";
    save = values.save ?? false;
  } catch (eror) {
    console.log("Invalid input");
    return;
  }

  if (!supportedHashAlgorithms[algorithm]) {
    console.log("Operation failed");
    return;
  }

  const hash = createHash(algorithm);
  const readStream = createReadStream(inputPath);
  let writeStream;
  if (save) {
    const pathToWriteHash = path.resolve(`${inputPath}.${algorithm}`);
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

export { calcHash };
