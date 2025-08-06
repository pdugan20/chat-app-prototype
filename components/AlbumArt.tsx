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
}

const AlbumArt: React.FC<AlbumArtProps> = ({
  url,
  size = 50,
  onLoad,
  onError,
  borderRadius = 4,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const loadStartTime = useRef<number>(0);

  // Reset loading state only when URL changes (not on every render)
  useEffect(() => {
    if (url) {
      // Don't reset if we're just re-mounting with the same URL
      // The image might be cached and load instantly
      setImageLoaded(false);
      loadStartTime.current = Date.now();
    } else {
      setImageLoaded(false);
      imageOpacity.setValue(0);
    }
  }, [url, imageOpacity]);

  const handleImageLoad = () => {
    const loadTime = Date.now() - loadStartTime.current;
    const isInstantLoad = loadTime < 100; // If it loads in under 100ms, it's likely cached

    console.log(
      `🖼️ Album art loaded in ${loadTime}ms (${isInstantLoad ? 'cached' : 'network'})`
    );

    if (!imageLoaded) {
      setImageLoaded(true);

      if (isInstantLoad) {
        // Image was cached, show instantly
        imageOpacity.setValue(1);
      } else {
        // Image loaded from network, fade in smoothly
        Animated.timing(imageOpacity, {
          toValue: 1,
          duration: 300,
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
                tintColor={Colors.textSecondary}
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
            tintColor={Colors.textSecondary}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.messageBubbleGray,
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
    backgroundColor: Colors.messageBubbleGray,
    justifyContent: 'center',
  },
});

export default AlbumArt;
