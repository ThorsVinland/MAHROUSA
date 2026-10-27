// ============================================================
// src/components/map/SolidarityMap.tsx
// High-performance OpenStreetMap (Humanitarian) + Leaflet map
// 100% Free - NO API KEY REQUIRED - Zero Watermarks
// Robust JSON-serialized marker loading (immune to string escaping / newlines)
// ============================================================

import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { MapMarker } from '../../types/home.types';

interface SolidarityMapProps {
  markers?: MapMarker[];
  selectedMarkerId?: string | null;
  onSelectMarker?: (marker: MapMarker) => void;
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  isMini?: boolean;
  onMapPress?: (coords: { lat: number; lng: number }) => void;
  pickedLocation?: { lat: number; lng: number } | null;
}

export const SolidarityMap: React.FC<SolidarityMapProps> = ({
  markers = [],
  onSelectMarker,
  centerLat = 36.5,
  centerLng = 3.2,
  zoom = 7,
  isMini = false,
  onMapPress,
  pickedLocation,
}) => {
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    if (!isMini && webViewRef.current) {
      const script = `
        if (typeof map !== 'undefined') {
          map.flyTo([${centerLat}, ${centerLng}], ${zoom}, { duration: 1.2 });
        }
        true;
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, [centerLat, centerLng, zoom, isMini]);

  const htmlContent = useMemo(() => {
    // Safely serialize markers as JSON to prevent unescaped newlines/quotes from breaking JS syntax
    const serializedMarkers = JSON.stringify(
      (markers || []).map((m) => ({
        id: String(m.id || ''),
        title: String(m.title || m.city || 'منطقة أزمة'),
        city: String(m.city || ''),
        latitude: Number(m.latitude),
        longitude: Number(m.longitude),
        type: m.type === 'crisis' ? 'crisis' : 'resource',
        description: String(m.description || ''),
        severityPercentage:
          m.severityPercentage !== undefined && m.severityPercentage !== null
            ? Number(m.severityPercentage)
            : null,
        severityLevel: String(m.severityLevel || ''),
      }))
    );

    const serializedPicked = pickedLocation
      ? JSON.stringify({ lat: Number(pickedLocation.lat), lng: Number(pickedLocation.lng) })
      : 'null';

    return `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          body, html, #map { width:100%; height:100%; background:#F8F4EE; }
          .leaflet-container { background: #EAE3D2 !important; }
          
          @keyframes pulse-red {
            0% { box-shadow: 0 0 0 0 rgba(220,38,38,0.7); }
            70% { box-shadow: 0 0 0 14px rgba(220,38,38,0); }
            100% { box-shadow: 0 0 0 0 rgba(220,38,38,0); }
          }
          @keyframes pulse-orange {
            0% { box-shadow: 0 0 0 0 rgba(234,88,12,0.7); }
            70% { box-shadow: 0 0 0 14px rgba(234,88,12,0); }
            100% { box-shadow: 0 0 0 0 rgba(234,88,12,0); }
          }
          @keyframes pulse-green {
            0% { box-shadow: 0 0 0 0 rgba(22,163,74,0.7); }
            70% { box-shadow: 0 0 0 14px rgba(22,163,74,0); }
            100% { box-shadow: 0 0 0 0 rgba(22,163,74,0); }
          }
          @keyframes bounce-blue {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }

          .custom-div-icon { display: flex; flex-direction: column; align-items: center; justify-content: center; }
          
          .crisis-urgent { width: 32px; height: 32px; border-radius: 16px; background: #DC2626; border: 2.5px solid #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 14px; animation: pulse-red 1.6s infinite; }
          .crisis-medium { width: 32px; height: 32px; border-radius: 16px; background: #EA580C; border: 2.5px solid #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 14px; animation: pulse-orange 1.8s infinite; }
          .crisis-normal { width: 32px; height: 32px; border-radius: 16px; background: #16A34A; border: 2.5px solid #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 14px; animation: pulse-green 2s infinite; }
          .resource-marker { width: 30px; height: 30px; border-radius: 15px; background: #16A34A; border: 2.5px solid #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 13px; animation: pulse-green 2s infinite; }
          .picked-marker { width: 34px; height: 34px; border-radius: 17px; background: #3498DB; border: 2.5px solid #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 8px rgba(0,0,0,0.3); animation: bounce-blue 1s infinite; }
          
          .city-tag { background: rgba(255,255,255,0.96); color: #1A1A2E; font-size: 10.5px; font-weight: 800; padding: 2px 7px; border-radius: 6px; margin-top: 2px; box-shadow: 0 2px 5px rgba(0,0,0,0.18); white-space: nowrap; }
          .leaflet-popup-content-wrapper { border-radius: 14px; padding: 4px; direction: rtl; text-align: right; box-shadow: 0 4px 16px rgba(0,0,0,0.15); border: 1px solid #E5E7EB; }
          .popup-box { padding: 4px; min-width: 180px; }
          .popup-badge { display: inline-block; font-size: 10.5px; font-weight: 800; padding: 2px 8px; border-radius: 10px; margin-bottom: 4px; }
          .popup-badge-urgent { background: #FEE2E2; color: #DC2626; }
          .popup-badge-medium { background: #FFEDD5; color: #EA580C; }
          .popup-badge-normal { background: #DCFCE7; color: #16A34A; }
          .popup-badge-resource { background: #DCFCE7; color: #16A34A; }
          .popup-title { font-size: 14px; font-weight: 800; color: #1A5276; margin-bottom: 2px; }
          .popup-desc { font-size: 11.5px; color: #475569; line-height: 1.4; margin-top: 4px; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          window.onerror = function(msg, url, line) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: msg, line: line }));
            }
          };

          function escapeHtml(str) {
            return String(str || '')
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
          }

          var map = L.map('map', {
            zoomControl: ${isMini ? 'false' : 'true'},
            attributionControl: false,
            dragging: ${isMini ? 'false' : 'true'},
            touchZoom: ${isMini ? 'false' : 'true'},
            scrollWheelZoom: ${isMini ? 'false' : 'true'},
            doubleClickZoom: ${isMini ? 'false' : 'true'}
          }).setView([${centerLat}, ${centerLng}], ${zoom});

          L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            maxZoom: 19,
            subdomains: ['a', 'b', 'c']
          }).addTo(map);

          var rawMarkers = ${serializedMarkers};
          var pickedCoords = ${serializedPicked};

          rawMarkers.forEach(function(m) {
            if (typeof m.latitude !== 'number' || typeof m.longitude !== 'number' || isNaN(m.latitude) || isNaN(m.longitude)) {
              return;
            }

            var isCrisis = m.type === 'crisis';
            var pct = m.severityPercentage;

            var markerClass = 'resource-marker';
            var badgeClass = 'popup-badge-resource';
            var badgeLabel = 'موقع المتطوع / نقطة إمداد';
            var barColor = '#16A34A';
            var iconSymbol = '📦';

            if (isCrisis) {
              iconSymbol = '🚨';
              if (pct !== null && pct !== undefined) {
                if (pct >= 75 || m.severityLevel === 'urgent' || m.severityLevel === 'critical') {
                  markerClass = 'crisis-urgent';
                  badgeClass = 'popup-badge-urgent';
                  badgeLabel = 'عاجل (' + pct + '%)';
                  barColor = '#DC2626';
                } else if (pct >= 40 || m.severityLevel === 'medium' || m.severityLevel === 'high') {
                  markerClass = 'crisis-medium';
                  badgeClass = 'popup-badge-medium';
                  badgeLabel = 'متوسط (' + pct + '%)';
                  barColor = '#EA580C';
                } else {
                  markerClass = 'crisis-normal';
                  badgeClass = 'popup-badge-normal';
                  badgeLabel = 'عادي (' + pct + '%)';
                  barColor = '#16A34A';
                }
              } else {
                markerClass = 'crisis-urgent';
                badgeClass = 'popup-badge-urgent';
                badgeLabel = 'أزمة طارئة';
                barColor = '#DC2626';
              }
            }

            var tagText = (pct !== null && pct !== undefined) ? (m.city + ' (' + pct + '%)') : m.city;
            var safeDesc = m.description || (isCrisis ? 'فرق التطوع مطلوبة لدعم المتضررين' : 'مركز نشاط المتطوع والدعم الميداني');

            var iconHtml = '<div class="' + markerClass + '"><span>' + iconSymbol + '</span></div>' +
                           '<div class="city-tag">' + escapeHtml(tagText) + '</div>';

            var customIcon = L.divIcon({
              className: 'custom-div-icon',
              html: iconHtml,
              iconSize: [60, 48],
              iconAnchor: [30, 24]
            });

            var marker = L.marker([m.latitude, m.longitude], { icon: customIcon }).addTo(map);

            var progressHtml = '';
            if (pct !== null && pct !== undefined) {
              progressHtml = '<div style="margin: 6px 0 4px 0;">' +
                '<div style="display:flex; justify-content:space-between; font-size:10px; font-weight:700; color:#475569; margin-bottom:2px;">' +
                  '<span>نسبة حدة المشكل:</span>' +
                  '<span style="color:' + barColor + '; font-weight:800;">' + pct + '%</span>' +
                '</div>' +
                '<div style="width:100%; height:5px; background:#E2E8F0; border-radius:999px; overflow:hidden;">' +
                  '<div style="width:' + pct + '%; height:100%; background:' + barColor + '; border-radius:999px;"></div>' +
                '</div>' +
              '</div>';
            }

            var popupContent = '<div class="popup-box">' +
              '<div class="popup-badge ' + badgeClass + '">' + escapeHtml(badgeLabel) + '</div>' +
              '<div class="popup-title">' + escapeHtml(m.title || m.city) + '</div>' +
              progressHtml +
              '<div class="popup-desc">' + escapeHtml(safeDesc) + '</div>' +
            '</div>';

            marker.bindPopup(popupContent);

            marker.on('click', function() {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'marker_click', id: m.id }));
              }
            });
          });

          if (pickedCoords && typeof pickedCoords.lat === 'number' && typeof pickedCoords.lng === 'number') {
            var pickedIcon = L.divIcon({
              className: 'custom-div-icon',
              html: '<div class="picked-marker"><span>📍</span></div><div class="city-tag">الموقع المحدد</div>',
              iconSize: [60, 48],
              iconAnchor: [30, 24]
            });
            L.marker([pickedCoords.lat, pickedCoords.lng], { icon: pickedIcon }).addTo(map);
          }

          ${
            onMapPress
              ? `
            map.on('click', function(e) {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'map_click', lat: e.latlng.lat, lng: e.latlng.lng }));
              }
            });
          `
              : ''
          }
        </script>
      </body>
      </html>
    `;
  }, [markers, centerLat, centerLng, zoom, isMini, pickedLocation, onMapPress]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data) as {
          type?: string;
          id?: string;
          lat?: number;
          lng?: number;
          message?: string;
        };

        if (data.type === 'error') {
          console.warn('Map WebView internal error:', data.message);
          return;
        }

        if (data.type === 'map_click' && onMapPress && data.lat !== undefined && data.lng !== undefined) {
          onMapPress({ lat: data.lat, lng: data.lng });
          return;
        }

        if ((data.type === 'marker_click' || !data.type) && data.id) {
          const found = markers?.find((m) => m.id === data.id);
          if (found && onSelectMarker) onSelectMarker(found);
        }
      } catch (e) {
        // ignore malformed message
      }
    },
    [markers, onSelectMarker, onMapPress]
  );

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleMessage}
        scrollEnabled={!isMini}
        onError={(err) => console.warn('SolidarityMap WebView onError:', err.nativeEvent)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#EAE3D2',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
