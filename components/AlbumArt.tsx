import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Colors } from '../constants/theme';

interface AlbumArtProps {
  url: string | null;
  size?: number;
  onLoad?: () => void;
  onError?: (error: any) => void;
  borderRadius?: number;
  isSender?: boolean;
}

const AlbumArt: React.FC<AlbumArtProps> = ({
  url,
  size = 50,
  onLoad,
  onError,
  borderRadius = 4,
  isSender = false,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const loadStartTime = useRef<number>(0);
  const previousUrl = useRef<string | null>(null);

  // Reset loading state only when URL actually changes
  useEffect(() => {
    // Only reset if URL has actually changed
    if (url !== previousUrl.current) {
      previousUrl.current = url;

      if (url) {
        // URL changed to a new value
        setImageLoaded(false);
        imageOpacity.setValue(0);
        loadStartTime.current = Date.now();
      } else {
        // URL changed to null
        setImageLoaded(false);
        imageOpacity.setValue(0);
      }
    }
  }, [url, imageOpacity]);

  const handleImageLoad = () => {
    const loadTime = Date.now() - loadStartTime.current;
    const isInstantLoad = loadTime < 50; // If it loads in under 50ms, it's likely cached

    console.log(
      `🖼️ Album art loaded in ${loadTime}ms (${isInstantLoad ? 'cached' : 'network'})`
    );

    if (!imageLoaded) {
      setImageLoaded(true);

      if (isInstantLoad) {
        // Image was cached, show instantly without animation
        imageOpacity.setValue(1);
      } else {
        // Image loaded from network, fade in smoothly
        Animated.timing(imageOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    }
    onLoad?.();
  };

  const handleImageError = (error: any) => {
    console.log('🖼️ Album art failed to load. Error:', error);
    setImageLoaded(false);
    imageOpacity.setValue(0);
    onError?.(error);
  };

  const containerStyle = {
    width: size,
    height: size,
    borderRadius,
  };

  const imageStyle = {
    width: size,
    height: size,
    borderRadius,
  };

  // Dynamic icon color based on bubble background
  const iconColor = isSender ? Colors.white : Colors.textSecondary;

  return (
    <View style={[styles.container, containerStyle]}>
      {url ? (
        <>
          <Animated.View
            style={[styles.imageContainer, { opacity: imageOpacity }]}
          >
            <Image
              source={url}
              style={imageStyle}
              contentFit='cover'
              cachePolicy='memory-disk'
              priority='high'
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          </Animated.View>
          {!imageLoaded && (
            <View style={[styles.placeholder, containerStyle]}>
              <SymbolView
                name='music.note'
                size={Math.floor(size * 0.48)} // Scale icon relative to container
                type='hierarchical'
                tintColor={iconColor}
              />
            </View>
          )}
        </>
      ) : (
        <View style={[styles.placeholder, containerStyle]}>
          <SymbolView
            name='music.note'
            size={Math.floor(size * 0.48)}
            type='hierarchical'
            tintColor={iconColor}
          />
        </View>
      )}
    </View>
  );
};

const PLACEHOLDER_BACKGROUND = 'rgba(0, 0, 0, 0.05)';

const styles = StyleSheet.create({
  container: {
    backgroundColor: PLACEHOLDER_BACKGROUND,
    position: 'relative',
  },
  imageContainer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  placeholder: {
    alignItems: 'center',
    backgroundColor: PLACEHOLDER_BACKGROUND,
    justifyContent: 'center',
  },
});

export default AlbumArt;
