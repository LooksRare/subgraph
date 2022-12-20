import { ONE_BI } from "../../../../helpers/constants";
import { TakerBid } from "../../generated/LooksRareV1/LooksRareExchange";
import { getOrInitializeAggregator } from "../utils/getOrInitializeAggregator";
import { getOrInitializeAggregatorByCurrency } from "../utils/getOrInitializeAggregatorByCurrency";

export function handleTakerBid(event: TakerBid): void {
  const currency = event.params.currency;
  const price = event.params.price.toBigDecimal();

  const aggregator = getOrInitializeAggregator();
  aggregator.transactions = aggregator.transactions.plus(ONE_BI);

  const aggregatorByCurrency = getOrInitializeAggregatorByCurrency(aggregator, currency);
  aggregatorByCurrency.volume = aggregatorByCurrency.volume.plus(price);
  aggregatorByCurrency.transactions = aggregatorByCurrency.transactions.plus(ONE_BI);

  aggregator.save();
  aggregatorByCurrency.save();
}
