import { RoomOptions } from "../models/room-options";
import { RandomizationResult, Room, Team } from "./common";

type CommonResponse<ISuccess> = {
    type: 'success';
    result: ISuccess;
} | {
    type: 'error';
    reason: string;
};

// -------------------------------------------------------------------------------------------------

export type ReqRoomInfo = {
    roomId: string;
};

export type ResRoomInfo = CommonResponse<Room>;

// -------------------------------------------------------------------------------------------------

export type ReqCreateRoom = {
    options: RoomOptions;
};

export type ResCreateRoom = CommonResponse<{
    id: string;
}>;

// -------------------------------------------------------------------------------------------------

export type ReqJoinRoom = {
    roomId: string;
};

export type ResJoinRoom = CommonResponse<'OK'>;

// -------------------------------------------------------------------------------------------------

export type MsgPlayerJoinedRoom = {
    playerName: string;
};

// -------------------------------------------------------------------------------------------------

export type ReqLeaveRoom = {
    reason?: string;
};

export type ResLeaveRoom = CommonResponse<'OK'>;

// -------------------------------------------------------------------------------------------------

export type MsgPlayerLeftRoom = {
    playerName: string;
    disconnected: boolean;
};

// -------------------------------------------------------------------------------------------------

export type MsgCurrentRoomClosed = {
    reason: string;
};

// -------------------------------------------------------------------------------------------------

export type ReqChangeTeam = {
    newTeam: Team;
};

export type ResChangeTeam = CommonResponse<'OK'>;

// -------------------------------------------------------------------------------------------------

export type ReqChangeReady = {
    isReady: boolean;
};

export type ResChangeReady = CommonResponse<'OK'>;

// -------------------------------------------------------------------------------------------------

export type MsgPlayerChangedTeam = {
    playerName: string;
    newTeam: Team;
};

// -------------------------------------------------------------------------------------------------

export type MsgPlayerChangedReady = {
    playerName: string;
    isReady: boolean;
};

// -------------------------------------------------------------------------------------------------

export type ReqLaunchRoom = {
    //
};

export type ResLaunchRoom = CommonResponse<'OK'>;

// -------------------------------------------------------------------------------------------------

export type MsgRoomLaunched = {
    result: RandomizationResult;
};

// -------------------------------------------------------------------------------------------------

export type ReqCurrentRoomHistory = {
    //
};

export type ResCurrentRoomHistory = CommonResponse<{
    history: RandomizationResult[];
}>;

// -------------------------------------------------------------------------------------------------
