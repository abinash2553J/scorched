export function ScorchedBrand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className="size-2 shrink-0 rounded-full bg-accent"
      />
      <span
        className={`font-display font-semibold leading-none tracking-[-0.04em] ${
          compact ? "text-xl sm:text-[1.65rem]" : "text-[1.65rem]"
        }`}
      >
        scorched
      </span>
      </span>
  );
}
