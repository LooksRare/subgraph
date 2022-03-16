/* eslint-disable prefer-const */
import { BigInt, BigDecimal } from "@graphprotocol/graph-ts";
import { ZERO_BD, ZERO_BI, ONE_BI } from ".";
import { DailySnapshot, Overview } from "../../generated/schema";

export function initializeDailySnapshot(ID: string, dayStartTimestamp: BigInt): DailySnapshot {
  const dailySnapshot = new DailySnapshot(ID);
  dailySnapshot.date = dayStartTimestamp;
  dailySnapshot.aggregatorActiveUsers = ZERO_BI;
  dailySnapshot.aggregatorNewUsers = ZERO_BI;
  dailySnapshot.aggregatorRemovedUsers = ZERO_BI;
  dailySnapshot.aggregatorDailyInflowLOOKS = ZERO_BD;
  dailySnapshot.aggregatorDailyOutflowLOOKS = ZERO_BD;
  dailySnapshot.aggregatorTotalStakedLOOKS = ZERO_BD;
  dailySnapshot.feeSharingActiveUsers = ZERO_BI;
  dailySnapshot.feeSharingNewUsers = ZERO_BI;
  dailySnapshot.feeSharingRemovedUsers = ZERO_BI;
  dailySnapshot.feeSharingDailyInflowLOOKS = ZERO_BD;
  dailySnapshot.feeSharingDailyOutflowLOOKS = ZERO_BD;
  dailySnapshot.feeSharingTotalStakedLOOKS = ZERO_BD;
  return dailySnapshot;
}

export function initializeOverview(): Overview {
  const overview = new Overview(BigInt.fromI32(1).toHex());
  overview.aggregatorActiveUsers = ZERO_BI;
  overview.feeSharingActiveUsers = ZERO_BI;
  return overview;
}

export function updateDailySnapshotFeeSharing(
  timestamp: BigInt,
  amount: BigDecimal,
  isDeposit: boolean,
  isFinalWithdraw: boolean,
  isNewUser: boolean
): void {
  let dailyTimestampBigInt = BigInt.fromI32(86400);
  let dayID = timestamp.div(dailyTimestampBigInt);
  let dayStartTimestamp = dayID.times(dailyTimestampBigInt);
  let ID = dayID.toString();

  let overview = Overview.load(BigInt.fromI32(1).toHex());
  if (overview === null) {
    overview = initializeOverview();
  }

  let dailySnapshot = DailySnapshot.load(ID);
  if (dailySnapshot === null) {
    dailySnapshot = initializeDailySnapshot(ID, dayStartTimestamp);
    // Set the initial number of active users as the cached numbers in the overview entity
    dailySnapshot.aggregatorActiveUsers = overview.aggregatorActiveUsers;
    dailySnapshot.feeSharingActiveUsers = overview.feeSharingActiveUsers;
  }

  if (isDeposit) {
    dailySnapshot.feeSharingDailyInflowLOOKS = dailySnapshot.feeSharingDailyInflowLOOKS.plus(amount);

    if (isNewUser) {
      dailySnapshot.feeSharingNewUsers = dailySnapshot.feeSharingNewUsers.plus(ONE_BI);
      dailySnapshot.feeSharingActiveUsers = dailySnapshot.feeSharingActiveUsers.plus(ONE_BI);
      overview.feeSharingActiveUsers = overview.feeSharingActiveUsers.plus(ONE_BI);
    }
  } else {
    dailySnapshot.feeSharingDailyOutflowLOOKS = dailySnapshot.feeSharingDailyOutflowLOOKS.plus(amount);

    if (isFinalWithdraw) {
      dailySnapshot.feeSharingRemovedUsers = dailySnapshot.feeSharingRemovedUsers.plus(ONE_BI);
      dailySnapshot.feeSharingActiveUsers = dailySnapshot.feeSharingActiveUsers.minus(ONE_BI);
      overview.feeSharingActiveUsers = overview.feeSharingActiveUsers.minus(ONE_BI);
    }
  }

  overview.save();
  dailySnapshot.save();
}

export function updateDailySnapshotAggregator(
  timestamp: BigInt,
  amount: BigDecimal,
  isDeposit: boolean,
  isFinalWithdraw: boolean,
  isNewUser: boolean
): void {
  let dailyTimestampBigInt = BigInt.fromI32(86400);
  let dayID = timestamp.div(dailyTimestampBigInt);
  let dayStartTimestamp = dayID.times(dailyTimestampBigInt);
  let ID = dayID.toString();

  let overview = Overview.load(BigInt.fromI32(1).toHex());
  if (overview === null) {
    overview = initializeOverview();
  }

  let dailySnapshot = DailySnapshot.load(ID);
  if (dailySnapshot === null) {
    dailySnapshot = initializeDailySnapshot(ID, dayStartTimestamp);
    // Set the initial number of active users as the cached numbers in the overview entity
    dailySnapshot.aggregatorActiveUsers = overview.aggregatorActiveUsers;
    dailySnapshot.feeSharingActiveUsers = overview.feeSharingActiveUsers;
  }

  if (isDeposit) {
    dailySnapshot.aggregatorDailyInflowLOOKS = dailySnapshot.aggregatorDailyInflowLOOKS.plus(amount);

    if (isNewUser) {
      dailySnapshot.aggregatorNewUsers = dailySnapshot.aggregatorNewUsers.plus(ONE_BI);
      dailySnapshot.aggregatorActiveUsers = dailySnapshot.aggregatorActiveUsers.plus(ONE_BI);
      overview.feeSharingActiveUsers = overview.feeSharingActiveUsers.plus(ONE_BI);
    }
  } else {
    dailySnapshot.aggregatorDailyOutflowLOOKS = dailySnapshot.aggregatorDailyOutflowLOOKS.plus(amount);

    if (isFinalWithdraw) {
      dailySnapshot.aggregatorRemovedUsers = dailySnapshot.aggregatorRemovedUsers.plus(ONE_BI);
      dailySnapshot.aggregatorActiveUsers = dailySnapshot.aggregatorActiveUsers.minus(ONE_BI);
      overview.aggregatorActiveUsers = overview.aggregatorActiveUsers.minus(ONE_BI);
    }
  }

  overview.save();
  dailySnapshot.save();
}
