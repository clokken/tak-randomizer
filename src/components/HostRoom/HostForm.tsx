import { Button, Card, CardActions, CardContent, Checkbox, FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel, Grid, Input, InputLabel, makeStyles, MenuItem, Radio, RadioGroup, Select, Typography } from '@material-ui/core';
import React from 'react';
import { Races } from '../../lib/models/races';
import { RoomOptions, RoomOptionsCheckboxes, RoomOptionsModes } from '../../lib/models/room-options';
// import styles from './HostForm.module.scss';

type HostFormProps = {
    nickname: string;
    onSubmitForm: (roomOptions: RoomOptions) => void;
};

const useStyles = makeStyles({
    root: {
      minWidth: 275,
    },
    pos: {
        marginBottom: 10,
    },
});

const HostForm: React.FC<HostFormProps> = (props) => {
    const classes = useStyles();

    const [roomName, setRoomName] = React.useState('');
    const [maxPlayers, setMaxPlayers] = React.useState(8);
    const [randomMode, setRandomMode] = React.useState<RoomOptions['mode']>('fully-random');
    const [mirrorTeams, setMirrorTeams] = React.useState(false);
    // const [showIps, setShowIps] = React.useState(false);
    const [showIpHashes, setShowIpHashes] = React.useState(false);
    const [showIpFlags, setShowIpFlags] = React.useState(false);
    const [raceToggles, setRaceToggles] = React.useState<RoomOptions['raceToggles']>({
        Aramon: true,
        Taros: true,
        Veruna: true,
        Zhon: true,
        Creon: true,
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const roomOptions: RoomOptions = {
            name: `${props.nickname}'s room.`,
            mode: randomMode,
            maxPlayers: 8,
            mirrorTeams: mirrorTeams,
            showIps: false,
            showIpFlags: showIpFlags,
            showIpHashes: showIpHashes,
            raceToggles: raceToggles,
        };

        props.onSubmitForm(roomOptions);
    };

    const roomNameInput = (
        <FormControl fullWidth>
            <InputLabel htmlFor="set-room-name">Room Name</InputLabel>
            <Input
                id="set-room-name"
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
            />
            <FormHelperText>(Optional)</FormHelperText>
        </FormControl>
    );

    const maxPlayersInput = (
        <FormControl>
            <InputLabel htmlFor="set-max-players">Size</InputLabel>
            <Select
                id="set-max-players"
                value={maxPlayers}
                onChange={e => setMaxPlayers(e.target.value as number)}
            >
                {Array.from({ length: 7 }).map((_, idx) => {
                    return <MenuItem key={idx} value={idx + 2}>{idx + 2}</MenuItem>;
                })}
            </Select>
        </FormControl>
    );

    const modeInput = (
        <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">Randomization Mode</FormLabel>
            <RadioGroup
                value={randomMode}
                onChange={e => setRandomMode(e.target.value as RoomOptions['mode'])}
            >
                <Grid container>
                    {Object.entries(RoomOptionsModes).map(([mode, { label, desc }], idx) => {
                        return (
                            <Grid item sm={4} key={idx}>
                                <FormControlLabel
                                    value={mode}
                                    label={label}
                                    control={<Radio />}
                                    style={{
                                        minHeight: '64px'
                                    }}
                                />
                                <FormHelperText>{desc}</FormHelperText>
                            </Grid>
                        );
                    })}
                </Grid>
            </RadioGroup>
        </FormControl>
    );

    const mirrorInput = (
        <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">Randomization Options</FormLabel>
            <FormGroup>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={mirrorTeams}
                            onChange={e => setMirrorTeams(e.target.checked)}
                        />
                    }
                    label="Mirror Teams"
                />
            </FormGroup>
        </FormControl>
    );

    const ipOptionsInput = (
        <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">IP Options</FormLabel>
            <Grid container>
                <Grid item sm={4}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={false}
                                onChange={e => {}}
                                disabled
                            />
                        }
                        label="Show IPs"
                    />
                    <FormHelperText>
                        {RoomOptionsCheckboxes.showIps.desc}
                    </FormHelperText>
                </Grid>
                <Grid item sm={4}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={showIpHashes}
                                onChange={e => setShowIpHashes(e.target.checked)}
                            />
                        }
                        label="Show IP Hashes"
                    />
                    <FormHelperText>
                        {RoomOptionsCheckboxes.showIpHashes.desc}
                    </FormHelperText>
                </Grid>
                <Grid item sm={4}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={showIpFlags}
                                onChange={e => setShowIpFlags(e.target.checked)}
                            />
                        }
                        label="Show IP Flags"
                    />
                    <FormHelperText>
                        {RoomOptionsCheckboxes.showIpFlags.desc}
                    </FormHelperText>
                </Grid>
            </Grid>
        </FormControl>
    );

    const raceTogglesInput = (
        <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">Race Toggles</FormLabel>
            <Grid container>
                {Races.map((race, idx) => {
                    return (
                        <Grid item sm={4} key={idx}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={raceToggles[race]}
                                        onChange={e => {
                                            setRaceToggles({
                                                ...raceToggles,
                                                [race]: e.target.checked,
                                            });
                                        }}
                                    />
                                }
                                label={race}
                            />
                        </Grid>
                    );
                })}
            </Grid>
        </FormControl>
    );

    const form = (
        <Grid container spacing={3}>
            <Grid item xs={6}>
                {roomNameInput}
            </Grid>
            <Grid item xs={6}>
                {maxPlayersInput}
            </Grid>
            <Grid item sm={12}>
                {modeInput}
            </Grid>
            <Grid item sm={12}>
                {mirrorInput}
            </Grid>
            { false && <Grid item sm={12}>
                {ipOptionsInput}
            </Grid> }
            <Grid item sm={12}>
                {raceTogglesInput}
            </Grid>
        </Grid>
    );

    return (
        <form onSubmit={onSubmit} autoComplete="off">
            <Card className={classes.root} color="primary">
                <CardContent>
                    <Typography variant="h5" component="h2">
                        Room Form
                    </Typography>
                    <Typography className={classes.pos} color="textSecondary">
                        adjust the room settings
                    </Typography>
                    {form}
                </CardContent>
                <CardActions>
                    <Button
                        color="primary"
                        size="large"
                        type="submit"
                        variant="contained"
                    >
                        Create Room
                    </Button>
                </CardActions>
            </Card>
        </form>
    );
};

export default React.memo(HostForm);
