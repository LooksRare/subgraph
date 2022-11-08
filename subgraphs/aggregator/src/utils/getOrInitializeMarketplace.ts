import { Bytes } from "@graphprotocol/graph-ts";
import { ZERO_BD, ZERO_BI } from "../../../../helpers/constants";
import { Marketplace } from "../../generated/schema";

export function getOrInitializeMarketplace(currency: Bytes): Marketplace {
  const marketplaceID = `seaport-${currency.toHexString()}`;
  let marketplace = Marketplace.load(marketplaceID);
  if (!marketplace) {
    marketplace = new Marketplace(marketplaceID);
    marketplace.currency = currency;
    marketplace.volume = ZERO_BD;
    marketplace.collections = ZERO_BI;
    marketplace.transactions = ZERO_BI;
    marketplace.users = ZERO_BI;
  }
  return marketplace;
}
