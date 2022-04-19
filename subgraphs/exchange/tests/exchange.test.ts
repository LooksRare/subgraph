/* eslint-disable prefer-const */
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { assert, clearStore, createMockedFunction, log, test } from "matchstick-as/assembly/index";

import { createTakerBidEvent } from "./helpers/utils";
import { COLLECTION, STRATEGY, WETH } from "./helpers/config";

import { handleTakerBid } from "../mappings";
import { ONE_BI, parseEther } from "../mappings/utils";
import { User } from "../generated/schema";

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
  let price = parseEther(2); // 2 ETH

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
  } else {
    log.warning("Maker user doesn't exist", []);
  }

  let takerUser = User.load(takerAddress.toHex());
  if (takerUser !== null) {
    assert.bigIntEquals(takerUser.totalTransactions, ONE_BI);
  } else {
    log.warning("Taker user doesn't exist", []);
  }

  // Clear the store in order to start the next test off on a clean slate
  clearStore();
});
