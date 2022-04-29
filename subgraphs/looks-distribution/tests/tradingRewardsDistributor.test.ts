import { Address, BigInt } from "@graphprotocol/graph-ts";
import { assert, clearStore, log, test } from "matchstick-as/assembly/index";
import { createRewardsClaimEvent } from "./helpers/tradingRewardsDistributor/utils";
import { User } from "../generated/schema";
import { handleTradingRewardsClaim } from "../mappings";
import { parseEther } from "../../../helpers/utils";
import { ONE_BI, TWO_BI } from "../../../helpers/constants";

test("Trading rewards claimed", () => {
  const userAddress = Address.fromString("0x0000000000000000000000000000000000000001");
  /**
   * 1. User claims 20 LOOKS
   */
  let amountClaimedInLOOKS = 20; // 20 LOOKS
  let amountClaimedInLOOKSWei = parseEther(amountClaimedInLOOKS);
  let totalAmountClaimedInLOOKS = amountClaimedInLOOKS;

  let newRewardsClaimEvent = createRewardsClaimEvent(userAddress, ONE_BI, amountClaimedInLOOKSWei);
  handleTradingRewardsClaim(newRewardsClaimEvent);

  let user = User.load(userAddress.toHex());
  if (user !== null) {
    assert.bigIntEquals(user.tradingRewardsLastClaimDate, newRewardsClaimEvent.block.timestamp);
    assert.stringEquals(user.tradingRewardsAmount.toString(), amountClaimedInLOOKS.toString());
  } else {
    log.warning("User doesn't exist", []);
  }

  /**
   * 2. User has claimed 50 more LOOKS
   */
  amountClaimedInLOOKS = 50; // 50 LOOKS
  amountClaimedInLOOKSWei = parseEther(amountClaimedInLOOKS);
  totalAmountClaimedInLOOKS += amountClaimedInLOOKS;
  const blockTimestamp = BigInt.fromU32(1651086000);

  newRewardsClaimEvent = createRewardsClaimEvent(userAddress, TWO_BI, amountClaimedInLOOKSWei, blockTimestamp);
  handleTradingRewardsClaim(newRewardsClaimEvent);

  user = User.load(userAddress.toHex());

  if (user !== null) {
    assert.bigIntEquals(user.tradingRewardsLastClaimDate, blockTimestamp);
    assert.stringEquals(user.tradingRewardsAmount.toString(), totalAmountClaimedInLOOKS.toString());
  } else {
    log.warning("User doesn't exist", []);
  }

  clearStore();
});
