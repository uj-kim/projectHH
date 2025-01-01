import React, { useState, useEffect } from 'react';
import { createProduct, getCategories, uploadImage } from '@/api/products';
import useAuthStore from '@/stores/authStore';

const ProductForm: React.FC = () => {
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState(0);
    const [quantity, setQuantity] = useState(0);
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null); // 이미지 파일 상태 추가
    const [categories, setCategories] = useState<{ category_id: string; category_name: string }[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        console.log('유즈이풱트'); //ok
        const fetchCategories = async () => {
            const data = await getCategories();
            if (data) {
                console.log(data);
                setCategories(data);
            } else {
                setErrorMessage('카테고리 데이터를 불러오지 못했습니다.');
            }
        };
        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            setErrorMessage('로그인한 사용자 정보가 없습니다.');
            return;
        }

        if (!selectedCategoryId) {
            setErrorMessage('카테고리를 선택하세요.');
            return;
        }

        if (!imageFile) {
            setErrorMessage('이미지 파일을 선택하세요.');
            return;
        }

        // 이미지 업로드
        const imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
            setErrorMessage('이미지 업로드에 실패했습니다.');
            return;
        }

        const product = {
            product_name: productName,
            price,
            quantity,
            description,
            image_url: imageUrl, // 업로드된 이미지 URL 저장
        };

        const result = await createProduct(product, selectedCategoryId, user.id);

        if (result) {
            setSuccessMessage('상품이 성공적으로 등록되었습니다!');
            setErrorMessage('');
        } else {
            setErrorMessage('상품 등록에 실패했습니다.');
            setSuccessMessage('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 bg-gray-100 rounded-md">
            <h2 className="text-xl font-bold">상품 등록</h2>

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
                    {categories.map((category) => {
                        console.log('카테고리 확인:', category);
                        return (
                            <option key={category.category_id} value={category.category_id}>
                                {category.category_name}
                            </option>
                        );
                    })}
                </select>
            </label>

            <label>
                이미지 업로드:
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
            </label>

            <button type="submit" className="p-2 text-white bg-blue-500 rounded-md hover:bg-blue-600">
                등록
            </button>

            {successMessage && <p className="text-green-500">{successMessage}</p>}
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        </form>
    );
};

export default ProductForm;
