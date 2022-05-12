import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { assert, clearStore, createMockedFunction, log, test } from "matchstick-as/assembly/index";
import { createRoyaltyPaymentEvent, createTakerAskEvent, createTakerBidEvent } from "./helpers/utils";
import { COLLECTION, STRATEGY, WETH } from "./helpers/config";
import { handleRoyaltyPayment, handleTakerAsk, handleTakerBid } from "../mappings";
import {
  Collection,
  CollectionDailyData,
  ExecutionStrategy,
  ExecutionStrategyDailyData,
  User,
  UserDailyData,
} from "../generated/schema";
import { parseEther } from "../../../helpers/utils";
import { ZERO_BI, ONE_BI, THREE_BI } from "../../../helpers/constants";

test("TakerBid event updates all entities", () => {
  createMockedFunction(STRATEGY, "viewProtocolFee", "viewProtocolFee():(uint256)").returns([
    ethereum.Value.fromI32(200),
  ]);

  const orderHash = Bytes.fromHexString("C83125C74D8C2F7CFCEE119124D29641582EDE7A70537BE375068158573E63C3");
  const orderNonce = ONE_BI;
  const takerAddress = Address.fromString("0x0000000000000000000000000000000000000001");
  const makerAddress = Address.fromString("0x0000000000000000000000000000000000000002");
  const tokenId = THREE_BI;
  const amount = ONE_BI;
  const priceInETH = 2; // 2 ETH
  const price = parseEther(priceInETH);

  const newTakerBidEvent = createTakerBidEvent(
    orderHash,
    orderNonce,
    takerAddress,
    makerAddress,
    STRATEGY,
    WETH,
    COLLECTION,
    tokenId,
    amount,
    price
  );
  handleTakerBid(newTakerBidEvent);

  const makerUser = User.load(makerAddress.toHex());
  if (makerUser !== null) {
    assert.bigIntEquals(makerUser.totalTransactions, ONE_BI);
    assert.stringEquals(makerUser.totalVolume.toString(), priceInETH.toString());
    assert.stringEquals(makerUser.totalMakerVolume.toString(), priceInETH.toString());
    assert.stringEquals(makerUser.totalTakerVolume.toString(), "0");
    const ID = newTakerBidEvent.block.timestamp.div(BigInt.fromI32(86400)).toString() + "-" + makerUser.id;
    const makerUserDailyData = UserDailyData.load(ID);
    if (makerUserDailyData !== null) {
      assert.stringEquals(makerUserDailyData.user, makerUser.id);
      assert.bigIntEquals(makerUserDailyData.dailyTransactions, ONE_BI);
      assert.stringEquals(makerUserDailyData.dailyVolume.toString(), makerUser.totalVolume.toString());
      assert.stringEquals(
        makerUserDailyData.dailyVolumeExcludingZeroFee.toString(),
        makerUserDailyData.dailyVolume.toString()
      );
    } else {
      log.warning("UserDailyData (maker) doesn't exist", []);
    }
  } else {
    log.warning("User (maker) doesn't exist", []);
  }

  const takerUser = User.load(takerAddress.toHex());
  if (takerUser !== null) {
    assert.bigIntEquals(takerUser.totalTransactions, ONE_BI);
    assert.stringEquals(takerUser.totalVolume.toString(), priceInETH.toString());
    assert.stringEquals(takerUser.totalTakerVolume.toString(), priceInETH.toString());
    assert.stringEquals(takerUser.totalMakerVolume.toString(), "0");

    const ID = newTakerBidEvent.block.timestamp.div(BigInt.fromI32(86400)).toString() + "-" + takerUser.id;
    const takerUserDailyData = UserDailyData.load(ID);
    if (takerUserDailyData !== null) {
      assert.stringEquals(takerUserDailyData.user, takerUser.id);
      assert.bigIntEquals(takerUserDailyData.dailyTransactions, ONE_BI);
      assert.stringEquals(takerUserDailyData.dailyVolume.toString(), takerUser.totalVolume.toString());
      assert.stringEquals(
        takerUserDailyData.dailyVolumeExcludingZeroFee.toString(),
        takerUserDailyData.dailyVolume.toString()
      );
    } else {
      log.warning("UserDailyData (taker) doesn't exist", []);
    }
  } else {
    log.warning("User (taker) doesn't exist", []);
  }

  const strategy = ExecutionStrategy.load(STRATEGY.toHex());
  if (strategy !== null) {
    assert.bigIntEquals(strategy.protocolFee, BigInt.fromI32(200));
    assert.bigIntEquals(strategy.totalTransactions, ONE_BI);
    assert.bigIntEquals(strategy.totalTakerAskTransactions, ZERO_BI);
    assert.bigIntEquals(strategy.totalTakerBidTransactions, ONE_BI);
    assert.stringEquals(strategy.totalVolume.toString(), priceInETH.toString());
    assert.stringEquals(strategy.totalTakerBidVolume.toString(), priceInETH.toString());
    assert.stringEquals(strategy.totalTakerAskVolume.toString(), "0");

    const ID = newTakerBidEvent.block.timestamp.div(BigInt.fromI32(86400)).toString() + "-" + strategy.id;
    const strategyDailyData = ExecutionStrategyDailyData.load(ID);
    if (strategyDailyData !== null) {
      assert.stringEquals(strategyDailyData.strategy, strategy.id);
      assert.bigIntEquals(strategyDailyData.dailyTransactions, ONE_BI);
      assert.bigIntEquals(strategyDailyData.dailyTakerBidTransactions, ONE_BI);
      assert.bigIntEquals(strategyDailyData.dailyTakerAskTransactions, ZERO_BI);
      assert.stringEquals(strategyDailyData.dailyTakerBidVolume.toString(), strategy.totalVolume.toString());
      assert.stringEquals(strategyDailyData.dailyTakerAskVolume.toString(), "0");
      assert.stringEquals(strategyDailyData.dailyVolume.toString(), strategy.totalVolume.toString());
    } else {
      log.warning("StrategyDailyData doesn't exist", []);
    }
  } else {
    log.warning("Strategy doesn't exist", []);
  }

  const collection = Collection.load(COLLECTION.toHex());
  if (collection !== null) {
    assert.bigIntEquals(collection.totalTransactions, ONE_BI);
    assert.bigIntEquals(collection.totalTakerBidTransactions, ONE_BI);
    assert.bigIntEquals(collection.totalTakerAskTransactions, ZERO_BI);
    assert.stringEquals(collection.totalVolume.toString(), priceInETH.toString());
    assert.stringEquals(collection.totalTakerBidVolume.toString(), priceInETH.toString());
    assert.stringEquals(collection.totalTakerAskVolume.toString(), "0");
    assert.stringEquals(collection.totalRoyaltyPaid.toString(), "0");

    const ID = newTakerBidEvent.block.timestamp.div(BigInt.fromI32(86400)).toString() + "-" + collection.id;
    const collectionDailyData = CollectionDailyData.load(ID);
    if (collectionDailyData !== null) {
      assert.stringEquals(collectionDailyData.collection, collection.id);
      assert.bigIntEquals(collectionDailyData.dailyTransactions, ONE_BI);
      assert.bigIntEquals(collectionDailyData.dailyTakerBidTransactions, ONE_BI);
      assert.bigIntEquals(collectionDailyData.dailyTakerAskTransactions, ZERO_BI);
      assert.stringEquals(collectionDailyData.dailyTakerBidVolume.toString(), collection.totalVolume.toString());
      assert.stringEquals(collectionDailyData.dailyTakerAskVolume.toString(), "0");
      assert.stringEquals(
        collectionDailyData.dailyVolumeExcludingZeroFee.toString(),
        collection.totalVolume.toString()
      );
      assert.stringEquals(
        collectionDailyData.dailyVolumeExcludingZeroFee.toString(),
        collectionDailyData.dailyVolume.toString()
      );
      assert.stringEquals(collectionDailyData.dailyRoyalty.toString(), collection.totalRoyaltyPaid.toString());
    } else {
      log.warning("CollectionDailyData doesn't exist", []);
    }
  } else {
    log.warning("Collection doesn't exist", []);
  }

  // Clear the store in order to start the next test off on a clean slate
  clearStore();
});

