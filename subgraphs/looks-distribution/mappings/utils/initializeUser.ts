import { User } from "../../generated/schema";
import { ZERO_BI, ZERO_BD } from "../../../../helpers/constants";

export function initializeUser(userID: string): User {
  const user = new User(userID);
  user.airdropAmount = ZERO_BD;
  user.airdropClaimDate = ZERO_BI;
  user.aggregatorAdjustedDepositAmount = ZERO_BD;
  user.aggregatorTotalCollectedLOOKS = ZERO_BD;
  user.aggregatorLastDepositDate = ZERO_BI;
  user.aggregatorLastWithdrawDate = ZERO_BI;
  user.aggregatorIsActive = false;
  user.feeSharingAdjustedDepositAmount = ZERO_BD;
  user.feeSharingTotalCollectedLOOKS = ZERO_BD;
  user.feeSharingTotalCollectedWETH = ZERO_BD;
  user.feeSharingLastDepositDate = ZERO_BI;
  user.feeSharingLastWithdrawDate = ZERO_BI;
  user.feeSharingLastHarvestDate = ZERO_BI;
  user.feeSharingIsActive = false;
  user.listingRewardsAmount = ZERO_BD;
  user.listingRewardsLastClaimDate = ZERO_BI;
  user.stakingPoolUniswapV2TotalCollectedLOOKS = ZERO_BD;
  user.stakingPoolUniswapV2LastDepositDate = ZERO_BI;
  user.stakingPoolUniswapV2LastHarvestDate = ZERO_BI;
  user.stakingPoolUniswapV2LastWithdrawDate = ZERO_BI;
  user.tradingRewardsAmount = ZERO_BD;
  user.tradingRewardsLastClaimDate = ZERO_BI;
  return user;
}
