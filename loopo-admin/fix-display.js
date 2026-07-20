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
let count = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace display="block"
    content = content.replace(/display="block"/g, "sx={{ display: 'block' }}");
    
    // Replace textAlign="center"
    content = content.replace(/textAlign="center"/g, "sx={{ textAlign: 'center' }}");

    if (content !== fs.readFileSync(file, 'utf8')) {
        fs.writeFileSync(file, content, 'utf8');
        count++;
        console.log(`Updated ${file}`);
    }
});

console.log(`Updated ${count} files.`);
