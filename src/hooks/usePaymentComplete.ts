import { useMutation } from "@tanstack/react-query";
import { completePayment } from "@/api/payment";

export const useCompletePayment = () => {
  return useMutation({
    mutationFn: completePayment,
    onSuccess: (data) => {
      // 결제 검증 성공 시 후속처리 (예: 로그, UI 업데이트 등)
      console.log("Payment verification successful", data);
    },
    onError: (error: any) => {
      console.error("Payment verification failed", error);
    },
  });
};
