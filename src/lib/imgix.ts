export const getImgixUrl = (
  originalUrl: string,
  options: { fm?: string; q?: string; w?: string; h?: string; fit?: string } = {
    fm: 'webp',
    q: '75',
    w: '192',
    h: '192',
    fit: 'max',
  }
): string => {
  const imgixDomain = 'https://hanghae-805378545.imgix.net';
  // Supabase의 public URL 경로에서 '/object/public/category-images/' 이후의 파일 경로만 추출
  const urlPath = new URL(originalUrl).pathname.split('/object/public/category-images/')[1];
  const params = new URLSearchParams(options).toString();
  return `${imgixDomain}/${urlPath}?${params}`;
};
