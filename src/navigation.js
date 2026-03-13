import { readdir } from "node:fs/promises";
import path from "node:path";

function upDir() {
  const pathToNavigate = path.resolve("..");
  process.chdir(pathToNavigate);
  console.log("You have been navigated to:", pathToNavigate);
}

function changeDir(args) {
  const pathToNavigate = path.resolve(args.path);

  try {
    process.chdir(pathToNavigate);
    console.log("You have been navigated to:", pathToNavigate);
  } catch (eror) {
    console.log("Operation failed");
  }
}

async function listFilesAndDirs() {
  const pathToNavigate = path.resolve(".");

  const dirents = await readdir(pathToNavigate, { withFileTypes: true });

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
