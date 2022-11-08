import { ZERO_BI } from "../../../../helpers/constants";
import { Marketplace } from "../../generated/schema";

export function getOrInitializeMarketplace(): Marketplace {
  const ID = "seaport";
  let marketplace = Marketplace.load(ID);
  if (!marketplace) {
    marketplace = new Marketplace(ID);
    marketplace.collections = ZERO_BI;
    marketplace.transactions = ZERO_BI;
    marketplace.users = ZERO_BI;
  }
  return marketplace;
}
