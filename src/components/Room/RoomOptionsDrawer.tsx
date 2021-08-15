import { Button, SwipeableDrawer } from '@material-ui/core';
import React from 'react';
import { Race } from '../../lib/models/races';
import { RoomOptionsModes } from '../../lib/models/room-options';
import { Room } from '../../lib/protocol/common';
import styles from './RoomOptionsDrawer.module.scss';

type RoomOptionsDrawerProps = {
    room: Room;
    showRoomOptions: boolean;
    setShowRoomOptions: (show: boolean) => void;
};

const RoomOptionsDrawer: React.FC<RoomOptionsDrawerProps> = (props) => {
    const { room, showRoomOptions, setShowRoomOptions } = props;

    const enabledOptions = Object.entries(room.options.raceToggles)
        .filter(([race, enabled]) => enabled)
        .map(([race, enabled]) => race as Race);

    return (
        <SwipeableDrawer
            anchor="left"
            open={showRoomOptions}
            onOpen={() => setShowRoomOptions(true)}
            onClose={() => setShowRoomOptions(false)}
        >
            <Button
                onClick={() => setShowRoomOptions(false)}
                variant="contained"
            >
                (Close)
            </Button>

            <div className={styles.RoomOptions}>
                <div className={styles.Option}>
                    <span className={styles.Title}>Mode:</span>
                    <span className={styles.Label}>
                        {RoomOptionsModes[room.options.mode].label}
                    </span>
                    <span className={styles.Desc}>
                        ({RoomOptionsModes[room.options.mode].desc})
                    </span>
                </div>

                <div className={styles.Option}>
                    <span className={styles.Title}>Max Players:</span>
                    <span className={styles.Label}>
                        {room.options.maxPlayers}
                    </span>
                </div>

                <div className={styles.Option}>
                    <span className={styles.Title}>Mirror Teams:</span>
                    <span className={styles.Label}>
                        {room.options.mirrorTeams ? 'Yes' : 'No'}
                    </span>
                </div>

                <div className={styles.Option}>
                    <span className={styles.Title}>Enabled Races:</span>
                    <span className={styles.Label}>
                        <ul>
                            {enabledOptions.map((race, idx) => (
                                <li key={idx}>
                                    - {race}
                                </li>
                            ))}
                        </ul>
                    </span>
                </div>

                {room.options.randomizeMaps && (
                    <div className={styles.Option}>
                        <span className={styles.Title}>Randomize Maps:</span>
                        <span className={styles.Label}>
                            <ul>
                                {room.options.randomizeMaps.map((map, idx) => (
                                    <li key={idx}>
                                        - {map}
                                    </li>
                                ))}
                            </ul>
                        </span>
                    </div>
                )}
            </div>
        </SwipeableDrawer>
    );
};

export default React.memo(RoomOptionsDrawer);
