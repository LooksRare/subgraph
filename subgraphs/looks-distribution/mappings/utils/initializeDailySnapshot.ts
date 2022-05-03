import { BigInt } from "@graphprotocol/graph-ts";
import { ZERO_BD, ZERO_BI } from "../../../../helpers/constants";
import { DailySnapshot } from "../../generated/schema";

export function initializeDailySnapshot(ID: string, dayStartTimestamp: BigInt): DailySnapshot {
  const dailySnapshot = new DailySnapshot(ID);
  dailySnapshot.date = dayStartTimestamp;
  dailySnapshot.aggregatorActiveUsers = ZERO_BI;
  dailySnapshot.aggregatorNewUsers = ZERO_BI;
  dailySnapshot.aggregatorRemovedUsers = ZERO_BI;
  dailySnapshot.aggregatorDailyInflowLOOKS = ZERO_BD;
  dailySnapshot.aggregatorDailyOutflowLOOKS = ZERO_BD;
  dailySnapshot.aggregatorTotalStakedLOOKS = ZERO_BD;
  dailySnapshot.aggregatorTotalWETHSold = ZERO_BD;
  dailySnapshot.aggregatorTotalLOOKSReceived = ZERO_BD;
  dailySnapshot.aggregatorConversionCount = ZERO_BI;
  dailySnapshot.feeSharingActiveUsers = ZERO_BI;
  dailySnapshot.feeSharingNewUsers = ZERO_BI;
  dailySnapshot.feeSharingRemovedUsers = ZERO_BI;
  dailySnapshot.feeSharingDailyInflowLOOKS = ZERO_BD;
  dailySnapshot.feeSharingDailyOutflowLOOKS = ZERO_BD;
  dailySnapshot.feeSharingTotalStakedLOOKS = ZERO_BD;
  return dailySnapshot;
}
