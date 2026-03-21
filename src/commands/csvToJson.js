import { createReadStream, createWriteStream } from "node:fs";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { resolvePath, checkPath } from "../utils/pathResolver.js";

class TransformCsv extends Transform {
  constructor() {
    super({ readableObjectMode: true });
    this.buffer = "";
    this.headers = [];
    this.firstRow = true;
  }

  _transform(chunk, _, callback) {
    this.buffer += chunk.toString();
    let lines = this.buffer.split("\n");

    this.buffer = lines.pop();

    for (const line of lines) {
      if (line.trim() === "") continue;
      if (this.headers.length === 0) {
        this.headers = line.split(",");
      } else {
        const jsonRow = this.writeJsonRow(line);
        if (this.firstRow) {
          this.push("[\n" + jsonRow);
          this.firstRow = false;
        } else {
          this.push(",\n" + jsonRow);
        }
      }
    }
    callback();
  }

  _flush(callback) {
    if (this.firstRow) {
      this.push("[]");
    } else if (this.buffer.trim() !== "") {
      const jsonRow = this.writeJsonRow(this.buffer);
      this.push(",\n" + jsonRow + "\n]");
    } else {
      this.push("\n]");
    }
    callback();
  }

  writeJsonRow(dataRow) {
    const jsonRow = {};
    const dataArray = dataRow.split(",");
    this.headers.forEach(
      (header, index) => (jsonRow[header] = dataArray[index] || null),
    );
    return JSON.stringify(jsonRow, null, 2);
  }
}

export default async function csvToJson(args) {
  try {
    const inputPath = resolvePath(args.input);
    const outputPath = resolvePath(args.output);

    const inputExists = await checkPath(inputPath);
    if (!inputExists) {
      throw new Error();
    }

    const readCsvSteam = createReadStream(inputPath);
    const writeJsonStream = createWriteStream(outputPath);
    const transformCsvStream = new TransformCsv();

    await pipeline(readCsvSteam, transformCsvStream, writeJsonStream);
  } catch (error) {
    console.log("Operation failed");
  }
}
