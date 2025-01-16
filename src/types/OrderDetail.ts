export interface OrderDetail {
    buyer_id: string | null;
    order_id: string;
    delivery_address: string;
    total_price: number;
    status: string | null;
    created_at: string | null;
    payment_id: string | null;
    payment_status: string | null;
    payment_method: string | null;
    payment_created_at: string | null;
    product_id: string;
    order_quantity: number;
    product_name: string;
    seller_id: string;
    price: number;
    image_url: string;
    nickname: string | null;
    // order_products: OrderProduct[];
}

// export interface OrderProduct {
//     product_id: string;
//     order_quantity: number;
//     product_name: string;
//     seller_id: string;
//     price: number;
//     image_url: string;
//     nickname: string | null;
// }
