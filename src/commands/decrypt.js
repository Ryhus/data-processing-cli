import { parseArgs } from "node:util";
import { createReadStream, createWriteStream } from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { once } from "node:events";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

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
      this.push(this.buffer.slice(0, emitLen));
      this.buffer = this.buffer.slice(emitLen);
    }
    callback();
  }

  _flush(callback) {
    this.emit("tail", this.buffer);
    callback();
  }
}

async function decryptFile(args) {
  let inputPath;
  let outputPath;
  let password;

  try {
    const { values } = parseArgs({
      args,
      options: {
        input: { type: "string", required: true },
        output: { type: "string", required: true },
        password: { type: "string", required: true },
      },
    });

    inputPath = path.resolve(values.input);
    outputPath = path.resolve(values.output);
    password = values.password;
  } catch (error) {
    console.log("Invalid input");
    return;
  }

  try {
    const readStream = createReadStream(inputPath);
    const writeStream = createWriteStream(outputPath);

    const headerBuffer = Buffer.alloc(28);
    await once(readStream, "readable");
    const header = readStream.read(28);
    header.copy(headerBuffer);

    const salt = headerBuffer.slice(0, 16);
    const iv = headerBuffer.slice(16, 28);

    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);

    const stripTail = new StripTailTransform(16);
    stripTail.on("tail", (authTag) => {
      decipher.setAuthTag(authTag);
    });

    await pipeline(readStream, stripTail, decipher, writeStream);
  } catch {
    console.log("Operation failed");
  }
}

export { decryptFile };
