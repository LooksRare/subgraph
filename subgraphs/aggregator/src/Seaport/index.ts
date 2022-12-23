/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BigDecimal } from "@graphprotocol/graph-ts";
import { OrderFulfilled } from "../../generated/Seaport/Seaport";
import { Collection, CollectionDailyData, Transaction, User, UserDailyData } from "../../generated/schema";
import { ONE_BI, ZERO_BI, ONE_DAY_BI } from "../../../../helpers/constants";
import { getOrInitializeAggregator } from "../utils/getOrInitializeAggregator";
import { getOrInitializeAggregatorByCurrency } from "../utils/getOrInitializeAggregatorByCurrency";
import { getOrInitializeMarketplace } from "../utils/getOrInitializeMarketplace";
import { getOrInitializeMarketplaceDailyData } from "../utils/getOrInitializeMarketplaceDailyData";
import { getOrInitializeAggregatorDailyData } from "../utils/getOrInitializeAggregatorDailyData";
import { findSweepEventFromLogs } from "../utils/findSweepEventFromLogs";
import { getOrInitializeAggregatorDailyDataByCurrency } from "../utils/getOrInitializeAggregatorDailyDataByCurrency";
import { extractOriginator } from "../utils/extractOriginator";
import { isSameOfferToken } from "../utils/Seaport/isSameOfferToken";
import { isSameConsiderationToken } from "../utils/Seaport/isSameConsiderationToken";
import { calculateVolume } from "../utils/Seaport/calculateVolume";
import { getOrInitializeMarketplaceByCurrency } from "../utils/getOrInitializeMarketplaceByCurrency";
import { getOrInitializeMarketplaceDailyDataByCurrency } from "../utils/getOrInitializeMarketplaceDailyDataByCurrency";
import { getOrInitializeCollectionByCurrency } from "../utils/getOrInitializeCollectionByCurrency";
import { getOrInitializeCollectionDailyDataByCurrency } from "../utils/getOrInitializeCollectionDailyDataByCurrency";
import { getOrInitializeUserByCurrency } from "../utils/getOrInitializeUserByCurrency";
import { getOrInitializeUserDailyDataByCurrency } from "../utils/getOrInitializeUserDailyDataByCurrency";

export function handleOrderFulfilled(event: OrderFulfilled): void {
  const logs = event.receipt!.logs;

  const sweepEvent = findSweepEventFromLogs(logs);
  if (!sweepEvent) return;
  if (sweepEvent.transactionLogIndex >= event.transactionLogIndex) return;

  const offer = event.params.offer;
  const consideration = event.params.consideration;
  const offerToken = offer[0].token;
  const currency = consideration[0].token;
  const itemType = consideration[0].itemType;
  // NATIVE: 0, ERC20: 1
  if (itemType > 1) return;

  if (!isSameOfferToken(offer)) return;
  if (!isSameConsiderationToken(consideration)) return;

  const volume = calculateVolume(consideration);

  const dayID = event.block.timestamp.div(ONE_DAY_BI);

  // 1. Aggregator
  const aggregator = getOrInitializeAggregator();
  aggregator.transactions = aggregator.transactions.plus(ONE_BI);

  // 2. Aggregator by currency
  const aggregatorByCurrency = getOrInitializeAggregatorByCurrency(aggregator, currency);
  aggregatorByCurrency.volume = aggregatorByCurrency.volume.plus(volume);
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
  aggregatorDailyDataByCurrency.volume = aggregatorDailyDataByCurrency.volume.plus(volume);

  // 5. Marketplace
  const marketplace = getOrInitializeMarketplace("Seaport");
  marketplace.transactions = marketplace.transactions.plus(ONE_BI);

  // 6. Marketplace by currency
  const marketplaceByCurrency = getOrInitializeMarketplaceByCurrency(marketplace, currency);
  marketplaceByCurrency.volume = marketplaceByCurrency.volume.plus(volume);
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
  marketplaceDailyDataByCurrency.volume = marketplaceDailyDataByCurrency.volume.plus(volume);

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
  userByCurrency.volume = userByCurrency.volume.plus(volume);
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
  userDailyDataByCurrency.volume = userDailyDataByCurrency.volume.plus(volume);

  // 13. Collection
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

  // 14. Collection by currency
  const collectionByCurrency = getOrInitializeCollectionByCurrency(offerToken, currency);
  collectionByCurrency.volume = collectionByCurrency.volume.plus(volume);
  collectionByCurrency.transactions = collectionByCurrency.transactions.plus(ONE_BI);

  // 15. Collection daily data
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

  // 16. Collection daily data by currency
  const collectionDailyDataByCurrency = getOrInitializeCollectionDailyDataByCurrency(collectionByCurrency, dayID);
  collectionDailyDataByCurrency.volume = collectionDailyDataByCurrency.volume.plus(volume);

  const isBundle = offer.length > 1;

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

  // 17. Transaction
  for (let i = 0; i < offer.length; i++) {
    const transactionHash = event.transaction.hash.toHexString();
    const logIndex = event.logIndex;
    const block = event.block;
    const transactionID = isBundle
      ? `${transactionHash}-${logIndex.toString()}-${i.toString()}`
      : `${transactionHash}-${logIndex.toString()}`;

    const transaction = new Transaction(transactionID);
    transaction.transactionHash = transactionHash;
    transaction.logIndex = logIndex.toI32();
    transaction.timestamp = block.timestamp;
    transaction.blockNumber = block.number;
    transaction.isBundle = isBundle;
    transaction.collection = collection.id;
    transaction.tokenId = offer[i].identifier;
    transaction.price = volume.div(BigDecimal.fromString(offer.length.toString()));
    transaction.currency = currency;
    transaction.amount = offer[i].amount;
    transaction.buyer = user.id;
    transaction.seller = consideration[0].recipient;
    transaction.aggregatorDailyDataByCurrency = aggregatorDailyDataByCurrency.id;
    transaction.collectionDailyDataByCurrency = collectionDailyDataByCurrency.id;
    transaction.marketplaceDailyDataByCurrency = marketplaceDailyDataByCurrency.id;
    transaction.userDailyDataByCurrency = userDailyDataByCurrency.id;
    transaction.save();
  }
}
