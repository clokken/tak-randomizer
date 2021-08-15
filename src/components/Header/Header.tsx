import React from 'react';
import styles from './Header.module.scss';
import { AppBar, Button, Toolbar, Typography } from '@material-ui/core';
import Logo from './Logo';

type HeaderProps = {};

const Header: React.FC<HeaderProps> = (props) => {
    return (
        <AppBar position="relative" className={styles.Root}>
            <Toolbar>
                <Logo />
                <Typography variant="h6" className={styles.Title}>
                    TA:K Race Randomizer
                </Typography>

                <Button color="inherit" className={styles.Button} href="/">
                    New Room
                </Button>

                <Button
                    color="inherit"
                    className={styles.Button}
                    href="https://discord.gg/r9ArNWe"
                    target="_blank"
                >
                    Discord
                </Button>

                <Button
                    color="inherit"
                    className={styles.Button}
                    href="https://github.com/clokken/tak-randomizer"
                    target="_blank"
                >
                    About
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default React.memo(Header);
