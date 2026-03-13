import { parseArgs } from "node:util";
import { createReadStream } from "node:fs";
import path from "node:path";

function countChar(args) {
  let inputPath;
  let buffer = "";
  let lines = 0;
  let words = 0;
  let chars = 0;

  try {
    const { values } = parseArgs({
      args,
      options: { input: { type: "string", required: true } },
    });

    inputPath = path.resolve(values.input);
  } catch (error) {
    console.log("Invalid input");
    return;
  }

  const stream = createReadStream(inputPath);

  stream.on("data", (chunk) => {
    buffer += chunk.toString();
    const splitedLines = buffer.split("\n");
    buffer = splitedLines.pop();

    for (const line of splitedLines) {
      lines += 1;
      chars += line.length + 1; // this +1 for the \n symbol
      words += line.split(/\s+/).filter(Boolean).length;
    }
  });

  stream.on("end", () => {
    if (buffer.length > 0) {
      lines += 1;
      chars += buffer.length;
      words += buffer.split(/\s+/).filter(Boolean).length;
    }

    console.log("Lines:", lines);
    console.log("Words:", words);
    console.log("Characters:", chars);
  });

  stream.on("error", () => {
    console.log("Operation failed");
  });
}

export { countChar };
