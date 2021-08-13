import { Button } from '@material-ui/core';
import React from 'react';
import { ClientConnection } from '../../lib/client/client-connection';
import { Room } from '../../lib/protocol/common';
import styles from './RoomBottomPanel.module.scss';

type RoomBottomPanelProps = {
    myId: string;
    room: Room;
    onChangeReady: () => void;
    onLaunch: () => void;
};

const RoomBottomPanel: React.FC<RoomBottomPanelProps> = (props) => {
    const players = [props.room.host, ...props.room.guests];
    const playerMe = players.find(player => player.id === props.myId)!;
    const isHostMe = props.room.host === playerMe;

    const launchReadyEnabled = isHostMe
        ? (players.length > 1 && players.every(player => player.ready))
        : true;

    const onClickLaunchReady = () => {
        if (isHostMe) {
            props.onLaunch();
            return;
        }

        props.onChangeReady();
    };

    return (
        <div className={styles.Root}>
            <div>
                {/* <Button
                    color="secondary"
                    size="large"
                    type="submit"
                    variant="contained"
                    href="/"
                >
                    Exit
                </Button> */}
            </div>

            <div className={styles.StatusWrapper}>

            </div>

            <div>
                <Button
                    color="primary"
                    size="large"
                    type="submit"
                    variant="contained"
                    disabled={!launchReadyEnabled}
                    onClick={onClickLaunchReady}
                >
                    {isHostMe
                        ? 'Launch!'
                        : playerMe.ready ? 'Cancel' : 'Ready'
                    }
                </Button>
            </div>
        </div>
    );
};

export default React.memo(RoomBottomPanel);
