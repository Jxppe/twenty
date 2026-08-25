// The SDK manifest builder derives sourceHandlerPath / sourceComponentPath with
// path.relative, which returns backslash-separated paths on Windows. The server
// rejects any resource path containing a backslash, so every sync from a Windows
// machine fails with INVALID_LOGIC_FUNCTION_INPUT / INVALID_FRONT_COMPONENT_INPUT.
//
// This rewrites those call sites in the installed bundle to normalize separators.
// It is idempotent, and a no-op on macOS and Linux where path.relative already
// returns forward slashes. Windows accepts forward slashes in filesystem calls,
// so normalizing is safe on every platform.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appPath = dirname(dirname(fileURLToPath(import.meta.url)));
const distPath = join(appPath, 'node_modules', 'twenty-sdk', 'dist');

const CJS_HELPER =
  'function __twentyRelPosix(a,b){return require("path").relative(a,b).split("\\\\").join("/");}\n';

const patches = [
  {
    file: 'login-Cl-mw1L0.js',
    marker: '__twentyRelPosix',
    apply: (source) => {
      if (!source.includes('(0,t.relative)(')) {
        return null;
      }

      return CJS_HELPER + source.replaceAll('(0,t.relative)(', '(0,__twentyRelPosix)(');
    },
  },
  {
    file: 'login-CuJiHYwZ.mjs',
    marker: '__twentyRelOrig',
    apply: (source) => {
      const importSpecifier = 'relative as Ue } from "path";';

      if (!source.includes(importSpecifier)) {
        return null;
      }

      return source.replace(
        importSpecifier,
        'relative as __twentyRelOrig } from "path";\n' +
          'const Ue = (a, b) => __twentyRelOrig(a, b).split("\\\\").join("/");',
      );
    },
  },
];

let changed = 0;
let skipped = 0;

for (const { file, marker, apply } of patches) {
  const filePath = join(distPath, file);
  let source;

  try {
    source = readFileSync(filePath, 'utf8');
  } catch {
    console.warn(`skipped ${file} (not found; SDK version may have changed)`);
    skipped += 1;
    continue;
  }

  if (source.includes(marker)) {
    continue;
  }

  const patched = apply(source);

  if (patched === null) {
    console.warn(`skipped ${file} (call site not found; SDK version may have changed)`);
    skipped += 1;
    continue;
  }

  writeFileSync(filePath, patched);
  changed += 1;
}

if (changed > 0) {
  console.log(`twenty-sdk: normalized manifest paths in ${changed} file(s)`);
}

if (skipped > 0) {
  console.warn(
    'twenty-sdk: some files could not be patched. If a sync fails with "Resource path must not contain backslashes", this script needs updating for the new SDK version.',
  );
}
