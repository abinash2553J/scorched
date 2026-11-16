import Image from "next/image";

export function ScorchedBrand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <Image
        alt=""
        aria-hidden="true"
        className={`shrink-0 ${
          compact ? "h-5 w-[18px]" : "h-[27px] w-6"
        }`}
        height={28}
        src="/flame.svg"
        width={25}
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
