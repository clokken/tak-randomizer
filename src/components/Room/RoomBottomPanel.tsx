import React from 'react';
import { Button, Box } from '@material-ui/core';
import { Room } from '../../lib/protocol/common';
import styles from './RoomBottomPanel.module.scss';

type RoomBottomPanelProps = {
    myId: string;
    room: Room;
    onChangeReady: () => void;
    onClickHistoryCount: () => void;
    onLaunch: () => void;
};

const RoomBottomPanel: React.FC<RoomBottomPanelProps> = (props) => {
    const players = [props.room.host, ...props.room.guests];
    const playerMe = players.find(player => player.id === props.myId)!;
    const isHostMe = props.room.host === playerMe;

    const launchReadyEnabled = isHostMe
        ? (props.room.guests.length > 0 && props.room.guests.every(player => player.ready))
        : true;

    const onClickLaunchReady = () => {
        if (isHostMe) {
            props.onLaunch();
            return;
        }

        props.onChangeReady();
    };

    const histCount = props.room.historyCount;

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
                This room has been randomized&nbsp;
                <span
                    className={histCount > 0 ? styles.Active : ''}
                    onClick={e => {
                        e.preventDefault();
                        if (histCount !== 0)
                            props.onClickHistoryCount();
                    }}
                >
                    <Box fontFamily="Monospace">
                        {histCount}
                    </Box>
                </span>
                &nbsp;times.
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
