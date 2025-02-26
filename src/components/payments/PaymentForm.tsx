import * as PortOne from '@portone/browser-sdk/v2';
import { Currency } from '@portone/browser-sdk/dist/v2/entity';
import { Customer } from '@portone/browser-sdk/dist/v2/entity';
import { FormEventHandler, useState } from 'react';

export type PaymentStatus = {
    status: string;
    message?: string;
};

export type PaymentFormProps = {
    item: { id: string; name: string; price: number; currency: Currency };
    fullName: Customer['fullName'];
    email: Customer['email'];
    phoneNumber: Customer['phoneNumber'];
    storeId: string;
    channelKey: string;
    completePaymentAction: (paymentId: string, impUid: string) => Promise<PaymentStatus>;
};

const PaymentForm: React.FC<PaymentFormProps> = ({
    item,
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

        // ✅ PortOne 결제 요청 실행
        const response = await PortOne.requestPayment({
            storeId,
            channelKey,
            paymentId: `order_${new Date().getTime()}`, // ✅ 주문 ID 생성
            orderName: item.name,
            totalAmount: item.price,
            currency: item.currency,
            payMethod: 'CARD',
            customer: { fullName, email, phoneNumber },
            noticeUrls: [`${import.meta.env.VITE_SUPABASE_FUNCTION_URL}`],
        });

        if (response?.code !== undefined) {
            console.error('❌ 결제 실패:', response?.message);
            setPaymentStatus({ status: 'FAILED', message: response.message });
            return;
        }

        // ✅ PortOne이 반환한 `imp_uid`를 결제 ID로 사용
        console.log('response:', response);
        // const paymentId = response?.txId ?? '';
        const impUid = response?.txId ?? '';
        const merchantUid = response?.paymentId ?? '';
        // console.log('✅ 결제 성공! paymentId:', paymentId);

        // ✅ 백엔드에 결제 검증 요청 (결제 금액 포함)
        if (impUid) {
            const result = await completePaymentAction(impUid, merchantUid);
            // const result = await completePaymentAction(paymentId, { amount: item.price });
            setPaymentStatus(result);
        } else {
            setPaymentStatus({ status: 'FAILED', message: 'Payment ID is undefined' });
        }
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
