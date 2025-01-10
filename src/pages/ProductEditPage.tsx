// src/pages/ProductEditPage.tsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, updateProduct } from '@/api/products';
import { Database } from '@/types/database.types';
import ProductForm, { ProductFormData } from '@/components/ProductForm';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useProductFormStore } from '@/stores/productStore';

const ProductEditPage: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const resetForm = useProductFormStore((state) => state.resetForm);
    const initializeForm = useProductFormStore((state) => state.initializeForm);

    //해당 상품 정보 불러오기
    const {
        data: product,
        isLoading,
        isError,
        error,
    } = useQuery<Database['public']['Tables']['products']['Row'], Error>({
        queryKey: ['product', productId!],
        queryFn: () => getProductById(productId!),
        enabled: !!productId,
    });
    useEffect(() => {
        if (product) {
            initializeForm({
                product_name: product.product_name,
                price: product.price,
                quantity: product.quantity,
                description: product.description,
                category_id: product.category_id ?? '',
                image_url: product.image_url,
            });
        }
    }, [product, initializeForm]);

    // 상품 수정
    const updateProductMutation = useMutation<Database['public']['Tables']['products']['Row'], Error, ProductFormData>({
        mutationFn: async (formData) => {
            const updatedProduct = await updateProduct({
                product_id: product!.product_id,
                product_name: formData.product_name,
                price: formData.price,
                quantity: formData.quantity,
                description: formData.description,
                image_url: formData.image_url,
                category_id: formData.category_id,
            });

            if (!updatedProduct) {
                throw new Error('상품 정보를 업데이트하는 데 실패했습니다.');
            }

            return updatedProduct;
        },

        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products', data.seller_id] });
            resetForm();
            navigate('/mypage');
        },
        onError: (error: Error) => {
            console.error('상품업데이트오류 : ', error);
        },
    });

    const handleUpdate = async (formData: ProductFormData) => {
        if (!product) {
            throw new Error('상품데이터가 없습니다.');
        }

        await updateProductMutation.mutateAsync(formData);
    };

    if (isLoading) return <div>로딩 중...</div>;
    if (isError) return <div className="text-red-500">{error.message}</div>;
    if (!product) return <div>상품을 찾을 수 없습니다.</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">상품 수정 페이지</h1>
            <ProductForm
                initialProduct={{
                    product_name: product.product_name,
                    price: product.price,
                    quantity: product.quantity,
                    description: product.description,
                    image_url: product.image_url,
                    category_id: product.category_id ?? '',
                }}
                onSubmit={handleUpdate}
                formTitle="상품 수정"
                isEditMode={true}
            />
        </div>
    );
};

export default ProductEditPage;
