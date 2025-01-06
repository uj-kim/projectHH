/* SellerProductsTable.tsx */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useReactTable, ColumnDef, flexRender, getCoreRowModel } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { deleteProduct, getSellerProducts } from '@/api/products';
import useAuthStore from '@/stores/authStore';
import { useNavigate } from 'react-router-dom'; // React Router v6 사용 시
import { Button } from './ui/button';

type Product = {
    product_id: string;
    product_name: string;
    price: number;
    quantity: number;
    created_at: string;
};

export const SellerProductsTable: React.FC = () => {
    const user = useAuthStore((state) => state.user);
    const [products, setProducts] = useState<Product[]>([]);
    const [filter, setFilter] = useState('');
    const navigate = useNavigate(); // useNavigate 훅 초기화
    const [isDeleting, setIsDeleting] = useState<string | null>(null); // 현재 삭제 중인 상품 ID

    useEffect(() => {
        console.log('Fetching products for user:', user?.id);

        const fetchData = async () => {
            if (!user?.id) return;

            try {
                const data = await getSellerProducts(user.id);
                if (data) {
                    const normalizedData = data.map((item) => ({
                        ...item,
                        created_at: item.created_at || '',
                    }));
                    setProducts(normalizedData);
                } else {
                    console.error('Failed to fetch products.');
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchData();
    }, [user?.id]);

    // '수정' 버튼 핸들러를 useCallback으로 메모이제이션
    const handleEdit = useCallback(
        (productId: string) => {
            navigate(`/products/edit/${productId}`); // 수정 페이지 경로에 맞게 조정
        },
        [navigate]
    );
    // '삭제'버튼 핸들러
    const handleDelete = useCallback(async (productId: string) => {
        const confirmDelete = window.confirm('정말 이 상품을 삭제하시겠습니까?');
        if (!confirmDelete) return;

        setIsDeleting(productId);

        const success = await deleteProduct(productId);
        if (success) {
            // toast.success('상품이 성공적으로 삭제되었습니다.');
            console.log('상품이 성공적으로 삭제되었습니다.');
            setProducts((prevProducts) => prevProducts.filter((product) => product.product_id !== productId));
        } else {
            // toast.error('상품 삭제에 실패했습니다. 다시 시도해주세요.');
            console.log('상품 삭제에 실패했습니다. 다시 시도해주세요.');
        }

        setIsDeleting(null);
    }, []);

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
                            disabled={isDeleting === row.original.product_id}
                        >
                            {isDeleting === row.original.product_id ? '삭제 중...' : '삭제'}
                        </Button>
                    </div>
                ),
                // 열 너비 설정 (선택 사항)
                size: 150,
            },
        ],
        [handleEdit, handleDelete, isDeleting]
    ); // handleEdit을 의존성 배열에 포함

    // Memoize data to prevent re-creation on every render
    const data = useMemo(() => {
        return products.filter((product) => product.product_name.toLowerCase().includes(filter.toLowerCase()));
    }, [products, filter]);

    const table = useReactTable({
        columns,
        data,
        getCoreRowModel: getCoreRowModel(),
    });

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