test("TakerAsk event updates all entities as expected", () => {
  createMockedFunction(STRATEGY, "viewProtocolFee", "viewProtocolFee():(uint256)").returns([
    ethereum.Value.fromI32(200),
  ]);

  const orderHash = Bytes.fromHexString("C83125C74D8C2F7CFCEE119124D29641582EDE7A70537BE375068158573E63C5");
  const orderNonce = ONE_BI;
  const takerAddress = Address.fromString("0x0000000000000000000000000000000000000001");
  const makerAddress = Address.fromString("0x0000000000000000000000000000000000000002");
  const tokenId = THREE_BI;
  const amount = ONE_BI;
  const priceInETH = 5; // 5 ETH
  const price = parseEther(priceInETH);

  const newTakerAskEvent = createTakerAskEvent(
    orderHash,
    orderNonce,
    takerAddress,
    makerAddress,
    STRATEGY,
    WETH,
    COLLECTION,
    tokenId,
    amount,
    price
  );
  handleTakerAsk(newTakerAskEvent);

  const makerUser = User.load(makerAddress.toHex());
  if (makerUser !== null) {
    assert.bigIntEquals(makerUser.totalTransactions, ONE_BI);
    assert.stringEquals(makerUser.totalVolume.toString(), priceInETH.toString());
    assert.stringEquals(makerUser.totalMakerVolume.toString(), priceInETH.toString());
    assert.stringEquals(makerUser.totalTakerVolume.toString(), "0");
    const ID = newTakerAskEvent.block.timestamp.div(BigInt.fromI32(86400)).toString() + "-" + makerUser.id;
    const makerUserDailyData = UserDailyData.load(ID);
    if (makerUserDailyData !== null) {
      assert.stringEquals(makerUserDailyData.user, makerUser.id);
      assert.bigIntEquals(makerUserDailyData.dailyTransactions, ONE_BI);
      assert.stringEquals(makerUserDailyData.dailyVolume.toString(), makerUser.totalVolume.toString());
      assert.stringEquals(
        makerUserDailyData.dailyVolumeExcludingZeroFee.toString(),
        makerUserDailyData.dailyVolume.toString()
      );
    } else {
      log.warning("UserDailyData (maker) doesn't exist", []);
    }
  } else {
    log.warning("User (maker) doesn't exist", []);
  }

  const takerUser = User.load(takerAddress.toHex());
  if (takerUser !== null) {
    assert.bigIntEquals(takerUser.totalTransactions, ONE_BI);
    assert.stringEquals(takerUser.totalVolume.toString(), priceInETH.toString());
    assert.stringEquals(takerUser.totalTakerVolume.toString(), priceInETH.toString());
    assert.stringEquals(takerUser.totalMakerVolume.toString(), "0");
    const ID = newTakerAskEvent.block.timestamp.div(BigInt.fromI32(86400)).toString() + "-" + takerUser.id;
    const takerUserDailyData = UserDailyData.load(ID);
    if (takerUserDailyData !== null) {
      assert.stringEquals(takerUserDailyData.user, takerUser.id);
      assert.bigIntEquals(takerUserDailyData.dailyTransactions, ONE_BI);
      assert.stringEquals(takerUserDailyData.dailyVolume.toString(), takerUser.totalVolume.toString());
      assert.stringEquals(
        takerUserDailyData.dailyVolumeExcludingZeroFee.toString(),
        takerUserDailyData.dailyVolume.toString()
      );
    } else {
      log.warning("UserDailyData (taker) doesn't exist", []);
    }
  } else {
    log.warning("User (taker) doesn't exist", []);
  }

  const strategy = ExecutionStrategy.load(STRATEGY.toHex());
  if (strategy !== null) {
    assert.bigIntEquals(strategy.protocolFee, BigInt.fromI32(200));
    assert.bigIntEquals(strategy.totalTransactions, ONE_BI);
    assert.bigIntEquals(strategy.totalTakerBidTransactions, ZERO_BI);
    assert.bigIntEquals(strategy.totalTakerAskTransactions, ONE_BI);
    assert.stringEquals(strategy.totalVolume.toString(), priceInETH.toString());
    assert.stringEquals(strategy.totalTakerAskVolume.toString(), priceInETH.toString());
    assert.stringEquals(strategy.totalTakerBidVolume.toString(), "0");

    const ID = newTakerAskEvent.block.timestamp.div(BigInt.fromI32(86400)).toString() + "-" + strategy.id;
    const strategyDailyData = ExecutionStrategyDailyData.load(ID);
    if (strategyDailyData !== null) {
      assert.stringEquals(strategyDailyData.strategy, strategy.id);
      assert.bigIntEquals(strategyDailyData.dailyTransactions, ONE_BI);
      assert.bigIntEquals(strategyDailyData.dailyTakerAskTransactions, ONE_BI);
      assert.bigIntEquals(strategyDailyData.dailyTakerBidTransactions, ZERO_BI);
      assert.stringEquals(strategyDailyData.dailyTakerAskVolume.toString(), strategy.totalVolume.toString());
      assert.stringEquals(strategyDailyData.dailyTakerBidVolume.toString(), "0");
      assert.stringEquals(strategyDailyData.dailyVolume.toString(), strategy.totalVolume.toString());
    } else {
      log.warning("StrategyDailyData doesn't exist", []);
    }
  } else {
    log.warning("Strategy doesn't exist", []);
  }

  const collection = Collection.load(COLLECTION.toHex());
  if (collection !== null) {
    assert.bigIntEquals(collection.totalTransactions, ONE_BI);
    assert.bigIntEquals(collection.totalTakerBidTransactions, ZERO_BI);
    assert.bigIntEquals(collection.totalTakerAskTransactions, ONE_BI);
    assert.stringEquals(collection.totalVolume.toString(), priceInETH.toString());
    assert.stringEquals(collection.totalTakerBidVolume.toString(), "0");
    assert.stringEquals(collection.totalTakerAskVolume.toString(), priceInETH.toString());
    assert.stringEquals(collection.totalRoyaltyPaid.toString(), "0");

    const ID = newTakerAskEvent.block.timestamp.div(BigInt.fromI32(86400)).toString() + "-" + collection.id;
    const collectionDailyData = CollectionDailyData.load(ID);
    if (collectionDailyData !== null) {
      assert.stringEquals(collectionDailyData.collection, collection.id);
      assert.bigIntEquals(collectionDailyData.dailyTransactions, ONE_BI);
      assert.bigIntEquals(collectionDailyData.dailyTakerAskTransactions, ONE_BI);
      assert.bigIntEquals(collectionDailyData.dailyTakerBidTransactions, ZERO_BI);
      assert.stringEquals(collectionDailyData.dailyTakerAskVolume.toString(), collection.totalVolume.toString());
      assert.stringEquals(collectionDailyData.dailyTakerBidVolume.toString(), "0");
      assert.stringEquals(
        collectionDailyData.dailyVolumeExcludingZeroFee.toString(),
        collection.totalVolume.toString()
      );
      assert.stringEquals(
        collectionDailyData.dailyVolumeExcludingZeroFee.toString(),
        collectionDailyData.dailyVolume.toString()
      );
      assert.stringEquals(collectionDailyData.dailyRoyalty.toString(), collection.totalRoyaltyPaid.toString());
    } else {
      log.warning("CollectionDailyData doesn't exist", []);
    }
  } else {
    log.warning("Collection doesn't exist", []);
  }

  clearStore();
});

