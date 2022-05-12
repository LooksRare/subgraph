import { AGGREGATOR_ADDRESS } from "./utils/config/addresses";
import { initializeUser } from "./utils/initializeUser";
import { fetchSharesAggregator, fetchSharesFeeSharingSystem } from "./utils/rpc-calls/fetchShares";
import {
  updateDailySnapshotDepositFeeSharing,
  updateDailySnapshotWithdrawFeeSharing,
  updateDailySnapshotDepositAggregator,
  updateDailySnapshotWithdrawAggregator,
  updateDailySnapshotConversion,
  updateNumberUsersFeeSharing,
  updateNumberUsersAggregator,
} from "./utils/updateDailyData";

import { User, RewardPeriod, AggregatorConversion } from "../generated/schema";
import {
  Deposit as DepositAggregatorUniswapV3,
  Withdraw as WithdrawAggregatorUniswapV3,
  WithdrawCall as WithdrawCallAggregatorUniswapV3,
  WithdrawAllCall as WithdrawAllCallAggregatorUniswapV3,
  ConversionToLOOKS as ConversionToLOOKSAggregatorUniswapV3,
} from "../generated/AggregatorFeeSharingWithUniswapV3/AggregatorFeeSharingWithUniswapV3";
import {
  Deposit as DepositFeeSharing,
  Withdraw as WithdrawFeeSharing,
  Harvest as HarvestFeeSharing,
  WithdrawCall as WithdrawCallFeeSharing,
  WithdrawAllCall as WithdrawAllCallFeeSharing,
  NewRewardPeriod,
} from "../generated/FeeSharingSystem/FeeSharingSystem";
import {
  Deposit as DepositStakingV2,
  Withdraw as WithdrawStakingV2,
  Harvest as HarvestStakingV2,
} from "../generated/StakingPoolForUniswapV2Tokens/StakingPoolForUniswapV2Tokens";
import { AirdropRewardsClaim } from "../generated/LooksRareAirdrop/LooksRareAirdrop";
import { RewardsClaim as TradingRewardsClaim } from "../generated/TradingRewardsDistributor/TradingRewardsDistributor";
import { Claim as MultiRewardsClaim } from "../generated/MultiRewardsDistributor/MultiRewardsDistributor";

import { ZERO_BD, ZERO_BI } from "../../../helpers/constants";
import { toBigDecimal } from "../../../helpers/utils";

/**
 * @param event DepositFeeSharing
 */
export function handleDepositFeeSharing(event: DepositFeeSharing): void {
  // Exclude if aggregator is the user
  if (event.params.user === AGGREGATOR_ADDRESS) {
    return;
  }

  let user = User.load(event.params.user.toHex());
  if (user === null) {
    user = initializeUser(event.params.user.toHex());
  }

  if (!user.feeSharingIsActive) {
    user.feeSharingIsActive = true;
    updateNumberUsersFeeSharing(event.block.timestamp, true);
  }

  user.feeSharingAdjustedDepositAmount = user.feeSharingAdjustedDepositAmount.plus(toBigDecimal(event.params.amount));
  user.feeSharingLastDepositDate = event.block.timestamp;

  if (event.params.harvestedAmount.gt(ZERO_BI)) {
    user.feeSharingTotalCollectedWETH = user.feeSharingTotalCollectedWETH.plus(
      toBigDecimal(event.params.harvestedAmount)
    );
    user.feeSharingLastHarvestDate = event.block.timestamp;
  }

  updateDailySnapshotDepositFeeSharing(event.block.timestamp, toBigDecimal(event.params.amount));
  user.save();
}

/**
 * @param event HarvestFeeSharing
 */
