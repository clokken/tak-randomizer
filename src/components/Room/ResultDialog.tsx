import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import { TrendingFlat } from '@material-ui/icons';
import React from 'react';
import { Room } from '../../lib/protocol/common';
import { MsgRoomLaunched } from '../../lib/protocol/messages';
import styles from './ResultDialog.module.scss';

type ResultDialogProps = {
    room: Room;
    resultMsg: MsgRoomLaunched | null;
    onClose: () => void;
};

const ResultDialog: React.FC<ResultDialogProps> = (props) => {
    const content = props.resultMsg && (
        <table className={styles.Table}>
            <tbody>
                {Object.entries(props.resultMsg.result.players).map(([id, result]) => (
                    <tr key={id}>
                        <td className={styles.TdName}>
                            {result.name}
                        </td>
                        <td className={styles.TdArrow}>
                            <div>
                                <TrendingFlat />
                            </div>
                        </td>
                        <td className={styles.TdRace}>
                            {result.race}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <Dialog
            open={props.resultMsg !== null}
            onClose={props.onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth="md"
        >
            <DialogTitle id="alert-dialog-title">
                Randomization Result!
            </DialogTitle>
            <DialogContent>
                <div className={styles.Content}>
                    {content}
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
