import styles from '@/styles/about.module.scss';

//ANIMATIONS TO BE APPLIED TO THE ABOUT PAGE
export function aboutAnimator(): void
{
    const images = Array.from(document.querySelectorAll<HTMLImageElement>('img'))

    function handleMouseMove (e: MouseEvent, img: HTMLImageElement)
    {
        const rect = img.getBoundingClientRect();
        
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const offsetX = (e.clientX - centerX) / rect.width;
        const offsetY = (e.clientY - centerY) / rect.height;

        img.style.setProperty('--rotateAboutImageY', `${offsetX * 25}deg`);
        img.style.setProperty('--rotateAboutImageX', `${offsetY * -25}deg`);
    }

    function resetRotation (img: HTMLImageElement) 
    {
        img.style.removeProperty('--rotateAboutImageY');
        img.style.removeProperty('--rotateAboutImageX');
    }

    for (let i = 0; i < images.length; i++) 
    {
        const img = images[i];
        img.addEventListener('mousemove', (e) => handleMouseMove(e, img));
        img.addEventListener('mouseleave', () => resetRotation(img));
    }
}