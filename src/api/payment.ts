import { supabase } from "@/lib/supabaseClient";
import { Database } from "@/types/database.types";

/**
 * 결제 주문 생성
 * @param orderData
 * @returns
 */

export const createOrder = async (orderData: {
    buyer_id: string;
    delivery_address: string;
    total_price: number;
}): Promise<Database['public']['Tables']['orders']['Row']> => {
    const {data, error} = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single();

    if(error){
        throw new Error(error.message);
    }

    return data;
}

/**
 * 결제 상태 업데이트 함수
 * @param paymentData
 * @returns
 */
export const updatePaymentStatus = async (paymentData: {
    order_id: string;
    user_id: string;
    payment_method: string;
    payment_status: string;
}): Promise<Database['public']['Tables']['payments']['Row']> => {
    console.log(paymentData);
    const {data, error} = await supabase
    .from('payments')
    .insert(paymentData)
    .select()
    .single()

    if(error){
        throw new Error(error.message);
    }

    return data;
}