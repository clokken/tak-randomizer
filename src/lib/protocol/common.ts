import { RoomOptions } from "../models/room-options";

export type Player = {
    id: string;
    name: string;
};

export type Room = {
    id: string;
    options: RoomOptions;
    host: RoomPlayer;
    guests: RoomPlayer[];
    historyCount: number;
};

export type RoomPlayer = Player & {
    ready: boolean; // should be IGNORED for the room's host. (client should always show as checked)
    race: string;
    team: Team;
};

export type RandomizationResult = {
    whenIso: string; // Date::toISOString();
    players: Record<string, { // key = ServerRoomPlayer::socket.id
        team: Team;
        race: string;
    }>;
};

export type Team = null | 1 | 2 | 3 | 4;
export const Teams: Team[] = [null, 1, 2, 3, 4];