test("RoyaltyPayment", () => {
  const royaltyRecipientAddress = Address.fromString("0x0000000000000000000000000000000000000005");
  const tokenId = THREE_BI;
  const royaltyAmountInETH = 1; // 1 ETH
  const royaltyAmount = parseEther(royaltyAmountInETH);

  const newRoyaltyPaymentEvent = createRoyaltyPaymentEvent(
    COLLECTION,
    tokenId,
    royaltyRecipientAddress,
    WETH,
    royaltyAmount
  );
  handleRoyaltyPayment(newRoyaltyPaymentEvent);

  const royaltyRecipient = User.load(royaltyRecipientAddress.toHex());
  if (royaltyRecipient !== null) {
    assert.bigIntEquals(royaltyRecipient.totalTransactions, ZERO_BI);
    assert.stringEquals(royaltyRecipient.totalRoyaltyCollected.toString(), royaltyAmountInETH.toString());
    assert.stringEquals(royaltyRecipient.totalVolume.toString(), "0");
    assert.stringEquals(royaltyRecipient.totalTakerVolume.toString(), "0");
    assert.stringEquals(royaltyRecipient.totalMakerVolume.toString(), "0");
  } else {
    log.warning("Royalty user doesn't exist", []);
  }

  const collection = Collection.load(COLLECTION.toHex());
  if (collection !== null) {
    assert.stringEquals(collection.totalRoyaltyPaid.toString(), royaltyAmountInETH.toString());

    const ID = newRoyaltyPaymentEvent.block.timestamp.div(BigInt.fromI32(86400)).toString() + "-" + collection.id;
    const collectionDailyData = CollectionDailyData.load(ID);
    if (collectionDailyData !== null) {
      assert.stringEquals(collectionDailyData.collection, collection.id);
      assert.bigIntEquals(collectionDailyData.dailyTransactions, ZERO_BI);
      assert.bigIntEquals(collectionDailyData.dailyTakerAskTransactions, ZERO_BI);
      assert.bigIntEquals(collectionDailyData.dailyTakerBidTransactions, ZERO_BI);
      assert.stringEquals(collectionDailyData.dailyTakerAskVolume.toString(), "0");
      assert.stringEquals(collectionDailyData.dailyTakerBidVolume.toString(), "0");
      assert.stringEquals(
        collectionDailyData.dailyVolumeExcludingZeroFee.toString(),
        collection.totalVolume.toString()
      );
      assert.stringEquals(
        collectionDailyData.dailyVolumeExcludingZeroFee.toString(),
        collectionDailyData.dailyVolume.toString()
      );
      assert.stringEquals(collectionDailyData.dailyRoyalty.toString(), collection.totalRoyaltyPaid.toString());
    } else {
      log.warning("CollectionDailyData doesn't exist", []);
    }
  } else {
    log.warning("Collection doesn't exist", []);
  }

  clearStore();
});
