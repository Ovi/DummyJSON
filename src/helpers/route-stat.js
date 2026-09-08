import DailyRouteStat from '../models/daily-route-stat.js';

function getTodayDateFloor() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Normalizes a path for MongoDB storage by:
 * - Keeping leading slash
 * - Replacing dots (.) with underscores (since dots are used as field separators in MongoDB)
 * - Keeping slashes and hyphens as they are supported by MongoDB
 * - Replacing other problematic characters with underscore
 *
 * Returns an object with:
 * - normalized: the normalized path
 * - isWeird: whether the path contained problematic characters
 */
function normalizePath(path) {
  if (!path) return { normalized: '/', isWeird: false };

  const original = path;
  let normalized = path;

  // Check if path contains problematic characters (dots or other non-standard chars)
  const hasDots = /\./.test(original);
  const hasWeirdChars = /[^a-zA-Z0-9_/-]/.test(original);
  const isWeird = hasDots || hasWeirdChars;

  // Replace dots with underscores (dots are MongoDB field separators)
  normalized = normalized.replace(/\./g, '_');

  // Replace other problematic characters (but keep slashes, hyphens, and alphanumeric)
  // Keep: a-z, A-Z, 0-9, /, -, _
  normalized = normalized.replace(/[^a-zA-Z0-9_/-]/g, '_');

  // Remove consecutive underscores (but keep slashes)
  normalized = normalized.replace(/_+/g, '_');

  // Remove leading/trailing underscores (but preserve leading slash)
  if (normalized.startsWith('/')) {
    normalized = `/${normalized.slice(1).replace(/^_+|_+$/g, '')}`;
  } else {
    normalized = normalized.replace(/^_+|_+$/g, '');
  }

  return {
    normalized: normalized || '/', // Default to '/' if path becomes empty
    isWeird,
  };
}

export async function flushRouteStatsSnapshot(pathCounts) {
  const today = getTodayDateFloor();

  if (!Object.keys(pathCounts).length) return;

  // Build the increment object with normalized paths and collect weird paths
  const incObject = {};
  const weirdPathsSet = new Set();

  Object.entries(pathCounts).forEach(([path, count]) => {
    const { normalized, isWeird } = normalizePath(path);
    incObject[`paths.${normalized}`] = count;

    // Track original path if it was weird
    if (isWeird) {
      weirdPathsSet.add(path);
    }
  });

  const updateObject = {
    $setOnInsert: { date: today },
    $inc: incObject,
  };

  // Add weird paths to the array if there are any
  if (weirdPathsSet.size > 0) {
    updateObject.$addToSet = { weirdPaths: { $each: Array.from(weirdPathsSet) } };
  }

  await DailyRouteStat.findOneAndUpdate({ date: today }, updateObject, { upsert: true });
}
