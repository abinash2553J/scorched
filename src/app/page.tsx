import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { auth, signIn, signOut } from "@/auth";
import { RoastWorkspace } from "./roast/roast-workspace";
import { ScorchedBrand } from "./scorched-brand";

function SignInForm() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: "/" });
      }}
      id="get-started"
    >
      <button
        className="min-h-12 rounded-sm bg-accent px-6 py-3 font-semibold text-on-accent transition-colors hover:bg-solid hover:text-on-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        type="submit"
      >
        Put my likes on trial
      </button>
    </form>
  );
}

function ScoringReceipt() {
  return (
    <article
      aria-labelledby="sample-title"
      className="relative mx-auto w-full max-w-lg border border-control bg-panel p-6 text-content shadow-[6px_6px_0_var(--line-strong)] sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="inline-flex items-center gap-2 font-semibold">
          <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
          Exhibit A
        </span>
        <span className="font-mono text-xs text-content-faint">
          Fictional sample
        </span>
      </div>

      <div className="my-5 border-t border-dashed border-strong" />

      <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-sm text-content-muted">Brainrot score</p>
          <h2
            className="mt-1 font-display text-6xl font-medium leading-none tracking-tight"
            id="sample-title"
          >
            68<span className="ms-1 font-mono text-lg text-content-muted">/100</span>
          </h2>
        </div>
        <p className="w-fit border-s-2 border-accent ps-3 text-sm leading-5">
          The “one more video”<br />committee chair
        </p>
      </div>

      <p className="mt-6 max-w-md font-display text-2xl leading-[1.25]">
        A third of these likes were Shorts. At this rate, your thumb deserves
        employee benefits.
      </p>
      <p className="mt-4 border-s-2 border-accent ps-3 text-sm leading-6 text-content-muted">
        Shorts: 28 of 84 liked videos
      </p>
      <p className="mt-6 border-t border-dashed border-strong pt-4 text-xs leading-5 text-content-muted">
        Made-up score and data. Your report uses your own likes and cites its
        evidence.
      </p>
    </article>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-content">
      <a
        className="sr-only rounded-sm bg-solid px-4 py-3 text-on-solid focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        href="#main-content"
      >
        Skip to main content
      </a>
      <header className="border-b border-hairline">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link
            aria-label="Scorched home"
            className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            href="/"
          >
            <ScorchedBrand />
          </Link>
          <nav
            aria-label="Main navigation"
            className="flex items-center gap-3 sm:gap-5"
          >
            <a
              className="hidden text-sm text-content-muted underline-offset-4 hover:text-content hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:inline"
              href="#method"
            >
              The method
            </a>
            <a
              className="hidden text-sm text-content-muted underline-offset-4 hover:text-content hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:inline"
              href="#privacy"
            >
              Privacy
            </a>
            <a
              className="whitespace-nowrap rounded-sm border border-control px-3 py-2.5 text-sm font-semibold text-content transition-colors hover:bg-solid hover:text-on-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:px-4"
              href="#get-started"
            >
              Get roasted
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-content-muted">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
              A YouTube roast with receipts
            </p>
            <h1
              className="mt-5 max-w-[13ch] font-display text-5xl font-medium leading-[0.98] tracking-[-0.045em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:text-7xl"
              id="main-content"
              tabIndex={-1}
            >
              Your likes have a paper trail.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-content-muted">
              And it&apos;s not helping your case. Scorched checks up to 200
              liked videos, counts four real patterns, then lets Gemini roast
              only what the evidence can prove.
            </p>
            <div className="mt-8">
              <SignInForm />
              <p className="mt-3 max-w-sm text-sm leading-6 text-content-muted">
                Google sign-in. Read-only access to your likes. Nothing saved
                after the report.
              </p>
            </div>
          </div>

          <ScoringReceipt />
        </section>

        <section
          aria-labelledby="method-title"
          className="border-y border-hairline bg-panel"
          id="method"
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:gap-16 md:py-20">
            <div>
              <h2
                className="max-w-[12ch] font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl"
                id="method-title"
              >
                A roast, not a horoscope.
              </h2>
              <p className="mt-4 max-w-md leading-7 text-content-muted">
                No mysterious personality science. Just observable habits and
                jokes attached to the receipts.
              </p>
            </div>

            <ol className="grid gap-8 sm:grid-cols-3">
              <li className="border-t-2 border-accent pt-4">
                <p className="font-mono text-xs text-content-muted">
                  01 / Connect
                </p>
                <h3 className="mt-3 font-semibold">Bring your likes</h3>
                <p className="mt-2 text-sm leading-6 text-content-muted">
                  Google grants read-only access. Scorched can look, not touch.
                </p>
              </li>
              <li className="border-t-2 border-strong pt-4">
                <p className="font-mono text-xs text-content-muted">
                  02 / Count
                </p>
                <h3 className="mt-3 font-semibold">Let code do the math</h3>
                <p className="mt-2 text-sm leading-6 text-content-muted">
                  Four signals set your score. No vibes, no invented numbers.
                </p>
              </li>
              <li className="border-t-2 border-strong pt-4">
                <p className="font-mono text-xs text-content-muted">
                  03 / Roast
                </p>
                <h3 className="mt-3 font-semibold">Hear the verdict</h3>
                <p className="mt-2 text-sm leading-6 text-content-muted">
                  Gemini writes the jokes. Every burn points to a number or
                  title.
                </p>
              </li>
            </ol>
          </div>
        </section>

        <section
          aria-labelledby="privacy-title"
          className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 md:grid-cols-[1fr_auto] md:items-center md:py-16"
          id="privacy"
        >
          <div>
            <h2
              className="font-display text-3xl font-medium tracking-tight sm:text-4xl"
              id="privacy-title"
            >
              Your likes leave no permanent record.
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-content-muted">
              Scorched doesn&apos;t store your likes or report. Gemini receives
              up to 40 sampled video titles and channel names, plus computed
              stats, to write the roast. That&apos;s the whole case file.
            </p>
          </div>
          <a
            className="w-fit rounded-sm border border-control px-5 py-3 text-sm font-semibold transition-colors hover:bg-solid hover:text-on-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            href="#get-started"
          >
            Put my likes on trial
          </a>
        </section>
      </main>

      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-sm text-content-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span className="text-content">
            <ScorchedBrand compact />
          </span>
          <span>We read the receipts. We don&apos;t keep them.</span>
        </div>
      </footer>
    </div>
  );
}

