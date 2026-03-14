import { createReadStream, createWriteStream } from "node:fs";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { resolvePath } from "../utils/pathResolver.js";

class TransformJson extends Transform {
  constructor() {
    super({ readableObjectMode: true });
    this.buffer = "";
    this.depth = 0;
    this.start = -1;
    this.headers = null;
    this.firstRow = true;
  }

  _transform(chunk, _, callback) {
    const text = chunk.toString();

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      this.buffer += char;

      if (char === "{") {
        if (this.depth === 0) this.start = this.buffer.length - 1;
        this.depth++;
      }

      if (char === "}") {
        this.depth--;
        if (this.depth === 0 && this.start !== -1) {
          const jsonStr = this.buffer.slice(this.start);

          const obj = JSON.parse(jsonStr);

          if (!this.headers) {
            this.headers = Object.keys(obj);
            this.push(this.headers.join(",") + "\n");
          }

          const csvRow = this.headers.map((h) => obj[h]).join(",");
          this.push(csvRow + "\n");

          this.buffer = "";
          this.start = -1;
        }
      }
    }

    callback();
  }

  _flush(callback) {
    if (this.buffer && this.depth === 0) {
      const obj = JSON.parse(this.buffer);
      if (!this.headers) {
        this.headers = Object.keys(obj);
        this.push(this.headers.join(",") + "\n");
      }
      const csvRow = this.headers.map((h) => obj[h]).join(",");
      this.push(csvRow + "\n");
    }
    callback();
  }
}

async function jsonToCsv(args) {
  try {
    const inputPath = resolvePath(args.input);
    const outputPath = resolvePath(args.output);

    const readJsonSteam = createReadStream(inputPath);
    const writeCsvStream = createWriteStream(outputPath);
    const transformJsonStream = new TransformJson();

    await pipeline(readJsonSteam, transformJsonStream, writeCsvStream);
  } catch (error) {
    console.log("Operation failed");
  }
}

export { jsonToCsv };
