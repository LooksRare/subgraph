/* eslint-disable prefer-const */
import { BigInt } from "@graphprotocol/graph-ts";
import { Collection, Overview, User } from "../generated/schema";
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

  let overview = Overview.load(BigInt.fromI32(1).toHex());

  if (overview === null) {
    overview = new Overview(BigInt.fromI32(1).toHex());
    overview.countApprovalsTotal = BigInt.zero();
    overview.countApprovalsERC721 = BigInt.zero();
    overview.countApprovalsERC1155 = BigInt.zero();
    overview.numberCollections = BigInt.zero();
    overview.numberCollectionsERC721 = BigInt.zero();
    overview.numberCollectionsERC1155 = BigInt.zero();
    overview.numberUsers = BigInt.zero();
  } else {
    // Verify the total number of approvals is less than the limit
    if (overview.countApprovalsTotal.ge(NUMBER_APPROVALS)) {
      return;
    }
  }

  let collection = Collection.load(event.address.toHex());
  if (collection === null) {
    collection = new Collection(event.address.toHex());
    collection.countApprovals = BigInt.zero();
    overview.numberCollections = overview.numberCollections.plus(ONE_BI);
    if (event.params.operator.toHex() === TRANSFER_MANAGER_ERC721) {
      overview.numberCollectionsERC721 = overview.numberCollectionsERC721.plus(ONE_BI);
    } else {
      overview.numberCollectionsERC1155 = overview.numberCollectionsERC1155.plus(ONE_BI);
    }
  }
  collection.countApprovals = collection.countApprovals.plus(ONE_BI);
  overview.countApprovalsTotal = overview.countApprovalsTotal.plus(ONE_BI);

  if (event.params.operator.toHex() === TRANSFER_MANAGER_ERC721) {
    overview.countApprovalsERC721 = overview.countApprovalsERC721.plus(ONE_BI);
  } else {
    overview.countApprovalsERC1155 = overview.countApprovalsERC1155.plus(ONE_BI);
  }

  let user = User.load(event.params.owner.toHex());
  if (user === null) {
    user = new User(event.params.owner.toHex());
    user.countApprovals = BigInt.zero();
    overview.numberUsers = overview.numberUsers.plus(ONE_BI);
  }

  // Verify the user has not done more approvals than authorized
  if (user.countApprovals.ge(MAX_APPROVALS_PER_ADDRESS)) {
    return;
  }
  user.countApprovals = user.countApprovals.plus(ONE_BI);

  overview.save();
  collection.save();
  user.save();
}
