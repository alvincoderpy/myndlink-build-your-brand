export const PLAN_LIMITS = {
  free: { stores: 1, products: 10 },
  grow: { stores: 1, products: 100 },
  business: { stores: 3, products: 500 },
  enterprise: { stores: 10, products: 2000 }
};

export function canAddStore(currentCount: number, plan: string): boolean {
  const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
  return currentCount < limit.stores;
}

export function canAddProduct(currentCount: number, plan: string): boolean {
  const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
  return currentCount < limit.products;
}

export function getProductLimit(plan: string): number {
  const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
  return limit.products;
}

export function getStoreLimit(plan: string): number {
  const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
  return limit.stores;
}
