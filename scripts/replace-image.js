const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('app/admin');
let replacements = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  if (content.includes('import Image from "next/image"') || content.includes("import Image from 'next/image'")) {
    content = content.replace(/import Image from ["']next\/image["'];?/g, 'import { SafeImage } from "@/components/ui/safe-image";');
    content = content.replace(/<Image /g, '<SafeImage useNextImage={true} ');
    fs.writeFileSync(file, content);
    replacements++;
    console.log('Updated ' + file);
  }
});
console.log('Replaced ' + replacements + ' files');
