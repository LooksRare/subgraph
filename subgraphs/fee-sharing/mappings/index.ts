/* eslint-disable prefer-const */
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { User, RewardPeriod } from "../generated/schema";
import {
  Deposit as DepositFeeSharing,
  Withdraw as WithdrawFeeSharing,
  Harvest as HarvestFeeSharing,
  RewardAdded as RewardAddedFeeSharing,
} from "../generated/FeeSharingSystem/FeeSharingSystem";
import {
  Deposit as DepositStakingV2,
  Withdraw as WithdrawStakingV2,
  Harvest as HarvestStakingV2,
  EmergencyWithdraw as EmergencyWithdrawStakingV2,
} from "../generated/StakingPoolForUniswapV2Tokens/StakingPoolForUniswapV2Tokens";

import { toBigDecimal } from "./utils";

// BigNumber helpers
let ZERO_BI = BigInt.zero();
let ZERO_BD = BigDecimal.zero();

export function handleDepositFeeSharing(event: DepositFeeSharing): void {
  let user = User.load(event.params.user.toHex());
  if (user === null) {
    user = new User(event.params.user.toHex());
    user.feeSharingAdjustedDepositAmount = ZERO_BD;
    user.feeSharingTotalCollectedLOOKS = ZERO_BD;
    user.feeSharingTotalCollectedWETH = ZERO_BD;
    user.feeSharingLastDepositDate = ZERO_BI;
    user.feeSharingLastWithdrawDate = ZERO_BI;
    user.feeSharingLastHarvestDate = ZERO_BI;
    user.stakingPoolUniswapV2TotalCollectedLOOKS = ZERO_BD;
    user.stakingPoolUniswapV2LastDepositDate = ZERO_BI;
    user.stakingPoolUniswapV2LastHarvestDate = ZERO_BI;
    user.stakingPoolUniswapV2LastWithdrawDate = ZERO_BI;
  }
  user.feeSharingAdjustedDepositAmount = user.feeSharingAdjustedDepositAmount.plus(toBigDecimal(event.params.amount));
  user.feeSharingLastDepositDate = event.block.timestamp;

  if (event.params.harvestedAmount !== ZERO_BI) {
    user.feeSharingTotalCollectedWETH = toBigDecimal(event.params.harvestedAmount);
    user.feeSharingLastHarvestDate = event.block.timestamp;
  }

  user.save();
}

export function handleHarvestFeeSharing(event: HarvestFeeSharing): void {
  let user = User.load(event.params.user.toHex());
  if (user === null) {
    user = new User(event.params.user.toHex());
    user.feeSharingAdjustedDepositAmount = ZERO_BD;
    user.feeSharingTotalCollectedLOOKS = ZERO_BD;
    user.feeSharingTotalCollectedWETH = ZERO_BD;
    user.feeSharingLastDepositDate = ZERO_BI;
    user.feeSharingLastWithdrawDate = ZERO_BI;
    user.feeSharingLastHarvestDate = ZERO_BI;
    user.stakingPoolUniswapV2TotalCollectedLOOKS = ZERO_BD;
    user.stakingPoolUniswapV2LastDepositDate = ZERO_BI;
    user.stakingPoolUniswapV2LastHarvestDate = ZERO_BI;
    user.stakingPoolUniswapV2LastWithdrawDate = ZERO_BI;
  }
  user.feeSharingTotalCollectedWETH = toBigDecimal(event.params.harvestedAmount);
  user.feeSharingLastHarvestDate = event.block.timestamp;

  user.save();
}

export function handleWithdrawFeeSharing(event: WithdrawFeeSharing): void {
  let user = User.load(event.params.user.toHex());
  if (user === null) {
    user = new User(event.params.user.toHex());
    user.feeSharingAdjustedDepositAmount = ZERO_BD;
    user.feeSharingTotalCollectedLOOKS = ZERO_BD;
    user.feeSharingTotalCollectedWETH = ZERO_BD;
    user.feeSharingLastDepositDate = ZERO_BI;
    user.feeSharingLastWithdrawDate = ZERO_BI;
    user.feeSharingLastHarvestDate = ZERO_BI;
    user.stakingPoolUniswapV2TotalCollectedLOOKS = ZERO_BD;
    user.stakingPoolUniswapV2LastDepositDate = ZERO_BI;
    user.stakingPoolUniswapV2LastHarvestDate = ZERO_BI;
    user.stakingPoolUniswapV2LastWithdrawDate = ZERO_BI;
  }

  if (user.feeSharingAdjustedDepositAmount >= toBigDecimal(event.params.amount)) {
    user.feeSharingAdjustedDepositAmount = user.feeSharingAdjustedDepositAmount.minus(
      toBigDecimal(event.params.amount)
    );
  } else {
    user.feeSharingTotalCollectedLOOKS = user.feeSharingTotalCollectedLOOKS.plus(
      toBigDecimal(event.params.amount).minus(user.feeSharingAdjustedDepositAmount)
    );
    user.feeSharingAdjustedDepositAmount = ZERO_BD;
  }

  user.feeSharingLastWithdrawDate = event.block.timestamp;

  if (event.params.harvestedAmount !== ZERO_BI) {
    user.feeSharingTotalCollectedWETH = toBigDecimal(event.params.harvestedAmount);
    user.feeSharingLastHarvestDate = event.block.timestamp;
  }

  user.save();
}

