import { supabase } from "@/lib/supabaseClient";
import { OrderDetail } from "@/types/OrderDetail";
import { Database } from "@/types/database.types";

type Order = Database["public"]["Tables"]["orders"]["Row"];

/**
 * 결제 주문 생성
 * @param orderData
 * @returns
 */
export const createOrder = async (
    orderId: string,
    orderData: {
        buyer_id: string;
        delivery_address: string;
        total_price: number;
        status: string;
    }
): Promise<Order> => {
    const { data, error } = await supabase
        .from("orders")
        .update(orderData)
        .eq("order_id", orderId)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

/**
 * 결제 검증 결과 받아오는 함수
 * @param paymentId - 주문 ID
 * @param impUid - 아임포트 결제 ID
 * @param order - 주문 정보 (결제 금액 등)
 */
// export const completePayment = async (payload: { impUid: string; merchantUid: string; order: any }) => {
//     // 서버가 요구하는 형식으로 재구성
//     const requestBody = {
//         imp_uid: payload.impUid,           // impUid 필드 추가
//         merchant_uid: payload.merchantUid, // 기존 paymentId를 merchant_uid로 사용
//         status: payload.order.status,                    // 결제 성공 시 status (API 문서에 맞게 수정)
//         order: payload.order,
//     };

//     console.log("🔍 결제 검증 요청:", requestBody);

//     const response = await fetch(import.meta.env.VITE_SUPABASE_FUNCTION_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(requestBody),
//         mode: "cors",
//         credentials: "include",
//     });
//     const responseBody = await response.text();

//     if (!response.ok) {
//         console.error("❌ 결제 검증 실패:", responseBody);
//         throw new Error(responseBody);
//     }

//     const data = await response.json();
//     console.log("✅ 결제 검증 성공:", data);
//     return data;
// };
export const completePayment = async (payload: { paymentId: string; order: { id: string; totalAmount: number } }) => {
    const requestBody = { paymentId: payload.paymentId, order: payload.order };
    console.log("🔍 결제 검증 요청:", requestBody);
    const response = await fetch(import.meta.env.VITE_SUPABASE_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        mode: "cors",
        credentials: "include",
    });
    const data = await response.json(); // 한 번만 읽습니다.
    if (!response.ok) {
        console.error("❌ 결제 검증 실패:", data.message);
        throw new Error(data.message);
    }
    console.log("✅ 결제 검증 성공:", data);
    return data;
};



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
}): Promise<Database["public"]["Tables"]["payments"]["Row"]> => {
    console.log("🔍 결제 상태 업데이트 요청:", paymentData);

    const { data, error } = await supabase
        .from("payments")
        .insert(paymentData)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

/**
 * 사용자 구매내역 불러오기
 * @param userId
 * @returns
 */
export const getCompletedOrders = async (userId: string): Promise<OrderDetail[]> => {
    const { data, error } = await supabase
        .from("order_details")
        .select("*")
        .eq("buyer_id", userId)
        .eq("payment_status", "Completed") // 'Completed'인 결제 상태만 필터링
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return data as OrderDetail[];
};
