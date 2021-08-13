import * as SocketIo from 'socket.io-client';
import { RoomOptions } from '../models/room-options';
import { MsgCurrentRoomClosed, MsgPlayerChangedReady, MsgPlayerChangedTeam, MsgPlayerJoinedRoom, MsgPlayerLeftRoom, MsgRoomLaunched, ReqCreateRoom, ReqJoinRoom, ResCreateRoom, ResJoinRoom } from '../protocol/messages';

const serverPort = parseInt(process.env['REACT_APP_SERVER_PORT'] || '3003');

export type ClientConnectionEventListener = {
    onPlayerJoinedRoom: (msg: MsgPlayerJoinedRoom) => void;
    onPlayerLeftRoom: (msg: MsgPlayerLeftRoom) => void;
    onCurrentRoomClosed: (msg: MsgCurrentRoomClosed) => void;
    onPlayerChangedTeam: (msg: MsgPlayerChangedTeam) => void;
    onPlayerChangedReady: (msg: MsgPlayerChangedReady) => void;
    onRoomLaunched: (msg: MsgRoomLaunched) => void;
};

export class ClientConnection {
    readonly nickname: string;
    private socket: SocketIo.Socket;
    readonly roomId: string;

    private eventListener: ClientConnectionEventListener | null = null;

    private constructor(nickname: string, socket: SocketIo.Socket, roomId: string) {
        this.nickname = nickname;
        this.socket = socket;
        this.roomId = roomId;

        this.on<MsgPlayerJoinedRoom>('player-joined-room', msg => {
            this.eventListener && this.eventListener.onPlayerJoinedRoom(msg);
        });

        this.on<MsgPlayerLeftRoom>('player-left-room', msg => {
            this.eventListener && this.eventListener.onPlayerLeftRoom(msg);
        });

        this.on<MsgCurrentRoomClosed>('current-room-closed', msg => {
            this.eventListener && this.eventListener.onCurrentRoomClosed(msg);
        });

        this.on<MsgPlayerChangedTeam>('player-changed-team', msg => {
            this.eventListener && this.eventListener.onPlayerChangedTeam(msg);
        });

        this.on<MsgPlayerChangedReady>('player-changed-ready', msg => {
            this.eventListener && this.eventListener.onPlayerChangedReady(msg);
        });

        this.on<MsgRoomLaunched>('room-launched', msg => {
            this.eventListener && this.eventListener.onRoomLaunched(msg);
        });
    }

    static async createRoom(nickname: string, options: RoomOptions, onDisconnect: () => void):
        Promise<ClientConnection>
    {
        const socket = SocketIo.io(`localhost:${serverPort}`, {
            query: { name: nickname },
            reconnection: false,
        });

        socket.on('disconnect', onDisconnect);

        return new Promise((resolve, reject) => {
            socket.on('connect', () => {
                emit<ReqCreateRoom, ResCreateRoom>(socket, 'create-room', { options }).then(ack => {
                    if (ack.type === 'success')
                        resolve(new ClientConnection(nickname, socket, ack.result.id));
                    else
                        reject(ack.reason);
                });
            });

            socket.on('connect_failed', () => {
                reject('Failed to connect socket.');
            });
        });
    }

    static async joinRoom(nickname: string, roomId: string, onDisconnect: () => void):
        Promise<ClientConnection>
    {
        const socket = SocketIo.io(`localhost:${serverPort}`, {
            query: { name: nickname },
            reconnection: false,
        });

        socket.on('disconnect', onDisconnect);

        return new Promise((resolve, reject) => {
            socket.on('connect', () => {
                emit<ReqJoinRoom, ResJoinRoom>(socket, 'join-room', { roomId }).then(ack => {
                    if (ack.type === 'success')
                        resolve(new ClientConnection(nickname, socket, roomId));
                    else
                        reject(ack.reason);
                });
            });

            socket.on('connect_failed', () => {
                reject('Failed to connect socket.');
            });
        });
    }

    get myId() {
        return this.socket.id;
    }

    setEventListener(el: ClientConnectionEventListener | null) {
        this.eventListener = el;
    }

    destroy() {
        this.socket.disconnect();
    }

    emit<IRequest, IResponse>(eventName: string, args: IRequest): Promise<IResponse> {
        return emit(this.socket, eventName, args);
    }

    private on<IMessage>(eventName: string, handler: (msg: IMessage) => void) {
        this.socket.on(eventName, handler);
    }
}

function emit<IRequest, IResponse>(io: SocketIo.Socket, eventName: string, args: IRequest):
    Promise<IResponse>
{
    return new Promise(resolve => {
        io.emit(eventName, args, (ack: IResponse) => {
            resolve(ack);
        });
    });
}
