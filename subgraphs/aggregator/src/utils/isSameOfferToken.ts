import { OrderFulfilledOfferStruct } from "../../generated/Seaport/Seaport";

export function isSameOfferToken(offer: OrderFulfilledOfferStruct[]): boolean {
  const offerToken = offer[0].token;
  for (let i = 0; i < offer.length; i++) {
    if (offer[i].token != offerToken) {
      return false;
    }
  }

  return true;
}
