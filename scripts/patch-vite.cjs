const fs = require("fs");
const path = require("path");

if (!__dirname.includes("#")) {
  console.log('[patch-vite] Caminho sem "#": nenhum ajuste necessário.');
  process.exit(0);
}

const filesToPatch = [
  path.resolve(__dirname, "../node_modules/vite/dist/node/chunks/node.js"),
  path.resolve(__dirname, "../node_modules/vite/dist/node/module-runner.js"),
];

let patchedCount = 0;

for (const filePath of filesToPatch) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, "utf-8");
    if (content.includes("const postfixRE = /[?#].*$/;")) {
      content = content.replace("const postfixRE = /[?#].*$/;", "const postfixRE = /\\?.*$/;");
      fs.writeFileSync(filePath, content, "utf-8");
      patchedCount++;
      console.log(`[patch-vite] Patched ${path.basename(filePath)} successfully.`);
    } else {
      console.log(
        `[patch-vite] Already patched or pattern not found in ${path.basename(filePath)}.`
      );
    }
  }
}
