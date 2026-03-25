import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, 'src');

function walk(dir, call) {
  for (const f of fs.readdirSync(dir)) {
    const fPath = path.join(dir, f);
    if (fs.statSync(fPath).isDirectory()) walk(fPath, call);
    else call(fPath);
  }
}

walk(srcDir, (f) => {
  if (!f.endsWith('.ts') && !f.endsWith('.tsx')) return;
  let code = fs.readFileSync(f, 'utf8');
  
  // Convert standard imports
  code = code.replace(/from\s+['"](\.\.?\/[^'"]+)['"]/g, (match, relPath) => {
    const absPath = path.resolve(path.dirname(f), relPath);
    if (absPath.startsWith(srcDir)) {
      const aliasPath = '@/' + path.relative(srcDir, absPath).replace(/\\/g, '/');
      return `from '${aliasPath}'`;
    }
    return match;
  });

  // Convert dynamic imports
  code = code.replace(/import\(['"](\.\.?\/[^'"]+)['"]\)/g, (match, relPath) => {
    const absPath = path.resolve(path.dirname(f), relPath);
    if (absPath.startsWith(srcDir)) {
      const aliasPath = '@/' + path.relative(srcDir, absPath).replace(/\\/g, '/');
      return `import('${aliasPath}')`;
    }
    return match;
  });

  fs.writeFileSync(f, code);
});

console.log('Converted all local imports to use @/ alias (which is immune to folder movements!).');
