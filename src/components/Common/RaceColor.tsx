import React from 'react';
import { Race, RaceColors } from '../../lib/models/races';

type RaceColorProps = {
    race: string;
    children: React.ReactNode;
    component?: 'div' | 'span'; // default = div
    strong?: boolean;
};

const RaceColor: React.FC<RaceColorProps> = (props) => {
    const component: Required<RaceColorProps['component']> = props.component ?? 'div';

    const color = RaceColors[props.race as Race];

    const style: React.CSSProperties = {
        color: color,
        fontWeight: props.strong ? 'bold' : undefined,
    };

    return component === 'div' ? (
        <div style={style}>
            {props.children}
        </div>
    ) : (
        <span style={style}>
            {props.children}
        </span>
    );
};

export default React.memo(RaceColor);
