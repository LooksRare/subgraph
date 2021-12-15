/* eslint-disable prefer-const */
import { Address, BigInt, BigDecimal, ethereum } from "@graphprotocol/graph-ts";
import {
  CollectionDailyData,
  ExchangeDailyData,
  ExecutionStrategyDailyData,
  UserDailyData,
} from "../../generated/schema";

// BigNumber-like references
let ZERO_BI = BigInt.fromI32(0);
let ONE_BI = BigInt.fromI32(1);
let ZERO_BD = BigDecimal.fromString("0");

export function updateCollectionDailyData(collection: Address, volume: BigDecimal, timestamp: BigInt): void {
  let adjustedTimestamp = timestamp.toI32();
  let dayID = adjustedTimestamp / 86400;
  let dayStartTimestamp = dayID * 86400;
  let ID = dayID.toString() + "-" + collection.toHex();

  let collectionDayData = CollectionDailyData.load(ID);
  if (collectionDayData === null) {
    collectionDayData = new CollectionDailyData(ID);
    collectionDayData.date = dayStartTimestamp;
    collectionDayData.collection = collection.toHex();
    collectionDayData.dailyVolume = ZERO_BD;
    collectionDayData.dailyTransactions = ZERO_BI;
  }
  collectionDayData.dailyVolume = collectionDayData.dailyVolume.plus(volume);
  collectionDayData.dailyTransactions = collectionDayData.dailyTransactions.plus(ONE_BI);
  collectionDayData.save();
}

export function updateExchangeDailyData(volume: BigDecimal, timestamp: BigInt): void {
  let adjustedTimestamp = timestamp.toI32();
  let dayID = adjustedTimestamp / 86400;
  let dayStartTimestamp = dayID * 86400;
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
  exchangeDailyData.dailyVolumeExcludingZeroFee = exchangeDailyData.dailyVolumeExcludingZeroFee.plus(volume);
  exchangeDailyData.save();
}

export function updateExecutionStrategyDailyData(strategy: Address, volume: BigDecimal, timestamp: BigInt): void {
  let adjustedTimestamp = timestamp.toI32();
  let dayID = adjustedTimestamp / 86400;
  let dayStartTimestamp = dayID * 86400;
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

export function updateUserDailyData(user: Address, volume: BigDecimal, timestamp: BigInt): void {
  let adjustedTimestamp = timestamp.toI32();
  let dayID = adjustedTimestamp / 86400;
  let dayStartTimestamp = dayID * 86400;
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
  userDailyData.dailyVolumeExcludingZeroFee = userDailyData.dailyVolumeExcludingZeroFee.plus(volume);
  userDailyData.save();
}
