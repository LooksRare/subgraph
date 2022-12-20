/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { afterEach, assert, clearStore, describe, test } from "matchstick-as/assembly/index";
import { createOrderFulfilledEvent, createTakerBidEvent, newLog } from "./helpers/utils";
import { handleOrderFulfilled } from "../src/Seaport/index";
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
import { TakerBid } from "../generated/LooksRareV1/LooksRareExchange";
import { handleTakerBid } from "../src/LooksRareV1";

describe("Aggregator", () => {
  describe("Seaport", () => {
    describe("handleOrderFulfilled()", () => {
      const originator = "0x000000000000000000000000000000000000dead";
      const offerer = "0x61d7c6572922a1ecff8fce8b88920f7eaaab1dae";
      const recipient = "0xac5484132f22d4551d10ac7b6eaf8356b4beaaec";
      const offerToken = "0x60bb1e2aa1c9acafb4d34f71585d7e959f387769";
      const transactionVolume = "15296000000000000000";

      // https://etherscan.io/tx/0x954e07b648c7b6ceba98bddf79263b5b71f9e09da4d5bc7c10ca15819ae9f966
      const createMockOrderFulfilledEvent = (
        considerationItemTypes: Array<i32> = [0, 0, 0],
        considerationTokens: Array<string> = [ZERO_ADDRESS.toHex(), ZERO_ADDRESS.toHex(), ZERO_ADDRESS.toHex()],
        offerItemTypes: Array<i32> = [2],
        offerTokens: Array<string> = ["0x60bb1e2aa1c9acafb4d34f71585d7e959f387769"],
        offerIdentifiers: Array<i32> = [1333],
        offerAmounts: Array<i32> = [1]
      ): OrderFulfilled => {
        const event = createOrderFulfilledEvent(
          "0xaf4f0380b83f5350ec3c902702ff15b1f3b216080ae3bb82dfec201f8d31c188", // orderHash
          offerer,
          "0x004c00500000ad104d7dbd00e3ae0a5c00560c00", // zone
          recipient,
          offerItemTypes,
          offerTokens,
          offerIdentifiers,
          offerAmounts,
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
        const collectionDailyDataByCurrency = CollectionDailyDataByCurrency.load(
          `${offerToken}-${ZERO_ADDRESS.toHex()}-0`
        );
        assert.assertNull(collectionDailyDataByCurrency);
        const aggregator = Aggregator.load("LooksRareAggregator");
        assert.assertNull(aggregator);
        const aggregatorDailyData = AggregatorDailyData.load("0");
        assert.assertNull(aggregatorDailyData);
        const aggregatorByCurrency = AggregatorByCurrency.load(ZERO_ADDRESS.toHex());
        assert.assertNull(aggregatorByCurrency);
        const aggregatorDailyDataByCurrency = AggregatorDailyDataByCurrency.load(`${ZERO_ADDRESS.toHex()}-0`);
        assert.assertNull(aggregatorDailyDataByCurrency);
        const marketplace = Marketplace.load("Seaport");
        assert.assertNull(marketplace);
        const marketplaceDailyData = MarketplaceDailyData.load("Seaport-0");
        assert.assertNull(marketplaceDailyData);
        const marketplaceByCurrency = MarketplaceByCurrency.load(`Seaport-${ZERO_ADDRESS.toHex()}`);
        assert.assertNull(marketplaceByCurrency);
        const marketplaceDailyDataByCurrency = MarketplaceDailyDataByCurrency.load(`Seaport-${ZERO_ADDRESS.toHex()}-0`);
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

        const collectionDailyDataByCurrency = CollectionDailyDataByCurrency.load(
          `${offerToken}-${ZERO_ADDRESS.toHex()}-0`
        );
        assert.assertNotNull(collectionDailyDataByCurrency);
        assert.stringEquals(
          collectionDailyDataByCurrency!.collectionByCurrency.toString(),
          `${offerToken}-${ZERO_ADDRESS.toHex()}`
        );
        assert.stringEquals(collectionDailyDataByCurrency!.currency.toHexString(), ZERO_ADDRESS.toHex());
        assert.bigIntEquals(collectionDailyDataByCurrency!.date, ZERO_BI);
        assert.stringEquals(collectionDailyDataByCurrency!.volume.toString(), transactionVolume);

        assert.i32Equals(collectionDailyDataByCurrency!.transactions.length, 1);
        assert.stringEquals(
          collectionDailyDataByCurrency!.transactions[0],
          `${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`
        );
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

        assert.i32Equals(aggregator!.byCurrency.length, 1);
        assert.stringEquals(aggregator!.byCurrency[0], ZERO_ADDRESS.toHex());
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

        assert.i32Equals(aggregatorDailyData!.byCurrency.length, 1);
        assert.stringEquals(aggregatorDailyData!.byCurrency[0], `${ZERO_ADDRESS.toHex()}-0`);
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
        assert.stringEquals(aggregatorByCurrency!.aggregator, "LooksRareAggregator");
      });

      test("updates AggregatorDailyDataByCurrency", () => {
        const event = createMockOrderFulfilledEvent();
        handleOrderFulfilled(event);

        const aggregatorDailyDataByCurrency = AggregatorDailyDataByCurrency.load(`${ZERO_ADDRESS.toHex()}-0`);
        assert.assertNotNull(aggregatorDailyDataByCurrency);
        assert.stringEquals(aggregatorDailyDataByCurrency!.currency.toHexString(), ZERO_ADDRESS.toHex());
        assert.bigIntEquals(aggregatorDailyDataByCurrency!.date, ZERO_BI);
        assert.stringEquals(aggregatorDailyDataByCurrency!.volume.toString(), transactionVolume);
        assert.bigIntEquals(aggregatorDailyDataByCurrency!.users, ONE_BI);
        assert.bigIntEquals(aggregatorDailyDataByCurrency!.collections, ONE_BI);
        assert.stringEquals(aggregatorDailyDataByCurrency!.aggregatorByCurrency, ZERO_ADDRESS.toHex());

        assert.i32Equals(aggregatorDailyDataByCurrency!.transactions.length, 1);
        assert.stringEquals(
          aggregatorDailyDataByCurrency!.transactions[0],
          `${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`
        );
      });

      test("updates Marketplace", () => {
        const event = createMockOrderFulfilledEvent();
        handleOrderFulfilled(event);

        const marketplace = Marketplace.load("Seaport");
        assert.assertNotNull(marketplace);
        assert.bigIntEquals(marketplace!.transactions, ONE_BI);
        assert.bigIntEquals(marketplace!.users, ONE_BI);
        assert.bigIntEquals(marketplace!.collections, ONE_BI);

        assert.i32Equals(marketplace!.dailyData.length, 1);
        assert.stringEquals(marketplace!.dailyData[0], "Seaport-0");
      });

      test("updates MarketplaceDailyData", () => {
        const event = createMockOrderFulfilledEvent();
        handleOrderFulfilled(event);

        const marketplaceDailyData = MarketplaceDailyData.load("Seaport-0");
        assert.assertNotNull(marketplaceDailyData);
        assert.bigIntEquals(marketplaceDailyData!.transactions, ONE_BI);
        assert.stringEquals(marketplaceDailyData!.marketplace, "Seaport");
        assert.bigIntEquals(marketplaceDailyData!.date, ZERO_BI);
        assert.bigIntEquals(marketplaceDailyData!.users, ONE_BI);
        assert.bigIntEquals(marketplaceDailyData!.collections, ONE_BI);
      });

      test("updates MarketplaceByCurrency", () => {
        const event = createMockOrderFulfilledEvent();
        handleOrderFulfilled(event);

        const marketplaceByCurrency = MarketplaceByCurrency.load(`Seaport-${ZERO_ADDRESS.toHex()}`);
        assert.assertNotNull(marketplaceByCurrency);
        assert.stringEquals(marketplaceByCurrency!.currency.toHexString(), ZERO_ADDRESS.toHex());
        assert.bigIntEquals(marketplaceByCurrency!.transactions, ONE_BI);
        assert.stringEquals(marketplaceByCurrency!.volume.toString(), transactionVolume);
        assert.bigIntEquals(marketplaceByCurrency!.users, ONE_BI);
        assert.bigIntEquals(marketplaceByCurrency!.collections, ONE_BI);

        assert.i32Equals(marketplaceByCurrency!.dailyData.length, 1);
        assert.stringEquals(marketplaceByCurrency!.dailyData[0], `Seaport-${ZERO_ADDRESS.toHex()}-0`);
      });

      test("updates MarketplaceDailyDataByCurrency", () => {
        const event = createMockOrderFulfilledEvent();
        handleOrderFulfilled(event);

        const marketplaceDailyDataByCurrency = MarketplaceDailyDataByCurrency.load(`Seaport-${ZERO_ADDRESS.toHex()}-0`);
        assert.assertNotNull(marketplaceDailyDataByCurrency);
        assert.stringEquals(marketplaceDailyDataByCurrency!.currency.toHexString(), ZERO_ADDRESS.toHex());
        assert.stringEquals(marketplaceDailyDataByCurrency!.marketplaceByCurrency, `Seaport-${ZERO_ADDRESS.toHex()}`);
        assert.bigIntEquals(marketplaceDailyDataByCurrency!.date, ZERO_BI);
        assert.stringEquals(marketplaceDailyDataByCurrency!.volume.toString(), transactionVolume);
        assert.bigIntEquals(marketplaceDailyDataByCurrency!.users, ONE_BI);
        assert.bigIntEquals(marketplaceDailyDataByCurrency!.collections, ONE_BI);

        assert.i32Equals(marketplaceDailyDataByCurrency!.transactions.length, 1);
        assert.stringEquals(
          marketplaceDailyDataByCurrency!.transactions[0],
          `${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`
        );
      });

      test("updates User", () => {
        const event = createMockOrderFulfilledEvent();
        handleOrderFulfilled(event);

        const user = User.load(Address.fromString(originator).toHexString());
        assert.assertNotNull(user);
        assert.bigIntEquals(user!.transactions, ONE_BI);

        assert.i32Equals(user!.dailyData.length, 1);
        assert.stringEquals(user!.dailyData[0], `${Address.fromString(originator).toHexString()}-0`);

        assert.i32Equals(user!.byCurrency.length, 1);
        assert.stringEquals(
          user!.byCurrency[0],
          `${Address.fromString(originator).toHexString()}-${ZERO_ADDRESS.toHex()}`
        );
      });

      test("updates UserDailyData", () => {
        const event = createMockOrderFulfilledEvent();
        handleOrderFulfilled(event);

        const userDailyData = UserDailyData.load(`${Address.fromString(originator).toHexString()}-0`);
        assert.assertNotNull(userDailyData);
        assert.bigIntEquals(userDailyData!.transactions, ONE_BI);
        assert.stringEquals(userDailyData!.user, Address.fromString(originator).toHexString());
        assert.bigIntEquals(userDailyData!.date, ZERO_BI);

        assert.i32Equals(userDailyData!.byCurrency.length, 1);
        assert.stringEquals(
          userDailyData!.byCurrency[0],
          `${Address.fromString(originator).toHexString()}-${ZERO_ADDRESS.toHex()}-0`
        );
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
        assert.stringEquals(
          userDailyDataByCurrency!.userByCurrency,
          `${Address.fromString(originator).toHexString()}-${ZERO_ADDRESS.toHex()}`
        );
        assert.bigIntEquals(userDailyDataByCurrency!.date, ZERO_BI);
        assert.stringEquals(userDailyDataByCurrency!.volume.toString(), transactionVolume);

        assert.i32Equals(userDailyDataByCurrency!.transactions.length, 1);
        assert.stringEquals(
          userDailyDataByCurrency!.transactions[0],
          `${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`
        );
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
        assert.stringEquals(transaction!.buyer, originator);
        assert.stringEquals(transaction!.seller.toHexString(), offerer);
        assert.stringEquals(transaction!.aggregatorDailyDataByCurrency, `${ZERO_ADDRESS.toHex()}-0`);
        assert.stringEquals(transaction!.collectionDailyDataByCurrency, `${offerToken}-${ZERO_ADDRESS.toHex()}-0`);
        assert.stringEquals(transaction!.marketplaceDailyDataByCurrency, `Seaport-${ZERO_ADDRESS.toHex()}-0`);
        assert.stringEquals(
          transaction!.userDailyDataByCurrency,
          `${Address.fromString(originator).toHexString()}-${ZERO_ADDRESS.toHex()}-0`
        );
      });

      test("does nothing if offer tokens are not the same", () => {
        const event = createMockOrderFulfilledEvent(
          [0, 0, 0],
          [ZERO_ADDRESS.toHex(), ZERO_ADDRESS.toHex(), ZERO_ADDRESS.toHex()],
          [2, 2],
          ["0x60bb1e2aa1c9acafb4d34f71585d7e959f387769", ZERO_ADDRESS.toHex()],
          [1333, 1334],
          [1, 1]
        );
        handleOrderFulfilled(event);

        assertNothingHappened(event);
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
    });
  });

  describe("LooksRareV1", () => {
    const originator = "0x000000000000000000000000000000000000dead";
    const orderHash = "00ed94ffdbe019f354bd2ec49557fb3d9fafe4929c06bfbec00c05ac82902a8a";
    const orderNonce = 70;
    const taker = "0x9E69b59b8d2A094CB1117f92Ff7DCf51Ed467B41";
    const maker = "0x1317ecFFFE454f7f5b8F8D1B1e0951d6c55E9615";
    const strategy = "0x579af6FD30BF83a5Ac0D636bc619f98DBdeb930c";
    const currency = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const collectionAddress = "0x34d85c9CDeB23FA97cb08333b511ac86E1C4E258";
    const tokenId = 69174;
    const price = 1278000000000000000;
    const transactionVolume = "1278000000000000000";

    // https://etherscan.io/tx/0x1e02a428f82dc81fa1d86db251167343181eace2631ed14c43eed3474bcd6dac
    const createMockTakerBidEvent = (): TakerBid => {
      const event = createTakerBidEvent(
        orderHash,
        orderNonce,
        taker,
        maker,
        strategy,
        currency,
        collectionAddress,
        tokenId,
        price
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

    afterEach(() => {
      clearStore();
    });

    // test("updates Collection", () => {
    //   const event = createMockOrderFulfilledEvent();
    //   handleOrderFulfilled(event);
    //   const collection = Collection.load(offerToken);
    //   assert.assertNotNull(collection);
    //   assert.bigIntEquals(collection!.transactions, ONE_BI);

    //   assert.i32Equals(collection!.dailyData.length, 1);
    //   assert.stringEquals(collection!.dailyData[0], `${offerToken}-0`);
    // });

    // test("updates CollectionByCurrency", () => {
    //   const event = createMockOrderFulfilledEvent();
    //   handleOrderFulfilled(event);

    //   const collectionByCurrency = CollectionByCurrency.load(`${offerToken}-${ZERO_ADDRESS.toHex()}`);
    //   assert.assertNotNull(collectionByCurrency);
    //   assert.stringEquals(collectionByCurrency!.currency.toHexString(), ZERO_ADDRESS.toHex());
    //   assert.bigIntEquals(collectionByCurrency!.transactions, ONE_BI);
    //   assert.stringEquals(collectionByCurrency!.volume.toString(), transactionVolume);

    //   assert.i32Equals(collectionByCurrency!.dailyData.length, 1);
    //   assert.stringEquals(collectionByCurrency!.dailyData[0], `${offerToken}-${ZERO_ADDRESS.toHex()}-0`);
    // });

    // test("updates CollectionDailyData", () => {
    //   const event = createMockOrderFulfilledEvent();
    //   handleOrderFulfilled(event);

    //   const collectionDailyData = CollectionDailyData.load(`${offerToken}-0`);
    //   assert.assertNotNull(collectionDailyData);
    //   assert.stringEquals(collectionDailyData!.collection.toString(), offerToken);
    //   assert.bigIntEquals(collectionDailyData!.transactions, ONE_BI);
    //   assert.bigIntEquals(collectionDailyData!.date, ZERO_BI);
    // });

    // test("updates CollectionDailyDataByCurrency", () => {
    //   const event = createMockOrderFulfilledEvent();
    //   handleOrderFulfilled(event);

    //   const collectionDailyDataByCurrency = CollectionDailyDataByCurrency.load(
    //     `${offerToken}-${ZERO_ADDRESS.toHex()}-0`
    //   );
    //   assert.assertNotNull(collectionDailyDataByCurrency);
    //   assert.stringEquals(
    //     collectionDailyDataByCurrency!.collectionByCurrency.toString(),
    //     `${offerToken}-${ZERO_ADDRESS.toHex()}`
    //   );
    //   assert.stringEquals(collectionDailyDataByCurrency!.currency.toHexString(), ZERO_ADDRESS.toHex());
    //   assert.bigIntEquals(collectionDailyDataByCurrency!.date, ZERO_BI);
    //   assert.stringEquals(collectionDailyDataByCurrency!.volume.toString(), transactionVolume);

    //   assert.i32Equals(collectionDailyDataByCurrency!.transactions.length, 1);
    //   assert.stringEquals(
    //     collectionDailyDataByCurrency!.transactions[0],
    //     `${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`
    //   );
    // });

    test("updates Aggregator", () => {
      const event = createMockTakerBidEvent();
      handleTakerBid(event);

      const aggregator = Aggregator.load("LooksRareAggregator");
      assert.assertNotNull(aggregator);
      assert.bigIntEquals(aggregator!.transactions, ONE_BI);
      // assert.bigIntEquals(aggregator!.users, ONE_BI);
      // assert.bigIntEquals(aggregator!.collections, ONE_BI);

      assert.i32Equals(aggregator!.dailyData.length, 1);
      assert.stringEquals(aggregator!.dailyData[0], "0");

      assert.i32Equals(aggregator!.byCurrency.length, 1);
      assert.stringEquals(aggregator!.byCurrency[0], Address.fromString(currency).toHexString());
    });

    test("updates AggregatorDailyData", () => {
      const event = createMockTakerBidEvent();
      handleTakerBid(event);

      const aggregatorDailyData = AggregatorDailyData.load("0");
      assert.assertNotNull(aggregatorDailyData);
      assert.bigIntEquals(aggregatorDailyData!.transactions, ONE_BI);
      assert.bigIntEquals(aggregatorDailyData!.date, ZERO_BI);
      // assert.bigIntEquals(aggregatorDailyData!.users, ONE_BI);
      // assert.bigIntEquals(aggregatorDailyData!.collections, ONE_BI);

      assert.i32Equals(aggregatorDailyData!.byCurrency.length, 1);
      assert.stringEquals(aggregatorDailyData!.byCurrency[0], `${Address.fromString(currency).toHexString()}-0`);
    });

    test("updates AggregatorByCurrency", () => {
      const event = createMockTakerBidEvent();
      handleTakerBid(event);

      const aggregatorByCurrency = AggregatorByCurrency.load(Address.fromString(currency).toHexString());
      assert.assertNotNull(aggregatorByCurrency);
      assert.stringEquals(aggregatorByCurrency!.currency.toHexString(), Address.fromString(currency).toHexString());
      assert.bigIntEquals(aggregatorByCurrency!.transactions, ONE_BI);
      assert.stringEquals(aggregatorByCurrency!.volume.toString(), transactionVolume);
      // assert.bigIntEquals(aggregatorByCurrency!.users, ONE_BI);
      // assert.bigIntEquals(aggregatorByCurrency!.collections, ONE_BI);
      assert.stringEquals(aggregatorByCurrency!.aggregator, "LooksRareAggregator");
    });

    test("updates AggregatorDailyDataByCurrency", () => {
      const event = createMockTakerBidEvent();
      handleTakerBid(event);

      const aggregatorDailyDataByCurrency = AggregatorDailyDataByCurrency.load(
        `${Address.fromString(currency).toHexString()}-0`
      );
      assert.assertNotNull(aggregatorDailyDataByCurrency);
      assert.stringEquals(
        aggregatorDailyDataByCurrency!.currency.toHexString(),
        Address.fromString(currency).toHexString()
      );
      assert.bigIntEquals(aggregatorDailyDataByCurrency!.date, ZERO_BI);
      assert.stringEquals(aggregatorDailyDataByCurrency!.volume.toString(), transactionVolume);
      // assert.bigIntEquals(aggregatorDailyDataByCurrency!.users, ONE_BI);
      // assert.bigIntEquals(aggregatorDailyDataByCurrency!.collections, ONE_BI);
      assert.stringEquals(
        aggregatorDailyDataByCurrency!.aggregatorByCurrency,
        Address.fromString(currency).toHexString()
      );

      // assert.i32Equals(aggregatorDailyDataByCurrency!.transactions.length, 1);
      // assert.stringEquals(
      //   aggregatorDailyDataByCurrency!.transactions[0],
      //   `${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`
      // );
    });

    test("updates Marketplace", () => {
      const event = createMockTakerBidEvent();
      handleTakerBid(event);

      const marketplace = Marketplace.load("LooksRareV1");
      assert.assertNotNull(marketplace);
      assert.bigIntEquals(marketplace!.transactions, ONE_BI);
      // assert.bigIntEquals(marketplace!.users, ONE_BI);
      // assert.bigIntEquals(marketplace!.collections, ONE_BI);

      // assert.i32Equals(marketplace!.dailyData.length, 1);
      // assert.stringEquals(marketplace!.dailyData[0], "LooksRareV1-0");
    });

    test("updates MarketplaceDailyData", () => {
      const event = createMockTakerBidEvent();
      handleTakerBid(event);

      const marketplaceDailyData = MarketplaceDailyData.load("LooksRareV1-0");
      assert.assertNotNull(marketplaceDailyData);
      assert.bigIntEquals(marketplaceDailyData!.transactions, ONE_BI);
      assert.stringEquals(marketplaceDailyData!.marketplace, "LooksRareV1");
      assert.bigIntEquals(marketplaceDailyData!.date, ZERO_BI);
      // assert.bigIntEquals(marketplaceDailyData!.users, ONE_BI);
      // assert.bigIntEquals(marketplaceDailyData!.collections, ONE_BI);
    });

    test("updates MarketplaceByCurrency", () => {
      const event = createMockTakerBidEvent();
      handleTakerBid(event);

      const marketplaceByCurrency = MarketplaceByCurrency.load(
        `LooksRareV1-${Address.fromString(currency).toHexString()}`
      );
      assert.assertNotNull(marketplaceByCurrency);
      assert.stringEquals(marketplaceByCurrency!.currency.toHexString(), Address.fromString(currency).toHexString());
      assert.bigIntEquals(marketplaceByCurrency!.transactions, ONE_BI);
      assert.stringEquals(marketplaceByCurrency!.volume.toString(), transactionVolume);
      // assert.bigIntEquals(marketplaceByCurrency!.users, ONE_BI);
      // assert.bigIntEquals(marketplaceByCurrency!.collections, ONE_BI);

      // assert.i32Equals(marketplaceByCurrency!.dailyData.length, 1);
      // assert.stringEquals(marketplaceByCurrency!.dailyData[0], `Seaport-${ZERO_ADDRESS.toHex()}-0`);
    });

    test("updates MarketplaceDailyDataByCurrency", () => {
      const event = createMockTakerBidEvent();
      handleTakerBid(event);

      const marketplaceDailyDataByCurrency = MarketplaceDailyDataByCurrency.load(
        `LooksRareV1-${Address.fromString(currency).toHexString()}-0`
      );
      assert.assertNotNull(marketplaceDailyDataByCurrency);
      assert.stringEquals(
        marketplaceDailyDataByCurrency!.currency.toHexString(),
        Address.fromString(currency).toHexString()
      );
      assert.stringEquals(
        marketplaceDailyDataByCurrency!.marketplaceByCurrency,
        `LooksRareV1-${Address.fromString(currency).toHexString()}`
      );
      assert.bigIntEquals(marketplaceDailyDataByCurrency!.date, ZERO_BI);
      assert.stringEquals(marketplaceDailyDataByCurrency!.volume.toString(), transactionVolume);
      // assert.bigIntEquals(marketplaceDailyDataByCurrency!.users, ONE_BI);
      // assert.bigIntEquals(marketplaceDailyDataByCurrency!.collections, ONE_BI);

      // assert.i32Equals(marketplaceDailyDataByCurrency!.transactions.length, 1);
      // assert.stringEquals(
      //   marketplaceDailyDataByCurrency!.transactions[0],
      //   `${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`
      // );
    });

    test("updates User", () => {
      const event = createMockTakerBidEvent();
      handleTakerBid(event);

      const user = User.load(Address.fromString(originator).toHexString());
      assert.assertNotNull(user);
      assert.bigIntEquals(user!.transactions, ONE_BI);

      // assert.i32Equals(user!.dailyData.length, 1);
      // assert.stringEquals(user!.dailyData[0], `${Address.fromString(originator).toHexString()}-0`);

      // assert.i32Equals(user!.byCurrency.length, 1);
      // assert.stringEquals(
      //   user!.byCurrency[0],
      //   `${Address.fromString(originator).toHexString()}-${ZERO_ADDRESS.toHex()}`
      // );
    });

    // test("updates UserDailyData", () => {
    //   const event = createMockOrderFulfilledEvent();
    //   handleOrderFulfilled(event);

    //   const userDailyData = UserDailyData.load(`${Address.fromString(originator).toHexString()}-0`);
    //   assert.assertNotNull(userDailyData);
    //   assert.bigIntEquals(userDailyData!.transactions, ONE_BI);
    //   assert.stringEquals(userDailyData!.user, Address.fromString(originator).toHexString());
    //   assert.bigIntEquals(userDailyData!.date, ZERO_BI);

    //   assert.i32Equals(userDailyData!.byCurrency.length, 1);
    //   assert.stringEquals(
    //     userDailyData!.byCurrency[0],
    //     `${Address.fromString(originator).toHexString()}-${ZERO_ADDRESS.toHex()}-0`
    //   );
    // });

    // test("updates UserByCurrency", () => {
    //   const event = createMockOrderFulfilledEvent();
    //   handleOrderFulfilled(event);

    //   const userByCurrency = UserByCurrency.load(
    //     `${Address.fromString(originator).toHexString()}-${ZERO_ADDRESS.toHex()}`
    //   );
    //   assert.assertNotNull(userByCurrency);
    //   assert.stringEquals(userByCurrency!.currency.toHexString(), ZERO_ADDRESS.toHex());
    //   assert.bigIntEquals(userByCurrency!.transactions, ONE_BI);
    //   assert.stringEquals(userByCurrency!.volume.toString(), transactionVolume);

    //   assert.i32Equals(userByCurrency!.dailyData.length, 1);
    //   assert.stringEquals(
    //     userByCurrency!.dailyData[0],
    //     `${Address.fromString(originator).toHexString()}-${ZERO_ADDRESS.toHex()}-0`
    //   );
    // });

    // test("updates UserDailyDataByCurrency", () => {
    //   const event = createMockOrderFulfilledEvent();
    //   handleOrderFulfilled(event);

    //   const userDailyDataByCurrency = UserDailyDataByCurrency.load(
    //     `${Address.fromString(originator).toHexString()}-${ZERO_ADDRESS.toHex()}-0`
    //   );
    //   assert.assertNotNull(userDailyDataByCurrency);
    //   assert.stringEquals(userDailyDataByCurrency!.currency.toHexString(), ZERO_ADDRESS.toHex());
    //   assert.stringEquals(
    //     userDailyDataByCurrency!.userByCurrency,
    //     `${Address.fromString(originator).toHexString()}-${ZERO_ADDRESS.toHex()}`
    //   );
    //   assert.bigIntEquals(userDailyDataByCurrency!.date, ZERO_BI);
    //   assert.stringEquals(userDailyDataByCurrency!.volume.toString(), transactionVolume);

    //   assert.i32Equals(userDailyDataByCurrency!.transactions.length, 1);
    //   assert.stringEquals(
    //     userDailyDataByCurrency!.transactions[0],
    //     `${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`
    //   );
    // });

    // test("updates Transaction", () => {
    //   const event = createMockOrderFulfilledEvent();
    //   handleOrderFulfilled(event);

    //   const transaction = Transaction.load(`${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`);
    //   assert.assertNotNull(transaction);
    //   assert.stringEquals(transaction!.transactionHash, event.transaction.hash.toHexString());
    //   assert.stringEquals(transaction!.logIndex.toString(), event.logIndex.toString());
    //   assert.bigIntEquals(transaction!.timestamp, event.block.timestamp);
    //   assert.bigIntEquals(transaction!.blockNumber, event.block.number);
    //   assert.booleanEquals(transaction!.isBundle, false);
    //   assert.stringEquals(transaction!.collection, offerToken);
    //   assert.bigIntEquals(transaction!.tokenId, BigInt.fromI32(1333));
    //   assert.stringEquals(transaction!.price.toString(), transactionVolume);
    //   assert.stringEquals(transaction!.currency.toHexString(), ZERO_ADDRESS.toHex());
    //   assert.bigIntEquals(transaction!.amount, ONE_BI);
    //   assert.stringEquals(transaction!.buyer, originator);
    //   assert.stringEquals(transaction!.seller.toHexString(), offerer);
    //   assert.stringEquals(transaction!.aggregatorDailyDataByCurrency, `${ZERO_ADDRESS.toHex()}-0`);
    //   assert.stringEquals(transaction!.collectionDailyDataByCurrency, `${offerToken}-${ZERO_ADDRESS.toHex()}-0`);
    //   assert.stringEquals(transaction!.marketplaceDailyDataByCurrency, `Seaport-${ZERO_ADDRESS.toHex()}-0`);
    //   assert.stringEquals(
    //     transaction!.userDailyDataByCurrency,
    //     `${Address.fromString(originator).toHexString()}-${ZERO_ADDRESS.toHex()}-0`
    //   );
    // });

    // test("does nothing if offer tokens are not the same", () => {
    //   const event = createMockOrderFulfilledEvent(
    //     [0, 0, 0],
    //     [ZERO_ADDRESS.toHex(), ZERO_ADDRESS.toHex(), ZERO_ADDRESS.toHex()],
    //     [2, 2],
    //     ["0x60bb1e2aa1c9acafb4d34f71585d7e959f387769", ZERO_ADDRESS.toHex()],
    //     [1333, 1334],
    //     [1, 1]
    //   );
    //   handleOrderFulfilled(event);

    //   assertNothingHappened(event);
    // });

    // test("does nothing if consideration token is not ETH or ERC20", () => {
    //   const event = createMockOrderFulfilledEvent([2, 2, 2]);
    //   handleOrderFulfilled(event);

    //   assertNothingHappened(event);
    // });

    // test("does nothing if consideration tokens are not the same", () => {
    //   const event = createMockOrderFulfilledEvent(
    //     [0, 0, 0],
    //     [ZERO_ADDRESS.toHex(), ZERO_ADDRESS.toHex(), "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"]
    //   );
    //   handleOrderFulfilled(event);

    //   assertNothingHappened(event);
    // });

    // test("does nothing if consideration item types are not the same", () => {
    //   const event = createMockOrderFulfilledEvent(
    //     [0, 0, 1],
    //     [ZERO_ADDRESS.toHex(), ZERO_ADDRESS.toHex(), ZERO_ADDRESS.toHex()]
    //   );
    //   handleOrderFulfilled(event);

    //   assertNothingHappened(event);
    // });
  });
});
