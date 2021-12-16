/* eslint-disable prefer-const */
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { User, RewardPeriod } from "../generated/schema";
import { Deposit, Withdraw, Harvest, RewardAdded } from "../generated/FeeSharingSystem/FeeSharingSystem";
import { toBigDecimal } from "./utils";

// BigNumber helpers
let ZERO_BI = BigInt.zero();
let ZERO_BD = BigDecimal.zero();

export function handleDeposit(event: Deposit): void {
  let user = User.load(event.params.user.toHex());
  if (user === null) {
    user = new User(event.params.user.toHex());
    user.adjustedDepositAmountLOOKS = ZERO_BD;
    user.totalLOOKSCollected = ZERO_BD;
    user.totalWETHCollected = ZERO_BD;
    user.lastLOOKSDepositDate = ZERO_BI;
    user.lastLOOKSWithdrawDate = ZERO_BI;
    user.lastHarvestDate = ZERO_BI;
  }
  user.adjustedDepositAmountLOOKS = user.adjustedDepositAmountLOOKS.plus(toBigDecimal(event.params.amount));
  user.lastLOOKSDepositDate = event.block.timestamp;

  if (event.params.harvestedAmount !== ZERO_BI) {
    user.totalWETHCollected = toBigDecimal(event.params.harvestedAmount);
    user.lastHarvestDate = event.block.timestamp;
  }

  user.save();
}

export function handleHarvest(event: Harvest): void {
  let user = User.load(event.params.user.toHex());
  if (user === null) {
    user = new User(event.params.user.toHex());
    user.adjustedDepositAmountLOOKS = ZERO_BD;
    user.totalLOOKSCollected = ZERO_BD;
    user.totalWETHCollected = ZERO_BD;
    user.lastLOOKSDepositDate = ZERO_BI;
    user.lastLOOKSWithdrawDate = ZERO_BI;
    user.lastHarvestDate = ZERO_BI;
  }
  user.totalWETHCollected = toBigDecimal(event.params.harvestedAmount);
  user.lastHarvestDate = event.block.timestamp;

  user.save();
}

export function handleWithdraw(event: Withdraw): void {
  let user = User.load(event.params.user.toHex());
  if (user === null) {
    user = new User(event.params.user.toHex());
    user.adjustedDepositAmountLOOKS = ZERO_BD;
    user.totalLOOKSCollected = ZERO_BD;
    user.totalWETHCollected = ZERO_BD;
    user.lastLOOKSDepositDate = ZERO_BI;
    user.lastLOOKSWithdrawDate = ZERO_BI;
    user.lastHarvestDate = ZERO_BI;
  }

  if (user.adjustedDepositAmountLOOKS >= toBigDecimal(event.params.amount)) {
    user.adjustedDepositAmountLOOKS = user.adjustedDepositAmountLOOKS.minus(toBigDecimal(event.params.amount));
  } else {
    user.totalLOOKSCollected = user.totalLOOKSCollected.plus(
      toBigDecimal(event.params.amount).minus(user.adjustedDepositAmountLOOKS)
    );
    user.adjustedDepositAmountLOOKS = ZERO_BD;
  }

  user.lastLOOKSWithdrawDate = event.block.timestamp;

  if (event.params.harvestedAmount !== ZERO_BI) {
    user.totalWETHCollected = toBigDecimal(event.params.harvestedAmount);
    user.lastHarvestDate = event.block.timestamp;
  }

  user.save();
}

function handleRewardAdded(event: RewardAdded): void {
  let rewardPeriod = new RewardPeriod(event.block.timestamp.toHex());
  rewardPeriod.block = event.block.number;
  rewardPeriod.rewardPerBlock = toBigDecimal(event.params.rewardPerBlock);
  rewardPeriod.reward = toBigDecimal(event.params.reward);

  rewardPeriod.save();
}
