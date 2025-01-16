import React from 'react';
import SellerProductsTable from '@/components/SellerProductsTable';
import PurchaseHistoryTable from '@/components/PurchaseHistoryTable';

const Mypage: React.FC = () => {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">마이페이지</h1>
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">판매 내역</h2>
                <SellerProductsTable />
            </div>
            <div>
                <h2 className="text-2xl font-semibold mb-4">구매 내역</h2>
                <PurchaseHistoryTable />
            </div>
        </div>
    );
};

export default Mypage;
