//결제수단 선택
interface PaymentMethodProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
}

const PaymentMethod: React.FC<PaymentMethodProps> = ({
  paymentMethod,
  setPaymentMethod,
}) => {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold mb-2">결제 수단</h2>
      <select
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md"
      >
        <option value="credit_card">신용카드</option>
        <option value="bank_account">계좌이체</option>
        <option value="mobile">모바일 결제</option>
      </select>
    </div>
  );
};

export default PaymentMethod;
