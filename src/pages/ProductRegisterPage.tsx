// src/pages/ProductRegisterPage.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '@/api/products';
import ProductForm, { ProductFormData } from '@/components/products/ProductForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useProductFormStore } from '@/stores/productStore';
import { Database } from '@/types/database.types';

const ProductRegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: user } = useAuth();
    const resetForm = useProductFormStore((state) => state.resetForm);

    type CreateProductVariables = {
        product: Omit<
            Database['public']['Tables']['products']['Insert'],
            'category_id' | 'seller_id' | 'product_id'
        > & { image_url: string };
        categoryId: string;
        userId: string;
    };

    // useMutation 훅을 사용하여 상품 등록
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

    const handleSubmit = async (formData: ProductFormData) => {
        if (!user) {
            throw new Error('사용자 정보가 없습니다.');
        }

        const imageUrl = formData.image_url;

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
