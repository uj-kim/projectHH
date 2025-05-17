import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
} from "react";
import * as PortOne from "@portone/browser-sdk/v2";
import { Currency } from "@portone/browser-sdk/dist/v2/entity";
import { Customer } from "@portone/browser-sdk/dist/v2/entity";
import { randomId } from "@/lib/random";

export type PaymentStatus = {
  status: string;
  message?: string;
};

export type PaymentFormProps = {
  item: { id: string; name: string; price: number; currency: Currency };
  orderNumber: string;
  totalAmount: number;
  fullName: Customer["fullName"];
  email: Customer["email"];
  phoneNumber: Customer["phoneNumber"];
  storeId: string;
  channelKey: string;
  completePaymentAction: (
    paymentId: string,
    order: { orderNumber: string; totalAmount: number }
  ) => Promise<PaymentStatus>;
};

export type PaymentFormHandle = {
  openPayment: () => void;
};

const PaymentForm = forwardRef<PaymentFormHandle, PaymentFormProps>(
  (
    {
      item,
      orderNumber,
      totalAmount,
      fullName,
      email,
      phoneNumber,
      storeId,
      channelKey,
      completePaymentAction,
    },
    ref
  ) => {
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
      status: "IDLE",
    });

    const openPayment = async () => {
      // 이미 진행 중이거나 완료된 경우 다시 실행하지 않음
      if (paymentStatus.status !== "IDLE") return;

      setPaymentStatus({ status: "PENDING" });
      console.log("주문번호:", orderNumber, "및 결제 요청 시작");

      const response = await PortOne.requestPayment({
        storeId,
        channelKey,
        paymentId: `payment-${randomId()}`,
        orderName: item.name,
        totalAmount,
        currency: item.currency,
        payMethod: "CARD",
        customer: { fullName, email, phoneNumber },
        noticeUrls: [`${import.meta.env.VITE_SUPABASE_FUNCTION_URL}`],
      });

      if (response?.code !== undefined) {
        console.error("결제 실패:", response.message);
        setPaymentStatus({ status: "FAILED", message: response.message });
        return;
      }

      const paymentId = response?.paymentId ?? "";
      if (!paymentId) {
        setPaymentStatus({
          status: "FAILED",
          message: "Payment ID is undefined",
        });
        return;
      }

      const orderInfo = { orderNumber, totalAmount };
      const result = await completePaymentAction(paymentId, orderInfo);
      setPaymentStatus(result);
    };

    // 외부에서 호출할 수 있도록 ref에 openPayment 등록
    useImperativeHandle(ref, () => ({
      openPayment,
    }));

    // orderNumber가 세팅되면 자동으로 결제 요청 실행 (한번만 실행되도록 조건 추가)
    useEffect(() => {
      if (orderNumber && paymentStatus.status === "IDLE") {
        openPayment();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderNumber]);

    return null;
  }
);

export default PaymentForm;
