import { Bytes } from "@graphprotocol/graph-ts";
import { ZERO_BD, ZERO_BI } from "../../../../helpers/constants";
import { AggregatorByCurrency } from "../../generated/schema";

export function getOrInitializeAggregatorByCurrency(currency: Bytes): AggregatorByCurrency {
  const aggregatorByCurrencyID = currency.toHexString();
  let aggregatorByCurrency = AggregatorByCurrency.load(aggregatorByCurrencyID);
  if (!aggregatorByCurrency) {
    aggregatorByCurrency = new AggregatorByCurrency(aggregatorByCurrencyID);
    aggregatorByCurrency.currency = currency;
    aggregatorByCurrency.volume = ZERO_BD;
    aggregatorByCurrency.collections = ZERO_BI;
    aggregatorByCurrency.transactions = ZERO_BI;
    aggregatorByCurrency.users = ZERO_BI;
  }
  return aggregatorByCurrency;
}
