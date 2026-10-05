const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');

const sourcePath = path.join(__dirname, '../src/utils/debug.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const debugModule = new Module(sourcePath, module);
debugModule.filename = sourcePath;
debugModule.paths = Module._nodeModulePaths(path.dirname(sourcePath));
debugModule._compile(compiled, sourcePath);
const { debug, setLogAdapter, resetLogAdapter, saveLog } = debugModule.exports;

test.afterEach(() => {
  resetLogAdapter();
  delete process.env.DEBUG;
  delete process.env.NODE_ENV;
});

test('sends normalized scope separately and removes its tag from message args', () => {
  const events = [];
  process.env.DEBUG = 'true';
  setLogAdapter((event) => events.push(event));
  const message = '🔍 [LuckyFile] Processing workbook';

  debug.log(message, { sheetCount: 2 });

  assert.equal(events.length, 1);
  assert.equal(events[0].level, 'log');
  assert.equal(events[0].scope, 'luckyfile');
  assert.deepEqual(events[0].args, ['🔍 Processing workbook', { sheetCount: 2 }]);
  assert.equal(typeof events[0].timestamp, 'number');
});

test('uses an undefined scope for messages without a leading tag', () => {
  const events = [];
  process.env.DEBUG = 'true';
  setLogAdapter((event) => events.push(event));

  debug.warn('No component tag here');

  assert.equal(events[0].scope, undefined);
});

test('respects the existing debug filter while always forwarding errors', () => {
  const events = [];
  delete process.env.DEBUG;
  delete process.env.NODE_ENV;
  setLogAdapter((event) => events.push(event));

  debug.log('[PACKAGE] hidden debug message');
  debug.error('[PACKAGE] visible error');

  assert.deepEqual(events.map(({ level }) => level), ['error']);
});

test('routes unfiltered direct logs through the adapter', () => {
  const events = [];
  setLogAdapter((event) => events.push(event));

  saveLog('log', ['[XML] direct log'], true);

  assert.equal(events.length, 1);
  assert.equal(events[0].scope, 'xml');
});

test('uses console as the default adapter and restores it on reset', () => {
  const originalLog = console.log;
  const output = [];
  process.env.DEBUG = 'true';
  console.log = (...args) => output.push(args);

  try {
    resetLogAdapter();
    debug.log('[PACKAGE] default output');
    assert.deepEqual(output, [['default output']]);
  } finally {
    console.log = originalLog;
  }
});

test('does not propagate errors thrown by a custom adapter', () => {
  const originalError = console.error;
  const reported = [];
  console.error = (...args) => reported.push(args);
  setLogAdapter(() => {
    throw new Error('adapter failure');
  });

  try {
    assert.doesNotThrow(() => debug.error('[PACKAGE] handled error'));
    assert.match(String(reported[0][0]), /log adapter/i);
  } finally {
    console.error = originalError;
  }
});
