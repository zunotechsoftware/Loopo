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
    
    // Replace InputProps={{ with slotProps={{ input: {
    // and matching braces is tricky with regex, but all our InputProps are just simple objects.
    // Easiest is just string replacement: InputProps={{ -> slotProps={{ input: {
    // Wait, the closing brace of InputProps needs to be adjusted.
    // If we just change `InputProps={{` to `slotProps={{ input: {` we need to add an extra closing `}` at the end of the prop block.
    // Let's use a regex to capture the whole prop: InputProps=\{\{([\s\S]*?)\}\}
    
    const regex = /InputProps=\{\{([\s\S]*?)\}\}/g;
    let newContent = content.replace(regex, 'slotProps={{ input: { $1 } }}');
    
    if (newContent !== content) {
        fs.writeFileSync(file, newContent, 'utf8');
        count++;
        console.log(`Updated ${file}`);
    }
});

console.log(`Updated ${count} files.`);
