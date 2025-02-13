export const getImgixUrl = (
    originalUrl: string,
    options: { fm?: string; q?:string } = { fm: 'webp', q:'70' }
  ): string => {
    const imgixDomain = 'https://hanghae-805378545.imgix.net';
    // Supabase의 public URL 경로에서 실제 파일 경로만 추출 (예: '/your-bucket/path/to/image.jpg')
    const urlPath = new URL(originalUrl).pathname.split('/object/public/category-images/')[1];
    const params = new URLSearchParams(options).toString();
    return `${imgixDomain}/${urlPath}?${params}`;
  };
  