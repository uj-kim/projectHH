// src/components/payments/PaymentForm.tsx
import * as PortOne from '@portone/browser-sdk/v2';
import { Currency } from '@portone/browser-sdk/dist/v2/entity';
import { Customer } from '@portone/browser-sdk/dist/v2/entity';
import { FormEventHandler, useState } from 'react';
import { randomId } from '@/lib/random'; // 임의의 ID 생성 유틸

export type PaymentStatus = {
    status: string;
    message?: string;
};

export type PaymentFormProps = {
    item: { id: string; name: string; price: number; currency: Currency };
    orderNumber: string; // supabase orders 테이블의 id
    totalAmount: number;
    fullName: Customer['fullName'];
    email: Customer['email'];
    phoneNumber: Customer['phoneNumber'];
    storeId: string;
    channelKey: string;
    // completePaymentAction는 paymentId와 주문정보를 매개변수로 받습니다.
    completePaymentAction: (
        paymentId: string,
        order: { orderNumber: string; totalAmount: number }
    ) => Promise<PaymentStatus>;
};

const PaymentForm: React.FC<PaymentFormProps> = ({
    item,
    orderNumber,
    totalAmount,
    fullName,
    email,
    phoneNumber,
    storeId,
    channelKey,
    completePaymentAction,
}) => {
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ status: 'IDLE' });

    const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        setPaymentStatus({ status: 'PENDING' });

        console.log('🛒 결제 요청 시작:', {
            storeId,
            channelKey,
            itemName: item.name,
            amount: item.price,
        });

        // PortOne 결제 요청 실행 – paymentId는 PortOne에서 반환된 값 사용
        const response = await PortOne.requestPayment({
            storeId,
            channelKey,
            paymentId: `payment-${randomId()}`, // 임시 생성, 실제 반환되는 값을 사용합니다.
            orderName: item.name,
            totalAmount: totalAmount,
            currency: item.currency,
            payMethod: 'CARD',
            customer: { fullName, email, phoneNumber },
            noticeUrls: [`${import.meta.env.VITE_SUPABASE_FUNCTION_URL}`],
        });

        if (response?.code !== undefined) {
            console.error('❌ 결제 실패:', response.message);
            setPaymentStatus({ status: 'FAILED', message: response.message });
            return;
        }

        // PortOne 결제 요청 성공 시, 응답으로 받은 paymentId 사용
        const paymentId = response?.paymentId ?? '';
        console.log('✅ 결제 요청 성공, paymentId:', paymentId);

        if (!paymentId) {
            setPaymentStatus({ status: 'FAILED', message: 'Payment ID is undefined' });
            return;
        }

        // 결제 요청 성공 시, 주문정보(주문번호와 총금액)를 함께 서버에 전달하여 검증 진행
        const orderInfo = { orderNumber, totalAmount };
        console.log('✅ 결제 검증을 시작합니다.');
        const result = await completePaymentAction(paymentId, orderInfo);
        setPaymentStatus(result);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>{item.name}</h3>
            <p>{item.price.toLocaleString()}원</p>
            <button type="submit" disabled={paymentStatus.status !== 'IDLE'}>
                {paymentStatus.status === 'PENDING' ? '결제 진행 중...' : '결제하기'}
            </button>
            {paymentStatus.status === 'FAILED' && <p>❌ 결제 실패: {paymentStatus.message}</p>}
            {paymentStatus.status === 'PAID' && <p>✅ 결제 성공!</p>}
        </form>
    );
};

export default PaymentForm;
