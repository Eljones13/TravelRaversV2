const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Web platform alias: swap react-native-maps for a no-op shim on web
config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (platform === 'web') {
        if (moduleName === 'react-native-maps') {
            return {
                filePath: path.resolve(__dirname, 'src/mocks/react-native-maps.web.tsx'),
                type: 'sourceFile',
            };
        }
        if (moduleName === 'mapbox-gl/dist/mapbox-gl.css' || moduleName === '@rnmapbox/maps') {
            return {
                filePath: path.resolve(__dirname, 'src/mocks/empty.css.js'),
                type: 'sourceFile',
            };
        }
    }
    return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
