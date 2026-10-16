const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function resolveTsFile(baseDir, id) {
  const tsPath = path.resolve(baseDir, `${id}.ts`);
  if (fs.existsSync(tsPath)) return tsPath;
  const tsxPath = path.resolve(baseDir, `${id}.tsx`);
  if (fs.existsSync(tsxPath)) return tsxPath;
  return tsPath;
}

function loadModule(relative, mocks = {}, globals = {}) {
  const filename = path.resolve(__dirname, '../..', relative);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports, URL, AbortController, setTimeout, clearTimeout, ...globals,
    require: id => {
      if (id in mocks) return mocks[id];
      if (id === 'zustand') return require('zustand');
      if (id.startsWith('.')) {
        const resolvedPath = resolveTsFile(path.dirname(filename), id);
        return loadModule(path.relative(path.resolve(__dirname, '../..'), resolvedPath), mocks, globals);
      }
      throw new Error(`Unexpected dependency: ${id}`);
    },
  }, { filename });
  return exports;
}
module.exports = { loadModule };
