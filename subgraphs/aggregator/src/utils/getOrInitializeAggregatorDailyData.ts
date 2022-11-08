import { BigInt } from "@graphprotocol/graph-ts";
import { ZERO_BI, ONE_DAY_BI } from "../../../../helpers/constants";
import { Aggregator, AggregatorDailyData } from "../../generated/schema";

export function getOrInitializeAggregatorDailyData(dayID: BigInt, aggregator: Aggregator): AggregatorDailyData {
  const aggregatorDailyDataID = dayID.toString();
  let aggregatorDailyData = AggregatorDailyData.load(aggregatorDailyDataID);
  if (!aggregatorDailyData) {
    aggregatorDailyData = new AggregatorDailyData(aggregatorDailyDataID);
    const dayStartTimestamp = dayID.times(ONE_DAY_BI);
    aggregatorDailyData.date = dayStartTimestamp;
    aggregatorDailyData.collections = ZERO_BI;
    aggregatorDailyData.transactions = ZERO_BI;
    aggregatorDailyData.users = ZERO_BI;
    aggregatorDailyData.aggregator = aggregator.id;
  }
  return aggregatorDailyData;
}
