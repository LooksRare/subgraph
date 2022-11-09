/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BigDecimal } from "@graphprotocol/graph-ts";
import { OrderFulfilled } from "../generated/Seaport/Seaport";
import {
  Collection,
  CollectionDailyData,
  Transaction,
  User,
  UserByCurrency,
  UserDailyData,
  UserDailyDataByCurrency,
} from "../generated/schema";
import { ONE_BI, ZERO_BD, ZERO_BI, ONE_DAY_BI } from "../../../helpers/constants";
import { getOrInitializeAggregator } from "./utils/getOrInitializeAggregator";
import { getOrInitializeAggregatorByCurrency } from "./utils/getOrInitializeAggregatorByCurrency";
import { getOrInitializeMarketplace } from "./utils/getOrInitializeMarketplace";
import { getOrInitializeMarketplaceDailyData } from "./utils/getOrInitializeMarketplaceDailyData";
import { getOrInitializeAggregatorDailyData } from "./utils/getOrInitializeAggregatorDailyData";
import { findSweepEventFromLogs } from "./utils/findSweepEventFromLogs";
import { getOrInitializeAggregatorDailyDataByCurrency } from "./utils/getOrInitializeAggregatorDailyDataByCurrency";
import { extractOriginator } from "./utils/extractOriginator";
import { isSameOfferToken } from "./utils/isSameOfferToken";
import { isSameConsiderationToken } from "./utils/isSameConsiderationToken";
import { calculateVolume } from "./utils/calculateVolume";
import { getOrInitializeMarketplaceByCurrency } from "./utils/getOrInitializeMarketplaceByCurrency";
import { getOrInitializeMarketplaceDailyDataByCurrency } from "./utils/getOrInitializeMarketplaceDailyDataByCurrency";
import { getOrInitializeCollectionByCurrency } from "./utils/getOrInitializeCollectionByCurrency";
import { getOrInitializeCollectionDailyDataByCurrency } from "./utils/getOrInitializeCollectionDailyDataByCurrency";

