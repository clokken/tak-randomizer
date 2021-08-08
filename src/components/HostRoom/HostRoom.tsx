import React from 'react';
// import styles from './HostRoom.module.scss';
import { Container, Grid } from '@material-ui/core';
import NicknameForm from '../Common/NicknameForm';
import NicknameHeader from '../Common/NicknameHeader';
import HostForm from './HostForm';
import { FakeRoom } from '../../lib/models/fake-room';
import Room from '../Room/Room';

const HostRoom: React.FC = () => {
    const [nickname, setNickname] = React.useState<string | null>(null);
    const [_fakeRoom, _setFakeRoom] = React.useState<FakeRoom | null>(null);

    const nicknameHeader = React.useMemo(() => {
        if (nickname === null)
            return null;

        return <NicknameHeader nickname={nickname} />
    }, [nickname]);

    const doHostRoom = React.useCallback((fakeRoom: FakeRoom) => {
        window.history.pushState(
            null,
            'TA:K Randomizer | ' + fakeRoom.options.name,
            '/' + fakeRoom.id
        );

        _setFakeRoom(fakeRoom);
    }, [nickname]);

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

    if (_fakeRoom === null) {
        return (
            <Container>
                {nicknameHeader}
                <Grid container justifyContent="center">
                    <Grid item xs={12} sm={9}>
                        <HostForm
                            nickname={nickname}
                            onSubmitForm={roomOptions => {
                                doHostRoom({
                                    id: 'asdasdsa',
                                    hostNickname: nickname,
                                    options: roomOptions,
                                });
                            }}
                        />
                    </Grid>
                </Grid>
            </Container>
        );
    }

    return (
        <Room fakeRoom={_fakeRoom} />
    );
};

export default React.memo(HostRoom);
