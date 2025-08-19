#!/usr/bin/env node

/**
 * Security Check Script
 * 
 * This script helps identify potential secrets before committing to Git.
 * Run this before pushing to GitHub to prevent secret detection issues.
 */

const fs = require('fs');
const path = require('path');

// Patterns that might indicate secrets
const SECRET_PATTERNS = [
  /sk_test_[a-zA-Z0-9]{24,}/g,  // Stripe test secret key
  /sk_live_[a-zA-Z0-9]{24,}/g,  // Stripe live secret key
  /pk_test_[a-zA-Z0-9]{24,}/g,  // Stripe test publishable key
  /pk_live_[a-zA-Z0-9]{24,}/g,  // Stripe live publishable key
  /whsec_[a-zA-Z0-9]{32,}/g,    // Stripe webhook secret
  /rk_test_[a-zA-Z0-9]{24,}/g,  // Stripe restricted key test
  /rk_live_[a-zA-Z0-9]{24,}/g,  // Stripe restricted key live
  /-----BEGIN PRIVATE KEY-----/g, // Private keys
  /"private_key":\s*"[^"]+"/g,   // JSON private keys
];

// Files to ignore (already in .gitignore or documentation)
const IGNORE_FILES = [
  '.gitignore',
  'SECURITY.md',
  'DEPLOYMENT.md',
  'PRODUCTION_READINESS_CHECKLIST.md',
  'README.md',
  'check-secrets.js'
];

// Directories to ignore
const IGNORE_DIRS = [
  'node_modules',
  '.git',
  'build',
  'dist',
  '.firebase'
];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    if (IGNORE_FILES.includes(fileName)) {
      return [];
    }
    
    const findings = [];
    
    SECRET_PATTERNS.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          findings.push({
            file: filePath,
            pattern: pattern.toString(),
            match: match.substring(0, 20) + '...', // Truncate for safety
            line: content.substring(0, content.indexOf(match)).split('\n').length
          });
        });
      }
    });
    
    return findings;
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}:`, error.message);
    return [];
  }
}

function scanDirectory(dirPath) {
  const findings = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        if (!IGNORE_DIRS.includes(item)) {
          findings.push(...scanDirectory(itemPath));
        }
      } else if (stat.isFile()) {
        findings.push(...scanFile(itemPath));
      }
    });
  } catch (error) {
    console.warn(`Warning: Could not scan directory ${dirPath}:`, error.message);
  }
  
  return findings;
}

function main() {
  console.log('🔍 Scanning for potential secrets...');
  console.log('');
  
  const projectRoot = path.resolve(__dirname, '..');
  const findings = scanDirectory(projectRoot);
  
  if (findings.length === 0) {
    console.log('✅ No potential secrets found!');
    console.log('✅ Project appears safe to push to GitHub.');
    process.exit(0);
  } else {
    console.log('⚠️  Potential secrets detected:');
    console.log('');
    
    findings.forEach(finding => {
      console.log(`❌ File: ${finding.file}`);
      console.log(`   Line: ${finding.line}`);
      console.log(`   Pattern: ${finding.pattern}`);
      console.log(`   Match: ${finding.match}`);
      console.log('');
    });
    
    console.log('🚨 DO NOT push to GitHub until these issues are resolved!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Remove or replace actual secrets with environment variables');
    console.log('2. Add sensitive files to .gitignore');
    console.log('3. Run this script again to verify');
    console.log('4. See SECURITY.md for detailed guidance');
    
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { scanDirectory, scanFile, SECRET_PATTERNS };