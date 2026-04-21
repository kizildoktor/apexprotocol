import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { abstractTestnet } from "viem/chains";

export function AbstractProvider({children}: {children: React.ReactNode}): React.ReactElement
{
    return (
        <AbstractWalletProvider 
            chain={abstractTestnet}
        >
            {children}
        </AbstractWalletProvider>
    )
}