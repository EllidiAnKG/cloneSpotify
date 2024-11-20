"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase/client';

const SongList: React.FC = () => {
    const [songs, setSongs] = useState<{ id: number; title: string; artist: string; file_url: string }[]>([]);
    const [message, setMessage] = useState<string | null>(null);
    const [playingSongId, setPlayingSongId] = useState<number | null>(null);
    const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);


    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const { data, error } = await supabase.from('songs').select('*');
                if (error) {
                    throw error;
                }
                setSongs(data || []);
            } catch (error) {
                console.error('Ошибка получения треков:', error);
                setMessage('Не удалось загрузить треки.');
            }
        };
        fetchSongs();
    }, []);

    useEffect(() => {
        if (audioRef) {
            audioRef.pause();
            audioRef.currentTime = 0;
        }

        if (playingSongId) {
            const songToPlay = songs.find((song) => song.id === playingSongId);
            if (songToPlay && audioRef) {
                try {
                    audioRef.src = songToPlay.file_url;
                    audioRef.play();
                } catch (error) {
                    console.error("Error playing audio:", error);
                    setMessage("Error playing this song.  Check the file URL.");
                }
            }
        }
    }, [playingSongId, songs, audioRef]);

    const handleSongClick = (songId: number) => {
        setPlayingSongId(songId);
    };

    return (
        <div>
            <h2>Список треков</h2>
            {message && <p>{message}</p>}
            <ul>
                {songs.map((song) => (
                    <li key={song.id} onClick={() => handleSongClick(song.id)}>
                        <strong>Название:</strong> {song.title} <br />
                        <strong>Исполнитель:</strong> {song.artist} <br />
                    </li>
                ))}
            </ul>
            {playingSongId && (
                <audio ref={(audio) => setAudioRef(audio)} controls>
                    <source src={songs.find((song) => song.id === playingSongId)?.file_url || ''} type="audio/mpeg" />
                    <p style={{ color: 'red' }}>Error loading audio. Check the URL.</p>
                    Ваш браузер не поддерживает аудио.
                </audio>
            )}
        </div>
    );
};

export default SongList;