function handleRewardAddedFeeSharing(event: RewardAddedFeeSharing): void {
  let rewardPeriod = new RewardPeriod(event.block.timestamp.toHex());
  rewardPeriod.block = event.block.number;
  rewardPeriod.rewardPerBlock = toBigDecimal(event.params.rewardPerBlock);
  rewardPeriod.reward = toBigDecimal(event.params.reward);
  rewardPeriod.save();
}

export function handleDepositStakingV2(event: DepositStakingV2): void {
  let user = User.load(event.params.user.toHex());
  if (user === null) {
    user = new User(event.params.user.toHex());
    user.feeSharingAdjustedDepositAmount = ZERO_BD;
    user.feeSharingTotalCollectedLOOKS = ZERO_BD;
    user.feeSharingTotalCollectedWETH = ZERO_BD;
    user.feeSharingLastDepositDate = ZERO_BI;
    user.feeSharingLastWithdrawDate = ZERO_BI;
    user.feeSharingLastHarvestDate = ZERO_BI;
    user.stakingPoolUniswapV2TotalCollectedLOOKS = ZERO_BD;
    user.stakingPoolUniswapV2LastDepositDate = ZERO_BI;
    user.stakingPoolUniswapV2LastHarvestDate = ZERO_BI;
    user.stakingPoolUniswapV2LastWithdrawDate = ZERO_BI;
  }

  user.stakingPoolUniswapV2LastDepositDate = event.block.timestamp;

  if (event.params.harvestedAmount !== ZERO_BI) {
    user.stakingPoolUniswapV2LastHarvestDate = event.block.timestamp;
    user.stakingPoolUniswapV2TotalCollectedLOOKS = user.stakingPoolUniswapV2TotalCollectedLOOKS.plus(
      toBigDecimal(event.params.harvestedAmount)
    );
  }

  user.save();
}

export function handleHarvestV2(event: HarvestStakingV2): void {
  let user = User.load(event.params.user.toHex());
  if (user === null) {
    user = new User(event.params.user.toHex());
    user.feeSharingAdjustedDepositAmount = ZERO_BD;
    user.feeSharingTotalCollectedLOOKS = ZERO_BD;
    user.feeSharingTotalCollectedWETH = ZERO_BD;
    user.feeSharingLastDepositDate = ZERO_BI;
    user.feeSharingLastWithdrawDate = ZERO_BI;
    user.feeSharingLastHarvestDate = ZERO_BI;
    user.stakingPoolUniswapV2TotalCollectedLOOKS = ZERO_BD;
    user.stakingPoolUniswapV2LastDepositDate = ZERO_BI;
    user.stakingPoolUniswapV2LastHarvestDate = ZERO_BI;
    user.stakingPoolUniswapV2LastWithdrawDate = ZERO_BI;
  }

  user.stakingPoolUniswapV2LastHarvestDate = event.block.timestamp;
  user.stakingPoolUniswapV2TotalCollectedLOOKS = user.stakingPoolUniswapV2TotalCollectedLOOKS.plus(
    toBigDecimal(event.params.harvestedAmount)
  );

  user.save();
}

export function handleWithdrawStakingV2(event: WithdrawStakingV2): void {
  let user = User.load(event.params.user.toHex());
  if (user === null) {
    user = new User(event.params.user.toHex());
    user.feeSharingAdjustedDepositAmount = ZERO_BD;
    user.feeSharingTotalCollectedLOOKS = ZERO_BD;
    user.feeSharingTotalCollectedWETH = ZERO_BD;
    user.feeSharingLastDepositDate = ZERO_BI;
    user.feeSharingLastWithdrawDate = ZERO_BI;
    user.feeSharingLastHarvestDate = ZERO_BI;
    user.stakingPoolUniswapV2TotalCollectedLOOKS = ZERO_BD;
    user.stakingPoolUniswapV2LastDepositDate = ZERO_BI;
    user.stakingPoolUniswapV2LastHarvestDate = ZERO_BI;
    user.stakingPoolUniswapV2LastWithdrawDate = ZERO_BI;
  }

  user.stakingPoolUniswapV2LastWithdrawDate = event.block.timestamp;

  if (event.params.harvestedAmount !== ZERO_BI) {
    user.stakingPoolUniswapV2LastHarvestDate = event.block.timestamp;
    user.stakingPoolUniswapV2TotalCollectedLOOKS = user.stakingPoolUniswapV2TotalCollectedLOOKS.plus(
      toBigDecimal(event.params.harvestedAmount)
    );
  }

  user.save();
}
