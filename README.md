# LooksRare Subgraph

## Description

This mono-repository contains all subgraphs ([using The Graph](https://docs.looksrare.org/developers/looksrare-subgraph-overview#what-is-a-subgraph)) available in the LooksRare ecosystem.

## List of subgraphs

| Name                 | Description                                                                            | Status                                        | Can run tests? |
| -------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------- | -------------- |
| Exchange             | Subgraph with trade events on the `LooksRareExchange`                                  | Deployed (Hosted Network + The Graph network) | ✅             |
| LOOKS Distribution   | Subgraph with events related to the LOOKS token distribution across multiple contracts | Deployed (Hosted Network)                     | ✅             |
| Royalty fee registry | Subgraph tracking collection royalty events from the `RoyaltyFeeRegistry` contract     | Deployed (Hosted Network)                     | ✅             |
| Airdrop              | Subgraph to calculate LOOKS airdrop based on `WyvernExchange` adjusted volumes         | Deprecated                                    | ❌             |
| EIP721               | Generic subgraph to track ERC-721 tokens                                               | Informational                                 | ❌             |
| EIP1155              | Generic subgraph to track ERC-1155 tokens                                              | Informational                                 | ❌             |

## Documentation

The documentation for **deployed subgraphs** is available [here](https://docs.looksrare.org/developers/category/subgraph-documentation).

## Setup and deployment

For any of the subgraphs (referred to as `[subgraph]` on the `mainnet` network):

1. Run the `cd subgraphs/[subgraph]` command to move to the subgraph directory.
2. Run the `yarn codegen` command to prepare the TypeScript sources for the GraphQL (`./generated/*`).
3. Run the `yarn build:mainnet` command to build the subgraph, and check compilation errors before deploying.
4. Run `graph auth --product hosted-service '<ACCESS_TOKEN>'` (for Hosted Service) or `graph auth --studio <DEPLOY KEY>'` (for The Graph network).
5. Deploy via `yarn deploy:mainnet`.

## Run tests

Unit tests are written using the [Matchstick framework from LimeChain](https://github.com/LimeChain/matchstick).

The [Matchstick framework](https://thegraph.com/docs/en/developer/matchstick/) requires Postgres installed, [read more here.](https://github.com/LimeChain/matchstick#os-specific-release-binaries-%EF%B8%8F)

For any of the subgraph supporting tests (referred to as `[subgraph]`):

1. Run the `cd subgraphs/[subgraph]` command to move to the subgraph directory.
2. Run the `yarn codegen` command to prepare the TypeScript sources for the GraphQL (`./generated/*`).
3. Run the `yarn build:mainnet` command to build the subgraph, and check compilation errors.
4. Run the `yarn test` command to execute the tests.
