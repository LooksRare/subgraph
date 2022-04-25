/* eslint-disable prefer-const */
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { assert, clearStore, createMockedFunction, log, test } from "matchstick-as/assembly/index";

import { createRoyaltyPaymentEvent, createTakerAskEvent, createTakerBidEvent } from "./helpers/utils";
import { COLLECTION, STRATEGY, WETH } from "./helpers/config";

import { handleRoyaltyPayment, handleTakerAsk, handleTakerBid } from "../mappings";
import { parseEther, ONE_BI, ZERO_BI } from "../../../helpers/utils";
import { Collection, ExecutionStrategy, User } from "../generated/schema";

test("TakerBid", () => {
  createMockedFunction(STRATEGY, "viewProtocolFee", "viewProtocolFee():(uint256)").returns([
    ethereum.Value.fromI32(200),
  ]);

  let orderHash = Bytes.fromHexString("C83125C74D8C2F7CFCEE119124D29641582EDE7A70537BE375068158573E63C3");
  let orderNonce = BigInt.fromI32(1);
  let takerAddress = Address.fromString("0x0000000000000000000000000000000000000001");
  let makerAddress = Address.fromString("0x0000000000000000000000000000000000000002");
  let tokenId = BigInt.fromI32(3);
  let amount = BigInt.fromI32(1);
  let priceInETH = 2; // 2 ETH
  let price = parseEther(priceInETH);

  let newTakerBidEvent = createTakerBidEvent(
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

  let makerUser = User.load(makerAddress.toHex());
  if (makerUser !== null) {
    assert.bigIntEquals(makerUser.totalTransactions, ONE_BI);
    assert.stringEquals(makerUser.totalVolume.toString(), priceInETH.toString());
    assert.stringEquals(makerUser.totalMakerVolume.toString(), priceInETH.toString());
    assert.stringEquals(makerUser.totalTakerVolume.toString(), "0");
  } else {
    log.warning("Maker user doesn't exist", []);
  }

  let takerUser = User.load(takerAddress.toHex());
  if (takerUser !== null) {
    assert.bigIntEquals(takerUser.totalTransactions, ONE_BI);
    assert.stringEquals(takerUser.totalVolume.toString(), priceInETH.toString());
    assert.stringEquals(takerUser.totalTakerVolume.toString(), priceInETH.toString());
    assert.stringEquals(takerUser.totalMakerVolume.toString(), "0");
  } else {
    log.warning("Taker user doesn't exist", []);
  }

  let strategy = ExecutionStrategy.load(STRATEGY.toHex());
  if (strategy !== null) {
    assert.bigIntEquals(strategy.protocolFee, BigInt.fromI32(200));
    assert.bigIntEquals(strategy.totalTransactions, ONE_BI);
    assert.bigIntEquals(strategy.totalTakerAskTransactions, ZERO_BI);
    assert.bigIntEquals(strategy.totalTakerBidTransactions, ONE_BI);
    assert.stringEquals(strategy.totalVolume.toString(), priceInETH.toString());
    assert.stringEquals(strategy.totalTakerBidVolume.toString(), priceInETH.toString());
    assert.stringEquals(strategy.totalTakerAskVolume.toString(), "0");
  } else {
    log.warning("Strategy doesn't exist", []);
  }

  let collection = Collection.load(COLLECTION.toHex());
  if (collection !== null) {
    assert.bigIntEquals(collection.totalTransactions, ONE_BI);
    assert.bigIntEquals(collection.totalTakerBidTransactions, ONE_BI);
    assert.bigIntEquals(collection.totalTakerAskTransactions, ZERO_BI);
    assert.stringEquals(collection.totalVolume.toString(), priceInETH.toString());
    assert.stringEquals(collection.totalTakerBidVolume.toString(), priceInETH.toString());
    assert.stringEquals(collection.totalTakerAskVolume.toString(), "0");
    assert.stringEquals(collection.totalRoyaltyPaid.toString(), "0");
  } else {
    log.warning("Collection doesn't exist", []);
  }

  // Clear the store in order to start the next test off on a clean slate
  clearStore();
});

test("TakerAsk", () => {
  createMockedFunction(STRATEGY, "viewProtocolFee", "viewProtocolFee():(uint256)").returns([
    ethereum.Value.fromI32(200),
  ]);

  let orderHash = Bytes.fromHexString("C83125C74D8C2F7CFCEE119124D29641582EDE7A70537BE375068158573E63C5");
  let orderNonce = BigInt.fromI32(1);
  let takerAddress = Address.fromString("0x0000000000000000000000000000000000000001");
  let makerAddress = Address.fromString("0x0000000000000000000000000000000000000002");
  let tokenId = BigInt.fromI32(3);
  let amount = BigInt.fromI32(1);
  let priceInETH = 5; // 5 ETH
  let price = parseEther(priceInETH);

  let newTakerAskEvent = createTakerAskEvent(
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

  let makerUser = User.load(makerAddress.toHex());
  if (makerUser !== null) {
    assert.bigIntEquals(makerUser.totalTransactions, ONE_BI);
    assert.stringEquals(makerUser.totalVolume.toString(), priceInETH.toString());
    assert.stringEquals(makerUser.totalMakerVolume.toString(), priceInETH.toString());
    assert.stringEquals(makerUser.totalTakerVolume.toString(), "0");
  } else {
    log.warning("Maker user doesn't exist", []);
  }

  let takerUser = User.load(takerAddress.toHex());
  if (takerUser !== null) {
    assert.bigIntEquals(takerUser.totalTransactions, ONE_BI);
    assert.stringEquals(takerUser.totalVolume.toString(), priceInETH.toString());
    assert.stringEquals(takerUser.totalTakerVolume.toString(), priceInETH.toString());
    assert.stringEquals(takerUser.totalMakerVolume.toString(), "0");
  } else {
    log.warning("Taker user doesn't exist", []);
  }

  let strategy = ExecutionStrategy.load(STRATEGY.toHex());
  if (strategy !== null) {
    assert.bigIntEquals(strategy.protocolFee, BigInt.fromI32(200));
    assert.bigIntEquals(strategy.totalTransactions, ONE_BI);
    assert.bigIntEquals(strategy.totalTakerBidTransactions, ZERO_BI);
    assert.bigIntEquals(strategy.totalTakerAskTransactions, ONE_BI);
    assert.stringEquals(strategy.totalVolume.toString(), priceInETH.toString());
    assert.stringEquals(strategy.totalTakerAskVolume.toString(), priceInETH.toString());
    assert.stringEquals(strategy.totalTakerBidVolume.toString(), "0");
  } else {
    log.warning("Strategy doesn't exist", []);
  }

  let collection = Collection.load(COLLECTION.toHex());
  if (collection !== null) {
    assert.bigIntEquals(collection.totalTransactions, ONE_BI);
    assert.bigIntEquals(collection.totalTakerBidTransactions, ZERO_BI);
    assert.bigIntEquals(collection.totalTakerAskTransactions, ONE_BI);
    assert.stringEquals(collection.totalVolume.toString(), priceInETH.toString());
    assert.stringEquals(collection.totalTakerBidVolume.toString(), "0");
    assert.stringEquals(collection.totalTakerAskVolume.toString(), priceInETH.toString());
    assert.stringEquals(collection.totalRoyaltyPaid.toString(), "0");
  } else {
    log.warning("Collection doesn't exist", []);
  }

  clearStore();
});

test("RoyaltyPayment", () => {
  let royaltyRecipientAddress = Address.fromString("0x0000000000000000000000000000000000000005");
  let tokenId = BigInt.fromI32(3);
  let royaltyAmountInETH = 1; // 1 ETH
  let royaltyAmount = parseEther(royaltyAmountInETH);

  let newRoyaltyPaymentEvent = createRoyaltyPaymentEvent(
    COLLECTION,
    tokenId,
    royaltyRecipientAddress,
    WETH,
    royaltyAmount
  );

  handleRoyaltyPayment(newRoyaltyPaymentEvent);

  let royaltyRecipient = User.load(royaltyRecipientAddress.toHex());
  if (royaltyRecipient !== null) {
    assert.bigIntEquals(royaltyRecipient.totalTransactions, ZERO_BI);
    assert.stringEquals(royaltyRecipient.totalRoyaltyCollected.toString(), royaltyAmountInETH.toString());
    assert.stringEquals(royaltyRecipient.totalVolume.toString(), "0");
    assert.stringEquals(royaltyRecipient.totalTakerVolume.toString(), "0");
    assert.stringEquals(royaltyRecipient.totalMakerVolume.toString(), "0");
  } else {
    log.warning("Royalty user doesn't exist", []);
  }

  let collection = Collection.load(COLLECTION.toHex());
  if (collection !== null) {
    assert.stringEquals(collection.totalRoyaltyPaid.toString(), royaltyAmountInETH.toString());
  } else {
    log.warning("Collection doesn't exist", []);
  }

  clearStore();
});
