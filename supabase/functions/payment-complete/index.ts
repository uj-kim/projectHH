import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Payment Complete Function Running")

// CORS 헤더 설정
const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*", // 또는 "https://project-hh-nine.vercel.app"로 제한 가능
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

Deno.serve(async (req) => {
  // const { name } = await req.json()
  // const data = {
  //   message: `Hello ${name}!`,
  // }
  // OPTIONS 요청 처리 (preflight)
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  try {
    // 클라이언트에서 paymentId와 주문 정보 전달 받기
    const { paymentId, order } = await req.json();

    // 환경변수에서 PortOne V2 API 시크릿을 가져오기기
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

      // 클라이언트에서 전달받은 주문 정보의 금액과 실제 결제 금액 비교 (order.amount와 payment.amount.total)
    if (order.amount !== payment.amount.total) {
      throw new Error("결제 금액 불일치: 위/변조 의심");
    }

    // 결제 상태에 따른 추가 처리 로직 (예: 결제 완료, 가상계좌 발급 등)
    if (payment.status === "PAID") {
      console.info("결제 완료", payment);
    } else if (payment.status === "VIRTUAL_ACCOUNT_ISSUED") {
      console.info("가상계좌 발급", payment);
    }

    // 결제 상태를 클라이언트에 반환합니다.
    const data = { status: payment.status };
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e: any) {
    // 오류 발생 시 결제 실패 상태와 메시지를 반환합니다.
    const errorData = { status: "FAILED", message: e.message };
    return new Response(JSON.stringify(errorData), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});

//   return new Response(
//     JSON.stringify(data),
//     { headers: { "Content-Type": "application/json" } },
//   )
// })

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/payment-complete' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
