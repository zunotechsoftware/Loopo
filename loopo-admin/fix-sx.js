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
    
    // Generic regex for merging sx={{ A }} sx={{ B }} -> sx={{ A, B }}
    const genericSxRegex = /sx=\{\{([^}]+)\}\}\s*sx=\{\{([^}]+)\}\}/g;
    let newContent = content.replace(genericSxRegex, (match, sx1, sx2) => {
        return `sx={{ ${sx1.trim()}, ${sx2.trim()} }}`;
    });
    
    // Run it twice in case there are 3 sx props
    newContent = newContent.replace(genericSxRegex, (match, sx1, sx2) => {
        return `sx={{ ${sx1.trim()}, ${sx2.trim()} }}`;
    });

    if (newContent !== content) {
        fs.writeFileSync(file, newContent, 'utf8');
        changedCount++;
        console.log(`Updated ${file}`);
    }
});

console.log(`Updated ${changedCount} files.`);
