import * as fs from "fs-extra";
import * as path from "path";

import * as constants from "../constants";

export async function getFolderNamesAtDirectory(directoryPath: string): Promise<string[]> {

  const directoryContents = await fs.readdir(directoryPath);

  const directoryContentInfo = await Promise.all(
    directoryContents.map(async (f) => {
      const folderPath = path.join(directoryPath, f);
      const stats = await fs.stat(folderPath);
      return {
        folderName: f,
        isDirectory: stats.isDirectory(),
      };
    }),
  );

  const folderNames = directoryContentInfo
    .filter(info => info.isDirectory)
    .map(info => info.folderName);

  return folderNames;
}

export async function getTemplateFileNamesAtTemplateDirectory(templateFolderPath: string): Promise<string[]> {
  const directoryContents = await fs.readdir(templateFolderPath);

  const directoryContentInfo = await Promise.all(
    directoryContents.map(async (f) => {
      const folderPath = path.join(templateFolderPath, f);
      const stats = await fs.stat(folderPath);
      return {
        fileName: f,
        isDirectory: stats.isDirectory(),
      };
    }),
  );

  const files = directoryContentInfo
    .filter(info => !info.isDirectory)
    .map(info => info.fileName)
    .filter((f) => !shouldIgnoreFileName(f));
  return files;
}

function shouldIgnoreFileName(fileName: string): boolean {

  const ignoredFileNames = [
    ".DS_Store",
    ".DS_Store?",
    "._*",
    ".Spotlight-V100",
    ".Trashes",
    "ehthumbs.db",
    "Thumbs.db",
    constants.MANIFEST_FILE_NAME,
  ];

  return ignoredFileNames.some(ignoredFileName => fileName.startsWith(ignoredFileName));

}
