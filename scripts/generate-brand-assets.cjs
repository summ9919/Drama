const fs = require('node:fs');
const path = require('node:path');
const { Resvg } = require('@resvg/resvg-js');

const assets = path.resolve(__dirname, '../assets');
const source = fs.readFileSync(path.join(assets, 'pony-icon.svg'), 'utf8');
const background = '<rect width="512" height="512" fill="#e5ce4d"/>';
if (!source.includes(background)) throw new Error('Expected solid brand background');

function render(name, svg, size) {
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();
  fs.writeFileSync(path.join(assets, name), png);
  console.log(`${name}: ${size} × ${size}`);
}

for (const [name, size] of Object.entries({
  'icon.png': 1024,
  'favicon.png': 64,
  'icon-hd-v2.png': 2048,
  'icon-hd-original-ratio.png': 2048,
  'logo-hd-v2.png': 2048,
})) render(name, source, size);

// Center the complete pony inside the Android adaptive icon's safe area.
// The launcher supplies the solid yellow background and its own corner mask.
const foreground = source.replace(background, '<g transform="translate(64 64) scale(.75)">')
  .replace('</svg>', '</g></svg>');
render('adaptive-icon.png', foreground, 1024);
