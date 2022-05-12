import { Address, BigInt, BigDecimal } from "@graphprotocol/graph-ts";
import { ONE_BI, ZERO_BD, ZERO_BI } from "../../../../helpers/constants";
import {
  CollectionDailyData,
  ExchangeDailyData,
  ExecutionStrategy,
  ExecutionStrategyDailyData,
  UserDailyData,
} from "../../generated/schema";

export function updateCollectionDailyData(
  collection: Address,
  strategy: Address,
  volume: BigDecimal,
  timestamp: BigInt,
  isTakerAsk: boolean
): void {
  const dailyTimestampBigInt = BigInt.fromI32(86400);
  const dayID = timestamp.div(dailyTimestampBigInt);
  const dayStartTimestamp = dayID.times(dailyTimestampBigInt);
  const ID = dayID.toString() + "-" + collection.toHex();

  let collectionDailyData = CollectionDailyData.load(ID);
  if (collectionDailyData === null) {
    collectionDailyData = new CollectionDailyData(ID);
    collectionDailyData.date = dayStartTimestamp;
    collectionDailyData.collection = collection.toHex();
    collectionDailyData.dailyTransactions = ZERO_BI;
    collectionDailyData.dailyTakerBidTransactions = ZERO_BI;
    collectionDailyData.dailyTakerAskTransactions = ZERO_BI;
    collectionDailyData.dailyVolume = ZERO_BD;
    collectionDailyData.dailyTakerBidVolume = ZERO_BD;
    collectionDailyData.dailyTakerAskVolume = ZERO_BD;
    collectionDailyData.dailyVolumeExcludingZeroFee = ZERO_BD;
    collectionDailyData.dailyRoyalty = ZERO_BD;

    // Increment number of unique daily collections if it didn't exist
    const exchangeDailyData = ExchangeDailyData.load(dayID.toString());
    if (exchangeDailyData !== null) {
      exchangeDailyData.dailyCollections = exchangeDailyData.dailyCollections.plus(ONE_BI);
      exchangeDailyData.save();
    }
  }
  collectionDailyData.dailyVolume = collectionDailyData.dailyVolume.plus(volume);
  collectionDailyData.dailyTransactions = collectionDailyData.dailyTransactions.plus(ONE_BI);

  if (isTakerAsk === true) {
    collectionDailyData.dailyTakerAskTransactions = collectionDailyData.dailyTakerAskTransactions.plus(ONE_BI);
    collectionDailyData.dailyTakerAskVolume = collectionDailyData.dailyTakerAskVolume.plus(volume);
  } else {
    collectionDailyData.dailyTakerBidTransactions = collectionDailyData.dailyTakerBidTransactions.plus(ONE_BI);
    collectionDailyData.dailyTakerBidVolume = collectionDailyData.dailyTakerBidVolume.plus(volume);
  }

  const executionStrategy = ExecutionStrategy.load(strategy.toHex());
  if (executionStrategy !== null) {
    if (executionStrategy.protocolFee !== ZERO_BI) {
      collectionDailyData.dailyVolumeExcludingZeroFee = collectionDailyData.dailyVolumeExcludingZeroFee.plus(volume);
    }
  }

  collectionDailyData.save();
}

export function updateRoyaltyForCollectionDailyData(collection: Address, royalty: BigDecimal, timestamp: BigInt): void {
  const dailyTimestampBigInt = BigInt.fromI32(86400);
  const dayID = timestamp.div(dailyTimestampBigInt);
  const dayStartTimestamp = dayID.times(dailyTimestampBigInt);
  const ID = dayID.toString() + "-" + collection.toHex();

  let collectionDailyData = CollectionDailyData.load(ID);
  if (collectionDailyData === null) {
    collectionDailyData = new CollectionDailyData(ID);
    collectionDailyData.date = dayStartTimestamp;
    collectionDailyData.collection = collection.toHex();
    collectionDailyData.dailyTransactions = ZERO_BI;
    collectionDailyData.dailyTakerBidTransactions = ZERO_BI;
    collectionDailyData.dailyTakerAskTransactions = ZERO_BI;
    collectionDailyData.dailyVolume = ZERO_BD;
    collectionDailyData.dailyTakerBidVolume = ZERO_BD;
    collectionDailyData.dailyTakerAskVolume = ZERO_BD;
    collectionDailyData.dailyVolumeExcludingZeroFee = ZERO_BD;
    collectionDailyData.dailyRoyalty = ZERO_BD;
  }

  collectionDailyData.dailyRoyalty = collectionDailyData.dailyRoyalty.plus(royalty);
  collectionDailyData.save();
}

