import { useState, useEffect } from 'react';
import { appleMusicApi, mockAppleMusicData } from '../services/appleMusicApi';

export interface SongData {
  title: string;
  artist: string;
  albumArt: string | null;
  previewUrl: string | null;
  duration: number;
}

interface UseSongDataProps {
  songId: string;
  propSongTitle?: string;
  propArtistName?: string;
  propAlbumArtUrl?: string;
  propPreviewUrl?: string;
  propDuration?: number;
}

interface UseSongDataReturn {
  songData: SongData | null;
  isLoading: boolean;
}

export const useSongData = ({
  songId,
  propSongTitle,
  propArtistName,
  propAlbumArtUrl,
  propPreviewUrl,
  propDuration,
}: UseSongDataProps): UseSongDataReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [songData, setSongData] = useState<SongData | null>(null);

  useEffect(() => {
    const loadSongData = async () => {
      // If we have all props, use them directly (pre-fetched data)
      if (propSongTitle && propArtistName && propAlbumArtUrl) {
        console.log('🎵 useSongData using pre-fetched props:');
        console.log('🎵 Title:', propSongTitle);
        console.log('🎵 Artist:', propArtistName);
        console.log('🖼️ Album Art URL from props:', propAlbumArtUrl);
        console.log('🎵 Preview URL from props:', propPreviewUrl);

        setSongData({
          title: propSongTitle,
          artist: propArtistName,
          albumArt: propAlbumArtUrl,
          previewUrl: propPreviewUrl || null,
          duration: propDuration || 30,
        });
        return;
      }

      // Otherwise, try to fetch from Apple Music API
      setIsLoading(true);
      try {
        if (appleMusicApi.isConfigured()) {
          let song;

          // Check if songId is a search query
          if (songId.startsWith('search:')) {
            const searchQuery = songId.replace('search:', '');
            const searchResults = await appleMusicApi.searchSongs(
              searchQuery,
              1
            );
            song = searchResults[0] || null;
          } else {
            // Direct song ID lookup
            song = await appleMusicApi.getSong(songId);
          }

          if (song) {
            let artworkUrl = null;
            if (song.attributes.artwork?.url) {
              artworkUrl = song.attributes.artwork.url
                .replace('{w}', '100')
                .replace('{h}', '100')
                .replace('{f}', 'bb.jpg');

              console.log('🖼️ Processed artwork URL:', artworkUrl);
            }

            setSongData({
              title: song.attributes.name,
              artist: song.attributes.artistName,
              albumArt: artworkUrl,
              previewUrl: song.attributes.previews[0]?.url || null,
              duration: song.attributes.durationInMillis / 1000,
            });
          }
        } else {
          // Use mock data for development (no local asset for testing)
          const mockSong = mockAppleMusicData;
          setSongData({
            title: mockSong.attributes.name,
            artist: mockSong.attributes.artistName,
            albumArt: null, // No local asset for testing
            previewUrl: mockSong.attributes.previews[0]?.url || null,
            duration: mockSong.attributes.durationInMillis / 1000,
          });
        }
      } catch (error) {
        console.error('Error loading song data:', error);
        // Fallback to props or default values
        setSongData({
          title: propSongTitle || 'Unknown Song',
          artist: propArtistName || 'Unknown Artist',
          albumArt: propAlbumArtUrl || null,
          previewUrl: propPreviewUrl || null,
          duration: propDuration || 30,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSongData();
  }, [
    songId,
    propSongTitle,
    propArtistName,
    propAlbumArtUrl,
    propPreviewUrl,
    propDuration,
  ]);

  return {
    songData,
    isLoading,
  };
};
