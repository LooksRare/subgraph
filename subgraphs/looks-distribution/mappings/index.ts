/* eslint-disable prefer-const */
import { User, RewardPeriod, PurchaseLOOKSTokens } from "../generated/schema";
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
import {
  Deposit as DepositAggregatorUniswapV3,
  Withdraw as WithdrawAggregatorUniswapV3,
  ConversionToLOOKS as ConversionToLOOKSAggregatorUniswapV3,
} from "../generated/AggregatorFeeSharingWithUniswapV3/AggregatorFeeSharingWithUniswapV3";
import { toBigDecimal, ZERO_BI, ZERO_BD } from "./utils";
import { initializeUser } from "./utils/initializeUser";
import { fetchSharesAggregator, fetchSharesFeeSharingSystem } from "./utils/fetchShares";
import {
  updateDailySnapshotDepositFeeSharing,
  updateDailySnapshotWithdrawFeeSharing,
  updateDailySnapshotDepositAggregator,
  updateDailySnapshotWithdrawAggregator,
} from "./utils/updateDailyData";
import { AGGREGATOR_ADDRESS } from "./utils/addresses";

export function handleDepositFeeSharing(event: DepositFeeSharing): void {
  // Exclude if aggregator is the user
  if (event.params.user.toHex() === AGGREGATOR_ADDRESS) {
    return;
  }

  let user = User.load(event.params.user.toHex());
  if (user === null) {
    user = initializeUser(event.params.user.toHex());
  }

  let isUserNew = false;
  if (!user.feeSharingIsActive) {
    user.feeSharingIsActive = true;
    isUserNew = true;
  }

  user.feeSharingAdjustedDepositAmount = user.feeSharingAdjustedDepositAmount.plus(toBigDecimal(event.params.amount));
  user.feeSharingLastDepositDate = event.block.timestamp;

  if (event.params.harvestedAmount.gt(ZERO_BI)) {
    user.feeSharingTotalCollectedWETH = user.feeSharingTotalCollectedWETH.plus(
      toBigDecimal(event.params.harvestedAmount)
    );
    user.feeSharingLastHarvestDate = event.block.timestamp;
  }

  updateDailySnapshotDepositFeeSharing(event.block.timestamp, toBigDecimal(event.params.amount), isUserNew);
  user.save();
}

export function handleHarvestFeeSharing(event: HarvestFeeSharing): void {
  // Exclude if aggregator is the user
  if (event.params.user.toHex() === AGGREGATOR_ADDRESS) {
    return;
  }

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
  // Exclude if aggregator is the user
  if (event.params.user.toHex() === AGGREGATOR_ADDRESS) {
    return;
  }

  let user = User.load(event.params.user.toHex());
  if (user === null) {
    user = initializeUser(event.params.user.toHex());
  }

  if (user.feeSharingAdjustedDepositAmount.ge(toBigDecimal(event.params.amount))) {
    user.feeSharingAdjustedDepositAmount = user.feeSharingAdjustedDepositAmount.minus(
      toBigDecimal(event.params.amount)
    );
  } else {
    user.feeSharingTotalCollectedLOOKS = user.feeSharingTotalCollectedLOOKS.plus(
      toBigDecimal(event.params.amount).minus(user.feeSharingAdjustedDepositAmount)
    );
    user.feeSharingAdjustedDepositAmount = ZERO_BD;

    let userShares = fetchSharesFeeSharingSystem(event.params.user);
    if (userShares.gt(ZERO_BI)) {
      user.feeSharingIsActive = false;
    }
  }

  user.feeSharingLastWithdrawDate = event.block.timestamp;

  if (event.params.harvestedAmount.gt(ZERO_BI)) {
    user.feeSharingTotalCollectedWETH = user.feeSharingTotalCollectedWETH.plus(
      toBigDecimal(event.params.harvestedAmount)
    );
    user.feeSharingLastHarvestDate = event.block.timestamp;
  }

  updateDailySnapshotWithdrawFeeSharing(
    event.block.timestamp,
    toBigDecimal(event.params.amount),
    !user.feeSharingIsActive
  );

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

  if (event.params.harvestedAmount.gt(ZERO_BI)) {
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

export function handleDepositAggregatorUniswapV3(event: DepositAggregatorUniswapV3): void {
  let user = User.load(event.params.user.toHex());
  if (user === null) {
    user = initializeUser(event.params.user.toHex());
  }

  let isUserNew = false;
  if (!user.aggregatorIsActive) {
    user.aggregatorIsActive = true;
    isUserNew = true;
  }

  user.aggregatorAdjustedDepositAmount = user.aggregatorAdjustedDepositAmount.plus(toBigDecimal(event.params.amount));
  user.aggregatorLastDepositDate = event.block.timestamp;
  updateDailySnapshotDepositAggregator(event.block.timestamp, toBigDecimal(event.params.amount), isUserNew);
  user.save();
}

export function handleWithdrawAggregatorUniswapV3(event: WithdrawAggregatorUniswapV3): void {
  let user = User.load(event.params.user.toHex());
  if (user === null) {
    user = initializeUser(event.params.user.toHex());
  }

  if (user.aggregatorAdjustedDepositAmount.ge(toBigDecimal(event.params.amount))) {
    user.aggregatorAdjustedDepositAmount = user.aggregatorAdjustedDepositAmount.minus(
      toBigDecimal(event.params.amount)
    );
  } else {
    user.aggregatorTotalCollectedLOOKS = user.aggregatorTotalCollectedLOOKS.plus(
      toBigDecimal(event.params.amount).minus(user.aggregatorAdjustedDepositAmount)
    );
    user.aggregatorAdjustedDepositAmount = ZERO_BD;

    let userShares = fetchSharesAggregator(event.params.user);
    if (userShares.gt(ZERO_BI)) {
      user.aggregatorIsActive = false;
    }
  }

  user.aggregatorLastWithdrawDate = event.block.timestamp;

  updateDailySnapshotWithdrawAggregator(
    event.block.timestamp,
    toBigDecimal(event.params.amount),
    !user.aggregatorIsActive
  );

  user.save();
}

export function handleConversionToLOOKSAggregatorUniswapV3(event: ConversionToLOOKSAggregatorUniswapV3): void {
  let purchase = PurchaseLOOKSTokens.load(event.block.timestamp.toHex());
  if (purchase === null) {
    purchase = new PurchaseLOOKSTokens(event.block.timestamp.toHex());
    purchase.block = event.block.number;
    purchase.amountReceived = toBigDecimal(event.params.amountReceived);
    purchase.amountSold = toBigDecimal(event.params.amountSold);
  }
  purchase.save();
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
