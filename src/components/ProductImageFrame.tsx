type ProductImageFrameProps = {
  src?: string | null;
  alt: string;
  /** Includes layout, border (e.g. luxury-card), rounding, and height. */
  className: string;
  priority?: boolean;
};

/** Product photo in a fixed frame without cropping (`object-contain`). */
export function ProductImageFrame({ src, alt, className, priority = false }: ProductImageFrameProps) {
  return (
    <div className={className}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote catalog URLs; next/image domains not configured
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-contain"
          loading={priority ? "eager" : "lazy"}
          {...(priority ? { fetchPriority: "high" as const } : {})}
        />
      ) : null}
    </div>
  );
}
