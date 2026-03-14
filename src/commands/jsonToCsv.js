import { createReadStream, createWriteStream } from "node:fs";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { resolvePath, checkPath } from "../utils/pathResolver.js";

export class TransformJson extends Transform {
  constructor() {
    super({ readableObjectMode: true });
    this.buffer = "";
    this.headers = null;
    this.depth = 0;
    this.inArray = false;
    this.objectStart = -1;
  }

  _transform(chunk, _, callback) {
    this.buffer += chunk.toString();

    for (let i = 0; i < this.buffer.length; i++) {
      const char = this.buffer[i];

      if (!this.inArray) {
        if (char === "[") this.inArray = true;
        continue;
      }

      if (char === " " || char === "\n" || char === ",") continue;

      if (char === "{") {
        if (this.depth === 0) this.objectStart = i;
        this.depth++;
      }

      if (char === "}") {
        this.depth--;
        if (this.depth === 0 && this.objectStart !== -1) {
          const jsonStr = this.buffer.slice(this.objectStart, i + 1);
          let obj;
          try {
            obj = JSON.parse(jsonStr);
          } catch (err) {
            return callback(new Error(`Invalid JSON: ${jsonStr}`));
          }

          if (!this.headers) {
            this.headers = Object.keys(obj);
            this.push(this.headers.join(",") + "\n");
          }

          const csvRow = this.headers.map((h) => obj[h]).join(",");
          this.push(csvRow + "\n");

          this.buffer = this.buffer.slice(i + 1);
          i = -1;
          this.objectStart = -1;
        }
      }
    }

    callback();
  }

  _flush(callback) {
    const text = this.buffer.replace(/[\]\s]/g, "");
    if (text.length > 0) {
      try {
        const obj = JSON.parse(text);
        if (!this.headers) {
          this.headers = Object.keys(obj);
          this.push(this.headers.join(",") + "\n");
        }
        const csvRow = this.headers.map((h) => obj[h]).join(",");
        this.push(csvRow + "\n");
      } catch (err) {
        return callback(new Error(`Invalid JSON at flush: ${text}`));
      }
    }
    callback();
  }
}

export default async function jsonToCsv(args) {
  try {
    const inputPath = resolvePath(args.input);
    const outputPath = resolvePath(args.output);

    const inputExists = await checkPath(inputPath);
    if (!inputExists) {
      throw new Error();
    }

    const readJsonSteam = createReadStream(inputPath);
    const writeCsvStream = createWriteStream(outputPath);
    const transformJsonStream = new TransformJson();

    await pipeline(readJsonSteam, transformJsonStream, writeCsvStream);
  } catch (error) {
    console.log("Operation failed");
  }
}
