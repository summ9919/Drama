const fs = require('node:fs');
const path = require('node:path');
const { loadModule } = require('./helpers/load-ts.cjs');
const { GUIDANCE_SCHEMA } = loadModule('src/constants/guidanceProtocol.ts');
const destination = path.resolve(__dirname, '../docs/camera-guidance-v3.schema.json');
fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.writeFileSync(destination, `${JSON.stringify(GUIDANCE_SCHEMA, null, 2)}\n`);
console.log(destination);
