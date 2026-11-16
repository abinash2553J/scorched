"use client";

import { useState } from "react";
import { z } from "zod";
import { RoastResult, Spice } from "@/lib/schema";
import { StatsSchema } from "@/lib/stats";
import { RoastControls } from "./roast-controls";
import { RoastReportCard, ScoreOnlyCard } from "./roast-report-card";
import { RoastTelemetry } from "./roast-telemetry";
import { RoastExportDialog } from "./roast-export-dialog";

const ReportResponse = z.object({
  stats: StatsSchema,
  roast: RoastResult,
});

const ApiError = z.object({
  error: z.string(),
  stats: StatsSchema.optional(),
});

const StreamEvent = z.discriminatedUnion("type", [
  z.object({ type: z.literal("stats"), stats: StatsSchema }),
  z.object({ type: z.literal("report"), report: ReportResponse }),
  z.object({ type: z.literal("error"), error: z.string() }),
]);

type Report = z.infer<typeof ReportResponse>;

function reportText(report: Report) {
  const burns = report.roast.burns
    .map(
      ({ text, evidence }) =>
        `- ${text} [${evidence.label}: ${evidence.value}]`
    )
    .join("\n");

  return [
    "My Scorched YouTube roast",
    `${report.roast.brainrotScore}/100 — ${report.roast.personalityLabel}`,
    report.roast.description,
    "",
    burns,
    "",
    "Facts are computed from my likes; Gemini only wrote the jokes.",
  ].join("\n");
}

