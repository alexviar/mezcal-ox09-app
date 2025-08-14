import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, Linking, Platform, StyleSheet, ToastAndroid, View } from 'react-native';
import { PERMISSIONS, request } from 'react-native-permissions';
import WebView from 'react-native-webview';
import { WebViewError } from './WebViewError';
import { WebViewLoader } from './WebViewLoader';
import { webViewUrl } from './config';

type Props = {
  onLoaded(): void
}

const MainScreen = ({ onLoaded }: Props) => {
  const webViewRef = useRef<WebView>(null)
  const [loadProgress, setLoadProgress] = useState(0)

  // Inicializamos isLoading en true para capturar únicamente la carga inicial.
  // onLoadStart se dispara en cada cambio de ruta interno, por lo que no es útil para este caso.
  const [isLoading, setIsLoading] = useState(true)
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      const timeoutId = setTimeout(() => {
        setShowLoader(false)
        onLoaded()
      }, 300)
      return () => clearTimeout(timeoutId)
    }
    setShowLoader(true)
  }, [isLoading])
  console.log(isLoading, showLoader)

  const webUrl = webViewUrl

  const handleDownload = async (downloadUrl: string) => {
    if (Platform.OS === 'android') {
      const result = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE)
      if (result !== 'granted') return
    }
    Linking.openURL(downloadUrl)
  }

  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data)

      if (data.type === 'DOWNLOAD_FILE') {
        handleDownload(data.downloadUrl)
      }
      else if (data.type === 'REQUEST_CAMERA_PERMISSION') {
        request(Platform.OS === 'android' ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA)
      }
    } catch (error) {
      console.log('Error parsing message:', error)
    }
  }

  useEffect(() => {
    let lastBackPressed = 0;
    const backAction = () => {
      const time = new Date().getTime();
      if (time - lastBackPressed < 2000) {
        // Si se presiona dos veces en menos de 2 segundos, se permite la salida
        return false;
      } else {
        lastBackPressed = time;
        ToastAndroid.show('Presiona de nuevo para salir', ToastAndroid.SHORT);
        return true; // Interceptamos el back para evitar cerrar inmediatamente
      }
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, []);

  return (
    <>
      <WebView
        ref={webViewRef}
        source={{ uri: webUrl }}
        onMessage={onMessage}
        onFileDownload={({ nativeEvent: { downloadUrl } }) => handleDownload(downloadUrl)}
        onLoadProgress={(event) => {
          if (!isLoading) return
          const progress = event.nativeEvent.progress
          setLoadProgress(progress)
        }}
        onLoadEnd={(e) => {
          setIsLoading(false)
          setLoadProgress(1)
        }}
        javaScriptCanOpenWindowsAutomatically
        originWhitelist={['*']}
        onOpenWindow={async (e) => {
          const url = e.nativeEvent.targetUrl

          return Linking.openURL(url).catch(() => {
            webViewRef.current?.injectJavaScript(`
              window.receiveNativeCommand(${JSON.stringify({ type: 'native_linking_failed', payload: { url } })});
              true;
            `)
          })
        }}
        renderError={() => <WebViewError onRetry={() => {
          setIsLoading(true)
          setLoadProgress(0)
          webViewRef.current?.reload()
        }} />}
      />

      {/* 
        Renderizamos el Loader condicionalmente en lugar de usar la prop `renderLoading` para prevenir el bug 
        reportado en https://github.com/react-native-webview/react-native-webview/issues/563#issuecomment-715503350 
      */}
      {showLoader && (
        <View style={StyleSheet.absoluteFillObject}>
          <WebViewLoader progress={loadProgress} />
        </View>
      )}
    </>
  )
}

export default MainScreen