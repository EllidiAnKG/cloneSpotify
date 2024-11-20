"use client"

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';

interface Playlist {
    id: number;
    name: string;
    imageUrl?: string;
}

interface Track {
    id: number;
    title: string;
    artist: string;
    fileUrl?: string;
}

const PlaylistComponent = () => {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState<number | null>(null);
    const [newPlaylistName, setNewPlaylistName] = useState<string>('');
    const [selectedTrackId, setSelectedTrackId] = useState<string>('');
    const [playlistImage, setPlaylistImage] = useState<File | null>(null);

    useEffect(() => {
        fetchPlaylists();
        fetchTracks();
    }, []);

    const fetchPlaylists = async () => {
        try {
            const { data, error } = await supabase.from('playlist').select('*');
            if (error) throw error;
            console.log('Fetched playlists:', data);
            setPlaylists(data);
        } catch (error) {
            console.error('Ошибка при загрузке плейлистов:', error);
        }
    };

    const fetchTracks = async () => {
        const { data, error } = await supabase.from('songs').select('*');
        if (error) {
            console.error('Ошибка при загрузке треков:', error.message);
        } else {
            setTracks(data);
        }
    };

    const createPlaylist = async () => {
        if (!newPlaylistName) return;
        let imageUrl;
        if (playlistImage) {
            const { data, error } = await supabase.storage.from('playlist_images').upload(`public/${playlistImage.name}`, playlistImage);
            if (error) {
                console.error('Ошибка загрузки изображения:', error.message);
                return;
            }
            imageUrl = `https://ndcvronhgjgzgxelnlaa.supabase.co/storage/v1/object/public//${playlistImage.name}`;
        }

        const { data, error } = await supabase.from('playlist').insert([{ name: newPlaylistName, image_url: imageUrl }]); 

        if(error) {
          console.error('Ошибка при создании плейлиста:', error.message);    
      } else {
          setNewPlaylistName('');
          setPlaylistImage(null);
          fetchPlaylists(); 
      }
  };

  const addTrackToPlaylist = async () => {
      if (selectedPlaylist && selectedTrackId) {
          const { data, error } = await supabase
              .from('playlist_tracks')
              .insert([{ playlist_id: selectedPlaylist, songs_id: selectedTrackId }]);

          if (error) {
              console.error('Ошибка при добавлении трека в плейлист:', error.message); 
              console.error('Детали ошибки:', error); 
          } else {
              setSelectedTrackId('');
              console.log('Трек успешно добавлен:', data);
          }
      }
  };

  return (
      <div><h1>Создать плейлист</h1>
      <input
          type="text"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          placeholder="Введите название плейлиста"
      />
      <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files && setPlaylistImage(e.target.files[0])}
      />
      <button onClick={createPlaylist}>Создать плейлист</button>

      <h2>Плейлисты</h2>
      <ul>
          {playlists.map((playlist) => (
              <li key={playlist.id} onClick={() => setSelectedPlaylist(playlist.id)}>
                  {playlist.name}
              </li>
          ))}
      </ul>

      {selectedPlaylist && (
          <>
              <h2>Добавитьтрек в плейлист</h2>
                  <select value={selectedTrackId} onChange={(e) => setSelectedTrackId(e.target.value)}>
                      <option value="">Выберите трек</option>
                      {tracks.map((track) => (
                          <option key={track.id} value={track.id}>
                              {track.title} - {track.artist}
                          </option>
                      ))}
                  </select>
                  <button onClick={addTrackToPlaylist}>Добавить в плейлист</button>
              </>
          )}
      </div>
  );
};

export default PlaylistComponent;