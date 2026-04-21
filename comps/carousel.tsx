import styles from '@/styles/carousel.module.scss';
import Image from 'next/image';
import image1 from '@/public/images/carousel/122.png';
import image2 from '@/public/images/carousel/178.png';
import image3 from '@/public/images/carousel/264.png';
import image4 from '@/public/images/carousel/323.png';
import image5 from '@/public/images/carousel/422.png';
import image6 from '@/public/images/carousel/536.png';
import image7 from '@/public/images/carousel/585.png';
import image8 from '@/public/images/carousel/662.png';

export default function Carousel(): React.ReactElement
{
    return (
        <section id='carousel' className={styles.carouselSegment}>
            <div><Image src={image1} alt='image1' priority={true} draggable={false}/></div>
            <div><Image src={image2} alt='image2' priority={true} draggable={false}/></div>
            <div><Image src={image3} alt='image3' priority={true} draggable={false}/></div>
            <div><Image src={image4} alt='image4' priority={true} draggable={false}/></div>
            <div><Image src={image5} alt='image5' priority={true} draggable={false}/></div>
            <div><Image src={image6} alt='image6' priority={true} draggable={false}/></div>
            <div><Image src={image7} alt='image7' priority={true} draggable={false}/></div>
            <div><Image src={image8} alt='image8' priority={true} draggable={false}/></div>
        </section>
    );
}
