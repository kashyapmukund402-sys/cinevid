// Premium plans. Prices are shown to users; activation is done by admin after UPI payment.
export const PLANS = {
  "24h": { label: "24 Hours", price: 2, hours: 24 },
  "7d": { label: "7 Days", price: 12, hours: 24 * 7 },
  "30d": { label: "30 Days", price: 51, hours: 24 * 30 },
} as const;
export type PlanId = keyof typeof PLANS;
export const FREE_HOURS = 24;
