// Next, React
import {
  FC,
  useEffect,
} from 'react';

import bs58 from 'bs58';

import {
  AmountSide,
  CacheLTA,
  ComputeBudgetConfig,
  CurrencyAmount,
  InnerSimpleV0Transaction,
  InstructionType,
  jsonInfo2PoolKeys,
  Liquidity,
  LiquidityAddInstructionSimpleParams,
  LiquidityPoolKeys,
  Percent,
  splitTxAndSigners,
  Token,
  TOKEN_PROGRAM_ID,
  TokenAmount,
  TxVersion,
} from '@raydium-io/raydium-sdk';
import * as t from '@solana/spl-token';
import { NATIVE_MINT } from '@solana/spl-token';
// Wallet
import {
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react';
import {
  Connection,
  Keypair,
  PublicKey,
  Signer,
  Transaction,
  TransactionInstruction,
  VersionedTransaction,
} from '@solana/web3.js';

import { DEFAULT_TOKEN } from '../../configy';
import { formatAmmKeysById } from '../../formatAmmKeysById';
import { RaydiumDEX } from '../../markets/raydium';
// Store
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';
import {
  buildAndSendTx,
  getWalletTokenAccount,
} from '../../util';

const programId = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8";
const decodedDatas: any = []
/**/
type WalletTokenAccounts2 = Awaited<ReturnType<typeof getWalletTokenAccount>>
type TestTxInputInfo2 = {
  outputToken: Token
  targetPool: string
  inputTokenAmount: TokenAmount
  slippage: Percent
  walletTokenAccounts: WalletTokenAccounts2
  wallet: Keypair
}
async function swapOnlyAmm(input: TestTxInputInfo2) {
  try {
  // -------- pre-action: get pool info --------
  const targetPoolInfo = await formatAmmKeysById(input.targetPool)
  const poolKeys = jsonInfo2PoolKeys(targetPoolInfo) as LiquidityPoolKeys

  // -------- step 1: coumpute amount out --------
  const {  minAmountOut } = Liquidity.computeAmountOut({
    poolKeys: poolKeys,
    poolInfo: await Liquidity.fetchInfo({ connection, poolKeys }),
    amountIn: input.inputTokenAmount,
    currencyOut: input.outputToken,
    slippage: input.slippage,
  })

  // -------- step 2: create instructions by SDK function --------
  const { innerTransactions } = await Liquidity.makeSwapInstructionSimple({
    connection,
    poolKeys,
    userKeys: {
      tokenAccounts: input.walletTokenAccounts,
      owner: input.wallet.publicKey,
    },
    computeBudgetConfig: {
      microLamports: 32000},
    amountIn: input.inputTokenAmount,
    amountOut: minAmountOut,
    fixedSide: 'in',
    makeTxVersion: TxVersion.V0,
    config: {
      bypassAssociatedCheck: true,
      checkCreateATAOwner: true
    }
  })

  //console.log('amountOut:', amountOut.toFixed(), '  minAmountOut: ', minAmountOut.toFixed())

  return { minAmountOut, innerTxs: (innerTransactions) }
}
catch (err){
  console.error(err)
  return {innerTxs: []}
}
}
 function getSignature(
  transaction: Transaction | VersionedTransaction
): string {
  const signature =
    "signature" in transaction
      ? transaction.signature
      : transaction.signatures[0];
  if (!signature) {
    throw new Error(
      "Missing transaction signature, the transaction was not signed by the fee payer"
    );
  }
  return bs58.encode(signature);
}
const connection = new Connection("https://jarrett-solana-7ba9.mainnet.rpcpool.com/8d890735-edf2-4a75-af84-92f7c9e31718", 'confirmed');
// A simple cache object to store prices; in a more complex application, consider using a more robust caching solution
//let priceCache = {"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": 1}
//let fetchedCache = {}
//let accountCache = {}
//let confidenceCache = {"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": 1}
/*
// Function to calculate quartiles
function quartile(arr, q) {
  const sorted = arr.slice().sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
      return sorted[base];
  }
}
*/
//const url = `https://mainnet.helius-rpc.com/?api-key=baea1964-f797-49e8-8152-6d2292c21241`
/*
const getAsset = async (asset: string) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'my-id',
      method: 'getAsset',
      params: {
        id: asset
      },
    }),
  });
  // @ts-ignore 
  const { result } = await response.json();
  return result 
};*/
/*
async function fetchPrice(tokenId) {
  let aggPrices = [] 
  const markets = raydium.pairToMarkets.get(toPairString("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", tokenId));
  if (markets){
    if (!Object.keys(fetchedCache).includes(tokenId)){
      fetchedCache[tokenId] = Date.now() + 666
    }
    if (fetchedCache[tokenId] > Date.now()){
      fetchedCache[tokenId] = Date.now() + 666

  for (const market of markets){
  const targetPoolInfo = await formatAmmKeysById(market.id)
  if (!Object.keys(accountCache).includes(tokenId)){
    const ai = await connection.getAccountInfo(new PublicKey(tokenId))
    const decoded = MintLayout.decode(ai.data)
    accountCache[tokenId] = {owner:
       ai.owner,
       ...decoded}
  }
  const quoteToken = new Token(TOKEN_PROGRAM_ID, new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), 6, 'USDC', 'USDC');
  const baseToken = new Token(accountCache[tokenId].owner, new PublicKey(tokenId), accountCache[tokenId].decimals, 'token', 'token');
  const inputTokenAmount = new TokenAmount(baseToken, 1 * 10 ** accountCache[tokenId].decimals )
  
  // -------- step 1: compute another amount --------
  const poolKeys = jsonInfo2PoolKeys(targetPoolInfo) as LiquidityPoolKeys
  const slippage = new Percent(1, 100)

  // -------- step 1: coumpute amount out --------
  const { currentPrice, priceImpact} = Liquidity.computeAmountOut({
    poolKeys: poolKeys,
    poolInfo: await Liquidity.fetchInfo({ connection, poolKeys }),
    amountIn: inputTokenAmount,
    currencyOut: quoteToken,
    slippage: slippage,
  })
  if (Number(priceImpact.toFixed(18)) < 0.01){
  aggPrices.push(Number(currentPrice.toFixed(18)))
  }
  }
}
if (aggPrices.length == 0) return 
const data = aggPrices

const Q1 = quartile(data, 0.25);
const Q3 = quartile(data, 0.75);
const IQR = Q3 - Q1;

// Filtering out the outliers
const filteredData = data.filter(x => (x >= (Q1 - 1.5 * IQR)) && (x <= (Q3 + 1.5 * IQR)));

const confidence = filteredData.length / data.length;

// Calculating the mean of filtered data
const meanFilteredData = filteredData.reduce((acc, val) => acc + val, 0) / filteredData.length;

console.log('Filtered Data:', filteredData);
console.log('Confidence (Proportion of Data Retained):', confidence.toFixed(2));
console.log('Mean of Filtered Data:', meanFilteredData.toFixed(18));
priceCache[tokenId] = meanFilteredData.toFixed(18)
confidenceCache[tokenId] = confidence
  }
}*/
// @ts-ignore
const raydium = new RaydiumDEX();

let lastWalletRefresh = Date.now()
let walletTokenAccounts: any = []
  //  new RaydiumClmmDEX(),
async function main(wallet) {

      await subscribeCommand(wallet);
}

async function makeAddLiquidityInstructionSimple<T extends TxVersion>(
  params: LiquidityAddInstructionSimpleParams & {
    makeTxVersion: T
    lookupTableCache?: CacheLTA
    computeBudgetConfig?: ComputeBudgetConfig
  },
) {
  const {
    connection,
    poolKeys,
    userKeys,
    amountInA,
    amountInB,
    fixedSide,
    config,
    makeTxVersion,
    lookupTableCache,
    computeBudgetConfig,
  } = params
  const { lpMint } = poolKeys
  const { tokenAccounts, owner, payer = owner } = userKeys

  console.log('amountInA:', amountInA)
  console.log('amountInB:', amountInB)

  const { bypassAssociatedCheck, checkCreateATAOwner } = {
    // default
    ...{ bypassAssociatedCheck: false, checkCreateATAOwner: false },
    // custom
    ...config,
  }

  // handle currency a & b (convert SOL to WSOL)
  const tokenA = amountInA instanceof TokenAmount ? amountInA.token : Token.WSOL
  const tokenB = amountInB instanceof TokenAmount ? amountInB.token : Token.WSOL

  const tokenAccountA = Liquidity._selectTokenAccount({
    programId: TOKEN_PROGRAM_ID,
    tokenAccounts,
    mint: tokenA.mint,
    owner,
    config: { associatedOnly: false },
  })
  const tokenAccountB = Liquidity._selectTokenAccount({
    programId: TOKEN_PROGRAM_ID,
    tokenAccounts,
    mint: tokenB.mint,
    owner,
    config: { associatedOnly: false },
  })
  
  const lpTokenAccount =  Liquidity._selectTokenAccount({
    programId: TOKEN_PROGRAM_ID,
    tokenAccounts,
    mint: tokenB.mint,
    owner,
  })

  const tokens = [tokenA, tokenB]
  const _tokenAccounts = [tokenAccountA, tokenAccountB]
  const rawAmounts = [amountInA.raw, amountInB.raw]

  // handle amount a & b and direction
  const [sideA] = Liquidity._getAmountsSide(amountInA, amountInB, poolKeys)
  let _fixedSide: AmountSide = 'base'
  if (sideA === 'quote') {
    // reverse
    tokens.reverse()
    _tokenAccounts.reverse()
    rawAmounts.reverse()

    if (fixedSide === 'a') _fixedSide = 'quote'
    else if (fixedSide === 'b') _fixedSide = 'base'
  } else if (sideA === 'base') {
    if (fixedSide === 'a') _fixedSide = 'base'
    else if (fixedSide === 'b') _fixedSide = 'quote'
    

  const [baseToken, quoteToken] = tokens
  const [baseTokenAccount, quoteTokenAccount] = _tokenAccounts
  const [baseAmountRaw, quoteAmountRaw] = rawAmounts

  const frontInstructions: TransactionInstruction[] = []
  const endInstructions: TransactionInstruction[] = []
  const frontInstructionsType: InstructionType[] = []
  const endInstructionsType: InstructionType[] = []
  const signers: Signer[] = []

  const _baseTokenAccount = await Liquidity._handleTokenAccount({
    programId: TOKEN_PROGRAM_ID,
    connection,
    side: 'in',
    amount: baseAmountRaw,
    mint: baseToken.mint,
    tokenAccount: baseTokenAccount,
    owner,
    payer,
    frontInstructions,
    endInstructions,
    signers,
    bypassAssociatedCheck,
    frontInstructionsType,
    endInstructionsType,
    checkCreateATAOwner,
  })
  const _quoteTokenAccount = await Liquidity._handleTokenAccount({
    programId: TOKEN_PROGRAM_ID,
    connection,
    side: 'in',
    amount: quoteAmountRaw,
    mint: quoteToken.mint,
    tokenAccount: quoteTokenAccount,
    owner,
    payer,
    frontInstructions,
    endInstructions,
    signers,
    bypassAssociatedCheck,
    frontInstructionsType,
    endInstructionsType,
    checkCreateATAOwner,
  })
  const _lpTokenAccount = await Liquidity._handleTokenAccount({
    programId: TOKEN_PROGRAM_ID,
    connection,
    side: 'out',
    amount: 0,
    mint: lpMint,
    tokenAccount: lpTokenAccount,
    owner,
    payer,
    frontInstructions,
    endInstructions,
    signers,
    bypassAssociatedCheck,
    frontInstructionsType,
    endInstructionsType,
    checkCreateATAOwner,
  })

  const ins = Liquidity.makeAddLiquidityInstruction({
    poolKeys,
    userKeys: {
      baseTokenAccount: _baseTokenAccount,
      quoteTokenAccount: _quoteTokenAccount,
      lpTokenAccount: _lpTokenAccount,
      owner,
    },
    baseAmountIn: baseAmountRaw,
    quoteAmountIn: quoteAmountRaw,
    fixedSide: _fixedSide,
  })

  return {
    address: {
      lpTokenAccount: _lpTokenAccount,
    },
    innerTransactions: await splitTxAndSigners({
      connection,
      makeTxVersion,
      computeBudgetConfig,
      payer,
      innerTransaction: [
        { instructionTypes: frontInstructionsType, instructions: frontInstructions, signers },
        ins.innerTransaction,
        { instructionTypes: endInstructionsType, instructions: endInstructions, signers: [] },
      ],
      lookupTableCache,
    }),
  }
}
}
// Subscribe for events
type WalletTokenAccounts = Awaited<ReturnType<typeof getWalletTokenAccount>>
type TestTxInputInfo = {
baseToken: Token
quoteToken: Token
targetPool: string
inputTokenAmount: TokenAmount
slippage: Percent
walletTokenAccounts: WalletTokenAccounts
wallet: Keypair
dir: string
targetPoolInfo: any
poolKeys: any
}
async function ammAddLiquidity(
input: TestTxInputInfo
): Promise<{ innerTxs: any[], txids: any[]; anotherAmount: TokenAmount | CurrencyAmount }> {
try {
  const wallet = input.wallet
const targetPoolInfo = input.targetPoolInfo
const poolKeys = input.poolKeys
const lpTokens = poolKeys.lpMint
const lpTokenAccount = await connection.getParsedAccountInfo(lpTokens)
// @ts-ignore
//console.log(lpTokenAccount.value.data.parsed)
if (poolKeys.quoteMint.equals(NATIVE_MINT)){
//  console.log('weiner?')
const extraPoolInfo = await Liquidity.fetchInfo({ connection, poolKeys })
// @ts-ignore
const aratio=(1/ Number(extraPoolInfo.lpSupply.toNumber() / (Number(lpTokenAccount.value.data.parsed.info.supply))))
//console.log(aratio)
if (aratio != 0 && aratio < 0.011 && input.dir == 'deposit'){
// console.log(extraPoolInfo)
const { maxAnotherAmount, anotherAmount } = Liquidity.computeAnotherAmount({
  poolKeys,
  poolInfo: { ...targetPoolInfo, ...extraPoolInfo },
  amount: input.inputTokenAmount as any,
  anotherCurrency: input.baseToken as any,
  slippage: input.slippage,
})

/* console.log('will add liquidity info', {
  liquidity: liquidity.toString(),
  liquidityD: new Decimal(liquidity.toString()).div(10 ** extraPoolInfo.lpDecimals),
})*/

let {innerTxs} = await  swapOnlyAmm({
  outputToken: input.baseToken,
  targetPool: input.targetPool,
  inputTokenAmount: input.inputTokenAmount,
  slippage: input.slippage,
  walletTokenAccounts: input.walletTokenAccounts,
  wallet: wallet,
})

let {minAmountOut, innerTxs: innerTxs2} = await  swapOnlyAmm({
outputToken: new Token(TOKEN_PROGRAM_ID, "7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3",9, "SLERF", "SLERF"),
targetPool: "AgFnRLUScRD2E4nWQxW73hdbSN7eKEUb2jHX7tx9YTYc",
inputTokenAmount: new TokenAmount(input.quoteToken, Math.floor(input.inputTokenAmount.raw.toNumber() * 0.01)),
slippage: new Percent(666, 10000),
walletTokenAccounts: input.walletTokenAccounts,
wallet: wallet,
})
console.log(innerTxs)
console.log(innerTxs2)
innerTxs.push(...innerTxs2)

  try {
    const burnIx = t.Token.createBurnInstruction(
      TOKEN_PROGRAM_ID,
      new PublicKey("7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3"),
      await t.Token.getAssociatedTokenAddress(
        t.ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey("7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3"),
        wallet.publicKey
      ),
      wallet.publicKey,
      [],
      minAmountOut.raw.toNumber()
    )
    console.log('burnIx', burnIx)
// -------- step 2: make instructions --------
const addLiquidityInstructionResponse = await makeAddLiquidityInstructionSimple({
  connection,
  poolKeys,
  userKeys: {
    owner: input.wallet.publicKey,
    payer: input.wallet.publicKey,
    tokenAccounts: input.walletTokenAccounts
  },
  config: {
    bypassAssociatedCheck: true,
    checkCreateATAOwner: true
  },
  computeBudgetConfig: {
    microLamports: 32000},
  amountInA: maxAnotherAmount as any,
  amountInB: input.inputTokenAmount as any,
  fixedSide: 'b',
  makeTxVersion: TxVersion.V0,
})
console.log('addLiquidityInstructionResponse', addLiquidityInstructionResponse)
const burn_tx: InnerSimpleV0Transaction = {
  instructions: [burnIx],
  signers: [],
  instructionTypes: [InstructionType.test],
}
addLiquidityInstructionResponse.innerTransactions.push(burn_tx)
console.log('returning..')
return { innerTxs, txids: (addLiquidityInstructionResponse.innerTransactions), anotherAmount: anotherAmount }
  }
  catch (err){
    console.error(err)
    return { innerTxs: [], txids: [], anotherAmount: new TokenAmount(input.baseToken, 0) }
  }
}
}
}
catch (err){
  console.error(err)
  return { innerTxs: [], txids: [], anotherAmount: new TokenAmount(input.baseToken, 0) }

}
}
async function subscribeCommand(wallet) {
  // Handle updates
            try {
              let goodPools : any = ["F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","BtZf1xpNmhYbjrxxfPpwjhnDnGuyPijufPeKjsZ9gTvT","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","FvMZrD1qC66Zw8VPrW15xN1N5owUPqpQgNQ5oH18mR4E","C8t49Pz4Fb94AauAUwJyjDgNztVSc48hwhFGmQLAwDKL","D3pCrmWpn92ApxQ2nKAMqaxDhwYe9cY7wRNgmvdg2boL","47857wX96Tb4Ud3M3ka949iVRFmUqS33KLBxoVsqgfLK","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","BtZf1xpNmhYbjrxxfPpwjhnDnGuyPijufPeKjsZ9gTvT","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","FvMZrD1qC66Zw8VPrW15xN1N5owUPqpQgNQ5oH18mR4E","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","47857wX96Tb4Ud3M3ka949iVRFmUqS33KLBxoVsqgfLK","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","C8t49Pz4Fb94AauAUwJyjDgNztVSc48hwhFGmQLAwDKL","FQed3Ay883zUcGcLaubkV56JJbweiYjxPSTC84yUxqNd","D3pCrmWpn92ApxQ2nKAMqaxDhwYe9cY7wRNgmvdg2boL","5PqKanwdx1WMo6sESE3L1yYnoghz6TEHcVExAt5gewba","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","5PqKanwdx1WMo6sESE3L1yYnoghz6TEHcVExAt5gewba","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","FQed3Ay883zUcGcLaubkV56JJbweiYjxPSTC84yUxqNd","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","8LinWMnf5LVEVARqko7eUyydwzkrLdBUZgeNtu4fAFwA","2N6SHfcg2U8KPPYujRGMzBjAmW2NZUuWnRWRZVCihBxw","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","FQed3Ay883zUcGcLaubkV56JJbweiYjxPSTC84yUxqNd","3DZcPfQ5t9JEX4m3bUSdjjW9Uc83rYaLU5wFeycEsPuQ","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","8LinWMnf5LVEVARqko7eUyydwzkrLdBUZgeNtu4fAFwA","2N6SHfcg2U8KPPYujRGMzBjAmW2NZUuWnRWRZVCihBxw","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","3DZcPfQ5t9JEX4m3bUSdjjW9Uc83rYaLU5wFeycEsPuQ","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","FQed3Ay883zUcGcLaubkV56JJbweiYjxPSTC84yUxqNd","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","FQed3Ay883zUcGcLaubkV56JJbweiYjxPSTC84yUxqNd","34yiYY6kZmnVfmdQGtv2HugiNB5g1DcMDuc2VdckidB7","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","B8sv1wiDf9VydktLmBDHUn4W5UFkFAcbgu7igK6Fn2sW","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","34yiYY6kZmnVfmdQGtv2HugiNB5g1DcMDuc2VdckidB7","m4F4pUo1NKRykSPLtHkfhMzb8rARURwD8RqC34UZFTH","BGS69Ju7DRRVxw9b2B5TnrMLzVdJcscV8UtKywqNsgwx","B8sv1wiDf9VydktLmBDHUn4W5UFkFAcbgu7igK6Fn2sW","HXVijRdLh9hwmXDsJ8T495e6oN8eGeaSMmHNLuMcaU3G","m4F4pUo1NKRykSPLtHkfhMzb8rARURwD8RqC34UZFTH","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","BGS69Ju7DRRVxw9b2B5TnrMLzVdJcscV8UtKywqNsgwx","HXVijRdLh9hwmXDsJ8T495e6oN8eGeaSMmHNLuMcaU3G","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","BEtH9ztV1k22tGBzVdgD5b3ywRTThD7zmu7cXEh8MvwH","m4F4pUo1NKRykSPLtHkfhMzb8rARURwD8RqC34UZFTH","BEtH9ztV1k22tGBzVdgD5b3ywRTThD7zmu7cXEh8MvwH","m4F4pUo1NKRykSPLtHkfhMzb8rARURwD8RqC34UZFTH","8LinWMnf5LVEVARqko7eUyydwzkrLdBUZgeNtu4fAFwA","xdEEMWJk6WRojCjkGvxApWGAz3JbbMCSAW1nVt6XSeK","8LinWMnf5LVEVARqko7eUyydwzkrLdBUZgeNtu4fAFwA","xdEEMWJk6WRojCjkGvxApWGAz3JbbMCSAW1nVt6XSeK","FvMZrD1qC66Zw8VPrW15xN1N5owUPqpQgNQ5oH18mR4E","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","FvMZrD1qC66Zw8VPrW15xN1N5owUPqpQgNQ5oH18mR4E","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","FvMZrD1qC66Zw8VPrW15xN1N5owUPqpQgNQ5oH18mR4E","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","FvMZrD1qC66Zw8VPrW15xN1N5owUPqpQgNQ5oH18mR4E","3rKBUzvUbCmsHYPFTjGPoAQmbLXdcVfE8vQkqktP4Lzy","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","3rKBUzvUbCmsHYPFTjGPoAQmbLXdcVfE8vQkqktP4Lzy","47857wX96Tb4Ud3M3ka949iVRFmUqS33KLBxoVsqgfLK","47857wX96Tb4Ud3M3ka949iVRFmUqS33KLBxoVsqgfLK","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","9z5EgtKcULj72Tx9kkr7VVFPzM3U3XreZLEUqkTJfTNZ","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","9z5EgtKcULj72Tx9kkr7VVFPzM3U3XreZLEUqkTJfTNZ","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","5EgCcjkuE42YyTZY4QG8qTioUwNh6agTvJuNRyEqcqV1","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","5EgCcjkuE42YyTZY4QG8qTioUwNh6agTvJuNRyEqcqV1","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","GDoAFwYd4zormdjwsUu8UmGK6XBJLc5nCDErovyCciK7","8LinWMnf5LVEVARqko7eUyydwzkrLdBUZgeNtu4fAFwA","GDoAFwYd4zormdjwsUu8UmGK6XBJLc5nCDErovyCciK7","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","34yiYY6kZmnVfmdQGtv2HugiNB5g1DcMDuc2VdckidB7","8LinWMnf5LVEVARqko7eUyydwzkrLdBUZgeNtu4fAFwA","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","34yiYY6kZmnVfmdQGtv2HugiNB5g1DcMDuc2VdckidB7","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","m4F4pUo1NKRykSPLtHkfhMzb8rARURwD8RqC34UZFTH","ESAXeEwatpFg19WgGDyRfTWrjpjWqEhYfCM3RfQm7biP","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","m4F4pUo1NKRykSPLtHkfhMzb8rARURwD8RqC34UZFTH","ESAXeEwatpFg19WgGDyRfTWrjpjWqEhYfCM3RfQm7biP","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","3rKBUzvUbCmsHYPFTjGPoAQmbLXdcVfE8vQkqktP4Lzy","47857wX96Tb4Ud3M3ka949iVRFmUqS33KLBxoVsqgfLK","8sowq1qNZi9MFR5tCLGRT8KvL9ME6KmqrU1BWDwFTS3E","3rKBUzvUbCmsHYPFTjGPoAQmbLXdcVfE8vQkqktP4Lzy","47857wX96Tb4Ud3M3ka949iVRFmUqS33KLBxoVsqgfLK","8sowq1qNZi9MFR5tCLGRT8KvL9ME6KmqrU1BWDwFTS3E","8U8tqsrmqRCVnYFSPECRrNqWp1GzDurt1HmYnwrfgRWR","8U8tqsrmqRCVnYFSPECRrNqWp1GzDurt1HmYnwrfgRWR","BGS69Ju7DRRVxw9b2B5TnrMLzVdJcscV8UtKywqNsgwx","8LinWMnf5LVEVARqko7eUyydwzkrLdBUZgeNtu4fAFwA","BGS69Ju7DRRVxw9b2B5TnrMLzVdJcscV8UtKywqNsgwx","8LinWMnf5LVEVARqko7eUyydwzkrLdBUZgeNtu4fAFwA","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","BZivKpJWgQvrA3yYe3ubomufeGVouoYoUhosmBEdqF9y","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","637mho2vMtrn6yLpjiyhYfJmtUEXiwEWZ36s2LyEjeM6","BZivKpJWgQvrA3yYe3ubomufeGVouoYoUhosmBEdqF9y","637mho2vMtrn6yLpjiyhYfJmtUEXiwEWZ36s2LyEjeM6","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","8rY1rdAnrHqJDy6a7nTykS3NyNUU4jV8b5wfFFovAaMG","8rY1rdAnrHqJDy6a7nTykS3NyNUU4jV8b5wfFFovAaMG","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","3rKBUzvUbCmsHYPFTjGPoAQmbLXdcVfE8vQkqktP4Lzy","47857wX96Tb4Ud3M3ka949iVRFmUqS33KLBxoVsqgfLK","FvMZrD1qC66Zw8VPrW15xN1N5owUPqpQgNQ5oH18mR4E","3rKBUzvUbCmsHYPFTjGPoAQmbLXdcVfE8vQkqktP4Lzy","47857wX96Tb4Ud3M3ka949iVRFmUqS33KLBxoVsqgfLK","5EgCcjkuE42YyTZY4QG8qTioUwNh6agTvJuNRyEqcqV1","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","8LinWMnf5LVEVARqko7eUyydwzkrLdBUZgeNtu4fAFwA","FvMZrD1qC66Zw8VPrW15xN1N5owUPqpQgNQ5oH18mR4E","5EgCcjkuE42YyTZY4QG8qTioUwNh6agTvJuNRyEqcqV1","8LinWMnf5LVEVARqko7eUyydwzkrLdBUZgeNtu4fAFwA","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","H15d3D6CPCv3Ds8arqQrRkeE32zZiZzMVwTmDzk5j8cQ","HZZofxusqKaA9JqaeXW8PtUALRXUwSLLwnt4eBFiyEdC","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","H15d3D6CPCv3Ds8arqQrRkeE32zZiZzMVwTmDzk5j8cQ","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","BGS69Ju7DRRVxw9b2B5TnrMLzVdJcscV8UtKywqNsgwx","HZZofxusqKaA9JqaeXW8PtUALRXUwSLLwnt4eBFiyEdC","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","HZZofxusqKaA9JqaeXW8PtUALRXUwSLLwnt4eBFiyEdC","H15d3D6CPCv3Ds8arqQrRkeE32zZiZzMVwTmDzk5j8cQ","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","m4F4pUo1NKRykSPLtHkfhMzb8rARURwD8RqC34UZFTH","BGS69Ju7DRRVxw9b2B5TnrMLzVdJcscV8UtKywqNsgwx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","HZZofxusqKaA9JqaeXW8PtUALRXUwSLLwnt4eBFiyEdC","H15d3D6CPCv3Ds8arqQrRkeE32zZiZzMVwTmDzk5j8cQ","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","m4F4pUo1NKRykSPLtHkfhMzb8rARURwD8RqC34UZFTH","FuCNeyo3pRvFYVEGaxVEUcpdQoMGhPVsDmddAY4RgSGk","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","AgFnRLUScRD2E4nWQxW73hdbSN7eKEUb2jHX7tx9YTYc","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","FuCNeyo3pRvFYVEGaxVEUcpdQoMGhPVsDmddAY4RgSGk","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","AgFnRLUScRD2E4nWQxW73hdbSN7eKEUb2jHX7tx9YTYc","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","5EgCcjkuE42YyTZY4QG8qTioUwNh6agTvJuNRyEqcqV1","2N6SHfcg2U8KPPYujRGMzBjAmW2NZUuWnRWRZVCihBxw","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","2N6SHfcg2U8KPPYujRGMzBjAmW2NZUuWnRWRZVCihBxw","5EgCcjkuE42YyTZY4QG8qTioUwNh6agTvJuNRyEqcqV1","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","9z5EgtKcULj72Tx9kkr7VVFPzM3U3XreZLEUqkTJfTNZ","BEtH9ztV1k22tGBzVdgD5b3ywRTThD7zmu7cXEh8MvwH","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","8LinWMnf5LVEVARqko7eUyydwzkrLdBUZgeNtu4fAFwA","9z5EgtKcULj72Tx9kkr7VVFPzM3U3XreZLEUqkTJfTNZ","5PqKanwdx1WMo6sESE3L1yYnoghz6TEHcVExAt5gewba","BEtH9ztV1k22tGBzVdgD5b3ywRTThD7zmu7cXEh8MvwH","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","8LinWMnf5LVEVARqko7eUyydwzkrLdBUZgeNtu4fAFwA","5PqKanwdx1WMo6sESE3L1yYnoghz6TEHcVExAt5gewba","7RFP9dU4Ur66kHJMiTpEszFpNDQs8sj5nWpUHCPm7EzN","DS2cv9R9Yrnk52AttY7nWYbRSxtnJVSL4GAYuzH9hKCm","7RFP9dU4Ur66kHJMiTpEszFpNDQs8sj5nWpUHCPm7EzN","DS2cv9R9Yrnk52AttY7nWYbRSxtnJVSL4GAYuzH9hKCm","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","DVkAryLFZnWh2HtEZcdmt6r6Jn1JY64bMLJewcvaX4Sb","AmrNQgMdJyqo18SmvJXrdYcCC1XcZCrYENHNj1gsvKC","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","DVkAryLFZnWh2HtEZcdmt6r6Jn1JY64bMLJewcvaX4Sb","AmrNQgMdJyqo18SmvJXrdYcCC1XcZCrYENHNj1gsvKC","47857wX96Tb4Ud3M3ka949iVRFmUqS33KLBxoVsqgfLK","BGS69Ju7DRRVxw9b2B5TnrMLzVdJcscV8UtKywqNsgwx","m4F4pUo1NKRykSPLtHkfhMzb8rARURwD8RqC34UZFTH","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","47857wX96Tb4Ud3M3ka949iVRFmUqS33KLBxoVsqgfLK","BGS69Ju7DRRVxw9b2B5TnrMLzVdJcscV8UtKywqNsgwx","m4F4pUo1NKRykSPLtHkfhMzb8rARURwD8RqC34UZFTH","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","ARJxPRN43vhLPkUQ5RRrxeYjRCjHiBjP3NF8YZvtBtcU","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","ARJxPRN43vhLPkUQ5RRrxeYjRCjHiBjP3NF8YZvtBtcU","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","8LinWMnf5LVEVARqko7eUyydwzkrLdBUZgeNtu4fAFwA","5faAvsN1WhLc8LTCSRefepnZsJ7Z9uDgXmLFHDsiuTMh","8LinWMnf5LVEVARqko7eUyydwzkrLdBUZgeNtu4fAFwA","5faAvsN1WhLc8LTCSRefepnZsJ7Z9uDgXmLFHDsiuTMh","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","Conmsi8HMhGviC8VNHHQBjqNqaw5frXMyAYmRKY3kwQN","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","Conmsi8HMhGviC8VNHHQBjqNqaw5frXMyAYmRKY3kwQN","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","FuCNeyo3pRvFYVEGaxVEUcpdQoMGhPVsDmddAY4RgSGk","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","FvMZrD1qC66Zw8VPrW15xN1N5owUPqpQgNQ5oH18mR4E","AgFnRLUScRD2E4nWQxW73hdbSN7eKEUb2jHX7tx9YTYc","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","Conmsi8HMhGviC8VNHHQBjqNqaw5frXMyAYmRKY3kwQN","FuCNeyo3pRvFYVEGaxVEUcpdQoMGhPVsDmddAY4RgSGk","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","FvMZrD1qC66Zw8VPrW15xN1N5owUPqpQgNQ5oH18mR4E","AgFnRLUScRD2E4nWQxW73hdbSN7eKEUb2jHX7tx9YTYc","Conmsi8HMhGviC8VNHHQBjqNqaw5frXMyAYmRKY3kwQN","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","m4F4pUo1NKRykSPLtHkfhMzb8rARURwD8RqC34UZFTH","FvMZrD1qC66Zw8VPrW15xN1N5owUPqpQgNQ5oH18mR4E","m4F4pUo1NKRykSPLtHkfhMzb8rARURwD8RqC34UZFTH","5EgCcjkuE42YyTZY4QG8qTioUwNh6agTvJuNRyEqcqV1","FvMZrD1qC66Zw8VPrW15xN1N5owUPqpQgNQ5oH18mR4E","5EgCcjkuE42YyTZY4QG8qTioUwNh6agTvJuNRyEqcqV1","BtZf1xpNmhYbjrxxfPpwjhnDnGuyPijufPeKjsZ9gTvT","BtZf1xpNmhYbjrxxfPpwjhnDnGuyPijufPeKjsZ9gTvT","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","CQQDXt2M6Cx1J8N3cYsSmPiD7fcLdU5RpVtRbs9WaCXZ","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","CQQDXt2M6Cx1J8N3cYsSmPiD7fcLdU5RpVtRbs9WaCXZ","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","B8sv1wiDf9VydktLmBDHUn4W5UFkFAcbgu7igK6Fn2sW","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","B8sv1wiDf9VydktLmBDHUn4W5UFkFAcbgu7igK6Fn2sW","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","BtZf1xpNmhYbjrxxfPpwjhnDnGuyPijufPeKjsZ9gTvT","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","FvMZrD1qC66Zw8VPrW15xN1N5owUPqpQgNQ5oH18mR4E","BtZf1xpNmhYbjrxxfPpwjhnDnGuyPijufPeKjsZ9gTvT","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","FvMZrD1qC66Zw8VPrW15xN1N5owUPqpQgNQ5oH18mR4E","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","5EgCcjkuE42YyTZY4QG8qTioUwNh6agTvJuNRyEqcqV1","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","5EgCcjkuE42YyTZY4QG8qTioUwNh6agTvJuNRyEqcqV1","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","BCPGipfPUUcjonzVPRxBCZzRjoMaTYKVLZrsBSgz5hbg","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","47857wX96Tb4Ud3M3ka949iVRFmUqS33KLBxoVsqgfLK","8sowq1qNZi9MFR5tCLGRT8KvL9ME6KmqrU1BWDwFTS3E","BCPGipfPUUcjonzVPRxBCZzRjoMaTYKVLZrsBSgz5hbg","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","47857wX96Tb4Ud3M3ka949iVRFmUqS33KLBxoVsqgfLK","8sowq1qNZi9MFR5tCLGRT8KvL9ME6KmqrU1BWDwFTS3E","FvMZrD1qC66Zw8VPrW15xN1N5owUPqpQgNQ5oH18mR4E","B8sv1wiDf9VydktLmBDHUn4W5UFkFAcbgu7igK6Fn2sW","BGS69Ju7DRRVxw9b2B5TnrMLzVdJcscV8UtKywqNsgwx","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","FvMZrD1qC66Zw8VPrW15xN1N5owUPqpQgNQ5oH18mR4E","Conmsi8HMhGviC8VNHHQBjqNqaw5frXMyAYmRKY3kwQN","BGS69Ju7DRRVxw9b2B5TnrMLzVdJcscV8UtKywqNsgwx","B8sv1wiDf9VydktLmBDHUn4W5UFkFAcbgu7igK6Fn2sW","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","BCPGipfPUUcjonzVPRxBCZzRjoMaTYKVLZrsBSgz5hbg","Conmsi8HMhGviC8VNHHQBjqNqaw5frXMyAYmRKY3kwQN","3rKBUzvUbCmsHYPFTjGPoAQmbLXdcVfE8vQkqktP4Lzy","BZivKpJWgQvrA3yYe3ubomufeGVouoYoUhosmBEdqF9y","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","BCPGipfPUUcjonzVPRxBCZzRjoMaTYKVLZrsBSgz5hbg","3rKBUzvUbCmsHYPFTjGPoAQmbLXdcVfE8vQkqktP4Lzy","AgFnRLUScRD2E4nWQxW73hdbSN7eKEUb2jHX7tx9YTYc","BZivKpJWgQvrA3yYe3ubomufeGVouoYoUhosmBEdqF9y","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","AgFnRLUScRD2E4nWQxW73hdbSN7eKEUb2jHX7tx9YTYc","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","AxBDdiMK9hRPLMPM7k6nCPC1gRARgXQHNejfP2LvNGr6","DCqKHMHb52ofY8XhyX7ofJ6nM6cQ1eGZfRp7iWSgay4w","Co3qUMmKMc8aNFbvhNip1KXU1akSSU2LSvD1cxDNkFvh","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","AxBDdiMK9hRPLMPM7k6nCPC1gRARgXQHNejfP2LvNGr6","AxBDdiMK9hRPLMPM7k6nCPC1gRARgXQHNejfP2LvNGr6","DCqKHMHb52ofY8XhyX7ofJ6nM6cQ1eGZfRp7iWSgay4w","Co3qUMmKMc8aNFbvhNip1KXU1akSSU2LSvD1cxDNkFvh","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","AxBDdiMK9hRPLMPM7k6nCPC1gRARgXQHNejfP2LvNGr6","6DmNNAv1sLfNSrNhowdTspK3H4AjZbZYj3ZvGhbXhMFi","6DmNNAv1sLfNSrNhowdTspK3H4AjZbZYj3ZvGhbXhMFi","AxBDdiMK9hRPLMPM7k6nCPC1gRARgXQHNejfP2LvNGr6","FvMZrD1qC66Zw8VPrW15xN1N5owUPqpQgNQ5oH18mR4E","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","FvMZrD1qC66Zw8VPrW15xN1N5owUPqpQgNQ5oH18mR4E","AxBDdiMK9hRPLMPM7k6nCPC1gRARgXQHNejfP2LvNGr6","FvMZrD1qC66Zw8VPrW15xN1N5owUPqpQgNQ5oH18mR4E","5EgCcjkuE42YyTZY4QG8qTioUwNh6agTvJuNRyEqcqV1","8LinWMnf5LVEVARqko7eUyydwzkrLdBUZgeNtu4fAFwA","FvMZrD1qC66Zw8VPrW15xN1N5owUPqpQgNQ5oH18mR4E","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","8LinWMnf5LVEVARqko7eUyydwzkrLdBUZgeNtu4fAFwA","5EgCcjkuE42YyTZY4QG8qTioUwNh6agTvJuNRyEqcqV1","FvMZrD1qC66Zw8VPrW15xN1N5owUPqpQgNQ5oH18mR4E","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","8U8tqsrmqRCVnYFSPECRrNqWp1GzDurt1HmYnwrfgRWR","FvMZrD1qC66Zw8VPrW15xN1N5owUPqpQgNQ5oH18mR4E","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","8U8tqsrmqRCVnYFSPECRrNqWp1GzDurt1HmYnwrfgRWR","BtZf1xpNmhYbjrxxfPpwjhnDnGuyPijufPeKjsZ9gTvT","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","BtZf1xpNmhYbjrxxfPpwjhnDnGuyPijufPeKjsZ9gTvT","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","3SYACap6KeRqf46TXSyvHHRwFnU7BmpXcRk7syKy2eEX","5PqKanwdx1WMo6sESE3L1yYnoghz6TEHcVExAt5gewba","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","3SYACap6KeRqf46TXSyvHHRwFnU7BmpXcRk7syKy2eEX","5PqKanwdx1WMo6sESE3L1yYnoghz6TEHcVExAt5gewba","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","47857wX96Tb4Ud3M3ka949iVRFmUqS33KLBxoVsqgfLK","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","47857wX96Tb4Ud3M3ka949iVRFmUqS33KLBxoVsqgfLK","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","FvMZrD1qC66Zw8VPrW15xN1N5owUPqpQgNQ5oH18mR4E","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","B8sv1wiDf9VydktLmBDHUn4W5UFkFAcbgu7igK6Fn2sW","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","FvMZrD1qC66Zw8VPrW15xN1N5owUPqpQgNQ5oH18mR4E","B8sv1wiDf9VydktLmBDHUn4W5UFkFAcbgu7igK6Fn2sW","AMWv3TV95sftk5beNhBWY6h6yUnvtvEyVVX5VCPf2f5m","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","AMWv3TV95sftk5beNhBWY6h6yUnvtvEyVVX5VCPf2f5m","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","CQQDXt2M6Cx1J8N3cYsSmPiD7fcLdU5RpVtRbs9WaCXZ","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","CQQDXt2M6Cx1J8N3cYsSmPiD7fcLdU5RpVtRbs9WaCXZ","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","2N6SHfcg2U8KPPYujRGMzBjAmW2NZUuWnRWRZVCihBxw","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","2N6SHfcg2U8KPPYujRGMzBjAmW2NZUuWnRWRZVCihBxw","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","8ib8J7ETnctHjjKKCnfiqRzKUTC6iezi9KNtDyV6KyNa","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","Bui622y8Cwfkvd7tkfZ76SyGBf7rcqj1r1cHmBUguEa2","8ib8J7ETnctHjjKKCnfiqRzKUTC6iezi9KNtDyV6KyNa","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","Bui622y8Cwfkvd7tkfZ76SyGBf7rcqj1r1cHmBUguEa2","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","BGS69Ju7DRRVxw9b2B5TnrMLzVdJcscV8UtKywqNsgwx","tM4ReM75273xUEKagXgxviHWZEPmnEMgXT3q4kG1VKv","tM4ReM75273xUEKagXgxviHWZEPmnEMgXT3q4kG1VKv","BGS69Ju7DRRVxw9b2B5TnrMLzVdJcscV8UtKywqNsgwx","6ckfpq5wME37pAYdyK8iGmcaEuW1nhya2h4nAxKnxUGS","6ckfpq5wME37pAYdyK8iGmcaEuW1nhya2h4nAxKnxUGS","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","BK3KNu7PN8rekVMZNTgjEC1ghbQMYyH8KY7UYb3RdvP6","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","2gDHhZTiJkoRWSHT69a2C7cVcKSh8xVFZcsNkWd9zEqj","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","BK3KNu7PN8rekVMZNTgjEC1ghbQMYyH8KY7UYb3RdvP6","2gDHhZTiJkoRWSHT69a2C7cVcKSh8xVFZcsNkWd9zEqj","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","CT32zuPqLFEbACZgJ68DTrBykJGrLsx1c2quJno5XBBp","AmrNQgMdJyqo18SmvJXrdYcCC1XcZCrYENHNj1gsvKC","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","F5iXiN6EufPSQLLXw8mt1BLt9EByTkmFYWgrQ9GgQGyx","CT32zuPqLFEbACZgJ68DTrBykJGrLsx1c2quJno5XBBp","D3pCrmWpn92ApxQ2nKAMqaxDhwYe9cY7wRNgmvdg2boL","AmrNQgMdJyqo18SmvJXrdYcCC1XcZCrYENHNj1gsvKC","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","EHWMQEygvjNGnjV5BtXiYv8TYwuVmzpewzB2i1fN2hmg","D3pCrmWpn92ApxQ2nKAMqaxDhwYe9cY7wRNgmvdg2boL","8LinWMnf5LVEVARqko7eUyydwzkrLdBUZgeNtu4fAFwA","CQQDXt2M6Cx1J8N3cYsSmPiD7fcLdU5RpVtRbs9WaCXZ","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","8LinWMnf5LVEVARqko7eUyydwzkrLdBUZgeNtu4fAFwA","CQQDXt2M6Cx1J8N3cYsSmPiD7fcLdU5RpVtRbs9WaCXZ","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","DipQ82TGPEVqxwMYt1n6idQpbaJ6MuYuGAPNJXcb23bN","47857wX96Tb4Ud3M3ka949iVRFmUqS33KLBxoVsqgfLK","DipQ82TGPEVqxwMYt1n6idQpbaJ6MuYuGAPNJXcb23bN","DipQ82TGPEVqxwMYt1n6idQpbaJ6MuYuGAPNJXcb23bN","6FoLyMVC4EhdXUe7YjLxKWBbpstQFUETkjWqXUjSPDjy","47857wX96Tb4Ud3M3ka949iVRFmUqS33KLBxoVsqgfLK","DipQ82TGPEVqxwMYt1n6idQpbaJ6MuYuGAPNJXcb23bN","DipQ82TGPEVqxwMYt1n6idQpbaJ6MuYuGAPNJXcb23bN","DipQ82TGPEVqxwMYt1n6idQpbaJ6MuYuGAPNJXcb23bN","DipQ82TGPEVqxwMYt1n6idQpbaJ6MuYuGAPNJXcb23bN","DipQ82TGPEVqxwMYt1n6idQpbaJ6MuYuGAPNJXcb23bN","DipQ82TGPEVqxwMYt1n6idQpbaJ6MuYuGAPNJXcb23bN","DipQ82TGPEVqxwMYt1n6idQpbaJ6MuYuGAPNJXcb23bN","DipQ82TGPEVqxwMYt1n6idQpbaJ6MuYuGAPNJXcb23bN","DipQ82TGPEVqxwMYt1n6idQpbaJ6MuYuGAPNJXcb23bN","DipQ82TGPEVqxwMYt1n6idQpbaJ6MuYuGAPNJXcb23bN","DipQ82TGPEVqxwMYt1n6idQpbaJ6MuYuGAPNJXcb23bN","DipQ82TGPEVqxwMYt1n6idQpbaJ6MuYuGAPNJXcb23bN","DipQ82TGPEVqxwMYt1n6idQpbaJ6MuYuGAPNJXcb23bN","DipQ82TGPEVqxwMYt1n6idQpbaJ6MuYuGAPNJXcb23bN","DipQ82TGPEVqxwMYt1n6idQpbaJ6MuYuGAPNJXcb23bN","DipQ82TGPEVqxwMYt1n6idQpbaJ6MuYuGAPNJXcb23bN","DipQ82TGPEVqxwMYt1n6idQpbaJ6MuYuGAPNJXcb23bN","DipQ82TGPEVqxwMYt1n6idQpbaJ6MuYuGAPNJXcb23bN","DipQ82TGPEVqxwMYt1n6idQpbaJ6MuYuGAPNJXcb23bN"]
              const innerTxs: any = []
              const innerTxs2: any = []
              for (const pool of goodPools.
                // randomize
                sort(() => Math.random() - 0.5).slice(0, 5)){
  const targetPoolInfo = await formatAmmKeysById((pool))
  if (Object.keys(targetPoolInfo).length > 0){
    const poolKeys = jsonInfo2PoolKeys(targetPoolInfo) as LiquidityPoolKeys
    const poolInfo = await Liquidity.fetchInfo({ connection, poolKeys })
     // console.log('weiner')
      const baseMintAI = await connection.getAccountInfo(poolKeys.baseMint)
  const baseToken = new Token(baseMintAI.owner, poolKeys.baseMint, poolInfo.baseDecimals, 'USDC', 'USDC')
  const quoteToken = DEFAULT_TOKEN.WSOL // RAY
  const inputTokenAmount = new TokenAmount( quoteToken, Math.floor((await connection.getBalance(wallet.publicKey)) / 100))
  const slippage = new Percent(138, 10000)
  if (Date.now() - lastWalletRefresh > 30000){
    walletTokenAccounts = await getWalletTokenAccount(new Connection("https://jarrett-solana-7ba9.mainnet.rpcpool.com/8d890735-edf2-4a75-af84-92f7c9e31718"), wallet.publicKey)
    lastWalletRefresh = Date.now()
  }
  let haha = await ammAddLiquidity({
    dir: "deposit",
    baseToken,
    quoteToken,
    targetPool: pool,
    inputTokenAmount,
    slippage,
    walletTokenAccounts,
    wallet: wallet,
    targetPoolInfo,
    poolKeys
  })
  if (haha.innerTxs.length > 0){
  innerTxs.push(...haha.innerTxs)
  }
  if (haha.txids.length > 0){
    innerTxs2.push(...haha.txids)
  }
    }
  }
  console.log(innerTxs)
  console.log(innerTxs2)
  const txids = await buildAndSendTx(innerTxs, wallet)
  console.log(txids)
  await connection.confirmTransaction(txids[txids.length-1], 'confirmed')
  const txids2 = await buildAndSendTx(innerTxs2, wallet)
  console.log(txids2)
      } catch (err){
console.log(err)
      }
    }

// React


export const HomeView: FC = ({ }) => {
  const wallet = useWallet();
  const { connection } = useConnection();

  const balance = useUserSOLBalanceStore((s) => s.balance)
  const { getUserSOLBalance } = useUserSOLBalanceStore()

  useEffect(() => {
    if (wallet.publicKey) {
      console.log(wallet.publicKey.toBase58())
      getUserSOLBalance(wallet.publicKey, connection)
    }
  }, [wallet.publicKey, connection, getUserSOLBalance])
function doMain() {
  main(wallet)
  main(wallet)
  main(wallet)
  main(wallet)
  main(wallet)
}
  return (

    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <div className='mt-6'>
        <div className='text-sm font-normal align-bottom text-right text-slate-600 mt-4'>v0.1.0</div>
        <h1 className="text-center text-5xl md:pl-12 font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mb-4">
          Slerfs Up
        </h1>
        </div>
        <h4 className="md:w-full text-2x1 md:text-4xl text-center text-slate-300 my-2">
          <p>Unleash the full power of diversification - while only ever entering into LPs when 99%+ of that LP is burned!</p>
          <p className='text-slate-500 text-2x1 leading-relaxed'>In true Slerf style, degening made easy.</p>
          <p className='text-slate-100 text-1x1 leading-relaxed'>risk only what you can afford to lose.</p>
          <p className='text-slate-100 text-1x1 leading-relaxed'>turn on auto approve in phantom if you really want to.</p>
        </h4>
        <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-indigo-500 rounded-lg blur opacity-40 animate-tilt"></div>
<div className="max-w-lg mx-auto mockup-code bg-primary border-2 border-[#5252529f] p-6 px-10 my-2">
            <pre data-prefix=">">
              <code>{`Press 'ape' to begin..`} </code>
            </pre>
          </div>
        </div>
        <div className="flex flex-col mt-2">

          <button onClick={doMain} className="btn btn-primary">Ape</button>
        </div>
      </div>
    </div>
  );
};
