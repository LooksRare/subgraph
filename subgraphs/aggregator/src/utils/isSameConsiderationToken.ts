import { OrderFulfilledConsiderationStruct } from "../../generated/Seaport/Seaport";

export function isSameConsiderationToken(consideration: OrderFulfilledConsiderationStruct[]): boolean {
  const currency = consideration[0].token;
  const itemType = consideration[0].itemType;
  for (let i = 0; i < consideration.length; i++) {
    const receivedItem = consideration[i];
    if (receivedItem.token != currency || receivedItem.itemType !== itemType) {
      return false;
    }
  }

  return true;
}
