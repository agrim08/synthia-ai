const fs = require('fs');
let content = fs.readFileSync('d:/synthia/src/app/documentation/page.tsx', 'utf8');

// Replace imports
content = content.replace(
  'import { Logo } from "@/components/Logo";',
  'import { Logo } from "@/components/Logo";\nimport { ThemeToggle } from "@/components/ThemeToggle";'
);

// Add ThemeToggle
content = content.replace(
  '<div className="flex items-center gap-3">',
  '<div className="flex items-center gap-3">\n          <ThemeToggle />'
);

// Global background and text
content = content.replace(/bg-\[#0a0a0a\]/g, 'bg-background');
content = content.replace(/text-zinc-100/g, 'text-foreground');

// Borders
content = content.replace(/border-zinc-800\/60/g, 'border-border');
content = content.replace(/border-zinc-800\/50/g, 'border-border');
content = content.replace(/border-zinc-800/g, 'border-border');
content = content.replace(/border-zinc-700/g, 'border-border');

// Backgrounds
content = content.replace(/bg-zinc-900\/60/g, 'bg-muted/60');
content = content.replace(/bg-zinc-900\/20/g, 'bg-muted/20');
content = content.replace(/bg-zinc-900/g, 'bg-muted');
content = content.replace(/bg-zinc-800\/70/g, 'bg-muted');
content = content.replace(/bg-zinc-800/g, 'bg-muted');
content = content.replace(/bg-zinc-950/g, 'bg-background');
content = content.replace(/bg-black\/60/g, 'bg-foreground/20');

// Text colors
content = content.replace(/text-white/g, 'text-foreground');
content = content.replace(/text-zinc-200/g, 'text-foreground');
content = content.replace(/text-zinc-300/g, 'text-foreground');
content = content.replace(/text-zinc-400/g, 'text-muted-foreground');
content = content.replace(/text-zinc-500/g, 'text-muted-foreground');
content = content.replace(/text-zinc-600/g, 'text-muted-foreground');
content = content.replace(/text-zinc-950/g, 'text-background');

// specific cases
content = content.replace(/bg-white/g, 'bg-foreground');

fs.writeFileSync('d:/synthia/src/app/documentation/page.tsx', content);
console.log('Replacements completed.');
