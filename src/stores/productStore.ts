// src/store/productFormStore.ts

import { create }  from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductFormData } from '@/components/ProductForm';

interface ProductFormState {
    productName: string;
    price: number;
    quantity: number;
    description: string;
    imageFile: File | null;
    selectedCategoryId: string;
    setProductName: (name: string) => void;
    setPrice: (price: number) => void;
    setQuantity: (quantity: number) => void;
    setDescription: (description: string) => void;
    setImageFile: (file: File | null) => void;
    setSelectedCategoryId: (id: string) => void;
    resetForm: () => void;
    initializeForm: (data: ProductFormData) => void;
}

export const useProductFormStore = create<ProductFormState>()(
    persist(
        (set) => ({
            productName: '',
            price: 0,
            quantity: 0,
            description: '',
            imageFile: null,
            selectedCategoryId: '',
            setProductName: (name) => set({ productName: name }),
            setPrice: (price) => set({ price }),
            setQuantity: (quantity) => set({ quantity }),
            setDescription: (description) => set({ description }),
            setImageFile: (file) => set({ imageFile: file }),
            setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
            resetForm: () =>
                set({
                    productName: '',
                    price: 0,
                    quantity: 0,
                    description: '',
                    imageFile: null,
                    selectedCategoryId: '',
                }),
            initializeForm: (data) =>
                set({
                    productName: data.product_name,
                    price: data.price,
                    quantity: data.quantity,
                    description: data.description,
                    selectedCategoryId: data.category_id,
                    imageFile: null, // 초기화 시 이미지 파일은 null로 설정
                }),
        }),
        {
            name: 'product-form-storage', // 로컬 스토리지에 저장될 키
            // 불필요한 상태는 제외하도록 선택
            partialize: (state) => ({
                productName: state.productName,
                price: state.price,
                quantity: state.quantity,
                description: state.description,
                selectedCategoryId: state.selectedCategoryId,
            }),
        }
    )
);
