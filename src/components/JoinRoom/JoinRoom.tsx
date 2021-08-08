import React from 'react';
import { Container, Grid } from '@material-ui/core';
import { ClientConnection } from '../../lib/client/client-connection';
// import NicknameHeader from '../Common/NicknameHeader';
import NicknameForm from '../Common/NicknameForm';
import GameRoom from '../Room/GameRoom';
// import styles from './JoinRoom.module.scss';

type JoinRoomProps = {
    id: string;
};

const JoinRoom: React.FC<JoinRoomProps> = (props) => {
    const [connection, setConnection] = React.useState<ClientConnection | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const mounted = React.useRef(false);
    React.useEffect(() => {
        mounted.current = true;
        return () => { mounted.current = false; };
    }, []);

    /*const nicknameHeader = React.useMemo(() => {
        if (connection === null)
            return null;

        return <NicknameHeader nickname={connection.nickname} />
    }, [connection]);*/

    const onSetNickname = React.useCallback((nickname: string) => {
        setLoading(true);

        const onDisconnect = () => {
            if (!mounted.current) {
                return;
            }

            setConnection(null);
            setError(`You have disconnected.`); // TODO remove this line?
        };

        ClientConnection.joinRoom(nickname, props.id, onDisconnect).then(conn => {
            if (!mounted.current) {
                conn.destroy();
                return;
            }

            setConnection(conn);
            setLoading(false);
        }).catch(err => {
            if (!mounted.current) {
                return;
            }

            setError(err + '');
            setLoading(false);
        });
    }, [props.id]);

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

    if (connection === null) {
        return (
            <Container>
                <Grid container justifyContent="center">
                    <Grid item xs={8} sm={4}>
                        <NicknameForm onSetNickname={onSetNickname} autoFocus />
                    </Grid>
                </Grid>
            </Container>
        );
    }

    return (
        <GameRoom connection={connection} />
    );
};

export default React.memo(JoinRoom);
