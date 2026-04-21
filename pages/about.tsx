import styles from '@/styles/about.module.scss';
import Image from 'next/image';
import { useEffect } from 'react';
import { aboutAnimator } from '@/effects/animations_about';

import ApexTB from '@/public/images/about/ApexTB.png';
import nft37 from '@/public/images/about/37.png';
import nft170 from '@/public/images/about/170.png';
import nft241 from '@/public/images/about/241.png';
import nft257 from '@/public/images/about/257.png';
import nft289 from '@/public/images/about/289.png';
import nft453 from '@/public/images/about/453.png';
import nft469 from '@/public/images/about/469.png';
import nft540 from '@/public/images/about/540.png';
import nft584 from '@/public/images/about/584.png';
import nft651 from '@/public/images/about/651.png';
import nft972 from '@/public/images/about/972.png';
import nft1908 from '@/public/images/about/1908.png';

export default function About (): React.ReactElement
{
    useEffect 
    (
        () => 
        {
            aboutAnimator();
        }, []
    );

    return (

        <div id='about' className={styles.aboutPage}>
            <section id='aboutSectionLeft' className={styles.aboutSectionLeft}>

                <div>
                    <h2>
                        OUR PLAN FOR THE APEX PREDATORS OF TOMORROW
                    </h2>
                    <p>
                        Apex is a community-driven, next-gen anime PFP collection 
                        that redefines digital identity through high-quality, 
                        anime-inspired art. Each Apex presents its original artistic 
                        style alongside its innovative vision and the raw spirit of 
                        an apex predator.
                        <br/><br/> 
                        We set the trends, and our community shapes the lore while 
                        sharing rewards in an ecosystem where owning an NFT means 
                        owning the future. Beyond art, it's a collective uprising 
                        where every voice matters.
                        <br/><br/>
                        Claim your Apex, own it and show it to the world. Now is your 
                        moment to rise and take control.
                        <br/><br/>
                        Join our Discord and stake your place at the top of the food chain.
                    </p>
                    <Image src={ApexTB} alt='aboutBanner' priority={true} draggable={false}/>
                </div>

            </section>

            <section id='aboutSectionRight' className={styles.aboutSectionRight}>

                <svg 
                    width="0" height="0" 
                    style = {{visibility: 'hidden', position: 'absolute'}}
                >
                    <defs>
                        <filter id="round">
                            <feGaussianBlur 
                                in="SourceGraphic" stdDeviation="5" result="blur"/>    
                            <feColorMatrix 
                                values = "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"/>
                            <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
                        </filter>
                    </defs>
                </svg>
                <div>
                    <div>
                        <Image src={nft37}  alt='nft37'  priority={true} draggable={false}/>
                        <Image src={nft170} alt='nft170' priority={true} draggable={false}/>
                        <Image src={nft241} alt='nft241' priority={true} draggable={false}/>
                        <Image src={nft257} alt='nft257' priority={true} draggable={false}/>
                    </div>
                </div>
                <div>
                    <div>
                        <Image src={nft289} alt='nft289' priority={true} draggable={false}/>
                        <Image src={nft1908} alt='nft19' priority={true} draggable={false}/>
                        <Image src={nft469} alt='nft469' priority={true} draggable={false}/>
                        <Image src={nft584} alt='nft584' priority={true} draggable={false}/>
                    </div>
                </div>
                <div>
                    <div>
                        <Image src={nft540} alt='nft540' priority={true} draggable={false}/>
                        <Image src={nft651} alt='nft651' priority={true} draggable={false}/>
                        <Image src={nft972} alt='nft972' priority={true} draggable={false}/>
                        <Image src={nft453} alt='nft453' priority={true} draggable={false}/>
                    </div>
                </div>
            </section>
        </div>
    );
}
