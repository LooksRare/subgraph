import { BigInt, BigDecimal } from "@graphprotocol/graph-ts";
import { initializeDailySnapshot } from "./initializeDailySnapshot";
import { initializeOverview } from "./initializeOverview";
import { fetchTotalAmountStakedAggregator, fetchTotalAmountStakedFeeSharing } from "./rpc-calls/fetchTotalAmountStaked";
import { DailySnapshot, Overview } from "../../generated/schema";
import { ZERO_BI, ONE_BI } from "../../../../helpers/constants";

export function setupOverviewAndDailySnapshot(timestamp: BigInt): DailySnapshot {
  const dailyTimestampBigInt = BigInt.fromI32(86400);
  const dayID = timestamp.div(dailyTimestampBigInt);
  const dayStartTimestamp = dayID.times(dailyTimestampBigInt);
  const ID = dayID.toString();

  let overview = Overview.load(ONE_BI.toHex());
  if (overview === null) {
    overview = initializeOverview();
  }

  let dailySnapshot = DailySnapshot.load(ID);
  if (dailySnapshot === null) {
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

export function updateDailySnapshotDepositFeeSharing(timestamp: BigInt, amount: BigDecimal): void {
  const dailySnapshot = setupOverviewAndDailySnapshot(timestamp);
  dailySnapshot.feeSharingDailyInflowLOOKS = dailySnapshot.feeSharingDailyInflowLOOKS.plus(amount);
  dailySnapshot.save();
}

export function updateDailySnapshotWithdrawFeeSharing(timestamp: BigInt, amount: BigDecimal): void {
  const dailySnapshot = setupOverviewAndDailySnapshot(timestamp);
  dailySnapshot.feeSharingDailyOutflowLOOKS = dailySnapshot.feeSharingDailyOutflowLOOKS.plus(amount);
  dailySnapshot.save();
}

export function updateNumberUsersFeeSharing(timestamp: BigInt, isIncrease: boolean): void {
  const dailySnapshot = setupOverviewAndDailySnapshot(timestamp);
  const overview = Overview.load(ONE_BI.toHex());
  if (overview === null) {
    // This should be impossible since it is initialized before
    return;
  }

  if (isIncrease) {
    dailySnapshot.feeSharingNewUsers = dailySnapshot.feeSharingNewUsers.plus(ONE_BI);
    dailySnapshot.feeSharingActiveUsers = dailySnapshot.feeSharingActiveUsers.plus(ONE_BI);
    overview.feeSharingActiveUsers = overview.feeSharingActiveUsers.plus(ONE_BI);
  } else {
    dailySnapshot.feeSharingRemovedUsers = dailySnapshot.feeSharingRemovedUsers.plus(ONE_BI);
    dailySnapshot.feeSharingActiveUsers = dailySnapshot.feeSharingActiveUsers.minus(ONE_BI);
    overview.feeSharingActiveUsers = overview.feeSharingActiveUsers.minus(ONE_BI);
  }

  dailySnapshot.save();
  overview.save();
}

export function updateDailySnapshotDepositAggregator(timestamp: BigInt, amount: BigDecimal): void {
  const dailySnapshot = setupOverviewAndDailySnapshot(timestamp);
  dailySnapshot.aggregatorDailyInflowLOOKS = dailySnapshot.aggregatorDailyInflowLOOKS.plus(amount);
  dailySnapshot.save();
}

export function updateDailySnapshotWithdrawAggregator(timestamp: BigInt, amount: BigDecimal): void {
  const dailySnapshot = setupOverviewAndDailySnapshot(timestamp);
  dailySnapshot.aggregatorDailyOutflowLOOKS = dailySnapshot.aggregatorDailyOutflowLOOKS.plus(amount);
  dailySnapshot.save();
}

export function updateNumberUsersAggregator(timestamp: BigInt, isIncrease: boolean): void {
  const dailySnapshot = setupOverviewAndDailySnapshot(timestamp);
  const overview = Overview.load(ONE_BI.toHex());
  if (overview === null) {
    // This should be impossible since it is initialized before
    return;
  }
  if (isIncrease) {
    dailySnapshot.aggregatorNewUsers = dailySnapshot.aggregatorNewUsers.plus(ONE_BI);
    dailySnapshot.aggregatorActiveUsers = dailySnapshot.aggregatorActiveUsers.plus(ONE_BI);
    overview.aggregatorActiveUsers = overview.aggregatorActiveUsers.plus(ONE_BI);
  } else {
    dailySnapshot.aggregatorRemovedUsers = dailySnapshot.aggregatorRemovedUsers.plus(ONE_BI);
    dailySnapshot.aggregatorActiveUsers = dailySnapshot.aggregatorActiveUsers.minus(ONE_BI);
    overview.aggregatorActiveUsers = overview.aggregatorActiveUsers.minus(ONE_BI);
  }

  dailySnapshot.save();
  overview.save();
}

export function updateDailySnapshotConversion(
  timestamp: BigInt,
  amountSold: BigDecimal,
  amountReceived: BigDecimal
): void {
  const dailyTimestampBigInt = BigInt.fromI32(86400);
  const dayID = timestamp.div(dailyTimestampBigInt);
  const dayStartTimestamp = dayID.times(dailyTimestampBigInt);
  const ID = dayID.toString();

  let dailySnapshot = DailySnapshot.load(ID);
  if (dailySnapshot === null) {
    dailySnapshot = initializeDailySnapshot(ID, dayStartTimestamp);
  }
  dailySnapshot.aggregatorTotalStakedLOOKS = dailySnapshot.aggregatorTotalStakedLOOKS.plus(amountSold);
  dailySnapshot.aggregatorTotalLOOKSReceived = dailySnapshot.aggregatorTotalLOOKSReceived.plus(amountReceived);
  dailySnapshot.aggregatorConversionCount = dailySnapshot.aggregatorConversionCount.plus(ONE_BI);
  dailySnapshot.save();
}
