const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const APP_ROOT = path.resolve(__dirname, '..');
const SOURCE_ROOT = path.join(APP_ROOT, 'src');
const APP_TEXT_PATH = path.join(SOURCE_ROOT, 'components', 'AppText.js');
const TYPOGRAPHY_PATH = path.join(SOURCE_ROOT, 'theme', 'typography.js');

function findJavaScriptFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return findJavaScriptFiles(entryPath);
    }

    return entry.isFile() && entry.name.endsWith('.js') ? [entryPath] : [];
  });
}

test('all product copy uses the shared AppText primitive', () => {
  for (const filePath of findJavaScriptFiles(SOURCE_ROOT)) {
    if (filePath === APP_TEXT_PATH) {
      continue;
    }

    const source = fs.readFileSync(filePath, 'utf8');
    const reactNativeImports = [...source.matchAll(/import\s*\{([^}]*)\}\s*from ['"]react-native['"]/gs)];

    for (const [, importedNames] of reactNativeImports) {
      const names = importedNames.split(',').map((name) => name.trim());
      assert.equal(names.includes('Text'), false, `${path.relative(APP_ROOT, filePath)} imports React Native Text directly`);
    }

    assert.doesNotMatch(source, /<Text(?:\s|>)/, `${path.relative(APP_ROOT, filePath)} renders React Native Text directly`);
  }
});

test('font families stay centralized and use build-safe platform fallbacks', () => {
  for (const filePath of findJavaScriptFiles(SOURCE_ROOT)) {
    if (filePath === TYPOGRAPHY_PATH) {
      continue;
    }

    const source = fs.readFileSync(filePath, 'utf8');
    assert.doesNotMatch(source, /fontFamily\s*:/, `${path.relative(APP_ROOT, filePath)} declares a local font family`);
  }

  const typographySource = fs.readFileSync(TYPOGRAPHY_PATH, 'utf8');
  assert.match(typographySource, /ios:\s*'system-ui'/);
  assert.match(typographySource, /android:\s*'sans-serif'/);
  assert.match(typographySource, /system-ui, -apple-system, BlinkMacSystemFont/);
});

test('the app does not bundle Apple font files', () => {
  const bundledFonts = findJavaScriptFiles(SOURCE_ROOT);
  const assetFiles = fs.readdirSync(path.join(APP_ROOT, 'assets'), { recursive: true });

  assert.ok(bundledFonts.length > 0);
  assert.deepEqual(assetFiles.filter((file) => /\.(?:otf|ttf|woff2?)$/i.test(file)), []);
});
