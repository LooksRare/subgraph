/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BigInt } from "@graphprotocol/graph-ts";
import { ONE_BI, ONE_DAY_BI, ZERO_BI } from "../../../../helpers/constants";
import { TakerBid } from "../../generated/LooksRareV1/LooksRareExchange";
import { Collection, CollectionDailyData, Transaction, User, UserDailyData } from "../../generated/schema";
import { extractOriginator } from "../utils/extractOriginator";
import { findSweepEventFromLogs } from "../utils/findSweepEventFromLogs";
import { getOrInitializeAggregator } from "../utils/getOrInitializeAggregator";
import { getOrInitializeAggregatorByCurrency } from "../utils/getOrInitializeAggregatorByCurrency";
import { getOrInitializeAggregatorDailyData } from "../utils/getOrInitializeAggregatorDailyData";
import { getOrInitializeAggregatorDailyDataByCurrency } from "../utils/getOrInitializeAggregatorDailyDataByCurrency";
import { getOrInitializeCollectionByCurrency } from "../utils/getOrInitializeCollectionByCurrency";
import { getOrInitializeCollectionDailyDataByCurrency } from "../utils/getOrInitializeCollectionDailyDataByCurrency";
import { getOrInitializeMarketplace } from "../utils/getOrInitializeMarketplace";
import { getOrInitializeMarketplaceByCurrency } from "../utils/getOrInitializeMarketplaceByCurrency";
import { getOrInitializeMarketplaceDailyData } from "../utils/getOrInitializeMarketplaceDailyData";
import { getOrInitializeMarketplaceDailyDataByCurrency } from "../utils/getOrInitializeMarketplaceDailyDataByCurrency";
import { getOrInitializeUserByCurrency } from "../utils/getOrInitializeUserByCurrency";
import { getOrInitializeUserDailyDataByCurrency } from "../utils/getOrInitializeUserDailyDataByCurrency";

