import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const args = process.argv.slice(2);

function run(cmd: string) {
  execSync(cmd, { stdio: "inherit" });
}

// Clean up old lib
if (fs.existsSync("lib")) {
  fs.rmdirSync("lib", { recursive: true });
}

// Compile CommonJS
run("tsc --outDir lib/cjs --module commonjs");

// Compile ES Modules
run("tsc --outDir lib/esm --module esnext");

// Move declaration files
fs.readdirSync("lib/esm").forEach((file) => {
  if (file.endsWith(".d.ts")) {
    fs.renameSync(path.join("lib/esm", file), path.join("lib/cjs", file));
  }
});

// Create package.json for CommonJS and ES Modules
fs.writeFileSync(
  "lib/cjs/package.json",
  JSON.stringify({ type: "commonjs" }, null, 2)
);
fs.writeFileSync(
  "lib/esm/package.json",
  JSON.stringify({ type: "module" }, null, 2)
);
run("rm -rf ./build.js");

