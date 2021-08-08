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
};

export type RoomPlayer = Player & {
    ready: boolean;
    race: string;
    team: Team;
};

export type Team = null | 1 | 2 | 3 | 4;
export const Teams: Team[] = [null, 1, 2, 3, 4];
