// react-native-maps web shim — react-native-maps requires native modules
// and cannot run in a web bundle. This file exports no-op components so
// Metro can bundle MapScreen for web without crashing.

import React from 'react';
import { View } from 'react-native';

const noop = () => null;

const MapView = ({ children, style }: any) => <View style={style}>{children}</View>;
const Marker = noop;
const Polygon = noop;

MapView.Animated = MapView;

export { Marker, Polygon };
export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = null;
export default MapView;
