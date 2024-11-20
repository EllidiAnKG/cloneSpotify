"use client";
import { useState } from 'react';
import { supabase } from '../utils/supabase/client';

const AddSongForm: React.FC = () => {
    const [title, setTitle] = useState<string>('');
    const [artist, setArtist] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("Форма отправлена");
        setMessage(null);

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
            console.error('Ошибка получения пользователя:', userError);
            setMessage('Ошибка при получении пользователя.');
            return;
        }

        if (!user) {
            setMessage('Вы должны войти в систему, чтобы добавить песню.');
            return;
        }

        if (!file) {
            setMessage('Пожалуйста, выберите файл.');
            return;
        }

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('songs')
            .upload(`public/${file.name}`, file); 

        if (uploadError) {
            console.error('Ошибка загрузки файла:', uploadError);
            const errorMessage = uploadError.message || 'Неизвестная ошибка загрузки файла.';
            setMessage(`Ошибка загрузки файла: ${errorMessage}`); 
            return;
        }

        const fileUrl = `https://ndcvronhgjgzgxelnlaa.supabase.co/storage/v1/object/public/songs/${uploadData.path}`;

        const { data, error } = await supabase.from('songs').insert([
            { title, artist, file_url: fileUrl }
        ]);

        if (error) {
            console.error('Ошибка добавления песни:', error);
            setMessage(`Ошибка добавления песни: ${error.message}`);
        } else {
            setMessage('Песня успешно добавлена!');
            setTitle('');
            setArtist('');
            setFile(null);
        }
    };

    return (
        <div>
            <h2>Добавить песню</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Название"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Исполнитель"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    required
                />
                <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    required
                />
                <button type="submit">Добавить песню</button></form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default AddSongForm;