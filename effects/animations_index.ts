import { Dispatch, RefObject, SetStateAction, useEffect } from "react";

//ANIMATIONS TO BE APPLIED TO THE NAVBAR IN THE INDEX PAGE
export function useIntersectionObserver 
(
    sectionRef: RefObject<HTMLElement | null>,
    setActiveSection: Dispatch<SetStateAction<boolean>>
): void
{
    useEffect
    (
        () =>
        {
            function observerCallback (entries: IntersectionObserverEntry[])
            {
                for (let i = 0; i < entries.length; i++)
                {
                    setActiveSection(entries[i].isIntersecting);
                }
            }

            let observer: IntersectionObserver;
            let observerOptions: IntersectionObserverInit;

            observerOptions = {threshold: .025};
            observer = new IntersectionObserver(observerCallback, observerOptions);

            if (sectionRef.current)
            {
                observer.observe(sectionRef.current);
            }

            return () => {sectionRef.current && observer.unobserve(sectionRef.current)};

        }, [sectionRef, setActiveSection]
    )
}

export function cardsAnimator(): void
{
    // 1. Select the main card containers
    const cards = Array.from(document.querySelectorAll<HTMLElement>('#mid > span > div')); // This selector still works!

    function handleMouseMove (e: MouseEvent, card: HTMLElement)
    {
        const rect = card.getBoundingClientRect();
        
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // 2. Calculate the base rotation based on cursor position
        const baseOffsetX = (e.clientX - centerX) / rect.width;
        const baseOffsetY = (e.clientY - centerY) / rect.height;

        // 3. Find all layers *inside this specific card*
        const layers = Array.from(card.querySelectorAll<HTMLElement>('[data-depth]'));

        // 4. Loop over each layer and apply a scaled transform
        for (const layer of layers)
        {
            // Get the depth, default to 0.5 if not specified
            const depth = parseFloat(layer.dataset.depth || '0.5'); 
            
            // Calculate scaled rotation. Bigger 'depth' = more movement
            // The '25' is the max rotation angle, feel free to change it
            const offsetX = baseOffsetX * 80 * depth;
            const offsetY = baseOffsetY * 80 * depth;

            // 5. Set the CSS variables *on the layer itself*
            layer.style.setProperty('--translateX', `${offsetX}px`);
            layer.style.setProperty('--translateY', `${offsetY}px`);
        }
    }

    function resetTransform (card: HTMLElement) 
    {
        // 1. Find all layers inside this card
        const layers = Array.from(card.querySelectorAll<HTMLElement>('[data-depth]'));

        // 2. Loop and reset properties for each layer
        for (const layer of layers)
        {
            layer.style.removeProperty('--translateX');
            layer.style.removeProperty('--translateY');
        }
    }

    // 3. Attach listeners to the main *card* elements
    for (let i = 0; i < cards.length; i++) 
    {
        const card = cards[i];
        card.addEventListener('mousemove', (e) => handleMouseMove(e, card));
        card.addEventListener('mouseleave', () => resetTransform(card));
    }
}