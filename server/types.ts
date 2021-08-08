import { RoomOptions } from "../src/lib/models/room-options";
import * as SocketIo from 'socket.io';
import { Team } from "../src/lib/protocol/common";

export type ServerPlayer = {
    socket: SocketIo.Socket;
    name: string;
    currentRoom: ServerRoom | null;
};

export type ServerRoom = {
    id: string;
    options: RoomOptions;
    host: ServerRoomPlayer;
    guests: ServerRoomPlayer[];
};

export type ServerRoomPlayer = ServerPlayer & {
    race: string;
    team: Team;
};
