import { RoomOptions } from "../models/room-options";
import { Room } from "./common";

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
