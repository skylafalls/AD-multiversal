import { execSync } from "node:child_process";
import { resolve } from "node:path";
import { writeFileSync } from "node:fs";

function executeCommand(command) {
  return execSync(command).toString().trim();
}

const commit = {
  sha: executeCommand("git rev-parse HEAD"),
  message: executeCommand("git log -1 --pretty=%B"),
  author: executeCommand("git log -1 --pretty=format:%an"),
};

const json = JSON.stringify(commit);

writeFileSync(resolve(import.meta.dirname, "../dist/commit.json"), json);
