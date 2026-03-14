import { stat, open, writeFile } from "node:fs/promises";
import { availableParallelism } from "node:os";
import { Worker } from "node:worker_threads";
import { resolvePath, checkPath } from "../utils/pathResolver.js";

async function splitFile(numOfChunks, pathToFile) {
  const stats = await stat(pathToFile);
  const chunkSize = Math.floor(stats.size / numOfChunks);

  const fileDescriptor = await open(pathToFile, "r");

  const buffer = Buffer.alloc(1);
  let currentPosition = chunkSize;
  const borders = [];
  let EOF = false;
  let firstIteration = true;

  while (EOF === false) {
    const { bytesRead, buffer: newBuffer } = await fileDescriptor.read(
      buffer,
      0,
      buffer.length,
      currentPosition,
    );
    if (bytesRead === 0) {
      EOF = true;
    }
    if (newBuffer.toString() === "\n") {
      if (firstIteration) {
        borders.push({ start: 0, end: currentPosition, path: pathToFile });
        currentPosition += chunkSize;
        firstIteration = false;
      } else {
        const start = borders.at(-1).end + 1;
        borders.push({
          start: start,
          end: currentPosition,
          path: pathToFile,
        });
        currentPosition += chunkSize;
      }
    } else {
      currentPosition += 1;
    }
  }

  fileDescriptor.close();

  return borders;
}

function runWorker(path, data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path);

    worker.postMessage(data);

    worker.once("message", (result) => {
      resolve(result);
      worker.terminate();
    });

    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) reject(new Error("Worker crashed"));
    });
  });
}

function mergeCounts(target, source) {
  for (const key in source) {
    target[key] = (target[key] ?? 0) + source[key];
  }
}

export default async function logStats(args) {
  try {
    const pathToWorker = "./src/workers/logWorker.js";
    const pathToLogs = resolvePath(args.input);
    const outputPath = resolvePath(args.output);
    const NUM_WORKERS = Math.max(1, availableParallelism() - 1);

    const inputExists = await checkPath(pathToLogs);
    if (!inputExists) {
      throw new Error();
    }

    const chunkBorders = await splitFile(NUM_WORKERS, pathToLogs);

    const workersResults = await Promise.all(
      chunkBorders.map((data) => runWorker(pathToWorker, data)),
    );

    const result = workersResults.reduce(
      (acc, curr) => {
        acc.total += curr.total;
        acc.responseTimeMs += curr.responseTimeMs;

        mergeCounts(acc.levels, curr.levels);
        mergeCounts(acc.status, curr.status);
        mergeCounts(acc.paths, curr.paths);

        return acc;
      },
      {
        total: 0,
        levels: {},
        status: {},
        paths: {},
        responseTimeMs: 0,
      },
    );

    const topPaths = [];
    for (const [key, value] of Object.entries(result.paths)) {
      topPaths.push({ path: key, count: value });
    }

    topPaths.sort((a, b) => b.count - a.count);

    result.topPaths = topPaths;
    result.avgResponseTimeMs = Number(
      (result.responseTimeMs / result.total).toFixed(2),
    );

    delete result.responseTimeMs;
    delete result.paths;

    await writeFile(outputPath, JSON.stringify(result, null, 2));
  } catch (error) {
    console.log(error);
    console.log("Operation failed");
  }
}
