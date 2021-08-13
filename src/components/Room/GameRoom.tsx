import { Card, Container } from '@material-ui/core';
import React from 'react';
import { ClientConnection, ClientConnectionEventListener } from '../../lib/client/client-connection';
import { Room, Teams } from '../../lib/protocol/common';
import { ReqChangeReady, ReqChangeTeam, ReqRoomInfo, ResChangeReady, ResChangeTeam, ResRoomInfo } from '../../lib/protocol/messages';
// import styles from './GameRoom.module.scss';
import RoomBottomPanel from './RoomBottomPanel';
import RoomTable from './RoomTable';

type GameRoomProps = {
    connection: ClientConnection;
};

const GameRoom: React.FC<GameRoomProps> = (props) => {
    const { connection: conn } = props;

    const [room, setRoom] = React.useState<Room | null>(null); // null = initial load
    const [error, setError] = React.useState<string | null>(null);
    const [freezeInputs, setFreezeInputs] = React.useState(false);

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
            'onPlayerChangedTeam': msg => {
                updateRoom();
            },
            'onPlayerChangedReady': msg => {
                updateRoom();
            },
        };

        conn.setEventListener(eventListener);

        return () => {
            conn.setEventListener(null);
        };
    }, [conn, updateRoom]);

    const getPlayerMe = React.useCallback(() => {
        if (!room)
            return null;

        return [room.host, ...room.guests].find(next => next.id === conn.myId);
    }, [conn, room]);

    const onChangeTeam = React.useCallback(() => {
        if (!room || freezeInputs)
            return;

        setFreezeInputs(true);

        const playerMe = getPlayerMe();

        if (!playerMe) {
            // Impossible... how am I not in the room?
            // TODO error handle
            return;
        }

        conn.emit<ReqChangeTeam, ResChangeTeam>('change-team', {
            newTeam: Teams[(Teams.indexOf(playerMe.team) + 1) % Teams.length],
        }).finally(() => {
            setFreezeInputs(false);
        });
    }, [room, conn, freezeInputs, getPlayerMe]);

    const onChangeReady = React.useCallback((isReady: boolean) => {
        if (!room || freezeInputs)
            return;

        setFreezeInputs(true);

        const playerMe = getPlayerMe();

        if (!playerMe) {
            // Impossible... how am I not in the room?
            // TODO error handle
            return;
        }

        conn.emit<ReqChangeReady, ResChangeReady>('change-ready', {
            isReady: isReady,
        }).finally(() => {
            setFreezeInputs(false);
        });
    }, [room, conn, freezeInputs, getPlayerMe]);

    const onLaunch = React.useCallback(() => {
        //
    }, []);

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

    const playerMe = getPlayerMe()!;

    const roomTable = (
        <div>
            <RoomTable
                myId={conn.myId}
                room={room}
                onChangeReady={onChangeReady}
                onChangeTeam={onChangeTeam}
            />
            <RoomBottomPanel
                myId={conn.myId}
                room={room}
                onChangeReady={() => onChangeReady(!playerMe.ready)}
                onLaunch={() => onLaunch()}
            />
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
