import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { resolvePath, checkPath } from "../utils/pathResolver.js";

const supportedHashAlgorithms = {
  sha256: "sha256",
  md5: "md5",
  sha512: "sha512",
};

async function calcHash(args) {
  try {
    let inputPath = resolvePath(args.input);
    let algorithm = args.algorithm ?? "sha256";
    let save = args.save ?? false;

    const inputExists = await checkPath(inputPath);
    if (!inputExists) {
      throw new Error();
    }

    if (!supportedHashAlgorithms[algorithm]) {
      throw new Error();
    }

    const hash = createHash(algorithm);
    const readStream = createReadStream(inputPath);
    let writeStream;
    if (save) {
      const pathToWriteHash = resolvePath(`${inputPath}.${algorithm}`);
      writeStream = createWriteStream(pathToWriteHash);
      writeStream.on("error", () => console.log("Operation failed"));
    }

    for await (const chunk of readStream) {
      hash.update(chunk);
    }

    const result = hash.digest("hex");
    console.log(`${algorithm}: ${result}`);

    if (writeStream) {
      writeStream.write(result);
      writeStream.end();

      await new Promise((resolve) => writeStream.on("finish", resolve));
    }
  } catch (error) {
    console.log("Operation failed");
  }
}

export { calcHash, supportedHashAlgorithms };
