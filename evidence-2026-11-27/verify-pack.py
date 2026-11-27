#!/usr/bin/env python3
"""Reflex evidence pack verifier (2026-11-27 run).

Recomputes the headline totals of evidence-pack.json directly from chain
receipts on Base Sepolia and Reactive Lasna. For every recorded loop it
checks: the trigger swap receipt (status, block, pair Sync), the guardian
Triggered receipt on Lasna (status, block, kind, and that it names the
trigger swap as its origin), and the callback receipt (status, block, an
Executed event selling exactly 10 WETH for the recorded USDC amount).
Fleet rows are checked the same way against each position's own guardian
and callback contracts, with the shared fleet event swap as origin.

Usage: python3 verify-pack.py [evidence-pack.json]
Exit code 0 means every row verified and the totals match the pack.
"""
import json, sys, time
import requests

BASE = 'https://sepolia.base.org'
LASNA = 'https://lasna-rpc.rnk.dev/'
PAIR = '0x1bC9aB7D74f12897A44717B9497478e2b01CE2D6'.lower()
GUARD = '0x057A04Ad09c9A1fD83088F9863E81b181f8a4D9A'.lower()
CB = '0x7858F9f40dBdB2Edfd32c781a98c69294cd009d0'.lower()
SYNC = '0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1'
TRIG = '0xe591eec20cfbb8fce2d26b7f7fd4673cc915a4bdbf07bf043fa67ebbe5c224f9'
EXEC = '0xd85b04e957801b15659f520e902c6ca58689fded0098fcea0a864cf29dec361d'
KIND = {'stop-loss': 1, 'take-profit': 2}

S = requests.Session()

def rpc(url, method, params):
    for attempt in range(4):
        try:
            r = S.post(url, json={'jsonrpc': '2.0', 'id': 1, 'method': method, 'params': params}, timeout=30)
            d = r.json()
            if 'result' in d:
                return d['result']
        except Exception:
            pass
        time.sleep(1.5 * (attempt + 1))
    return None

def receipt(url, tx):
    return rpc(url, 'eth_getTransactionReceipt', [tx])

def words(data):
    return [int(data[i:i + 64], 16) for i in range(2, len(data), 64)]

def check_execution(cb_receipt, cb_addr, expect_block, expect_out):
    errs = []
    if not cb_receipt or int(cb_receipt['status'], 16) != 1:
        return ['callback status']
    if int(cb_receipt['blockNumber'], 16) != expect_block:
        errs.append('callback block')
    ex = [g for g in cb_receipt['logs'] if g['address'].lower() == cb_addr and g['topics'][0] == EXEC]
    if not ex:
        errs.append('no Executed')
    else:
        w = words(ex[0]['data'])
        if w[2] != 10 * 10 ** 18:
            errs.append(f'amountIn {w[2]}')
        if abs(w[3] / 1e18 - expect_out) > 0.01:
            errs.append(f"amountOut chain {w[3] / 1e18} vs pack {expect_out}")
    return errs

def main():
    path = sys.argv[1] if len(sys.argv) > 1 else 'evidence-pack.json'
    pack = json.load(open(path))
    bad = []
    total_usdc = 0.0
    total_weth = 0.0
    for row in pack['loops']:
        errs = []
        ro = receipt(BASE, row['triggerTx'])
        if not ro or int(ro['status'], 16) != 1:
            errs.append('origin status')
        elif int(ro['blockNumber'], 16) != row['triggerBlock']:
            errs.append('origin block')
        elif not any(g['address'].lower() == PAIR and g['topics'][0] == SYNC for g in ro['logs']):
            errs.append('no Sync')
        rr = receipt(LASNA, row['reactiveTx'])
        if not rr or int(rr['status'], 16) != 1:
            errs.append('reactive status')
        elif int(rr['blockNumber'], 16) != row['reactiveBlock']:
            errs.append('reactive block')
        else:
            tg = [g for g in rr['logs'] if g['address'].lower() == GUARD and g['topics'][0] == TRIG]
            if not tg:
                errs.append('no Triggered')
            else:
                g = tg[0]
                if int(g['topics'][1], 16) != KIND[row['type']]:
                    errs.append('trigger kind')
                w = words(g['data'])
                if len(w) >= 2 and w[1] != int(row['triggerTx'], 16):
                    errs.append('trigger originTxHash')
        errs += check_execution(receipt(BASE, row['callbackTx']), CB, row['callbackBlock'], row['usdcSold'])
        if row['callbackBlock'] - row['triggerBlock'] != row['latencyBlocks']:
            errs.append('latency mismatch')
        if errs:
            bad.append((row['n'], errs))
        else:
            total_usdc += row['usdcSold']
            total_weth += row['wethSold']
    fleet_usdc = 0.0
    fleet_weth = 0.0
    for row in pack['fleet']:
        errs = []
        rr = receipt(LASNA, row['reactiveTx'])
        if not rr or int(rr['status'], 16) != 1:
            errs.append('reactive status')
        else:
            tg = [g for g in rr['logs'] if g['address'].lower() == row['guardian'].lower() and g['topics'][0] == TRIG]
            if not tg:
                errs.append('no Triggered')
            else:
                w = words(tg[0]['data'])
                if len(w) >= 2 and w[1] != int(row['eventOriginTx'], 16):
                    errs.append('trigger originTxHash')
        errs += check_execution(receipt(BASE, row['callbackTx']), row['callback'].lower(), row['callbackBlock'], row['usdcSold'])
        if row['callbackBlock'] - row['eventOriginBlock'] != row['deltaBlocksFromEvent']:
            errs.append('delta mismatch')
        if errs:
            bad.append((f"fleet-{row['position']}", errs))
        else:
            fleet_usdc += row['usdcSold']
            fleet_weth += row['wethSold']
    n_loops = len(pack['loops'])
    n_fleet = len(pack['fleet'])
    print(f"loops verified: {n_loops - len([b for b in bad if isinstance(b[0], int)])}/{n_loops}")
    print(f"fleet positions verified: {n_fleet - len([b for b in bad if isinstance(b[0], str)])}/{n_fleet}")
    print(f"loop totals recomputed from receipts: {total_weth:.0f} WETH sold, {total_usdc:,.2f} USDC")
    print(f"fleet totals recomputed from receipts: {fleet_weth:.0f} WETH sold, {fleet_usdc:,.2f} USDC")
    print(f"combined: {total_weth + fleet_weth:.0f} WETH sold, {total_usdc + fleet_usdc:,.2f} USDC")
    if bad:
        print('FAILURES:', bad)
        sys.exit(1)
    print('PACK VERIFIED: every row matches its chain receipts.')

if __name__ == '__main__':
    main()
