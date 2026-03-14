import { pbkdf2Sync, randomBytes, createCipheriv } from "node:crypto";
import { pipeline } from "node:stream/promises";
import { createWriteStream, createReadStream } from "node:fs";
import { resolvePath } from "../utils/pathResolver.js";

async function encryptFile(args) {
  try {
    const inputPath = resolvePath(args.input);
    const outputPath = resolvePath(args.output);
    const password = args.password;

    const salt = randomBytes(16);
    const iv = randomBytes(12);

    const key = pbkdf2Sync(password, salt, 100000, 32, "sha256");
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const readStream = createReadStream(inputPath);
    const writeStream = createWriteStream(outputPath);

    writeStream.write(salt);
    writeStream.write(iv);

    await pipeline(readStream, cipher, writeStream, { end: false });

    writeStream.write(cipher.getAuthTag());
    writeStream.end();
  } catch {
    console.log("Operation failed");
  }
}

export { encryptFile };
