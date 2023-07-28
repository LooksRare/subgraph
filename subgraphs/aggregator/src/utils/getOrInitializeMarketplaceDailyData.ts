import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ZERO_BI, ONE_DAY_BI } from "../../../../helpers/constants";
import { Marketplace, MarketplaceDailyData } from "../../generated/schema";

export function getOrInitializeMarketplaceDailyData(
  currency: Bytes,
  marketplace: Marketplace,
  dayID: BigInt,
): MarketplaceDailyData {
  const marketplaceDailyDataID = `${marketplace.id}-${dayID.toString()}`;
  let marketplaceDailyData = MarketplaceDailyData.load(marketplaceDailyDataID);
  if (!marketplaceDailyData) {
    marketplaceDailyData = new MarketplaceDailyData(marketplaceDailyDataID);
    const dayStartTimestamp = dayID.times(ONE_DAY_BI);
    marketplaceDailyData.date = dayStartTimestamp;
    marketplaceDailyData.marketplace = marketplace.id;
    marketplaceDailyData.collections = ZERO_BI;
    marketplaceDailyData.transactions = ZERO_BI;
    marketplaceDailyData.users = ZERO_BI;
  }
  return marketplaceDailyData;
}
