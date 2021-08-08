import { Card, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import React from 'react';
import { FakeRoom } from '../../lib/models/fake-room';
import styles from './Room.module.scss';

type RoomProps = {
    fakeRoom: FakeRoom;
};

const Room: React.FC<RoomProps> = (props) => {
    const { fakeRoom } = props;

    const players = [
        { name: 'Spagg', race: 'Random' },
        { name: 'DeeKay', race: 'Random' },
        { name: 'Kronos', race: 'Random' },
    ];

    const roomTable = (
        <div>
            <TableContainer component={Paper}>
                <Table className={styles.Table}>
                    <TableHead className={styles.TableHead}>
                        <TableRow>
                            <TableCell>Ready</TableCell>
                            <TableCell>Player</TableCell>
                            <TableCell>Race</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {players.map(({ name, race }, idx) => (
                            <TableRow key={idx}>
                                <TableCell align="center"></TableCell>
                                <TableCell>{name}</TableCell>
                                <TableCell>{race}</TableCell>
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

export default React.memo(Room);
