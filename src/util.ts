import {
  buildSimpleTransaction,
  findProgramAddress,
  InnerSimpleV0Transaction,
  SPL_ACCOUNT_LAYOUT,
  TOKEN_PROGRAM_ID,
  TokenAccount,
} from '@raydium-io/raydium-sdk';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import {
  Connection,
  PublicKey,
  SendOptions,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js';

import {
  addLookupTableInfo,
  connection,
  makeTxVersion,
} from './configy';

export async function sendTx(
  connection: Connection,
  payer: AnchorWallet,
  txs: (VersionedTransaction | Transaction)[],
  options?: SendOptions
): Promise<string[]> {
  const txids: string[] = [];
  const signed = await payer.signAllTransactions(txs)
  for (const iTx of signed) {
    if (iTx instanceof VersionedTransaction) {
      txids.push(await connection.sendTransaction(iTx, options));
    } else {
      txids.push(await connection.sendTransaction(iTx, [], options));
    }
  }
  return txids;
}

export async function getWalletTokenAccount(connection: Connection, wallet: PublicKey): Promise<TokenAccount[]> {
  const walletTokenAccount = await connection.getTokenAccountsByOwner(wallet, {
    programId: TOKEN_PROGRAM_ID,
  });
  return walletTokenAccount.value.map((i) => ({
    pubkey: i.pubkey,
    programId: i.account.owner,
    accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
  }));
}

export async function buildAndSendTx(innerSimpleV0Transaction: InnerSimpleV0Transaction[], wallet: any, options?: SendOptions) {
  let wedo = true 
  for (const tx of innerSimpleV0Transaction){
    if (tx.instructions.length === 0){
      wedo = false
      break
    }
  }
  if (!wedo){
    console.log('no instructions, skip')
    return []
  }
  const willSendTx = await buildSimpleTransaction({
    connection,
    makeTxVersion,
    payer: wallet.publicKey,
    innerTransactions: innerSimpleV0Transaction,
    addLookupTableInfo: addLookupTableInfo,
  })

  return await sendTx(connection, wallet, willSendTx, {...options, skipPreflight: false})
}

export function getATAAddress(programId: PublicKey, owner: PublicKey, mint: PublicKey) {
  const { publicKey, nonce } = findProgramAddress(
    [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
    new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
  );
  return { publicKey, nonce };
}

export async function sleepTime(ms: number) {
  console.log((new Date()).toLocaleString(), 'sleepTime', ms)
  return new Promise(resolve => setTimeout(resolve, ms))
}