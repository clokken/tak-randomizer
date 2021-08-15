import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import React from 'react';
import { Room } from '../../lib/protocol/common';
import { MsgRoomLaunched } from '../../lib/protocol/messages';
import styles from './ResultDialog.module.scss';
import ResultTable from './ResultTable';

type ResultDialogProps = {
    room: Room;
    resultMsg: MsgRoomLaunched | null;
    onClose: () => void;
};

const ResultDialog: React.FC<ResultDialogProps> = (props) => {
    return (
        <Dialog
            open={props.resultMsg !== null}
            onClose={props.onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth="lg"
        >
            <DialogTitle id="alert-dialog-title">
                Randomization Result!
            </DialogTitle>
            <DialogContent>
                <div className={styles.Content}>
                    {props.resultMsg && (
                        <ResultTable result={props.resultMsg.result} />
                    )}
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose} color="primary" autoFocus>
                    OK
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default React.memo(ResultDialog);
