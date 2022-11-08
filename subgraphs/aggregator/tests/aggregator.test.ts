/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { assert, describe, test } from "matchstick-as/assembly/index";
import { createOrderFulfilledEvent, newLog } from "./helpers/utils";
import { handleOrderFulfilled } from "../src/index";
import {
  Aggregator,
  AggregatorByCurrency,
  AggregatorDailyData,
  AggregatorDailyDataByCurrency,
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
  ZERO_ADDRESS,
  ZERO_BI,
} from "../../../helpers/constants";

describe("handleOrderFulfilled()", () => {
  // https://etherscan.io/tx/0x954e07b648c7b6ceba98bddf79263b5b71f9e09da4d5bc7c10ca15819ae9f966
  test("OrderFulfilled event updates all entities", () => {
    const originator = "0x000000000000000000000000000000000000dead";
    const offerer = "0x61d7c6572922a1ecff8fce8b88920f7eaaab1dae";
    const recipient = "0xac5484132f22d4551d10ac7b6eaf8356b4beaaec";

    const offerToken = "0x60bb1e2aa1c9acafb4d34f71585d7e959f387769";

    const event = createOrderFulfilledEvent(
      "0xaf4f0380b83f5350ec3c902702ff15b1f3b216080ae3bb82dfec201f8d31c188", // orderHash
      offerer,
      "0x004c00500000ad104d7dbd00e3ae0a5c00560c00", // zone
      recipient,
      2, // offer item type
      offerToken, // offer token
      1333, // offer identifier
      1, // offer amount
      0, // consideration item type
      ZERO_ADDRESS.toHex(), // consideration token
      0, // consideration identifier
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

    handleOrderFulfilled(event);

    const transactionVolume = "15296000000000000000";

    const collection = Collection.load(`${offerToken}-${ZERO_ADDRESS.toHex()}`);
    assert.assertNotNull(collection);
    assert.stringEquals(collection!.currency.toHexString(), ZERO_ADDRESS.toHex());
    assert.bigIntEquals(collection!.transactions, ONE_BI);
    assert.stringEquals(collection!.volume.toString(), transactionVolume);

    const collectionDailyDataID = `${offerToken}-${ZERO_ADDRESS.toHex()}-0`;

    assert.i32Equals(collection!.dailyData.length, 1);
    assert.stringEquals(collection!.dailyData[0], collectionDailyDataID);

    const collectionDailyData = CollectionDailyData.load(collectionDailyDataID);
    assert.assertNotNull(collectionDailyData);
    assert.stringEquals(collectionDailyData!.collection.toString(), collection!.id);
    assert.stringEquals(collectionDailyData!.currency.toHexString(), ZERO_ADDRESS.toHex());
    assert.bigIntEquals(collectionDailyData!.transactions, ONE_BI);
    assert.bigIntEquals(collectionDailyData!.date, ZERO_BI);
    assert.stringEquals(collectionDailyData!.volume.toString(), transactionVolume);

    const aggregator = Aggregator.load("LooksRareAggregator");
    assert.assertNotNull(aggregator);
    assert.bigIntEquals(aggregator!.transactions, ONE_BI);
    assert.bigIntEquals(aggregator!.users, ONE_BI);
    assert.bigIntEquals(aggregator!.collections, ONE_BI);

    const aggregatorByCurrency = AggregatorByCurrency.load(ZERO_ADDRESS.toHex());
    assert.assertNotNull(aggregatorByCurrency);
    assert.stringEquals(aggregatorByCurrency!.currency.toHexString(), ZERO_ADDRESS.toHex());
    assert.bigIntEquals(aggregatorByCurrency!.transactions, ONE_BI);
    assert.stringEquals(aggregatorByCurrency!.volume.toString(), transactionVolume);
    assert.bigIntEquals(aggregatorByCurrency!.users, ONE_BI);
    assert.bigIntEquals(aggregatorByCurrency!.collections, ONE_BI);

    const aggregatorDailyDataID = "0";

    assert.i32Equals(aggregator!.dailyData.length, 1);
    assert.stringEquals(aggregator!.dailyData[0], aggregatorDailyDataID);

    const aggregatorDailyData = AggregatorDailyData.load(aggregatorDailyDataID);
    assert.assertNotNull(aggregatorDailyData);
    assert.bigIntEquals(aggregatorDailyData!.transactions, ONE_BI);
    assert.bigIntEquals(aggregatorDailyData!.date, ZERO_BI);
    assert.bigIntEquals(aggregatorDailyData!.users, ONE_BI);
    assert.bigIntEquals(aggregatorDailyData!.collections, ONE_BI);

    const aggregatorDailyDataByCurrencyID = `${ZERO_ADDRESS.toHex()}-0`;

    const aggregatorDailyDataByCurrency = AggregatorDailyDataByCurrency.load(aggregatorDailyDataByCurrencyID);
    assert.assertNotNull(aggregatorDailyDataByCurrency);
    assert.stringEquals(aggregatorDailyDataByCurrency!.currency.toHexString(), ZERO_ADDRESS.toHex());
    assert.bigIntEquals(aggregatorDailyDataByCurrency!.transactions, ONE_BI);
    assert.bigIntEquals(aggregatorDailyDataByCurrency!.date, ZERO_BI);
    assert.stringEquals(aggregatorDailyDataByCurrency!.volume.toString(), transactionVolume);
    assert.bigIntEquals(aggregatorDailyDataByCurrency!.users, ONE_BI);
    assert.bigIntEquals(aggregatorDailyDataByCurrency!.collections, ONE_BI);

    const marketplace = Marketplace.load(`seaport-${ZERO_ADDRESS.toHex()}`);
    assert.assertNotNull(marketplace);
    assert.stringEquals(marketplace!.currency.toHexString(), ZERO_ADDRESS.toHex());
    assert.bigIntEquals(marketplace!.transactions, ONE_BI);
    assert.stringEquals(marketplace!.volume.toString(), transactionVolume);
    assert.bigIntEquals(marketplace!.users, ONE_BI);
    assert.bigIntEquals(marketplace!.collections, ONE_BI);

    const marketplaceDailyDataID = `seaport-${ZERO_ADDRESS.toHex()}-0`;

    assert.i32Equals(marketplace!.dailyData.length, 1);
    assert.stringEquals(marketplace!.dailyData[0], marketplaceDailyDataID);

    const marketplaceDailyData = MarketplaceDailyData.load(marketplaceDailyDataID);
    assert.assertNotNull(marketplaceDailyData);
    assert.stringEquals(marketplaceDailyData!.currency.toHexString(), ZERO_ADDRESS.toHex());
    assert.bigIntEquals(marketplaceDailyData!.transactions, ONE_BI);
    assert.stringEquals(marketplaceDailyData!.marketplace, marketplace!.id);
    assert.bigIntEquals(marketplaceDailyData!.date, ZERO_BI);
    assert.stringEquals(marketplaceDailyData!.volume.toString(), transactionVolume);
    assert.bigIntEquals(marketplaceDailyData!.users, ONE_BI);
    assert.bigIntEquals(marketplaceDailyData!.collections, ONE_BI);

    const user = User.load(`${Address.fromString(originator).toHexString()}-${ZERO_ADDRESS.toHex()}`);
    assert.assertNotNull(user);
    assert.stringEquals(user!.currency.toHexString(), ZERO_ADDRESS.toHex());
    assert.bigIntEquals(user!.transactions, ONE_BI);
    assert.stringEquals(user!.volume.toString(), transactionVolume);

    const userDailyDataID = `${Address.fromString(originator).toHexString()}-${ZERO_ADDRESS.toHex()}-0`;

    assert.i32Equals(user!.dailyData.length, 1);
    assert.stringEquals(user!.dailyData[0], userDailyDataID);

    const userDailyData = UserDailyData.load(userDailyDataID);
    assert.assertNotNull(userDailyData);
    assert.stringEquals(userDailyData!.currency.toHexString(), ZERO_ADDRESS.toHex());
    assert.bigIntEquals(userDailyData!.transactions, ONE_BI);
    assert.stringEquals(userDailyData!.user, user!.id);
    assert.bigIntEquals(userDailyData!.date, ZERO_BI);
    assert.stringEquals(userDailyData!.volume.toString(), transactionVolume);

    const transactionID = `${event.transaction.hash.toHexString()}-${event.logIndex.toString()}`;
    const transaction = Transaction.load(transactionID);
    assert.assertNotNull(transaction);
    assert.stringEquals(transaction!.transactionHash, event.transaction.hash.toHexString());
    assert.stringEquals(transaction!.logIndex.toString(), event.logIndex.toString());
    assert.bigIntEquals(transaction!.timestamp, event.block.timestamp);
    assert.bigIntEquals(transaction!.blockNumber, event.block.number);
    assert.booleanEquals(transaction!.isBundle, false);
    assert.stringEquals(transaction!.collection, collection!.id);
    assert.bigIntEquals(transaction!.tokenId, BigInt.fromI32(1333));
    assert.stringEquals(transaction!.price.toString(), transactionVolume);
    assert.stringEquals(transaction!.currency.toHexString(), ZERO_ADDRESS.toHex());
    assert.bigIntEquals(transaction!.amount, ONE_BI);
    assert.stringEquals(transaction!.buyer.toHexString(), originator);
    assert.stringEquals(transaction!.seller.toHexString(), offerer);
  });
});
