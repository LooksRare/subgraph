import { Bytes } from "@graphprotocol/graph-ts";
import { ZERO_BD, ZERO_BI } from "../../../../helpers/constants";
import { Marketplace, MarketplaceByCurrency } from "../../generated/schema";

export function getOrInitializeMarketplaceByCurrency(marketplace: Marketplace, currency: Bytes): MarketplaceByCurrency {
  const ID = `seaport-${currency.toHexString()}`;
  let marketplaceByCurrency = MarketplaceByCurrency.load(ID);
  if (!marketplaceByCurrency) {
    marketplaceByCurrency = new MarketplaceByCurrency(ID);
    marketplaceByCurrency.currency = currency;
    marketplaceByCurrency.volume = ZERO_BD;
    marketplaceByCurrency.collections = ZERO_BI;
    marketplaceByCurrency.transactions = ZERO_BI;
    marketplaceByCurrency.users = ZERO_BI;
    marketplaceByCurrency.marketplace = marketplace.id;
  }
  return marketplaceByCurrency;
}
