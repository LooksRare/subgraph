/* eslint-disable prefer-const */
import { Address } from "@graphprotocol/graph-ts";
import { assert, clearStore, log, test } from "matchstick-as/assembly/index";

import { createRewardsClaimEvent } from "./helpers/utils";
import { handleTradingRewardsClaim } from "../mappings";
import { User } from "../generated/schema";
import { parseEther, ONE_BI, TWO_BI } from "../../../helpers/utils";

test("RewardsClaim", () => {
  let userAddress = Address.fromString("0x0000000000000000000000000000000000000001");
  let amountInLOOKS = 20; // 20 LOOKS
  let amountClaimed = parseEther(amountInLOOKS);
  let totalAmountClaimed = amountInLOOKS;

  let newRewardsClaimEvent = createRewardsClaimEvent(userAddress, ONE_BI, amountClaimed);
  handleTradingRewardsClaim(newRewardsClaimEvent);

  let user = User.load(userAddress.toHex());
  if (user !== null) {
    assert.bigIntEquals(user.tradingRewardsLastClaimDate, newRewardsClaimEvent.block.timestamp);
    assert.stringEquals(user.tradingRewardsAmount.toString(), amountInLOOKS.toString());
  } else {
    log.warning("User doesn't exist", []);
  }

  amountInLOOKS = 50; // 50 LOOKS
  amountClaimed = parseEther(amountInLOOKS);
  totalAmountClaimed += amountInLOOKS;

  newRewardsClaimEvent = createRewardsClaimEvent(userAddress, TWO_BI, amountClaimed);
  // Adjust block timestamp to make it different
  newRewardsClaimEvent.block.timestamp = TWO_BI;
  handleTradingRewardsClaim(newRewardsClaimEvent);

  user = User.load(userAddress.toHex());
  if (user !== null) {
    assert.bigIntEquals(user.tradingRewardsLastClaimDate, newRewardsClaimEvent.block.timestamp);
    assert.stringEquals(user.tradingRewardsAmount.toString(), totalAmountClaimed.toString());
  } else {
    log.warning("User doesn't exist", []);
  }

  clearStore();
});
