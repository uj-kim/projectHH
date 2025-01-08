// src/pages/ProductRegisterPage.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct, uploadImage } from '@/api/products';
import ProductForm, { ProductFormData } from '@/components/ProductForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '@/stores/authStore';
import { useProductFormStore } from '@/stores/productStore';
import { Database } from '@/types/database.types';

const ProductRegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
    const resetForm = useProductFormStore((state) => state.resetForm);

    type CreateProductVariables = {
        product: Omit<
            Database['public']['Tables']['products']['Insert'],
            'category_id' | 'seller_id' | 'product_id'
        > & { image_url: string };
        categoryId: string;
        userId: string;
    };

    // const handleCreate = async (formData: ProductFormData) => {
    //     if (!user) {
    //         // 사용자 정보가 없는 경우 에러 처리
    //         throw new Error('로그인한 사용자 정보가 없습니다.');
    //     }

    //     try {
    //         const result: Database['public']['Tables']['products']['Row'] | null = await createProduct(
    //             {
    //                 product_name: formData.product_name,
    //                 price: formData.price,
    //                 quantity: formData.quantity,
    //                 description: formData.description,
    //                 image_url: formData.image_url,
    //             },
    //             formData.category_id,
    //             user.id // `user.id` 대신 `user.user_id`를 사용 (타입에 맞게 조정)
    //         );

    //         if (result) {
    //             // 성공 시 마이페이지로 이동
    //             navigate('/mypage');
    //         } else {
    //             throw new Error('상품 등록에 실패했습니다.');
    //         }
    //     } catch (error) {
    //         console.error('상품 등록 오류:', error);
    //         throw error; // ProductForm에서 에러 메시지를 처리하도록 던짐
    //     }
    // };
    // useMutation 훅을 사용하여 상품 등록

    // 상품등록
    const createProductMutation = useMutation<
        Database['public']['Tables']['products']['Row'] | null,
        Error,
        CreateProductVariables
    >({
        mutationFn: createProduct,
        onSuccess: (data) => {
            if (data) {
                queryClient.invalidateQueries({ queryKey: ['products', data.seller_id] });
                resetForm();
                navigate('/mypage');
            }
        },
        onError: (error: Error) => {
            console.error('상품 등록 오류:', error);
        },
    });

    const handleSubmit = async (formData: ProductFormData, imageFile: File | null) => {
        if (!user) {
            throw new Error('사용자 정보가 없습니다.');
        }

        let imageUrl = formData.image_url;

        // 이미지 업로드
        if (imageFile) {
            const uploadedImageUrl = await uploadImage(imageFile);
            if (!uploadedImageUrl) {
                throw new Error('이미지 업로드에 실패했습니다.');
            }
            imageUrl = uploadedImageUrl;
        }

        // 상품 등록
        await createProductMutation.mutateAsync({
            product: {
                product_name: formData.product_name,
                price: formData.price,
                quantity: formData.quantity,
                description: formData.description,
                image_url: imageUrl,
            },
            categoryId: formData.category_id,
            userId: user.id,
        });
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">상품 등록 페이지</h1>
            <ProductForm onSubmit={handleSubmit} formTitle="상품 등록" isEditMode={false} />
        </div>
    );
};

export default ProductRegisterPage;
