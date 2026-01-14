export function extractFromText(text = document.body.innerText) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const results = [];

  for (let i = 0; i < lines.length - 2; i++) {
    const group = lines.slice(i, i + 3);
    const timeRegex =
      /(\d{1,2}:\d{2}) ?(AM|PM)? ?- ?(\d{1,2}:\d{2}) ?(AM|PM)?/i;
    const dayRegex = /Mo|Tu|We|Th|Fr|Sa|Su/;

    const title = group[0];
    const timeLine = group.find((line) => timeRegex.test(line));
    const dayLine = group.find((line) => dayRegex.test(line));
    const location = group.find((line) =>
      /(Hall|Room|Building|Lab)/i.test(line)
    );

    if (title && timeLine && dayLine) {
      const match = timeLine.match(timeRegex);
      results.push({
        title,
        days: dayLine,
        start: match[1] + (match[2] || ""),
        end: match[3] + (match[4] || ""),
        location,
      });
    }
  }

  return {
    events: results,
    confidence: results.length > 0 ? 0.7 : 0.0,
  };
}
