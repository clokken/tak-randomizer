import * as Lodash from "lodash";

export type Mode = 'full' | 'diff_within_group' | 'diff_all';

export function randomize<Option>(config: {
    subjects: Array<{ id: string, groupId: number }>;
    mode: Mode;
    mirrorGroups: boolean;
    enabledOptions: Option[];
}): Array<{ id: string, groupId: number, result: Option }> {
    if (config.subjects.length === 0)
        throw 'Empty subjects';

    if (config.mode === 'full') {
        if (config.mirrorGroups) {
            const uniqueGroups = Lodash.uniq(config.subjects.map(next => next.groupId));
            const largestGroupSize = uniqueGroups
                .map(group => config.subjects.filter(subject => subject.groupId === group))
                .map(subjects => subjects.length)
                .sort((a, b) => b - a)[0];

            const options = Array.from({ length: largestGroupSize }).map(() => {
                return randomItem(config.enabledOptions);
            });

            const groupStates = uniqueGroups.map(group => {
                return {
                    group: group,
                    nextInShuffle: 0,
                };
            });

            return config.subjects.map(subject => {
                const groupState = groupStates.find(gs => gs.group === subject.groupId)!;

                return {
                    id: subject.id,
                    groupId: subject.groupId,
                    result: options[(groupState.nextInShuffle++) % options.length],
                };
            });
        }

        return config.subjects.map(subject => {
            return {
                id: subject.id,
                groupId: subject.groupId,
                result: randomItem(config.enabledOptions),
            };
        });
    }

    if (config.mode === 'diff_within_group') {
        const uniqueGroups = Lodash.uniq(config.subjects.map(next => next.groupId));

        if (config.mirrorGroups) {
            const options = Lodash.shuffle(config.enabledOptions);

            const groupStates = uniqueGroups.map(group => {
                return {
                    group: group,
                    nextInShuffle: 0,
                };
            });

            return config.subjects.map(subject => {
                const groupState = groupStates.find(gs => gs.group === subject.groupId)!;

                return {
                    id: subject.id,
                    groupId: subject.groupId,
                    result: options[(groupState.nextInShuffle++) % options.length],
                };
            });
        }

        const groupStates = uniqueGroups.map(group => {
            return {
                group: group,
                shuffle: Lodash.shuffle(config.enabledOptions),
                nextInShuffle: 0,
            };
        });

        return config.subjects.map(next => {
            const groupState = groupStates.find(gs => gs.group === next.groupId)!;

            return {
                id: next.id,
                groupId: next.groupId,
                result: groupState.shuffle[(groupState.nextInShuffle++) % groupState.shuffle.length],
            };
        });
    }

    if (config.mode === 'diff_all') {
        if (config.mirrorGroups) {
            // MIRROR_GROUPS IS INCOMPATIBLE WITH MODE_DIFF_ALL
            // WARNING
        }

        let options = config.enabledOptions;

        return config.subjects.map((next, idx) => {
            // reshuffle when the shuffle has been exhausted (or just started)
            if (idx % options.length === 0) {
                options = Lodash.shuffle(options);
            }

            return {
                id: next.id,
                groupId: next.groupId,
                result: options[idx % options.length],
            };
        });
    }

    throw 'Unreachable';
}

function randomItem<T>(array: T[]): T {
    const index = Math.floor(Math.random() * array.length);
    return array[index];
}
