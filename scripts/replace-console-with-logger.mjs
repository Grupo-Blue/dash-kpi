#!/usr/bin/env node

/**
 * Script to replace console.log/error/warn/debug with logger calls
 * 
 * Usage: node scripts/replace-console-with-logger.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files to process
const SERVER_DIR = path.join(__dirname, '../server');

// Track statistics
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  replacements: {
    'console.log': 0,
    'console.error': 0,
    'console.warn': 0,
    'console.debug': 0,
  },
};

/**
 * Check if file should be processed
 */
function shouldProcessFile(filePath) {
  // Skip node_modules, dist, build
  if (filePath.includes('node_modules') || filePath.includes('dist') || filePath.includes('build')) {
    return false;
  }
  
  // Only process .ts files
  if (!filePath.endsWith('.ts')) {
    return false;
  }
  
  // Skip the logger file itself
  if (filePath.includes('logger.ts')) {
    return false;
  }
  
  // Skip the secureLogger file (old implementation)
  if (filePath.includes('secureLogger.ts')) {
    return false;
  }
  
  return true;
}

/**
 * Check if file already imports logger
 */
function hasLoggerImport(content) {
  return /import\s+.*logger.*from\s+['"].*logger/.test(content);
}

/**
 * Add logger import to file
 */
function addLoggerImport(content, filePath) {
  // Calculate relative path to logger
  const fileDir = path.dirname(filePath);
  const loggerPath = path.join(SERVER_DIR, 'utils/logger.ts');
  let relativePath = path.relative(fileDir, loggerPath);
  
  // Convert to Unix-style path and remove .ts extension
  relativePath = relativePath.replace(/\\/g, '/').replace(/\.ts$/, '');
  
  // Ensure it starts with ./
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath;
  }
  
  // Find the last import statement
  const importRegex = /^import\s+.*from\s+['"].*['"];?\s*$/gm;
  const imports = content.match(importRegex);
  
  if (imports && imports.length > 0) {
    // Add after last import
    const lastImport = imports[imports.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport);
    const insertPosition = lastImportIndex + lastImport.length;
    
    return content.slice(0, insertPosition) + 
           `\nimport { logger } from '${relativePath}';` +
           content.slice(insertPosition);
  } else {
    // No imports found, add at the beginning
    return `import { logger } from '${relativePath}';\n\n` + content;
  }
}

/**
 * Replace console calls with logger calls
 */
function replaceConsoleCalls(content) {
  let modified = content;
  let hasChanges = false;
  
  // Replace console.log with logger.info
  const logMatches = modified.match(/console\.log\(/g);
  if (logMatches) {
    stats.replacements['console.log'] += logMatches.length;
    modified = modified.replace(/console\.log\(/g, 'logger.info(');
    hasChanges = true;
  }
  
  // Replace console.error with logger.error
  const errorMatches = modified.match(/console\.error\(/g);
  if (errorMatches) {
    stats.replacements['console.error'] += errorMatches.length;
    modified = modified.replace(/console\.error\(/g, 'logger.error(');
    hasChanges = true;
  }
  
  // Replace console.warn with logger.warn
  const warnMatches = modified.match(/console\.warn\(/g);
  if (warnMatches) {
    stats.replacements['console.warn'] += warnMatches.length;
    modified = modified.replace(/console\.warn\(/g, 'logger.warn(');
    hasChanges = true;
  }
  
  // Replace console.debug with logger.debug
  const debugMatches = modified.match(/console\.debug\(/g);
  if (debugMatches) {
    stats.replacements['console.debug'] += debugMatches.length;
    modified = modified.replace(/console\.debug\(/g, 'logger.debug(');
    hasChanges = true;
  }
  
  return { modified, hasChanges };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  stats.filesProcessed++;
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file has console calls
  if (!/console\.(log|error|warn|debug)\(/.test(content)) {
    return; // No console calls, skip
  }
  
  let modified = content;
  
  // Add logger import if not present
  if (!hasLoggerImport(modified)) {
    modified = addLoggerImport(modified, filePath);
  }
  
  // Replace console calls
  const { modified: replacedContent, hasChanges } = replaceConsoleCalls(modified);
  
  if (hasChanges) {
    fs.writeFileSync(filePath, replacedContent, 'utf8');
    stats.filesModified++;
    console.log(`✅ Modified: ${path.relative(SERVER_DIR, filePath)}`);
  }
}

/**
 * Recursively process directory
 */
function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && shouldProcessFile(fullPath)) {
      processFile(fullPath);
    }
  }
}

/**
 * Main execution
 */
console.log('🔄 Starting console.log replacement...\n');

processDirectory(SERVER_DIR);

console.log('\n📊 Replacement Statistics:');
console.log(`   Files processed: ${stats.filesProcessed}`);
console.log(`   Files modified: ${stats.filesModified}`);
console.log(`   Replacements:`);
console.log(`     console.log → logger.info: ${stats.replacements['console.log']}`);
console.log(`     console.error → logger.error: ${stats.replacements['console.error']}`);
console.log(`     console.warn → logger.warn: ${stats.replacements['console.warn']}`);
console.log(`     console.debug → logger.debug: ${stats.replacements['console.debug']}`);
console.log(`   Total replacements: ${Object.values(stats.replacements).reduce((a, b) => a + b, 0)}`);

console.log('\n✅ Done!');