export function handleHarvestFeeSharing(event: HarvestFeeSharing): void {
  // Exclude if aggregator is the user
  if (event.params.user === AGGREGATOR_ADDRESS) {
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

/**
 * @param event WithdrawFeeSharing
 */
export function handleWithdrawFeeSharing(event: WithdrawFeeSharing): void {
  // Exclude if aggregator is the user
  if (event.params.user === AGGREGATOR_ADDRESS) {
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
  }

  user.feeSharingLastWithdrawDate = event.block.timestamp;

  if (event.params.harvestedAmount.gt(ZERO_BI)) {
    user.feeSharingTotalCollectedWETH = user.feeSharingTotalCollectedWETH.plus(
      toBigDecimal(event.params.harvestedAmount)
    );
    user.feeSharingLastHarvestDate = event.block.timestamp;
  }

  updateDailySnapshotWithdrawFeeSharing(event.block.timestamp, toBigDecimal(event.params.amount));

  user.save();
}

/**
 * @param call WithdrawCallFeeSharing
 */
export function handleCallWithdrawFeeSharing(call: WithdrawCallFeeSharing): void {
  // Exclude if aggregator is the user
  if (call.from === AGGREGATOR_ADDRESS) {
    return;
  }

  const user = User.load(call.from.toHex());
  if (user !== null && user.feeSharingAdjustedDepositAmount.equals(ZERO_BD)) {
    const userShares = fetchSharesFeeSharingSystem(call.from);
    if (userShares.equals(ZERO_BI) && user.feeSharingIsActive) {
      user.feeSharingIsActive = false;
      updateNumberUsersFeeSharing(call.block.timestamp, false);
    }
    user.save();
  }
}

/**
 * @param call WithdrawAllCallFeeSharing
 */
export function handleCallWithdrawAllFeeSharing(call: WithdrawAllCallFeeSharing): void {
  // Exclude if aggregator is the user
  if (call.from === AGGREGATOR_ADDRESS) {
    return;
  }

  const user = User.load(call.from.toHex());
  if (user !== null && user.feeSharingAdjustedDepositAmount.equals(ZERO_BD)) {
    if (user.feeSharingIsActive) {
      user.feeSharingIsActive = false;
      updateNumberUsersFeeSharing(call.block.timestamp, false);
    }
    user.save();
  }
}

/**
 * @param event NewRewardPeriod
 */
export function handleNewRewardPeriod(event: NewRewardPeriod): void {
  const rewardPeriod = new RewardPeriod(event.transaction.hash.toHex());
  rewardPeriod.block = event.block.number;
  rewardPeriod.date = event.block.timestamp;
  rewardPeriod.numberBlocks = event.params.numberBlocks;
  rewardPeriod.rewardPerBlock = toBigDecimal(event.params.rewardPerBlock);
  rewardPeriod.reward = toBigDecimal(event.params.reward);
  rewardPeriod.save();
}

/**
 * @param event DepositStakingV2
 */
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

/**
 * @param event HarvestStakingV2
 */
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

/**
 * @param event WithdrawStakingV2
 */
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

/**
 * @param event DepositAggregatorUniswapV3
 */
export function handleDepositAggregatorUniswapV3(event: DepositAggregatorUniswapV3): void {
  let user = User.load(event.params.user.toHex());
  if (user === null) {
    user = initializeUser(event.params.user.toHex());
  }

  if (!user.aggregatorIsActive) {
    user.aggregatorIsActive = true;
    updateNumberUsersAggregator(event.block.timestamp, true);
  }

  user.aggregatorAdjustedDepositAmount = user.aggregatorAdjustedDepositAmount.plus(toBigDecimal(event.params.amount));
  user.aggregatorLastDepositDate = event.block.timestamp;
  updateDailySnapshotDepositAggregator(event.block.timestamp, toBigDecimal(event.params.amount));
  user.save();
}

/**
 * @param event WithdrawAggregatorUniswapV3
 */
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
  }

  user.aggregatorLastWithdrawDate = event.block.timestamp;
  updateDailySnapshotWithdrawAggregator(event.block.timestamp, toBigDecimal(event.params.amount));

  user.save();
}

/**
 * @param call WithdrawCallAggregatorUniswapV3
 */
