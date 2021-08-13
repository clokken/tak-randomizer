import * as SocketIo from 'socket.io';
import { MsgCurrentRoomClosed, MsgPlayerChangedReady, MsgPlayerChangedTeam, MsgPlayerJoinedRoom, MsgPlayerLeftRoom, MsgRoomLaunched, ReqChangeReady, ReqChangeTeam, ReqCreateRoom, ReqJoinRoom, ReqLaunchRoom, ReqLeaveRoom, ReqRoomInfo, ResChangeReady, ResChangeTeam, ResCreateRoom, ResJoinRoom, ResLaunchRoom, ResLeaveRoom, ResRoomInfo } from '../src/lib/protocol/messages';
import { ServerPlayer, ServerRoom, ServerRoomPlayer } from './types';
import { customAlphabet } from 'nanoid';
import { RoomOptions } from '../src/lib/models/room-options';
import { Player, RandomizationResult, Room, RoomPlayer } from '../src/lib/protocol/common';

const roomIdLength = process.env['ROOM_ID_LENGTH'] || '10';

const nanoid = customAlphabet('1234567890abcdef', parseInt(roomIdLength));

// -------------------------------------------------------------------------------------------------

export class MainServer {
    private io: SocketIo.Server;

    private rooms: ServerRoom[] = [];

    constructor(io: SocketIo.Server) {
        this.io = io;
    }

    async start() {
        this.io.on('connection', socket => {
            const name = socket.handshake.query.name;

            if (!name || typeof name !== 'string') {
                socket.disconnect(true);
                return;
            }

            const currentPlayer: ServerPlayer = {
                socket: socket,
                name: name,
                currentRoom: null,
            };

            socket.on('disconnect', () => {
                if (currentPlayer.currentRoom) {
                    this.onPlayerLeaveRoom(currentPlayer, 'disconnect');
                }
            });

            this.handle<ReqRoomInfo, ResRoomInfo>(socket, 'room-info', async args => {
                const room = this.rooms.find(r => r.id === args.roomId);

                return room
                    ? { type: 'success', result: this.serverRoomToCommonRoom(room) }
                    : { type: 'error', reason: `Room ID not found.` };
            });

            this.handle<ReqCreateRoom, ResCreateRoom>(socket, 'create-room', async args => {
                if (currentPlayer.currentRoom !== null) {
                    return { type: 'error', reason: `You're already in a room.` };
                }

                const invalid = this.validateRoomOptions(args.options);

                if (invalid !== true) {
                    return { type: 'error', reason: invalid };
                }

                const newRoom: ServerRoom = {
                    id: this.createUniqueId(),
                    host: this.createFreshRoomPlayer(currentPlayer, args.options),
                    guests: [],
                    options: args.options,
                    isFrozen: false,
                    history: [],
                };

                this.rooms.push(newRoom);
                currentPlayer.currentRoom = newRoom;

                return { type: 'success', result: { id: newRoom.id } };
            });

            this.handleCb<ReqJoinRoom, ResJoinRoom>(socket, 'join-room', (args, cb) => {
                if (currentPlayer.currentRoom !== null) {
                    cb({ type: 'error', reason: `You're already in a room.` });
                    return;
                }

                const room = this.rooms.find(r => r.id === args.roomId);

                if (!room) {
                    cb({ type: 'error', reason: `Room ID not found.` });
                    return;
                }

                room.guests.push(this.createFreshRoomPlayer(currentPlayer, room.options));
                currentPlayer.currentRoom = room;

                cb({ type: 'success', result: 'OK' });

                this.allRoomPlayers(room).forEach(next => {
                    this.notifyClient<MsgPlayerJoinedRoom>(next.socket, 'player-joined-room', {
                        playerName: currentPlayer.name,
                    });
                });
            });

            this.handleCb<ReqLeaveRoom, ResLeaveRoom>(socket, 'leave-room', (args, cb) => {
                if (currentPlayer.currentRoom === null) {
                    cb({ type: 'error', reason: `You're not in a room.`});
                    return;
                }

                this.onPlayerLeaveRoom(currentPlayer, 'request');
                cb({ type: 'success', result: 'OK' });
            });

            this.handleCb<ReqChangeTeam, ResChangeTeam>(socket, 'change-team', (args, cb) => {
                if (currentPlayer.currentRoom === null) {
                    cb({ type: 'error', reason: `You're not in a room.`});
                    return;
                }

                if (currentPlayer.currentRoom.isFrozen) {
                    cb({ type: 'error', reason: `Room is currently frozen.` });
                    return;
                }

                const currentRoomPlayer = this.allRoomPlayers(currentPlayer.currentRoom).find(next => {
                    return next.socket === socket;
                });

                if (!currentRoomPlayer)
                    throw `Impossible...`;

                currentRoomPlayer.team = args.newTeam;
                cb({ type: 'success', result: 'OK' });

                this.allRoomPlayers(currentPlayer.currentRoom).forEach(next => {
                    this.notifyClient<MsgPlayerChangedTeam>(next.socket, 'player-changed-team', {
                        playerName: currentPlayer.name,
                        newTeam: args.newTeam,
                    })
                });
            });

            this.handleCb<ReqChangeReady, ResChangeReady>(socket, 'change-ready', (args, cb) => {
                if (currentPlayer.currentRoom === null) {
                    cb({ type: 'error', reason: `You're not in a room.`});
                    return;
                }

                if (currentPlayer.currentRoom.isFrozen) {
                    cb({ type: 'error', reason: `Room is currently frozen.` });
                    return;
                }

                const allRoomPlayers = this.allRoomPlayers(currentPlayer.currentRoom);

                const currentRoomPlayer = allRoomPlayers.find(next => {
                    return next.socket === socket;
                });

                if (!currentRoomPlayer)
                    throw `Impossible...`;

                if (currentRoomPlayer === currentPlayer.currentRoom.host) {
                    cb({ type: 'error', reason: `A king doesn't need to be ready.` });
                    return;
                }

                currentRoomPlayer.ready = args.isReady;
                cb({ type: 'success', result: 'OK' });

                allRoomPlayers.forEach(next => {
                    this.notifyClient<MsgPlayerChangedReady>(next.socket, 'player-changed-ready', {
                        playerName: currentPlayer.name,
                        isReady: args.isReady,
                    })
                });
            });

            this.handleCb<ReqLaunchRoom, ResLaunchRoom>(socket, 'launch-room', (args, cb) => {
                const room = currentPlayer.currentRoom;

                if (room === null) {
                    cb({ type: 'error', reason: `You're not in a room.`});
                    return;
                }

                if (room.isFrozen) {
                    cb({ type: 'error', reason: `Room is currently frozen.` });
                    return;
                }

                const allRoomPlayers = this.allRoomPlayers(room);

                const currentRoomPlayer = allRoomPlayers.find(next => {
                    return next.socket === socket;
                });

                if (!currentRoomPlayer)
                    throw `Impossible...`;

                const notReady = room.guests.find(guest => !guest.ready);

                if (notReady) {
                    cb({ type: 'error', reason: `One of the guests is not ready: ${notReady.name}` });
                    return;
                }

                const result: RandomizationResult = {};
                allRoomPlayers.forEach((player, idx) => {
                    result[player.socket.id] = { race: 'TODO #' + idx };
                });

                cb({ type: 'success', result: 'OK' });

                allRoomPlayers.forEach(player => {
                    this.notifyClient<MsgRoomLaunched>(player.socket, 'room-launched', {
                        whenIso: new Date().toISOString(),
                        result: result,
                    });
                });
            });
        });
    }

