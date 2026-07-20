const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
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
    
    // Replace <Grid item xs={X} sm={Y} ...> with <Grid size={{ xs: X, sm: Y, ... }}>
    const gridItemRegex = /<Grid\s+item\s+([^>]+)>/g;
    let newContent = content.replace(gridItemRegex, (match, props) => {
        // extract xs, sm, md, lg, xl props
        const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl'];
        let sizeObj = [];
        let otherProps = props;
        
        breakpoints.forEach(bp => {
            const bpRegex = new RegExp(`${bp}={([^}]+)}|${bp}="([^"]+)"|${bp}=([^\\s>]+)`);
            const bpMatch = otherProps.match(bpRegex);
            if (bpMatch) {
                const val = bpMatch[1] || bpMatch[2] || bpMatch[3];
                sizeObj.push(`${bp}: ${val}`);
                otherProps = otherProps.replace(bpMatch[0], '');
            }
        });
        
        otherProps = otherProps.replace(/\s+/g, ' ').trim();
        
        if (sizeObj.length > 0) {
            return `<Grid size={{ ${sizeObj.join(', ')} }} ${otherProps}>`;
        }
        return `<Grid ${otherProps}>`;
    });
    
    if (newContent !== content) {
        fs.writeFileSync(file, newContent, 'utf8');
        changedCount++;
        console.log(`Updated ${file}`);
    }
});

console.log(`Updated ${changedCount} files.`);
