import React from 'react';
import { PathContext } from '../../App';
import HostRoom from '../HostRoom/HostRoom';
import JoinRoom from '../JoinRoom/JoinRoom';
// import styles from './Body.module.scss';

type BodyProps = {};

const Body: React.FC<BodyProps> = () => {
    const path = React.useContext(PathContext);

    return path === '' ? (
        <HostRoom />
    ) : (
        <JoinRoom id={path} />
    );
};

export default React.memo(Body);
