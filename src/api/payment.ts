import { supabase } from "@/lib/supabaseClient";
import { OrderDetail } from "@/types/OrderDetail";
import { Database } from "@/types/database.types";

type Order = Database['public']['Tables']['orders']['Row']

/**
 * 결제 주문 생성
 * @param orderData
 * @returns
 */

export const createOrder = async (orderId: string, orderData: {
    buyer_id: string;
    delivery_address: string;
    total_price: number;
    status: string;
}): Promise<Order> => {
    const {data, error} = await supabase
    .from('orders')
    .update(orderData)
    .eq('order_id', orderId)
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

/*사용자 구매내역 불러오기*/
/**
 * @param userId
 * @returns
 */
export const getCompletedOrders = async( userId : string): Promise<OrderDetail[]> => {
    const {data, error} = await supabase
    .from('order_details')
    .select('*')
    .eq('buyer_id', userId)
    .eq('payment_status', 'Completed') // 'Completed'인 결제 상태만 필터링
    .order('created_at', {ascending: false})

    if(error) {
        throw new Error(error.message);
    }

    return data as OrderDetail[];
}