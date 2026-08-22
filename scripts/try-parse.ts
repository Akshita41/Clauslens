/**
 * Development helper: run the real extractor + splitter over a PDF on disk
 * and print what comes out. Not part of the app.
 *
 *   node scripts/try-parse.ts path/to/contract.pdf
 */
import fs from "node:fs";
import { extractPdfText } from "../lib/pdf/extract.ts";
import { splitIntoClauses } from "../lib/clauses/split.ts";

const path = process.argv[2];
if (!path) {
  console.error("usage: node scripts/try-parse.ts <file.pdf>");
  process.exit(1);
}

const data = new Uint8Array(fs.readFileSync(path));
const { pages, pageCount, charsPerPage } = await extractPdfText(data);
console.log(`pages: ${pageCount}   chars/page: ${Math.round(charsPerPage)}`);

console.log("\n--- first 10 lines of page 1 ---");
console.log(pages[0].text.split("\n").slice(0, 10).join("\n"));

const { clauses, fallback } = splitIntoClauses(pages);
console.log(`\nclauses: ${clauses.length}   fallback: ${fallback}`);
console.log("\n--- first 12 clauses ---");
for (const c of clauses.slice(0, 12)) {
  const no = c.clauseNo ? `§${c.clauseNo}` : "—";
  console.log(
    `${no.padEnd(8)} p.${String(c.page).padEnd(3)} ${String(c.text.length).padStart(5)} chars  ${c.heading}`,
  );
}
