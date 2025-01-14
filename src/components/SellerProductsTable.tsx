/* SellerProductsTable.tsx */
import React, { useState, useMemo, useCallback } from 'react';
import { useReactTable, ColumnDef, flexRender, getCoreRowModel } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { deleteProduct, getSellerProducts } from '@/api/products';
// import useAuthStore from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Database } from '@/types/database.types';
import { useAuth } from '@/hooks/useAuth'; // React Query 기반 인증 훅 추가
import { toast } from 'react-toastify';

type Product = Database['public']['Tables']['products']['Row'];
interface MutationContext {
    previousProducts?: Product[];
}

export const SellerProductsTable: React.FC = () => {
    // React Query를 사용하여 인증된 사용자 정보 가져오기
    const { data: user, isLoading: isAuthLoading, isError: isAuthError, error: authError } = useAuth();
    const [filter, setFilter] = useState('');
    const navigate = useNavigate(); // useNavigate 훅 초기화
    const queryClient = useQueryClient();
    const [isDeleting, setIsDeleting] = useState<string | null>(null); // 현재 삭제 중인 상품 ID

    // 현재 판매상품목록 조회
    const {
        data: products,
        isLoading: isProductsLoading,
        isError: isProductsError,
        error: productsError,
    } = useQuery<Product[], Error>({
        queryKey: ['products', user?.id],
        queryFn: () => getSellerProducts(user!.id),
        enabled: !!user?.id,
        staleTime: 5 * 60 * 1000, // 5분
        gcTime: 30 * 60 * 1000, // 30분
        // onError: (error: Error) => {
        //     toast.error(`판매 상품 목록을 불러오는 중 오류가 발생했습니다: ${error.message}`);
        // },
    });

    //상품 삭제 Mutation 훅
    const deleteMutation = useMutation<void, Error, string, MutationContext>({
        mutationFn: deleteProduct,
        onMutate: async (productId: string) => {
            // 이전 쿼리 취소
            await queryClient.cancelQueries({ queryKey: ['products', user?.id], exact: true });

            // 이전 데이터 백업
            const previousProducts = queryClient.getQueryData<Product[]>(['products', user!.id]);

            // 낙관적 업데이트: 상품을 제거한 새로운 배열로 설정
            if (previousProducts) {
                queryClient.setQueryData<Product[]>(
                    ['products', user?.id],
                    previousProducts.filter((product) => product.product_id !== productId)
                );
            }

            return { previousProducts };
        },
        onError: (err: Error, productId: string, context?: MutationContext) => {
            // 오류 발생 시 이전 데이터 복원
            if (context?.previousProducts) {
                queryClient.setQueryData(['products', user?.id], context.previousProducts);
            }
            setIsDeleting(null);
            toast.error(`상품 삭제에 실패했습니다: ${err.message}`);
        },
        onSettled: () => {
            // 쿼리 무효화하여 최신 데이터 가져오기
            if (user?.id) {
                queryClient.invalidateQueries({ queryKey: ['products', user.id] });
            }
            setIsDeleting(null);
        },
    });

    // '수정' 버튼 핸들러를 useCallback으로 메모이제이션
    const handleEdit = useCallback(
        (productId: string) => {
            navigate(`/products/edit/${productId}`);
        },
        [navigate]
    );

    // '삭제' 버튼 핸들러
    const handleDelete = useCallback(
        (productId: string) => {
            const confirmDelete = window.confirm('정말 이 상품을 삭제하시겠습니까?');
            if (!confirmDelete) return;

            setIsDeleting(productId);
            deleteMutation.mutate(productId);
        },
        [deleteMutation]
    );

    // Memoize columns to prevent re-creation on every render
    const columns: ColumnDef<Product>[] = useMemo(
        () => [
            { accessorKey: 'product_name', header: '상품 이름' },
            {
                accessorKey: 'price',
                header: '가격',
                cell: ({ row }) => `₩${(row.getValue('price') as number).toLocaleString()}`,
            },
            { accessorKey: 'quantity', header: '재고 수량' },
            {
                accessorKey: 'created_at',
                header: '등록일',
                cell: ({ row }) => new Date(row.getValue('created_at')).toLocaleDateString(),
            },
            // 'Actions' 열 추가
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <div className="flex space-x-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEdit(row.original.product_id)}
                            // className="text-blue-500 hover:underline"
                        >
                            수정
                        </Button>

                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(row.original.product_id)}
                            disabled={isDeleting === row.original.product_id || deleteMutation.isPending}
                        >
                            {isDeleting === row.original.product_id || deleteMutation.isPending ? '삭제 중...' : '삭제'}
                        </Button>
                    </div>
                ),
                // 열 너비 설정 (선택 사항)
                size: 150,
            },
        ],
        [handleEdit, handleDelete, isDeleting, deleteMutation.isPending]
    );

    // Memoize data to prevent re-creation on every render
    const filteredData = useMemo(() => {
        if (!products) return [];
        return products.filter((product) => product.product_name.toLowerCase().includes(filter.toLowerCase()));
    }, [products, filter]);

    const table = useReactTable({
        columns,
        data: filteredData,
        getCoreRowModel: getCoreRowModel(),
    });

    // 로딩 및 오류 상태 처리
    if (isAuthLoading || isProductsLoading) return <div>인증 및 상품 데이터를 로딩 중입니다...</div>;
    if (isAuthError) return <div className="text-red-500">인증 오류: {authError?.message}</div>;
    if (isProductsError)
        return (
            <div className="text-red-500">상품 데이터를 불러오는 중 오류가 발생했습니다: {productsError.message}</div>
        );

    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input
                    placeholder="상품 이름 검색..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="max-w-sm"
                />
            </div>
            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="whitespace-nowrap">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="hover:bg-gray-100">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="whitespace-nowrap">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="text-center">
                                    상품이 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default SellerProductsTable;
