/* eslint-disable prefer-const */
import { User, RewardPeriod } from "../generated/schema";
import {
  Deposit as DepositFeeSharing,
  Withdraw as WithdrawFeeSharing,
  Harvest as HarvestFeeSharing,
  NewRewardPeriod,
} from "../generated/FeeSharingSystem/FeeSharingSystem";
import {
  Deposit as DepositStakingV2,
  Withdraw as WithdrawStakingV2,
  Harvest as HarvestStakingV2,
} from "../generated/StakingPoolForUniswapV2Tokens/StakingPoolForUniswapV2Tokens";
import { AirdropRewardsClaim } from "../generated/LooksRareAirdrop/LooksRareAirdrop";
import { RewardsClaim } from "../generated/TradingRewardsDistributor/TradingRewardsDistributor";

import { toBigDecimal, ZERO_BI, ZERO_BD } from "./utils";
import { initializeUser } from "./utils/initializeUser";

export function handleDepositFeeSharing(event: DepositFeeSharing): void {
  let user = User.load(event.params.user.toHex());
  if (user === null) {
    user = initializeUser(event.params.user.toHex());
  }

  user.feeSharingAdjustedDepositAmount = user.feeSharingAdjustedDepositAmount.plus(toBigDecimal(event.params.amount));
  user.feeSharingLastDepositDate = event.block.timestamp;

  if (event.params.harvestedAmount > ZERO_BI) {
    user.feeSharingTotalCollectedWETH = user.feeSharingTotalCollectedWETH.plus(
      toBigDecimal(event.params.harvestedAmount)
    );
    user.feeSharingLastHarvestDate = event.block.timestamp;
  }

  user.save();
}

export function handleHarvestFeeSharing(event: HarvestFeeSharing): void {
  let user = User.load(event.params.user.toHex());
  if (user === null) {
    user = initializeUser(event.params.user.toHex());
  }

  user.feeSharingTotalCollectedWETH = user.feeSharingTotalCollectedWETH.plus(
    toBigDecimal(event.params.harvestedAmount)
  );
  user.feeSharingLastHarvestDate = event.block.timestamp;

  user.save();
}

export function handleWithdrawFeeSharing(event: WithdrawFeeSharing): void {
  let user = User.load(event.params.user.toHex());
  if (user === null) {
    user = initializeUser(event.params.user.toHex());
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

  if (event.params.harvestedAmount > ZERO_BI) {
    user.feeSharingTotalCollectedWETH = user.feeSharingTotalCollectedWETH.plus(
      toBigDecimal(event.params.harvestedAmount)
    );
    user.feeSharingLastHarvestDate = event.block.timestamp;
  }

  user.save();
}

export function handleNewRewardPeriod(event: NewRewardPeriod): void {
  let rewardPeriod = new RewardPeriod(event.block.timestamp.toHex());
  rewardPeriod.block = event.block.number;
  rewardPeriod.numberBlocks = event.params.numberBlocks;
  rewardPeriod.rewardPerBlock = toBigDecimal(event.params.rewardPerBlock);
  rewardPeriod.reward = toBigDecimal(event.params.reward);
  rewardPeriod.save();
}

export function handleDepositStakingV2(event: DepositStakingV2): void {
  let user = User.load(event.params.user.toHex());
  if (user === null) {
    user = initializeUser(event.params.user.toHex());
  }

  user.stakingPoolUniswapV2LastDepositDate = event.block.timestamp;

  if (event.params.harvestedAmount > ZERO_BI) {
    user.stakingPoolUniswapV2LastHarvestDate = event.block.timestamp;
    user.stakingPoolUniswapV2TotalCollectedLOOKS = user.stakingPoolUniswapV2TotalCollectedLOOKS.plus(
      toBigDecimal(event.params.harvestedAmount)
    );
  }

  user.save();
}

export function handleHarvestStakingV2(event: HarvestStakingV2): void {
  let user = User.load(event.params.user.toHex());
  if (user === null) {
    user = initializeUser(event.params.user.toHex());
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
    user = initializeUser(event.params.user.toHex());
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

export function handleAirdropClaim(event: AirdropRewardsClaim): void {
  let user = User.load(event.params.user.toHex());
  if (user === null) {
    user = initializeUser(event.params.user.toHex());
  }
  user.airdropAmount = toBigDecimal(event.params.amount);
  user.airdropClaimDate = event.block.timestamp;
  user.save();
}

export function handleTradingRewardsClaim(event: RewardsClaim): void {
  let user = User.load(event.params.user.toHex());
  if (user === null) {
    user = initializeUser(event.params.user.toHex());
  }
  user.tradingRewardsAmount = toBigDecimal(event.params.amount);
  user.tradingRewardsLastClaimDate = event.block.timestamp;
  user.save();
}
