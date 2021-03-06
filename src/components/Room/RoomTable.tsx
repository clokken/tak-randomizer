import { Checkbox, Chip, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { Autorenew } from '@material-ui/icons';
import React from 'react';
import { Room } from '../../lib/protocol/common';
import RaceColor from '../Common/RaceColor';
import styles from './RoomTable.module.scss';

type RoomTableProps = {
    myId: string;
    room: Room;
    roomIsClosed: boolean;
    onChangeReady: (checked: boolean) => void;
    onChangeTeam: () => void;
};

const RoomTable: React.FC<RoomTableProps> = (props) => {
    const players = [props.room.host, ...props.room.guests];

    return (
        <TableContainer>
            <Table className={styles.Table}>
                <TableHead className={styles.TableHead}>
                    <TableRow>
                        <TableCell className={styles.TdReady}>Ready</TableCell>
                        <TableCell>Player</TableCell>
                        <TableCell>Race</TableCell>
                        <TableCell>Team</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {players.map((next, idx) => {
                        const isHost = props.room.host === next;
                        const isMe = props.myId === next.id;

                        return (
                            <TableRow key={idx}>
                                <TableCell align="center">
                                    <Checkbox
                                        color="primary"
                                        checked={isHost || next.ready}
                                        onChange={e => {
                                            if (!isHost && isMe)
                                                props.onChangeReady(e.target.checked);
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    {next.name}
                                    {isMe && (<>
                                        &nbsp;
                                        <Chip label="YOU" color="secondary" />
                                    </>)}
                                    {isHost && (<>
                                        &nbsp;
                                        <Chip label="HOST" color="primary" />
                                    </>)}
                                </TableCell>
                                <TableCell>
                                    <RaceColor race={next.race} strong>
                                        {next.race}
                                    </RaceColor>
                                </TableCell>
                                <TableCell className={styles.TdTeam}>
                                    <div>
                                        <div className={styles.TeamLabel}>
                                            {next.team !== null && 'Team ' + next.team}
                                        </div>
                                        {isMe && (<>
                                            &nbsp;
                                            <IconButton
                                                onClick={props.onChangeTeam}
                                                disabled={props.roomIsClosed}
                                            >
                                                <Autorenew />
                                            </IconButton>
                                        </>)}
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default React.memo(RoomTable);
