import { Typography } from '@material-ui/core';
import React from 'react';
import styles from './NicknameHeader.module.scss';

type NicknameHeaderProps = {
    nickname: string;
};

const NicknameHeader: React.FC<NicknameHeaderProps> = (props) => {
    return (
        <div className={styles.Root}>
            <Typography variant="subtitle1">
                Welcome, <b>{props.nickname}</b>!
            </Typography>
        </div>
    );
};

export default React.memo(NicknameHeader);