export function handleOrderFulfilled(event: OrderFulfilled): void {
  const logs = event.receipt!.logs;

  const sweepEvent = findSweepEventFromLogs(logs);
  if (!sweepEvent) return;

  const offer = event.params.offer;
  const consideration = event.params.consideration;
  const offerToken = offer[0].token;
  const currency = consideration[0].token;
  const itemType = consideration[0].itemType;
  // NATIVE: 0, ERC20: 1
  // TODO: Add test case
  if (itemType > 1) return;

  if (!isSameOfferToken(offer)) return;
  if (!isSameConsiderationToken(consideration)) return;

  const volume = calculateVolume(consideration);

  const dayID = event.block.timestamp.div(ONE_DAY_BI);

  // 1. Aggregator
  const aggregator = getOrInitializeAggregator();
  aggregator.transactions = aggregator.transactions.plus(ONE_BI);

  const aggregatorByCurrency = getOrInitializeAggregatorByCurrency(currency);
  aggregatorByCurrency.volume = aggregatorByCurrency.volume.plus(volume);
  aggregatorByCurrency.transactions = aggregatorByCurrency.transactions.plus(ONE_BI);

  // 2. Aggregator daily data
  const aggregatorDailyData = getOrInitializeAggregatorDailyData(dayID, aggregator);
  aggregatorDailyData.transactions = aggregatorDailyData.transactions.plus(ONE_BI);

  const aggregatorDailyDataByCurrency = getOrInitializeAggregatorDailyDataByCurrency(aggregatorByCurrency, dayID);
  aggregatorDailyDataByCurrency.volume = aggregatorDailyDataByCurrency.volume.plus(volume);
  aggregatorDailyDataByCurrency.transactions = aggregatorDailyDataByCurrency.transactions.plus(ONE_BI);

  // 3. Marketplace
  const marketplace = getOrInitializeMarketplace();
  marketplace.transactions = marketplace.transactions.plus(ONE_BI);

  const marketplaceByCurrency = getOrInitializeMarketplaceByCurrency(currency);
  marketplaceByCurrency.volume = marketplaceByCurrency.volume.plus(volume);
  marketplaceByCurrency.transactions = marketplaceByCurrency.transactions.plus(ONE_BI);

  // 4. Marketplace daily data
  const marketplaceDailyData = getOrInitializeMarketplaceDailyData(currency, marketplace, dayID);
  marketplaceDailyData.transactions = marketplaceDailyData.transactions.plus(ONE_BI);

  const marketplaceDailyDataByCurrency = getOrInitializeMarketplaceDailyDataByCurrency(marketplaceByCurrency, dayID);
  marketplaceDailyDataByCurrency.volume = marketplaceDailyDataByCurrency.volume.plus(volume);
  marketplaceDailyDataByCurrency.transactions = marketplaceDailyDataByCurrency.transactions.plus(ONE_BI);

  // 5. User
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

  const userByCurrencyID = `${userID}-${currency.toHexString()}`;
  let userByCurrency = UserByCurrency.load(userByCurrencyID);
  if (!userByCurrency) {
    userByCurrency = new UserByCurrency(userByCurrencyID);
    userByCurrency.currency = currency;
    userByCurrency.volume = ZERO_BD;
    userByCurrency.transactions = ZERO_BI;
  }
  userByCurrency.volume = userByCurrency.volume.plus(volume);
  userByCurrency.transactions = userByCurrency.transactions.plus(ONE_BI);

  // 6. UserDailyData
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

  const userDailyDataByCurrencyID = `${userByCurrencyID}-${dayID.toString()}`;
  let userDailyDataByCurrency = UserDailyDataByCurrency.load(userDailyDataByCurrencyID);
  if (!userDailyDataByCurrency) {
    userDailyDataByCurrency = new UserDailyDataByCurrency(userDailyDataByCurrencyID);
    const dayStartTimestamp = dayID.times(ONE_DAY_BI);
    userDailyDataByCurrency.date = dayStartTimestamp;
    userDailyDataByCurrency.currency = currency;
    userDailyDataByCurrency.volume = ZERO_BD;
    userDailyDataByCurrency.transactions = ZERO_BI;
    userDailyDataByCurrency.userByCurrency = userByCurrency.id;
  }
  userDailyDataByCurrency.volume = userDailyDataByCurrency.volume.plus(volume);
  userDailyDataByCurrency.transactions = userDailyDataByCurrency.transactions.plus(ONE_BI);

  // 7. Collection
  const collectionID = offerToken.toHexString();
  let collection = Collection.load(collectionID);
  if (!collection) {
    collection = new Collection(collectionID);
    collection.transactions = ZERO_BI;

    // New aggregator/marketplace user
    aggregator.collections = aggregator.collections.plus(ONE_BI);
    aggregatorByCurrency.collections = aggregatorByCurrency.collections.plus(ONE_BI);
    marketplace.collections = marketplace.collections.plus(ONE_BI);
    marketplaceByCurrency.collections = marketplaceByCurrency.collections.plus(ONE_BI);
  }
  collection.transactions = collection.transactions.plus(ONE_BI);

  const collectionByCurrency = getOrInitializeCollectionByCurrency(offerToken, currency);
  collectionByCurrency.volume = collectionByCurrency.volume.plus(volume);
  collectionByCurrency.transactions = collectionByCurrency.transactions.plus(ONE_BI);

  // 8. CollectionDailyData
  const collectionDailyDataID = `${collectionID}-${dayID.toString()}`;
  let collectionDailyData = CollectionDailyData.load(collectionDailyDataID);
  if (!collectionDailyData) {
    collectionDailyData = new CollectionDailyData(collectionDailyDataID);
    const dayStartTimestamp = dayID.times(ONE_DAY_BI);
    collectionDailyData.date = dayStartTimestamp;
    collectionDailyData.transactions = ZERO_BI;
    collectionDailyData.collection = collectionID;

    // New aggregator/marketplace collection for the day
    marketplaceDailyData.collections = marketplaceDailyData.collections.plus(ONE_BI);
    marketplaceDailyDataByCurrency.collections = marketplaceDailyDataByCurrency.collections.plus(ONE_BI);
    aggregatorDailyData.collections = aggregatorDailyData.collections.plus(ONE_BI);
    aggregatorDailyDataByCurrency.collections = aggregatorDailyDataByCurrency.collections.plus(ONE_BI);
  }
  collectionDailyData.transactions = collectionDailyData.transactions.plus(ONE_BI);

  const collectionDailyDataByCurrency = getOrInitializeCollectionDailyDataByCurrency(collectionByCurrency, dayID);
  collectionDailyDataByCurrency.volume = collectionDailyDataByCurrency.volume.plus(volume);
  collectionDailyDataByCurrency.transactions = collectionDailyDataByCurrency.transactions.plus(ONE_BI);

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
}
