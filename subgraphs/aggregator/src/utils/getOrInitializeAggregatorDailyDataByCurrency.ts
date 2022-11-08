import { BigInt } from "@graphprotocol/graph-ts";
import { ZERO_BD, ZERO_BI, ONE_DAY_BI } from "../../../../helpers/constants";
import { AggregatorByCurrency, AggregatorDailyDataByCurrency } from "../../generated/schema";

export function getOrInitializeAggregatorDailyDataByCurrency(
  aggregatorByCurrency: AggregatorByCurrency,
  dayID: BigInt
): AggregatorDailyDataByCurrency {
  const aggregatorDailyDataByCurrencyID = `${aggregatorByCurrency.id}-${dayID.toString()}`;
  let aggregatorDailyDataByCurrency = AggregatorDailyDataByCurrency.load(aggregatorDailyDataByCurrencyID);
  if (!aggregatorDailyDataByCurrency) {
    aggregatorDailyDataByCurrency = new AggregatorDailyDataByCurrency(aggregatorDailyDataByCurrencyID);
    aggregatorDailyDataByCurrency.currency = aggregatorByCurrency.currency;
    const dayStartTimestamp = dayID.times(ONE_DAY_BI);
    aggregatorDailyDataByCurrency.date = dayStartTimestamp;
    aggregatorDailyDataByCurrency.volume = ZERO_BD;
    aggregatorDailyDataByCurrency.collections = ZERO_BI;
    aggregatorDailyDataByCurrency.transactions = ZERO_BI;
    aggregatorDailyDataByCurrency.users = ZERO_BI;
    aggregatorDailyDataByCurrency.aggregatorByCurrency = aggregatorByCurrency.id;
  }
  return aggregatorDailyDataByCurrency;
}
