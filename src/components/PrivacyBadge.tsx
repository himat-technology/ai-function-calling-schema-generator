import { ShieldCheck } from "lucide-react";

export function PrivacyBadge() {
  return (
    <div className="card card-accent-emerald px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge badge-success">
          <ShieldCheck className="size-3.5" aria-hidden />
          100% Browser-Local
        </span>
        <span className="badge badge-cyan">Privacy First</span>
      </div>
      <p className="hint flex-1">
        <strong className="text-emerald-300 font-medium">
          100% Client-Side Privacy.
        </strong>{" "}
        Your function definitions, schemas, and test payloads never leave your
        browser.
      </p>
    </div>
  );
}
