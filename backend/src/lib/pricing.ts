export function getTicketUnitPrice(tierPrice: number, discountPercent = 0): number {
  if (tierPrice === 0) return 0;
  if (!discountPercent) return tierPrice;
  return Math.round(tierPrice * (1 - discountPercent / 100));
}

export function getServiceFee(unitPrice: number, serviceFeePercent: number): number {
  if (unitPrice === 0) return 0;
  return Math.round(unitPrice * (serviceFeePercent / 100));
}

export function getFinalUnitPrice(
  tierPrice: number,
  discountPercent = 0,
  serviceFeePercent = 0
): number {
  const unitPrice = getTicketUnitPrice(tierPrice, discountPercent);
  return unitPrice + getServiceFee(unitPrice, serviceFeePercent);
}

export const MAX_TICKETS_PER_USER_PER_EVENT = 4;
