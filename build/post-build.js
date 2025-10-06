const fs = require("node:fs");
const path = require("node:path");
const proc = require("node:child_process");

function executeCommand(command) {
  return proc.execSync(command).toString().trim();
}

const commit = {
  sha: executeCommand("git rev-parse HEAD"),
  message: executeCommand("git log -1 --pretty=%B"),
  author: executeCommand("git log -1 --pretty=format:%an"),
};

const json = JSON.stringify(commit);

fs.writeFileSync(path.resolve(__dirname, "../dist/commit.json"), json);
