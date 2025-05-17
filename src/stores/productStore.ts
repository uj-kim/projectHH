// src/stores/productFormStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProductFormData } from "@/features/Products/ProductForm.tsx";
interface ProductFormState {
  productName: string;
  price: number;
  quantity: number;
  description: string;
  imageFile: File | null;
  selectedCategoryId: string;
  image_url: string;
  successMessage: string;
  errorMessage: string;
  isSubmitting: boolean;
  setProductName: (name: string) => void;
  setPrice: (price: number) => void;
  setQuantity: (quantity: number) => void;
  setDescription: (description: string) => void;
  setImageFile: (file: File | null) => void;
  setSelectedCategoryId: (id: string) => void;
  setImageUrl: (url: string) => void;
  setSuccessMessage: (message: string) => void;
  setErrorMessage: (message: string) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  resetForm: () => void;
  initializeForm: (data: ProductFormData) => void;
}

export const useProductFormStore = create<ProductFormState>()(
  persist(
    (set) => ({
      productName: "",
      price: 0,
      quantity: 0,
      description: "",
      imageFile: null,
      selectedCategoryId: "",
      image_url: "",
      successMessage: "",
      errorMessage: "",
      isSubmitting: false,
      setProductName: (name) => set({ productName: name }),
      setPrice: (price) => set({ price }),
      setQuantity: (quantity) => set({ quantity }),
      setDescription: (description) => set({ description }),
      setImageFile: (file) => set({ imageFile: file }),
      setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
      setImageUrl: (url) => set({ image_url: url }),
      setSuccessMessage: (message) => set({ successMessage: message }),
      setErrorMessage: (message) => set({ errorMessage: message }),
      setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
      resetForm: () =>
        set({
          productName: "",
          price: 0,
          quantity: 0,
          description: "",
          imageFile: null,
          selectedCategoryId: "",
          image_url: "",
          successMessage: "",
          errorMessage: "",
          isSubmitting: false,
        }),
      initializeForm: (data) =>
        set({
          productName: data.product_name,
          price: data.price,
          quantity: data.quantity,
          description: data.description,
          selectedCategoryId: data.category_id,
          image_url: data.image_url,
          imageFile: null, // 초기화 시 이미지 파일은 null로 설정
          successMessage: "",
          errorMessage: "",
          isSubmitting: false,
        }),
    }),
    {
      name: "product-form-storage", // 로컬 스토리지에 저장될 키
      // 불필요한 상태는 제외하도록 선택
      partialize: (state) => ({
        productName: state.productName,
        price: state.price,
        quantity: state.quantity,
        description: state.description,
        selectedCategoryId: state.selectedCategoryId,
        image_url: state.image_url,
        successMessage: state.successMessage,
        errorMessage: state.errorMessage,
        isSubmitting: state.isSubmitting,
      }),
    }
  )
);
