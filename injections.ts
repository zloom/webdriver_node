import { Track } from "./commonUtils";

class AudioPlayerHTML5 {
    constructor(config: { onFrequency: () => void }) { }
    setUrl: (url: string) => void;
    _currentAudioEl: { src: string };
};

export const transformLinks = (tracks: Track[]): Track[] => {
    const player = new AudioPlayerHTML5({ onFrequency: () => { } });
    for (const track of tracks) {
        player.setUrl(track.link);
        track.link = player._currentAudioEl.src;
    }
    return tracks;
};

export const readAllTracks = (): Track[] => {
    const tracks: Track[] = [];
    const data: Element[] = Array.prototype.slice.call(document.querySelectorAll("[data-audio]:not([readed])"));
    for (const row of data) {
        const [trackId, userId, link, track, artist, duration] = JSON.parse(row.getAttribute("data-audio"));
        tracks.push({ trackId, userId, link, track, artist, duration: Number(duration) });
        row.setAttribute("readed", "");
    }
    return tracks;
}

export const requestLinks = async (tracks: Track[], callback: (t: Track[]) => void): Promise<void> => {
    const body = new FormData();
    const ids = tracks.map(t => `${t.userId}_${t.trackId}`).join(",");
    body.append("act", "reload_audio");
    body.append("al", "1");
    body.append("ids", ids);

    const request: RequestInit = { method: "POST", mode: "cors", credentials: "include", body };
    const response = await fetch("https://vk.com/al_audio.php", request);
    const text = await response.text();

    const raw = text.match(/<!json>([^<]+)<!>/);
    const rows = JSON.parse(raw[1]);
    const result: Track[] = [];
    for (const row of rows) {
        const [trackId, userId, link, track, artist, duration] = row;
        result.push({ trackId, userId, link, track, artist, duration: Number(duration) });
    }
    callback(result);
}

