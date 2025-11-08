import { getUserAgentRegExp } from "browserslist-useragent-regexp";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const userAgentRegExp = getUserAgentRegExp({ allowHigherVersions: true });
const checkFunction = `export const supportedBrowsers = ${userAgentRegExp.toString()};`;
writeFileSync(resolve(import.meta.dirname, "../src/supported-browsers.js"), checkFunction);

const firebaseConfig = process.env.FIREBASE_CONFIG;
if (firebaseConfig) {
  writeFileSync(
    resolve(import.meta.dirname, "../src/core/storage/firebase-config.js"),
    `export const firebaseConfig = ${firebaseConfig};`,
  );
}
