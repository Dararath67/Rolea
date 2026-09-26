import { GameProduct, Order, PaymentMethod } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, PAYMENT_METHODS } from './initialData';

declare global {
  // eslint-disable-next-line no-var
  var __topupProducts: GameProduct[] | undefined;
  // eslint-disable-next-line no-var
  var __topupOrders: Order[] | undefined;
}

if (!globalThis.__topupProducts) {
  globalThis.__topupProducts = [...INITIAL_PRODUCTS];
}

if (!globalThis.__topupOrders) {
  globalThis.__topupOrders = [...INITIAL_ORDERS];
}

export const getProducts = (): GameProduct[] => {
  return globalThis.__topupProducts || INITIAL_PRODUCTS;
};

export const getProductBySlug = (slug: string): GameProduct | undefined => {
  return getProducts().find(p => p.slug === slug || p.id === slug);
};

export const getPaymentMethods = (): PaymentMethod[] => {
  return PAYMENT_METHODS;
};

export const getOrders = (): Order[] => {
  return (globalThis.__topupOrders || []).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

export const getOrderById = (id: string): Order | undefined => {
  return getOrders().find(o => o.id.toLowerCase() === id.toLowerCase());
};
