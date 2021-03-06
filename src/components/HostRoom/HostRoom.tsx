import React from 'react';
// import styles from './HostRoom.module.scss';
import { Container, Grid } from '@material-ui/core';
import NicknameForm from '../Common/NicknameForm';
import NicknameHeader from '../Common/NicknameHeader';
import HostForm from './HostForm';
import GameRoom from '../Room/GameRoom';
import { ClientConnection } from '../../lib/client/client-connection';
import { RoomOptions } from '../../lib/models/room-options';

type WindowState = {
    currentRoom?: {
        id: string;
        name: string;
    };
};

const HostRoom: React.FC = () => {
    const [nickname, setNickname] = React.useState<string | null>(null);
    const [connection, setConnection] = React.useState<ClientConnection | null>(null);
    const [windowState, setWindowState] = React.useState<WindowState>({});
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const mounted = React.useRef(false);
    React.useEffect(() => {
        mounted.current = true;
        return () => { mounted.current = false; };
    }, []);

    const nicknameHeader = React.useMemo(() => {
        if (nickname === null)
            return null;

        return <NicknameHeader nickname={nickname} />
    }, [nickname]);

    const doHostRoom = React.useCallback((options: RoomOptions) => {
        if (nickname === null)
            return;

        setLoading(true);

        const onDisconnect = () => {
            if (!mounted.current) {
                return;
            }

            setConnection(null);
            setError(`You have disconnected.`); // TODO remove this line?
            setWindowState({});
        };

        ClientConnection.createRoom(nickname, options, onDisconnect).then(conn => {
            if (!mounted.current) {
                conn.destroy();
                return;
            }

            setConnection(conn);
            setWindowState({ currentRoom: {id: conn.roomId, name: options.name} });
            setLoading(false);
        }).catch(err => {
            if (!mounted.current) {
                return;
            }

            setError(err + '');
            setLoading(false);
        });
    }, [nickname]);

    React.useEffect(() => {
        window.history.pushState(
            null,
            '',
            '/' + (windowState.currentRoom ? windowState.currentRoom.id : '')
        );
    }, [windowState]);

    if (loading) {
        return (
            <Container>
                Loading...
            </Container>
        );
    }

    if (error !== null) {
        return (
            <Container>
                Error:
                <br />
                {error}
            </Container>
        );
    }

    if (nickname === null) {
        return (
            <Container>
                <Grid container justifyContent="center">
                    <Grid item xs={8} sm={4}>
                        <NicknameForm onSetNickname={setNickname} autoFocus />
                    </Grid>
                </Grid>
            </Container>
        );
    }

    if (connection === null) {
        return (
            <Container>
                {false && nicknameHeader}
                <Grid container justifyContent="center">
                    <Grid item xs={12} sm={9}>
                        <HostForm
                            nickname={nickname}
                            onSubmitForm={doHostRoom}
                        />
                    </Grid>
                </Grid>
            </Container>
        );
    }

    return (
        <GameRoom connection={connection} />
    );
};

export default React.memo(HostRoom);
