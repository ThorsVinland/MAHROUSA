// ============================================================
// src/screens/organization/OrgMapScreen.tsx
// Dynamic interactive map centered on Organization's Wilaya
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAlert } from '../../context/AlertContext';
import { MapMarker } from '../../types/home.types';
import { MAP_MARKERS, CURRENT_WILAYA } from '../../data/homeMockData';
import { useAuthStore } from '../../store/authStore';
import { getWilayaInfo } from '../../utils/wilayaHelper';
import { SolidarityMap } from '../../components/map/SolidarityMap';
import { ZoneDetailCard } from '../../components/map/ZoneDetailCard';
import { subscribeToLiveCrises } from '../../services/crisesService';

interface NavigationProp {
  navigate: (screen: string, params?: Record<string, unknown>) => void;
  goBack?: () => void;
}

interface OrgMapScreenProps {
  navigation?: NavigationProp;
}

type FilterOption = 'all' | 'crisis' | 'resource';

export default function OrgMapScreen({ navigation }: OrgMapScreenProps) {
  const { colors: Colors } = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);
  const { showAlert } = useAlert();

  const [filter, setFilter] = useState<FilterOption>('all');
  const [liveCrises, setLiveCrises] = useState<MapMarker[]>([]);

  // Subscribe to real-time crises from dashboard
  useEffect(() => {
    const unsubscribe = subscribeToLiveCrises((crises) => {
      setLiveCrises(crises);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Dynamic user wilaya from auth store
  const user = useAuthStore((state) => state.user);
  const userWilayaInfo = useMemo(
    () => getWilayaInfo(user?.wilaya || CURRENT_WILAYA),
    [user?.wilaya]
  );

  const [centerCoords, setCenterCoords] = useState({
    lat: userWilayaInfo.lat,
    lng: userWilayaInfo.lng,
    zoom: 8,
  });

  const allMarkers = useMemo<MapMarker[]>(() => {
    return [
      {
        id: 'user_base',
        city: userWilayaInfo.name,
        latitude: userWilayaInfo.lat,
        longitude: userWilayaInfo.lng,
        type: 'resource',
      },
      ...liveCrises,
    ];
  }, [userWilayaInfo, liveCrises]);

  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  const filteredMarkers = useMemo(() => {
    if (filter === 'crisis') return allMarkers.filter((m) => m.type === 'crisis');
    if (filter === 'resource') return allMarkers.filter((m) => m.type === 'resource');
    return allMarkers;
  }, [filter, allMarkers]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (navigation?.goBack ? navigation.goBack() : navigation?.navigate('OrgDashboard'))}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-forward" size={20} color={Colors.primaryNavy} />
        </TouchableOpacity>
        <View style={styles.titleCol}>
          <Text style={styles.title}>خريطة الجمعيات 🇩🇿</Text>
          <Text style={styles.subtitle}>
            تتبع الأزمات والاحتياجات الميدانية لحظياً
          </Text>
        </View>
      </View>

      {/* Filter Chips Bar */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.chip, filter === 'all' && styles.chipActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.chipText, filter === 'all' && styles.chipTextActive]}>
            الكل ({allMarkers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chip, filter === 'crisis' && styles.chipActive]}
          onPress={() => setFilter('crisis')}
        >
          <Text style={[styles.chipText, filter === 'crisis' && styles.chipTextActive]}>
            🔴 أزمات ({liveCrises.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chip, filter === 'resource' && styles.chipActive]}
          onPress={() => setFilter('resource')}
        >
          <Text style={[styles.chipText, filter === 'resource' && styles.chipTextActive]}>
            🟢 إمداد (1)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map Viewport */}
      <View style={styles.mapContainer}>
        <SolidarityMap
          markers={filteredMarkers}
          selectedMarkerId={selectedMarker?.id}
          onSelectMarker={(m) => setSelectedMarker(m)}
          centerLat={centerCoords.lat}
          centerLng={centerCoords.lng}
          zoom={centerCoords.zoom}
        />

        {/* Floating Quick Action Buttons */}
        <View style={styles.floatingControls}>
          <TouchableOpacity
            style={styles.fabBtn}
            onPress={() => setCenterCoords({ lat: userWilayaInfo.lat, lng: userWilayaInfo.lng, zoom: 10 })}
            activeOpacity={0.8}
          >
            <Ionicons name="navigate" size={16} color={Colors.primaryNavy} />
            <Text style={styles.fabText}>موقعنا ({userWilayaInfo.name})</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.fabBtn}
            onPress={() => setCenterCoords({ lat: 36.5, lng: 3.2, zoom: 7 })}
            activeOpacity={0.8}
          >
            <Ionicons name="globe-outline" size={16} color={Colors.primaryNavy} />
            <Text style={styles.fabText}>كل الجزائر</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Zone Card Drawer */}
        {selectedMarker && (
          <View style={styles.detailWrapper}>
            <ZoneDetailCard
              marker={selectedMarker}
              onClose={() => setSelectedMarker(null)}
              onViewNeeds={(m) => {
                showAlert(`احتياجات ${m.city}`, `يوجد حالياً مهام مفتوحة في ولاية ${m.city}.`);
              }}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F0EBE1' },
  titleCol: { alignItems: 'flex-end' },
  title: { fontSize: 17, fontWeight: '800', color: Colors.primaryNavy },
  subtitle: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  filterRow: { flexDirection: 'row-reverse', paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.borderDefault },
  chipActive: { backgroundColor: Colors.primaryNavy, borderColor: Colors.primaryNavy },
  chipText: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },
  chipTextActive: { color: '#FFFFFF' },
  mapContainer: { flex: 1, position: 'relative' },
  floatingControls: { position: 'absolute', top: 12, left: 12, gap: 8, zIndex: 10 },
  fabBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.94)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, elevation: 3, borderWidth: 1, borderColor: '#F0EBE1' },
  fabText: { fontSize: 11, fontWeight: '700', color: Colors.primaryNavy },
  detailWrapper: { position: 'absolute', bottom: 12, left: 14, right: 14, zIndex: 20 },
});
