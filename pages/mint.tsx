import styles from '@/styles/mint.module.scss';
import bundle from "@/bundles/barrel_mint";
import { useEffect, useState } from "react";
import { useLoginWithAbstract } from '@abstract-foundation/agw-react';
import { useAbstractClient } from '@abstract-foundation/agw-react';
import { AbstractProvider } from '@/comps/abstract';
import { ethers, Contract } from 'ethers';
import { useAccount } from 'wagmi';
import 
{ 
    parse, 
    collectUsers, 
    connectUsers, 
    disconnectUsers, 
    switchNetwork,
    ContractState, 
    initContract, 
    readContract, 
    owner_calls, 
    public_mint, 
    publicMintAGW, 
    whitelist_mint, 
    whitelistMintAGW, 
    extractErrorMessage, 
    progressBar
} from '@/utilities/contract';

export default function MintPage (): React.ReactElement
{
    //State variable that controls the loading bar animation.
    const [duration, setDuration] = useState<number>(0);

    //Mount the component when pageMount is true.
    const [pageMount, setPageMount] = useState<boolean>(false);
    
    //Trigger the animation when fadeOut is true.
    const [fadeOut, setFadeOut] = useState<boolean>(false);

    useEffect
    (
        () =>
        {
            //Randomizer to load the component at different times for different users.
            const randomTime = (Math.floor(Math.random() * 5) + 1) * 1000;
            
            //duration state variable is used for the loading bar animation.
            setDuration(randomTime);

            //After randomTime start the fade out animation.
            const fadeTimeout = setTimeout(() => setFadeOut(true), randomTime);

            //After the fade out animation (.5 in scss) mount the component.
            const mountTimeout = setTimeout(() => setPageMount(true), randomTime + 500);

            return () => 
            {
                clearTimeout(fadeTimeout);
                clearTimeout(mountTimeout);
            }
        }, []
    )

    return (
        <>
            {
                !pageMount &&
                <div className={`${styles.mintLoadContainer} ${fadeOut && styles.fadeOut}`}>
                    <div className={styles.mintLoaderWrapper}>
                        <div 
                            className={styles.mintLoaderBar} 
                            style={{ '--duration': `${duration}ms` } as React.CSSProperties}
                        ></div>
                    </div>
                </div>
            }
            {
                pageMount && 
                <AbstractProvider><MintLogic/></AbstractProvider>
            }
        </>
    )
}

