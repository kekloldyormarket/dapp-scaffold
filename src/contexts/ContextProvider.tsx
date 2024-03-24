import {
  FC,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';

import dynamic from 'next/dynamic';

import {
  WalletAdapterNetwork,
  WalletError,
} from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

import { notify } from '../utils/notifications';
import {
  AutoConnectProvider,
  useAutoConnect,
} from './AutoConnectProvider';
import {
  NetworkConfigurationProvider,
  useNetworkConfiguration,
} from './NetworkConfigurationProvider';

const ReactUIWalletModalProviderDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletModalProvider,
  { ssr: false }
);

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const { autoConnect } = useAutoConnect();
    const { networkConfiguration } = useNetworkConfiguration();
    const network = networkConfiguration as WalletAdapterNetwork;
    const endpoint = "https://jarrett-solana-7ba9.mainnet.rpcpool.com/8d890735-edf2-4a75-af84-92f7c9e31718"

    console.log(network);

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
        ],
        [network]
    );

    const onError = useCallback(
        (error: WalletError) => {
            notify({ type: 'error', message: error.message ? `${error.name}: ${error.message}` : error.name });
            console.error(error);
        },
        []
    );

    return (
        // TODO: updates needed for updating and referencing endpoint: wallet adapter rework
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} onError={onError} autoConnect={autoConnect}>
                <ReactUIWalletModalProviderDynamic>
                    {children}
                </ReactUIWalletModalProviderDynamic>
			</WalletProvider>
        </ConnectionProvider>
    );
};

export const ContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <>
            <NetworkConfigurationProvider>
                <AutoConnectProvider>
                    <WalletContextProvider>{children}</WalletContextProvider>
                </AutoConnectProvider>
            </NetworkConfigurationProvider>
        </>
    );
};
