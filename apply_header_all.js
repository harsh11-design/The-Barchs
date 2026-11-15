const fs = require('fs');
const path = require('path');
const { getHeaderMarkup } = require('./header_component');

function processDir(rootDir, basePrefix = '') {
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name.startsWith('.')) {
      continue;
    }
    if (entry.name === 'reference_original.html' || entry.name === 'Printable_BCA_Semester_1_Master_Notes.html') {
      continue;
    }

    const fullPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      processDir(fullPath, basePrefix ? `${basePrefix}/${entry.name}` : entry.name);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      processHtmlFile(fullPath, rootDir, basePrefix);
    }
  }
}

function processHtmlFile(filePath, rootDir, relativeSubpath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Determine depth relative to website root
  // If filePath is inside barchs-site/, calculate depth relative to barchs-site/
  let depth = 0;
  const normalized = filePath.replace(/\\/g, '/');
  
  if (normalized.includes('/barchs-site/')) {
    const afterBarchs = normalized.split('/barchs-site/')[1];
    const segments = afterBarchs.split('/').filter(Boolean);
    depth = segments.length - 1; // index.html is 0, services/index.html is 1, services/foo/index.html is 2
  } else {
    // Relative to workspace root
    const workspaceRoot = 'c:/Users/harsh/Downloads/thirfted muse';
    const relative = path.relative(workspaceRoot, filePath).replace(/\\/g, '/');
    const segments = relative.split('/').filter(Boolean);
    depth = segments.length - 1;
  }

  if (depth < 0) depth = 0;
  const rel = depth === 0 ? './' : depth === 1 ? '../' : '../../';

  // 1. Generate new header markup for this depth
  const headerHtml = getHeaderMarkup(depth);

  // 2. Replace old nav and announcement bar
  if (content.includes('<!-- BARCHS_HEADER_START -->') && content.includes('<!-- BARCHS_HEADER_END -->')) {
    const startTag = '<!-- BARCHS_HEADER_START -->';
    const endTag = '<!-- BARCHS_HEADER_END -->';
    const sIdx = content.indexOf(startTag);
    const eIdx = content.indexOf(endTag) + endTag.length;
    content = content.slice(0, sIdx) + headerHtml + content.slice(eIdx);
  } else {
    // Legacy cleanup: find start
    const startMarkers = [
      '<!-- Top Announcement Bar -->',
      '<div class="top-announcement-bar"',
      '<div class="bar">',
      '<header class="barchs-header"',
      '<nav'
    ];
    let startIdx = -1;
    for (const marker of startMarkers) {
      const idx = content.indexOf(marker);
      if (idx !== -1 && (startIdx === -1 || idx < startIdx)) {
        startIdx = idx;
      }
    }

    if (startIdx !== -1) {
      let endIdx = -1;
      const drawerMarker = 'class="mobile-nav-drawer"';
      const drawerIdx = content.indexOf(drawerMarker);
      if (drawerIdx !== -1 && drawerIdx > startIdx) {
        const afterDrawer = content.slice(drawerIdx);
        const nextMatch = afterDrawer.match(/<\/div>\s*<\/div>\s*(?=<section|<main|<div\s+class=|<footer|<h1)/i);
        if (nextMatch) {
          endIdx = drawerIdx + nextMatch.index + nextMatch[0].length;
        }
      }
      
      if (endIdx === -1) {
        const headerEnd = content.indexOf('</header>', startIdx);
        if (headerEnd !== -1) {
          endIdx = headerEnd + '</header>'.length;
        } else {
          const navEnd = content.indexOf('</nav>', startIdx);
          if (navEnd !== -1) {
            endIdx = navEnd + '</nav>'.length;
          }
        }
      }

      if (endIdx !== -1) {
        content = content.slice(0, startIdx) + headerHtml + content.slice(endIdx);
      } else {
        content = content.replace(/<body[^>]*>/i, (m) => `${m}\n${headerHtml}`);
      }
    } else {
      content = content.replace(/<body[^>]*>/i, (m) => `${m}\n${headerHtml}`);
    }
  }

  // 3. Ensure header.css is linked in <head>
  const headerCssHref = `${rel}assets/header.css`;
  if (!content.includes('header.css')) {
    content = content.replace(/<\/head>/i, `<link rel="stylesheet" href="${headerCssHref}">\n</head>`);
  }

  // 4. Ensure header.js is included before </body>
  const headerJsSrc = `${rel}assets/header.js`;
  if (!content.includes('header.js')) {
    content = content.replace(/<\/body>/i, `<script src="${headerJsSrc}"></script>\n</body>`);
  }

  // 5. If this is index.html, remove obsolete dynamic header injection code
  if (filePath.endsWith('index.html') && depth === 0) {
    // Remove the snippet that created .mb, .acts, .dd, etc.
    const oldScriptSnippet = /var\s+nav\s*=\s*document\.querySelector\('nav'\)[\s\S]*?li\.classList\.add\('has-dd'\);li\.appendChild\(s\)\}/;
    if (oldScriptSnippet.test(content)) {
      content = content.replace(oldScriptSnippet, '/* legacy nav script replaced by header.js */');
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated header in: ${normalized} (depth: ${depth})`);
}

// Execute for workspace root and barchs-site
const workspaceRoot = 'c:/Users/harsh/Downloads/thirfted muse';
processDir(workspaceRoot);
console.log('Finished updating all HTML files.');
