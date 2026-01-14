export function extractFromTable(documentRoot = document) {
  const tables = documentRoot.querySelectorAll("table");
  for (const table of tables) {
    const headers = Array.from(table.querySelectorAll("th")).map((th) =>
      th.textContent.toLowerCase()
    );
    const required = ["class", "days", "start", "end", "location"];
    const hasAll = required.every((req) =>
      headers.some((h) => h.includes(req))
    );

    if (!hasAll) continue;

    const rows = Array.from(table.querySelectorAll("tbody tr"));
    const events = rows.map((row) => {
      const cells = Array.from(row.querySelectorAll("td"));
      return {
        title: cells[0]?.textContent.trim(),
        days: cells[1]?.textContent.trim(),
        start: cells[2]?.textContent.trim(),
        end: cells[3]?.textContent.trim(),
        location: cells[4]?.textContent.trim(),
      };
    });

    return {
      events: events.filter((e) => e.title && e.days && e.start && e.end),
      confidence: 0.95,
    };
  }

  return { events: [], confidence: 0.0 };
}
