import React from 'react';
// import styles from './JoinRoom.module.scss';

type JoinRoomProps = {
    id: string;
};

const JoinRoom: React.FC<JoinRoomProps> = (props) => {
    return (
        <div>Join Room: {props.id}</div>
    );
};

export default React.memo(JoinRoom);
