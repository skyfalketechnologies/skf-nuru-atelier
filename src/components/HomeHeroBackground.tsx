"use client";

import { useId, useMemo } from "react";

function buildSlideKeyframes(n: number): string {
  let rules = "";
  for (let i = 0; i < n; i++) {
    const segment = 100 / n;
    const holdStart = i * segment;
    const holdEnd = (i + 0.88) * segment;
    const transform = i === 0 ? "translateX(0)" : `translateX(calc(-100% * ${i} / ${n}))`;
    rules += `${holdStart}%, ${holdEnd}% { transform: ${transform}; }\n`;
  }
  rules += "100% { transform: translateX(0); }\n";
  return rules;
}

export function HomeHeroBackground({ imageUrls }: { imageUrls: string[] }) {
  const safe = imageUrls.filter((u) => typeof u === "string" && u.trim().length > 0);
  const uid = useId().replace(/:/g, "");
  const n = safe.length;

  const { keyframesCss, animationDuration } = useMemo(() => {
    if (n <= 1) return { keyframesCss: "", animationDuration: 0 };
    const dur = Math.max(12, n * 6);
    return {
      keyframesCss: `@keyframes homeHero_${uid} {\n${buildSlideKeyframes(n)}}`,
      animationDuration: dur,
    };
  }, [n, uid]);

  if (n <= 1) {
    const url = safe[0];
    if (!url) return null;
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${url})` }} />
      </div>
    );
  }

  return (
    <>
      {keyframesCss ? <style dangerouslySetInnerHTML={{ __html: keyframesCss }} /> : null}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden>
        <div
          className="flex h-full"
          style={{
            width: `${n * 100}%`,
            maxWidth: "none",
            animation: `homeHero_${uid} ${animationDuration}s ease-in-out infinite`,
          }}
        >
          {safe.map((url, i) => (
            <div
              key={`${i}-${url}`}
              className="h-full shrink-0 bg-cover bg-center"
              style={{
                flex: `0 0 ${100 / n}%`,
                backgroundImage: `url(${url})`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
