import ProductForm from '@/components/ProductRegister';

const ProductRegisterPage: React.FC = () => {
    console.log('상품등록페이지렌더링확인'); //ok
    return (
        <div>
            <h1>상품등록페이지</h1>
            <ProductForm />
        </div>
    );
};

export default ProductRegisterPage;