    private handle<IArgs, IAck>(client: SocketIo.Socket, eventName: string,
        handler: (args: IArgs) => Promise<IAck>)
    {
        client.on(eventName, (args: IArgs, callback: (ack: IAck) => void) => {
            handler(args).then(callback);
        });
    }

    private handleCb<IArgs, IAck>(client: SocketIo.Socket, eventName: string,
        handler: (args: IArgs, callback: (ack: IAck) => void) => void)
    {
        client.on(eventName, (args: IArgs, callback: (ack: IAck) => void) => {
            handler(args, callback);
        });
    }

    private onPlayerLeaveRoom(player: ServerPlayer, reason: 'disconnect' | 'request') {
        if (!player.currentRoom)
            throw `Player isn't in a room.`;

        const room = player.currentRoom;
        player.currentRoom = null;

        if (room.host.socket === player.socket) { // is host
            room.guests.forEach(next => {
                next.currentRoom = null;

                this.notifyClient<MsgCurrentRoomClosed>(next.socket, 'current-room-closed', {
                    reason: reason === 'disconnect'
                        ? `Host disconnected.`
                        : `Host left the room.`,
                });
            });

            for (let i = 0; i < this.rooms.length; i++) {
                if (this.rooms[i] === room) {
                    this.rooms.splice(i, 1);
                    return;
                }
            }

            throw `Room is not in the room list... how???`;
        }

        for (let i = 0; i < room.guests.length; i++) {
            if (room.guests[i].socket === player.socket) {
                room.guests.splice(i, 1);

                this.allRoomPlayers(room).forEach(next => {
                    this.notifyClient<MsgPlayerLeftRoom>(next.socket, 'player-left-room', {
                        playerName: player.name,
                        disconnected: reason === 'disconnect',
                    });
                });

                return;
            }
        }

        throw `Player is not in the guest list... how???`;
    }

    private serverPlayerToCommonPlayer(player: ServerPlayer): Player {
        return {
            id: player.socket.id,
            name: player.name,
        };
    }

    private serverRoomPlayerToCommonRoomPlayer(roomPlayer: ServerRoomPlayer): RoomPlayer {
        return {
            id: roomPlayer.socket.id,
            name: roomPlayer.name,
            ready: roomPlayer.ready,
            race: roomPlayer.race,
            team: roomPlayer.team,
        };
    }

    private serverRoomToCommonRoom(room: ServerRoom): Room {
        return {
            id: room.id,
            options: room.options,
            host: this.serverRoomPlayerToCommonRoomPlayer(room.host),
            guests: room.guests.map(this.serverRoomPlayerToCommonRoomPlayer),
            historyCount: room.history.length,
        };
    }

    private createUniqueId() {
        for (let i = 0; i < 10; i++) { // 10 = limit number of trials
            const next = nanoid();
            if (this.rooms.find(r => r.id === next) === undefined)
                return next;
        }

        throw 'What???';
    }

    private validateRoomOptions(roomOptions: RoomOptions): true | string {
        // TODO check stuff like if there's at least ONE race option enabled
        return true;
    }

    private createFreshRoomPlayer(player: ServerPlayer, roomOptions: RoomOptions): ServerRoomPlayer {
        const firstRace = Object.entries(roomOptions.raceToggles).find(([ _, enabled ]) => {
            return enabled;
        })![0];

        return {
            ...player,
            ready: false,
            race: firstRace,
            team: null,
        };
    }

    private allRoomPlayers(room: ServerRoom): ServerRoomPlayer[] {
        return [
            room.host,
            ...room.guests,
        ];
    }

    private notifyClient<IMessage>(client: SocketIo.Socket, eventName: string, message: IMessage) {
        client.emit(eventName, message);
    }
}
