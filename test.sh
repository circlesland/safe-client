#!/usr/bin/env bash

# https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/scripts/test.sh

# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
trap cleanup EXIT

cleanup() {
  # Kill the ganache instance that we started (if we started one and if it's still running).
  if [ -n "$ganache_pid" ] && ps -p $ganache_pid > /dev/null; then
    kill -9 $ganache_pid
  fi
}

ganache_port=8545

ganache_running() {
  nc -z localhost "$ganache_port"
}

start_ganache() {
  # We define 10 accounts with balance 1000M ether, needed for high-value tests.
  local accounts=(
    --account="0xbc30f4910e90b0474e1eefc71eb38105c0c300a3522197abf639e3d5a9e89e5e,1000000000000000000000000000000"
    --account="0x6573259192b19bd9bcb51a349d2f0d85860aaba14e621c2347bac4a116e886e9,1000000000000000000000000000000"
    --account="0xa06a89462fc38659cd67908e0fa0ceb5ab5a4e87f8943dd2b73797fdbdda8349,1000000000000000000000000000000"
  )

  node_modules/.bin/ganache-cli --gasLimit 0xfffffffffffff "${accounts[@]}" > /dev/null &
  ganache_pid=$!
}

export PRIVATE_KEY_HEX_STRING="0xbc30f4910e90b0474e1eefc71eb38105c0c300a3522197abf639e3d5a9e89e5e"

if ganache_running; then
  echo "Using existing ganache instance"
else
  echo "Starting our own ganache instance"
  start_ganache
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo $SCRIPT_DIR

SAFE_ADDRESS="$(node tests/deployContracts.js 1>&1)"
echo "New safe proxy: ${SAFE_ADDRESS}"
export SAFE_ADDRESS
npx jest
