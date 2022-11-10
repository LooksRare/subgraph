import { Bytes } from "@graphprotocol/graph-ts";
import { ZERO_BD, ZERO_BI } from "../../../../helpers/constants";
import { Aggregator, AggregatorByCurrency } from "../../generated/schema";

export function getOrInitializeAggregatorByCurrency(aggregator: Aggregator, currency: Bytes): AggregatorByCurrency {
  const aggregatorByCurrencyID = currency.toHexString();
  let aggregatorByCurrency = AggregatorByCurrency.load(aggregatorByCurrencyID);
  if (!aggregatorByCurrency) {
    aggregatorByCurrency = new AggregatorByCurrency(aggregatorByCurrencyID);
    aggregatorByCurrency.aggregator = aggregator.id;
    aggregatorByCurrency.currency = currency;
    aggregatorByCurrency.volume = ZERO_BD;
    aggregatorByCurrency.collections = ZERO_BI;
    aggregatorByCurrency.transactions = ZERO_BI;
    aggregatorByCurrency.users = ZERO_BI;
  }
  return aggregatorByCurrency;
}
