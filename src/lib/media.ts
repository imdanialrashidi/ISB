import type { ImageMetadata } from "astro";

/**
 * Build-time raster image sources (Astro-managed, optimized to responsive WebP
 * during the build; see the Cloudflare adapter's `imageService: "compile"`).
 *
 * Content JSON keeps referring to these images with their legacy public paths
 * (`/images/...`); the basename maps that stable identifier to the imported
 * source asset. Only raster files live here — SVG placeholders stay in
 * `public/images/placeholders/` and are served as-is.
 */
const rasterAssets = import.meta.glob("../assets/images/**/*.{jpg,jpeg,png}", {
  eager: true,
  import: "default",
}) as Record<string, ImageMetadata>;

const byBasename = new Map<string, ImageMetadata>();
for (const [globKey, metadata] of Object.entries(rasterAssets)) {
  const basename = globKey.split("/").pop();
  if (!basename) continue;
  if (byBasename.has(basename)) {
    throw new Error(
      `Duplicate raster asset basename \`${basename}\` under src/assets/images; ` +
        "content paths resolve images by basename, so names must be unique.",
    );
  }
  byBasename.set(basename, metadata);
}

/**
 * Resolve a legacy `/images/...` content path to its Astro-managed source.
 * Returns undefined for paths without a managed raster source (e.g. SVG
 * placeholders), which callers then render as a plain <img>.
 */
export function resolveRaster(publicPath: string | undefined): ImageMetadata | undefined {
  if (!publicPath || !publicPath.startsWith("/images/")) return undefined;
  return byBasename.get(publicPath.split("/").pop() ?? "");
}

/**
 * Shared responsive options for the 16:9 card images (homepage highlight
 * cards and service cards). Rendered at ~144px height with a ~2.4:1 crop via
 * CSS `object-cover`, so variants are generated at the 16:9 source ratio and
 * the existing CSS crop is preserved exactly.
 */
export const cardImageOptions = {
  widths: [480, 640, 960],
  sizes: "(min-width: 1280px) 520px, (min-width: 768px) 560px, 100vw",
  width: 640,
  height: 360,
  fit: "cover" as const,
  format: "webp" as const,
  quality: 82,
};

/** Shared responsive options for the brand logo (header + footer). */
export const logoImageOptions = {
  widths: [144, 288],
  sizes: "(min-width: 640px) 144px, 131px",
  width: 144,
  height: 44,
  format: "webp" as const,
  quality: 90,
};
