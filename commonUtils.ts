type predicate<T> = (a: T, b: T) => boolean;

type updater<T> = (a: T, b: T) => T;

export interface Track {
    trackId: string,
    userId: string,
    track: string,
    artist: string,
    link: string,
    duration: number,
};

export const timeout = ms => new Promise(res => setTimeout(res, ms))

export const whenAll = async <TResult>(promises: Promise<TResult>[]): Promise<TResult[]> => {
    const results = [];
    for (let p of promises) {
        results.push(await p)
    }
    return results;
}

export const distinct = <TItem>(source: TItem[], predicate: predicate<TItem>): TItem[] => {
    return source.filter((a, i, arr) => arr.findIndex(b => predicate(a, b)) === i);
}

export const split = <TItem>(source: TItem[], batch: number): TItem[][] => {
    return source.reduce((seed, b, i, src) => !(i % batch) ? seed.concat([src.slice(i, i + batch)]) : seed, []);
}

export const except = <TItem>(source: TItem[], exclude: TItem[], predicate: predicate<TItem>): TItem[] => {
    return source.filter(s => exclude.findIndex(e => predicate(s, e)) < 0);
}

export const updateBy = <TItem>(source: TItem[], updates: TItem[], updater: updater<TItem>, predicate: predicate<TItem>): TItem[] => {
    return source
        .map(s => ({ src: s, upd: updates.find(u => predicate(s, u)) }))
        .map(d => d.upd ? updater(d.src, d.upd) : d.src);
}

export const tryCatch = (action: () => any, postAction: (o: string) => void): void => {
    try {
        action();
        postAction("Done");
    }
    catch (e) {
        postAction(e);
    }
}
