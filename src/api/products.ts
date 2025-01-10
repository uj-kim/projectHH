import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/database.types';
import imageCompression from 'browser-image-compression';

/**
 * 카테고리 목록 가져오기
*/
export const getCategories = async (): Promise<
 { category_id: string; category_name: string }[]> => {
    console.log('getCategoreis 호출됨'); //ok
 const { data, error } = await supabase
   .from('categories')
   .select('category_id, category_name')
   .order('category_name', { ascending: true });

   console.log('카테고리데이터', data);
   console.log('카테고리 오류', error);

 if (error) {
   console.error('카테고리 조회 오류:', error.message);
   throw new Error(error.message);
 }

 return data;
};

/**
 * 이미지 업로드 및 최적화 함수
 * @param file - 업로드할 이미지 파일
 * @param userId - 현재 로그인한 사용자의 ID
 * @returns 업로드된 이미지의 URL
 * @throws 이미지 업로드 또는 최적화 실패 시 에러
 */

export const uploadOptimizedImage = async (file: File, userId: string): Promise<string> => {
      // 이미지 압축 및 WebP 변환 옵션 설정
      const options = {
          maxSizeMB: 1, // 최대 파일 크기 1MB
          maxWidthOrHeight: 1920, // 최대 너비 또는 높이 1920px
          useWebWorker: true,
          fileType: 'image/webp',
      };

      // 이미지 압축 및 변환
      const compressedFile = await imageCompression(file, options);

      // 고유 파일 이름 생성
      const fileName = `products/${userId}/${Date.now()}_${compressedFile.name}`;

      // Supabase Storage에 이미지 업로드
      const { data, error } = await supabase.storage
          .from('product-images') // 스토리지 버킷 이름
          .upload(fileName, compressedFile, {
              cacheControl: '3600',
              upsert: false,
              contentType: 'image/webp', // WebP 형식 지정
          });

      if (error) {
          throw new Error(error.message);
      }
      console.log('업로드 데이터: ',data);

      // 업로드된 이미지의 공개 URL 가져오기
      const { data: publicUrlData } = supabase
          .storage
          .from('product-images')
          .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
};


  /**
 * 상품 등록 함수
 * @param params - 상품 데이터 (카테고리 ID 및 판매자 ID 제외)
 * @param categoryName - 입력받은 카테고리 이름
 * @param userId - 현재 로그인한 사용자의 ID
 * @returns 등록된 상품 데이터 또는 null
 */


export const createProduct = async (
  params:{
    product: Omit<Database['public']['Tables']['products']['Insert'], 'category_id' | 'seller_id' | 'product_id'>&{image_url: string};
    categoryId: string;
    userId: string;
  }): Promise<Database['public']['Tables']['products']['Row'] | null> => {
    const {product, categoryId, userId} = params;
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
): Promise<Database['public']['Tables']['products']['Row'][]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', sellerId) // 판매자 ID 조건
    .gt('quantity', 0) // 재고 수량이 0보다 큰 상품만 가져오기
    .order('created_at', { ascending: false }); // 최신순 정렬

  if (error) {
    console.error('판매자 상품 목록 가져오기 오류:', error.message);
    throw new Error(error.message);
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
): Promise<Database['public']['Tables']['products']['Row']> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('product_id', productId)
      .single(); // 단일 레코드 가져오기

    if (error) {
      console.error(`상품 조회 오류 (${productId}):`, error.message);
      throw new Error(error.message)
    }
    
    return data;
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
export const deleteProduct = async (productId: string): Promise<void> => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('product_id', productId);

    if (error) {
      console.error('Error deleting product:', error);
      throw new Error(error.message);
    }
};