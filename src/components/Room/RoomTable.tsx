import { Checkbox, Chip, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import { Autorenew } from '@material-ui/icons';
import React from 'react';
import { ClientConnection } from '../../lib/client/client-connection';
import { Room, RoomPlayer } from '../../lib/protocol/common';
import styles from './RoomTable.module.scss';

type RoomTableProps = {
    myId: string;
    room: Room;
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
                                        checked={next.ready}
                                        onChange={e => {
                                            if (isMe)
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
                                <TableCell>{next.race}</TableCell>
                                <TableCell className={styles.TdTeam}>
                                    <div>
                                        <div className={styles.TeamLabel}>
                                            {next.team !== null && 'Team ' + next.team}
                                        </div>
                                        {isMe && (<>
                                            &nbsp;
                                            <IconButton onClick={props.onChangeTeam}>
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
