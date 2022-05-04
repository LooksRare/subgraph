import { Address, BigInt } from "@graphprotocol/graph-ts";
import { assert, clearStore, log, test } from "matchstick-as/assembly/index";
import { createMultiRewardsClaim } from "./helpers/multiRewardsDistributor/utils";
import { User } from "../generated/schema";
import { handleMultiRewardsClaim } from "../mappings";
import { parseEther } from "../../../helpers/utils";
import { FOUR_BI, ONE_BI, THREE_BI, TWO_BI } from "../../../helpers/constants";

test("Trading/Listing rewards claimed", () => {
  const userAddress = Address.fromString("0x0000000000000000000000000000000000000001");
  /**
   * 1. User claims 20 LOOKS for trading rewards and 10 LOOKS for listing rewards
   */
  let rewardRound = ONE_BI;
  let amountTradingRewardsInLOOKS = 20; // 20 LOOKS
  let amountListingRewardsInLOOKS = 10; // 10 LOOKS
  let totalAmount = parseEther(amountListingRewardsInLOOKS + amountTradingRewardsInLOOKS);
  let treeIds = [0, 1];
  let amountsClaimed = [parseEther(amountTradingRewardsInLOOKS), parseEther(amountListingRewardsInLOOKS)];
  let blockTimestamp = BigInt.fromU32(1651086000);

  let newRewardsClaimEvent = createMultiRewardsClaim(
    userAddress,
    rewardRound,
    totalAmount,
    treeIds,
    amountsClaimed,
    blockTimestamp
  );
  handleMultiRewardsClaim(newRewardsClaimEvent);

  let user = User.load(userAddress.toHex());
  if (user !== null) {
    assert.bigIntEquals(user.tradingRewardsLastClaimDate, blockTimestamp);
    assert.stringEquals(user.tradingRewardsAmount.toString(), amountTradingRewardsInLOOKS.toString());
    assert.bigIntEquals(user.listingRewardsLastClaimDate, blockTimestamp);
    assert.stringEquals(user.listingRewardsAmount.toString(), amountListingRewardsInLOOKS.toString());
  } else {
    log.warning("User doesn't exist", []);
  }

  /**
   * 2. User claims only for listing rewards (15 LOOKS)
   */
  rewardRound = TWO_BI;
  amountListingRewardsInLOOKS = 15; // 15 LOOKS
  totalAmount = parseEther(amountTradingRewardsInLOOKS);
  treeIds = [1];
  amountsClaimed = [parseEther(amountListingRewardsInLOOKS)];
  let previousBlockTimestamp = blockTimestamp;
  blockTimestamp = BigInt.fromU32(1651087000);

  newRewardsClaimEvent = createMultiRewardsClaim(
    userAddress,
    rewardRound,
    totalAmount,
    treeIds,
    amountsClaimed,
    blockTimestamp
  );
  handleMultiRewardsClaim(newRewardsClaimEvent);

  user = User.load(userAddress.toHex());
  if (user !== null) {
    assert.bigIntEquals(user.tradingRewardsLastClaimDate, previousBlockTimestamp);
    assert.stringEquals(user.tradingRewardsAmount.toString(), amountTradingRewardsInLOOKS.toString());
    assert.bigIntEquals(user.listingRewardsLastClaimDate, blockTimestamp);
    assert.stringEquals(user.listingRewardsAmount.toString(), "25"); // 10 + 15
  } else {
    log.warning("User doesn't exist", []);
  }

  /**
   * 3. User claims only for trading rewards (8.5 LOOKS)
   */
  rewardRound = THREE_BI;
  totalAmount = parseEther(85, 17); // Shift decimals by 1 and multiply by 10 to avoid type error
  treeIds = [0];
  amountsClaimed = [parseEther(85, 17)];
  previousBlockTimestamp = blockTimestamp;
  blockTimestamp = BigInt.fromU32(1651097000);

  newRewardsClaimEvent = createMultiRewardsClaim(
    userAddress,
    rewardRound,
    totalAmount,
    treeIds,
    amountsClaimed,
    blockTimestamp
  );
  handleMultiRewardsClaim(newRewardsClaimEvent);

  user = User.load(userAddress.toHex());
  if (user !== null) {
    assert.bigIntEquals(user.tradingRewardsLastClaimDate, blockTimestamp);
    assert.stringEquals(user.tradingRewardsAmount.toString(), "28.5");
    assert.bigIntEquals(user.listingRewardsLastClaimDate, previousBlockTimestamp);
    assert.stringEquals(user.listingRewardsAmount.toString(), "25");
  } else {
    log.warning("User doesn't exist", []);
  }

  /**
   * 4. User claims for trading rewards (6 LOOKS) and listing rewards (4 LOOKS) (array order is inversed)
   */
  rewardRound = FOUR_BI;
  amountTradingRewardsInLOOKS = 6; // 6 LOOKS
  amountListingRewardsInLOOKS = 4; // 4 LOOKS
  totalAmount = parseEther(amountListingRewardsInLOOKS + amountTradingRewardsInLOOKS);
  treeIds = [1, 0];
  amountsClaimed = [parseEther(amountListingRewardsInLOOKS), parseEther(amountTradingRewardsInLOOKS)];
  blockTimestamp = BigInt.fromU32(1651156000);

  newRewardsClaimEvent = createMultiRewardsClaim(
    userAddress,
    rewardRound,
    totalAmount,
    treeIds,
    amountsClaimed,
    blockTimestamp
  );
  handleMultiRewardsClaim(newRewardsClaimEvent);

  user = User.load(userAddress.toHex());
  if (user !== null) {
    assert.bigIntEquals(user.tradingRewardsLastClaimDate, blockTimestamp);
    assert.stringEquals(user.tradingRewardsAmount.toString(), "34.5"); // 28.5 + 6
    assert.bigIntEquals(user.listingRewardsLastClaimDate, blockTimestamp);
    assert.stringEquals(user.listingRewardsAmount.toString(), "29"); // 25 + 4
  } else {
    log.warning("User doesn't exist", []);
  }

  clearStore();
});
