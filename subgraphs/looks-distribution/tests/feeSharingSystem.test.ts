import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { assert, clearStore, createMockedFunction, log, test } from "matchstick-as/assembly/index";
import { RewardPeriod, User } from "../generated/schema";
import {
  createDepositFeeSharingEvent,
  createNewRewardPeriodEvent,
  createWithdrawFeeSharingEvent,
} from "./helpers/feeSharingSystem/utils";
import { handleDepositFeeSharing, handleNewRewardPeriod, handleWithdrawFeeSharing } from "../mappings";
import { FEE_SHARING_ADDRESS } from "../mappings/utils/config/addresses-mainnet";
import { ONE_ETHER_IN_WEI, TWO_BI } from "../../../helpers/constants";
import { parseEther } from "../../../helpers/utils";

test("Deposit + Withdraw (inferior to deposited amount) events", () => {
  const userAddress = Address.fromString("0x0000000000000000000000000000000000000001");

  /**
   * 1. User deposits 20 LOOKS
   */
  const amountDepositedInLOOKS = 20; // 20 LOOKS
  let harvestedAmountInWETH = 0; // 0 WETH
  const amountDepositedInLOOKSWei = parseEther(amountDepositedInLOOKS);
  let harvestedAmountInWETHWei = parseEther(harvestedAmountInWETH);
  let blockTimestamp = BigInt.fromU32(1651086000);

  const newDepositEvent = createDepositFeeSharingEvent(
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
  const amountWithdrawnInLOOKS = 15; // 20 LOOKS
  harvestedAmountInWETH = 1; // 0 WETH
  const amountWithdrawnInLOOKSWei = parseEther(amountWithdrawnInLOOKS);
  harvestedAmountInWETHWei = parseEther(harvestedAmountInWETH);
  blockTimestamp = BigInt.fromU32(1651086000);

  const newWithdrawEvent = createWithdrawFeeSharingEvent(
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
  const numberBlocks = BigInt.fromI32(6500); // 6500 blocks
  const rewardPerBlockInWETH = 0.15; // 0.15 ETH
  const rewardInWETH = 975; // 975 ETH
  const rewardPerBlockInWeiWETH = parseEther((rewardPerBlockInWETH * 10 ** 2) as i32, 18 - 2);
  const rewardInWeiWETH = parseEther(rewardInWETH);
  const blockNumber = TWO_BI;
  const blockTimestamp = BigInt.fromU32(1651086000);

  const newRewardPeriodEvent = createNewRewardPeriodEvent(
    numberBlocks,
    rewardPerBlockInWeiWETH,
    rewardInWeiWETH,
    blockNumber,
    blockTimestamp
  );
  handleNewRewardPeriod(newRewardPeriodEvent);

  const rewardPeriod = RewardPeriod.load(blockTimestamp.toHex());
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
