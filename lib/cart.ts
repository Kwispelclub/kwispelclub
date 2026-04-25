// lib/cart.ts
// Winkelwagen beheer via localStorage

export interface CartItem {
  id: string
  naam: string
  prijs: number
  aantal: number
  emoji: string
  img?: string
}

export function getCart(): CartItem[] {
  try {
    const saved = localStorage.getItem('kc_cart')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export function saveCart(cart: CartItem[]) {
  localStorage.setItem('kc_cart', JSON.stringify(cart))
  // Dispatch event zodat Navbar het cartcount kan updaten
  window.dispatchEvent(new Event('cart-updated'))
}

export function addToCart(item: Omit<CartItem, 'aantal'>, aantal = 1) {
  const cart = getCart()
  const existing = cart.findIndex(i => i.id === item.id)
  if (existing >= 0) {
    cart[existing].aantal += aantal
  } else {
    cart.push({ ...item, aantal })
  }
  saveCart(cart)
}

export function removeFromCart(id: string) {
  const cart = getCart().filter(i => i.id !== id)
  saveCart(cart)
}

export function updateAantal(id: string, aantal: number) {
  const cart = getCart().map(i => i.id === id ? { ...i, aantal } : i).filter(i => i.aantal > 0)
  saveCart(cart)
}

export function clearCart() {
  localStorage.removeItem('kc_cart')
  window.dispatchEvent(new Event('cart-updated'))
}

export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.aantal, 0)
}

export function getCartTotal(): number {
  return getCart().reduce((sum, item) => sum + item.prijs * item.aantal, 0)
}
