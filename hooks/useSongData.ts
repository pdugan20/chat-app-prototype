import { useState, useEffect, useRef } from 'react';
import { appleMusicApi, mockAppleMusicData } from '../services/appleMusicApi';

// Simple in-memory cache for song data
const songDataCache = new Map<string, { data: SongData; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export interface SongData {
  title: string;
  artist: string;
  albumArt: string | null;
  previewUrl: string | null;
  duration: number;
  id?: string; // Apple Music song ID for deep linking
  playParams?: {
    id: string;
    kind: string;
  };
  colors?: {
    bgColor?: string;
    textColor1?: string;
    textColor2?: string;
    textColor3?: string;
    textColor4?: string;
  };
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
  const previousSongId = useRef<string>('');

  useEffect(() => {
    // Don't refetch if the songId hasn't changed
    if (songId === previousSongId.current && songData) {
      return;
    }
    previousSongId.current = songId;

    const loadSongData = async () => {
      // If all required props are provided, use them immediately without API call
      if (propSongTitle && propArtistName && propAlbumArtUrl) {
        console.log('🎵 Using preloaded song data, skipping API call');
        const propData: SongData = {
          title: propSongTitle,
          artist: propArtistName,
          albumArt: propAlbumArtUrl,
          previewUrl: propPreviewUrl || null,
          duration: propDuration || 30,
        };
        setSongData(propData);
        setIsLoading(false);
        return;
      }

      // Check cache next
      const cached = songDataCache.get(songId);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        // Use cached data but merge with props
        const mergedData: SongData = {
          title: propSongTitle || cached.data.title,
          artist: propArtistName || cached.data.artist,
          albumArt: propAlbumArtUrl || cached.data.albumArt,
          previewUrl: propPreviewUrl || cached.data.previewUrl,
          duration: propDuration || cached.data.duration,
          id: cached.data.id, // Preserve Apple Music ID
          playParams: cached.data.playParams, // Preserve play parameters
          colors: cached.data.colors,
        };
        setSongData(mergedData);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      let apiData: SongData | null = null;

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
            }

            apiData = {
              title: song.attributes.name,
              artist: song.attributes.artistName,
              albumArt: artworkUrl,
              previewUrl: song.attributes.previews[0]?.url || null,
              duration: song.attributes.durationInMillis / 1000,
              id: song.id, // Preserve Apple Music song ID
              playParams: song.attributes.playParams, // Preserve play parameters
              colors: {
                bgColor: song.attributes.artwork?.bgColor,
                textColor1: song.attributes.artwork?.textColor1,
                textColor2: song.attributes.artwork?.textColor2,
                textColor3: song.attributes.artwork?.textColor3,
                textColor4: song.attributes.artwork?.textColor4,
              },
            };
          }
        } else {
          // Use mock data for development
          const mockSong = mockAppleMusicData;
          apiData = {
            title: mockSong.attributes.name,
            artist: mockSong.attributes.artistName,
            albumArt: null,
            previewUrl: mockSong.attributes.previews[0]?.url || null,
            duration: mockSong.attributes.durationInMillis / 1000,
          };
        }

        // Merge API data with manual props (props take priority)
        const mergedData: SongData = {
          title: propSongTitle || apiData?.title || 'Unknown Song',
          artist: propArtistName || apiData?.artist || 'Unknown Artist',
          albumArt: propAlbumArtUrl || apiData?.albumArt || null,
          previewUrl: propPreviewUrl || apiData?.previewUrl || null,
          duration: propDuration || apiData?.duration || 30,
          id: apiData?.id, // Keep Apple Music ID for deep linking
          playParams: apiData?.playParams, // Keep play parameters
          colors: apiData?.colors,
        };

        // Cache the API data (not the merged data, to keep the cache pure)
        if (apiData) {
          songDataCache.set(songId, {
            data: apiData,
            timestamp: Date.now(),
          });
        }

        setSongData(mergedData);
      } catch (error) {
        console.error('Error loading song data:', error);
        // Fallback to props or defaults
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songId]); // Only re-run when songId changes - intentionally excluding props to prevent refetching

  // Handle prop changes without refetching from API
  useEffect(() => {
    if (songData && previousSongId.current === songId) {
      // If we have data and songId hasn't changed, just update with new props
      const updatedData: SongData = {
        title: propSongTitle || songData.title,
        artist: propArtistName || songData.artist,
        albumArt: propAlbumArtUrl || songData.albumArt,
        previewUrl: propPreviewUrl || songData.previewUrl,
        duration: propDuration || songData.duration,
        id: songData.id, // Preserve Apple Music ID
        playParams: songData.playParams, // Preserve play parameters
        colors: songData.colors,
      };
      setSongData(updatedData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    propSongTitle,
    propArtistName,
    propAlbumArtUrl,
    propPreviewUrl,
    propDuration,
    // Intentionally excluding songData and songId to prevent infinite loops
  ]);

  return {
    songData,
    isLoading,
  };
};
