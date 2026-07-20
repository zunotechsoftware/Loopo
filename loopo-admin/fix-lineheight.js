const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        if (fs.statSync(file).isDirectory()) {
            results = results.concat(walkDir(file));
        } else {
            if (file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walkDir(path.join(__dirname, 'src'));
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace lineHeight={1.2} with sx={{ lineHeight: 1.2 }}
    const lineHeightRegex = /lineHeight=\{([^}]+)\}/g;
    let newContent = content.replace(lineHeightRegex, (match, val) => {
        return `sx={{ lineHeight: ${val} }}`;
    });

    if (newContent !== content) {
        fs.writeFileSync(file, newContent, 'utf8');
        changedCount++;
        console.log(`Updated ${file}`);
    }
});

console.log(`Updated ${changedCount} files.`);
