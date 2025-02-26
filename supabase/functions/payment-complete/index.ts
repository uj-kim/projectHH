import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "../_shared/cors.ts";

console.log("PortOne Webhook (Payment Complete) Function Running");

/**
 * ✅ 아임포트 액세스 토큰 발급 함수
 */
async function getIamportAccessToken(): Promise<string> {
  const res = await fetch("https://api.iamport.kr/users/getToken", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imp_key: Deno.env.get("IMPORT_REST_API_KEY"),
      imp_secret: Deno.env.get("IMPORT_REST_API_SECRET"),
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to get access token: ${errorText}`);
  }

  const data = await res.json();
  if (!data.response?.access_token) {
    throw new Error("Access token not received");
  }

  return data.response.access_token;
}

Deno.serve(async (req) => {
  // ✅ Preflight OPTIONS 요청 처리 (CORS)
  if (req.method === "OPTIONS") {
    console.log("Preflight OPTIONS request received");
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // ✅ 포트원 웹훅 데이터 수신
    const webhookData = await req.json();
    console.log("🔍 Received Webhook Data:", webhookData);

    const { imp_uid, merchant_uid, status } = webhookData;

    if (!imp_uid || !merchant_uid || !status) {
      throw new Error("Missing required parameters: imp_uid, merchant_uid, status");
    }

    // ✅ 아임포트 액세스 토큰 발급
    const accessToken = await getIamportAccessToken();
    console.log("✅ Access Token Acquired");

    // ✅ imp_uid(결제 ID)로 포트원 서버에서 결제 정보 조회
    const paymentResponse = await fetch(
      `https://api.iamport.kr/payments/${encodeURIComponent(imp_uid)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      throw new Error(`Payment API error: ${errorText}`);
    }

    const payment = await paymentResponse.json();
    console.log("✅ 아임포트 결제 정보:", payment);

    const amountPaid = payment.response.amount; // 실제 결제 금액
    const statusFromPortOne = payment.response.status; // 포트원 결제 상태

    return new Response(
      JSON.stringify({ message: "Webhook processed successfully", status: statusFromPortOne }),
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
