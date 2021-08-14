import { Card, Container, Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import React from 'react';
import { ClientConnection, ClientConnectionEventListener } from '../../lib/client/client-connection';
import { Room, Teams } from '../../lib/protocol/common';
import { ReqChangeReady, ReqChangeTeam, ReqLaunchRoom, ReqRoomInfo, ResChangeReady, ResChangeTeam, ResLaunchRoom, ResRoomInfo } from '../../lib/protocol/messages';
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

    const showError = React.useCallback((msg: string) => {
        console.error(msg);
        setError(msg);
    }, [setError]);

    const updateRoom = React.useCallback(() => { // TODO handle component dismounting during async?
        conn.emit<ReqRoomInfo, ResRoomInfo>('room-info', {roomId: conn.roomId}).then(res => {
            if (res.type === 'error') {
                showError(res.reason);
                return;
            }

            setRoom(res.result);
        });
    }, [conn, showError]);

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
            'onRoomLaunched': msg => {
                alert('Room has been launched!!!');
                console.log(msg.whenIso);
                console.log(msg.result);
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
            throw new Error(`Something very wrong happened! (onChangeTeam: i'm not in the room)`);
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
            throw new Error(`Something very wrong happened! (onChangeReady: i'm not in the room)`);
        }

        conn.emit<ReqChangeReady, ResChangeReady>('change-ready', {
            isReady: isReady,
        }).finally(() => {
            setFreezeInputs(false);
        });
    }, [room, conn, freezeInputs, getPlayerMe]);

    const onLaunch = React.useCallback(() => {
        setFreezeInputs(true);

        conn.emit<ReqLaunchRoom, ResLaunchRoom>('launch-room', {}).then(result => {
            if (result.type === 'error')
                showError(result.reason);
        }).catch(err => {
            // TODO handle err
            console.error(err);
        }).finally(() => {
            setFreezeInputs(false);
        });
    }, [conn, showError]);

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

    return (<>
        <Container>
            <Card>
                {roomTable}
            </Card>
        </Container>

        <Snackbar open={error !== null} autoHideDuration={6000} onClose={() => setError(null)}>
            <Alert onClose={() => setError(null)} severity="error">
                {error}
            </Alert>
        </Snackbar>
    </>);
};

export default React.memo(GameRoom);
