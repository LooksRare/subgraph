/* eslint-disable prefer-const */
import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { Collection, ExecutionStrategy, Trade, User } from "../generated/schema";
import { RoyaltyPayment, TakerAsk, TakerBid } from "../generated/LooksRareExchange/LooksRareExchange";
import { toBigDecimal } from "./utils";
import { fetchProtocolFee } from "./utils/fetchProtocolFee";
import {
  updateCollectionDailyData,
  updateExchangeDailyData,
  updateExecutionStrategyDailyData,
  updateUserDailyData,
} from "./utils/updateDailyData";

// BigNumber-like references
let ZERO_BI = BigInt.fromI32(0);
let ONE_BI = BigInt.fromI32(1);
let ZERO_BD = BigDecimal.fromString("0");

// Other
let PRIVATE_SALE_ADDRESS = "0x0000000000000000000000000000000000000000";

export function handleTakerAsk(event: TakerAsk): void {
  // 1. Collection
  let collection = Collection.load(event.params.collection.toHex());
  if (collection === null) {
    collection = new Collection(event.params.collection.toHex());
    collection.totalTransactions = ZERO_BI;
    collection.totalVolume = ZERO_BD;
    collection.totalRoyaltyPaid = ZERO_BD;
  }
  collection.totalTransactions = collection.totalTransactions.plus(ONE_BI);
  collection.totalVolume = collection.totalVolume.plus(toBigDecimal(event.params.price));
  collection.save();

  // 2. Execution strategy
  let executionStrategy = ExecutionStrategy.load(event.params.strategy.toHex());

  if (executionStrategy == null) {
    executionStrategy = new ExecutionStrategy(event.params.strategy.toHex());
    executionStrategy.protocolFee = fetchProtocolFee(event.params.strategy);
    executionStrategy.totalTransactions = ZERO_BI;
    executionStrategy.totalVolume = ZERO_BD;
  }

  executionStrategy.totalTransactions = executionStrategy.totalTransactions.plus(ONE_BI);
  executionStrategy.totalVolume = executionStrategy.totalVolume.plus(toBigDecimal(event.params.price));

  executionStrategy.save();

  // 3. Maker bid user
  let makerBidUser = User.load(event.params.maker.toHex());

  if (makerBidUser == null) {
    makerBidUser = new User(event.params.maker.toHex());
    makerBidUser.totalRoyaltyCollected = ZERO_BD;
    makerBidUser.totalTransactions = ZERO_BI;
    makerBidUser.totalBidVolume = ZERO_BD;
    makerBidUser.totalAskVolume = ZERO_BD;
    makerBidUser.totalVolume = ZERO_BD;
  }
  makerBidUser.totalTransactions = makerBidUser.totalTransactions.plus(ONE_BI);
  makerBidUser.totalBidVolume = makerBidUser.totalBidVolume.plus(toBigDecimal(event.params.price));
  makerBidUser.totalVolume = makerBidUser.totalVolume.plus(toBigDecimal(event.params.price));
  makerBidUser.save();

  // 4. Taker ask user
  let takerAskUser = User.load(event.params.taker.toHex());

  if (takerAskUser == null) {
    takerAskUser = new User(event.params.taker.toHex());
    takerAskUser.totalRoyaltyCollected = ZERO_BD;
    takerAskUser.totalTransactions = ZERO_BI;
    takerAskUser.totalBidVolume = ZERO_BD;
    takerAskUser.totalAskVolume = ZERO_BD;
    takerAskUser.totalVolume = ZERO_BD;
  }
  takerAskUser.totalTransactions = takerAskUser.totalTransactions.plus(ONE_BI);
  takerAskUser.totalAskVolume = takerAskUser.totalAskVolume.plus(toBigDecimal(event.params.price));
  takerAskUser.totalVolume = takerAskUser.totalVolume.plus(toBigDecimal(event.params.price));
  takerAskUser.save();

  // 5. Trade
  let trade = new Trade(event.params.orderHash.toHex());

  trade.isTakerAsk = true;
  trade.collection = event.params.collection.toHex();
  trade.strategy = event.params.strategy.toHex();
  trade.tokenId = event.params.tokenId;
  trade.price = toBigDecimal(event.params.price);
  trade.maker = event.params.maker.toHex();
  trade.taker = event.params.taker.toHex();
  trade.save();

  // 6. Update the daily data
  updateCollectionDailyData(event.params.collection, toBigDecimal(event.params.price), event.block.timestamp);
  updateExchangeDailyData(toBigDecimal(event.params.price), event.block.timestamp);
  updateExecutionStrategyDailyData(event.params.strategy, toBigDecimal(event.params.price), event.block.timestamp);
  updateUserDailyData(event.params.maker, toBigDecimal(event.params.price), event.block.timestamp);
  updateUserDailyData(event.params.taker, toBigDecimal(event.params.price), event.block.timestamp);
}

