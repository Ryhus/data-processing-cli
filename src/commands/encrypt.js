import { pbkdf2Sync, randomBytes, createCipheriv } from "node:crypto";
import { pipeline } from "node:stream/promises";
import { createWriteStream, createReadStream } from "node:fs";
import path from "node:path";

async function encryptFile(args) {
  const inputPath = path.resolve(args.input);
  const outputPath = path.resolve(args.output);
  const password = args.password;

  const salt = randomBytes(16);
  const iv = randomBytes(12);

  const key = pbkdf2Sync(password, salt, 100000, 32, "sha256");
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const readStream = createReadStream(inputPath);
  const writeStream = createWriteStream(outputPath);

  try {
    writeStream.write(salt);
    writeStream.write(iv);

    await pipeline(readStream, cipher, writeStream, { end: false });

    writeStream.write(cipher.getAuthTag());
    writeStream.end();
  } catch (error) {
    console.log(error);
    console.log("Operation failed");
  }
}

export { encryptFile };
