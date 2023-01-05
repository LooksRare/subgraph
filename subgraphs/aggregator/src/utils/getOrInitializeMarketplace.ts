import { ZERO_BI } from "../../../../helpers/constants";
import { Marketplace } from "../../generated/schema";

export function getOrInitializeMarketplace(id: string): Marketplace {
  let marketplace = Marketplace.load(id);
  if (!marketplace) {
    marketplace = new Marketplace(id);
    marketplace.collections = ZERO_BI;
    marketplace.transactions = ZERO_BI;
    marketplace.users = ZERO_BI;
  }
  return marketplace;
}
