import { useEffect, useRef } from "react";
const loadedScripts = new Set<string>();

interface AdBannerProps {
  width: number;
  height: number;
  className: string;
  domain: string;
  affQuery: string;
  placementName: string;
}

// Prevent duplicate loads per placement
const loadedPlacements = new Set<string>();

export function AdBanner({
  width,
  height,
  className,
  domain,
  affQuery,
  placementName,
}: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  const container = containerRef.current;
  if (!container) return;

  const normalizedDomain = domain.startsWith("http")
    ? domain
    : `https:${domain}`;

  // Create <ins>
  const ins = document.createElement("ins");
  ins.style.width = `${width}px`;
  ins.style.height = `${height}px`;
  ins.style.display = "inline-block";
  ins.className = className;
  ins.setAttribute("data-width", String(width));
  ins.setAttribute("data-height", String(height));
  ins.setAttribute("data-domain", normalizedDomain);
  ins.setAttribute("data-affquery", affQuery);

  container.appendChild(ins);

  // Load script ONCE per domain
  if (!loadedScripts.has(normalizedDomain)) {
    loadedScripts.add(normalizedDomain);

    const script = document.createElement("script");
    script.src = `${normalizedDomain}${affQuery}`;
    script.async = true;
    script.defer = true;

    document.body.appendChild(script);
  }

  return () => {
    container.innerHTML = "";
  };
}, [width, height, className, domain, affQuery]);

  return (
    <div
      ref={containerRef}
      className="flex justify-center items-center overflow-hidden max-w-full"
      data-placement={placementName}
    />
  );
}

// ─────────────────────────────────────
// Pre-configured ad components (KEEP THESE)
// ─────────────────────────────────────

export function MiniBannerAd() {
  return (
    <AdBanner
      width={468}
      height={60}
      className="jf93c9f9f58"
      domain="//data527.click"
      affQuery="/16a22f324d5687c1f7a4/f93c9f9f58/?placementName=MiniBanner"
      placementName="MiniBanner"
    />
  );
}

export function LargeBannerAd() {
  return (
    <AdBanner
      width={728}
      height={90}
      className="sfb45f70481"
      domain="//data527.click"
      affQuery="/a4127c19028b6c01ba5c/fb45f70481/?placementName=LargeBanner"
      placementName="LargeBanner"
    />
  );
}

export function SidebarAd() {
  return (
    <AdBanner
      width={300}
      height={250}
      className="m5afd89751f"
      domain="//data527.click"
      affQuery="/5fbf3d48481d384a64a7/5afd89751f/?placementName=LargeBanner"
      placementName="SidebarAd"
    />
  );
}
