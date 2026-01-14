export function extractFromDOM(documentRoot = document) {
  const cards = Array.from(documentRoot.querySelectorAll("div, li")).filter(
    (el) => el.children.length >= 3
  );

  const results = [];

  for (const card of cards) {
    const textItems = Array.from(card.children).map((c) =>
      c.textContent.trim()
    );
    const timePattern =
      /(\d{1,2}:\d{2}) ?(AM|PM)? ?- ?(\d{1,2}:\d{2}) ?(AM|PM)?/i;
    const dayPattern = /Mo|Tu|We|Th|Fr|Sa|Su/i;
    const locationPattern = /Hall|Room|Building|Lab/i;

    let title = textItems[0];
    let start = null,
      end = null,
      days = null,
      location = null;

    for (const line of textItems) {
      if (timePattern.test(line)) {
        const match = line.match(timePattern);
        start = match[1] + (match[2] || "");
        end = match[3] + (match[4] || "");
      } else if (dayPattern.test(line)) {
        days = line;
      } else if (locationPattern.test(line)) {
        location = line;
      }
    }

    if (title && start && end && days) {
      results.push({ title, start, end, days, location });
    }
  }

  return {
    events: results,
    confidence: results.length > 0 ? 0.85 : 0.0,
  };
}
