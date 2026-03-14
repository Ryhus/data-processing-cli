import { createReadStream, createWriteStream } from "node:fs";
import crypto from "node:crypto";
import { once } from "node:events";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { resolvePath } from "../utils/pathResolver.js";

class StripTailTransform extends Transform {
  constructor(tailLength) {
    super();
    this.tailLength = tailLength;
    this.buffer = Buffer.alloc(0);
  }

  _transform(chunk, _, callback) {
    this.buffer = Buffer.concat([this.buffer, chunk]);

    if (this.buffer.length > this.tailLength) {
      const emitLen = this.buffer.length - this.tailLength;
      this.push(this.buffer.subarray(0, emitLen));
      this.buffer = this.buffer.subarray(emitLen);
    }

    callback();
  }

  _flush(callback) {
    this.emit("tail", this.buffer);
    callback();
  }
}

export default async function decryptFile(args) {
  try {
    const inputPath = resolvePath(args.input);
    const outputPath = resolvePath(args.output);
    const password = args.password;

    const readStream = createReadStream(inputPath);
    const writeStream = createWriteStream(outputPath);

    await once(readStream, "readable");

    const header = readStream.read(28);
    if (!header || header.length < 28) {
      throw new Error("Invalid file");
    }

    const salt = header.subarray(0, 16);
    const iv = header.subarray(16, 28);

    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);

    const stripTail = new StripTailTransform(16);

    stripTail.once("tail", (authTag) => {
      decipher.setAuthTag(authTag);
    });

    await pipeline(readStream, stripTail, decipher, writeStream);
  } catch {
    console.log("Operation failed");
  }
}
