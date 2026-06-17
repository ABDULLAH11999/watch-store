export function normalizeMediaUrl(url: string) {
  const trimmed = (url || "").trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  const withoutQuery = trimmed.split("?")[0].split("#")[0];
  const normalized = withoutQuery
    .replace(/^\/uploads\/products\//, "/watches/")
    .replace(/^\/uploads\/watch\//, "/watches/")
    .replace(/^\/uploads\/testimonials\//, "/testimonials/")
    .replace(/^\/watch\//, "/watches/")
    .replace(/^\/testimonial\//, "/testimonials/");

  return normalized;
}
