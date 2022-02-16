/* eslint-disable prefer-const */
import { BigInt } from "@graphprotocol/graph-ts";
import { Collection, Stats, User } from "../generated/schema";
import { ApprovalForAll } from "../generated/EIP721/EIP721";

const TRANSFER_MANAGER_ERC721 = "0xf42aa99F011A1fA7CDA90E5E98b277E306BcA83e";
const TRANSFER_MANAGER_ERC1155 = "0xFED24eC7E22f573c2e08AEF55aA6797Ca2b3A051";

const MAX_APPROVALS_PER_ADDRESS = BigInt.fromI32(5);
const NUMBER_APPROVALS = BigInt.fromI32(100000);
const ONE_BI = BigInt.fromI32(1);

export function handleApprovalForAll(event: ApprovalForAll): void {
  // Verify that approvalAll is for TransferManager
  if (
    event.params.operator.toHex() == TRANSFER_MANAGER_ERC721 ||
    event.params.operator.toHex() == TRANSFER_MANAGER_ERC1155
  ) {
    return;
  }

  let stats = Stats.load("0x");

  if (stats === null) {
    stats = new Stats("0x");
    stats.countApprovalsTotal = BigInt.zero();
    stats.countApprovalsERC721 = BigInt.zero();
    stats.countApprovalsERC1155 = BigInt.zero();
  }

  // Verify the total number of approvals is less than the limit
  if (stats.countApprovalsTotal.ge(NUMBER_APPROVALS)) {
    return;
  }

  let collection = Collection.load(event.address.toHex());
  if (collection === null) {
    collection = new Collection(event.address.toHex());
    collection.countApprovals = BigInt.zero();
  }
  collection.countApprovals = collection.countApprovals.plus(ONE_BI);

  let user = User.load(event.params.owner.toHex());
  if (user === null) {
    user = new User(event.params.owner.toHex());
    user.countApprovals = BigInt.zero();
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
