#!/usr/bin/env tsx
/**
 * Automated build error fixer
 * Parses build output and attempts to fix common errors
 * Type-related errors are reported but not auto-fixed
 */

import fs from "fs/promises";
import path from "path";

interface BuildError {
  file: string;
  line: number;
  column: number;
  rule: string;
  message: string;
}

// Type-related error rules that should not be auto-fixed
const TYPE_ERROR_RULES = [
  "@typescript-eslint/no-explicit-any",
  "@typescript-eslint/no-unsafe-assignment",
  "@typescript-eslint/no-unsafe-member-access",
  "@typescript-eslint/no-unsafe-call",
  "@typescript-eslint/no-unsafe-return",
  "@typescript-eslint/no-unsafe-argument",
];

async function main() {
  const buildOutput = process.argv[2] || "";

  if (!buildOutput) {
    console.log("No build output provided");
    process.exit(0);
  }

  console.log("🔍 Analyzing build errors...");

  const errors = parseBuildErrors(buildOutput);

  if (errors.length === 0) {
    console.log("No errors found");
    process.exit(0);
  }

  // Separate type errors from fixable errors
  const typeErrors = errors.filter((e) => TYPE_ERROR_RULES.includes(e.rule));
  const fixableErrors = errors.filter((e) => !TYPE_ERROR_RULES.includes(e.rule));

  if (typeErrors.length > 0) {
    console.log(`\n❌ Found ${typeErrors.length} type errors that require manual fixing:`);
    reportTypeErrors(typeErrors);
  }

  if (fixableErrors.length > 0) {
    console.log(`\n🔧 Found ${fixableErrors.length} auto-fixable errors`);

    // Group errors by file
    const errorsByFile = groupErrorsByFile(fixableErrors);

    // Fix errors in each file
    for (const [filePath, fileErrors] of Object.entries(errorsByFile)) {
      await fixFileErrors(filePath, fileErrors);
    }

    console.log("\n✅ Finished applying automatic fixes");
  }

  // Exit with error code if type errors were found
  if (typeErrors.length > 0) {
    console.log("\n⚠️  Type errors detected. Please fix them manually before pushing.");
    console.log("These errors cannot be auto-fixed as they may hide important type safety issues.");
    process.exit(1);
  }
}

function parseBuildErrors(output: string): BuildError[] {
  const errors: BuildError[] = [];
  const lines = output.split("\n");

  // Pattern for ESLint errors: file.ts
  // line:column  Error: message  rule
  const filePattern = /^\.\/(.+)$/;
  const errorPattern = /^(\d+):(\d+)\s+Error:\s+(.+?)\s+(@typescript-eslint\/[\w-]+|[\w-]+)$/;

  let currentFile = "";

  for (const line of lines) {
    // Check if this is a file path
    const fileMatch = line.match(filePattern);
    if (fileMatch) {
      currentFile = fileMatch[1];
      continue;
    }

    // Check if this is an error line
    const errorMatch = line.match(errorPattern);
    if (errorMatch && currentFile) {
      errors.push({
        file: currentFile,
        line: parseInt(errorMatch[1], 10),
        column: parseInt(errorMatch[2], 10),
        message: errorMatch[3],
        rule: errorMatch[4],
      });
    }
  }

  return errors;
}

function groupErrorsByFile(errors: BuildError[]): Record<string, BuildError[]> {
  return errors.reduce(
    (acc, error) => {
      if (!acc[error.file]) {
        acc[error.file] = [];
      }
      acc[error.file].push(error);
      return acc;
    },
    {} as Record<string, BuildError[]>
  );
}

function reportTypeErrors(typeErrors: BuildError[]) {
  // Group by file for better readability
  const errorsByFile = groupErrorsByFile(typeErrors);

  for (const [filePath, fileErrors] of Object.entries(errorsByFile)) {
    console.log(`\n📄 ${filePath}:`);
    for (const error of fileErrors) {
      console.log(`   Line ${error.line}:${error.column} - ${error.message}`);
      console.log(`   Rule: ${error.rule}`);
    }
  }

  console.log(`\n💡 Suggestions for fixing type errors:`);
  console.log(`   - Define proper interfaces/types for your data structures`);
  console.log(`   - Use type assertions only when you're certain about the type`);
  console.log(`   - For test mocks, consider using proper type definitions or mock libraries`);
  console.log(`   - Use 'unknown' instead of 'any' and add type guards where needed`);
}