export function handleTakerBid(event: TakerBid): void {
  const logs = event.receipt!.logs;

  const sweepEvent = findSweepEventFromLogs(logs);
  if (!sweepEvent) return;
  if (sweepEvent.transactionLogIndex >= event.transactionLogIndex) return;

  const currency = event.params.currency;
  const price = event.params.price.toBigDecimal();
  const collectionAddress = event.params.collection.toHexString();
  const dayID = event.block.timestamp.div(ONE_DAY_BI);

  // 1. Aggregator
  const aggregator = getOrInitializeAggregator();
  aggregator.transactions = aggregator.transactions.plus(ONE_BI);

  // 2. Aggregator by currency
  const aggregatorByCurrency = getOrInitializeAggregatorByCurrency(aggregator, currency);
  aggregatorByCurrency.volume = aggregatorByCurrency.volume.plus(price);
  aggregatorByCurrency.transactions = aggregatorByCurrency.transactions.plus(ONE_BI);

  // 3. Aggregator daily data
  const aggregatorDailyData = getOrInitializeAggregatorDailyData(dayID, aggregator);
  aggregatorDailyData.transactions = aggregatorDailyData.transactions.plus(ONE_BI);

  // 4. Aggregator daily data by currency
  const aggregatorDailyDataByCurrency = getOrInitializeAggregatorDailyDataByCurrency(
    aggregatorByCurrency,
    aggregatorDailyData,
    dayID
  );
  aggregatorDailyDataByCurrency.volume = aggregatorDailyDataByCurrency.volume.plus(price);

  // 5. Marketplace
  const marketplace = getOrInitializeMarketplace("LooksRareV1");
  marketplace.transactions = marketplace.transactions.plus(ONE_BI);

  // 6. Marketplace by currency
  const marketplaceByCurrency = getOrInitializeMarketplaceByCurrency(marketplace, currency);
  marketplaceByCurrency.volume = marketplaceByCurrency.volume.plus(price);
  marketplaceByCurrency.transactions = marketplaceByCurrency.transactions.plus(ONE_BI);

  // 7. Marketplace daily data
  const marketplaceDailyData = getOrInitializeMarketplaceDailyData(currency, marketplace, dayID);
  marketplaceDailyData.transactions = marketplaceDailyData.transactions.plus(ONE_BI);

  // 8. Marketplace daily data by currency
  const marketplaceDailyDataByCurrency = getOrInitializeMarketplaceDailyDataByCurrency(
    marketplaceDailyData,
    marketplaceByCurrency,
    dayID
  );
  marketplaceDailyDataByCurrency.volume = marketplaceDailyDataByCurrency.volume.plus(price);

  // 9. User
  const originator = extractOriginator(sweepEvent);
  const userID = originator.toHexString();
  let user = User.load(userID);
  if (!user) {
    user = new User(userID);
    user.transactions = ZERO_BI;

    // New aggregator/marketplace user
    aggregator.users = aggregator.users.plus(ONE_BI);
    aggregatorByCurrency.users = aggregatorByCurrency.users.plus(ONE_BI);
    marketplace.users = marketplace.users.plus(ONE_BI);
    marketplaceByCurrency.users = marketplaceByCurrency.users.plus(ONE_BI);
  }
  user.transactions = user.transactions.plus(ONE_BI);

  // 10. User by currency
  const userByCurrency = getOrInitializeUserByCurrency(user, currency);
  userByCurrency.volume = userByCurrency.volume.plus(price);
  userByCurrency.transactions = userByCurrency.transactions.plus(ONE_BI);

  // 11. User daily data
  const userDailyDataID = `${userID}-${dayID.toString()}`;
  let userDailyData = UserDailyData.load(userDailyDataID);
  if (!userDailyData) {
    userDailyData = new UserDailyData(userDailyDataID);
    const dayStartTimestamp = dayID.times(ONE_DAY_BI);
    userDailyData.date = dayStartTimestamp;
    userDailyData.transactions = ZERO_BI;
    userDailyData.user = userID;

    // New aggregator/marketplace user for the day
    aggregatorDailyData.users = aggregatorDailyData.users.plus(ONE_BI);
    aggregatorDailyDataByCurrency.users = aggregatorDailyDataByCurrency.users.plus(ONE_BI);
    marketplaceDailyData.users = marketplaceDailyData.users.plus(ONE_BI);
    marketplaceDailyDataByCurrency.users = marketplaceDailyDataByCurrency.users.plus(ONE_BI);
  }
  userDailyData.transactions = userDailyData.transactions.plus(ONE_BI);

  // 12. User daily data by currency
  const userDailyDataByCurrency = getOrInitializeUserDailyDataByCurrency(userDailyData, userByCurrency, dayID);
  userDailyDataByCurrency.volume = userDailyDataByCurrency.volume.plus(price);

  // 13. Collection
  let collection = Collection.load(collectionAddress);
  if (!collection) {
    collection = new Collection(collectionAddress);
    collection.transactions = ZERO_BI;

    // New aggregator/marketplace user
    aggregator.collections = aggregator.collections.plus(ONE_BI);
    aggregatorByCurrency.collections = aggregatorByCurrency.collections.plus(ONE_BI);
    marketplace.collections = marketplace.collections.plus(ONE_BI);
    marketplaceByCurrency.collections = marketplaceByCurrency.collections.plus(ONE_BI);
  }
  collection.transactions = collection.transactions.plus(ONE_BI);

  // 14. Collection by currency
  const collectionByCurrency = getOrInitializeCollectionByCurrency(event.params.collection, currency);
  collectionByCurrency.volume = collectionByCurrency.volume.plus(price);
  collectionByCurrency.transactions = collectionByCurrency.transactions.plus(ONE_BI);

  // 15. Collection daily data
  const collectionDailyDataID = `${collection.id}-${dayID.toString()}`;
  let collectionDailyData = CollectionDailyData.load(collectionDailyDataID);
  if (!collectionDailyData) {
    collectionDailyData = new CollectionDailyData(collectionDailyDataID);
    const dayStartTimestamp = dayID.times(ONE_DAY_BI);
    collectionDailyData.date = dayStartTimestamp;
    collectionDailyData.transactions = ZERO_BI;
    collectionDailyData.collection = collection.id;

    // New aggregator/marketplace collection for the day
    marketplaceDailyData.collections = marketplaceDailyData.collections.plus(ONE_BI);
    marketplaceDailyDataByCurrency.collections = marketplaceDailyDataByCurrency.collections.plus(ONE_BI);
    aggregatorDailyData.collections = aggregatorDailyData.collections.plus(ONE_BI);
    aggregatorDailyDataByCurrency.collections = aggregatorDailyDataByCurrency.collections.plus(ONE_BI);
  }
  collectionDailyData.transactions = collectionDailyData.transactions.plus(ONE_BI);

  // 16. Collection daily data by currency
  const collectionDailyDataByCurrency = getOrInitializeCollectionDailyDataByCurrency(collectionByCurrency, dayID);
  collectionDailyDataByCurrency.volume = collectionDailyDataByCurrency.volume.plus(price);

  const transactionHash = event.transaction.hash.toHexString();
  const logIndex = event.logIndex;
  const block = event.block;
  const transactionID = `${transactionHash}-${logIndex.toString()}`;

  // 17. Transaction
  const transaction = new Transaction(transactionID);
  transaction.transactionHash = transactionHash;
  transaction.logIndex = logIndex.toI32();
  transaction.timestamp = block.timestamp;
  transaction.blockNumber = block.number;
  transaction.isBundle = false;
  transaction.collection = collection.id;
  transaction.tokenId = event.params.tokenId;
  transaction.price = price;
  transaction.currency = currency;
  transaction.amount = BigInt.fromI32(1);
  transaction.buyer = user.id;
  transaction.seller = event.params.maker;
  transaction.aggregatorDailyDataByCurrency = aggregatorDailyDataByCurrency.id;
  transaction.collectionDailyDataByCurrency = collectionDailyDataByCurrency.id;
  transaction.marketplaceDailyDataByCurrency = marketplaceDailyDataByCurrency.id;
  transaction.userDailyDataByCurrency = userDailyDataByCurrency.id;

  aggregator.save();
  aggregatorByCurrency.save();
  aggregatorDailyData.save();
  aggregatorDailyDataByCurrency.save();
  marketplace.save();
  marketplaceByCurrency.save();
  marketplaceDailyData.save();
  marketplaceDailyDataByCurrency.save();
  user.save();
  userByCurrency.save();
  userDailyData.save();
  userDailyDataByCurrency.save();
  collection.save();
  collectionByCurrency.save();
  collectionDailyData.save();
  collectionDailyDataByCurrency.save();
  transaction.save();
}
