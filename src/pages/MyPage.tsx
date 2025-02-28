// src/pages/Mypage.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SellerProductsTable from '@/components/SellerProductsTable';
import PurchaseHistoryTable from '@/components/PurchaseHistoryTable';
import { useUserProfile } from '@/hooks/useUserProfile';
import { updateDefaultAddress } from '@/api/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDeleteUser } from '@/hooks/useDeleteUser';
import { useSignOut } from '@/hooks/useSignOut';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Mypage: React.FC = () => {
    const { data: userProfile, isLoading, isError, error, refetch } = useUserProfile();
    const [addressValue, setAddressValue] = useState<string>('');
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const navigate = useNavigate();

    // userProfile 로드 시 addressValue 초기화
    useEffect(() => {
        if (userProfile) {
            setAddressValue(userProfile.address || '');
        }
    }, [userProfile]);

    const handleAddressButtonClick = async () => {
        if (!isEditing) {
            setIsEditing(true);
        } else {
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
                }
            }
        }
    };

    // 회원 탈퇴를 위한 훅
    const { mutate: deleteUserMutate } = useDeleteUser();
    const { mutate: signOut } = useSignOut();

    const handleDeleteUserProfile = () => {
        if (userProfile && window.confirm('정말로 탈퇴하시겠습니까?')) {
            deleteUserMutate(userProfile.user_id, {
                onSuccess: async () => {
                    alert('회원 탈퇴가 완료되었습니다.');
                    signOut();
                    navigate('/');
                },
                onError: (error: Error) => {
                    alert('회원 탈퇴에 실패했습니다: ' + error.message);
                    console.error('회원 탈퇴 실패:', error);
                },
            });
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
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-lg font-bold">기본 배송지</p>
                            <Button onClick={handleAddressButtonClick} disabled={isUpdating}>
                                {buttonText}
                            </Button>
                        </div>
                        <Input
                            value={addressValue}
                            onChange={(e) => setAddressValue(e.target.value)}
                            disabled={!isEditing}
                            placeholder="기본배송지가 등록되지 않았습니다."
                            className="mb-2"
                        />
                    </div>
                )}

                {/* 판매자 전환 섹션 */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-s font-medium">판매할 상품이 있으신가요?</span>
                    <Link to="/productregister">
                        <Button variant="default">상품등록</Button>
                    </Link>
                </div>
            </div>

            {/* 탭을 이용한 판매 내역과 구매 내역 */}
            <Tabs defaultValue="buy" className="mb-8">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="buy">구매 내역</TabsTrigger>
                    <TabsTrigger value="sell">판매 내역</TabsTrigger>
                </TabsList>
                <TabsContent value="buy">
                    <PurchaseHistoryTable />
                </TabsContent>
                <TabsContent value="sell">
                    <SellerProductsTable />
                </TabsContent>
            </Tabs>

            {userProfile?.user_id && (
                <div className="mt-4 items-center">
                    <span
                        className="text-sm text-gray-500 hover:font-bold hover:underline cursor-pointer"
                        onClick={handleDeleteUserProfile}
                    >
                        계정 삭제 및 회원 탈퇴
                    </span>
                </div>
            )}
        </div>
    );
};

export default Mypage;
