/* eslint-disable prefer-const */
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { Collection, ExecutionStrategy, RoyaltyTransfer, Trade, User } from "../generated/schema";
import { RoyaltyPayment, TakerAsk, TakerBid } from "../generated/LooksRareExchange/LooksRareExchange";
import { toBigDecimal } from "./utils";
import { fetchProtocolFee } from "./utils/fetchProtocolFee";
import {
  updateCollectionDailyData,
  updateExchangeDailyData,
  updateExecutionStrategyDailyData,
  updateUserDailyData,
} from "./utils/updateDailyData";

// BigNumber helpers
let ZERO_BI = BigInt.zero();
let ONE_BI = BigInt.fromI32(1);
let ZERO_BD = BigDecimal.zero();

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
  let strategy = ExecutionStrategy.load(event.params.strategy.toHex());
  if (strategy == null) {
    strategy = new ExecutionStrategy(event.params.strategy.toHex());
    strategy.protocolFee = fetchProtocolFee(event.params.strategy);
    strategy.totalTransactions = ZERO_BI;
    strategy.totalVolume = ZERO_BD;
  }
  strategy.totalTransactions = strategy.totalTransactions.plus(ONE_BI);
  strategy.totalVolume = strategy.totalVolume.plus(toBigDecimal(event.params.price));
  strategy.save();

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
  let name = event.params.orderHash.toHex() + "-" + event.transaction.hash.toHex();
  let trade = new Trade(name);
  trade.isTakerAsk = true;
  trade.collection = collection.id;
  trade.strategy = strategy.id;
  trade.tokenId = event.params.tokenId;
  trade.price = toBigDecimal(event.params.price);
  trade.maker = event.params.maker.toHex();
  trade.taker = event.params.taker.toHex();
  trade.save();

  // 6. Update daily data entities
  updateCollectionDailyData(
    event.params.collection,
    toBigDecimal(event.params.price),
    event.params.strategy,
    event.block.timestamp
  );
  updateExchangeDailyData(toBigDecimal(event.params.price), event.params.strategy, event.block.timestamp);
  updateExecutionStrategyDailyData(event.params.strategy, toBigDecimal(event.params.price), event.block.timestamp);
  updateUserDailyData(
    event.params.maker,
    toBigDecimal(event.params.price),
    event.params.strategy,
    event.block.timestamp
  );
  updateUserDailyData(
    event.params.taker,
    toBigDecimal(event.params.price),
    event.params.strategy,
    event.block.timestamp
  );
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
  let strategy = ExecutionStrategy.load(event.params.strategy.toHex());
  if (strategy == null) {
    strategy = new ExecutionStrategy(event.params.strategy.toHex());
    strategy.protocolFee = fetchProtocolFee(event.params.strategy);
    strategy.totalTransactions = ZERO_BI;
    strategy.totalVolume = ZERO_BD;
  }
  strategy.totalTransactions = strategy.totalTransactions.plus(ONE_BI);
  strategy.totalVolume = strategy.totalVolume.plus(toBigDecimal(event.params.price));
  strategy.save();

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
  let name = event.params.orderHash.toHex() + "-" + event.transaction.hash.toHex();
  let trade = new Trade(name);
  trade.isTakerAsk = false;
  trade.collection = collection.id;
  trade.strategy = strategy.id;
  trade.tokenId = event.params.tokenId;
  trade.price = toBigDecimal(event.params.price);
  trade.maker = event.params.maker.toHex();
  trade.taker = event.params.taker.toHex();
  trade.save();

  // 6. Update daily data entities
  updateCollectionDailyData(
    event.params.collection,
    toBigDecimal(event.params.price),
    event.params.strategy,
    event.block.timestamp
  );
  updateExchangeDailyData(toBigDecimal(event.params.price), event.params.strategy, event.block.timestamp);
  updateExecutionStrategyDailyData(event.params.strategy, toBigDecimal(event.params.price), event.block.timestamp);
  updateUserDailyData(
    event.params.maker,
    toBigDecimal(event.params.price),
    event.params.strategy,
    event.block.timestamp
  );
  updateUserDailyData(
    event.params.taker,
    toBigDecimal(event.params.price),
    event.params.strategy,
    event.block.timestamp
  );
}

export function handleRoyaltyPayment(event: RoyaltyPayment): void {
  // 1. Collection
  let collection = Collection.load(event.params.collection.toHex());
  if (collection === null) {
    collection = new Collection(event.params.collection.toHex());
    collection.totalTransactions = ZERO_BI;
    collection.totalVolume = ZERO_BD;
    collection.totalRoyaltyPaid = ZERO_BD;
  }
  collection.totalRoyaltyPaid = collection.totalRoyaltyPaid.plus(toBigDecimal(event.params.amount));
  collection.save();

  // 2. User
  let user = User.load(event.params.royaltyRecipient.toHex());
  if (user === null) {
    user = new User(event.params.royaltyRecipient.toHex());
    user.totalRoyaltyCollected = ZERO_BD;
    user.totalTransactions = ZERO_BI;
    user.totalBidVolume = ZERO_BD;
    user.totalAskVolume = ZERO_BD;
    user.totalVolume = ZERO_BD;
    user.totalTransactions = ZERO_BI;
  }
  user.totalRoyaltyCollected = user.totalRoyaltyCollected.plus(toBigDecimal(event.params.amount));
  user.save();

  // 3. RoyaltyTransfer
  let name =
    event.params.collection.toHex() + "-" + event.params.tokenId.toHex() + "-" + event.transaction.hash.toHex();
  let royaltyTransfer = new RoyaltyTransfer(name);
  royaltyTransfer.collection = collection.id;
  royaltyTransfer.tokenId = event.params.tokenId;
  royaltyTransfer.user = event.params.royaltyRecipient.toHex();
  royaltyTransfer.amount = toBigDecimal(event.params.amount);
  royaltyTransfer.save();
}
