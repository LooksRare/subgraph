/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { assert } from "matchstick-as";
import { ONE_BI, ZERO_BI } from "../../../../helpers/constants";
import {
  Aggregator,
  AggregatorByCurrency,
  AggregatorDailyData,
  AggregatorDailyDataByCurrency,
  Collection,
  CollectionByCurrency,
  CollectionDailyData,
  CollectionDailyDataByCurrency,
  Marketplace,
  MarketplaceByCurrency,
  MarketplaceDailyData,
  MarketplaceDailyDataByCurrency,
  Transaction,
  User,
  UserByCurrency,
  UserDailyData,
  UserDailyDataByCurrency,
} from "../../generated/schema";

export const originator = "0x000000000000000000000000000000000000dead";
export const originatorPadded = "0x000000000000000000000000000000000000000000000000000000000000dEaD";

export const expectAggregatorUpdated = (currency: string): void => {
  const aggregator = Aggregator.load("LooksRareAggregator");
  assert.assertNotNull(aggregator);
  assert.bigIntEquals(aggregator!.transactions, ONE_BI);
  assert.bigIntEquals(aggregator!.users, ONE_BI);
  assert.bigIntEquals(aggregator!.collections, ONE_BI);

  assert.i32Equals(aggregator!.dailyData.length, 1);
  assert.stringEquals(aggregator!.dailyData[0], "0");

  assert.i32Equals(aggregator!.byCurrency.length, 1);
  assert.stringEquals(aggregator!.byCurrency[0], currency);
};

export const expectAggregatorByCurrencyUpdated = (currency: string, volume: string): void => {
  const aggregatorByCurrency = AggregatorByCurrency.load(currency);
  assert.assertNotNull(aggregatorByCurrency);
  assert.stringEquals(aggregatorByCurrency!.currency.toHexString(), currency);
  assert.bigIntEquals(aggregatorByCurrency!.transactions, ONE_BI);
  assert.stringEquals(aggregatorByCurrency!.volume.toString(), volume);
  assert.bigIntEquals(aggregatorByCurrency!.users, ONE_BI);
  assert.bigIntEquals(aggregatorByCurrency!.collections, ONE_BI);
  assert.stringEquals(aggregatorByCurrency!.aggregator, "LooksRareAggregator");
};

export const expectAggregatorDailyDataUpdated = (currency: string): void => {
  const aggregatorDailyData = AggregatorDailyData.load("0");
  assert.assertNotNull(aggregatorDailyData);
  assert.bigIntEquals(aggregatorDailyData!.transactions, ONE_BI);
  assert.bigIntEquals(aggregatorDailyData!.date, ZERO_BI);
  assert.bigIntEquals(aggregatorDailyData!.users, ONE_BI);
  assert.bigIntEquals(aggregatorDailyData!.collections, ONE_BI);

  assert.i32Equals(aggregatorDailyData!.byCurrency.length, 1);
  assert.stringEquals(aggregatorDailyData!.byCurrency[0], `${currency}-0`);
};

export const expectAggregatorDailyDataByCurrencyUpdated = (
  currency: string,
  volume: string,
  transactionId: string
): void => {
  const aggregatorDailyDataByCurrency = AggregatorDailyDataByCurrency.load(`${currency}-0`);
  assert.assertNotNull(aggregatorDailyDataByCurrency);
  assert.stringEquals(aggregatorDailyDataByCurrency!.currency.toHexString(), currency);
  assert.bigIntEquals(aggregatorDailyDataByCurrency!.date, ZERO_BI);
  assert.stringEquals(aggregatorDailyDataByCurrency!.volume.toString(), volume);
  assert.bigIntEquals(aggregatorDailyDataByCurrency!.users, ONE_BI);
  assert.bigIntEquals(aggregatorDailyDataByCurrency!.collections, ONE_BI);
  assert.stringEquals(aggregatorDailyDataByCurrency!.aggregatorByCurrency, currency);

  assert.i32Equals(aggregatorDailyDataByCurrency!.transactions.length, 1);
  assert.stringEquals(aggregatorDailyDataByCurrency!.transactions[0], transactionId);
};

export const expectCollectionUpdated = (collectionAddress: string): void => {
  const collection = Collection.load(collectionAddress);
  assert.assertNotNull(collection);
  assert.bigIntEquals(collection!.transactions, ONE_BI);

  assert.i32Equals(collection!.dailyData.length, 1);
  assert.stringEquals(collection!.dailyData[0], `${collectionAddress}-0`);
};

export const expectCollectionByCurrencyUpdated = (
  collectionAddress: string,
  currency: string,
  volume: string
): void => {
  const collectionByCurrency = CollectionByCurrency.load(`${collectionAddress}-${currency}`);
  assert.assertNotNull(collectionByCurrency);
  assert.stringEquals(collectionByCurrency!.currency.toHexString(), currency);
  assert.bigIntEquals(collectionByCurrency!.transactions, ONE_BI);
  assert.stringEquals(collectionByCurrency!.volume.toString(), volume);

  assert.i32Equals(collectionByCurrency!.dailyData.length, 1);
  assert.stringEquals(collectionByCurrency!.dailyData[0], `${collectionAddress}-${currency}-0`);
};