async function fixFileErrors(filePath: string, errors: BuildError[]) {
  try {
    console.log(`\n📝 Fixing ${filePath}...`);

    const fullPath = path.resolve(filePath);
    const content = await fs.readFile(fullPath, "utf-8");
    let lines = content.split("\n");

    // Sort errors by line number in reverse order to avoid offset issues
    const sortedErrors = errors.sort((a, b) => b.line - a.line);

    for (const error of sortedErrors) {
      console.log(`  - Line ${error.line}: ${error.rule}`);

      switch (error.rule) {
        case "no-unused-vars":
        case "@typescript-eslint/no-unused-vars":
          lines = fixUnusedVars(lines, error);
          break;

        case "react/display-name":
          lines = fixDisplayName(lines, error);
          break;

        default:
          console.log(`    ⚠️  No automatic fix for ${error.rule}`);
      }
    }

    // Write the fixed content back
    await fs.writeFile(fullPath, lines.join("\n"), "utf-8");
    console.log(`  ✅ Fixed ${errors.length} errors`);
  } catch (err) {
    console.error(`  ❌ Error fixing ${filePath}:`, err);
  }
}

function fixUnusedVars(lines: string[], error: BuildError): string[] {
  const lineIndex = error.line - 1;
  if (lineIndex >= 0 && lineIndex < lines.length) {
    let line = lines[lineIndex];

    // Extract variable name from error message
    const varMatch = error.message.match(/'([^']+)' is defined but never used/);
    const varMatch2 = error.message.match(/'([^']+)' is assigned a value but never used/);
    const match = varMatch || varMatch2;

    if (match) {
      const varName = match[1];

      // Skip if already prefixed with underscore
      if (varName.startsWith("_")) {
        return lines;
      }

      // If it's a parameter in a function, prefix with underscore
      if (
        line.includes(`(${varName}:`) ||
        line.includes(` ${varName}:`) ||
        line.includes(`,${varName}:`) ||
        line.includes(`(${varName})`) ||
        line.includes(` ${varName})`) ||
        line.includes(`,${varName})`)
      ) {
        line = line.replace(new RegExp(`\\b${varName}\\b`), `_${varName}`);
      }
      // If it's a catch clause parameter
      else if (line.includes(`catch (${varName})`) || line.includes(`catch(${varName})`)) {
        line = line.replace(new RegExp(`\\((${varName})\\)`), "(_$1)");
      }
      // If it's an import, prefix with underscore
      else if (line.includes("import") && line.includes(varName)) {
        line = line.replace(new RegExp(`\\b${varName}\\b`), `_${varName}`);
      }
      // If it's a declaration, comment it out
      else if (
        line.trim().startsWith("const ") ||
        line.trim().startsWith("let ") ||
        line.trim().startsWith("var ")
      ) {
        line = `// ${line}`;
      }
    }

    lines[lineIndex] = line;
  }
  return lines;
}

function fixDisplayName(lines: string[], error: BuildError): string[] {
  const lineIndex = error.line - 1;
  if (lineIndex >= 0 && lineIndex < lines.length) {
    // Find the component definition
    let componentLine = lineIndex;

    // Search backwards for the component definition
    while (
      componentLine > 0 &&
      !lines[componentLine].includes("React.forwardRef") &&
      !lines[componentLine].includes("= forwardRef")
    ) {
      componentLine--;
    }

    // Extract component name
    const componentMatch = lines[componentLine].match(/const\s+(\w+)\s*=/);
    if (componentMatch) {
      const componentName = componentMatch[1];

      // Add displayName after the component definition
      let insertLine = lineIndex + 1;
      while (insertLine < lines.length && lines[insertLine].trim() !== "") {
        insertLine++;
      }

      lines.splice(insertLine, 0, `${componentName}.displayName = '${componentName}';`);
    }
  }
  return lines;
}

// Run the script
main().catch(console.error);
