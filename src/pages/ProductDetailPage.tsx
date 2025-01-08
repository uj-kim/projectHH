import { useParams } from 'react-router-dom';

const ProductDetailPage = () => {
    const { id } = useParams();

    return (
        <div>
            <h2>상품 상세 페이지</h2>
            <p>상품 ID: {id}</p>
        </div>
    );
};

export default ProductDetailPage;
