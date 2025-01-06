// src/pages/ProductEditPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, updateProduct } from '@/api/products';
import { Database } from '@/types/database.types';
import ProductForm, { ProductFormData } from '@/components/ProductForm';

const ProductEditPage: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const [initialData, setInitialData] = useState<Database['public']['Tables']['products']['Row'] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) {
                setError('상품 ID가 없습니다.');
                setLoading(false);
                return;
            }

            const product = await getProductById(productId);
            if (product) {
                setInitialData(product);
            } else {
                setError('상품 정보를 불러오는 데 실패했습니다.');
            }
            setLoading(false);
        };

        fetchProduct();
    }, [productId]);

    const handleUpdate = async (formData: ProductFormData) => {
        if (!initialData) {
            setError('상품 데이터가 없습니다.');
            return;
        }

        try {
            const updatedProduct: Database['public']['Tables']['products']['Row'] | null = await updateProduct({
                product_id: initialData.product_id,
                product_name: formData.product_name,
                price: formData.price,
                quantity: formData.quantity,
                description: formData.description,
                image_url: formData.image_url,
                category_id: formData.category_id,
                // 필요한 경우 다른 필드도 업데이트할 수 있습니다.
            });

            if (updatedProduct) {
                // 성공 시 마이페이지로 이동
                navigate('/mypage');
            } else {
                throw new Error('상품 정보를 업데이트하는 데 실패했습니다.');
            }
        } catch (error) {
            console.error('상품 업데이트 오류:', error);
            throw error; // ProductForm에서 에러 메시지를 처리하도록 던짐
        }
    };

    if (loading) return <div>로딩 중...</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!initialData) return <div>상품을 찾을 수 없습니다.</div>;

    // 초기 폼 데이터 설정
    const formInitialData: ProductFormData = {
        product_name: initialData.product_name,
        price: initialData.price,
        quantity: initialData.quantity,
        description: initialData.description,
        image_url: initialData.image_url,
        category_id: initialData.category_id ?? '',
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">상품 수정 페이지</h1>
            <ProductForm
                initialProduct={formInitialData}
                onSubmit={handleUpdate}
                formTitle="상품 수정"
                isEditMode={true}
            />
        </div>
    );
};

export default ProductEditPage;
