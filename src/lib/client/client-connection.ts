import * as SocketIo from 'socket.io-client';
import { RoomOptions } from '../models/room-options';
import { MsgCurrentRoomClosed, MsgPlayerJoinedRoom, MsgPlayerLeftRoom, ReqCreateRoom, ResCreateRoom } from '../protocol/messages';

const serverPort = parseInt(process.env['REACT_APP_SERVER_PORT'] || '3003');

export type ClientConnectionEventListener = {
    onPlayerJoinedRoom: (msg: MsgPlayerJoinedRoom) => void;
    onPlayerLeftRoom: (msg: MsgPlayerLeftRoom) => void;
    onCurrentRoomClosed: (msg: MsgCurrentRoomClosed) => void;
};

export class ClientConnection {
    private socket: SocketIo.Socket;
    readonly roomId: string;

    private eventListener: ClientConnectionEventListener | null = null;

    private constructor(socket: SocketIo.Socket, roomId: string) {
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
    }

    static async createRoom(playerName: string, options: RoomOptions, onDisconnect: () => void):
        Promise<ClientConnection>
    {
        const socket = SocketIo.io(`localhost:${serverPort}`, {
            query: { name: playerName },
            reconnection: false,
        });

        socket.on('disconnect', () => {
            onDisconnect();
        });

        return new Promise((resolve, reject) => {
            socket.on('connect', () => {
                emit<ReqCreateRoom, ResCreateRoom>(socket, 'create-room', { options }).then(ack => {
                    console.log(ack);
                    if (ack.type === 'success')
                        resolve(new ClientConnection(socket, ack.result.id));
                    else
                        reject(ack.reason);
                });
            });

            socket.on('connect_failed', () => {
                reject('Failed to connect socket.');
            });
        });
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
