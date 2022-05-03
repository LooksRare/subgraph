import { BigInt } from "@graphprotocol/graph-ts";
import { ONE_BI, ZERO_BI } from "../../../../helpers/constants";
import { DailySnapshot, Overview } from "../../generated/schema";
import { initializeDailySnapshot } from "./initializeDailySnapshot";
import { initializeOverview } from "./initializeOverview";
import { fetchTotalAmountStakedAggregator, fetchTotalAmountStakedFeeSharing } from "./rpc-calls/fetchTotalAmountStaked";

export function setupOverviewAndDailySnapshot(timestamp: BigInt): DailySnapshot {
  const dailyTimestampBigInt = BigInt.fromI32(86400);
  const dayID = timestamp.div(dailyTimestampBigInt);
  const dayStartTimestamp = dayID.times(dailyTimestampBigInt);
  const ID = dayID.toString();

  let dailySnapshot = DailySnapshot.load(ID);
  if (dailySnapshot === null) {
    let overview = Overview.load(ONE_BI.toHex());
    if (overview === null) {
      overview = initializeOverview();
    }

    dailySnapshot = initializeDailySnapshot(ID, dayStartTimestamp);
    dailySnapshot.aggregatorActiveUsers = overview.aggregatorActiveUsers;
    dailySnapshot.feeSharingActiveUsers = overview.feeSharingActiveUsers;
    dailySnapshot.aggregatorTotalStakedLOOKS = overview.aggregatorTotalStakedLOOKS;
    dailySnapshot.feeSharingTotalStakedLOOKS = overview.feeSharingTotalStakedLOOKS;

    if (overview.aggregatorActiveUsers.gt(ZERO_BI)) {
      overview.aggregatorTotalStakedLOOKS = fetchTotalAmountStakedAggregator();
    }

    if (overview.feeSharingActiveUsers.gt(ZERO_BI)) {
      overview.feeSharingTotalStakedLOOKS = fetchTotalAmountStakedFeeSharing().minus(
        overview.aggregatorTotalStakedLOOKS
      );
    }
    overview.save();
  }
  return dailySnapshot;
}
