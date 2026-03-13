import path from "node:path";
import { access } from "node:fs/promises";
import { homedir } from "node:os";

let currentDir = homedir();

function resolvePath(p) {
  return path.resolve(currentDir, p);
}

async function checkPath(p) {
  try {
    await access(resolvePath(p));
    return true;
  } catch {
    return false;
  }
}

function setCurrentDir(newDir) {
  currentDir = resolvePath(newDir);
}

function getCurrentDir() {
  return currentDir;
}

export { resolvePath, checkPath, setCurrentDir, getCurrentDir };
