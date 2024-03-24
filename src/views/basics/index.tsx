import {
  FC,
  useEffect,
} from 'react';

import { createJupiterApiClient } from '@jup-ag/api';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react';
import {
  PublicKey,
  VersionedTransaction,
} from '@solana/web3.js';

const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb")
const jupiterQuoteApi = createJupiterApiClient(); // config is optional

export const BasicsView: FC = ({ }) => {
  const wallet = useWallet();
  const { connection } = useConnection();
  useEffect(() => {
  async function main(){
    if (wallet.publicKey !== null) {
    const tokens = await (await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {programId: TOKEN_PROGRAM_ID})).value.map(t => t.account.data.parsed.info.tokenAmount.uiAmount != 1 &&   t.account.data.parsed.info.tokenAmount.uiAmount != 0 ? {mint: t.account.data.parsed.info.mint, amount: Number(t.account.data.parsed.info.tokenAmount.amount)} : null).filter(t => t !== null);

    // only .uiAmount > 0
    const t22s = await (await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {programId: TOKEN_2022_PROGRAM_ID})).value.map(t => t.account.data.parsed.info.tokenAmount.uiAmount != 1  &&   t.account.data.parsed.info.tokenAmount.uiAmount != 0 ? {mint: t.account.data.parsed.info.mint, amount: Number(t.account.data.parsed.info.tokenAmount.amount)} : null).filter(t => t !== null);

    // combine 
    const allTokens = tokens.concat(t22s);
    for (const token of allTokens) {
      if (token.mint == "7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3") continue;
      try {
      const tokenInfo = await jupiterQuoteApi.quoteGet({
        inputMint: token.mint,
        outputMint: "7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3",
        amount: token.amount,
        maxAccounts: 64
      })
      console.log(tokenInfo);
      const {swapTransaction} = await jupiterQuoteApi.swapPost({
        swapRequest: { 
          quoteResponse : tokenInfo,
          userPublicKey: wallet.publicKey.toBase58(),
        }})
        // deserialize the transaction
const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
var transaction = VersionedTransaction.deserialize(swapTransactionBuf);
console.log(transaction);

// sign the transaction
const signed = await wallet.signTransaction(transaction);
console.log(signed);
await connection.sendRawTransaction(signed.serialize());


    } catch (err){
      console.error(err);
    
    }
    }
    }
  }
  main();
  }, [wallet, connection]);
  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mt-10 mb-8">
          Sweep 
        </h1>
        {!wallet.connected ? (
          <div className="text-center">
            <button
              className="btn btn-primary"
            >
              Connect in Top Right
            </button>
          </div>
        ) : null}

        {/* CONTENT GOES HERE */}
        <div className="text-center">
          
        </div>
      </div>
    </div>
  );
};
