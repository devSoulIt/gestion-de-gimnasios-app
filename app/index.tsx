import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { BackHandler, Platform, SafeAreaView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from "react-native-webview";

export default function HomeScreen() {
  const [hasError, setHasError] = useState(false);

  const exitApp = () => {
    BackHandler.exitApp();
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        marginTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      <ExpoStatusBar style="light" backgroundColor="#181818" />
      {hasError ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#181818",
            position: 'relative'
          }}
        >
          <Text style={{ color: "#fff", fontSize: 18 }}>
            Error al cargar, verifica tu conectividad!
          </Text>
          <TouchableOpacity onPress={() => setHasError(false)} style={{ position: 'absolute', bottom: 85 }}>
            <Text style={{ color: "#fff", fontSize: 18 }}>
              Volver a intentar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setHasError(false)} style={{ position: 'absolute', bottom: 35 }}>
            <Text style={{ color: "#fff", fontSize: 18 }} onPress={exitApp}>
              Salir
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          source={{ uri: "https://gym.devsoulit.com/client" }}
          style={{ flex: 1 }}
          onError={() => setHasError(true)} // Maneja el error y cambia el estado
        />
      )}
    </SafeAreaView>
  );
}
