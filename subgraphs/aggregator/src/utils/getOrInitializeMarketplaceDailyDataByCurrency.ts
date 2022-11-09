import { BigInt } from "@graphprotocol/graph-ts";
import { ZERO_BD, ZERO_BI, ONE_DAY_BI } from "../../../../helpers/constants";
import { MarketplaceByCurrency, MarketplaceDailyDataByCurrency } from "../../generated/schema";

export function getOrInitializeMarketplaceDailyDataByCurrency(
  marketplaceByCurrency: MarketplaceByCurrency,
  dayID: BigInt
): MarketplaceDailyDataByCurrency {
  const ID = `${marketplaceByCurrency.id}-${dayID.toString()}`;
  let marketplaceDailyDataByCurrency = MarketplaceDailyDataByCurrency.load(ID);
  if (!marketplaceDailyDataByCurrency) {
    marketplaceDailyDataByCurrency = new MarketplaceDailyDataByCurrency(ID);
    marketplaceDailyDataByCurrency.currency = marketplaceByCurrency.currency;
    const dayStartTimestamp = dayID.times(ONE_DAY_BI);
    marketplaceDailyDataByCurrency.date = dayStartTimestamp;
    marketplaceDailyDataByCurrency.marketplaceByCurrency = marketplaceByCurrency.id;
    marketplaceDailyDataByCurrency.volume = ZERO_BD;
    marketplaceDailyDataByCurrency.collections = ZERO_BI;
    marketplaceDailyDataByCurrency.transactions = ZERO_BI;
    marketplaceDailyDataByCurrency.users = ZERO_BI;
  }
  return marketplaceDailyDataByCurrency;
}