export const expectCollectionDailyDataUpdated = (collectionAddress: string): void => {
  const collectionDailyData = CollectionDailyData.load(`${collectionAddress}-0`);
  assert.assertNotNull(collectionDailyData);
  assert.stringEquals(collectionDailyData!.collection.toString(), collectionAddress);
  assert.bigIntEquals(collectionDailyData!.transactions, ONE_BI);
  assert.bigIntEquals(collectionDailyData!.date, ZERO_BI);
};

export const expectCollectionDailyDataByCurrencyUpdated = (
  collectionAddress: string,
  currency: string,
  volume: string,
  transactionId: string
): void => {
  const collectionDailyDataByCurrency = CollectionDailyDataByCurrency.load(`${collectionAddress}-${currency}-0`);
  assert.assertNotNull(collectionDailyDataByCurrency);
  assert.stringEquals(
    collectionDailyDataByCurrency!.collectionByCurrency.toString(),
    `${collectionAddress}-${currency}`
  );
  assert.stringEquals(collectionDailyDataByCurrency!.currency.toHexString(), currency);
  assert.bigIntEquals(collectionDailyDataByCurrency!.date, ZERO_BI);
  assert.stringEquals(collectionDailyDataByCurrency!.volume.toString(), volume);

  assert.i32Equals(collectionDailyDataByCurrency!.transactions.length, 1);
  assert.stringEquals(collectionDailyDataByCurrency!.transactions[0], transactionId);
};

export const expectMarketplaceUpdated = (id: string): void => {
  const marketplace = Marketplace.load(id);
  assert.assertNotNull(marketplace);
  assert.bigIntEquals(marketplace!.transactions, ONE_BI);
  assert.bigIntEquals(marketplace!.users, ONE_BI);
  assert.bigIntEquals(marketplace!.collections, ONE_BI);

  assert.i32Equals(marketplace!.dailyData.length, 1);
  assert.stringEquals(marketplace!.dailyData[0], `${id}-0`);
};

export const expectMarketplaceByCurrencyUpdated = (id: string, currency: string, volume: string): void => {
  const marketplaceByCurrency = MarketplaceByCurrency.load(`${id}-${currency}`);
  assert.assertNotNull(marketplaceByCurrency);
  assert.stringEquals(marketplaceByCurrency!.currency.toHexString(), currency);
  assert.bigIntEquals(marketplaceByCurrency!.transactions, ONE_BI);
  assert.stringEquals(marketplaceByCurrency!.volume.toString(), volume);
  assert.bigIntEquals(marketplaceByCurrency!.users, ONE_BI);
  assert.bigIntEquals(marketplaceByCurrency!.collections, ONE_BI);

  assert.i32Equals(marketplaceByCurrency!.dailyData.length, 1);
  assert.stringEquals(marketplaceByCurrency!.dailyData[0], `${id}-${currency}-0`);
};

export const expectMarketplaceDailyDataUpdated = (id: string): void => {
  const marketplaceDailyData = MarketplaceDailyData.load(`${id}-0`);
  assert.assertNotNull(marketplaceDailyData);
  assert.bigIntEquals(marketplaceDailyData!.transactions, ONE_BI);
  assert.stringEquals(marketplaceDailyData!.marketplace, id);
  assert.bigIntEquals(marketplaceDailyData!.date, ZERO_BI);
  assert.bigIntEquals(marketplaceDailyData!.users, ONE_BI);
  assert.bigIntEquals(marketplaceDailyData!.collections, ONE_BI);
};

export const expectMarketplaceDailyDataByCurrencyUpdated = (
  id: string,
  currency: string,
  volume: string,
  transactionId: string
): void => {
  const marketplaceDailyDataByCurrency = MarketplaceDailyDataByCurrency.load(`${id}-${currency}-0`);
  assert.assertNotNull(marketplaceDailyDataByCurrency);
  assert.stringEquals(marketplaceDailyDataByCurrency!.currency.toHexString(), currency);
  assert.stringEquals(marketplaceDailyDataByCurrency!.marketplaceByCurrency, `${id}-${currency}`);
  assert.bigIntEquals(marketplaceDailyDataByCurrency!.date, ZERO_BI);
  assert.stringEquals(marketplaceDailyDataByCurrency!.volume.toString(), volume);
  assert.bigIntEquals(marketplaceDailyDataByCurrency!.users, ONE_BI);
  assert.bigIntEquals(marketplaceDailyDataByCurrency!.collections, ONE_BI);

  assert.i32Equals(marketplaceDailyDataByCurrency!.transactions.length, 1);
  assert.stringEquals(marketplaceDailyDataByCurrency!.transactions[0], transactionId);
};

