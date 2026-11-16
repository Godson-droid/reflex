#!/usr/bin/env bash
# run-loop.sh — fire ONE Reflex loop end to end on testnet and print the evidence.
#
# Usage:
#   script/run-loop.sh stop-loss  <targetPrice>   # sell WETH until price <= target
#   script/run-loop.sh take-profit <targetPrice>  # buy WETH until price >= target
#
# Example: script/run-loop.sh stop-loss 2200
#
# What it does:
#   1. Reads the deployment from deployments.env and the deployer key from .env
#      (the key is passed to `cast send` via the environment, never printed).
#   2. Sizes a trigger swap from the CURRENT pair reserves with the constant
#      product formula so the post swap price lands on the target, transfers the
#      input into ReflexPair and calls swap().
#   3. Polls ReflexGuardian on Reactive Lasna until it reports Triggered, then
#      polls ReflexCallback on Base Sepolia until it reports Executed.
#   4. Re-arms both contracts and prints origin / reactive / callback hashes.
#
# Requirements: foundry (cast) on PATH, python3. Testnet only.
#
# Wallet: the runner fires from the DEPLOYER wallet, so it needs a local
# .env in this directory holding PRIVATE_KEY and WALLET_ADDRESS for the
# deployment in deployments.env (the key is never committed; the published
# repo intentionally does not contain it). Point deployments.env and .env
# at your own deployment to run it against yours. Verifying any published
# loop needs no key at all: every hash is on the public explorers.
set -euo pipefail
cd "$(dirname "$0")/.."
export PATH="$HOME/.foundry/bin:$PATH"
set -a; source ./deployments.env; source ./.env; set +a
: "${PRIVATE_KEY:?PRIVATE_KEY missing from .env}"
exec python3 script/loop.py "$1" "$2"
