// supabase/payment-complete/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

console.log("PortOne Webhook (Payment Complete) Function Running");

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function getIamportAccessToken(): Promise<string> {
  const res = await fetch("https://api.portone.io/login/api-secret", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiSecret: Deno.env.get("V2_API_SECRET") }),
  });
  console.log("res:", res);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to get access token: ${errorText}`);
  }
  const data = await res.json();
  console.log("🔑 Access Token Response:", data);
  if (!data?.accessToken) {
    throw new Error("Access token not received");
  }
  return data.accessToken;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    console.log("Preflight OPTIONS request received");
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // 클라이언트는 { paymentId, order: { id: orderNumber, totalAmount } } 형태로 전달합니다.
    const webhookData = await req.json();
    console.log("🔍 Received Webhook Data:", webhookData);
    const { paymentId, order } = webhookData;
    if (!paymentId || !order || !order.id || order.totalAmount === undefined) {
      throw new Error("Missing required parameters: paymentId, order.id and order.totalAmount");
    }
    const orderNumber = order.id; // supabase orders 테이블의 주문번호
    const clientExpectedAmount = order.totalAmount; // 클라이언트가 전달한 주문 총금액
    console.log("✅ 클라이언트 전달 예상 금액:", clientExpectedAmount);

    // 1. 액세스 토큰 발급
    const accessToken = await getIamportAccessToken();
    console.log("✅ Access Token Acquired");

    // 2. 결제 사전등록 API 호출 (헤더에 accessToken 포함)
    // const preRegisterResponse = await fetch(
    //   `https://api.portone.io/payments/${encodeURIComponent(paymentId)}/pre-register`,
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${accessToken}`,
    //     },
    //     body: JSON.stringify({ paymentId }),
    //   }
    // );
    // if (!preRegisterResponse.ok) {
    //   const errorText = await preRegisterResponse.text();
    //   throw new Error(`Pre-register API error: ${errorText}`);
    // }
    // console.log("✅ 결제 사전등록 API 호출 성공");

    // 3. PortOne API 호출 – paymentId(merchant_uid)로 결제 상세 정보 조회
    const paymentResponse = await fetch(
      `https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      throw new Error(`Payment API error: ${errorText}`);
    }
    const paymentResult = await paymentResponse.json();
    console.log("✅ PortOne 결제 정보:", paymentResult);

    // 실제 응답 JSON 구조에 따른 결제 금액 및 상태 추출
    const amountPaid = paymentResult.amount.paid;
    const statusFromPortOne = paymentResult.status;

    // 4. 검증: 클라이언트가 전달한 주문 총금액과 실제 결제 금액, 그리고 결제 상태 비교
    if (clientExpectedAmount !== amountPaid) {
      throw new Error("결제 금액 불일치: 위변조 의심");
    }
    if (statusFromPortOne !== "PAID") {  // "PAID"와 비교
      throw new Error("결제 상태가 유효하지 않습니다.");
    }

    // 5. 검증 성공 
    return new Response(
      JSON.stringify({
        message: "Webhook processed successfully",
        status: statusFromPortOne,
        imp_uid: paymentId,
        order: orderNumber,
        amount: amountPaid
            }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (e: any) {
    console.error("❌ Webhook processing failed:", e.message);
    return new Response(
      JSON.stringify({ status: "FAILED", message: e.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
