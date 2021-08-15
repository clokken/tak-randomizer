import React from 'react';
import styles from './HistoryDialog.module.scss';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Typography, Chip, DialogContentText } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { RandomizationResult } from '../../lib/protocol/common';
import Moment from 'moment';
import { AccessTime } from '@material-ui/icons';
import ResultTable from './ResultTable';
import Lodash from 'lodash';

type HistoryDialogProps = {
    open: boolean;
    onClose: () => void;
    fetcherFunc: () => Promise<RandomizationResult[] | string>; // string = error
};

const HistoryDialog: React.FC<HistoryDialogProps> = (props) => {
    const [history, setHistory] = React.useState<RandomizationResult[] | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!props.open)
            return;

        let mounted = true;

        props.fetcherFunc().then(result => {
            if (!mounted)
                return;

            if (typeof result === 'string')
                setError(result);
            else
                setHistory(Lodash.reverse(result));
        });

        return () => {
            mounted = false;
        };
    }, [props]);

    const content = error ? (
        <Alert severity="error">This is an error alert — check it out!</Alert>
    ) : (
        history ? (
            <div>
                {history.map((frame, idx) => {
                    const momentDate = Moment(new Date(frame.whenIso));

                    return (
                        <div key={idx} className={styles.Frame}>
                            <Chip
                                icon={<AccessTime />}
                                label={`${momentDate.format('hh:mm:ss')} (${momentDate.fromNow()})`}
                                title={momentDate.format('YYYY-MM-DD hh:mm:ss')}
                            />

                            <ResultTable result={frame} />
                        </div>
                    );
                })}
            </div>
        ) : (
            <CircularProgress />
        )
    );

    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth="lg"
        >
            <DialogTitle id="alert-dialog-title">
                Randomization Result!
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    (Ordered from newest to oldest)
                </DialogContentText>
                <div className={'styles.Content'}>
                    {content}
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose} color="primary" autoFocus>
                    Fechar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default React.memo(HistoryDialog);