export function handleCallWithdrawAggregatorUniswapV3(call: WithdrawCallAggregatorUniswapV3): void {
  const user = User.load(call.from.toHex());
  if (user !== null && user.aggregatorAdjustedDepositAmount.equals(ZERO_BD)) {
    const userShares = fetchSharesAggregator(call.from);
    if (userShares.equals(ZERO_BI) && user.aggregatorIsActive) {
      user.aggregatorIsActive = false;
      updateNumberUsersAggregator(call.block.timestamp, false);
    }
    user.save();
  }
}

/**
 * @param call WithdrawAllCallAggregatorUniswapV3
 */
export function handleCallWithdrawAllAggregatorUniswapV3(call: WithdrawAllCallAggregatorUniswapV3): void {
  const user = User.load(call.from.toHex());
  if (user !== null && user.aggregatorAdjustedDepositAmount.equals(ZERO_BD)) {
    if (user.aggregatorIsActive) {
      user.aggregatorIsActive = false;
      updateNumberUsersAggregator(call.block.timestamp, false);
    }
    user.save();
  }
}

/**
 * @param event ConversionToLOOKSAggregatorUniswapV3
 */
export function handleConversionToLOOKSAggregatorUniswapV3(event: ConversionToLOOKSAggregatorUniswapV3): void {
  const conversion = new AggregatorConversion(event.transaction.hash.toHex());
  conversion.block = event.block.number;
  conversion.date = event.block.timestamp;
  conversion.block = event.block.number;
  conversion.amountReceived = toBigDecimal(event.params.amountReceived);
  conversion.amountSold = toBigDecimal(event.params.amountSold);
  conversion.priceOfETHInLOOKS = conversion.amountReceived.div(conversion.amountSold);

  updateDailySnapshotConversion(event.block.timestamp, conversion.amountReceived, conversion.amountSold);

  conversion.save();
}

/**
 * @param event AirdropRewardsClaim
 */
export function handleAirdropClaim(event: AirdropRewardsClaim): void {
  let user = User.load(event.params.user.toHex());
  if (user === null) {
    user = initializeUser(event.params.user.toHex());
  }
  user.airdropAmount = toBigDecimal(event.params.amount);
  user.airdropClaimDate = event.block.timestamp;
  user.save();
}

/**
 * @param event RewardsClaim
 */
export function handleTradingRewardsClaim(event: TradingRewardsClaim): void {
  let user = User.load(event.params.user.toHex());
  if (user === null) {
    user = initializeUser(event.params.user.toHex());
  }
  user.tradingRewardsAmount = user.tradingRewardsAmount.plus(toBigDecimal(event.params.amount));
  user.tradingRewardsLastClaimDate = event.block.timestamp;
  user.save();
}

/**
 * @param event Claim
 */
export function handleMultiRewardsClaim(event: MultiRewardsClaim): void {
  let user = User.load(event.params.user.toHex());
  if (user === null) {
    user = initializeUser(event.params.user.toHex());
  }

  if (event.params.treeIds[0] == 0) {
    user.tradingRewardsAmount = user.tradingRewardsAmount.plus(toBigDecimal(event.params.amounts[0]));
    user.tradingRewardsLastClaimDate = event.block.timestamp;
  } else if (event.params.treeIds[0] == 1) {
    user.listingRewardsAmount = user.listingRewardsAmount.plus(toBigDecimal(event.params.amounts[0]));
    user.listingRewardsLastClaimDate = event.block.timestamp;
  }

  if (event.params.treeIds.length == 2) {
    if (event.params.treeIds[1] == 0) {
      user.tradingRewardsAmount = user.tradingRewardsAmount.plus(toBigDecimal(event.params.amounts[1]));
      user.tradingRewardsLastClaimDate = event.block.timestamp;
    } else if (event.params.treeIds[1] == 1) {
      user.listingRewardsAmount = user.listingRewardsAmount.plus(toBigDecimal(event.params.amounts[1]));
      user.listingRewardsLastClaimDate = event.block.timestamp;
    }
  }

  user.save();
}
