import { createReadStream } from "node:fs";
import { resolvePath, checkPath } from "../utils/pathResolver.js";

export default async function countChar(args) {
  try {
    const inputPath = resolvePath(args.input);

    const inputExists = await checkPath(inputPath);
    if (!inputExists) {
      throw new Error();
    }

    let buffer = "";
    let lines = 0;
    let words = 0;
    let chars = 0;

    const stream = createReadStream(inputPath, { encoding: "utf8" });

    for await (const chunk of stream) {
      buffer += chunk;
      const splitedLines = buffer.split("\n");
      buffer = splitedLines.pop();

      for (const line of splitedLines) {
        if (!line) continue;
        lines += 1;
        chars += line.length + 1;
        words += line.split(/\s+/).filter(Boolean).length;
      }
    }

    if (buffer.length > 0) {
      lines += 1;
      chars += buffer.length;
      words += buffer.split(/\s+/).filter(Boolean).length;
    }

    console.log("Lines:", lines);
    console.log("Words:", words);
    console.log("Characters:", chars);
  } catch (error) {
    console.log("Operation failed");
  }
}
