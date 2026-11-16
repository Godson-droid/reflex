# Reflex — a stop-loss & take-profit guardian that reacts so you don't have to

## Loop evidence — 30 executed loops on testnet, both directions

Reflex has executed its full reactive loop **30 times** on Base Sepolia +
Reactive Lasna: **15 stop-loss** and **15 take-profit** executions, every one a
10 WETH protective sale, 791,604.82 USDC of protective sales in total, with
latencies of 5 to 17 Base blocks between the origin swap and the
callback execution. Every loop's balances were reconciled to the token: the
owner's USDC and WETH balances after each execution match the trigger swap
plus the on-chain execution record exactly (loop 5 reconciles once its
interleaved recovery swap is counted, and loop 17 took 17 blocks, the slowest
so far). The batch includes one single-move crash of 37 percent (2,890.34 to
1,820.00, loop 9), an in-band negative proof (a move to 2,859.09 that the
guardian priced and correctly ignored), and a documented recovery-abort
attempt (see [evidence/abort-attempt](evidence/receipts/abort-attempt.json)).
Full data: [evidence/LOOPS.md](evidence/LOOPS.md),
[evidence/evidence.json](evidence/evidence.json), and one receipt file per
loop in [evidence/receipts/](evidence/receipts/).

| # | Kind | Trigger price | Executed price | Amount in | Amount out (USDC) | Latency (blocks) | Origin | Reactive | Callback |
|---|---|---|---|---|---|---|---|---|---|
| 1 | stop-loss | 2,084.38 | 2,084.38 | 10 WETH | 19,187.10 | 5 | [0x790b838a…](https://sepolia.basescan.org/tx/0x790b838a0f612a4bf1f1cee07e07da3c90b91662d3298e638b426bc02fa462db) | [0x6b8c818c…](https://lasna.reactscan.net/tx/0x6b8c818cf5bcab84d1baf0b5a6c6d3663eb88d76f2d0b08c1171b68b2c0b1e0f) | [0xec6a18cf…](https://sepolia.basescan.org/tx/0xec6a18cf3f7eadf1538dd6f97fca69af09a5f2812c676bcfc55d8fba13d5efa7) |
| 2 | take-profit | 3,427.98 | 3,427.98 | 10 WETH | 30,887.68 | 7 | [0x8bdab6d3…](https://sepolia.basescan.org/tx/0x8bdab6d3447de2ce89b8217c96d362c2d6ed0bd47f4e2d138de576e99796685a) | [0xa3966763…](https://lasna.reactscan.net/tx/0xa3966763ede1513e97e29440535603f75d26b4ee10c03012e4f36aab9a6a91b8) | [0x259cef4b…](https://sepolia.basescan.org/tx/0x259cef4b7b45be065b058fea2a3778f0e5ed31e4bb5c41f5bc0d6897a88d1791) |
| 3 | stop-loss | 2,200.00 | 2,200.00 | 10 WETH | 20,210.43 | 7 | [0xe65f8782…](https://sepolia.basescan.org/tx/0xe65f87821b82cd5c19d53143c306f5f1093ed342c94ba89d7802346c59133f1d) | [0xaba9c4ad…](https://lasna.reactscan.net/tx/0xaba9c4ad2e24471a9d71d52978f7704ec872f7049206f6bf17e1b6e3714cb4bc) | [0x912d1deb…](https://sepolia.basescan.org/tx/0x912d1deb444ea9dbd5ad89085c6b53dab9516c543984468d4f6aedf1c7056b1c) |
| 4 | take-profit | 3,600.00 | 3,600.00 | 10 WETH | 32,363.31 | 7 | [0x5d0fa801…](https://sepolia.basescan.org/tx/0x5d0fa80118540fb3c6cf2c34002fafbce738f541a00ec5eaff5a0fadbe2e9f72) | [0x6ea119d9…](https://lasna.reactscan.net/tx/0x6ea119d91091842acdc1bf320cb477a5edbfdb1e2519370c21c0fb038f7ea13a) | [0x6d1cfd00…](https://sepolia.basescan.org/tx/0x6d1cfd0021d2f971d1cda00b9ac3c3b88dd42904d2c2c619e9881ece71966bec) |
| 5 | stop-loss | 2,300.00 | 2,300.00 | 10 WETH | 21,093.28 | 6 | [0x2c0ef49e…](https://sepolia.basescan.org/tx/0x2c0ef49ebcffb04ad261386f54ae5155c732ae4abf98dd4dce51ca444c7b04de) | [0x89f4b7a6…](https://lasna.reactscan.net/tx/0x89f4b7a68c0f953d70a2f11f93d6d6b524f74a7bab33f4e18c62437cab517203) | [0xa2abe340…](https://sepolia.basescan.org/tx/0xa2abe34033b4a9625f869748cad6d6566c9eabeddef203c931b9e813bcf7d558) |
| 6 | take-profit | 3,650.00 | 3,650.00 | 10 WETH | 32,793.32 | 6 | [0xc2a78627…](https://sepolia.basescan.org/tx/0xc2a7862773203651adaf0d72a7d9890388efbad8a5be7f7c51bd4ffc0f6d1a45) | [0x34835255…](https://lasna.reactscan.net/tx/0x34835255585ef4059d5a1ba0abe3574571d964896e3e7eab54919eb6e4cf57af) | [0x623ad760…](https://sepolia.basescan.org/tx/0x623ad760a2b72b8a9468ad2d3d8fbb3f53f5fb1d1b1ac46069d36696cf1b6d97) |
| 7 | stop-loss | 2,350.00 | 2,350.00 | 10 WETH | 21,534.68 | 8 | [0xee295a9c…](https://sepolia.basescan.org/tx/0xee295a9c623f8d3cba86c14682f9eaf23eb949b8b2373bb20352ee464c21e967) | [0xb2e362a8…](https://lasna.reactscan.net/tx/0xb2e362a8f15ac5cb6510d45da24cdc93ed2c3e5eed4e10e2e8f155900d79a77c) | [0x57d352e0…](https://sepolia.basescan.org/tx/0x57d352e0358c2c12c7abb61e793b1d708e48cce66dcbea67575eae5f365482d5) |
| 8 | take-profit | 3,550.00 | 3,550.00 | 10 WETH | 31,940.95 | 9 | [0xe0aa93a0…](https://sepolia.basescan.org/tx/0xe0aa93a0443da4fd54f634f2b9a5526e4215fc439a1ebb61a73086e616cd1f55) | [0x42afbb8d…](https://lasna.reactscan.net/tx/0x42afbb8d9843e6d7d0cf83968e77a3142144834a5eaba5394876aad1a6e63eb2) | [0xde842c88…](https://sepolia.basescan.org/tx/0xde842c8851719012d830c1df57eaf93a9fe56d5a2d408da2e8c829b81ac594e2) |
| 9 | stop-loss | 1,820.00 | 1,820.00 | 10 WETH | 16,842.47 | 8 | [0x51bab7be…](https://sepolia.basescan.org/tx/0x51bab7be76b78f7be6b9caac0dc7d56b494305b8d4697d43344ebee0fc0cca11) | [0x77b2ed7d…](https://lasna.reactscan.net/tx/0x77b2ed7d44beafe0105dab60170fefb7b6edf295ff24ac3a16b8296b38179e09) | [0x3a5bc06b…](https://sepolia.basescan.org/tx/0x3a5bc06b692fa913c1b8dbe12f10053a022ca5d9550e6b3d3d5930476f97780a) |
| 10 | take-profit | 3,500.00 | 3,500.00 | 10 WETH | 31,516.05 | 8 | [0xc2195d88…](https://sepolia.basescan.org/tx/0xc2195d8805af7c3cb1d771d77803c7d3ae849863e79839281aa927bf811c4743) | [0xf7832fa2…](https://lasna.reactscan.net/tx/0xf7832fa2ac9e70711c8b4a86f73a93c0248b7a9aeb3fa08675d28e4debb04518) | [0x326f19d1…](https://sepolia.basescan.org/tx/0x326f19d127a1280dfd0ab5ca77e41665663070cc7bda85e9728e709ba851ead9) |
| 11 | stop-loss | 2,400.00 | 2,400.00 | 10 WETH | 21,977.35 | 10 | [0x7de5acd8…](https://sepolia.basescan.org/tx/0x7de5acd81f0887ff4762f2d989a8ee58c27c92223111a352b39cb406e1ea6c5e) | [0x25d8e75a…](https://lasna.reactscan.net/tx/0x25d8e75aeac832b78ee7aa355a39a56094726c32ceceaf015a4e669d377c9ce2) | [0x301f7087…](https://sepolia.basescan.org/tx/0x301f70877c6f556881b6fb8c84556dd0a11dd6236c23acf981d6af9f9bfbaa0e) |
| 12 | take-profit | 3,600.00 | 3,600.00 | 10 WETH | 32,374.48 | 9 | [0x190e7478…](https://sepolia.basescan.org/tx/0x190e7478d0af18119b0056f67e13cd7c2954c4be2f74f196a6225270730f60ee) | [0x8e264dc9…](https://lasna.reactscan.net/tx/0x8e264dc9f0458a330df880583bd721d9e023b85c4fc2bf25ba198049171fe0e3) | [0x117acb12…](https://sepolia.basescan.org/tx/0x117acb12f307196796e73d0eda0c002553cff61a66337ea77ac569e3e62f6cc3) |
| 13 | stop-loss | 2,250.00 | 2,250.00 | 10 WETH | 20,658.60 | 8 | [0xdc76c557…](https://sepolia.basescan.org/tx/0xdc76c55774f8bab71523524311b2305b2828db06c957a023d3972469bda3d01b) | [0x3048d2dd…](https://lasna.reactscan.net/tx/0x3048d2dd3458e2dd5292ac4063e2ff7a73102224e1dcf32c2a359c05bd68a1ec) | [0x48a02746…](https://sepolia.basescan.org/tx/0x48a027466e0aa9b0317f51ab71b16c9dd1b38bd98a3647cd19f3e3d1236d7a69) |
| 14 | take-profit | 3,500.00 | 3,500.00 | 10 WETH | 31,520.97 | 8 | [0xb997a57a…](https://sepolia.basescan.org/tx/0xb997a57ad02ed7665cf72b5fbe60069917293eee9bdb6aae83910ffd3110dd21) | [0xac8fc9e9…](https://lasna.reactscan.net/tx/0xac8fc9e9958326c2c79f3a04d7087cb6a5e1f1f6da3ae9d9987942e318226564) | [0x72c27dde…](https://sepolia.basescan.org/tx/0x72c27dde91197f9e6456f30fc6d739d7512bdfe560f85db8f8af9be6847f92ef) |
| 15 | stop-loss | 2,450.00 | 2,450.00 | 10 WETH | 22,419.22 | 8 | [0xbb9715c5…](https://sepolia.basescan.org/tx/0xbb9715c51bede378e8b104ccd9561bbff2c53bee85fe856d0e84116e7e49f528) | [0xe282f9c1…](https://lasna.reactscan.net/tx/0xe282f9c189db2d65cdc2790b245a12eb0aac09227d95d3a3b6ed4f1994cb4d42) | [0xe3530e63…](https://sepolia.basescan.org/tx/0xe3530e63fdfa352ec00adb747e91fc808f585d6f3849d15ef9d5018d84fdf4d3) |
| 16 | take-profit | 3,500.00 | 3,500.00 | 10 WETH | 31,523.19 | 8 | [0x8094e9f1…](https://sepolia.basescan.org/tx/0x8094e9f12a6696bd62fc7d4b583c9d17ed529724de452f201c28e95c17c9680f) | [0xeb8a617e…](https://lasna.reactscan.net/tx/0xeb8a617e232d01c88ba7df721095fe186a79ccfed9ab4dc5d0e7f8603070debf) | [0xeda6acc8…](https://sepolia.basescan.org/tx/0xeda6acc82cd4d3ddd7541465a135a4358c6ce779fc9d9cbe859a5569366a60c1) |
| 17 | stop-loss | 2,200.00 | 2,200.00 | 10 WETH | 20,219.86 | 17 | [0xc1414abb…](https://sepolia.basescan.org/tx/0xc1414abb0f62d2aa8abd2dd2add1a0fb66041bfba1d65867a2ee694003534677) | [0xb2b9244d…](https://lasna.reactscan.net/tx/0xb2b9244d3f81f6550084f827aab580cdd3c00a1c97c9290fc6a7385eb5841069) | [0x194ade85…](https://sepolia.basescan.org/tx/0x194ade8535ee9dafcb2c517e850109bc4ff20e81bc236a0debcef97446327b1a) |
| 18 | take-profit | 3,500.00 | 3,500.00 | 10 WETH | 31,525.78 | 7 | [0x7c9104b7…](https://sepolia.basescan.org/tx/0x7c9104b78303fe14098c60df5c1ac11224c553d919b3041a4050fad384c051f9) | [0x7a2c5fdc…](https://lasna.reactscan.net/tx/0x7a2c5fdc8cc8bc702cb618606b2135f88ec5ae6afe451ed2dd850cb7a7a47618) | [0xcfdeee66…](https://sepolia.basescan.org/tx/0xcfdeee6696a1fdaf2d53cf60d1c6de36f6934b1476a9584cdd11b2e284350abe) |
| 19 | stop-loss | 2,400.00 | 2,400.00 | 10 WETH | 21,983.06 | 10 | [0xaa014488…](https://sepolia.basescan.org/tx/0xaa0144882472b481751b4d95f6f1d256c542a310f19d0135cb10219b3ef88c24) | [0x1140ef08…](https://lasna.reactscan.net/tx/0x1140ef08216bc885b66a1989de5671e1de8a33f7e4a174ebaa57cf4237e9e416) | [0xab4318bc…](https://sepolia.basescan.org/tx/0xab4318bcdbe1d3f927394b56a2b1e1e9e2d072c6af4b06aec2e7a1f3e4f13b8a) |
| 20 | take-profit | 3,600.00 | 3,600.00 | 10 WETH | 32,384.60 | 9 | [0xed2a0475…](https://sepolia.basescan.org/tx/0xed2a04757d2d7adb11064b6688df20f9b829acdd40741e028be8418025eb7a85) | [0xd4d5e615…](https://lasna.reactscan.net/tx/0xd4d5e615e30c61d38490ce02211629bbf01a84eee21ad14978d4e39d489041a8) | [0x3ae6154d…](https://sepolia.basescan.org/tx/0x3ae6154d111e42627cf025feff56e58e0b70ed97564312e3fe5da6c6f99da846) |
| 21 | stop-loss | 2,300.00 | 2,300.00 | 10 WETH | 21,104.59 | 9 | [0x04258cc8…](https://sepolia.basescan.org/tx/0x04258cc8dd0e7fa5bfb1b36b9fb6cc958c73e0e57ae9a12c95de05d74ff44462) | [0xf803ad96…](https://lasna.reactscan.net/tx/0xf803ad9640ef5b2f9b05cbc8d254200d2ee56944d7b9369951fb5e36448df996) | [0x8437cfa2…](https://sepolia.basescan.org/tx/0x8437cfa2c1ad2c1b2108d16cb1ab852192557f13c217e72f4986631dcf9d9dbf) |
| 22 | take-profit | 3,550.00 | 3,550.00 | 10 WETH | 31,959.14 | 8 | [0x9fbc3521…](https://sepolia.basescan.org/tx/0x9fbc3521c68807ec74f282b892dc240a0b0ddbe4a858f4f0c653fe3720629cb5) | [0x48b3c2f2…](https://lasna.reactscan.net/tx/0x48b3c2f2967778d07b9cf466565ac60ccf7956e021d4f48c10a3edaae1ae9280) | [0xdc709d56…](https://sepolia.basescan.org/tx/0xdc709d5601ad0240a54771829b07d1d8a4acdde9b7dd0d2ac10832ba75ef835c) |
| 23 | stop-loss | 2,450.00 | 2,450.00 | 10 WETH | 22,425.08 | 5 | [0xeb9a3a88…](https://sepolia.basescan.org/tx/0xeb9a3a88ac2137bc71ecdea2fbfbf10460b375aa3baf3597197c2df2ab18e170) | [0xd2b1a618…](https://lasna.reactscan.net/tx/0xd2b1a6189804e8ca7f6111552f8aa690be2e20e780f9a6479b4daede218157b1) | [0x2b5437a8…](https://sepolia.basescan.org/tx/0x2b5437a8097e31e5369da2173ddaf44825327e82f947d542be0a72db33ddb067) |
| 24 | take-profit | 3,650.00 | 3,650.00 | 10 WETH | 32,817.32 | 7 | [0xe78bf2b0…](https://sepolia.basescan.org/tx/0xe78bf2b0a1e07b8297163df4271e234f2cb219ee5ded43ccf8f11db6149085ca) | [0x98718a89…](https://lasna.reactscan.net/tx/0x98718a891a81a24c01f69b86bc4d8f94c0058ed1de56a5e00932d0c655a09e5f) | [0x5b9c8b84…](https://sepolia.basescan.org/tx/0x5b9c8b8411b7d02b208dfe05cc8f8d58b734929f4e8e3f15dc0ccc0ba37d9506) |
| 25 | stop-loss | 2,350.00 | 2,350.00 | 10 WETH | 21,547.58 | 10 | [0x22c5aa0f…](https://sepolia.basescan.org/tx/0x22c5aa0f63e6ad7de32d88ac4640ab3bfdec3b1e36ce9b60a3479a2b21c60e20) | [0x8fd92e93…](https://lasna.reactscan.net/tx/0x8fd92e93a3bd7bfe153381c632c6492bd7afc9ac244471dcafaec610f64c9ce6) | [0x733c6f26…](https://sepolia.basescan.org/tx/0x733c6f268c24324f416fe3ce73b736967d7813a95292aa01f5edec79941d70dd) |
| 26 | take-profit | 3,500.00 | 3,500.00 | 10 WETH | 31,535.39 | 6 | [0x1191141a…](https://sepolia.basescan.org/tx/0x1191141a8c2f0eb2e7074aa270a72b17930bdadb83d9dde4ad203477deb8a534) | [0xf435954d…](https://lasna.reactscan.net/tx/0xf435954dde303003fd5fe4a1c61ed3f756419c75041998eab5afec164549f310) | [0x41963920…](https://sepolia.basescan.org/tx/0x41963920263ed05ffc5e759730b0ac8fd6c54f2e335f601c30e8dae2820de7fa) |
| 27 | stop-loss | 2,250.00 | 2,250.00 | 10 WETH | 20,667.67 | 7 | [0x1ff2c098…](https://sepolia.basescan.org/tx/0x1ff2c09897325d0c3314a96407631e763e0b47be74a9ee433b3fe0a5393a7e2b) | [0xc0d42ce4…](https://lasna.reactscan.net/tx/0xc0d42ce44a2f09039ed34a6c2adbe82fd9c0b2aa36c6f3e55c2d6cf727c5ae1c) | [0x94f4ff6c…](https://sepolia.basescan.org/tx/0x94f4ff6c10b32e94594c08af22c2dd0b56c7df5d4e5d6f8ddbdf7548b7d0ff5a) |
| 28 | take-profit | 3,600.00 | 3,600.00 | 10 WETH | 32,394.82 | 6 | [0xbeb33844…](https://sepolia.basescan.org/tx/0xbeb3384471795df96d891fd36082595e7dd649dd4c1e4915c6da048aaf890159) | [0xf8b0efb8…](https://lasna.reactscan.net/tx/0xf8b0efb8defc99f251e8110f28c28811e4902debdfdde0907d44c6ab96070511) | [0xd62d5444…](https://sepolia.basescan.org/tx/0xd62d5444af0a48037ea7c5ad92e798d66fc2ca9b63164a91218e72d550ff52ab) |
| 29 | stop-loss | 2,200.00 | 2,200.00 | 10 WETH | 20,227.54 | 9 | [0x8f50128a…](https://sepolia.basescan.org/tx/0x8f50128a5aa558b9ea24c96f0377c02f67dc018740dfe36191295f23b0f8ae53) | [0x72c5ced6…](https://lasna.reactscan.net/tx/0x72c5ced637252cba55e48177130bad1572c84d12ee8bb212be46cb5eb4bcbf88) | [0x18313beb…](https://sepolia.basescan.org/tx/0x18313bebc096528826e33881e1f327a4ac989c6f74520376f96c5b32e8f00a5e) |
| 30 | take-profit | 3,550.00 | 3,550.00 | 10 WETH | 31,969.31 | 10 | [0xf984a4ed…](https://sepolia.basescan.org/tx/0xf984a4edd699d3e1a8eec0367fbe738b339d298099b1722cc5170b7bb50db579) | [0xc21a37ae…](https://lasna.reactscan.net/tx/0xc21a37ae751d6b580714866bbe4d7b443327dcba73bbe709a8ce19bf0ddfb7f1) | [0xdee19555…](https://sepolia.basescan.org/tx/0xdee19555e29f3b35b47e9a9966760f3dbde5662665cbf735f11bfdd4d3e1b433) |

## Watches any V2-style pair — the Sync signal is the interface

ReflexGuardian does not integrate with one bespoke pool by address-specific
logic. It subscribes to the standard Uniswap V2 `Sync(uint112,uint112)` event
(topic `0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1`)
on the origin chain and derives the spot price from the reserves that event
carries, using the same PriceMath library the callback uses to re-verify the
price before swapping. Any pair that emits the standard Sync signal can be
watched by deploying a guardian pointed at it; ReflexPair is the reference
pair shipped here because the target testnets have no canonical liquid V2
pair to watch.


**Live demo: [godson-droid.github.io/reflex](https://godson-droid.github.io/reflex/)** — the web app, running live and reading the deployed contracts on-chain.

**Reflex** is an autonomous guardian for a Uniswap-V2-style liquidity position.
You arm it once with a price band — a stop-loss floor and a take-profit ceiling —
and then you can walk away. A reactive contract on **Reactive Lasna** watches the
pair's price around the clock; the moment the price touches your floor or your
ceiling, Reflex executes the protective swap on the destination chain by itself.
No keeper bot to babysit, no server to keep alive, no 3 a.m. price alerts: the
reaction is a property of the network, not of your infrastructure.

> Built for the **Reactive Omni Buildathon** (DoraHacks), track
> **Every Second Counts**.
>
> **Live on testnet, loop proven on-chain 30 times** (see the evidence table
> above): stop-loss and take-profit both fire end to end, and the deployment
> is currently re-armed and **watching**.

![Reflex UI, wired live to the deployment](web/docs/screenshots/wired-live.png)

## The problem

A stop-loss that depends on a person (or a person's server) is not a stop-loss.
Retail DeFi users who hold a token on an AMM have no native way to say "sell if
this drops 10%, sell if it rises 10%" — the pair contract only swaps when
someone sends a transaction. Centralized exchanges offer conditional orders
because a server watches prices for you; on-chain, you are the server. Reflex
moves that watcher into a reactive smart contract: the condition and the
execution are both on-chain, verifiable, and always awake.

## How the loop works

```
 Base Sepolia (origin)                Reactive Lasna                 Base Sepolia (destination)
┌───────────────────┐   Sync event   ┌────────────────────┐  callback  ┌─────────────────────┐
│ ReflexPair        │ ─────────────▶ │ ReflexGuardian     │ ───────────▶ │ ReflexCallback      │
│ reserves move on  │  (price data)  │ prices the Sync,   │  request     │ re-checks the price │
│ every swap/mint   │                │ checks the band,   │  (V_1_0)     │ on-chain, swaps the │
│                   │                │ fires once         │              │ owner's tokens,     │
└───────────────────┘                └────────────────────┘              │ proceeds → owner    │
                                                                          └─────────────────────┘
```

1. **Origin event.** Every swap or liquidity change on `ReflexPair` updates its
   reserves and emits `Sync(reserve0, reserve1)` — the standard V2 price signal.
2. **Reactive transaction.** `ReflexGuardian` (on Lasna) is subscribed to the
   pair's `Sync` events. For each one it derives the spot price
   (`reserveBuy / reserveSell`, 1e18-scaled) and compares it with the armed band.
   Prices inside the band cost a few gas and nothing else happens.
3. **Callback.** On the first breach, the guardian marks itself *Triggered*
   (one-shot: it cannot fire twice) and calls `SYSTEM.requestCallbackV_1_0`
   with a payload for `ReflexCallback.executeGuard`. The payload's first
   argument is the `address(0)` placeholder Reactive overwrites with the
   guardian's address.
4. **Execution.** The callback arrives through Base Sepolia's callback proxy.
   `ReflexCallback` authenticates it twice (proxy as caller, guardian as the
   injected sender), **re-derives the price from live reserves** — if the market
   already recovered, it aborts and stays armed — then pulls the owner's tokens
   into the pair, swaps them at the constant-product price, and sends the
   proceeds directly to the owner. The execution (kind, observed vs. executed
   price, amounts) is stored on-chain and emitted as an event.

## Design choices worth noting

- **One-shot by default.** A stop-loss that re-fires on every `Sync` after the
  breach would keep selling into a falling market. Reflex fires once, then
  waits for the owner to deliberately re-arm (guardian `rearm()` + callback
  `rearm()` with a matching band).
- **Execution re-verification.** The Lasna-side observation is evidence, not
  proof. The callback re-prices from live reserves and aborts if the condition
  no longer holds or the trigger kind changed — protection against stale or
  manipulated triggers, and it means a recovered market never gets sold into.
- **Inclusive boundaries.** Touching the floor *is* the stop-loss; touching the
  ceiling *is* the take-profit. A guardian exists to act at the boundary.
- **Abort ≠ revert.** Aborted executions return cleanly with an
  `ExecutionAborted` event. A reverting callback is still billed by the proxy
  and surfaces only as a `CallbackFailure`; an abort is recorded, explained,
  and leaves the guard armed.
- **No router dependency.** The callback swaps directly against the pair using
  the constant-product formula (0.3% fee), so the execution path has exactly
  one external dependency: the pair itself.
- **Shared math.** `PriceMath` (spot price, band evaluation, swap output) is
  used identically on both chains, so "triggered" means the same thing
  everywhere.

## Contracts

| Contract | Chain | Role |
|---|---|---|
| `ReflexPair` | Base Sepolia | Minimal V2-style pair; the price origin. Emits `Sync` on every reserve change. |
| `ReflexGuardian` | Reactive Lasna (5318007) | Reactive contract. Subscribes to the pair's `Sync`, prices it, fires one callback per arming. |
| `ReflexCallback` | Base Sepolia | Callback contract. Authenticates, re-verifies, swaps, records. |
| `PriceMath` | both | Shared library: spot price, band evaluation, swap output. |
| `MockERC20` | Base Sepolia | Test asset for the testnet deployment. |

One guardian protects one position (one pair, one sell direction, one amount).
Several positions → several guardians, each small, independently funded and
independently auditable.

## Live deployment (testnet, 2026-11-15)

All contracts are verified on Sourcify with `exact_match` (creation + runtime).
Deployer / position owner: `0xfe332e01162D5408211DAAC305254E2456e5e437`
(testnet-only wallet). Explorers: Base Sepolia —
https://sepolia.basescan.org · Lasna — https://lasna.reactscan.net

| Contract | Chain | Address | Deploy tx |
|---|---|---|---|
| MockERC20 "WETH" (pair token0) | Base Sepolia (84532) | `0x057A04Ad09c9A1fD83088F9863E81b181f8a4D9A` | `0x407a9ee42a98d4fbcf15927b6d650cba07d81e4eb89880802a5c9c224637d672` |
| MockERC20 "USDC" (pair token1) | Base Sepolia (84532) | `0xA37786bDdda4FA1039291A25cC9043669Fb42DFd` | `0x04e697e4863327a20c55e6783c664efec69335424b3ed84ace23adae76eeccd4` |
| ReflexPair | Base Sepolia (84532) | `0x1bC9aB7D74f12897A44717B9497478e2b01CE2D6` | `0xe6b5616cb2d5839615f8ba489e8e0d04c2aba0b4667b4ae1bb09af3ac8068183` |
| ReflexGuardian | Reactive Lasna (5318007) | `0x057A04Ad09c9A1fD83088F9863E81b181f8a4D9A` | `0x5f15f812c97023520e4c981feb0cf31e9d0399d8cbc90c34f0c908de7dee48cf` |
| ReflexCallback | Base Sepolia (84532) | `0x7858F9f40dBdB2Edfd32c781a98c69294cd009d0` | `0xc92e7d7c50886af944c8db74dc71ecf9c93946caef73c54a8518d5fed4893777` |

Note: the WETH token (Base Sepolia) and ReflexGuardian (Lasna) share an address
because both were the deployer's nonce-0 transaction on their respective
chains. They are different contracts on different networks.

**Configuration:** pair seeded with 100 WETH / 300,000 USDC → starting price
**3,000 USDC/WETH**. Guard band: **stop-loss 2,700 · take-profit 3,300**,
protected amount **10 WETH**. Guardian funded with 5 lREACT; callback funded
with Base Sepolia ETH (callbacks are billed to the recipient).

### The loop, run twice (execution evidence)

**Run 1 — stop-loss.** A 20 WETH sell moved the pair's price through the floor:

| Step | Chain | Tx |
|---|---|---|
| Origin swap (Sync prints 2,084.38) | Base Sepolia, block 59029446 | `0x790b838a0f612a4bf1f1cee07e07da3c90b91662d3298e638b426bc02fa462db` |
| Reactive transaction (guardian `react()` → `Triggered(kind=1, price=2084.3755)`) | Lasna, block 8391301 | `0x6b8c818cf5bcab84d1baf0b5a6c6d3663eb88d76f2d0b08c1171b68b2c0b1e0f` |
| Callback execution (protective swap settles) | Base Sepolia, block 59029451 | `0xec6a18cf3f7eadf1538dd6f97fca69af09a5f2812c676bcfc55d8fba13d5efa7` |

On-chain `Execution` record: kind = 1 (stop-loss), observed = executed price
2,084.3755 USDC/WETH, amountIn = 10 WETH, **amountOut = 19,187.096 USDC** paid
to the owner.

**Run 2 — take-profit** (after re-arming both contracts). A 90,000 USDC buy
moved the price through the ceiling:

| Step | Chain | Tx |
|---|---|---|
| Origin swap (Sync prints 3,427.98) | Base Sepolia, block 59029831 | `0x8bdab6d3447de2ce89b8217c96d362c2d6ed0bd47f4e2d138de576e99796685a` |
| Reactive transaction (`Triggered(kind=2, price=3427.9777)`) | Lasna, block 8391374 | `0xa3966763ede1513e97e29440535603f75d26b4ee10c03012e4f36aab9a6a91b8` |
| Callback execution | Base Sepolia, block 59029838 | `0x259cef4b7b45be065b058fea2a3778f0e5ed31e4bb5c41f5bc0d6897a88d1791` |

On-chain `Execution` record: kind = 2 (take-profit), observed = executed price
3,427.9777, amountIn = 10 WETH, **amountOut = 30,887.684 USDC**.

After run 2 both contracts were re-armed, so the live deployment is back in
**Watching** state (guardian `Armed`, callback `Armed`, price inside the band).
Full deployment record, funding path and balances: [contracts/DEPLOYMENT.md](contracts/DEPLOYMENT.md).

## Repository layout

```
reflex/
├── contracts/          Foundry project (Solidity 0.8.29)
│   ├── src/            ReflexPair, ReflexGuardian, ReflexCallback, PriceMath, MockERC20
│   ├── test/           31 unit tests + mock system contract / callback proxy
│   └── DEPLOYMENT.md   Full testnet deployment record
├── web/                Vite + React + TypeScript UI, wired live to the deployment
│   ├── src/lib/chain.ts  CONTRACTS config + live reads
│   └── docs/screenshots/
├── LICENSE             MIT
└── README.md
```

## Run it

**Contract tests** (31 tests, all passing):

```bash
cd contracts
forge test
```

Unit tests etch a mock system contract onto the real system-contract address
(`0x8888888888888888888888888888888888888888`), so the guardian's constructor
subscription and callback requests are exercised end-to-end locally, and a mock
callback proxy exercises the callback's two-layer authentication.

**Web UI:**

```bash
cd web
npm install
npm run dev      # or: npm run build && npm run preview
```

The UI reads the live deployment: `CONTRACTS` in `web/src/lib/chain.ts` carries
the addresses above, and price plus guardian/callback state are read directly
from the contracts. The two recorded loop runs are presented with their real
transaction hashes.

## Deployment runbook (testnet)

Order matters — the callback immutably authorizes the guardian's address, and
the guardian needs the callback's address before it can fire:

1. Deploy `MockERC20` ×2 and `ReflexPair` on Base Sepolia; seed liquidity
   (`transfer` both tokens to the pair, then `mint`).
2. Deploy `ReflexGuardian` on Lasna (funded with lREACT — it pays for its own
   reactive transactions).
3. Deploy `ReflexCallback` on Base Sepolia with the chain's callback proxy
   (`0x476F44b11F5C942c58f4c8E3d0300E5710743585`), the guardian's address, the
   pair, and the band; fund it with Base Sepolia ETH.
4. On the guardian: `setCallback(callback)`, then
   `configure(sellToken0, floor, ceiling)`.
5. Owner approves `ReflexCallback` to spend the sell amount of the sold token.
6. Move the pair's price across the band (a swap) and watch the loop close:
   `Sync` → guardian `Triggered` event → callback `Executed` event.

Getting lREACT: send Sepolia ETH (≤ 5 ETH per transaction, 1 ETH → 100 lREACT)
to the Reactive faucet — Ethereum Sepolia
`0x9b9BB25f1A81078C544C829c5EB7822d747Cf434` or Base Sepolia
`0x2afaFD298b23b62760711756088F75B7409f5967` — calling
`request(yourLasnaAddress)`. (Addresses per the official docs,
dev.reactive.network/reactive-mainnet.)

## Tech stack

- **Contracts:** Solidity 0.8.29, Foundry (forge-std), Reactive Network's
  `reactive-lib-omni`; Reactive Lasna (chain 5318007) + Base Sepolia (84532).
- **Web:** React 19, TypeScript, Vite, Tailwind CSS, ethers v6.
- **Verification:** Sourcify exact-match on all five deployed contracts.

## License

MIT — see [LICENSE](LICENSE). The `reactive-lib-omni` dependency is Reactive
Network's library; the Uniswap V2 pair *interface conventions* (event
signatures and the swap calling convention) are used for interoperability,
while every contract in this repo is an original implementation written for
this project.
