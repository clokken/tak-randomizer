import React from 'react';
import styles from './Logo.module.scss';
import BuildPics from '../../assets/images/buildpics.jpg';

const spritesCount = 167; // this means the image height MUST be === 8016px
const spriteHeight = 48;
const spriteWidth = 64;

const nextRandomIndex = () => Math.floor(Math.random() * spritesCount);

const STRIDE = 200;
const delay = 20;
const cycleTimeMs = 4000;
const _step = (delay / cycleTimeMs) * STRIDE;
const step = Math.round((_step + Number.EPSILON) * 100) / 100; // rounded to 2 decimal places

const Logo: React.FC = () => {
    const slide1Ref = React.useRef<HTMLDivElement>(null);
    const slide2Ref = React.useRef<HTMLDivElement>(null);
    const img1Ref = React.useRef<HTMLDivElement>(null);
    const img2Ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if ((STRIDE / step) % 1 !== 0 || (STRIDE / 2 / step) % 1 !== 0) {
            throw new Error(`"STRIDE" (${STRIDE}) isn't evenly divided by "step" (${step})!`);
        }
    }, []);

    React.useEffect(() => {
        const slide1 = slide1Ref.current;
        const slide2 = slide2Ref.current;
        const img1 = img1Ref.current;
        const img2 = img2Ref.current;

        if (!slide1 || !slide2 || !img1 || !img2) {
            return;
        }

        let progress = 0; // scales from 0 (inclusive) to max (non-inclusive)

        img1.style.backgroundPositionY = (nextRandomIndex() * spriteHeight) + 'px';
        img2.style.backgroundPositionY = (nextRandomIndex() * spriteHeight) + 'px';

        const handle = setInterval(() => {
            progress += step;

            if (progress === STRIDE / 2) {
                img1.style.backgroundPositionY = (nextRandomIndex() * spriteHeight) + 'px';
            }

            if (progress === STRIDE) {
                progress = 0;
                img2.style.backgroundPositionY = (nextRandomIndex() * spriteHeight) + 'px';
            }

            slide1.style.transform = progress < (STRIDE / 2)
                ? `translateX(-${progress}%)`
                : `translateX(${STRIDE - progress}%)`;

            slide2.style.transform = `translateX(${(STRIDE / 2) - progress}%)`;
        }, delay);

        return () => {
            clearInterval(handle);
        };
    }, [slide1Ref, slide2Ref, img1Ref, img2Ref]);

    return (
        <div className={styles.Root}>
            <div
                className={styles.Carousel}
                style={{
                    width: spriteWidth,
                    height: spriteHeight,
                }}
            >
                <div ref={slide1Ref} className={styles.LogoWrapper}>
                    <div
                        ref={img1Ref}
                        className={styles.Logo}
                        style={{
                            backgroundImage: `url(${BuildPics})`,
                            // backgroundPositionY: idx * spriteHeight,
                        }}
                    />
                </div>

                <div ref={slide2Ref} className={styles.LogoWrapper}>
                    <div
                        ref={img2Ref}
                        className={styles.Logo}
                        style={{
                            backgroundImage: `url(${BuildPics})`,
                            // backgroundPositionY: idx * spriteHeight,
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default React.memo(Logo);
