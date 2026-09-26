"use client";

import { ExternalLink, Globe } from "lucide-react";
import { COMPANY } from "@/lib/company";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 12.07C22 6.48 17.52 2 11.93 2S1.86 6.48 1.86 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.03H7.9v-2.9h2.4V9.84c0-2.37 1.41-3.68 3.57-3.68 1.03 0 2.12.18 2.12.18v2.33h-1.2c-1.18 0-1.55.73-1.55 1.48v1.78h2.64l-.42 2.9h-2.22V22c4.78-.75 8.44-4.91 8.44-9.93z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22 0H2C.9 0 0 .9 0 2v20c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zm0-2.16C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.69 21.31.27 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
    </svg>
  );
}

export function Header() {
  return (
    <header className="border-b border-border/80 bg-bg/75 backdrop-blur-md sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex items-center gap-3">
          <div
            className="hidden sm:flex size-10 rounded-xl items-center justify-center shrink-0"
            style={{
              background:
                "linear-gradient(135deg, #06b6d4 0%, #14b8a6 50%, #f59e0b 100%)",
            }}
            aria-hidden
          >
            <span className="text-sm font-bold text-slate-950">HT</span>
          </div>
          <div className="min-w-0">
            <a
              href={COMPANY.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs uppercase tracking-[0.14em] text-cyan-300/90 hover:text-cyan-200 transition-colors"
            >
              {COMPANY.name}
            </a>
            <h1 className="text-base sm:text-xl font-semibold tracking-tight truncate">
              <span className="section-title-gradient">
                AI Function Calling &amp; Tool Schema Generator
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <nav className="flex items-center gap-1.5" aria-label="Social links">
            <a
              href={COMPANY.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link social-facebook"
              aria-label="Himat Technology on Facebook"
            >
              <FacebookIcon className="size-4" />
            </a>
            <a
              href={COMPANY.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link social-linkedin"
              aria-label="Himat Technology on LinkedIn"
            >
              <LinkedInIcon className="size-4" />
            </a>
            <a
              href={COMPANY.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link social-instagram"
              aria-label="Himat Technology on Instagram"
            >
              <InstagramIcon className="size-4" />
            </a>
          </nav>

          <a
            href={COMPANY.website}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary shrink-0"
            aria-label="Visit himat.co.in"
          >
            <Globe className="size-4" aria-hidden />
            <span className="hidden sm:inline">{COMPANY.websiteLabel}</span>
          </a>

          <a
            href={COMPANY.demo}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-demo shrink-0"
            aria-label="Open live demo on himat.tech"
          >
            <ExternalLink className="size-4" aria-hidden />
            <span className="hidden xs:inline sm:inline">Live Demo</span>
            <span className="sm:hidden">Demo</span>
          </a>
        </div>
      </div>
    </header>
  );
}
