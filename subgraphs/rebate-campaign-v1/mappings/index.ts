/* eslint-disable prefer-const */
import { BigInt } from "@graphprotocol/graph-ts";
import { Collection, Stats, User } from "../generated/schema";
import { ApprovalForAll } from "../generated/EIP721/EIP721";

const TRANSFER_MANAGER_ERC721 = "0xf42aa99f011a1fa7cda90e5e98b277e306bca83e";
const TRANSFER_MANAGER_ERC1155 = "0xfed24ec7e22f573c2e08aef55aa6797ca2b3a051";

const TRANSFER_MANAGERS = [TRANSFER_MANAGER_ERC721, TRANSFER_MANAGER_ERC1155];

const MAX_APPROVALS_PER_ADDRESS = BigInt.fromI32(10);
const NUMBER_APPROVALS = BigInt.fromI32(200000);
const ONE_BI = BigInt.fromI32(1);

export function handleApprovalForAll(event: ApprovalForAll): void {
  // Verify that approvalAll is for one of the two transfer managers
  if (!TRANSFER_MANAGERS.includes(event.params.operator.toHex())) {
    return;
  }

  let stats = Stats.load("1");

  if (stats === null) {
    stats = new Stats("1");
    stats.countApprovalsTotal = BigInt.zero();
    stats.countApprovalsERC721 = BigInt.zero();
    stats.countApprovalsERC1155 = BigInt.zero();
    stats.numberCollections = BigInt.zero();
    stats.numberCollectionsERC721 = BigInt.zero();
    stats.numberCollectionsERC1155 = BigInt.zero();
    stats.numberUsers = BigInt.zero();
  }

  // Verify the total number of approvals is less than the limit
  if (stats.countApprovalsTotal.ge(NUMBER_APPROVALS)) {
    return;
  }

  let collection = Collection.load(event.address.toHex());
  if (collection === null) {
    collection = new Collection(event.address.toHex());
    collection.countApprovals = BigInt.zero();
    stats.numberCollections = stats.numberCollections.plus(ONE_BI);
    if (event.params.operator.toHex() === TRANSFER_MANAGER_ERC721) {
      stats.numberCollectionsERC721 = stats.numberCollectionsERC721.plus(ONE_BI);
    } else {
      stats.numberCollectionsERC1155 = stats.numberCollectionsERC1155.plus(ONE_BI);
    }
  }
  collection.countApprovals = collection.countApprovals.plus(ONE_BI);

  if (event.params.operator.toHex() === TRANSFER_MANAGER_ERC721) {
    stats.countApprovalsERC721 = stats.countApprovalsERC721.plus(ONE_BI);
  } else {
    stats.countApprovalsERC1155 = stats.countApprovalsERC1155.plus(ONE_BI);
  }

  let user = User.load(event.params.owner.toHex());
  if (user === null) {
    user = new User(event.params.owner.toHex());
    user.countApprovals = BigInt.zero();
    stats.numberUsers = stats.numberUsers.plus(ONE_BI);
  }

  // Verify the user has not done more approvals than authorized
  if (user.countApprovals.ge(MAX_APPROVALS_PER_ADDRESS)) {
    return;
  }
  user.countApprovals = user.countApprovals.plus(ONE_BI);

  stats.save();
  collection.save();
  user.save();
}
