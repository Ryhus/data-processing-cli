# Data Processing CLI

![Node.js](https://img.shields.io/badge/node-v25-green)

An interactive command-line application for performing various useful data processing tasks, including file system navigation and manipulation of data.

## 📦 Installation

This application is built with core Node.js. To get started, clone the repository and ensure Node.js is installed on your system.

To run the CLI tool type in terminal `npm start`.

## ✨ Commands

### Navigation & Working Directory Commands

#### `up` — Move up one directory level

```bash
up
```

#### `cd` — Change to a specified directory

```bash
cd path_to_directory
```

- `path_to_directory` — relative or absolute path to navigate to (**required**)

#### `ls` — List files and directories in current directory

```bash
ls
```

### Data Processing Commands

#### 1. `csv-to-json` — Convert CSV to JSON

```bash
csv-to-json --input data.csv --output data.json
```

- `--input` — path to the input CSV file (**required**)
- `--output` — path to the output JSON file (**required**)

#### 2. `json-to-csv` — Convert JSON to CSV

Convert a JSON file (array of objects) to a CSV file using Streams.

- `--input` — path to the input JSON file (**required**)
- `--output` — path to the output CSV file (**required**)

#### 3. `count` — Count lines, words, and characters in txt file

Count lines, words, and characters in a file (similar to the `wc` command).

```bash
count --input file.txt
```

- `--input` — path to the input file (**required**)

#### 4. `hash` — Calculate file hash

Calculate a cryptographic hash of a file.

```bash
hash --input file.txt
hash --input file.txt --algorithm md5
hash --input file.txt --save
```

- `--input` — path to the input file (**required**)
- `--algorithm` — hash algorithm to use (optional, default: `sha256`). Supported values: `sha256`, `md5`, `sha512`
- `--save` — optional flag; if provided, save hash to a file next to the source file

#### 5. `hash-compare` — Compare file hash with expected hash

Calculate file hash and compare it with a value stored in a hash file.

```bash
hash-compare --input file.txt --hash file.txt.sha256
hash-compare --input file.txt --hash file.txt.md5 --algorithm md5
```

- `--input` — path to the input file (**required**)
- `--hash` — path to file with expected hash (**required**)
- `--algorithm` — hash algorithm to use (optional, default: `sha256`). Supported values: `sha256`, `md5`, `sha512`

#### 6. `encrypt` — Encrypt a file

Encrypt a file using `AES-256-GCM`.

```bash
encrypt --input file.txt --output file.txt.enc --password mySecret
```

- `--input` — path to the input file (**required**)
- `--output` — path to the output encrypted file (**required**)
- `--password` — password used to derive the encryption key (**required**)

#### 7. `decrypt` — Decrypt a file

Decrypt a file produced by `encrypt`.

```bash
decrypt --input file.txt.enc --output file.txt --password mySecret
```

- `--input` — path to the input encrypted file (**required**)
- `--output` — path to the output file (**required**)
- `--password` — password used to derive the encryption key (**required**)

#### 8. `log-stats` — Analyze a large log file using Worker Threads

Compute statistics for a large log file using Worker Threads for parallel processing.

```bash
log-stats --input logs.txt --output stats.json
```

- `--input` — path to the input log file (**required**)
- `--output` — path to the output JSON file (**required**)

**Log line format (space-separated):**

```
<isoTimestamp> <level> <service> <statusCode> <responseTimeMs> <method> <path>
```

**Example line:**

```
2026-02-01T12:34:56.789Z INFO user-service 200 123 GET /api/users
```

**Output format (JSON):**

```
{
  "total": 1000,
  "levels": { "INFO": 700, "WARN": 200, "ERROR": 100 },
  "status": { "2xx": 800, "3xx": 50, "4xx": 120, "5xx": 30 },
  "topPaths": [
    { "path": "/api/users", "count": 120 },
    { "path": "/api/orders", "count": 95 }
  ],
  "avgResponseTimeMs": 137.42
}
```
