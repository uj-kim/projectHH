import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from '../_shared/cors.ts'
console.log("Payment Complete Function Running");

Deno.serve(async (req) => {
  // Preflight 요청(OPTIONS) 처리
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 204, headers: corsHeaders });
  }

  try {
    // 클라이언트에서 paymentId와 주문 정보를 전달받음
    const { paymentId, order } = await req.json();

    // 환경변수에서 PortOne V2 API 시크릿을 가져옴
    const portoneApiSecret = Deno.env.get("VITE_V2_API_SECRET");
    if (!portoneApiSecret) {
      throw new Error("VITE_V2_API_SECRET is not set");
    }

    // PortOne 결제 조회 API 호출
    const paymentResponse = await fetch(
      `https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
      {
        headers: {
          Authorization: `PortOne ${portoneApiSecret}`,
        },
      }
    );
    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      throw new Error(`Payment API error: ${errorText}`);
    }
    const payment = await paymentResponse.json();

    // 주문 정보와 실제 결제 금액 비교
    if (order.amount !== payment.amount.total) {
      throw new Error("결제 금액 불일치: 위/변조 의심");
    }

    // 결제 상태에 따른 추가 처리 (예: PAID 또는 VIRTUAL_ACCOUNT_ISSUED)
    if (payment.status === "PAID") {
      console.info("결제 완료", payment);
    } else if (payment.status === "VIRTUAL_ACCOUNT_ISSUED") {
      console.info("가상계좌 발급", payment);
    }

    // 결제 상태를 클라이언트에 반환
    const data = { status: payment.status };
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e: any) {
    const errorData = { status: "FAILED", message: e.message };
    return new Response(JSON.stringify(errorData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
