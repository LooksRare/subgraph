/* eslint-disable prefer-const */
import { Address, BigInt, BigDecimal } from "@graphprotocol/graph-ts";
import {
  CollectionDailyData,
  ExchangeDailyData,
  ExecutionStrategy,
  ExecutionStrategyDailyData,
  UserDailyData,
} from "../../generated/schema";

// BigNumber helpers
let ZERO_BI = BigInt.zero();
let ONE_BI = BigInt.fromI32(1);
let ZERO_BD = BigDecimal.zero();

export function updateCollectionDailyData(
  collection: Address,
  volume: BigDecimal,
  strategy: Address,
  timestamp: BigInt
): void {
  let dailyTimestampBigInt = BigInt.fromI32(86400);
  let dayID = timestamp.div(dailyTimestampBigInt);
  let dayStartTimestamp = dayID.times(dailyTimestampBigInt);
  let ID = dayID.toString() + "-" + collection.toHex();

  let collectionDailyData = CollectionDailyData.load(ID);
  if (collectionDailyData === null) {
    collectionDailyData = new CollectionDailyData(ID);
    collectionDailyData.date = dayStartTimestamp;
    collectionDailyData.collection = collection.toHex();
    collectionDailyData.dailyVolume = ZERO_BD;
    collectionDailyData.dailyTransactions = ZERO_BI;
    collectionDailyData.dailyVolumeExcludingZeroFee = ZERO_BD;
  }
  collectionDailyData.dailyVolume = collectionDailyData.dailyVolume.plus(volume);
  collectionDailyData.dailyTransactions = collectionDailyData.dailyTransactions.plus(ONE_BI);

  let executionStrategy = ExecutionStrategy.load(strategy.toHex());
  if (executionStrategy !== null) {
    if (executionStrategy.protocolFee !== ZERO_BI) {
      collectionDailyData.dailyVolumeExcludingZeroFee = collectionDailyData.dailyVolumeExcludingZeroFee.plus(volume);
    }
  }

  collectionDailyData.save();
}

export function updateExchangeDailyData(volume: BigDecimal, strategy: Address, timestamp: BigInt): void {
  let dailyTimestampBigInt = BigInt.fromI32(86400);
  let dayID = timestamp.div(dailyTimestampBigInt);
  let dayStartTimestamp = dayID.times(dailyTimestampBigInt);
  let ID = dayID.toString();

  let exchangeDailyData = ExchangeDailyData.load(ID);
  if (exchangeDailyData === null) {
    exchangeDailyData = new ExchangeDailyData(ID);
    exchangeDailyData.date = dayStartTimestamp;
    exchangeDailyData.dailyTransactions = ZERO_BI;
    exchangeDailyData.dailyVolume = ZERO_BD;
    exchangeDailyData.dailyVolumeExcludingZeroFee = ZERO_BD;
  }
  exchangeDailyData.dailyTransactions = exchangeDailyData.dailyTransactions.plus(ONE_BI);
  exchangeDailyData.dailyVolume = exchangeDailyData.dailyVolume.plus(volume);

  let executionStrategy = ExecutionStrategy.load(strategy.toHex());
  if (executionStrategy !== null) {
    if (executionStrategy.protocolFee !== ZERO_BI) {
      exchangeDailyData.dailyVolumeExcludingZeroFee = exchangeDailyData.dailyVolumeExcludingZeroFee.plus(volume);
    }
  }

  exchangeDailyData.save();
}

export function updateExecutionStrategyDailyData(strategy: Address, volume: BigDecimal, timestamp: BigInt): void {
  let dailyTimestampBigInt = BigInt.fromI32(86400);
  let dayID = timestamp.div(dailyTimestampBigInt);
  let dayStartTimestamp = dayID.times(dailyTimestampBigInt);
  let ID = dayID.toString() + "-" + strategy.toHex();

  let strategyDailyData = ExecutionStrategyDailyData.load(ID);
  if (strategyDailyData === null) {
    strategyDailyData = new ExecutionStrategyDailyData(ID);
    strategyDailyData.date = dayStartTimestamp;
    strategyDailyData.dailyTransactions = ZERO_BI;
    strategyDailyData.dailyVolume = ZERO_BD;
  }
  strategyDailyData.dailyTransactions = strategyDailyData.dailyTransactions.plus(ONE_BI);
  strategyDailyData.dailyVolume = strategyDailyData.dailyVolume.plus(volume);
  strategyDailyData.save();
}

export function updateUserDailyData(user: Address, volume: BigDecimal, strategy: Address, timestamp: BigInt): void {
  let dailyTimestampBigInt = BigInt.fromI32(86400);
  let dayID = timestamp.div(dailyTimestampBigInt);
  let dayStartTimestamp = dayID.times(dailyTimestampBigInt);
  let ID = dayID.toString() + "-" + user.toHex();

  let userDailyData = UserDailyData.load(ID);
  if (userDailyData === null) {
    userDailyData = new UserDailyData(ID);
    userDailyData.date = dayStartTimestamp;
    userDailyData.dailyTransactions = ZERO_BI;
    userDailyData.dailyVolume = ZERO_BD;
    userDailyData.dailyVolumeExcludingZeroFee = ZERO_BD;
  }
  userDailyData.dailyTransactions = userDailyData.dailyTransactions.plus(ONE_BI);
  userDailyData.dailyVolume = userDailyData.dailyVolume.plus(volume);

  let executionStrategy = ExecutionStrategy.load(strategy.toHex());
  if (executionStrategy !== null) {
    if (executionStrategy.protocolFee !== ZERO_BI) {
      userDailyData.dailyVolumeExcludingZeroFee = userDailyData.dailyVolumeExcludingZeroFee.plus(volume);
    }
  }

  userDailyData.save();
}
