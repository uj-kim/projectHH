// 상품 등록 관련 카테고리는 products.ts에 있음(getCategoryNames)
// 메인페이지에서 카테고리 불러오기
import { supabase } from "@/lib/supabaseClient";
import { getImgixUrl } from "@/lib/imgix";

export const getAllCategories = async () => {
  const { data, error } = await supabase.from('categories').select('*');

  if (error) {
    throw new Error(error.message);
  }

  // 각 카테고리의 이미지 URL을 Imgix URL로 변환
  const optimizedData = data.map((category) => ({
    ...category,
    category_image_url: category.category_image_url
      ? getImgixUrl(category.category_image_url)
      : null,
  }));

  return optimizedData;
};

// 카테고리 페이지 - 해당 카테고리 이름 표시
export const getCategoryById = async (category_id: string) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('category_id', category_id)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  
  if (data.category_image_url) {
    data.category_image_url = getImgixUrl(data.category_image_url);
  }

  return data;
};
