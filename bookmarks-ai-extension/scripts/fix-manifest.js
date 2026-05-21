import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');

// Find the actual background script
const assetsDir = path.join(distDir, 'assets');
const files = fs.readdirSync(assetsDir);
const backgroundFile = files.find(f => f.startsWith('background-') && f.endsWith('.js'));

// Read the manifest
const manifestPath = path.join(distDir, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

// Update paths
manifest.action.default_popup = 'src/popup/index.html';
manifest.background.service_worker = `assets/${backgroundFile}`;

// Copy assets from public
const publicAssets = path.join('public', 'assets');
if (fs.existsSync(publicAssets)) {
  fs.cpSync(publicAssets, path.join(distDir, 'assets'), { recursive: true });
}

// Write updated manifest
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log('Manifest updated with correct paths:');
console.log('- popup:', manifest.action.default_popup);
console.log('- background:', manifest.background.service_worker);
