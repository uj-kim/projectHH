// src/pages/Mypage.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SellerProductsTable from '@/components/SellerProductsTable';
import PurchaseHistoryTable from '@/components/PurchaseHistoryTable';
import { useUserProfile } from '@/hooks/useUserProfile';
import { updateDefaultAddress } from '@/api/profile';
// shadcn/ui 컴포넌트 임포트 (프로젝트 경로에 맞게 조정)
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Mypage: React.FC = () => {
    const { data: userProfile, isLoading, isError, error, refetch } = useUserProfile();
    const [addressValue, setAddressValue] = useState<string>('');
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);

    // userProfile 로드 시 addressValue 초기화
    useEffect(() => {
        if (userProfile) {
            setAddressValue(userProfile.address || '');
        }
    }, [userProfile]);

    const handleAddressButtonClick = async () => {
        if (!isEditing) {
            // 편집 모드 시작
            setIsEditing(true);
        } else {
            // 편집 모드에서 완료 버튼 클릭 시 업데이트 호출
            if (userProfile) {
                try {
                    setIsUpdating(true);
                    const updatedAddress = await updateDefaultAddress(userProfile.user_id, addressValue);
                    setAddressValue(updatedAddress);
                    setIsEditing(false);
                    setIsUpdating(false);
                    refetch();
                } catch (err) {
                    setIsUpdating(false);
                    console.error(err);
                    // 에러 처리 로직 추가 가능
                }
            }
        }
    };

    // 기존 배송지 여부에 따라 버튼 텍스트 결정
    const isNewAddress = !userProfile?.address || userProfile.address.trim() === '';
    const buttonText = isEditing ? (isNewAddress ? '등록완료' : '수정완료') : isNewAddress ? '등록하기' : '수정하기';

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">마이페이지</h1>

            {/* 개인정보 섹션 */}
            <div className="border border-gray-300 p-4 rounded-md mb-6 text-left">
                {isLoading && <p>로딩 중...</p>}
                {isError && <p className="text-red-500">에러: {error?.message}</p>}
                {userProfile && (
                    <div className="mb-4">
                        <p className="text-lg font-bold">이름</p>
                        <p className="text-lg font-medium">{userProfile.nickname || userProfile.email}</p>
                        <p className="text-lg font-bold mt-4">기본 배송지</p>
                        <Input
                            value={addressValue}
                            onChange={(e) => setAddressValue(e.target.value)}
                            disabled={!isEditing}
                            placeholder="기본배송지가 등록되지 않았습니다."
                            className="mb-2"
                        />
                        <Button onClick={handleAddressButtonClick} disabled={isUpdating}>
                            {buttonText}
                        </Button>
                    </div>
                )}

                {/* 판매자 전환 섹션 */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-medium">판매자로 전환하시겠습니까?</span>
                    <Link to="/product/register">
                        <Button variant="default">상품등록</Button>
                    </Link>
                </div>
            </div>

            {/* 판매 내역 섹션 */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">판매 내역</h2>
                <SellerProductsTable />
            </div>

            {/* 구매 내역 섹션 */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">구매 내역</h2>
                <PurchaseHistoryTable />
            </div>
        </div>
    );
};

export default Mypage;
