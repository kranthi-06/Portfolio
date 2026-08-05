const fs = require('fs');
const files = [
  'app/admin/(dashboard)/certificates/page.tsx',
  'app/admin/(dashboard)/events/page.tsx',
  'app/admin/(dashboard)/gallery/page.tsx',
  'app/admin/(dashboard)/media/page.tsx',
  'app/admin/(dashboard)/page.tsx'
];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  // Remove lingering Image imports if any
  content = content.replace(/import Image from ["']next\/image["'];?\n?/g, '');

  if (content.includes('<SafeImage') && !content.includes('import { SafeImage }')) {
    content = 'import { SafeImage } from "@/components/ui/safe-image";\n' + content;
    fs.writeFileSync(file, content);
    console.log('Added import to ' + file);
  }
});
