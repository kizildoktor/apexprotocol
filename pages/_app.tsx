import '@/styles/globals.scss';
import Head from 'next/head';
import Navbar from '@/comps/navbar';
import type { AppProps } from 'next/app';
import { useState } from 'react';

export default function App ({Component, pageProps}: AppProps): React.ReactElement
{
    //State variable to control the navbar button/link colors.
    const [activeSection, setActiveSection] = useState<boolean>(false);

    return (
        <>
            <Head>
                <title>Apex</title>
                <meta name="description" content="apex protocol"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <Navbar activeSection={activeSection}/>
            <Component {...pageProps} setActiveSection={setActiveSection}/>
        </>
    )
}