export function handleTakerBid(event: TakerBid): void {
  // 1. Collection
  let collection = Collection.load(event.params.collection.toHex());
  if (collection === null) {
    collection = new Collection(event.params.collection.toHex());
    collection.totalTransactions = ZERO_BI;
    collection.totalVolume = ZERO_BD;
    collection.totalRoyaltyPaid = ZERO_BD;
  }
  collection.totalTransactions = collection.totalTransactions.plus(ONE_BI);
  collection.totalVolume = collection.totalVolume.plus(toBigDecimal(event.params.price));
  collection.save();

  // 2. Execution strategy
  let executionStrategy = ExecutionStrategy.load(event.params.strategy.toHex());

  if (executionStrategy == null) {
    executionStrategy = new ExecutionStrategy(event.params.strategy.toHex());
    executionStrategy.protocolFee = fetchProtocolFee(event.params.strategy);
    executionStrategy.totalTransactions = ZERO_BI;
    executionStrategy.totalVolume = ZERO_BD;
  }

  executionStrategy.totalTransactions = executionStrategy.totalTransactions.plus(ONE_BI);
  executionStrategy.totalVolume = executionStrategy.totalVolume.plus(toBigDecimal(event.params.price));

  executionStrategy.save();

  // 3. Maker ask user
  let makerAskUser = User.load(event.params.maker.toHex());

  if (makerAskUser == null) {
    makerAskUser = new User(event.params.maker.toHex());
    makerAskUser.totalRoyaltyCollected = ZERO_BD;
    makerAskUser.totalTransactions = ZERO_BI;
    makerAskUser.totalBidVolume = ZERO_BD;
    makerAskUser.totalAskVolume = ZERO_BD;
    makerAskUser.totalVolume = ZERO_BD;
  }
  makerAskUser.totalTransactions = makerAskUser.totalTransactions.plus(ONE_BI);
  makerAskUser.totalBidVolume = makerAskUser.totalAskVolume.plus(toBigDecimal(event.params.price));
  makerAskUser.totalVolume = makerAskUser.totalVolume.plus(toBigDecimal(event.params.price));
  makerAskUser.save();

  // 4. Taker bid user
  let takerBidUser = User.load(event.params.taker.toHex());

  if (takerBidUser == null) {
    takerBidUser = new User(event.params.taker.toHex());
    takerBidUser.totalRoyaltyCollected = ZERO_BD;
    takerBidUser.totalTransactions = ZERO_BI;
    takerBidUser.totalBidVolume = ZERO_BD;
    takerBidUser.totalAskVolume = ZERO_BD;
    takerBidUser.totalVolume = ZERO_BD;
  }
  takerBidUser.totalTransactions = takerBidUser.totalTransactions.plus(ONE_BI);
  takerBidUser.totalBidVolume = takerBidUser.totalBidVolume.plus(toBigDecimal(event.params.price));
  takerBidUser.totalVolume = takerBidUser.totalVolume.plus(toBigDecimal(event.params.price));
  takerBidUser.save();

  // 5. Trade
  let trade = new Trade(event.params.orderHash.toHex());

  trade.isTakerAsk = false;
  trade.collection = event.params.collection.toHex();
  trade.strategy = event.params.strategy.toHex();
  trade.tokenId = event.params.tokenId;
  trade.price = toBigDecimal(event.params.price);
  trade.maker = event.params.maker.toHex();
  trade.taker = event.params.taker.toHex();
  trade.save();

  // 6. Update the daily data
  updateCollectionDailyData(event.params.collection, toBigDecimal(event.params.price), event.block.timestamp);
  updateExchangeDailyData(toBigDecimal(event.params.price), event.block.timestamp);
  updateExecutionStrategyDailyData(event.params.strategy, toBigDecimal(event.params.price), event.block.timestamp);
  updateUserDailyData(event.params.maker, toBigDecimal(event.params.price), event.block.timestamp);
  updateUserDailyData(event.params.taker, toBigDecimal(event.params.price), event.block.timestamp);
}