export function RoastWorkspace() {
  const [spice, setSpice] = useState<Spice>("medium");
  const [report, setReport] = useState<Report | null>(null);
  const [statsOnly, setStatsOnly] = useState<Report["stats"] | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);

  async function generateReport() {
    setPending(true);
    setError(null);
    setNotice(null);
    setReport(null);
    setStatsOnly(null);

    try {
      let response: Response;
      try {
        response = await fetch("/api/roast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ spice }),
        });
      } catch {
        setError("Could not reach Scorched. Check your connection and try again.");
        return;
      }

      let payload: unknown;
      if (
        !response.ok ||
        !response.headers.get("content-type")?.includes("text/event-stream")
      ) {
        try {
          payload = await response.json();
        } catch {
          setError("Scorched returned an unreadable response. Try again.");
          return;
        }

        if (!response.ok) {
          const apiError = ApiError.safeParse(payload);
          if (apiError.success) {
            setError(apiError.data.error);
            setStatsOnly(apiError.data.stats ?? null);
          } else {
            setError("The report could not be generated. Try again.");
          }
          return;
        }

        const parsed = ReportResponse.safeParse(payload);
        if (!parsed.success) {
          setError("The report response was invalid. Try again.");
          return;
        }
        setReport(parsed.data);
        return;
      }

      if (!response.body) {
        setError("Scorched returned an empty report stream. Try again.");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let receivedResult = false;
      const handleFrame = (frame: string) => {
        const lines = frame.split("\n");
        const type = lines
          .find((line) => line.startsWith("event:"))
          ?.slice("event:".length)
          .trim();
        const data = lines
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice("data:".length).trimStart())
          .join("\n");
        if (!type || !data) return;

        let eventData: unknown;
        try {
          eventData = JSON.parse(data);
        } catch {
          setError("Scorched returned an unreadable report update. Try again.");
          receivedResult = true;
          return;
        }

        if (
          typeof eventData !== "object" ||
          eventData === null ||
          Array.isArray(eventData)
        ) {
          setError("Scorched returned an invalid report update. Try again.");
          receivedResult = true;
          return;
        }

        const parsed = StreamEvent.safeParse({ ...eventData, type });
        if (!parsed.success) {
          setError("Scorched returned an invalid report update. Try again.");
          receivedResult = true;
          return;
        }

        if (parsed.data.type === "stats") {
          setStatsOnly(parsed.data.stats);
        } else if (parsed.data.type === "report") {
          setReport(parsed.data.report);
          setStatsOnly(null);
          receivedResult = true;
        } else {
          setError(parsed.data.error);
          receivedResult = true;
        }
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          buffer += decoder.decode(value, { stream: !done });
          let boundary = buffer.indexOf("\n\n");
          while (boundary !== -1) {
            handleFrame(buffer.slice(0, boundary));
            buffer = buffer.slice(boundary + 2);
            boundary = buffer.indexOf("\n\n");
          }
          if (done) break;
        }
      } catch {
        setError("The report connection ended unexpectedly. Try again.");
        return;
      }

      if (buffer.trim()) handleFrame(buffer);
      if (!receivedResult) {
        setError("The report stream ended before the roast was ready. Try again.");
      }
    } finally {
      setPending(false);
    }
  }

  async function shareReport() {
    if (!report) return;
    setNotice(null);
    const text = reportText(report);

    try {
      if (navigator.share) {
        await navigator.share({ title: "My Scorched report", text });
        setNotice("Report shared.");
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setNotice("Sharing is unavailable here, so the report was copied.");
      } else {
        setNotice("Sharing and clipboard access are unavailable in this browser.");
      }
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      setNotice("Could not share the report. Try copying it instead.");
    }
  }

  async function copyReport() {
    if (!report) return;
    setNotice(null);

    try {
      await navigator.clipboard.writeText(reportText(report));
      setNotice("Report copied.");
    } catch {
      setNotice("Clipboard access failed. Try the Share report button instead.");
    }
  }

  function chooseSpice(value: string) {
    const parsed = Spice.safeParse(value);
    if (!parsed.success) return;
    setSpice(parsed.data);
    setReport(null);
    setStatsOnly(null);
    setError(null);
    setNotice(null);
  }

  const stats = report?.stats ?? statsOnly;

  return (
    <section className="mx-auto max-w-[90rem] px-5 pb-16 sm:px-8 sm:pb-20">
      <div className="grid items-start gap-8 py-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)] lg:gap-10 lg:py-10">
        <section
          aria-labelledby="case-file-title"
          className="min-w-0"
          id="case-file"
        >
          <div className="border-b border-hairline pb-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-content-muted">
              Personal audit / private case file
            </p>
            <h1
              className="mt-3 max-w-[17ch] font-display text-5xl font-medium leading-[1.02] tracking-[-0.04em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:text-6xl"
              id="case-file-title"
            >
              The feed has been keeping receipts.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-content-muted sm:text-lg sm:leading-8">
              Up to 200 liked videos go in. Code computes the score; Gemini
              gets to write the jokes, not the facts.
            </p>
            <p className="mt-3 text-sm leading-6 text-content-muted">
              The score arrives first. Nothing is saved after the request.
            </p>
          </div>

          <RoastControls
            error={error}
            hasReport={Boolean(report)}
            notice={notice}
            onGenerate={generateReport}
            onSpiceChange={chooseSpice}
            pending={pending}
            score={report?.roast.brainrotScore ?? statsOnly?.brainrotScore ?? null}
            spice={spice}
          />

          {report ? (
            <div className="mt-8">
              <RoastReportCard stats={report.stats} roast={report.roast} />
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  className="min-h-11 rounded-sm bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-colors hover:bg-solid hover:text-on-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  onClick={shareReport}
                  type="button"
                >
                  Share report
                </button>
                <button
                  className="min-h-11 rounded-sm border border-control bg-panel px-4 py-2 text-sm font-semibold transition-colors hover:bg-solid hover:text-on-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  onClick={copyReport}
                  type="button"
                >
                  Copy report
                </button>
                <button
                  aria-haspopup="dialog"
                  className="min-h-11 rounded-sm border border-control bg-panel px-4 py-2 text-sm font-semibold transition-colors hover:bg-solid hover:text-on-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  onClick={() => setExportOpen(true)}
                  type="button"
                >
                  Export card
                </button>
              </div>
            </div>
          ) : statsOnly ? (
            <div className="mt-8">
              <ScoreOnlyCard pending={pending} stats={statsOnly} />
            </div>
          ) : pending ? (
            <div
              aria-busy="true"
              aria-label="Checking your liked videos"
              className="mt-8 space-y-4 border border-hairline bg-panel p-6 sm:p-8"
            >
              <div aria-hidden="true" className="h-3 w-28 bg-canvas-soft" />
              <div aria-hidden="true" className="h-10 max-w-md bg-canvas-soft" />
              <div aria-hidden="true" className="h-3 max-w-xl bg-canvas-soft" />
            </div>
          ) : (
            <div className="mt-8 border border-dashed border-strong bg-canvas-soft p-6 sm:p-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-content-muted">
                Case file / unopened
              </p>
              <h2 className="mt-3 font-display text-3xl font-medium leading-tight">
                Nothing to testify yet.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-content-muted">
                Choose a roast temperature and build your report. Your score
                will appear before the jokes finish cooking.
              </p>
            </div>
          )}
        </section>

        <RoastTelemetry stats={stats} />
      </div>

      <section
        aria-labelledby="method-title"
        className="grid gap-6 border-y border-hairline py-8 sm:py-10 md:grid-cols-[0.8fr_1.2fr]"
        id="method"
      >
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-content-muted">
            The methodology
          </p>
          <h2
            className="mt-2 max-w-[12ch] font-display text-3xl font-medium leading-tight sm:text-4xl"
            id="method-title"
          >
            A roast, not a horoscope.
          </h2>
        </div>
        <div className="space-y-3 text-sm leading-6 text-content-muted">
          <p>
            Four deterministic signals set the 0–100 score. The current
            weights are explicitly uncalibrated. Gemini only supplies comedy
            and each burn cites a computed number or a video title.
          </p>
          <p>
            YouTube&apos;s liked-videos list does not include watch timestamps
            or time watched, so Scorched never claims to know your viewing
            hours or peak hours.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="privacy-title"
        className="grid gap-6 py-8 sm:py-10 md:grid-cols-[0.8fr_1.2fr]"
        id="privacy"
      >
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-content-muted">
            Privacy / by design
          </p>
          <h2
            className="mt-2 max-w-[12ch] font-display text-3xl font-medium leading-tight sm:text-4xl"
            id="privacy-title"
          >
            Read the receipts. Don&apos;t keep them.
          </h2>
        </div>
        <p className="text-sm leading-6 text-content-muted">
          Scorched reads your likes with Google&apos;s read-only permission and
          does not save the report. Gemini receives up to 40 sampled video
          titles and channel names plus computed stats to write the roast.
          Sharing or downloading happens only when you choose to export.
        </p>
      </section>

      {report && exportOpen && (
        <RoastExportDialog
          onClose={() => setExportOpen(false)}
          roast={report.roast}
          stats={report.stats}
        />
      )}
    </section>
  );
}
