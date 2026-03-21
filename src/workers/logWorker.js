import { parentPort } from "worker_threads";
import { createReadStream } from "fs";

parentPort.on("message", (data) => {
  const readStream = createReadStream(data.path, {
    start: data.start,
    end: data.end,
  });

  let buffer = "";
  const logStat = {
    total: 0,
    levels: { INFO: 0, WARN: 0, ERROR: 0 },
    status: { "2xx": 0, "3xx": 0, "4xx": 0, "5xx": 0 },
    paths: {},
    responseTimeMs: 0,
  };

  readStream.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split("\n");

    buffer = lines.pop();
    for (const line of lines) {
      const field = line.split(" ");
      logStat.total += 1;
      logStat.levels[field[1]] += 1;
      logStat.status[`${field[3].at(0)}xx`] += 1;
      logStat.responseTimeMs += Number(field[4]);
      if (!logStat.paths[field[6]]) {
        logStat.paths[field[6]] = 1;
      } else {
        logStat.paths[field[6]] += 1;
      }
    }
  });
  readStream.on("end", () => {
    parentPort.postMessage(logStat);
    readStream.close();
  });
});
