import { ZERO_BI } from "../../../../helpers/constants";
import { Aggregator } from "../../generated/schema";

export function getOrInitializeAggregator(): Aggregator {
  const aggregatorID = "LooksRareAggregator";
  let aggregator = Aggregator.load(aggregatorID);
  if (!aggregator) {
    aggregator = new Aggregator(aggregatorID);
    aggregator.collections = ZERO_BI;
    aggregator.transactions = ZERO_BI;
    aggregator.users = ZERO_BI;
  }
  return aggregator;
}
