/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { afterEach, assert, clearStore, describe, test } from "matchstick-as/assembly/index";
import { createOrderFulfilledEvent, newLog } from "./helpers/utils";
import { handleOrderFulfilled } from "../src/index";
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
} from "../generated/schema";
import {
  LOOKSRARE_AGGREGATOR,
  LOOKSRARE_AGGREGATOR_SWEEP_EVENT_TOPIC,
  ONE_BI,
  ZERO_ADDRESS,
  ZERO_BI,
} from "../../../helpers/constants";
import { OrderFulfilled } from "../generated/Seaport/Seaport";

describe("handleOrderFulfilled()", () => {
  const originator = "0x000000000000000000000000000000000000dead";
  const offerer = "0x61d7c6572922a1ecff8fce8b88920f7eaaab1dae";
  const recipient = "0xac5484132f22d4551d10ac7b6eaf8356b4beaaec";
  const offerToken = "0x60bb1e2aa1c9acafb4d34f71585d7e959f387769";
  const transactionVolume = "15296000000000000000";

  // https://etherscan.io/tx/0x954e07b648c7b6ceba98bddf79263b5b71f9e09da4d5bc7c10ca15819ae9f966
  const createMockOrderFulfilledEvent = (
    considerationItemTypes: Array<i32> = [0, 0, 0],
    considerationTokens: Array<string> = [ZERO_ADDRESS.toHex(), ZERO_ADDRESS.toHex(), ZERO_ADDRESS.toHex()]
  ): OrderFulfilled => {
    const event = createOrderFulfilledEvent(
      "0xaf4f0380b83f5350ec3c902702ff15b1f3b216080ae3bb82dfec201f8d31c188", // orderHash
      offerer,
      "0x004c00500000ad104d7dbd00e3ae0a5c00560c00", // zone
      recipient,
      [2], // offer item types
      [offerToken], // offer tokens
      [1333], // offer identifiers
      [1], // offer amounts
      considerationItemTypes, // consideration item types
      considerationTokens, // consideration tokens
      [0, 0, 0], // consideration identifier
      ["14496000000000000000", "400000000000000000", "400000000000000000"], // consideration amounts
      [offerer, "0x0000a26b00c1f0df003000390027140000faa719", "0xe974159205528502237758439da8c4dcc03d3023"] // consideration recipients
    );

    // Fake a LooksRareAggregator Sweep event
    event!.receipt!.logs = [
      newLog(LOOKSRARE_AGGREGATOR, [
        Bytes.fromHexString(LOOKSRARE_AGGREGATOR_SWEEP_EVENT_TOPIC),
        Bytes.fromHexString("0x000000000000000000000000000000000000000000000000000000000000dEaD"),
      ]),
      event!.receipt!.logs[0],
    ];

    return event;
  };

  const assertNothingHappened = (event: OrderFulfilled): void => {
    const collection = Collection.load(offerToken);
    assert.assertNull(collection);
    const collectionByCurrency = CollectionByCurrency.load(`${offerToken}-${ZERO_ADDRESS.toHex()}`);
    assert.assertNull(collectionByCurrency);
    const collectionDailyData = CollectionDailyData.load(`${offerToken}-0`);
    assert.assertNull(collectionDailyData);
    const collectionDailyDataByCurrency = CollectionDailyDataByCurrency.load(`${offerToken}-${ZERO_ADDRESS.toHex()}-0`);
    assert.assertNull(collectionDailyDataByCurrency);
    const aggregator = Aggregator.load("LooksRareAggregator");
    assert.assertNull(aggregator);
    const aggregatorDailyData = AggregatorDailyData.load("0");
    assert.assertNull(aggregatorDailyData);
    const aggregatorByCurrency = AggregatorByCurrency.load(ZERO_ADDRESS.toHex());
    assert.assertNull(aggregatorByCurrency);
    const aggregatorDailyDataByCurrency = AggregatorDailyDataByCurrency.load(`${ZERO_ADDRESS.toHex()}-0`);
    assert.assertNull(aggregatorDailyDataByCurrency);
    const marketplace = Marketplace.load("seaport");
    assert.assertNull(marketplace);
    const marketplaceDailyData = MarketplaceDailyData.load("seaport-0");
    assert.assertNull(marketplaceDailyData);
    const marketplaceByCurrency = MarketplaceByCurrency.load(`seaport-${ZERO_ADDRESS.toHex()}`);
    assert.assertNull(marketplaceByCurrency);
    const marketplaceDailyDataByCurrency = MarketplaceDailyDataByCurrency.load(`seaport-${ZERO_ADDRESS.toHex()}-0`);
    assert.assertNull(marketplaceDailyDataByCurrency);
    const user = User.load(Address.fromString(originator).toHexString());
    assert.assertNull(user);
    const userDailyData = UserDailyData.load(`${Address.fromString(originator).toHexString()}-0`);
    assert.assertNull(userDailyData);
    const userByCurrency = UserByCurrency.load(
      `${Address.fromString(originator).toHexString()}-${ZERO_ADDRESS.toHex()}`
    );
    assert.assertNull(userByCurrency);
    const userDailyDataByCurrency = UserDailyDataByCurrency.load(
      `${Address.fromString(originator).toHexString()}-${ZERO_ADDRESS.toHex()}-0`
    );
    assert.assertNull(userDailyDataByCurrency);
    const transaction = Transaction.load(`${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`);
    assert.assertNull(transaction);
  };

  afterEach(() => {
    clearStore();
  });

  test("does nothing if consideration token is not ETH or ERC20", () => {
    const event = createMockOrderFulfilledEvent([2, 2, 2]);
    handleOrderFulfilled(event);

    assertNothingHappened(event);
  });

  test("does nothing if consideration tokens are not the same", () => {
    const event = createMockOrderFulfilledEvent(
      [0, 0, 0],
      [ZERO_ADDRESS.toHex(), ZERO_ADDRESS.toHex(), "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"]
    );
    handleOrderFulfilled(event);

    assertNothingHappened(event);
  });

  test("does nothing if consideration item types are not the same", () => {
    const event = createMockOrderFulfilledEvent(
      [0, 0, 1],
      [ZERO_ADDRESS.toHex(), ZERO_ADDRESS.toHex(), ZERO_ADDRESS.toHex()]
    );
    handleOrderFulfilled(event);

    assertNothingHappened(event);
  });

  test("updates Collection", () => {
    const event = createMockOrderFulfilledEvent();
    handleOrderFulfilled(event);
    const collection = Collection.load(offerToken);
    assert.assertNotNull(collection);
    assert.bigIntEquals(collection!.transactions, ONE_BI);

    assert.i32Equals(collection!.dailyData.length, 1);
    assert.stringEquals(collection!.dailyData[0], `${offerToken}-0`);
  });

  test("updates CollectionByCurrency", () => {
    const event = createMockOrderFulfilledEvent();
    handleOrderFulfilled(event);

    const collectionByCurrency = CollectionByCurrency.load(`${offerToken}-${ZERO_ADDRESS.toHex()}`);
    assert.assertNotNull(collectionByCurrency);
    assert.stringEquals(collectionByCurrency!.currency.toHexString(), ZERO_ADDRESS.toHex());
    assert.bigIntEquals(collectionByCurrency!.transactions, ONE_BI);
    assert.stringEquals(collectionByCurrency!.volume.toString(), transactionVolume);

    assert.i32Equals(collectionByCurrency!.dailyData.length, 1);
    assert.stringEquals(collectionByCurrency!.dailyData[0], `${offerToken}-${ZERO_ADDRESS.toHex()}-0`);
  });

  test("updates CollectionDailyData", () => {
    const event = createMockOrderFulfilledEvent();
    handleOrderFulfilled(event);

    const collectionDailyData = CollectionDailyData.load(`${offerToken}-0`);
    assert.assertNotNull(collectionDailyData);
    assert.stringEquals(collectionDailyData!.collection.toString(), offerToken);
    assert.bigIntEquals(collectionDailyData!.transactions, ONE_BI);
    assert.bigIntEquals(collectionDailyData!.date, ZERO_BI);
  });

  test("updates CollectionDailyDataByCurrency", () => {
    const event = createMockOrderFulfilledEvent();
    handleOrderFulfilled(event);

    const collectionDailyDataByCurrency = CollectionDailyDataByCurrency.load(`${offerToken}-${ZERO_ADDRESS.toHex()}-0`);
    assert.assertNotNull(collectionDailyDataByCurrency);
    assert.stringEquals(
      collectionDailyDataByCurrency!.collectionByCurrency.toString(),
      `${offerToken}-${ZERO_ADDRESS.toHex()}`
    );
    assert.stringEquals(collectionDailyDataByCurrency!.currency.toHexString(), ZERO_ADDRESS.toHex());
    assert.bigIntEquals(collectionDailyDataByCurrency!.transactions, ONE_BI);
    assert.bigIntEquals(collectionDailyDataByCurrency!.date, ZERO_BI);
    assert.stringEquals(collectionDailyDataByCurrency!.volume.toString(), transactionVolume);
  });

  test("updates Aggregator", () => {
    const event = createMockOrderFulfilledEvent();
    handleOrderFulfilled(event);

    const aggregator = Aggregator.load("LooksRareAggregator");
    assert.assertNotNull(aggregator);
    assert.bigIntEquals(aggregator!.transactions, ONE_BI);
    assert.bigIntEquals(aggregator!.users, ONE_BI);
    assert.bigIntEquals(aggregator!.collections, ONE_BI);

    assert.i32Equals(aggregator!.dailyData.length, 1);
    assert.stringEquals(aggregator!.dailyData[0], "0");
  });

  test("updates AggregatorDailyData", () => {
    const event = createMockOrderFulfilledEvent();
    handleOrderFulfilled(event);

    const aggregatorDailyData = AggregatorDailyData.load("0");
    assert.assertNotNull(aggregatorDailyData);
    assert.bigIntEquals(aggregatorDailyData!.transactions, ONE_BI);
    assert.bigIntEquals(aggregatorDailyData!.date, ZERO_BI);
    assert.bigIntEquals(aggregatorDailyData!.users, ONE_BI);
    assert.bigIntEquals(aggregatorDailyData!.collections, ONE_BI);
  });

  test("updates AggregatorByCurrency", () => {
    const event = createMockOrderFulfilledEvent();
    handleOrderFulfilled(event);

    const aggregatorByCurrency = AggregatorByCurrency.load(ZERO_ADDRESS.toHex());
    assert.assertNotNull(aggregatorByCurrency);
    assert.stringEquals(aggregatorByCurrency!.currency.toHexString(), ZERO_ADDRESS.toHex());
    assert.bigIntEquals(aggregatorByCurrency!.transactions, ONE_BI);
    assert.stringEquals(aggregatorByCurrency!.volume.toString(), transactionVolume);
    assert.bigIntEquals(aggregatorByCurrency!.users, ONE_BI);
    assert.bigIntEquals(aggregatorByCurrency!.collections, ONE_BI);
  });

  test("updates AggregatorDailyDataByCurrency", () => {
    const event = createMockOrderFulfilledEvent();
    handleOrderFulfilled(event);

    const aggregatorDailyDataByCurrency = AggregatorDailyDataByCurrency.load(`${ZERO_ADDRESS.toHex()}-0`);
    assert.assertNotNull(aggregatorDailyDataByCurrency);
    assert.stringEquals(aggregatorDailyDataByCurrency!.currency.toHexString(), ZERO_ADDRESS.toHex());
    assert.bigIntEquals(aggregatorDailyDataByCurrency!.transactions, ONE_BI);
    assert.bigIntEquals(aggregatorDailyDataByCurrency!.date, ZERO_BI);
    assert.stringEquals(aggregatorDailyDataByCurrency!.volume.toString(), transactionVolume);
    assert.bigIntEquals(aggregatorDailyDataByCurrency!.users, ONE_BI);
    assert.bigIntEquals(aggregatorDailyDataByCurrency!.collections, ONE_BI);
  });

  test("updates Marketplace", () => {
    const event = createMockOrderFulfilledEvent();
    handleOrderFulfilled(event);

    const marketplace = Marketplace.load("seaport");
    assert.assertNotNull(marketplace);
    assert.bigIntEquals(marketplace!.transactions, ONE_BI);
    assert.bigIntEquals(marketplace!.users, ONE_BI);
    assert.bigIntEquals(marketplace!.collections, ONE_BI);

    assert.i32Equals(marketplace!.dailyData.length, 1);
    assert.stringEquals(marketplace!.dailyData[0], "seaport-0");
  });

  test("updates MarketplaceDailyData", () => {
    const event = createMockOrderFulfilledEvent();
    handleOrderFulfilled(event);

    const marketplaceDailyData = MarketplaceDailyData.load("seaport-0");
    assert.assertNotNull(marketplaceDailyData);
    assert.bigIntEquals(marketplaceDailyData!.transactions, ONE_BI);
    assert.stringEquals(marketplaceDailyData!.marketplace, "seaport");
    assert.bigIntEquals(marketplaceDailyData!.date, ZERO_BI);
    assert.bigIntEquals(marketplaceDailyData!.users, ONE_BI);
    assert.bigIntEquals(marketplaceDailyData!.collections, ONE_BI);
  });

  test("updates MarketplaceByCurrency", () => {
    const event = createMockOrderFulfilledEvent();
    handleOrderFulfilled(event);

    const marketplaceByCurrency = MarketplaceByCurrency.load(`seaport-${ZERO_ADDRESS.toHex()}`);
    assert.assertNotNull(marketplaceByCurrency);
    assert.stringEquals(marketplaceByCurrency!.currency.toHexString(), ZERO_ADDRESS.toHex());
    assert.bigIntEquals(marketplaceByCurrency!.transactions, ONE_BI);
    assert.stringEquals(marketplaceByCurrency!.volume.toString(), transactionVolume);
    assert.bigIntEquals(marketplaceByCurrency!.users, ONE_BI);
    assert.bigIntEquals(marketplaceByCurrency!.collections, ONE_BI);

    assert.i32Equals(marketplaceByCurrency!.dailyData.length, 1);
    assert.stringEquals(marketplaceByCurrency!.dailyData[0], `seaport-${ZERO_ADDRESS.toHex()}-0`);
  });

  test("updates MarketplaceDailyDataByCurrency", () => {
    const event = createMockOrderFulfilledEvent();
    handleOrderFulfilled(event);

    const marketplaceDailyDataByCurrency = MarketplaceDailyDataByCurrency.load(`seaport-${ZERO_ADDRESS.toHex()}-0`);
    assert.assertNotNull(marketplaceDailyDataByCurrency);
    assert.stringEquals(marketplaceDailyDataByCurrency!.currency.toHexString(), ZERO_ADDRESS.toHex());
    assert.bigIntEquals(marketplaceDailyDataByCurrency!.transactions, ONE_BI);
    assert.stringEquals(marketplaceDailyDataByCurrency!.marketplaceByCurrency, `seaport-${ZERO_ADDRESS.toHex()}`);
    assert.bigIntEquals(marketplaceDailyDataByCurrency!.date, ZERO_BI);
    assert.stringEquals(marketplaceDailyDataByCurrency!.volume.toString(), transactionVolume);
    assert.bigIntEquals(marketplaceDailyDataByCurrency!.users, ONE_BI);
    assert.bigIntEquals(marketplaceDailyDataByCurrency!.collections, ONE_BI);
  });

  test("updates User", () => {
    const event = createMockOrderFulfilledEvent();
    handleOrderFulfilled(event);

    const user = User.load(Address.fromString(originator).toHexString());
    assert.assertNotNull(user);
    assert.bigIntEquals(user!.transactions, ONE_BI);

    assert.i32Equals(user!.dailyData.length, 1);
    assert.stringEquals(user!.dailyData[0], `${Address.fromString(originator).toHexString()}-0`);
  });

  test("updates UserDailyData", () => {
    const event = createMockOrderFulfilledEvent();
    handleOrderFulfilled(event);

    const userDailyData = UserDailyData.load(`${Address.fromString(originator).toHexString()}-0`);
    assert.assertNotNull(userDailyData);
    assert.bigIntEquals(userDailyData!.transactions, ONE_BI);
    assert.stringEquals(userDailyData!.user, Address.fromString(originator).toHexString());
    assert.bigIntEquals(userDailyData!.date, ZERO_BI);
  });

  test("updates UserByCurrency", () => {
    const event = createMockOrderFulfilledEvent();
    handleOrderFulfilled(event);

    const userByCurrency = UserByCurrency.load(
      `${Address.fromString(originator).toHexString()}-${ZERO_ADDRESS.toHex()}`
    );
    assert.assertNotNull(userByCurrency);
    assert.stringEquals(userByCurrency!.currency.toHexString(), ZERO_ADDRESS.toHex());
    assert.bigIntEquals(userByCurrency!.transactions, ONE_BI);
    assert.stringEquals(userByCurrency!.volume.toString(), transactionVolume);

    assert.i32Equals(userByCurrency!.dailyData.length, 1);
    assert.stringEquals(
      userByCurrency!.dailyData[0],
      `${Address.fromString(originator).toHexString()}-${ZERO_ADDRESS.toHex()}-0`
    );
  });

  test("updates UserDailyDataByCurrency", () => {
    const event = createMockOrderFulfilledEvent();
    handleOrderFulfilled(event);

    const userDailyDataByCurrency = UserDailyDataByCurrency.load(
      `${Address.fromString(originator).toHexString()}-${ZERO_ADDRESS.toHex()}-0`
    );
    assert.assertNotNull(userDailyDataByCurrency);
    assert.stringEquals(userDailyDataByCurrency!.currency.toHexString(), ZERO_ADDRESS.toHex());
    assert.bigIntEquals(userDailyDataByCurrency!.transactions, ONE_BI);
    assert.stringEquals(
      userDailyDataByCurrency!.userByCurrency,
      `${Address.fromString(originator).toHexString()}-${ZERO_ADDRESS.toHex()}`
    );
    assert.bigIntEquals(userDailyDataByCurrency!.date, ZERO_BI);
    assert.stringEquals(userDailyDataByCurrency!.volume.toString(), transactionVolume);
  });

  test("updates Transaction", () => {
    const event = createMockOrderFulfilledEvent();
    handleOrderFulfilled(event);

    const transaction = Transaction.load(`${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`);
    assert.assertNotNull(transaction);
    assert.stringEquals(transaction!.transactionHash, event.transaction.hash.toHexString());
    assert.stringEquals(transaction!.logIndex.toString(), event.logIndex.toString());
    assert.bigIntEquals(transaction!.timestamp, event.block.timestamp);
    assert.bigIntEquals(transaction!.blockNumber, event.block.number);
    assert.booleanEquals(transaction!.isBundle, false);
    assert.stringEquals(transaction!.collection, offerToken);
    assert.bigIntEquals(transaction!.tokenId, BigInt.fromI32(1333));
    assert.stringEquals(transaction!.price.toString(), transactionVolume);
    assert.stringEquals(transaction!.currency.toHexString(), ZERO_ADDRESS.toHex());
    assert.bigIntEquals(transaction!.amount, ONE_BI);
    assert.stringEquals(transaction!.buyer.toHexString(), originator);
    assert.stringEquals(transaction!.seller.toHexString(), offerer);
  });
});
