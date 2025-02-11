module.exports = {
  expo: {
    name: 'reproductor-musica',
    slug: 'reproductor-musica',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'dark',
    scheme: 'reproductormusica',
    sdkVersion: "52.0.0",
    experiments: {
      newArchEnabled: true
    },
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#000000'
    },
    assetBundlePatterns: [
      "assets/**/*",
      "assets/canciones/*",
      "assets/images/*"
    ],
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#000000'
      }
    },
    plugins: [
      [
        "expo-av",
        {
          "microphonePermission": false
        }
      ]
    ]
  }
};