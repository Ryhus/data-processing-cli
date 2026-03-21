import { parseArgs } from "node:util";

const commandArguments = {
  cd: {
    positionals: ["path"],
  },
  up: {},
  ls: {},
  count: { input: { type: "string", required: true } },
  hash: {
    input: { type: "string", required: true },
    algorithm: { type: "string" },
    save: { type: "boolean" },
  },
  encrypt: {
    input: { type: "string", required: true },
    output: { type: "string", required: true },
    password: { type: "string", required: true },
  },
  decrypt: {
    input: { type: "string", required: true },
    output: { type: "string", required: true },
    password: { type: "string", required: true },
  },
  "csv-to-json": {
    input: { type: "string", required: true },
    output: { type: "string", required: true },
  },
  "json-to-csv": {
    input: { type: "string", required: true },
    output: { type: "string", required: true },
  },
  "hash-compare": {
    input: { type: "string", required: true },
    hash: { type: "string" },
    algorithm: { type: "string" },
  },
  "log-stats": {
    input: { type: "string", required: true },
    output: { type: "string", required: true },
  },
};

export default function validateArgs(cmd, args) {
  const config = commandArguments[cmd];

  if (!config) {
    return {};
  }
  if (!config.positionals && Object.keys(config).length === 0) {
    return args.length === 0 ? {} : null;
  }

  if (config.positionals) {
    if (args.length < config.positionals.length) {
      return null;
    }

    const result = {};
    config.positionals.forEach((name, i) => {
      result[name] = args[i];
    });

    return result;
  }

  try {
    const { values } = parseArgs({
      args,
      options: config,
    });

    const requiredOptions = Object.entries(config)
      .filter(([_, opt]) => opt.required)
      .map(([name]) => name);

    for (const opt of requiredOptions) {
      if (!(opt in values)) {
        return null;
      }
    }

    return values;
  } catch {
    return null;
  }
}
