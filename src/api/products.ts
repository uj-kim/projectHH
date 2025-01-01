import { supabase } from '@/lib/supabaseClient';
//import { Product } from '@/types';
import { Database } from '@/types/database.types';

// interface CreateProductInput {
//     seller_id: string;
//     product_name: string;
//     price: number;
//     quantity: number;
//     description: string;
//     category_id: string;
//     image_url?: string | null;
// }

// export const createProduct = async (product: CreateProductInput): Promise<Product> => {
//     const { data, error } = await supabase.from('products').insert(product).select().returns<Product>();

//     if (error) {
//         throw new Error(error.message);
//     }

//     return data;
//     //as는 조심해서 사용!
// };

/**
 * 카테고리 목록 가져오기
*/
export const getCategories = async (): Promise<
 { category_id: string; category_name: string }[] | null> => {
    console.log('getCategoreis 호출됨'); //ok
 const { data, error } = await supabase
   .from('categories')
   .select('category_id, category_name')
   .order('category_name', { ascending: true });

   console.log('카테고리데이터', data);
   console.log('카테고리 오류', error);

 if (error) {
   console.error('카테고리 조회 오류:', error.message);
   return null;
 }

 return data;
};

/**
 * 이미지 업로드 함수
 * @param file - 업로드할 이미지 파일
 * @returns 업로드된 이미지의 URL 또는 null
 */
export const uploadImage = async (file: File): Promise<string | null> => {
    const fileName = `products/${Date.now()}_${file.name}`; // 고유 파일 이름 생성
    const { data, error } = await supabase.storage
      .from('product-images') // 스토리지 버킷 이름
      .upload(fileName, file);
  
    if (error) {
      console.error('이미지 업로드 오류:', error.message);
      return null;
    }
    console.log('업로드데이터', data)
  
    // Public URL 생성
    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);
  
    return publicUrlData?.publicUrl || null;
  };

  /**
 * 상품 등록 함수
 * @param product - 상품 데이터 (카테고리 ID 및 판매자 ID 제외)
 * @param categoryName - 입력받은 카테고리 이름
 * @param userId - 현재 로그인한 사용자의 ID
 * @returns 등록된 상품 데이터 또는 null
 */


export const createProduct = async (
    product: Omit<Database['public']['Tables']['products']['Insert'], 'category_id' | 'seller_id'>&{image_url: string},
    categoryId: string,
    userId: string
  ): Promise<Database['public']['Tables']['products']['Row'] | null> => {
    // 상품 등록
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...product,
        category_id: categoryId, // 조회한 카테고리 ID 사용
        seller_id: userId, // 판매자 ID
      })
      .select()
      .single();
  
    if (error) {
      console.error('상품 등록 오류:', error.message);
      return null;
    }
  
    return data;
  };