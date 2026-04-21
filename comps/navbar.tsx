import styles from '@/styles/navbar.module.scss';
import bundle from '@/bundles/barrel_navbar';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { FaDiscord, FaXTwitter } from 'react-icons/fa6';
import 
{ 
    collectUsers, 
    connectUsers, 
    disconnectUsers, 
    extractErrorMessage 
} from '@/utilities/contract';

interface NavbarProps
{
    activeSection: boolean;
}

export default function Navbar ({activeSection}: NavbarProps): React.ReactElement
{
    //State variables for displaying the wallet address.
    const [wallet, setWallet] = useState<string | null>(null);

    //State variables for connection interactivity.
    const [hovered, setHovered] = useState<boolean>(false);

    useEffect
    (
        () =>
        {
            //Return if no browser provider extension is installed.
            if (typeof window === 'undefined' || !window.ethereum) return;

            //Collect wallets upon first mount.
            handleWallets();

            //Collect wallets when account change is detected.
            window.ethereum.on('accountsChanged', handleWallets);

            //Remove the event listeners on component dismount.
            return () =>
            {
                if (window.ethereum.removeListener)
                {
                    window.ethereum.removeListener('accountsChanged', handleWallets);
                }
            }
        }, []
    )

    //Upon component mount check for any connected wallets.
    async function handleWallets (): Promise<void>
    {
        //If any wallet is currently connected display it.
        const wallets: string[] = await collectUsers();
        setWallet(wallets.length > 0 ? wallets[0].toUpperCase().slice(-6) : null);
    }

    //Used to gracefully handle breaks if an error occurs.
    async function handleConnection (): Promise<void>
    {
        try
        {
            //Connect if a wallet isn't already and disconnect otherwise.
            await (wallet ? disconnectUsers() : connectUsers());
        } catch (error: any)
        {
            //Gracefully handle any breaking errors.
            console.log(extractErrorMessage(error));
        }
    }

    return (

        <nav id='navbar' className={styles.navbarContainer}>

            <ul className={styles[activeSection ? 'brightBG' : 'darkBG']}>
                <Link href='/'></Link>
            </ul>

            <ul className={styles[activeSection ? 'bright' : 'dark']}>
                <Link href='/'>HOME</Link>
                <Link href='/'>ROADMAP</Link>
                <Link href='/#about'>ABOUT</Link>
                <Link href='/'>WHITEPAPER</Link>
                <Link href='/#more'>MORE</Link>
                <Link href='/game'>GAME</Link>
                {/* <Link href='/checker'>CHECKER</Link>
                <Link href='/mint'>MINT</Link> */}
                <Link href='/'><FaDiscord/></Link>
                <Link href='/'><FaXTwitter/></Link>
            </ul>

            <ul className={styles[activeSection ? 'bright' : 'dark']}>
                <button 
                    onClick={handleConnection}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                >
                    { wallet ? (hovered ? 'DISCONNECT' : wallet) : 'CONNECT' }
                </button>
            </ul>

        </nav>

    )
}