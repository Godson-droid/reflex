#!/usr/bin/env python3
"""Reflex one-loop runner (helper for run-loop.sh). Stdlib only.

Signing is delegated to `cast send` (key from the PRIVATE_KEY environment
variable, set by run-loop.sh from .env; never printed here). Reads and
polling use plain JSON-RPC over urllib.
"""
import json
import os
import subprocess
import sys
import time
import urllib.request

BASE = os.environ.get("BASE_SEPOLIA_RPC", "https://sepolia.base.org")
LASNA = os.environ.get("LASNA_RPC", "https://lasna-rpc.rnk.dev/")
PAIR = os.environ["PAIR"]
GUARDIAN = os.environ["GUARDIAN"]
CALLBACK = os.environ["CALLBACK"]
WETH = os.environ["TOKEN_WETH"]
USDC = os.environ["TOKEN_USDC"]
OWNER = os.environ["WALLET_ADDRESS"]
PK = os.environ["PRIVATE_KEY"]
E18 = 10 ** 18


def rpc(url, method, params):
    body = json.dumps({"jsonrpc": "2.0", "id": 1, "method": method, "params": params}).encode()
    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json", "User-Agent": "reflex-loop-runner/1.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        out = json.loads(r.read())
    if "error" in out:
        raise RuntimeError(out["error"])
    return out["result"]


def cast_call(url, to, sig, *args):
    cmd = ["cast", "call", to, sig, *args, "--rpc-url", url]
    return subprocess.run(cmd, capture_output=True, text=True, check=True).stdout.strip()


def cast_send(url, to, sig, *args, legacy_gas=None):
    cmd = ["cast", "send", to, sig, *args, "--rpc-url", url, "--private-key", PK, "--json"]
    if legacy_gas:
        cmd += ["--gas-price", str(legacy_gas)]
    out = subprocess.run(cmd, capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def reserves():
    raw = cast_call(BASE, PAIR, "getReserves()(uint112,uint112)")
    parts = [int(x.split()[0]) for x in raw.splitlines()]
    return parts[0], parts[1]


def out_for(amount_in, r_in, r_out):
    a = amount_in * 997
    return (a * r_out) // (r_in * 1000 + a)


def solve_in(r0, r1, target, sell_token0):
    lo, hi = 1, (r0 if sell_token0 else r1) * 3

    def price_after(inn):
        if sell_token0:
            return (r1 - out_for(inn, r0, r1)) / (r0 + inn)
        return (r1 + inn) / (r0 - out_for(inn, r1, r0))

    for _ in range(200):
        mid = (lo + hi) // 2
        p = price_after(mid)
        if sell_token0:
            lo, hi = (mid, hi) if p > target else (lo, mid)
        else:
            lo, hi = (mid, hi) if p < target else (lo, mid)
        if hi - lo <= 10 ** 12:
            break
    inn = (lo + hi) // 2
    out = out_for(inn, r0, r1) if sell_token0 else out_for(inn, r1, r0)
    return inn, out


def poll(fn, want, timeout=180, label=""):
    t0 = time.time()
    while time.time() - t0 < timeout:
        if fn() == want:
            return True
        time.sleep(3)
    raise TimeoutError(f"timed out waiting for {label}")


def topic0(sig):
    return subprocess.run(["cast", "keccak", sig], capture_output=True, text=True, check=True).stdout.strip()


def find_log(url, address, sig, from_block, match=None, timeout=120):
    """eth_getLogs in <=150-block windows (public RPCs cap the range)."""
    topic = topic0(sig)
    t0 = time.time()
    while time.time() - t0 < timeout:
        head = int(rpc(url, "eth_blockNumber", []), 16)
        b = from_block
        while b <= head:
            logs = rpc(url, "eth_getLogs", [{"address": address, "topics": [topic],
                                             "fromBlock": hex(b), "toBlock": hex(min(b + 149, head))}])
            for lg in logs:
                if match is None or match(lg):
                    return lg["transactionHash"], int(lg["blockNumber"], 16)
            b += 150
        time.sleep(3)
    return None, None


def main():
    kind, target = sys.argv[1], float(sys.argv[2])
    sell0 = kind == "stop-loss"
    r0, r1 = reserves()
    print(f"price before: {r1 / r0:.2f}  reserves: {r0 / E18:.4f} WETH / {r1 / E18:.2f} USDC")
    if cast_call(LASNA, GUARDIAN, "state()(uint8)") != "1":
        sys.exit("guardian is not Armed")
    if cast_call(BASE, CALLBACK, "status()(uint8)") != "0":
        sys.exit("callback is not Armed")
    inn, out = solve_in(r0, r1, target, sell0)
    token = WETH if sell0 else USDC
    print(f"trigger swap: in {inn / E18:.6f} {'WETH' if sell0 else 'USDC'} -> out {out / E18:.6f}")
    cast_send(BASE, token, "transfer(address,uint256)", PAIR, str(inn))
    swap = cast_send(BASE, PAIR, "swap(uint256,uint256,address)",
                     "0" if sell0 else str(out), str(out) if sell0 else "0", OWNER)
    origin_block = int(swap["blockNumber"], 16)
    print(f"origin tx:   {swap['transactionHash']} (block {origin_block})")
    lasna_start = int(rpc(LASNA, "eth_blockNumber", []), 16)
    poll(lambda: cast_call(LASNA, GUARDIAN, "state()(uint8)"), "2", label="guardian Triggered")
    origin_word = "%064x" % int(swap["transactionHash"], 16)
    rtx, rblock = find_log(LASNA, GUARDIAN, "Triggered(uint8,uint256,uint256)", lasna_start,
                           match=lambda lg: origin_word in lg["data"].lower())
    print(f"reactive tx: {rtx} (block {rblock})")
    poll(lambda: cast_call(BASE, CALLBACK, "status()(uint8)"), "1", label="callback Executed")
    ctx, cblock = find_log(BASE, CALLBACK,
                           "Executed(uint8,uint256,uint256,uint256,uint256)", origin_block)
    le = cast_call(BASE, CALLBACK,
                   "lastExecution()(uint8,uint256,uint256,uint256,uint256,uint256)")
    vals = [int(x.split()[0]) for x in le.splitlines()]
    print(f"callback tx: {ctx} (block {cblock}, latency {cblock - origin_block} blocks)")
    print(f"executed:    kind {vals[0]} ({'stop-loss' if vals[0] == 1 else 'take-profit'}), "
          f"price {vals[2] / E18:.2f}, amountIn {vals[3] / E18:.4f} WETH, "
          f"amountOut {vals[4] / E18:.6f} USDC")
    cast_send(BASE, CALLBACK, "rearm(uint256,uint256,uint256)",
              str(10 * E18), str(2700 * E18), str(3300 * E18))
    cast_send(LASNA, GUARDIAN, "rearm()", legacy_gas=120_000_000_000)
    print("re-armed:    guardian and callback are Watching/Armed again")


if __name__ == "__main__":
    main()
