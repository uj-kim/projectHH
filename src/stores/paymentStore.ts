import {create} from 'zustand';

interface PaymentState {
    shippingAddress: string;
    setShippingAddress: (address: string) => void;
    isUsingDefault: boolean;
    setIsUsingDefault: (usingDefault: boolean) => void;
    reset: () => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
    shippingAddress: '',
    setShippingAddress: (address) => set({shippingAddress: address}),
    isUsingDefault: true,
    setIsUsingDefault: (usingDefault) => set({isUsingDefault: usingDefault}),
    reset: () => set({
        shippingAddress: '',
        isUsingDefault: true,
    }),
}));