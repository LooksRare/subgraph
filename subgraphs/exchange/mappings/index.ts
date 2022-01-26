/* eslint-disable prefer-const */
import { Collection, ExecutionStrategy, RoyaltyTransfer, Transaction, User } from "../generated/schema";
import { RoyaltyPayment, TakerAsk, TakerBid } from "../generated/LooksRareExchange/LooksRareExchange";
import { toBigDecimal, ZERO_BD, ZERO_BI, ONE_BI } from "./utils";
import { fetchProtocolFee } from "./utils/fetchProtocolFee";
import {
  updateCollectionDailyData,
  updateExchangeDailyData,
  updateExecutionStrategyDailyData,
  updateUserDailyData,
} from "./utils/updateDailyData";

// Initialize a new user entity
function initializeUser(userID: string): User {
  const user = new User(userID);
  user.totalTransactions = ZERO_BI;
  user.totalAskVolume = ZERO_BD;
  user.totalBidVolume = ZERO_BD;
  user.totalMakerVolume = ZERO_BD;
  user.totalTakerVolume = ZERO_BD;
  user.totalVolume = ZERO_BD;
  user.totalRoyaltyCollected = ZERO_BD;
  return user;
}

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
    makerBidUser = initializeUser(event.params.maker.toHex());
  }
  makerBidUser.totalTransactions = makerBidUser.totalTransactions.plus(ONE_BI);
  makerBidUser.totalBidVolume = makerBidUser.totalBidVolume.plus(toBigDecimal(event.params.price));
  makerBidUser.totalMakerVolume = makerBidUser.totalMakerVolume.plus(toBigDecimal(event.params.price));
  makerBidUser.totalVolume = makerBidUser.totalVolume.plus(toBigDecimal(event.params.price));
  makerBidUser.save();

  // 4. Taker ask user
  let takerAskUser = User.load(event.params.taker.toHex());
  if (takerAskUser == null) {
    takerAskUser = initializeUser(event.params.taker.toHex());
  }
  takerAskUser.totalTransactions = takerAskUser.totalTransactions.plus(ONE_BI);
  takerAskUser.totalAskVolume = takerAskUser.totalAskVolume.plus(toBigDecimal(event.params.price));
  takerAskUser.totalTakerVolume = takerAskUser.totalTakerVolume.plus(toBigDecimal(event.params.price));
  takerAskUser.totalVolume = takerAskUser.totalVolume.plus(toBigDecimal(event.params.price));
  takerAskUser.save();

  // 5. Transaction
  let name = event.params.orderHash.toHex() + "-" + event.transaction.hash.toHex();
  let transaction = new Transaction(name);
  transaction.date = event.block.timestamp;
  transaction.block = event.block.number;
  transaction.collection = collection.id;
  transaction.isTakerAsk = false;
  transaction.strategy = strategy.id;
  transaction.tokenId = event.params.tokenId;
  transaction.price = toBigDecimal(event.params.price);
  transaction.maker = makerBidUser.id;
  transaction.taker = takerAskUser.id;
  transaction.save();

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
    makerAskUser = initializeUser(event.params.maker.toHex());
  }
  makerAskUser.totalTransactions = makerAskUser.totalTransactions.plus(ONE_BI);
  makerAskUser.totalBidVolume = makerAskUser.totalAskVolume.plus(toBigDecimal(event.params.price));
  makerAskUser.totalMakerVolume = makerAskUser.totalMakerVolume.plus(toBigDecimal(event.params.price));
  makerAskUser.totalVolume = makerAskUser.totalVolume.plus(toBigDecimal(event.params.price));
  makerAskUser.save();

  // 4. Taker bid user
  let takerBidUser = User.load(event.params.taker.toHex());
  if (takerBidUser == null) {
    takerBidUser = initializeUser(event.params.taker.toHex());
  }
  takerBidUser.totalTransactions = takerBidUser.totalTransactions.plus(ONE_BI);
  takerBidUser.totalBidVolume = takerBidUser.totalBidVolume.plus(toBigDecimal(event.params.price));
  takerBidUser.totalTakerVolume = takerBidUser.totalTakerVolume.plus(toBigDecimal(event.params.price));
  takerBidUser.totalVolume = takerBidUser.totalVolume.plus(toBigDecimal(event.params.price));
  takerBidUser.save();

  // 5. Transaction
  let name = event.params.orderHash.toHex() + "-" + event.transaction.hash.toHex();
  let transaction = new Transaction(name);
  transaction.date = event.block.timestamp;
  transaction.block = event.block.number;
  transaction.collection = collection.id;
  transaction.isTakerAsk = false;
  transaction.strategy = strategy.id;
  transaction.tokenId = event.params.tokenId;
  transaction.price = toBigDecimal(event.params.price);
  transaction.maker = makerAskUser.id;
  transaction.taker = takerBidUser.id;
  transaction.save();

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
    user = initializeUser(event.params.royaltyRecipient.toHex());
  }
  user.totalRoyaltyCollected = user.totalRoyaltyCollected.plus(toBigDecimal(event.params.amount));
  user.save();

  // 3. RoyaltyTransfer
  let name =
    event.params.collection.toHex() + "-" + event.params.tokenId.toHex() + "-" + event.transaction.hash.toHex();
  let royaltyTransfer = new RoyaltyTransfer(name);
  royaltyTransfer.date = event.block.timestamp;
  royaltyTransfer.block = event.block.number;
  royaltyTransfer.collection = collection.id;
  royaltyTransfer.tokenId = event.params.tokenId;
  royaltyTransfer.user = user.id;
  royaltyTransfer.amount = toBigDecimal(event.params.amount);
  royaltyTransfer.save();
}
