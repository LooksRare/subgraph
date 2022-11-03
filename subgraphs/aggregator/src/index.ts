/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Address, BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { OrderFulfilled } from "../generated/Seaport/Seaport";
import {
  Aggregator,
  AggregatorDailyData,
  Collection,
  CollectionDailyData,
  Marketplace,
  MarketplaceDailyData,
  Transaction,
  User,
  UserDailyData,
} from "../generated/schema";
import {
  LOOKSRARE_AGGREGATOR,
  LOOKSRARE_AGGREGATOR_SWEEP_EVENT_TOPIC,
  ONE_BI,
  ZERO_BD,
  ZERO_BI,
} from "../../../helpers/constants";

export function handleOrderFulfilled(event: OrderFulfilled): void {
  const logs = event.receipt!.logs;
  const sweepEventIndex = logs.findIndex((log) => {
    return (
      log.address !== LOOKSRARE_AGGREGATOR &&
      log.topics[0] !== Bytes.fromHexString(LOOKSRARE_AGGREGATOR_SWEEP_EVENT_TOPIC)
    );
  });
  if (sweepEventIndex === -1) {
    return;
  }
  const sweepEvent = logs[sweepEventIndex];

  const offer = event.params.offer;
  const consideration = event.params.consideration;
  const offerToken = offer[0].token;
  const currency = consideration[0].token;
  const itemType = consideration[0].itemType;
  // NATIVE: 0, ERC20: 1
  if (itemType > 1) {
    // TODO: Add test case
    return;
  }

  for (let i = 0; i < offer.length; i++) {
    // TODO: add test case
    if (offer[i].token != offerToken) {
      return;
    }
  }

  let volume = ZERO_BD;
  for (let i = 0; i < consideration.length; i++) {
    const receivedItem = consideration[i];
    volume = volume.plus(receivedItem.amount.toBigDecimal());
    // TODO: add test case
    if (receivedItem.token != currency || receivedItem.itemType !== itemType) {
      return;
    }
  }

  const dailyTimestampBigInt = BigInt.fromI32(86400);
  const dayID = event.block.timestamp.div(dailyTimestampBigInt);

  // 1. Aggregator
  const aggregatorID = currency.toHexString();
  let aggregator = Aggregator.load(aggregatorID);
  if (!aggregator) {
    aggregator = new Aggregator(aggregatorID);
    aggregator.currency = currency;
    aggregator.volume = ZERO_BD;
    aggregator.collections = ZERO_BI;
    aggregator.transactions = ZERO_BI;
    aggregator.users = ZERO_BI;
  }
  aggregator.volume = aggregator.volume.plus(volume);
  aggregator.transactions = aggregator.transactions.plus(ONE_BI);

  // 2. Aggregator daily data
  const aggregatorDailyDataID = `${aggregatorID}-${dayID.toString()}`;
  let aggregatorDailyData = AggregatorDailyData.load(aggregatorDailyDataID);
  if (!aggregatorDailyData) {
    aggregatorDailyData = new AggregatorDailyData(aggregatorDailyDataID);
    aggregatorDailyData.currency = currency;
    const dayStartTimestamp = dayID.times(dailyTimestampBigInt);
    aggregatorDailyData.date = dayStartTimestamp;
    aggregatorDailyData.volume = ZERO_BD;
    aggregatorDailyData.collections = ZERO_BI;
    aggregatorDailyData.transactions = ZERO_BI;
    aggregatorDailyData.users = ZERO_BI;
    aggregatorDailyData.aggregator = aggregatorID;
  }
  aggregatorDailyData.volume = aggregatorDailyData.volume.plus(volume);
  aggregatorDailyData.transactions = aggregatorDailyData.transactions.plus(ONE_BI);

  // 3. Marketplace
  const marketplaceID = `seaport-${currency.toHexString()}`;
  let marketplace = Marketplace.load(marketplaceID);
  if (!marketplace) {
    marketplace = new Marketplace(marketplaceID);
    marketplace.currency = currency;
    marketplace.volume = ZERO_BD;
    marketplace.collections = ZERO_BI;
    marketplace.transactions = ZERO_BI;
    marketplace.users = ZERO_BI;
  }
  marketplace.volume = marketplace.volume.plus(volume);
  marketplace.transactions = marketplace.transactions.plus(ONE_BI);

  // 4. Marketplace daily data
  const marketplaceDailyDataID = `${marketplaceID}-${dayID.toString()}`;
  let marketplaceDailyData = MarketplaceDailyData.load(marketplaceDailyDataID);
  if (!marketplaceDailyData) {
    marketplaceDailyData = new MarketplaceDailyData(marketplaceDailyDataID);
    marketplaceDailyData.currency = currency;
    const dayStartTimestamp = dayID.times(dailyTimestampBigInt);
    marketplaceDailyData.date = dayStartTimestamp;
    marketplaceDailyData.marketplace = marketplaceID;
    marketplaceDailyData.volume = ZERO_BD;
    marketplaceDailyData.collections = ZERO_BI;
    marketplaceDailyData.transactions = ZERO_BI;
    marketplaceDailyData.users = ZERO_BI;
  }
  marketplaceDailyData.volume = marketplaceDailyData.volume.plus(volume);
  marketplaceDailyData.transactions = marketplaceDailyData.transactions.plus(ONE_BI);

  // 5. User
  const originator = Address.fromHexString(`0x${sweepEvent.topics[1].toHexString().substring(26)}`);
  const userID = `${originator.toHexString()}-${currency.toHexString()}`;
  let user = User.load(userID);
  if (!user) {
    user = new User(userID);
    user.currency = currency;
    user.volume = ZERO_BD;
    user.transactions = ZERO_BI;

    // New aggregator/marketplace user
    aggregator.users = aggregator.users.plus(ONE_BI);
    marketplace.users = marketplace.users.plus(ONE_BI);
  }
  user.volume = user.volume.plus(volume);
  user.transactions = user.transactions.plus(ONE_BI);

  // 6. UserDailyData
  const userDailyDataID = `${userID}-${dayID.toString()}`;
  let userDailyData = UserDailyData.load(userDailyDataID);
  if (!userDailyData) {
    userDailyData = new UserDailyData(userDailyDataID);
    const dayStartTimestamp = dayID.times(dailyTimestampBigInt);
    userDailyData.date = dayStartTimestamp;
    userDailyData.currency = currency;
    userDailyData.volume = ZERO_BD;
    userDailyData.transactions = ZERO_BI;
    userDailyData.user = userID;

    // New aggregator/marketplace user for the day
    aggregatorDailyData.users = aggregatorDailyData.users.plus(ONE_BI);
    marketplaceDailyData.users = marketplaceDailyData.users.plus(ONE_BI);
  }
  userDailyData.volume = userDailyData.volume.plus(volume);
  userDailyData.transactions = userDailyData.transactions.plus(ONE_BI);

  // 7. Collection
  const collectionID = `${offerToken.toHexString()}-${currency.toHexString()}`;
  let collection = Collection.load(collectionID);
  if (!collection) {
    collection = new Collection(collectionID);
    collection.currency = currency;
    collection.volume = ZERO_BD;
    collection.transactions = ZERO_BI;

    // New aggregator/marketplace user
    aggregator.collections = aggregator.collections.plus(ONE_BI);
    marketplace.collections = marketplace.collections.plus(ONE_BI);
  }
  collection.volume = collection.volume.plus(volume);
  collection.transactions = collection.transactions.plus(ONE_BI);

  // 8. CollectionDailyData
  const collectionDailyDataID = `${collectionID}-${dayID.toString()}`;
  let collectionDailyData = CollectionDailyData.load(collectionDailyDataID);
  if (!collectionDailyData) {
    collectionDailyData = new CollectionDailyData(collectionDailyDataID);
    const dayStartTimestamp = dayID.times(dailyTimestampBigInt);
    collectionDailyData.date = dayStartTimestamp;
    collectionDailyData.currency = currency;
    collectionDailyData.volume = ZERO_BD;
    collectionDailyData.transactions = ZERO_BI;
    collectionDailyData.collection = collectionID;

    // New aggregator/marketplace collection for the day
    marketplaceDailyData.collections = marketplaceDailyData.collections.plus(ONE_BI);
    aggregatorDailyData.collections = aggregatorDailyData.collections.plus(ONE_BI);
  }
  collectionDailyData.volume = collectionDailyData.volume.plus(volume);
  collectionDailyData.transactions = collectionDailyData.transactions.plus(ONE_BI);

  const isBundle = offer.length > 1;

  // 9. Transaction
  for (let i = 0; i < offer.length; i++) {
    const transactionID = isBundle
      ? `${event.transaction.hash.toHexString()}-${event.logIndex.toString()}-${i.toString()}`
      : `${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`;

    const transaction = new Transaction(transactionID);
    transaction.transactionHash = event.transaction.hash.toHexString();
    transaction.logIndex = event.logIndex.toI32();
    transaction.timestamp = event.block.timestamp;
    transaction.blockNumber = event.block.number;
    transaction.isBundle = isBundle;
    transaction.collection = collection.id;
    transaction.tokenId = offer[i].identifier;
    transaction.price = volume.div(BigDecimal.fromString(offer.length.toString()));
    transaction.currency = currency;
    transaction.amount = offer[i].amount;
    transaction.buyer = originator;
    transaction.seller = consideration[0].recipient;
    transaction.save();
  }

  aggregator.save();
  aggregatorDailyData.save();
  marketplace.save();
  marketplaceDailyData.save();
  user.save();
  userDailyData.save();
  collection.save();
  collectionDailyData.save();
}
