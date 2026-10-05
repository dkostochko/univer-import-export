/**
 * Debug logging utility that can be disabled in production
 * Set DEBUG environment variable or window.__DEBUG__ to enable logging
 */

const isDebugEnabled = (): boolean => {


  // Original logic (disabled for now):
  // Check if we're in Node.js environment
  if (typeof process !== 'undefined' && process.env) {
     return process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true';
  }

  // Check if we're in browser environment
  // if (typeof window !== 'undefined') {
  //   return (window as any).__DEBUG__ === true;
  // }

  // Default to disabled in production
  return false;
};

export type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

export interface LogEvent {
  level: LogLevel;
  scope?: string;
  args: unknown[];
  timestamp: number;
}

export type LogAdapter = (event: LogEvent) => void;

const defaultLogAdapter: LogAdapter = ({ level, args }) => {
  const output = console[level] || console.log;
  if (output) {
    output.apply(console, args);
  }
};

let logAdapter: LogAdapter = defaultLogAdapter;

export const setLogAdapter = (adapter: LogAdapter): void => {
  if (typeof adapter !== 'function') {
    throw new TypeError('Log adapter must be a function');
  }
  logAdapter = adapter;
};

export const resetLogAdapter = (): void => {
  logAdapter = defaultLogAdapter;
};

const getScopeAndMessage = (args: unknown[]): { scope?: string; args: unknown[] } => {
  const firstArgument = args[0];
  if (typeof firstArgument !== 'string') {
    return { args };
  }

  const match = firstArgument.match(/^([\s\p{P}\p{S}]*?)\[([^\]]+)\]\s*/u);
  if (!match) {
    return { args };
  }

  const messageArgs = args.slice();
  messageArgs[0] = `${match[1]}${firstArgument.slice(match[0].length)}`;
  return {
    scope: match[2].trim().toLowerCase() || undefined,
    args: messageArgs,
  };
};

export const saveLog = (level: LogLevel, args: unknown[], force = false): void => {
  if (!force && level !== 'error' && !isDebugEnabled()) {
    return;
  }

  const { scope, args: messageArgs } = getScopeAndMessage(args);
  const event: LogEvent = {
    level,
    scope,
    args: messageArgs,
    timestamp: Date.now(),
  };

  try {
    logAdapter(event);
  } catch (error) {
    try {
      console.error('[univer-import-export] Log adapter failed:', error);
    } catch {
      // Logging failures must not interrupt spreadsheet processing.
    }
  }
};

const safeLog = (...args: unknown[]) => saveLog('log', args);
const safeWarn = (...args: unknown[]) => saveLog('warn', args);
const safeError = (...args: unknown[]) => saveLog('error', args);
const safeInfo = (...args: unknown[]) => saveLog('info', args);
const safeDebug = (...args: unknown[]) => saveLog('debug', args);

export const debug = {
  log: safeLog,
  warn: safeWarn,
  error: safeError,
  info: safeInfo,
  debug: safeDebug,
};

// For development: Enable debug logging
export const enableDebug = () => {
  if (typeof window !== 'undefined') {
    (window as any).__DEBUG__ = true;
  }
};

// For production: Disable debug logging
export const disableDebug = () => {
  if (typeof window !== 'undefined') {
    (window as any).__DEBUG__ = false;
  }
};
