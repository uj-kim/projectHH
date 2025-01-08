// src/components/ProductForm.tsx
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/api/products';
import useAuthStore from '@/stores/authStore';
import { useProductFormStore } from '@/stores/productStore';

type Category = {
    category_id: string;
    category_name: string;
};

/**
 * 폼에서 사용하는 상품 데이터 구조
 */
export type ProductFormData = {
    product_name: string;
    price: number;
    quantity: number;
    description: string;
    image_url: string;
    category_id: string;
};

type ProductFormProps = {
    initialProduct?: ProductFormData;
    onSubmit: (data: ProductFormData, imageFile: File | null) => Promise<void>;
    formTitle?: string;
    isEditMode?: boolean;
};

const ProductForm: React.FC<ProductFormProps> = ({
    initialProduct,
    onSubmit,
    formTitle = '상품 등록',
    isEditMode = false,
}) => {
    const {
        productName,
        setProductName,
        price,
        setPrice,
        quantity,
        setQuantity,
        description,
        setDescription,
        imageFile,
        setImageFile,
        selectedCategoryId,
        setSelectedCategoryId,
        successMessage,
        setSuccessMessage,
        errorMessage,
        setErrorMessage,
        isSubmitting,
        setIsSubmitting,
        resetForm,
        initializeForm,
    } = useProductFormStore();

    const user = useAuthStore((state) => state.user);

    //카테고리 데이터 가져오기
    const {
        data: categories,
        isPending: isCategoriesLoading,
        isError: isCategoriesError,
        error: categoriesError,
    } = useQuery<Category[], Error>({
        queryKey: ['categories'],
        queryFn: getCategories,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });

    // 초기화: 수정 모드일 경우 초기 데이터를 설정
    useEffect(() => {
        if (initialProduct && isEditMode) {
            initializeForm(initialProduct);
        }
    }, [initialProduct, isEditMode, initializeForm]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true); // 제출 시작 시 로딩 상태 설정

        if (!user) {
            setErrorMessage('로그인한 사용자 정보가 없습니다.');
            setIsSubmitting(false);
            return;
        }

        if (!selectedCategoryId) {
            setErrorMessage('카테고리를 선택하세요.');
            setIsSubmitting(false);
            return;
        }

        if (!isEditMode && !imageFile) {
            setErrorMessage('이미지 파일을 선택하세요.');
            setIsSubmitting(false);
            return;
        }

        const productData: ProductFormData = {
            product_name: productName,
            price,
            quantity,
            description,
            image_url: initialProduct?.image_url || '',
            category_id: selectedCategoryId,
        };

        try {
            await onSubmit(productData, imageFile);
            setSuccessMessage(isEditMode ? '상품이 성공적으로 수정되었습니다!' : '상품이 성공적으로 등록되었습니다!');
            setErrorMessage('');
            if (!isEditMode) {
                // 등록 모드에서만 폼 초기화
                resetForm();
            }
        } catch (error) {
            console.error('폼 제출 오류:', error);
            setErrorMessage(isEditMode ? '상품 수정에 실패했습니다.' : '상품 등록에 실패했습니다.');
            setSuccessMessage('');
        } finally {
            setIsSubmitting(false); // 제출 완료 시 로딩 상태 해제
        }
    };

    if (isCategoriesLoading) return <div>카테고리 로딩 중...</div>;
    if (isCategoriesError)
        return <div className="text-red-500">카테고리 데이터를 불러오지 못했습니다: {categoriesError.message}</div>;

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 p-4 bg-gray-100 rounded-md w-full max-w-lg mx-auto"
        >
            <h2 className="text-xl font-bold">{formTitle}</h2>

            <label>
                상품 이름:
                <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
            </label>

            <label>
                가격:
                <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    required
                    min={0}
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
            </label>

            <label>
                재고 수량:
                <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    required
                    min={1}
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
            </label>

            <label>
                설명:
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                ></textarea>
            </label>

            <label>
                카테고리:
                <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md"
                >
                    <option value="">카테고리를 선택하세요</option>
                    {categories!.map((category) => (
                        <option key={category.category_id} value={category.category_id}>
                            {category.category_name}
                        </option>
                    ))}
                </select>
            </label>

            <label>
                이미지 업로드:
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files ? e.target.files[0] : null;
                        if (file) {
                            // 파일 크기 제한 (예: 5MB)
                            if (file.size > 5 * 1024 * 1024) {
                                setErrorMessage('이미지 파일 크기는 5MB를 초과할 수 없습니다.');
                                setImageFile(null);
                                return;
                            }

                            // 파일 형식 제한 (예: JPEG, PNG)
                            if (!['image/jpeg', 'image/png'].includes(file.type)) {
                                setErrorMessage('이미지 파일 형식은 JPEG 또는 PNG만 허용됩니다.');
                                setImageFile(null);
                                return;
                            }

                            setImageFile(file);
                        }
                    }}
                    {...(!isEditMode && { required: true })} // 등록 모드에서만 필수
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
                {isEditMode && initialProduct?.image_url && (
                    <img src={initialProduct.image_url} alt="상품 이미지" className="mt-2 h-32 object-cover" />
                )}
            </label>

            <button
                type="submit"
                disabled={isSubmitting}
                className={`p-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isEditMode ? '수정하기' : '등록하기'}
            </button>

            {successMessage && <p className="text-green-500">{successMessage}</p>}
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        </form>
    );
};

export default ProductForm;
