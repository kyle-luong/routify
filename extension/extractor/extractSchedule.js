import { extractFromTable } from "./extractFromTable.js";
import { extractFromDOM } from "./extractFromDOM.js";
import { extractFromText } from "./extractFromText.js";

export function extractSchedule(documentRoot = document) {
  const tableResult = extractFromTable(documentRoot);
  if (tableResult.confidence >= 0.9) return tableResult;

  const domResult = extractFromDOM(documentRoot);
  if (domResult.confidence >= 0.8) return domResult;

  const textResult = extractFromText(documentRoot.body.innerText || "");
  if (textResult.confidence >= 0.8) return textResult;

  return { events: [], confidence: 0.0 };
}
