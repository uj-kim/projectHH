export const getImgixUrl = (
  originalUrl: string,
  options: { fm?: string; q?: string; w?: string; h?: string; fit?: string } = {
    fm: "webp",
    q: "90",
    w: "192", // 실제 요청 크기를 늘림
    h: "192",
    fit: "max",
  }
): string => {
  const imgixDomain = "https://hanghae-805378545.imgix.net";
  const urlPath = new URL(originalUrl).pathname.split(
    "/object/public/category-images/"
  )[1];
  const params = new URLSearchParams(options).toString();
  return `${imgixDomain}/${urlPath}?${params}`;
};
