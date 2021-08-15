import { TrendingFlat } from '@material-ui/icons';
import React from 'react';
import { RandomizationResult } from '../../lib/protocol/common';
import RaceColor from '../Common/RaceColor';
import styles from './ResultTable.module.scss';

type ResultTableProps = {
    result: RandomizationResult;
};

const ResultTable: React.FC<ResultTableProps> = (props) => {
    return (
        <table className={styles.Table}>
            <tbody>
                {Object.entries(props.result.players).map(([id, result]) => (
                    <tr key={id}>
                        <td className={styles.TdName}>
                            {result.name}
                        </td>
                        <td className={styles.TdTeam}>
                            {result.team && `Team ${result.team}`}
                        </td>
                        <td className={styles.TdArrow}>
                            <div>
                                <TrendingFlat />
                            </div>
                        </td>
                        <td className={styles.TdRace}>
                            <RaceColor race={result.race} strong>
                                {result.race}
                            </RaceColor>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default React.memo(ResultTable);
