import { readdir } from "node:fs/promises";
import {
  resolvePath,
  setCurrentDir,
  getCurrentDir,
  checkPath,
} from "./utils/pathResolver.js";

function upDir() {
  try {
    const newDir = resolvePath("..");
    setCurrentDir(newDir);
  } catch {
    console.log("Operation failed");
  }
}

async function changeDir(args) {
  try {
    const newDir = resolvePath(args.path);

    const exists = await checkPath(newDir);

    if (!exists) {
      console.log("Operation failed");
      return;
    }
    setCurrentDir(newDir);
  } catch {
    console.log("Operation failed");
  }
}

async function listFilesAndDirs() {
  const pathToList = getCurrentDir();

  const dirents = await readdir(pathToList, { withFileTypes: true });

  const direntsWithTypes = dirents.map((dirent) => {
    const direntType = dirent.isFile() ? "[file]" : "[folder]";
    return [dirent.name, direntType];
  });

  direntsWithTypes.sort((a, b) => {
    if (a[1] !== b[1]) {
      return a[1] === "[folder]" ? -1 : 1;
    }
    return a[0].localeCompare(b[0]);
  });

  direntsWithTypes.forEach((file) => console.log(file.join("  ")));
}

export { upDir, changeDir, listFilesAndDirs };
