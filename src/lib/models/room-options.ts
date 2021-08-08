import { Race } from './races';

export type RoomOptions = {
    name: string;
    mode: 'fully-random' | 'avoid-repeated-teammates' | 'avoid-repeated-all';
    mirrorTeams: boolean;
    maxPlayers: 2 | 3 | 4 | 5 | 6 | 7 | 8;
    showIps: boolean;
    showIpHashes: boolean;
    showIpFlags: boolean;
    raceToggles: Record<Race, boolean>;
};

// -------------------------------------------------------------------------------------------------

export const RoomOptionsModes: Record<
    RoomOptions['mode'],
    { label: string, desc: string }
> = {
    'fully-random': {
        label: 'Fully Random',
        desc: 'Just randomize each player\'s race.',
    },
    'avoid-repeated-teammates': {
        label: 'No Repeated Races (Allies)',
        desc: 'Tries to give different races to players within the same team.',
    },
    'avoid-repeated-all': {
        label: 'No Repeated Races (All)',
        desc: 'Tries to give different races to all players. Obviously this will be bad if there' +
            ' are more than 5 players (since there are only 5 races).',
    },
};

export const RoomOptionsCheckboxes: Record<
    keyof Pick<RoomOptions, 'showIpFlags' | 'showIpHashes' | 'showIps'>,
    { label: string, desc: string }
> = {
    'showIps': {
        label: 'Show IPs',
        desc: 'Everyone shows their public IP address.',
    },
    'showIpHashes': {
        label: 'Show IP Hashes',
        desc: 'Everyone shows an encrypted version of their IP address. This cypher cannot be ' +
            'used to identify an IP address, but can be used to identify duplicate IPs. 👥 👀',
    },
    'showIpFlags': {
        label: 'Show IP Flags',
        desc: 'Everyone shows a country flag indicating where their IP address comes from. This ' +
            'only tells roughly in which country an user is, thus being the most private option.',
    },
};
