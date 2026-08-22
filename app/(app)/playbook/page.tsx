import { PageHeader } from "@/components/app-shell";
import { MockNotice, SeverityBadge } from "@/components/ui";
import { playbookRules } from "@/lib/mock-data";

export const metadata = { title: "Playbook" };

export default function PlaybookPage() {
  return (
    <>
      <PageHeader
        eyebrow="Your standards"
        title="Playbook"
        description="The positions every contract gets measured against. Seven rules, applied to each clause, producing the flags on the risk review screen."
        action={<MockNotice>Read-only in this build</MockNotice>}
      />

      <div className="mx-auto max-w-4xl px-6 py-10">
        <ul className="space-y-3">
          {playbookRules.map((r, i) => (
            <li
              key={r.id}
              className="animate-rise"
              style={{ animationDelay: `${i * 45}ms` }}
            >
              <div className="rounded-3xl border border-line bg-white p-6 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-lg bg-plum-50 px-2 py-1 font-mono text-[11px] text-plum-600">
                    {r.id}
                  </span>
                  <h2 className="font-display text-lg tracking-[-0.01em] text-plum-900">
                    {r.title}
                  </h2>
                  <SeverityBadge severity={r.severityIfViolated} className="ml-auto" />
                </div>
                <p className="mt-3 text-[13.5px] leading-relaxed text-muted">
                  {r.standardPosition}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-2xl border border-line bg-cream/60 p-6">
          <p className="eyebrow mb-3">Why this is a file, not a settings screen</p>
          <p className="text-[13px] leading-relaxed text-muted">
            Seven rules did not justify a full create/edit/delete interface, a
            database table and the permissions that come with them. They live in{" "}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[12px] text-plum-700">
              lib/playbook.ts
            </code>{" "}
            and are read at analysis time. If a real user ever needed to edit them,
            that is the moment to build the screen — not before.
          </p>
        </div>
      </div>
    </>
  );
}
