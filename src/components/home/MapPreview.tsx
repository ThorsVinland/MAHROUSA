// ============================================================
// src/components/home/MapPreview.tsx
// Home screen map preview powered by SolidarityMap (OSM + Leaflet)
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { MapMarker } from '../../types/home.types';
import { SolidarityMap } from '../map/SolidarityMap';

interface MapPreviewProps {
  markers: MapMarker[];
  onPress?: () => void;
}

export const MapPreview: React.FC<MapPreviewProps> = ({ markers, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.92}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🗺️ اكتشف على الخريطة</Text>
        <Text style={styles.openText}>← فتح</Text>
      </View>

      {/* Live OSM + Leaflet Mini Viewport */}
      <View style={styles.mapViewport}>
        <SolidarityMap
          markers={markers}
          isMini={true}
          centerLat={36.6}
          centerLng={2.8}
          zoom={6.8}
        />

        {/* Touch overlay to ensure smooth tap to open full screen */}
        <TouchableOpacity
          style={styles.touchOverlay}
          onPress={onPress}
          activeOpacity={0.1}
        />

        {/* Bottom Gradient with Crisis Count */}
        <LinearGradient
          colors={['transparent', 'rgba(26, 82, 118, 0.95)']}
          style={styles.gradientOverlay}
        >
          <Text style={styles.overlayText}>
            3 مناطق تحتاج مساعدة الآن في الشمال الجزائري
          </Text>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginHorizontal: 18,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0EBE1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primaryNavy,
  },
  openText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.mainBlue,
  },
  mapViewport: {
    height: 140,
    position: 'relative',
    overflow: 'hidden',
  },
  touchOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 2,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 9,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  overlayText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