function MintLogic(): React.ReactElement
{
    //Opacity animation that triggers after component mount.
    const [fadeIn, setFadeIn] = useState<boolean>(false);

    //Contract initializer state variables.
    const [eventContract, setEventContract] = useState<Contract | null>(null);
    const [writeContract, setWriteContract] = useState<Contract | null>(null);

    //Supply related state variables to control the UI.
    const [totalSupply, setTotalSupply] = useState<bigint | null>(null);
    const [maxSupply, setMaxSupply] = useState<bigint | null>(null);

    //User related state variables to interact with the contract.
    const [account, setAccount] = useState<string | null>(null);
    const [owner, setOwner] = useState<string | null>(null);

    //Transaction related state variables that control the UI.
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [color, setColor] = useState<string>('black');

    //Informative and interaction related state variables.
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [tradeState, setTradeState] = useState<boolean | null>(null);

    //Quantity related state variables used in buttons.
    const [WLAmnt, setWLAmnt] = useState<bigint>(2n);
    const [PLAmnt, setPLAmnt] = useState<bigint>(3n);

    //Minting limit state variables.
    const [WLMintLimit, setWLMintLimit] = useState<bigint | null>(null);
    const [PLMintLimit, setPLMintLimit] = useState<bigint | null>(null);

    //Minting price related state variables.
    const [WLMintPrice, setWhitelistMintPrice] = useState<bigint | null>(null);
    const [PLMintPrice, setPublicMintPrice] = useState<bigint | null>(null);

    //Minting state related state variables.
    const [WLMintState, setWLMintState] = useState<boolean | null>(null);
    const [PLMintState, setPLMintState] = useState<boolean | null>(null);

    //Initializers for AGW wallet connections.
    const { login, logout } = useLoginWithAbstract();
    const { data: agwClient } = useAbstractClient();
    const { address } = useAccount();
    
    useEffect
    (
        () =>
        {
            //A second after mounting activate the fade in animation.
            const fadeTimeout = setTimeout(() => setFadeIn(true), 1000);
            return () => clearTimeout(fadeTimeout);
        }, []
    )

    useEffect
    (
        () =>
        {
            //Return if no browser provider extension is installed.
            if (typeof window === 'undefined' || !window.ethereum) return;

            //Instantiate read/write contracts.
            runWriteContract();

            //Trigger an initialization whenever the chain or account changes.
            window.ethereum.on('accountsChanged', runWriteContract);
            window.ethereum.on('chainChanged', runWriteContract);

            //Remove the event listeners on component dismount.
            return () =>
            {
                if (window.ethereum.removeListener)
                {
                    window.ethereum.removeListener('accountsChanged', runWriteContract);
                    window.ethereum.removeListener('chainChanged', runWriteContract);
                }
            }
        }, [address]
    )

    useEffect
    (
        () =>
        {
            //Return if the read-only contract is missing.
            if (!eventContract) return;

            //Update the state variables when called.
            const handleSupplyUpdate = (newSupply: bigint) => setTotalSupply(newSupply);
            const handleMaxSupply = (newMaxSupply: bigint) => setMaxSupply(newMaxSupply);
            const handleWLMintState = (WLMintState: boolean) => setWLMintState(WLMintState);
            const handlePLMintState = (PLMintState: boolean) => setPLMintState(PLMintState);
            const handleTradeState = (tradeState: boolean) => setTradeState(tradeState);

            //Instantiate event listeners for contract state updates.
            eventContract.on('UpdatedTotalSupply', handleSupplyUpdate);
            eventContract.on('UpdatedMaxSupply', handleMaxSupply);
            eventContract.on('WhitelistPhase', handleWLMintState);
            eventContract.on('PublicPhase', handlePLMintState);
            eventContract.on('TokenTransfers', handleTradeState);

            return () =>
            {
                //Clear the event listeners on component dismount.
                eventContract.off('UpdatedTotalSupply', handleSupplyUpdate);
                eventContract.off('UpdatedMaxSupply', handleMaxSupply);
                eventContract.off('WhitelistPhase', handleWLMintState);
                eventContract.off('PublicPhase', handlePLMintState);
                eventContract.off('TokenTransfers', handleTradeState);
            }
        }, [eventContract]
    )

    //Triggers the browser provider to add/switch a new network entry.
    async function handleNetwork(): Promise<void>
    {
        try
        {
            //Reset state variables.
            setError(null);
            setStatus(null);
            setIsLoading(true);

            //Add or switch the network.
            await switchNetwork();
        } catch (error: any)
        {
            setError(extractErrorMessage(error));
        } finally
        {
            setIsLoading(false);
        }
    }

    //Triggers the browser provider to request a connection.
    async function handleConnect(): Promise<void>
    {
        try
        {
            //Reset state variables.
            setError(null);
            setStatus(null);
            setIsLoading(true);
            
            //Request a connection from user.
            await connectUsers();
        } catch (error: any)
        {
            setError(extractErrorMessage(error));
        } finally
        {
            setIsLoading(false);
        }
    }

    //Sets up the main contract instance to send transactions to the blockchain.
    async function runWriteContract(): Promise<void>
    {
        try
        {
            //Reset state variables.
            setError(null);
            setStatus(null);
            setIsLoading(true);

            //Reset contract state.
            setWriteContract(null);
            setEventContract(null);
            setOwner(null);
            setTotalSupply(null);
            setMaxSupply(null);
            setWLMintLimit(null);
            setPLMintLimit(null);
            setWhitelistMintPrice(null);
            setPublicMintPrice(null);
            setPLMintState(null);
            setWLMintState(null);
            setTradeState(null);
            setAccount(null);

            //Initialize the current connected user account in checksummed format.
            const wallets: string[] = await collectUsers();
            if (wallets.length == 0 && !address) throw new Error ('No wallet detected!');

            //Set the current checksummed wallet address.
            setAccount(wallets.length > 0 ? ethers.getAddress(wallets[0]) : null);

            //Initialize a contract/stateData object.
            const newReadContract: ContractState | undefined = await readContract();
            if (!newReadContract) throw new Error ('Read-only instantiation failed!');

            //Set the event listener contract and UI related state data.
            setEventContract(newReadContract.contract);
            setOwner(newReadContract.decodedStateData.owner);
            setTotalSupply(newReadContract.decodedStateData.totalSupply);
            setMaxSupply(newReadContract.decodedStateData.maxSupply);
            setWLMintLimit(newReadContract.decodedStateData.whitelistMintLimit);
            setPLMintLimit(newReadContract.decodedStateData.publicMintLimit);
            setWhitelistMintPrice(newReadContract.decodedStateData.whitelistMintPrice);
            setPublicMintPrice(newReadContract.decodedStateData.publicMintPrice);
            setPLMintState(newReadContract.decodedStateData.publicMintState);
            setWLMintState(newReadContract.decodedStateData.whitelistMintState);
            setTradeState(newReadContract.decodedStateData.tradingState);

            //Initialize the transacting contract instance.
            const newWriteContract: Contract | undefined = await initContract();
            if (!newWriteContract) throw new Error ('Contract instantiation failed!');

            //Set the initialized contract instance.
            setWriteContract(newWriteContract);

        } catch (error: any)
        {
            setError(extractErrorMessage(error));

            //If AGW wallet is connected don't display wallet message.
            if (address && error.message === 'No wallet connected!') setError(null);
        } finally
        {
            setIsLoading(false);
        }
    }

    //Makes calls to the smart contract and waits for the transaction to be mined.
    async function handleTransaction(action: string): Promise<void>
    {
        try
        {
            //Reset state variables.
            setError(null);
            setStatus(null);
            setIsLoading(true);

            //Throw if the transacting contract or the account is not initialized.
            if (!account) throw new Error ('User account not initialized!');
            if (!writeContract) throw new Error ('Contract not instantiated!');

            setColor('orange');
            setStatus('Pending transaction!');

            if (action === 'owner')
            {
                await owner_calls(writeContract, account);
            }

            if (action === 'wl_mint')
            {
                await whitelist_mint(writeContract, account, WLAmnt);
            }

            if (action === 'pl_mint')
            {
                await public_mint(writeContract, account, PLAmnt);
            }

            setColor('green');
            setStatus('Transaction completed successfully!');
        } catch (error: any)
        {
            //Reset the pending transaction message.
            setStatus(null);
            setError(extractErrorMessage(error));
        } finally
        {
            setIsLoading(false);
        }
    }

    //Makes calls to the smart contract and waits for the transaction to be mined for AGW.
    async function handleTransactionForAGW(action: string): Promise<void>
    {
        try
        {
            //Reset state variables.
            setError(null);
            setStatus(null);
            setIsLoading(true);

            if (!agwClient) throw new Error ('AGW Client not initialized!');
            if (!address) throw new Error ('No wallet is connected!');
            if (!eventContract) throw new Error ('No event contract detected!');

            setColor('orange');
            setStatus('Pending transaction!');
            
            if (action === 'wl_mint') 
            {
                await whitelistMintAGW(eventContract, address, agwClient, WLAmnt);
            }

            if (action === 'pl_mint') 
            {
                await publicMintAGW(eventContract, address, agwClient, PLAmnt);
            }

            setColor('green');
            setStatus('Transaction completed successfully!');

        } catch (error: any)
        {
            //Reset the pending transaction message.
            setStatus(null);
            setError(extractErrorMessage(error));

            //Only way to catch the no-funds error before it breaks things.
            if (error.message == 'Not enough funds!') setError(error.message);
        } finally
        {
            setIsLoading(false);
        }
    }

    //Controls the whitelist mint quantity variable used in whitelist_mint function.
    function handleWLQuantity (toggle: string): void
    {
        if (!WLMintLimit) throw new Error ('Contract not initialized!');
        if (toggle === 'decrease' && WLAmnt > 1) setWLAmnt(WLAmnt - 1n);
        if (toggle === 'increase' && WLAmnt < WLMintLimit) setWLAmnt(WLAmnt + 1n);
    }

    //Controls the public mint quantity variable used in public_mint function.
    function handlePLQuantity (toggle: string): void
    {
        if (!PLMintLimit) throw new Error ('Contract not initialized!');
        if (toggle === 'decrease' && PLAmnt > 1) setPLAmnt(PLAmnt - 1n);
        if (toggle === 'increase' && PLAmnt < PLMintLimit) setPLAmnt(PLAmnt + 1n);
    }

    //Checks for conditions that need to pass before minting is allowed.
    function mintable(): boolean
    {
        return isLoading || !writeContract || totalSupply === maxSupply;
    }

    //Checks for conditions that need to pass before minting is allowed for AGW.
    function mintableAGW(): boolean
    {
        return isLoading || totalSupply === maxSupply;
    }

    return (

        <main 
            id='mint_page' 
            className=
            {
                `
                    ${styles.mintPageContainer} 
                    ${fadeIn && styles.fadeIn}
                `
            }
        >
            <section>
                {
                    (account && !address) &&
                    <p>{account.toUpperCase()}</p> 
                }
                {
                    !account && !address &&
                    <button 
                        onClick={handleConnect} 
                        disabled={isLoading}
                    >
                        Connect With MetaMask
                    </button>
                }
            </section>

            <section>
                {
                    (account && !address) &&
                    <button 
                        onClick={disconnectUsers} 
                    >
                        Disconnect from MetaMask
                    </button>
                }
            </section>

            <section>
                {
                    (address || (address && account)) &&
                    <p>{address.toUpperCase()}</p> 
                }
                {
                    !address && !account &&
                    <button 
                        onClick={login} 
                        disabled={isLoading}
                    >
                        Connect With Abstract
                    </button>
                }
            </section>

            <section>
                {
                    (address || (address && account)) &&
                    <button 
                        onClick={logout} 
                    >
                        Disconnect from Abstract
                    </button>
                }
            </section>

            <section>
                {
                    (account && !writeContract) &&
                    <button 
                        onClick={handleNetwork} 
                        disabled={isLoading}
                        style={{ color: 'blue', border: '2px solid blue'}}
                    >
                        Switch to Abstract Mainnet
                    </button>
                }
            </section>

            {
                (account && !address) &&
                <fieldset 
                    style={{ border: 'none'}}
                    disabled={mintable() || !WLMintState}
                >
                    {
                        WLMintState === false &&
                        <p style={{color: 'purple'}}>Whitelist mint phase is not active!</p>
                    }
                    <section>
                        <button>{WLMintPrice && parse(WLMintPrice * WLAmnt)} ETH</button>
                        <button onClick={()=> handleTransaction('wl_mint')}>WL Mint</button>
                    </section>
                    <section>
                        <button onClick={() => handleWLQuantity('decrease')}>-</button>
                        <button>{WLAmnt}</button>
                        <button onClick={() => handleWLQuantity('increase')}>+</button>
                    </section>
                </fieldset>
            }

            {
                (account && !address) &&
                <fieldset 
                    style={{ border: 'none'}}
                    disabled={mintable() || !PLMintState}
                >
                    {
                        PLMintState === false &&
                        <p style={{color: 'purple'}}>Public mint phase is not active!</p>
                    }
                    <section>
                        <button>{PLMintPrice && parse(PLMintPrice * PLAmnt)} ETH</button>
                        <button onClick={()=> handleTransaction('pl_mint')}>PL Mint</button>
                    </section>
                    <section>
                        <button onClick={() => handlePLQuantity('decrease')}>-</button>
                        <button>{PLAmnt}</button>
                        <button onClick={() => handlePLQuantity('increase')}>+</button>
                    </section>
                </fieldset>
            }

            {
                (address || (address && account)) &&
                <fieldset 
                    style={{ border: 'none'}}
                    disabled={mintableAGW() || !WLMintState}
                >
                    {
                        WLMintState === false &&
                        <p style={{color: 'purple'}}>Whitelist mint phase is not active!</p>
                    }
                    <section>
                        <button>{WLMintPrice && parse(WLMintPrice * WLAmnt)} ETH</button>
                        <button 
                            onClick={()=> handleTransactionForAGW('wl_mint')}
                        >
                            WL Mint
                        </button>
                    </section>
                    <section>
                        <button onClick={() => handleWLQuantity('decrease')}>-</button>
                        <button>{WLAmnt}</button>
                        <button onClick={() => handleWLQuantity('increase')}>+</button>
                    </section>
                </fieldset>
            }
            
            {
                (address || (address && account)) &&
                <fieldset 
                    style={{ border: 'none'}}
                    disabled={mintableAGW() || !PLMintState}
                >
                    {
                        PLMintState === false &&
                        <p style={{color: 'purple'}}>Public mint phase is not active!</p>
                    }
                    <section>
                        <button>{PLMintPrice && parse(PLMintPrice * PLAmnt)} ETH</button>
                        <button 
                            onClick={()=> handleTransactionForAGW('pl_mint')}
                        >
                            PL Mint
                        </button>
                    </section>
                    <section>
                        <button onClick={() => handlePLQuantity('decrease')}>-</button>
                        <button>{PLAmnt}</button>
                        <button onClick={() => handlePLQuantity('increase')}>+</button>
                    </section>
                </fieldset>
            }

            <section>
                {
                    owner === account && account &&
                    <button disabled={!writeContract}>Withdraw</button>
                }
                {
                    owner === account && account &&
                    <button 
                        disabled={!writeContract} 
                        onClick={()=> handleTransaction('owner') }
                    >Owner Calls</button>
                }
            </section>

            <section>
                {
                    totalSupply !== null && maxSupply !== null
                    ? <p style={progressBar(totalSupply, maxSupply)}>
                        Total Minted: {totalSupply}/{maxSupply}</p>
                    : <></>
                }
            </section>

            <section>
                {
                    tradeState === false 
                    ? <p>Token tranfers are disabled until end of mint phase.</p>
                    : tradeState === true
                    ? <p style={{color: 'green'}}>Token tranfers are enabled!</p>
                    : <></>
                }
            </section>

            <section>{ status && <p style={{color: color}}>{status}</p> }</section>
            <section>{ error && <p style={{color: 'red'}}>{error}</p> }</section>

        </main>
    );
}