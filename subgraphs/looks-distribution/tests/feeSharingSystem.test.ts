/* eslint-disable prefer-const */
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { assert, clearStore, createMockedFunction, log, test } from "matchstick-as/assembly/index";
import { RewardPeriod, User } from "../generated/schema";
import { handleDepositFeeSharing, handleNewRewardPeriod, handleWithdrawFeeSharing } from "../mappings";
import {
  createDepositFeeSharingEvent,
  createNewRewardPeriodEvent,
  createWithdrawFeeSharingEvent,
} from "./helpers/feeSharingSystem/utils";
import { parseEther } from "../../../helpers/utils";
import { FEE_SHARING_ADDRESS } from "../mappings/utils/addresses-mainnet";
import { ONE_ETHER_IN_WEI, TWO_BI } from "../../../helpers/constants";

test("Deposit + Withdraw (inferior to deposited amount) events", () => {
  const userAddress = Address.fromString("0x0000000000000000000000000000000000000001");

  /**
   * 1. User deposits 20 LOOKS
   */
  let amountDepositedInLOOKS = 20; // 20 LOOKS
  let harvestedAmountInWETH = 0; // 0 WETH
  let amountDepositedInLOOKSWei = parseEther(amountDepositedInLOOKS);
  let harvestedAmountInWETHWei = parseEther(harvestedAmountInWETH);
  let blockTimestamp = BigInt.fromU32(1651086000);

  let newDepositEvent = createDepositFeeSharingEvent(
    userAddress,
    amountDepositedInLOOKSWei,
    harvestedAmountInWETHWei,
    blockTimestamp
  );

  createMockedFunction(FEE_SHARING_ADDRESS, "totalShares", "totalShares():(uint256)").returns([
    ethereum.Value.fromSignedBigInt(amountDepositedInLOOKSWei),
  ]);

  createMockedFunction(
    FEE_SHARING_ADDRESS,
    "calculateSharePriceInLOOKS",
    "calculateSharePriceInLOOKS():(uint256)"
  ).returns([ethereum.Value.fromSignedBigInt(ONE_ETHER_IN_WEI)]);

  handleDepositFeeSharing(newDepositEvent);

  let user = User.load(userAddress.toHex());
  if (user !== null) {
    assert.assertTrue(user.feeSharingIsActive);
    assert.stringEquals(user.feeSharingAdjustedDepositAmount.toString(), amountDepositedInLOOKS.toString());
    assert.bigIntEquals(user.feeSharingLastDepositDate, blockTimestamp);
  } else {
    log.warning("User doesn't exist", []);
  }

  /**
   * 2. User withdraws 15 LOOKS
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

test("NewRewardEvent creates RewardPeriod entity", () => {
  /**
   * NewRewardPeriod event with 975 WETH distributed across 6500 blocks
   */
  let numberBlocks = BigInt.fromI32(6500); // 6500 blocks
  let rewardPerBlockInWETH = 0.15; // 0.15 ETH
  let rewardInWETH = 975; // 975 ETH
  let rewardPerBlockInWeiWETH = parseEther((rewardPerBlockInWETH * 10 ** 2) as i32, 18 - 2);
  let rewardInWeiWETH = parseEther(rewardInWETH);
  let blockNumber = TWO_BI;
  let blockTimestamp = BigInt.fromU32(1651086000);

  let newRewardPeriodEvent = createNewRewardPeriodEvent(
    numberBlocks,
    rewardPerBlockInWeiWETH,
    rewardInWeiWETH,
    blockNumber,
    blockTimestamp
  );
  handleNewRewardPeriod(newRewardPeriodEvent);

  let rewardPeriod = RewardPeriod.load(blockTimestamp.toHex());
  if (rewardPeriod !== null) {
    assert.bigIntEquals(rewardPeriod.block, blockNumber);
    assert.bigIntEquals(rewardPeriod.numberBlocks, numberBlocks);
    assert.stringEquals(rewardPeriod.reward.toString(), rewardInWETH.toString());
    assert.stringEquals(rewardPeriod.rewardPerBlock.toString(), rewardPerBlockInWETH.toString());
  } else {
    log.warning("RewardPeriod doesn't exist", []);
  }
  clearStore();
});
