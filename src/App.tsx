import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native'
import BootSplash from "react-native-bootsplash"
import { OneSignal } from 'react-native-onesignal'
import MainScreen from './MainScrean'
import SplashVideo from './SplashVideo'

const MINIMUM_SPLASH_TIME = 3000;

const App = () => {
  const [mainScreenReady, setMainScreenReady] = useState(false)
  const [splashTimeoutDone, setSplashTimeoutDone] = useState(false)
  const [splashVideoEnded, setSplashVideoEnded] = useState(false)

  const shouldShowSplash = !splashVideoEnded && (!mainScreenReady || !splashTimeoutDone)

  useEffect(() => {
    OneSignal.initialize('c727fcf2-c011-4187-8191-6b0d642be733');
  }, [])

  useEffect(() => {
    if (shouldShowSplash) return
    OneSignal.Notifications.requestPermission(false);
  }, [shouldShowSplash])

  useEffect(() => {
    BootSplash.hide({ fade: true })

    const timer = setTimeout(() => setSplashTimeoutDone(true), MINIMUM_SPLASH_TIME);

    return () => clearTimeout(timer);
  }, [])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <MainScreen onLoaded={() => setMainScreenReady(true)} />
      {shouldShowSplash && <SplashVideo
        onVideoEnd={() => setSplashVideoEnded(true)}
      />}
    </SafeAreaView>
  )
}

export default App
