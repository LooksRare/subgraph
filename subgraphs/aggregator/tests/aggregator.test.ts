/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { afterEach, assert, clearStore, describe, test } from "matchstick-as/assembly/index";
import { createOrderFulfilledEvent, createTakerBidEvent, newLog } from "./helpers/utils";
import {
  expectAggregatorByCurrencyUpdated,
  expectAggregatorDailyDataByCurrencyUpdated,
  expectAggregatorDailyDataUpdated,
  expectAggregatorUpdated,
  expectCollectionByCurrencyUpdated,
  expectCollectionDailyDataByCurrencyUpdated,
  expectCollectionDailyDataUpdated,
  expectCollectionUpdated,
  expectMarketplaceByCurrencyUpdated,
  expectMarketplaceDailyDataByCurrencyUpdated,
  expectMarketplaceDailyDataUpdated,
  expectMarketplaceUpdated,
  expectNothingHappened,
  expectUserByCurrencyUpdated,
  expectUserDailyDataByCurrencyUpdated,
  expectUserDailyDataUpdated,
  expectUserUpdated,
  originatorPadded,
} from "./helpers/sharedTests";
import { handleOrderFulfilled } from "../src/Seaport/index";
import { Transaction } from "../generated/schema";
import {
  LOOKSRARE_AGGREGATOR,
  LOOKSRARE_AGGREGATOR_SWEEP_EVENT_TOPIC,
  ONE_BI,
  ZERO_ADDRESS,
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
          newLog(
            LOOKSRARE_AGGREGATOR,
            [Bytes.fromHexString(LOOKSRARE_AGGREGATOR_SWEEP_EVENT_TOPIC), Bytes.fromHexString(originatorPadded)],
            event.transactionLogIndex.minus(BigInt.fromI32(1))
          ),
          event!.receipt!.logs[0],
        ];

        return event;
      };

      const getTransactionId = (event: OrderFulfilled): string =>
        `${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`;

      afterEach(() => {
        clearStore();
      });

      test("updates Collection", () => {
        const event = createMockOrderFulfilledEvent();
        handleOrderFulfilled(event);
        expectCollectionUpdated(offerToken);
      });

      test("updates CollectionByCurrency", () => {
        const event = createMockOrderFulfilledEvent();
        handleOrderFulfilled(event);
        expectCollectionByCurrencyUpdated(offerToken, ZERO_ADDRESS.toHex(), transactionVolume);
      });

      test("updates CollectionDailyData", () => {
        const event = createMockOrderFulfilledEvent();
        handleOrderFulfilled(event);
        expectCollectionDailyDataUpdated(offerToken);
      });

      test("updates CollectionDailyDataByCurrency", () => {
        const event = createMockOrderFulfilledEvent();
        handleOrderFulfilled(event);
        expectCollectionDailyDataByCurrencyUpdated(
          offerToken,
          ZERO_ADDRESS.toHex(),
          transactionVolume,
          getTransactionId(event)
        );
      });

      test("updates Aggregator", () => {
        const event = createMockOrderFulfilledEvent();
        handleOrderFulfilled(event);
        expectAggregatorUpdated(ZERO_ADDRESS.toHex());
      });

      test("updates AggregatorDailyData", () => {
        const event = createMockOrderFulfilledEvent();
        handleOrderFulfilled(event);
        expectAggregatorDailyDataUpdated(ZERO_ADDRESS.toHex());
      });

      test("updates AggregatorByCurrency", () => {
        const event = createMockOrderFulfilledEvent();
        handleOrderFulfilled(event);
        expectAggregatorByCurrencyUpdated(ZERO_ADDRESS.toHex(), transactionVolume);
      });

      test("updates AggregatorDailyDataByCurrency", () => {
        const event = createMockOrderFulfilledEvent();
        handleOrderFulfilled(event);
        expectAggregatorDailyDataByCurrencyUpdated(ZERO_ADDRESS.toHex(), transactionVolume, getTransactionId(event));
      });

      test("updates Marketplace", () => {
        const event = createMockOrderFulfilledEvent();
        handleOrderFulfilled(event);
        expectMarketplaceUpdated("Seaport");
      });

      test("updates MarketplaceDailyData", () => {
        const event = createMockOrderFulfilledEvent();
        handleOrderFulfilled(event);
        expectMarketplaceDailyDataUpdated("Seaport");
      });

      test("updates MarketplaceByCurrency", () => {
        const event = createMockOrderFulfilledEvent();
        handleOrderFulfilled(event);
        expectMarketplaceByCurrencyUpdated("Seaport", ZERO_ADDRESS.toHex(), transactionVolume);
      });

      test("updates MarketplaceDailyDataByCurrency", () => {
        const event = createMockOrderFulfilledEvent();
        handleOrderFulfilled(event);
        expectMarketplaceDailyDataByCurrencyUpdated(
          "Seaport",
          ZERO_ADDRESS.toHex(),
          transactionVolume,
          getTransactionId(event)
        );
      });

      test("updates User", () => {
        const event = createMockOrderFulfilledEvent();
        handleOrderFulfilled(event);
        expectUserUpdated(ZERO_ADDRESS.toHex());
      });

      test("updates UserDailyData", () => {
        const event = createMockOrderFulfilledEvent();
        handleOrderFulfilled(event);
        expectUserDailyDataUpdated(ZERO_ADDRESS.toHex());
      });

      test("updates UserByCurrency", () => {
        const event = createMockOrderFulfilledEvent();
        handleOrderFulfilled(event);
        expectUserByCurrencyUpdated(ZERO_ADDRESS.toHex(), transactionVolume);
      });

      test("updates UserDailyDataByCurrency", () => {
        const event = createMockOrderFulfilledEvent();
        handleOrderFulfilled(event);
        expectUserDailyDataByCurrencyUpdated(ZERO_ADDRESS.toHex(), transactionVolume, getTransactionId(event));
      });

      test("updates Transaction", () => {
        const event = createMockOrderFulfilledEvent();
        handleOrderFulfilled(event);

        const transaction = Transaction.load(getTransactionId(event));
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
        assert.stringEquals(transaction!.userDailyDataByCurrency, `${originator}-${ZERO_ADDRESS.toHex()}-0`);
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
        expectNothingHappened("Seaport", offerToken, ZERO_ADDRESS.toHex(), getTransactionId(event));
      });

      test("does nothing if consideration token is not ETH or ERC20", () => {
        const event = createMockOrderFulfilledEvent([2, 2, 2]);
        handleOrderFulfilled(event);
        expectNothingHappened("Seaport", offerToken, ZERO_ADDRESS.toHex(), getTransactionId(event));
      });

      test("does nothing if consideration tokens are not the same", () => {
        const event = createMockOrderFulfilledEvent(
          [0, 0, 0],
          [ZERO_ADDRESS.toHex(), ZERO_ADDRESS.toHex(), "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"]
        );
        handleOrderFulfilled(event);
        expectNothingHappened("Seaport", offerToken, ZERO_ADDRESS.toHex(), getTransactionId(event));
      });

      test("does nothing if consideration item types are not the same", () => {
        const event = createMockOrderFulfilledEvent(
          [0, 0, 1],
          [ZERO_ADDRESS.toHex(), ZERO_ADDRESS.toHex(), ZERO_ADDRESS.toHex()]
        );
        handleOrderFulfilled(event);
        expectNothingHappened("Seaport", offerToken, ZERO_ADDRESS.toHex(), getTransactionId(event));
      });

      test("does nothing if no aggregator sweep event is found", () => {
        const event = createMockOrderFulfilledEvent();
        // matching contract address, but not topic0
        event!.receipt!.logs = [
          newLog(
            LOOKSRARE_AGGREGATOR,
            [
              // actual sweep topic + 1
              Bytes.fromHexString("0x807273efecfbeb7ae7d3a2189d1ed5a7db80074eed86e7d80b10bb925cd1db74"),
              Bytes.fromHexString(originatorPadded),
            ],
            event.transactionLogIndex.minus(BigInt.fromI32(1))
          ),
          event!.receipt!.logs[1],
        ];
        handleOrderFulfilled(event);
        // matching topic0, but not contract address
        event!.receipt!.logs = [
          newLog(
            Address.fromString("0x000000000000000000000000000000000000002a"),
            [Bytes.fromHexString(LOOKSRARE_AGGREGATOR_SWEEP_EVENT_TOPIC), Bytes.fromHexString(originatorPadded)],
            event.transactionLogIndex.minus(BigInt.fromI32(1))
          ),
          event!.receipt!.logs[1],
        ];
        handleOrderFulfilled(event);
        expectNothingHappened("Seaport", offerToken, ZERO_ADDRESS.toHex(), getTransactionId(event));
      });

      test("does not include trades whose log indexes are less than the aggregator sweep event's log index", () => {
        const event = createMockOrderFulfilledEvent();
        event!.receipt!.logs = [event!.receipt!.logs[1], event!.receipt!.logs[0]];
        event!.receipt!.logs[0].transactionLogIndex = BigInt.fromI32(1);
        event!.receipt!.logs[1].transactionLogIndex = BigInt.fromI32(2);
        handleOrderFulfilled(event);
        expectNothingHappened("Seaport", offerToken, ZERO_ADDRESS.toHex(), getTransactionId(event));
      });
    });
  });

  describe("LooksRareV1", () => {
    const originator = "0x000000000000000000000000000000000000dead";
    const orderHash = "00ed94ffdbe019f354bd2ec49557fb3d9fafe4929c06bfbec00c05ac82902a8a";
    const orderNonce = 70;
    const taker = "0x9e69b59b8d2a094cb1117f92ff7dcf51ed467b41";
    const maker = "0x1317ecfffe454f7f5b8f8d1b1e0951d6c55e9615";
    const strategy = "0x579af6FD30BF83a5Ac0D636bc619f98DBdeb930c";
    const currency = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    const collectionAddress = "0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258";
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
        newLog(
          LOOKSRARE_AGGREGATOR,
          [Bytes.fromHexString(LOOKSRARE_AGGREGATOR_SWEEP_EVENT_TOPIC), Bytes.fromHexString(originatorPadded)],
          event.transactionLogIndex.minus(BigInt.fromI32(1))
        ),
        event!.receipt!.logs[0],
      ];

      return event;
    };

    const getTransactionId = (event: TakerBid): string =>
      `${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`;

    afterEach(() => {
      clearStore();
    });

    test("updates Collection", () => {
      const event = createMockTakerBidEvent();
      handleTakerBid(event);
      expectCollectionUpdated(collectionAddress);
    });

    test("updates CollectionByCurrency", () => {
      const event = createMockTakerBidEvent();
      handleTakerBid(event);
      expectCollectionByCurrencyUpdated(collectionAddress, currency, transactionVolume);
    });

    test("updates CollectionDailyData", () => {
      const event = createMockTakerBidEvent();
      handleTakerBid(event);
      expectCollectionDailyDataUpdated(collectionAddress);
    });

    test("updates CollectionDailyDataByCurrency", () => {
      const event = createMockTakerBidEvent();
      handleTakerBid(event);
      expectCollectionDailyDataByCurrencyUpdated(
        collectionAddress,
        currency,
        transactionVolume,
        getTransactionId(event)
      );
    });

    test("updates Aggregator", () => {
      const event = createMockTakerBidEvent();
      handleTakerBid(event);
      expectAggregatorUpdated(currency);
    });

    test("updates AggregatorDailyData", () => {
      const event = createMockTakerBidEvent();
      handleTakerBid(event);
      expectAggregatorDailyDataUpdated(currency);
    });

    test("updates AggregatorByCurrency", () => {
      const event = createMockTakerBidEvent();
      handleTakerBid(event);
      expectAggregatorByCurrencyUpdated(currency, transactionVolume);
    });

    test("updates AggregatorDailyDataByCurrency", () => {
      const event = createMockTakerBidEvent();
      handleTakerBid(event);
      expectAggregatorDailyDataByCurrencyUpdated(currency, transactionVolume, getTransactionId(event));
    });

    test("updates Marketplace", () => {
      const event = createMockTakerBidEvent();
      handleTakerBid(event);
      expectMarketplaceUpdated("LooksRareV1");
    });

    test("updates MarketplaceDailyData", () => {
      const event = createMockTakerBidEvent();
      handleTakerBid(event);
      expectMarketplaceDailyDataUpdated("LooksRareV1");
    });

    test("updates MarketplaceByCurrency", () => {
      const event = createMockTakerBidEvent();
      handleTakerBid(event);
      expectMarketplaceByCurrencyUpdated("LooksRareV1", currency, transactionVolume);
    });

    test("updates MarketplaceDailyDataByCurrency", () => {
      const event = createMockTakerBidEvent();
      handleTakerBid(event);
      expectMarketplaceDailyDataByCurrencyUpdated("LooksRareV1", currency, transactionVolume, getTransactionId(event));
    });

    test("updates User", () => {
      const event = createMockTakerBidEvent();
      handleTakerBid(event);
      expectUserUpdated(currency);
    });

    test("updates UserDailyData", () => {
      const event = createMockTakerBidEvent();
      handleTakerBid(event);
      expectUserDailyDataUpdated(currency);
    });

    test("updates UserByCurrency", () => {
      const event = createMockTakerBidEvent();
      handleTakerBid(event);
      expectUserByCurrencyUpdated(currency, transactionVolume);
    });

    test("updates UserDailyDataByCurrency", () => {
      const event = createMockTakerBidEvent();
      handleTakerBid(event);
      expectUserDailyDataByCurrencyUpdated(currency, transactionVolume, getTransactionId(event));
    });

    test("updates Transaction", () => {
      const event = createMockTakerBidEvent();
      handleTakerBid(event);

      const transaction = Transaction.load(getTransactionId(event));
      assert.assertNotNull(transaction);
      assert.stringEquals(transaction!.transactionHash, event.transaction.hash.toHexString());
      assert.stringEquals(transaction!.logIndex.toString(), event.logIndex.toString());
      assert.bigIntEquals(transaction!.timestamp, event.block.timestamp);
      assert.bigIntEquals(transaction!.blockNumber, event.block.number);
      assert.booleanEquals(transaction!.isBundle, false);
      assert.stringEquals(transaction!.collection, collectionAddress);
      assert.bigIntEquals(transaction!.tokenId, BigInt.fromI32(69174));
      assert.stringEquals(transaction!.price.toString(), transactionVolume);
      assert.stringEquals(transaction!.currency.toHexString(), currency);
      assert.bigIntEquals(transaction!.amount, ONE_BI);
      assert.stringEquals(transaction!.buyer, originator);
      assert.stringEquals(transaction!.seller.toHexString(), maker);
      assert.stringEquals(transaction!.aggregatorDailyDataByCurrency, `${currency}-0`);
      assert.stringEquals(transaction!.collectionDailyDataByCurrency, `${collectionAddress}-${currency}-0`);
      assert.stringEquals(transaction!.marketplaceDailyDataByCurrency, `LooksRareV1-${currency}-0`);
      assert.stringEquals(transaction!.userDailyDataByCurrency, `${originator}-${currency}-0`);
    });

    test("does nothing if no aggregator sweep event is found", () => {
      const event = createMockTakerBidEvent();
      // matching contract address, but not topic0
      event!.receipt!.logs = [
        newLog(
          LOOKSRARE_AGGREGATOR,
          [
            // actual sweep topic + 1
            Bytes.fromHexString("0x807273efecfbeb7ae7d3a2189d1ed5a7db80074eed86e7d80b10bb925cd1db74"),
            Bytes.fromHexString(originatorPadded),
          ],
          event.transactionLogIndex.minus(BigInt.fromI32(1))
        ),
        event!.receipt!.logs[1],
      ];
      handleTakerBid(event);
      // matching topic0, but not contract address
      event!.receipt!.logs = [
        newLog(
          Address.fromString("0x000000000000000000000000000000000000002a"),
          [Bytes.fromHexString(LOOKSRARE_AGGREGATOR_SWEEP_EVENT_TOPIC), Bytes.fromHexString(originatorPadded)],
          event.transactionLogIndex.minus(BigInt.fromI32(1))
        ),
        event!.receipt!.logs[1],
      ];
      handleTakerBid(event);
      expectNothingHappened("LooksRareV1", collectionAddress, currency, getTransactionId(event));
    });

    test("does not include trades whose log indexes are less than the aggregator sweep event's log index", () => {
      const event = createMockTakerBidEvent();
      event!.receipt!.logs = [event!.receipt!.logs[1], event!.receipt!.logs[0]];
      event!.receipt!.logs[0].transactionLogIndex = BigInt.fromI32(1);
      event!.receipt!.logs[1].transactionLogIndex = BigInt.fromI32(2);
      handleTakerBid(event);
      expectNothingHappened("LooksRareV1", collectionAddress, currency, getTransactionId(event));
    });
  });
});
