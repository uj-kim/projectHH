import React from 'react';
import { SellerProductsTable } from '@/components/SellerProductsTable';

const Mypage: React.FC = () => {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">마이페이지</h1>
            <SellerProductsTable />
        </div>
    );
};

export default Mypage;
