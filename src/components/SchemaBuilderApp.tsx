"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Sparkles } from "lucide-react";
import { useSchemaBuilder } from "@/hooks/useSchemaBuilder";
import { COMPANY } from "@/lib/company";
import { Header } from "./Header";
import { SiteFooter } from "./SiteFooter";
import { PrivacyBadge } from "./PrivacyBadge";
import { FunctionMetadata } from "./FunctionMetadata";
import { PresetSelector } from "./PresetSelector";
import { ParameterBuilder } from "./ParameterBuilder";
import { SchemaPreview } from "./SchemaPreview";
import { ProviderTabs } from "./ProviderTabs";
import { PayloadTester } from "./PayloadTester";
import { SDKGenerator } from "./SDKGenerator";
import { ImportExport } from "./ImportExport";
import { ConfirmDialog } from "./ConfirmDialog";
import { ToastProvider, useToast } from "./Toast";

function BuilderApp() {
  const builder = useSchemaBuilder();
  const { toast } = useToast();
  const [resetOpen, setResetOpen] = useState(false);

  const handleReset = () => {
    builder.reset();
    setResetOpen(false);
    toast("Builder reset", "info");
  };

  return (
    <div className="app-bg min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <section className="hero-panel p-5 sm:p-7 relative overflow-hidden">
          <div
            className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full opacity-30 blur-3xl"
            style={{ background: "#06b6d4" }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-10 bottom-0 size-40 rounded-full opacity-20 blur-3xl"
            style={{ background: "#f59e0b" }}
            aria-hidden
          />
          <div className="relative space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge badge-cyan">
                <Sparkles className="size-3.5" aria-hidden />
                Free developer tool
              </span>
              <span className="badge badge-amber">Himat Technology</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight max-w-2xl">
              <span className="section-title-gradient">
                Visually build, validate, test &amp; convert
              </span>{" "}
              <span className="text-slate-100">AI function calling schemas</span>
            </h2>
            <p className="text-base text-muted max-w-2xl">
              OpenAI · Claude · LangChain · JSON Schema — all private, all
              client-side. Compare with our hosted demo anytime.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href={COMPANY.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-demo"
              >
                <ExternalLink className="size-4" aria-hidden />
                Open Live Demo
              </a>
              <a
                href={COMPANY.website}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Visit {COMPANY.websiteLabel}
              </a>
              <a href={`mailto:${COMPANY.email}`} className="btn btn-secondary">
                {COMPANY.email}
              </a>
            </div>
          </div>
        </section>

        <PrivacyBadge />

        <ImportExport
          definition={builder.definition}
          onImport={builder.loadDefinition}
          onSaveDraft={builder.saveDraft}
          onRestoreDraft={builder.restoreDraft}
          onClearDraft={builder.clearDraft}
          onResetRequest={() => setResetOpen(true)}
        />

        <PresetSelector onSelect={builder.loadDefinition} />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FunctionMetadata builder={builder} />
            <ParameterBuilder builder={builder} />
          </div>
          <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
            <SchemaPreview
              definition={builder.definition}
              onReset={() => setResetOpen(true)}
            />
            <ProviderTabs definition={builder.definition} />
          </div>
        </div>

        <PayloadTester definition={builder.definition} />
        <SDKGenerator definition={builder.definition} />

        <SiteFooter />
      </main>

      <ConfirmDialog
        open={resetOpen}
        title="Reset Builder"
        message="Reset the current function and parameters?"
        confirmLabel="Reset"
        onConfirm={handleReset}
        onCancel={() => setResetOpen(false)}
      />
    </div>
  );
}

function AppShell() {
  return (
    <div className="app-bg min-h-screen flex items-center justify-center p-6">
      <p className="text-sm text-cyan-200/80" aria-live="polite">
        Loading schema builder…
      </p>
    </div>
  );
}

export function SchemaBuilderApp() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Client-only mount avoids SSR/client mismatches (and browser extensions
  // injecting attributes like fdprocessedid onto buttons before hydration).
  if (!mounted) {
    return <AppShell />;
  }

  return (
    <ToastProvider>
      <BuilderApp />
    </ToastProvider>
  );
}
