import Image from "next/image";

export function SkyLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="sky-logo" aria-label="SkySearch">
      <Image
        alt=""
        aria-hidden="true"
        height={compact ? 34 : 44}
        src="/brand/skysearch-mark.svg"
        width={compact ? 34 : 44}
      />
      {!compact && (
        <span>
          <strong>SkySearch</strong>
          <small>Aviation Command</small>
        </span>
      )}
    </span>
  );
}
