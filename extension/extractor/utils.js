export function calculateConfidence(
  events,
  requiredKeys = ["title", "days", "start", "end", "location"]
) {
  let validCount = 0;
  for (const event of events) {
    if (requiredKeys.every((k) => event[k])) validCount++;
  }
  return validCount / events.length;
}
