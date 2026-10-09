const fs = require('node:fs');
const path = require('node:path');

for (const directory of ['../data', '../uploads']) {
  fs.mkdirSync(path.resolve(__dirname, directory), { recursive: true });
}
