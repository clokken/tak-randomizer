import React from 'react';
import styles from './Logo.module.scss';
import BuildPics from '../../assets/images/buildpics.jpg';

const spritesCount = 167; // this means the image height MUST be === 8016px
const spriteHeight = 48;
const spriteWidth = 64;

const nextRandomIndex = () => Math.floor(Math.random() * spritesCount);

const Logo: React.FC = () => {
    const [randomIndex, setRandomIndex] = React.useState(nextRandomIndex());

    return (
        <div
            className={styles.Logo}
            style={{
                width: spriteWidth,
                height: spriteHeight,
                backgroundImage: `url(${BuildPics})`,
                backgroundPositionY: randomIndex * spriteHeight,
            }}
            onClick={e => setRandomIndex(nextRandomIndex())}
        />
    );
};

export default React.memo(Logo);
