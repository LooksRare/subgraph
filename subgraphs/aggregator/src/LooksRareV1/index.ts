import { ONE_BI, ONE_DAY_BI } from "../../../../helpers/constants";
import { TakerBid } from "../../generated/LooksRareV1/LooksRareExchange";
import { getOrInitializeAggregator } from "../utils/getOrInitializeAggregator";
import { getOrInitializeAggregatorByCurrency } from "../utils/getOrInitializeAggregatorByCurrency";
import { getOrInitializeAggregatorDailyData } from "../utils/getOrInitializeAggregatorDailyData";
import { getOrInitializeAggregatorDailyDataByCurrency } from "../utils/getOrInitializeAggregatorDailyDataByCurrency";

export function handleTakerBid(event: TakerBid): void {
  const currency = event.params.currency;
  const price = event.params.price.toBigDecimal();
  const dayID = event.block.timestamp.div(ONE_DAY_BI);

  // 1. Aggregator
  const aggregator = getOrInitializeAggregator();
  aggregator.transactions = aggregator.transactions.plus(ONE_BI);

  // 2. Aggregator by currency
  const aggregatorByCurrency = getOrInitializeAggregatorByCurrency(aggregator, currency);
  aggregatorByCurrency.volume = aggregatorByCurrency.volume.plus(price);
  aggregatorByCurrency.transactions = aggregatorByCurrency.transactions.plus(ONE_BI);

  // 3. Aggregator daily data
  const aggregatorDailyData = getOrInitializeAggregatorDailyData(dayID, aggregator);
  aggregatorDailyData.transactions = aggregatorDailyData.transactions.plus(ONE_BI);

  // 4. Aggregator daily data by currency
  const aggregatorDailyDataByCurrency = getOrInitializeAggregatorDailyDataByCurrency(
    aggregatorByCurrency,
    aggregatorDailyData,
    dayID
  );
  aggregatorDailyDataByCurrency.volume = aggregatorDailyDataByCurrency.volume.plus(price);

  aggregator.save();
  aggregatorByCurrency.save();
  aggregatorDailyData.save();
  aggregatorDailyDataByCurrency.save();
}
