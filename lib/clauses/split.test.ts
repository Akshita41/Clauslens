import { describe, expect, it } from "vitest";
import { splitIntoClauses, type PageText } from "./split";

const page = (page: number, text: string): PageText => ({ page, text });

describe("splitIntoClauses", () => {
  it("splits on numbered headings and keeps the clause number", () => {
    const result = splitIntoClauses([
      page(
        1,
        [
          "3.1 Term",
          "This Agreement shall commence on the Effective Date and continue for twenty-four (24) months unless terminated earlier in accordance with Section 9. The parties may extend by written agreement executed before expiry of the initial period.",
          "",
          "3.2 Renewal",
          "Upon expiry of the Initial Term this Agreement shall renew automatically for successive periods of twelve (12) months unless either party gives ninety (90) days written notice of non-renewal to the other party in advance.",
          "",
          "3.3 Fees",
          "Client shall pay all undisputed invoices within thirty (30) days of receipt, and amounts not paid when due shall accrue interest at one and one-half percent per month until paid in full.",
        ].join("\n"),
      ),
    ]);

    expect(result.fallback).toBe(false);
    expect(result.clauses.map((c) => c.clauseNo)).toEqual(["3.1", "3.2", "3.3"]);
    expect(result.clauses[0].heading).toBe("Term");
    expect(result.clauses[1].heading).toBe("Renewal");
  });

  it("keeps a liability cap together with its carve-out", () => {
    // This is the failure a fixed-size window causes: the cap survives, and
    // the exception that guts it lands in a different chunk. Both sentences
    // must stay in one clause or a citation to the cap is misleading.
    const result = splitIntoClauses([
      page(
        1,
        [
          "8.1 Limitation of Liability",
          "In no event shall Provider aggregate liability exceed the fees paid in the twelve (12) months preceding the claim, whether in contract, tort or otherwise, and regardless of the form of action.",
          "Except that this cap shall not apply to a party indemnification obligations under Section 8.4 or to any breach of confidentiality under Section 6 of this Agreement.",
          "",
          "9.1 Termination",
          "Either party may terminate this Agreement for material breach if the breach remains uncured for thirty (30) days after written notice describing the breach in reasonable detail.",
          "",
          "10.1 Notices",
          "All notices under this Agreement shall be in writing and delivered by hand, courier or email to the addresses set out on the signature page of this Agreement.",
        ].join("\n"),
      ),
    ]);

    const cap = result.clauses.find((c) => c.clauseNo === "8.1");
    expect(cap).toBeDefined();
    expect(cap!.text).toContain("shall not apply");
    expect(cap!.text).not.toContain("9.1");
  });

  it("recognises ARTICLE and Section keyword headings", () => {
    const result = splitIntoClauses([
      page(
        1,
        [
          "ARTICLE IV — CONFIDENTIALITY",
          "Each party shall hold the other party Confidential Information in strict confidence and shall not disclose it to any third party without prior written consent of the disclosing party.",
          "",
          "Section 5.2 Governing Law",
          "This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware without regard to its conflict of laws principles or rules.",
          "",
          "Section 6 Assignment",
          "Neither party may assign this Agreement in whole or in part without the prior written consent of the other party, such consent not to be unreasonably withheld or delayed.",
        ].join("\n"),
      ),
    ]);

    expect(result.fallback).toBe(false);
    expect(result.clauses.map((c) => c.clauseNo)).toEqual(["IV", "5.2", "6"]);
    expect(result.clauses[1].heading).toBe("Governing Law");
  });

  it("records the page a clause started on", () => {
    const filler =
      "This clause contains enough text to stand on its own as a separate clause in the output rather than being folded into the clause before it. ".repeat(
        2,
      );
    const result = splitIntoClauses([
      page(1, `1. Definitions\n${filler}`),
      page(2, `2. Engagement\n${filler}`),
      page(3, `3. Fees\n${filler}`),
    ]);

    expect(result.clauses.map((c) => c.page)).toEqual([1, 2, 3]);
  });

  it("falls back to paragraphs when there are no headings", () => {
    const prose =
      "The parties acknowledge that this letter records their mutual understanding and that no formal agreement has yet been executed between them. ".repeat(
        20,
      );
    const result = splitIntoClauses([page(1, prose)]);

    expect(result.fallback).toBe(true);
    expect(result.clauses.length).toBeGreaterThan(0);
    expect(result.clauses[0].clauseNo).toBeNull();
  });

  it("does not treat a sentence beginning with a figure as a heading", () => {
    const result = splitIntoClauses([
      page(
        1,
        [
          "1. Definitions",
          "The following terms apply throughout this Agreement and shall have the meanings given to them in this Section for all purposes of interpretation.",
          "2020 was the reference year used for the baseline calculation described in the attached schedule and agreed by both parties.",
          "$1,000,000 is the aggregate value of the commitments described above and is not subject to adjustment.",
          "",
          "2. Engagement",
          "Client engages Provider to perform the Services described in each Statement of Work executed by both parties under this Agreement.",
          "",
          "3. Fees",
          "Client shall pay all undisputed invoices within thirty (30) days of receipt of a valid invoice issued in accordance with this Agreement.",
        ].join("\n"),
      ),
    ]);

    expect(result.clauses.map((c) => c.clauseNo)).toEqual(["1", "2", "3"]);
    expect(result.clauses[0].text).toContain("2020 was the reference year");
  });

  it("folds a heading with no body into the clause before it", () => {
    const body =
      "Each party shall bear its own costs and expenses incurred in connection with the negotiation and execution of this Agreement and any related documentation. ".repeat(
        2,
      );
    const result = splitIntoClauses([
      page(
        1,
        `1. Costs\n${body}\n\nSCHEDULE A\n\n2. Notices\n${body}\n\n3. Waiver\n${body}`,
      ),
    ]);

    // "SCHEDULE A" is a real heading with nothing under it, so it must not
    // become a clause of its own that a citation could point at.
    const bare = result.clauses.find((c) => c.text.trim() === "SCHEDULE A");
    expect(bare).toBeUndefined();
    expect(result.clauses.some((c) => c.text.includes("SCHEDULE A"))).toBe(true);
    expect(result.clauses.map((c) => c.clauseNo)).toEqual(["1", "2", "3"]);
  });

  it("keeps a genuinely short clause instead of merging it away", () => {
    const body =
      "Each party shall bear its own costs and expenses incurred in connection with the negotiation and execution of this Agreement and any related documentation. ".repeat(
        2,
      );
    const result = splitIntoClauses([
      page(
        1,
        [
          `1. Costs`,
          body,
          "",
          "2. Governing Law",
          "This Agreement is governed by the laws of the State of Delaware.",
          "",
          `3. Waiver`,
          body,
        ].join("\n"),
      ),
    ]);

    const governing = result.clauses.find((c) => c.clauseNo === "2");
    expect(governing).toBeDefined();
    expect(governing!.text).toContain("Delaware");
  });
});
