// src/api/cart.ts

import { supabase } from '@/lib/supabaseClient'
import { Database } from '@/types/database.types'

// 타입 정의
type Order = Database['public']['Tables']['orders']['Row']
type OrderProduct = Database['public']['Tables']['order_products']['Row']
type Product = Database['public']['Tables']['products']['Row']

/**
 * 사용자의 장바구니 주문을 가져오거나 없으면 새로 생성
 * @param userId - 사용자의 ID
 * @returns 장바구니 주문
 */
export const getOrCreateCartOrder = async (userId: string): Promise<Order> => {
  // 이미 장바구니에 해당하는 주문이 있는지 확인
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('buyer_id', userId)
    .eq('status', 'cart') // status가 'cart'인 주문을 장바구니로 간주
    .maybeSingle()

    console.log('data: ',data)
  if (error && error.code !== 'PGRST116') { // 'PGRST116'은 결과가 없음을 나타냄
    console.error('장바구니 주문 조회 오류:', error.message)
    throw new Error(error.message)
  }

  if (data) {
    return data
  }

  // 장바구니 주문이 없으면 새로 생성
  const { data: newOrder, error: insertError } = await supabase
    .from('orders')
    .insert({
      buyer_id: userId,
      delivery_address: '', // 배송 주소는 추후 설정
      total_price: 0, // 장바구니이므로 0으로 설정
      status: 'cart', // 주문 상태 설정
    })
    .select()
    .single()

  if (insertError) {
    console.error('장바구니 주문 생성 오류:', insertError.message)
    throw new Error(insertError.message)
  }

  return newOrder
}

/**
 * 장바구니에 상품 추가하기
 * @param userId - 사용자의 ID
 * @param productId - 추가할 상품의 ID
 * @param quantity - 추가할 수량
 * @returns 추가된 또는 업데이트된 order_product
 */
export const addToCart = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<OrderProduct> => {
  const cartOrder = await getOrCreateCartOrder(userId)

  // 이미 장바구니에 해당 상품이 있는지 확인
  const { data: existingOrderProduct, error: fetchError } = await supabase
    .from('order_products')
    .select('*')
    .eq('order_id', cartOrder.order_id)
    .eq('product_id', productId)
    .maybeSingle()

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('장바구니 항목 조회 오류:', fetchError.message)
    throw new Error(fetchError.message)
  }

  if (existingOrderProduct) {
    // 이미 존재하는 경우 수량 업데이트
    const { data, error: updateError } = await supabase
      .from('order_products')
      .update({ order_quantity: existingOrderProduct.order_quantity + quantity })
      .eq('order_id', cartOrder.order_id)
      .eq('product_id', productId)
      .select()
      .single()

    if (updateError) {
      console.error('장바구니 항목 업데이트 오류:', updateError.message)
      throw new Error(updateError.message)
    }

    return data
  }

  // 존재하지 않는 경우 새 항목 추가
  const { data, error: insertError } = await supabase
    .from('order_products')
    .insert({
      order_id: cartOrder.order_id,
      product_id: productId,
      order_quantity: quantity,
      is_packaged: false, // 초기값 설정
    })
    .select()
    .single()

  if (insertError) {
    console.error('장바구니 항목 추가 오류:', insertError.message)
    throw new Error(insertError.message)
  }

  return data
}

/**
 * 장바구니 항목 가져오기
 * @param userId - 사용자의 ID
 * @returns 장바구니 항목 목록
 */
export const getCartItems = async (
  userId: string
): Promise<(OrderProduct & { product: Product })[]> => {
  const cartOrder = await getOrCreateCartOrder(userId)

  const { data, error } = await supabase
    .from('order_products')
    .select(`
      *,
      product: products(*)
    `)
    .eq('order_id', cartOrder.order_id)

  if (error) {
    console.error('장바구니 항목 조회 오류:', error.message)
    throw new Error(error.message)
  }

  return data as (OrderProduct & { product: Product })[]
}

/**
 * 장바구니 항목 수량 업데이트
 * @param userId - 사용자의 ID
 * @param productId - 업데이트할 상품의 ID
 * @param quantity - 새로운 수량
 * @returns 업데이트된 order_product
 */
export const updateCartItemQuantity = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<OrderProduct> => {
  const cartOrder = await getOrCreateCartOrder(userId)

  const { data, error } = await supabase
    .from('order_products')
    .update({ order_quantity: quantity })
    .eq('order_id', cartOrder.order_id)
    .eq('product_id', productId)
    .select()
    .single()

  if (error) {
    console.error('장바구니 항목 수량 업데이트 오류:', error.message)
    throw new Error(error.message)
  }

  return data
}

/**
 * 장바구니 항목 제거
 * @param userId - 사용자의 ID
 * @param productId - 제거할 상품의 ID
 * @returns 제거 성공 여부
 */
export const removeCartItem = async (
  userId: string,
  productId: string
): Promise<boolean> => {
  const cartOrder = await getOrCreateCartOrder(userId)

  const { error } = await supabase
    .from('order_products')
    .delete()
    .eq('order_id', cartOrder.order_id)
    .eq('product_id', productId)

  if (error) {
    console.error('장바구니 항목 제거 오류:', error.message)
    throw new Error(error.message)
  }

  return true
}