export const expectUserUpdated = (currency: string): void => {
  const user = User.load(originator);
  assert.assertNotNull(user);
  assert.bigIntEquals(user!.transactions, ONE_BI);

  assert.i32Equals(user!.dailyData.length, 1);
  assert.stringEquals(user!.dailyData[0], `${originator}-0`);

  assert.i32Equals(user!.byCurrency.length, 1);
  assert.stringEquals(user!.byCurrency[0], `${originator}-${currency}`);
};

export const expectUserByCurrencyUpdated = (currency: string, volume: string): void => {
  const userByCurrency = UserByCurrency.load(`${originator}-${currency}`);
  assert.assertNotNull(userByCurrency);
  assert.stringEquals(userByCurrency!.currency.toHexString(), currency);
  assert.bigIntEquals(userByCurrency!.transactions, ONE_BI);
  assert.stringEquals(userByCurrency!.volume.toString(), volume);

  assert.i32Equals(userByCurrency!.dailyData.length, 1);
  assert.stringEquals(userByCurrency!.dailyData[0], `${originator}-${currency}-0`);
};

export const expectUserDailyDataUpdated = (currency: string): void => {
  const userDailyData = UserDailyData.load(`${originator}-0`);
  assert.assertNotNull(userDailyData);
  assert.bigIntEquals(userDailyData!.transactions, ONE_BI);
  assert.stringEquals(userDailyData!.user, originator);
  assert.bigIntEquals(userDailyData!.date, ZERO_BI);

  assert.i32Equals(userDailyData!.byCurrency.length, 1);
  assert.stringEquals(userDailyData!.byCurrency[0], `${originator}-${currency}-0`);
};

export const expectUserDailyDataByCurrencyUpdated = (currency: string, volume: string, transactionId: string): void => {
  const userDailyDataByCurrency = UserDailyDataByCurrency.load(`${originator}-${currency}-0`);
  assert.assertNotNull(userDailyDataByCurrency);
  assert.stringEquals(userDailyDataByCurrency!.currency.toHexString(), currency);
  assert.stringEquals(userDailyDataByCurrency!.userByCurrency, `${originator}-${currency}`);
  assert.bigIntEquals(userDailyDataByCurrency!.date, ZERO_BI);
  assert.stringEquals(userDailyDataByCurrency!.volume.toString(), volume);

  assert.i32Equals(userDailyDataByCurrency!.transactions.length, 1);
  assert.stringEquals(userDailyDataByCurrency!.transactions[0], transactionId);
};

export const expectNothingHappened = (
  exchange: string,
  collectionAddress: string,
  currency: string,
  transactionId: string
): void => {
  const collection = Collection.load(collectionAddress);
  assert.assertNull(collection);
  const collectionByCurrency = CollectionByCurrency.load(`${collectionAddress}-${currency}`);
  assert.assertNull(collectionByCurrency);
  const collectionDailyData = CollectionDailyData.load(`${collectionAddress}-0`);
  assert.assertNull(collectionDailyData);
  const collectionDailyDataByCurrency = CollectionDailyDataByCurrency.load(`${collectionAddress}-${currency}-0`);
  assert.assertNull(collectionDailyDataByCurrency);
  const aggregator = Aggregator.load("LooksRareAggregator");
  assert.assertNull(aggregator);
  const aggregatorDailyData = AggregatorDailyData.load("0");
  assert.assertNull(aggregatorDailyData);
  const aggregatorByCurrency = AggregatorByCurrency.load(currency);
  assert.assertNull(aggregatorByCurrency);
  const aggregatorDailyDataByCurrency = AggregatorDailyDataByCurrency.load(`${currency}-0`);
  assert.assertNull(aggregatorDailyDataByCurrency);
  const marketplace = Marketplace.load(exchange);
  assert.assertNull(marketplace);
  const marketplaceDailyData = MarketplaceDailyData.load(`${exchange}-0`);
  assert.assertNull(marketplaceDailyData);
  const marketplaceByCurrency = MarketplaceByCurrency.load(`${exchange}-${currency}`);
  assert.assertNull(marketplaceByCurrency);
  const marketplaceDailyDataByCurrency = MarketplaceDailyDataByCurrency.load(`${exchange}-${currency}-0`);
  assert.assertNull(marketplaceDailyDataByCurrency);
  const user = User.load(originator);
  assert.assertNull(user);
  const userDailyData = UserDailyData.load(`${originator}-0`);
  assert.assertNull(userDailyData);
  const userByCurrency = UserByCurrency.load(`${originator}-${currency}`);
  assert.assertNull(userByCurrency);
  const userDailyDataByCurrency = UserDailyDataByCurrency.load(`${originator}-${currency}-0`);
  assert.assertNull(userDailyDataByCurrency);
  const transaction = Transaction.load(transactionId);
  assert.assertNull(transaction);
};