function SignedInApp() {
  return (
    <div className="min-h-screen bg-canvas text-content">
      <a
        className="sr-only rounded-sm bg-solid px-4 py-3 text-on-solid focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        href="#main-content"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-30 border-b border-hairline bg-canvas">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <Link
            aria-label="Scorched home"
            className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            href="/"
          >
            <ScorchedBrand />
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <nav aria-label="Report navigation" className="flex items-center gap-3 sm:gap-5">
              <a
                className="text-sm text-content underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                href="#case-file"
              >
                Report
              </a>
              <a
                className="hidden text-sm text-content-muted underline-offset-4 hover:text-content hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:inline"
                href="#telemetry"
              >
                Telemetry
              </a>
              <a
                className="hidden text-sm text-content-muted underline-offset-4 hover:text-content hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent md:inline"
                href="#method"
              >
                Method
              </a>
            </nav>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.08em] text-content-faint lg:inline">
              Google connected
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                className="min-h-10 whitespace-nowrap rounded-sm border border-control px-3 py-2 text-sm font-semibold transition-colors hover:bg-solid hover:text-on-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                type="submit"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>
        <RoastWorkspace />
      </main>
    </div>
  );
}

async function HomeContent() {
  await connection();
  const session = await auth();

  return session ? <SignedInApp /> : <LandingPage />;
}

function HomeLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-6 text-content">
      <p aria-live="polite" className="text-sm text-content-muted" role="status">
        Checking your Scorched session...
      </p>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent />
    </Suspense>
  );
}
