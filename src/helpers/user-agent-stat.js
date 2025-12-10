import MonthlyUserAgentStat from '../models/monthly-user-agent-stat.js';

function getCurrentMonthFloor() {
  const d = new Date();
  d.setUTCDate(1); // Set to first day of month
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function flushUserAgentStatsSnapshot(userAgentCounts) {
  const currentMonth = getCurrentMonthFloor();

  if (!Object.keys(userAgentCounts).length) return;

  // Get or create the document for this month
  let doc = await MonthlyUserAgentStat.findOne({ month: currentMonth });

  if (!doc) {
    doc = await MonthlyUserAgentStat.create({
      month: currentMonth,
      userAgents: [],
    });
  }

  // Process each user-agent count
  Object.entries(userAgentCounts).forEach(([userAgent, count]) => {
    const normalizedUA = userAgent || 'unknown';
    const existingIndex = doc.userAgents.findIndex(item => item.ua === normalizedUA);

    if (existingIndex >= 0) {
      // Increment existing count
      doc.userAgents[existingIndex].count += count;
    } else {
      // Add new entry
      doc.userAgents.push({ ua: normalizedUA, count });
    }
  });

  await doc.save();
}
