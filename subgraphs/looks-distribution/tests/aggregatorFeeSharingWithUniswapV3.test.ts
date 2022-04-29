/* eslint-disable prefer-const */
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { assert, clearStore, createMockedFunction, log, test } from "matchstick-as/assembly/index";
import { User } from "../generated/schema";
import { handleDepositAggregatorUniswapV3, handleWithdrawAggregatorUniswapV3 } from "../mappings";
import {
  createDepositAggregatorEvent,
  createWithdrawAggregatorEvent,
} from "./helpers/aggregatorFeeSharingWithUniswapV3/utils";
import { parseEther } from "../../../helpers/utils";
import { AGGREGATOR_ADDRESS } from "../mappings/utils/addresses-mainnet";
import { ONE_ETHER_IN_WEI } from "../../../helpers/constants";

test("Deposit and withdraw event (inferior to deposited amount)", () => {
  const userAddress = Address.fromString("0x0000000000000000000000000000000000000001");

  /**
   * 1. User deposits 20 LOOKS
   */
  let amountDepositedInLOOKS = 20; // 20 LOOKS
  let amountDepositedInLOOKSWei = parseEther(amountDepositedInLOOKS);
  let blockTimestamp = BigInt.fromU32(1651086000);

  let newDepositEvent = createDepositAggregatorEvent(userAddress, amountDepositedInLOOKSWei, blockTimestamp);

  createMockedFunction(AGGREGATOR_ADDRESS, "totalShares", "totalShares():(uint256)").returns([
    ethereum.Value.fromSignedBigInt(amountDepositedInLOOKSWei),
  ]);

  createMockedFunction(
    AGGREGATOR_ADDRESS,
    "calculateSharePriceInLOOKS",
    "calculateSharePriceInLOOKS():(uint256)"
  ).returns([ethereum.Value.fromSignedBigInt(ONE_ETHER_IN_WEI)]);

  handleDepositAggregatorUniswapV3(newDepositEvent);

  let user = User.load(userAddress.toHex());
  if (user !== null) {
    assert.assertTrue(user.aggregatorIsActive);
    assert.stringEquals(user.aggregatorAdjustedDepositAmount.toString(), amountDepositedInLOOKS.toString());
    assert.bigIntEquals(user.aggregatorLastDepositDate, blockTimestamp);
  } else {
    log.warning("User doesn't exist", []);
  }

  /**
   * 2. User withdraws 15 LOOKS
   */
  let amountWithdrawnInLOOKS = 15; // 20 LOOKS
  let amountWithdrawnInLOOKSWei = parseEther(amountWithdrawnInLOOKS);
  blockTimestamp = BigInt.fromU32(1651086000);

  let newWithdrawEvent = createWithdrawAggregatorEvent(userAddress, amountWithdrawnInLOOKSWei, blockTimestamp);
  handleWithdrawAggregatorUniswapV3(newWithdrawEvent);

  user = User.load(userAddress.toHex());
  if (user !== null) {
    assert.assertTrue(user.aggregatorIsActive);
    assert.stringEquals(
      user.aggregatorAdjustedDepositAmount.toString(),
      (amountDepositedInLOOKS - amountWithdrawnInLOOKS).toString()
    );
    // LOOKS are not marked as collected until the adjusted deposit amount reaches 0
    assert.stringEquals(user.aggregatorTotalCollectedLOOKS.toString(), "0");
    assert.bigIntEquals(user.aggregatorLastWithdrawDate, blockTimestamp);
  } else {
    log.warning("User doesn't exist", []);
  }
  clearStore();
});
