import { Card, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import React from 'react';
import { ClientConnection, ClientConnectionEventListener } from '../../lib/client/client-connection';
import { Room } from '../../lib/protocol/common';
import { ReqRoomInfo, ResRoomInfo } from '../../lib/protocol/messages';
import styles from './GameRoom.module.scss';

type GameRoomProps = {
    connection: ClientConnection;
};

const GameRoom: React.FC<GameRoomProps> = (props) => {
    const { connection: conn } = props;

    const [room, setRoom] = React.useState<Room | null>(null); // null = initial load
    const [error, setError] = React.useState<string | null>(null);

    const updateRoom = React.useCallback(() => { // TODO handle component dismounting during async?
        conn.emit<ReqRoomInfo, ResRoomInfo>('room-info', {roomId: conn.roomId}).then(res => {
            if (res.type === 'error') {
                setError(res.reason);
                return;
            }

            setRoom(res.result);
        });
    }, [conn]);

    React.useEffect(() => {
        updateRoom();

        const eventListener: ClientConnectionEventListener = {
            'onPlayerJoinedRoom': msg => {
                updateRoom();
            },
            'onPlayerLeftRoom': msg => {
                updateRoom();
            },
            'onCurrentRoomClosed': msg => {
                updateRoom();
            },
        };

        conn.setEventListener(eventListener);

        return () => {
            conn.setEventListener(null);
        };
    }, [conn, updateRoom]);

    if (error !== null) {
        return (
            <Container>
                <Card>
                    Error:
                    <br />
                    {error}
                </Card>
            </Container>
        );
    }

    if (room === null) {
        return (
            <Container>
                <Card>
                    Loading room info...
                </Card>
            </Container>
        );
    }

    const players = [room.host, ...room.guests].map(next => {
        return { name: next.name, race: next.race, team: next.team };
    });

    const roomTable = (
        <div>
            <TableContainer component={Paper}>
                <Table className={styles.Table}>
                    <TableHead className={styles.TableHead}>
                        <TableRow>
                            <TableCell>Ready</TableCell>
                            <TableCell>Player</TableCell>
                            <TableCell>Race</TableCell>
                            <TableCell>Team</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {players.map(({ name, race, team }, idx) => (
                            <TableRow key={idx}>
                                <TableCell align="center"></TableCell>
                                <TableCell>{name}</TableCell>
                                <TableCell>{race}</TableCell>
                                <TableCell>{team}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );

    return (
        <Container>
            <Card>
                {roomTable}
            </Card>
        </Container>
    );
};

export default React.memo(GameRoom);
