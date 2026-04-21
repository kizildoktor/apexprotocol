import styles from '@/styles/index.module.scss';
import bundle from '@/bundles/barrel_index';
import Image from 'next/image';
import { useIntersectionObserver } from '@/effects/animations_index';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import About from './about';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';
import { cardsAnimator } from '@/effects/animations_index';

interface HomeProps
{
    setActiveSection: Dispatch<SetStateAction<boolean>>;
}

export default function Home ({setActiveSection}: HomeProps): React.ReactElement
{
    //Ref to prevent multiple re-renders of the dom.
    const sectionRef = useRef<HTMLElement | null>(null);

    //Ref for shuffling through the cards in the mid section.
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    //State variable to control when to load the video.
    const [showVideo, setShowVideo] = useState<boolean>(false);

    useEffect
    (
        () =>
        {
            cardsAnimator();
            checkWindowSize();
            window.addEventListener('resize', checkWindowSize);
            return () => window.removeEventListener('resize', checkWindowSize);
        }, []
    )

    //Apply some effects from the animations_index library.
    useIntersectionObserver(sectionRef, setActiveSection);

    //Do not load video on mobile.
    function checkWindowSize (): void
    {
        setShowVideo(window.innerWidth > 1024);
    }

    //Scroll to the start of the cards.
    function scrollToStart (): void
    {
        if (scrollContainerRef.current) scrollContainerRef.current.scrollLeft = 0;
    }

    //Scroll to the end of the cards.
    function scrollToEnd (): void
    {
        const container: HTMLDivElement | null = scrollContainerRef.current;
        if (container) container.scrollLeft = container.scrollWidth - container.clientWidth;
    }

    return (
        <main className={styles.homeContainer}>

            <section className={styles.landingContainer} ref={sectionRef}>
                <Link href='/'>WATCH</Link>
                
                {
                    showVideo &&
                    <video autoPlay muted loop playsInline>
                        <source src='/videos/landing_video.mp4' type='video/mp4'/>
                    </video>
                }
            </section>

            <section id='midTitle' className={styles.midTitleContainer}>
                <h1>TOGETHER, WE BUILD</h1>
                <p>description will appear here</p>
            </section>

            <section id='mid' className={styles.midContainer} ref={scrollContainerRef}>
                <span>
                    {/* ⬇️ UPDATED: Card 1 */}
                    <div className={styles.card}>
                        <div 
                            className={styles.cardLayer} 
                            style={{ backgroundImage: "url('/images/index/Parallax/01/01bg.png')" }}
                            data-depth="0.075"
                        ></div>
                        <div 
                            className={styles.cardLayer} 
                            style={{ backgroundImage: "url('/images/index/Parallax/01/01viallayer2.png')" }}
                            data-depth="0.125"
                        ></div>
                        <div className={styles.cardGradient}></div>
                        <div className={styles.cardContent}>
                            <h5>AWAKENING</h5>
                            <p>
                                At the origin of every system lies something older than 
                                code… an idea. That idea became our beginning. The Awakening.
                            </p>
                        </div>
                    </div>
                    {/* ⬇️ UPDATED: Card 2 */}
                    <div className={styles.card}>
                        <div 
                            className={styles.cardLayer} 
                            style={{ backgroundImage: "url('/images/index/Parallax/02/backcitypng.png')" }}
                            data-depth="0.075"
                        ></div>
                         <div 
                            className={styles.cardLayer} 
                            style={{ backgroundImage: "url('/images/index/Parallax/02/buildings.png')" }}
                            data-depth="0.125"
                        ></div>
                        <div 
                            className={styles.cardLayer} 
                            style={{ backgroundImage: "url('/images/index/Parallax/02/apex.png')" }}
                            data-depth="0.225"
                        ></div>
                        <div className={styles.cardGradient}></div>
                        <div className={styles.cardContent}>
                            <h5>THE CALLING</h5>
                            <p>
                                We are Apex. This is a call to all Apex across the chain. 
                                We are here and we are waiting.
                            </p>
                        </div>
                    </div>
                    {/* ⬇️ UPDATED: Card 3 */}
                    <div className={styles.card}>
                         <div 
                            className={styles.cardLayer} 
                            style={{ backgroundImage: "url('/images/index/Parallax/03/bglayer1.png')" }}
                            data-depth="0.05"
                        ></div>
                        <div 
                            className={styles.cardLayer} 
                            style={{ backgroundImage: "url('/images/index/Parallax/03/monitorlayer2.png')" }}
                            data-depth="0.1"
                        ></div>
                        <div 
                            className={styles.cardLayer} 
                            style={{ backgroundImage: "url('/images/index/Parallax/03/screenslayer3.png')" }}
                            data-depth="0.15"
                        ></div>
                        <div 
                            className={styles.cardLayer} 
                            style={{ backgroundImage: "url('/images/index/Parallax/03/apexlayer4.png')" }}
                            data-depth="0.2"
                        ></div>
                        <div className={styles.cardGradient}></div>
                        <div className={styles.cardContent}>
                            <h5>INITIATION</h5>
                            <p>
                                Every path begins somewhere. In Apex, it begins with one 
                                click. One mint.
                            </p>
                        </div>
                    </div>
                </span>
                <span>
                    {/* ⬇️ UPDATED: Card 4 */}
                    <div className={styles.card}>
                        <div 
                            className={styles.cardLayer} 
                            style={{ backgroundImage: "url('/images/index/Parallax/04/bg.png')" }}
                            data-depth="0.075"
                        ></div>
                        <div 
                            className={styles.cardLayer} 
                            style={{ backgroundImage: "url('/images/index/Parallax/04/vial.png')" }}
                            data-depth="0.125"
                        ></div>
                        <div className={styles.cardGradient}></div>
                        <div className={styles.cardContent}>
                            <h5>RECODE</h5>
                            <p>
                                When old tokens fade, new visions rise. Mutate, 
                                Adopt, Re-code your Apex
                            </p>
                        </div>
                    </div>
                    {/* ⬇️ UPDATED: Card 5 */}
                    <div className={styles.card}>
                        <div 
                            className={styles.cardLayer} 
                            style={{ backgroundImage: "url('/images/index/Parallax/05/bg.png')" }}
                            data-depth="0.075"
                        ></div>
                        <div 
                            className={styles.cardLayer} 
                            style={{ backgroundImage: "url('/images/index/Parallax/05/scnd.png')" }}
                            data-depth="0.125"
                        ></div>
                        <div 
                            className={styles.cardLayer} 
                            style={{ backgroundImage: "url('/images/index/Parallax/05/thrd.png')" }}
                            data-depth="0.17~5"
                        ></div>
                        <div className={styles.cardGradient}></div>
                        <div className={styles.cardContent}>
                            <h5>VYRE</h5>
                            <p>
                                Connect. Influence. Earn.
                            </p><br/>
                        </div>
                    </div>
                     {/* ⬇️ UPDATED: Card 6 */}
                    <div className={styles.card}>
                        <div 
                            className={styles.cardLayer} 
                            style={{ backgroundImage: "url('/images/index/Parallax/06/ftr.png')" }}
                            data-depth="0.175"
                        ></div>
                        <div className={styles.cardGradient}></div>
                        <div className={styles.cardContent}>
                            <h5>THE UNKNOWN</h5>
                            <p>
                                Everything beyond 2027 is classified.
                            </p><br/>
                        </div>
                    </div>
                </span>
            </section>

            <section id='scrollContainer' className={styles.scrollContainer}>
                <button onClick={scrollToStart}><FaArrowLeft/></button>
                <button onClick={scrollToEnd}><FaArrowRight/></button>
            </section>

            <About/>

            <section id='more' className={styles.infoContainer}>
                <div>
                    <h1>WE ARE APEX</h1>
                    <p>
                        Apex is a next-gen anime PFP collection that continuously 
                        evolves through innovative trait updates. Each Apex is a 
                        dynamic digital asset merging high-quality anime art with 
                        user-driven customizations. Coming soon to Abstract-Chain!
                    </p>
                    <span>
                        <Link href='/'>WHITEPAPER</Link>
                        <Link href='/'>WHITELIST FORM</Link>
                    </span>
                </div>
            </section>

            <section id='footer' className={styles.footerContainer}>
                <Link href='/'>
                    <Image 
                        src={bundle.whiteLogo} 
                        alt='nft37' 
                        priority={true} 
                        draggable={false}
                    />
                </Link>
                
            </section>
        
        </main>
    );
}