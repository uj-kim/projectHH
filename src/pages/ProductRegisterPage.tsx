// src/pages/ProductRegisterPage.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '@/api/products';
import { Database } from '@/types/database.types';
import ProductForm, { ProductFormData } from '@/components/ProductForm';
import useAuthStore from '@/stores/authStore';

const ProductRegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    const handleCreate = async (formData: ProductFormData) => {
        if (!user) {
            // 사용자 정보가 없는 경우 에러 처리
            throw new Error('로그인한 사용자 정보가 없습니다.');
        }

        try {
            const result: Database['public']['Tables']['products']['Row'] | null = await createProduct(
                {
                    product_name: formData.product_name,
                    price: formData.price,
                    quantity: formData.quantity,
                    description: formData.description,
                    image_url: formData.image_url,
                },
                formData.category_id,
                user.id // `user.id` 대신 `user.user_id`를 사용 (타입에 맞게 조정)
            );

            if (result) {
                // 성공 시 마이페이지로 이동
                navigate('/mypage');
            } else {
                throw new Error('상품 등록에 실패했습니다.');
            }
        } catch (error) {
            console.error('상품 등록 오류:', error);
            throw error; // ProductForm에서 에러 메시지를 처리하도록 던짐
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">상품 등록 페이지</h1>
            <ProductForm onSubmit={handleCreate} />
        </div>
    );
};

export default ProductRegisterPage;
