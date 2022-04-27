/* eslint-disable prefer-const */
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { assert, clearStore, createMockedFunction, log, test } from "matchstick-as/assembly/index";
import { User } from "../generated/schema";
import { handleDepositFeeSharing, handleWithdrawFeeSharing } from "../mappings";
import { createDepositFeeSharingEvent, createWithdrawFeeSharingEvent } from "./helpers/feeSharingSystem/utils";
import { parseEther } from "../../../helpers/utils";
import { FEE_SHARING_ADDRESS } from "../mappings/utils/addresses-mainnet";

test("Deposit and withdraw event (inferior to deposited amount)", () => {
  const userAddress = Address.fromString("0x0000000000000000000000000000000000000001");

  /**
   * 1. User deposits 20 LOOKS
   */
  let amountDepositedInLOOKS = 20; // 20 LOOKS
  let harvestedAmountInWETH = 0; // 0 WETH
  let amountDepositedInLOOKSWei = parseEther(amountDepositedInLOOKS);
  let harvestedAmountInWETHWei = parseEther(harvestedAmountInWETH);
  let blockTimestamp = BigInt.fromU32(1651006000);

  createMockedFunction(FEE_SHARING_ADDRESS, "totalShares", "totalShares():(uint256)").returns([
    ethereum.Value.fromSignedBigInt(amountDepositedInLOOKSWei),
  ]);

  createMockedFunction(
    FEE_SHARING_ADDRESS,
    "calculateSharePriceInLOOKS",
    "calculateSharePriceInLOOKS():(uint256)"
  ).returns([ethereum.Value.fromSignedBigInt(parseEther(1))]);

  let newDepositEvent = createDepositFeeSharingEvent(
    userAddress,
    amountDepositedInLOOKSWei,
    harvestedAmountInWETHWei,
    blockTimestamp
  );
  handleDepositFeeSharing(newDepositEvent);

  let user = User.load(userAddress.toHex());
  if (user !== null) {
    assert.assertTrue(user.feeSharingIsActive);
  } else {
    log.warning("User doesn't exist", []);
  }

  /**
   * 1. User deposits 20 LOOKS
   */
  let amountWithdrawnInLOOKS = 15; // 20 LOOKS
  harvestedAmountInWETH = 1; // 0 WETH
  let amountWithdrawnInLOOKSWei = parseEther(amountWithdrawnInLOOKS);
  harvestedAmountInWETHWei = parseEther(harvestedAmountInWETH);
  blockTimestamp = BigInt.fromU32(1651086000);

  let newWithdrawEvent = createWithdrawFeeSharingEvent(
    userAddress,
    amountWithdrawnInLOOKSWei,
    harvestedAmountInWETHWei,
    blockTimestamp
  );

  handleWithdrawFeeSharing(newWithdrawEvent);

  user = User.load(userAddress.toHex());
  if (user !== null) {
    assert.assertTrue(user.feeSharingIsActive);
    assert.stringEquals(
      user.feeSharingAdjustedDepositAmount.toString(),
      (amountDepositedInLOOKS - amountWithdrawnInLOOKS).toString()
    );
    // LOOKS are not marked as collected until the adjusted deposit amount reaches 0
    assert.stringEquals(user.feeSharingTotalCollectedLOOKS.toString(), "0");
    assert.stringEquals(user.feeSharingTotalCollectedWETH.toString(), harvestedAmountInWETH.toString());
    assert.bigIntEquals(user.feeSharingLastHarvestDate, blockTimestamp);
    assert.bigIntEquals(user.feeSharingLastWithdrawDate, blockTimestamp);
  } else {
    log.warning("User doesn't exist", []);
  }
  clearStore();
});
