const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('./src/screens', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Replace edges={['top', 'left', 'right']} with edges={['top', 'bottom', 'left', 'right']}
    if (content.includes("edges={['top', 'left', 'right']}")) {
      content = content.replace(/edges=\{\['top', 'left', 'right'\]\}/g, "edges={['top', 'bottom', 'left', 'right']}");
      changed = true;
    }
    
    // Replace edges={["top"]} with edges={["top", "bottom", "left", "right"]}
    if (content.includes('edges={["top"]}')) {
      content = content.replace(/edges=\{\["top"\]\}/g, 'edges={["top", "bottom", "left", "right"]}');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
