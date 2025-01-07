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

/**
 * 모든 상품 목록 가져오기
 */
export const getProducts = async (): Promise<
  Database['public']['Tables']['products']['Row'][]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false }); // 최신순 정렬

  if (error) {
    console.error('상품 목록 가져오기 오류:', error.message);
    throw new Error(error.message);
  }

  return data;
};

/**
 * 판매자 상품 목록 가져오기
 * @param sellerId - 판매자 ID
 * @returns 판매 중인 상품 목록
 */
export const getSellerProducts = async (
  sellerId: string
): Promise<Database['public']['Tables']['products']['Row'][] | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', sellerId) // 판매자 ID 조건
    .gt('quantity', 0) // 재고 수량이 0보다 큰 상품만 가져오기
    .order('created_at', { ascending: false }); // 최신순 정렬

  if (error) {
    console.error('판매자 상품 목록 가져오기 오류:', error.message);
    return null;
  }

  return data;
};

/**
 * 특정 상품의 상세 정보를 가져오는 함수
 * @param productId - 조회할 상품의 ID
 * @returns - 해당 상품의 정보 또는 null
 * @throws - 네트워크 오류 또는 서버 오류 발생 시 에러
 */
export const getProductById = async (
  productId: string
): Promise<Database['public']['Tables']['products']['Row'] | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('product_id', productId)
      .single(); // 단일 레코드 가져오기

    if (error) {
      console.error(`상품 조회 오류 (${productId}):`, error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error('상품 조회 중 예기치 않은 오류:', error);
    return null;
  }
};

/**
 * 특정 상품의 정보를 업데이트하는 함수
 * @param product - 업데이트할 상품의 데이터
 * @returns - 업데이트된 상품의 정보 또는 null
 * @throws - 네트워크 오류 또는 서버 오류 발생 시 에러
 */
export const updateProduct = async (
  product: Database['public']['Tables']['products']['Update'] & { product_id: string }
): Promise<Database['public']['Tables']['products']['Row'] | null> => {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('product_id', product.product_id)
      .select('*')
      .single(); // 업데이트된 단일 레코드 가져오기

    if (error) {
      console.error(`상품 업데이트 오류 (${product.product_id}):`, error.message);
      return null;
    }

    return data;
};

// **삭제하기 함수 추가**
export const deleteProduct = async (productId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('product_id', productId);

    if (error) {
      console.error('Error deleting product:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error deleting product:', error);
    return false;
  }
};