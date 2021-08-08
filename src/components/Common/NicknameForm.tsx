import { Button, Card, CardActions, CardContent, FormControl, FormHelperText, Input, InputLabel, makeStyles, Typography } from '@material-ui/core';
import React from 'react';
// import styles from './NicknameForm.module.scss';

type NicknameFormProps = {
    onSetNickname: (nickname: string) => void;
    autoFocus?: boolean;
};

const useStyles = makeStyles({
    root: {
      minWidth: 275,
    },
    pos: {
        marginBottom: 10,
    },
});

const nicknameValidation = {
    minLength: 1,
    maxLength: 24,
};

const NicknameForm: React.FC<NicknameFormProps> = (props) => {
    const classes = useStyles();

    const [value, setValue] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (value.length < nicknameValidation.minLength) {
            setError(`Minimum name length: ${nicknameValidation.minLength}`);
            return;
        }

        if (value.length > nicknameValidation.maxLength) {
            setError(`Maximum name length: ${nicknameValidation.maxLength}`);
            return;
        }

        props.onSetNickname(value);
    };

    return (
        <form onSubmit={onSubmit} autoComplete="off">
            <Card className={classes.root} color="primary">
                <CardContent>
                    <Typography variant="h5" component="h2">
                        Nickname Form
                    </Typography>
                    <Typography className={classes.pos} color="textSecondary">
                        enter your gameranger nickname
                    </Typography>
                    <FormControl error={error !== null} fullWidth>
                        <InputLabel htmlFor="set-nickname">Nickname</InputLabel>
                        <Input
                            id="set-nickname"
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            autoFocus={props.autoFocus === true}
                        />
                        {error !== null && (
                            <FormHelperText>{error}</FormHelperText>
                        )}
                    </FormControl>
                </CardContent>
                <CardActions>
                    <Button
                        color="primary"
                        size="small"
                        type="submit"
                    >
                        Next
                    </Button>
                </CardActions>
            </Card>
        </form>
    );
};

export default React.memo(NicknameForm);
