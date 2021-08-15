import { Button, Card, Container, Snackbar, Typography } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import React from 'react';
import { ClientConnection, ClientConnectionEventListener } from '../../lib/client/client-connection';
import { Room, Teams } from '../../lib/protocol/common';
import { MsgRoomLaunched, ReqChangeReady, ReqChangeTeam, ReqCurrentRoomHistory, ReqLaunchRoom, ReqRoomInfo, ResChangeReady, ResChangeTeam, ResCurrentRoomHistory, ResLaunchRoom, ResRoomInfo } from '../../lib/protocol/messages';
import HistoryDialog from './HistoryDialog';
import ResultDialog from './ResultDialog';
// import styles from './GameRoom.module.scss';
import RoomBottomPanel from './RoomBottomPanel';
import RoomOptionsDrawer from './RoomOptionsDrawer';
import RoomTable from './RoomTable';

type GameRoomProps = {
    connection: ClientConnection;
};

const GameRoom: React.FC<GameRoomProps> = (props) => {
    const { connection: conn } = props;

    const [room, setRoom] = React.useState<Room | null>(null); // null = initial load
    const [_freezeInputs, setFreezeInputs] = React.useState(false);
    const [isClosed, setIsClosed] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [showResult, setShowResult] = React.useState<MsgRoomLaunched | null>(null);
    const [showHistoryDialog, setShowHistoryDialog] = React.useState(false);
    const [showRoomOptions, setShowRoomOptions] = React.useState(false);

    const freezeInputs = _freezeInputs || isClosed;

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
                setIsClosed(true);
                setError('Room has been closed.');
            },
            'onPlayerChangedTeam': msg => {
                updateRoom();
            },
            'onPlayerChangedReady': msg => {
                updateRoom();
            },
            'onRoomLaunched': msg => {
                setShowResult(msg);
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

    const onCloseShowResult = React.useCallback(() => {
        updateRoom();
        setShowResult(null);
    }, [updateRoom, setShowResult]);

    const onClickHistoryCount = React.useCallback(() => {
        setShowHistoryDialog(true);
    }, [setShowHistoryDialog]);

    const onCloseHistoryDialog = React.useCallback(() => setShowHistoryDialog(false), []);

    const fetchHistory = React.useCallback(() => {
        return conn.emit<ReqCurrentRoomHistory, ResCurrentRoomHistory>('room-history', {})
            .then(result => {
                if (result.type === 'error')
                    return result.reason;
                return result.result.history;
            });
    }, [conn]);

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
                roomIsClosed={isClosed}
                onChangeReady={onChangeReady}
                onChangeTeam={onChangeTeam}
            />
            <RoomBottomPanel
                myId={conn.myId}
                room={room}
                roomIsClosed={isClosed}
                onChangeReady={() => onChangeReady(!playerMe.ready)}
                onClickHistoryCount={onClickHistoryCount}
                onLaunch={() => onLaunch()}
            />
        </div>
    );

    return (<>
        <Container>
            {isClosed && (
                <Typography color="error" align="center" variant="h4">
                    This room has been closed.
                </Typography>
            )}

            <Button
                onClick={() => setShowRoomOptions(true)}
                variant="outlined"
                style={{ marginBottom: 10 }}
            >
                Show Room Options
            </Button>

            <Card>
                {roomTable}
            </Card>

            <RoomOptionsDrawer
                room={room}
                showRoomOptions={showRoomOptions}
                setShowRoomOptions={setShowRoomOptions}
            />
        </Container>

        <ResultDialog
            room={room}
            resultMsg={showResult}
            onClose={onCloseShowResult}
        />

        <HistoryDialog
            open={showHistoryDialog}
            onClose={onCloseHistoryDialog}
            fetcherFunc={fetchHistory}
        />

        <Snackbar open={error !== null} autoHideDuration={4000} onClose={() => setError(null)}>
            <Alert onClose={() => setError(null)} severity="error">
                {error}
            </Alert>
        </Snackbar>
    </>);
};

export default React.memo(GameRoom);
