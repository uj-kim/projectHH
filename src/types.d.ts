export interface UserProfile {
    user_id: string;
    email: string;
    is_seller: boolean;
    nickname: null | string;
    address: null | string;
    created_at: string;
    updated_at: string;
}

export interface Category {
    category_id: string;
    category_name: string;
}

export interface Product {
    product_id: string;
    seller_id: string;
    product_name: string;
    price: number;
    quantity: number;
    description: string;
    category_id: string;
    image_url: null | string;
    created_at: string;
    updated_at: string;

    categories?: Category;
    user_profiles?: UserProfile;
}

export interface Order {
    order_id: string;
    buyer_id: string;
    product_id: string;
    total_price: number;
    delivery_address: string;
    created_at: string;

    buyer?: UserProfile;
    product?: Product;
}

export interface OrderProduct {
    order_id: string;
    product_id: string;
    order_quantity: number;
    is_packaged: boolean;

    product?: Product;
    order?: Order;
}

export interface Review {
    review_id: string;
    product_id: string;
    user_id: string;
    rating: number;
    comment: string;
    created_at: string;

    product?: Product;
    user_profile?: UserProfile;
}

export interface Payment {
    payment_id: string;
    order_id: string;
    user_id: string;
    payment_method: string;
    payment_status: string;
    created_at: string;

    order?: Order;
    user_profile?: UserProfile;
}
