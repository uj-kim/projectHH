import React, { useState, useEffect } from 'react';
import { useReactTable, ColumnDef, flexRender, getCoreRowModel } from '@tanstack/react-table';
// import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getSellerProducts } from '@/api/products';
import useAuthStore from '@/stores/authStore';

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

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            const data = await getSellerProducts(user.id);
            if (data) {
                // null 값을 기본값으로 변환
                const normalizedData = data.map((item) => ({
                    ...item,
                    created_at: item.created_at || '', // null인 경우 빈 문자열로 변환
                }));
                setProducts(normalizedData);
            } else {
                console.error('Failed to fetch products.');
            }
        };

        fetchData();
    }, [user]);

    const columns: ColumnDef<Product>[] = [
        { accessorKey: 'product_name', header: '상품 이름' },
        {
            accessorKey: 'price',
            header: '가격',
            cell: ({ row }) => {
                const price = row.getValue('price');
                return `₩${(price as number).toLocaleString()}`;
            },
        },
        { accessorKey: 'quantity', header: '재고 수량' },
        {
            accessorKey: 'created_at',
            header: '등록일',
            cell: ({ row }) => new Date(row.getValue('created_at')).toLocaleDateString(),
        },
    ];

    const table = useReactTable({
        columns,
        data: products.filter((product) => product.product_name.toLowerCase().includes(filter.toLowerCase())),
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
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
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
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
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
