import Link from "next/link";

type Props = {
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
};

export function HomeHeroCtas({ primaryHref, primaryLabel, secondaryHref, secondaryLabel }: Props) {
  const primaryExternal = /^https?:\/\//i.test(primaryHref);
  const secondaryExternal = /^https?:\/\//i.test(secondaryHref);

  const primaryClass =
    "rounded-full bg-gold px-6 py-3 text-sm font-medium text-black hover:opacity-90";
  const secondaryClass = "gold-border rounded-full px-6 py-3 text-sm text-gold hover:bg-gold/10";

  return (
    <div className="relative z-[1] mt-9 flex flex-wrap gap-3">
      {primaryExternal ? (
        <a href={primaryHref} className={primaryClass} target="_blank" rel="noopener noreferrer">
          {primaryLabel}
        </a>
      ) : (
        <Link href={primaryHref} className={primaryClass}>
          {primaryLabel}
        </Link>
      )}
      {secondaryExternal ? (
        <a href={secondaryHref} className={secondaryClass} target="_blank" rel="noopener noreferrer">
          {secondaryLabel}
        </a>
      ) : (
        <Link href={secondaryHref} className={secondaryClass}>
          {secondaryLabel}
        </Link>
      )}
    </div>
  );
}