export function updateExchangeDailyData(
  strategy: Address,
  volume: BigDecimal,
  timestamp: BigInt,
  isTakerAsk: boolean
): void {
  const dailyTimestampBigInt = BigInt.fromI32(86400);
  const dayID = timestamp.div(dailyTimestampBigInt);
  const dayStartTimestamp = dayID.times(dailyTimestampBigInt);
  const ID = dayID.toString();

  let exchangeDailyData = ExchangeDailyData.load(ID);
  if (exchangeDailyData === null) {
    exchangeDailyData = new ExchangeDailyData(ID);
    exchangeDailyData.date = dayStartTimestamp;
    exchangeDailyData.dailyUsers = ZERO_BI;
    exchangeDailyData.dailyCollections = ZERO_BI;
    exchangeDailyData.dailyTransactions = ZERO_BI;
    exchangeDailyData.dailyTakerBidTransactions = ZERO_BI;
    exchangeDailyData.dailyTakerAskTransactions = ZERO_BI;
    exchangeDailyData.dailyVolume = ZERO_BD;
    exchangeDailyData.dailyTakerBidVolume = ZERO_BD;
    exchangeDailyData.dailyTakerAskVolume = ZERO_BD;
    exchangeDailyData.dailyVolumeExcludingZeroFee = ZERO_BD;
  }
  exchangeDailyData.dailyTransactions = exchangeDailyData.dailyTransactions.plus(ONE_BI);
  exchangeDailyData.dailyVolume = exchangeDailyData.dailyVolume.plus(volume);

  if (isTakerAsk === true) {
    exchangeDailyData.dailyTakerAskTransactions = exchangeDailyData.dailyTakerAskTransactions.plus(ONE_BI);
    exchangeDailyData.dailyTakerAskVolume = exchangeDailyData.dailyTakerAskVolume.plus(volume);
  } else {
    exchangeDailyData.dailyTakerBidTransactions = exchangeDailyData.dailyTakerBidTransactions.plus(ONE_BI);
    exchangeDailyData.dailyTakerBidVolume = exchangeDailyData.dailyTakerBidVolume.plus(volume);
  }

  const executionStrategy = ExecutionStrategy.load(strategy.toHex());
  if (executionStrategy !== null) {
    if (executionStrategy.protocolFee !== ZERO_BI) {
      exchangeDailyData.dailyVolumeExcludingZeroFee = exchangeDailyData.dailyVolumeExcludingZeroFee.plus(volume);
    }
  }

  exchangeDailyData.save();
}

export function updateExecutionStrategyDailyData(
  strategy: Address,
  volume: BigDecimal,
  timestamp: BigInt,
  isTakerAsk: boolean
): void {
  const dailyTimestampBigInt = BigInt.fromI32(86400);
  const dayID = timestamp.div(dailyTimestampBigInt);
  const dayStartTimestamp = dayID.times(dailyTimestampBigInt);
  const ID = dayID.toString() + "-" + strategy.toHex();

  let strategyDailyData = ExecutionStrategyDailyData.load(ID);
  if (strategyDailyData === null) {
    strategyDailyData = new ExecutionStrategyDailyData(ID);
    strategyDailyData.date = dayStartTimestamp;
    strategyDailyData.strategy = strategy.toHex();
    strategyDailyData.dailyTransactions = ZERO_BI;
    strategyDailyData.dailyTakerBidTransactions = ZERO_BI;
    strategyDailyData.dailyTakerAskTransactions = ZERO_BI;
    strategyDailyData.dailyVolume = ZERO_BD;
    strategyDailyData.dailyTakerBidVolume = ZERO_BD;
    strategyDailyData.dailyTakerAskVolume = ZERO_BD;
  }
  strategyDailyData.dailyTransactions = strategyDailyData.dailyTransactions.plus(ONE_BI);
  strategyDailyData.dailyVolume = strategyDailyData.dailyVolume.plus(volume);

  if (isTakerAsk === true) {
    strategyDailyData.dailyTakerAskTransactions = strategyDailyData.dailyTakerAskTransactions.plus(ONE_BI);
    strategyDailyData.dailyTakerAskVolume = strategyDailyData.dailyTakerAskVolume.plus(volume);
  } else {
    strategyDailyData.dailyTakerBidTransactions = strategyDailyData.dailyTakerBidTransactions.plus(ONE_BI);
    strategyDailyData.dailyTakerBidVolume = strategyDailyData.dailyTakerBidVolume.plus(volume);
  }

  strategyDailyData.save();
}

export function updateUserDailyData(user: Address, strategy: Address, volume: BigDecimal, timestamp: BigInt): void {
  const dailyTimestampBigInt = BigInt.fromI32(86400);
  const dayID = timestamp.div(dailyTimestampBigInt);
  const dayStartTimestamp = dayID.times(dailyTimestampBigInt);
  const ID = dayID.toString() + "-" + user.toHex();

  let userDailyData = UserDailyData.load(ID);

  if (userDailyData === null) {
    userDailyData = new UserDailyData(ID);
    userDailyData.date = dayStartTimestamp;
    userDailyData.user = user.toHex();
    userDailyData.dailyTransactions = ZERO_BI;
    userDailyData.dailyVolume = ZERO_BD;
    userDailyData.dailyVolumeExcludingZeroFee = ZERO_BD;

    // Increment number of unique daily users if it didn't exist
    const exchangeDailyData = ExchangeDailyData.load(dayID.toString());
    if (exchangeDailyData !== null) {
      exchangeDailyData.dailyUsers = exchangeDailyData.dailyUsers.plus(ONE_BI);
      exchangeDailyData.save();
    }
  }

  userDailyData.dailyTransactions = userDailyData.dailyTransactions.plus(ONE_BI);
  userDailyData.dailyVolume = userDailyData.dailyVolume.plus(volume);

  const executionStrategy = ExecutionStrategy.load(strategy.toHex());
  if (executionStrategy !== null) {
    if (executionStrategy.protocolFee !== ZERO_BI) {
      userDailyData.dailyVolumeExcludingZeroFee = userDailyData.dailyVolumeExcludingZeroFee.plus(volume);
    }
  }

  userDailyData.save();
}
