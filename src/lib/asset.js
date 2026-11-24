// Resolves a /public path relative to the page, so dist/ also works from disk.
export const asset = (p) => import.meta.env.BASE_URL + p.replace(/^\//, "");
