
import fs from 'fs';
import path from 'path';

const filePath = path.join(__dirname, '../public/QAF.txt');
const content = fs.readFileSync(filePath, { encoding: 'utf16le' });
const lines = content.split(/\r?\n/);

console.log('Header Columns:', lines[0].split('\t').map(c => c.trim()));
console.log('First Data Line Columns:', lines[1].split('\t').map(c => c.trim()));
