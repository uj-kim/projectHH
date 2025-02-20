import * as PortOne from '@portone/browser-sdk/v2';
import { Currency } from '@portone/browser-sdk/dist/v2/entity';
import { Customer } from '@portone/browser-sdk/dist/v2/entity';
import { FormEventHandler, useState } from 'react';
import { randomId } from '@/lib/random';

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
    completePaymentAction: (paymentId: string) => Promise<PaymentStatus>;
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

        const paymentId = randomId();

        const response = await PortOne.requestPayment({
            storeId,
            channelKey,
            paymentId,
            orderName: item.name,
            totalAmount: item.price,
            currency: item.currency,
            payMethod: 'CARD',
            customer: { fullName, email, phoneNumber },
        });

        if (response?.code !== undefined) {
            setPaymentStatus({ status: 'FAILED', message: response.message });
            return;
        }

        // PortOne 결제 요청이 성공하면, completePaymentAction을 호출해서 결제 검증 및 후속처리 진행
        const result = await completePaymentAction(paymentId);
        setPaymentStatus(result);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>{item.name}</h3>
            <p>{item.price.toLocaleString()}원</p>
            <button type="submit" disabled={paymentStatus.status !== 'IDLE'}>
                {paymentStatus.status === 'PENDING' ? '결제 진행 중...' : '결제하기'}
            </button>
            {paymentStatus.status === 'FAILED' && <p>결제 실패: {paymentStatus.message}</p>}
            {paymentStatus.status === 'PAID' && <p>결제 성공!</p>}
        </form>
    );
};

export default PaymentForm;
