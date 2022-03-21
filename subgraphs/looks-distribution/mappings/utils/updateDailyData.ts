/* eslint-disable prefer-const */
import { BigInt, BigDecimal } from "@graphprotocol/graph-ts";
import { ZERO_BD, ZERO_BI, ONE_BI } from ".";
import { DailySnapshot, Overview } from "../../generated/schema";
import { fetchTotalAmountStakedAggregator, fetchTotalAmountStakedFeeSharing } from "./fetchTotalAmountStaked";

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
  overview.aggregatorTotalStakedLOOKS = ZERO_BD;
  overview.feeSharingActiveUsers = ZERO_BI;
  overview.feeSharingTotalStakedLOOKS = ZERO_BD;
  return overview;
}

export function updateDailySnapshotDepositFeeSharing(timestamp: BigInt, amount: BigDecimal, isNewUser: boolean): void {
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
    dailySnapshot.aggregatorActiveUsers = overview.aggregatorActiveUsers;
    dailySnapshot.feeSharingActiveUsers = overview.feeSharingActiveUsers;
    dailySnapshot.aggregatorTotalStakedLOOKS = overview.aggregatorTotalStakedLOOKS;
    dailySnapshot.feeSharingTotalStakedLOOKS = overview.feeSharingTotalStakedLOOKS;

    if (overview.aggregatorActiveUsers > ZERO_BI) {
      overview.aggregatorTotalStakedLOOKS = fetchTotalAmountStakedAggregator();
    }

    if (overview.feeSharingActiveUsers > ZERO_BI) {
      overview.feeSharingTotalStakedLOOKS = fetchTotalAmountStakedFeeSharing().minus(
        overview.aggregatorTotalStakedLOOKS
      );
    }
  }

  dailySnapshot.feeSharingDailyInflowLOOKS = dailySnapshot.feeSharingDailyInflowLOOKS.plus(amount);

  if (isNewUser) {
    dailySnapshot.feeSharingNewUsers = dailySnapshot.feeSharingNewUsers.plus(ONE_BI);
    dailySnapshot.feeSharingActiveUsers = dailySnapshot.feeSharingActiveUsers.plus(ONE_BI);
    overview.feeSharingActiveUsers = overview.feeSharingActiveUsers.plus(ONE_BI);
  }

  overview.save();
  dailySnapshot.save();
}

export function updateDailySnapshotWithdrawFeeSharing(
  timestamp: BigInt,
  amount: BigDecimal,
  isFinalWithdraw: boolean
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
    dailySnapshot.aggregatorActiveUsers = overview.aggregatorActiveUsers;
    dailySnapshot.feeSharingActiveUsers = overview.feeSharingActiveUsers;
    dailySnapshot.aggregatorTotalStakedLOOKS = overview.aggregatorTotalStakedLOOKS;
    dailySnapshot.feeSharingTotalStakedLOOKS = overview.feeSharingTotalStakedLOOKS;

    if (overview.aggregatorActiveUsers > ZERO_BI) {
      overview.aggregatorTotalStakedLOOKS = fetchTotalAmountStakedAggregator();
    }

    if (overview.feeSharingActiveUsers > ZERO_BI) {
      overview.feeSharingTotalStakedLOOKS = fetchTotalAmountStakedFeeSharing().minus(
        overview.aggregatorTotalStakedLOOKS
      );
    }
  }

  dailySnapshot.feeSharingDailyOutflowLOOKS = dailySnapshot.feeSharingDailyOutflowLOOKS.plus(amount);

  if (isFinalWithdraw) {
    dailySnapshot.feeSharingRemovedUsers = dailySnapshot.feeSharingRemovedUsers.plus(ONE_BI);
    dailySnapshot.feeSharingActiveUsers = dailySnapshot.feeSharingActiveUsers.minus(ONE_BI);
    overview.feeSharingActiveUsers = overview.feeSharingActiveUsers.minus(ONE_BI);
  }

  overview.save();
  dailySnapshot.save();
}

export function updateDailySnapshotDepositAggregator(timestamp: BigInt, amount: BigDecimal, isNewUser: boolean): void {
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
    dailySnapshot.aggregatorActiveUsers = overview.aggregatorActiveUsers;
    dailySnapshot.feeSharingActiveUsers = overview.feeSharingActiveUsers;
    dailySnapshot.aggregatorTotalStakedLOOKS = overview.aggregatorTotalStakedLOOKS;
    dailySnapshot.feeSharingTotalStakedLOOKS = overview.feeSharingTotalStakedLOOKS;

    if (overview.aggregatorActiveUsers > ZERO_BI) {
      overview.aggregatorTotalStakedLOOKS = fetchTotalAmountStakedAggregator();
    }

    if (overview.feeSharingActiveUsers > ZERO_BI) {
      overview.feeSharingTotalStakedLOOKS = fetchTotalAmountStakedFeeSharing().minus(
        overview.aggregatorTotalStakedLOOKS
      );
    }
  }

  dailySnapshot.aggregatorDailyInflowLOOKS = dailySnapshot.aggregatorDailyInflowLOOKS.plus(amount);

  if (isNewUser) {
    dailySnapshot.aggregatorNewUsers = dailySnapshot.aggregatorNewUsers.plus(ONE_BI);
    dailySnapshot.aggregatorActiveUsers = dailySnapshot.aggregatorActiveUsers.plus(ONE_BI);
    overview.aggregatorActiveUsers = overview.aggregatorActiveUsers.plus(ONE_BI);
  }

  overview.save();
  dailySnapshot.save();
}

export function updateDailySnapshotWithdrawAggregator(
  timestamp: BigInt,
  amount: BigDecimal,
  isFinalWithdraw: boolean
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
    dailySnapshot.aggregatorActiveUsers = overview.aggregatorActiveUsers;
    dailySnapshot.feeSharingActiveUsers = overview.feeSharingActiveUsers;
    dailySnapshot.aggregatorTotalStakedLOOKS = overview.aggregatorTotalStakedLOOKS;
    dailySnapshot.feeSharingTotalStakedLOOKS = overview.feeSharingTotalStakedLOOKS;

    if (overview.aggregatorActiveUsers > ZERO_BI) {
      overview.aggregatorTotalStakedLOOKS = fetchTotalAmountStakedAggregator();
    }

    if (overview.feeSharingActiveUsers > ZERO_BI) {
      overview.feeSharingTotalStakedLOOKS = fetchTotalAmountStakedFeeSharing().minus(
        overview.aggregatorTotalStakedLOOKS
      );
    }
  }

  dailySnapshot.aggregatorDailyOutflowLOOKS = dailySnapshot.aggregatorDailyOutflowLOOKS.plus(amount);

  if (isFinalWithdraw) {
    dailySnapshot.aggregatorRemovedUsers = dailySnapshot.aggregatorRemovedUsers.plus(ONE_BI);
    dailySnapshot.aggregatorActiveUsers = dailySnapshot.aggregatorActiveUsers.minus(ONE_BI);
    overview.aggregatorActiveUsers = overview.aggregatorActiveUsers.minus(ONE_BI);
  }

  overview.save();
  dailySnapshot.save();
}
