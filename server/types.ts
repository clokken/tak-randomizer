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
    isFrozen: boolean; // players cannot change team or ready status
};

export type ServerRoomPlayer = ServerPlayer & {
    ready: boolean;
    race: string;
    team: Team;
};
