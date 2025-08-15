import React, { useEffect, useRef } from 'react'
import { StyleSheet } from 'react-native'
import BootSplash from 'react-native-bootsplash'
import Video from 'react-native-video'

type Props = {
  onMinimumSplashTimeReached(): void
  onVideoEnd?(): void
}

const MINIMUM_SPLASH_TIME = 3000

const SplashVideo = ({ onVideoEnd, onMinimumSplashTimeReached }: Props) => {
  const splashTimerRef = useRef<NodeJS.Timeout | null>(null)
  const onMinimumSplashTimeReachedRef = useRef(onMinimumSplashTimeReached)
  onMinimumSplashTimeReachedRef.current = onMinimumSplashTimeReached

  useEffect(() => {
    return () => {
      if (splashTimerRef.current) {
        clearTimeout(splashTimerRef.current)
      }
    }
  }, [])

  const handleVideoLoad = () => {
    BootSplash.hide({ fade: true })
    splashTimerRef.current = setTimeout(() => {
      onMinimumSplashTimeReachedRef.current()
    }, MINIMUM_SPLASH_TIME)
  }

  const handleVideoEnd = () => {
    if (onVideoEnd) {
      onVideoEnd()
    }
  }

  return (
    <Video
      source={require('./assets/splash.mp4')}
      style={styles.video}
      resizeMode="cover"
      controls={false}
      onLoad={handleVideoLoad}
      onEnd={handleVideoEnd}
      onError={(error) => console.log('Video Error:', error)}
    />
  )
}

const styles = StyleSheet.create({
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
})

export default SplashVideo