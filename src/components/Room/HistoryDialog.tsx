import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import React from 'react';
import { RandomizationResult } from '../../lib/protocol/common';
// import styles from './HistoryDialog.module.scss';

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
                setHistory(result);
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
                {JSON.stringify(history, null, 4)}
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
            maxWidth="md"
        >
            <DialogTitle id="alert-dialog-title">
                Randomization Result!
            </DialogTitle>
            <DialogContent>
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
