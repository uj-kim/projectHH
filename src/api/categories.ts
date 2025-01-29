// 상품 등록 관련 카테고리는 products.ts에 있음(getCategoryNames)
// 메인페이지에서 카테고리 불러오기
import { supabase } from "@/lib/supabaseClient";

export const getAllCategories = async () => {
    const {data, error} = await supabase.from('categories').select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

//카테고리 페이지_ 해당 카테고리 이름 표시
export const getCategoryById = async (category_id: string) => {
    const {data, error} = await supabase
    .from('categories')
    .select('*')
    .eq('category_id', category_id)
    .single()

    if(error) {
        throw new Error(error.message);
    }
    return data;
}