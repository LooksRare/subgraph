import { ONE_BI } from "../../../../helpers/constants";
import { TakerBid } from "../../generated/LooksRareV1/LooksRareExchange";
import { getOrInitializeAggregator } from "../utils/getOrInitializeAggregator";

export function handleTakerBid(event: TakerBid): void {
  const aggregator = getOrInitializeAggregator();
  aggregator.transactions = aggregator.transactions.plus(ONE_BI);

  aggregator.save();
}
