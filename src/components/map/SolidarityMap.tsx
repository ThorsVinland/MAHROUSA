// ============================================================
// src/components/map/SolidarityMap.tsx
// High-performance OpenStreetMap (Humanitarian) + Leaflet map
// 100% Free - NO API KEY REQUIRED - Zero Watermarks
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
    const markersScript = markers
      .map((m) => {
        const isCrisis = m.type === 'crisis';
        const iconSymbol = isCrisis ? '🚨' : '📦';
        const pct = m.severityPercentage !== undefined && m.severityPercentage !== null ? Number(m.severityPercentage) : null;
        const badgeLabel = isCrisis 
          ? (pct !== null ? `منطقة أزمة (${pct}%)` : 'منطقة أزمة واحتياج عاجل')
          : 'موقع المتطوع / نقطة إمداد';
        const badgeClass = isCrisis ? 'popup-badge-crisis' : 'popup-badge-resource';
        const tagText = pct !== null ? `${m.city} (${pct}%)` : m.city;
        const descText = m.description 
          ? m.description.replace(/'/g, "\\'") 
          : (isCrisis ? 'فرق التطوع مطلوبة لدعم المتضررين' : 'مركز نشاط المتطوع والدعم الميداني');
        const progressBarHtml = pct !== null ? `
          <div style="margin: 6px 0 4px 0;">
            <div style="display:flex; justify-content:space-between; font-size:10px; font-weight:700; color:#475569; margin-bottom:2px;">
              <span>نسبة حدة المشكل:</span>
              <span style="color:#DC2626; font-weight:800;">${pct}%</span>
            </div>
            <div style="width:100%; height:5px; background:#E2E8F0; border-radius:999px; overflow:hidden;">
              <div style="width:${pct}%; height:100%; background:${pct >= 75 ? '#DC2626' : pct >= 50 ? '#EA580C' : '#D97706'}; border-radius:999px;"></div>
            </div>
          </div>
        ` : '';

        return `
          (function() {
            var iconHtml = '<div class="${isCrisis ? 'crisis-marker' : 'resource-marker'}"><span>${iconSymbol}</span></div><div class="city-tag">${tagText}</div>';
            var customIcon = L.divIcon({
              className: 'custom-div-icon',
              html: iconHtml,
              iconSize: [60, 48],
              iconAnchor: [30, 24]
            });
            var marker = L.marker([${m.latitude}, ${m.longitude}], { icon: customIcon }).addTo(map);
            var popupContent = '<div class="popup-box"><div class="popup-badge ${badgeClass}">${badgeLabel}</div><div class="popup-title">${m.city}</div>${progressBarHtml}<div class="popup-desc">${descText}</div></div>';
            marker.bindPopup(popupContent);
            marker.on('click', function() {
              window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'marker_click', id: '${m.id}' }));
            });
          })();
        `;
      })
      .join('\n');

    const pickedScript = pickedLocation ? `
      (function() {
        var pickedIcon = L.divIcon({
          className: 'custom-div-icon',
          html: '<div class="picked-marker"><span>📍</span></div><div class="city-tag">الموقع المحدد</div>',
          iconSize: [60, 48],
          iconAnchor: [30, 24]
        });
        L.marker([${pickedLocation.lat}, ${pickedLocation.lng}], { icon: pickedIcon }).addTo(map);
      })();
    ` : '';

    const clickEventScript = onMapPress ? `
      map.on('click', function(e) {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'map_click', lat: e.latlng.lat, lng: e.latlng.lng }));
      });
    ` : '';

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
            0% { box-shadow: 0 0 0 0 rgba(231,76,60,0.7); }
            70% { box-shadow: 0 0 0 14px rgba(231,76,60,0); }
            100% { box-shadow: 0 0 0 0 rgba(231,76,60,0); }
          }
          @keyframes pulse-green {
            0% { box-shadow: 0 0 0 0 rgba(39,174,96,0.7); }
            70% { box-shadow: 0 0 0 14px rgba(39,174,96,0); }
            100% { box-shadow: 0 0 0 0 rgba(39,174,96,0); }
          }
          @keyframes bounce-blue {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          .custom-div-icon { display: flex; flex-direction: column; align-items: center; justify-content: center; }
          .crisis-marker { width: 30px; height: 30px; border-radius: 15px; background: #E74C3C; border: 2.5px solid #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 13px; animation: pulse-red 1.6s infinite; }
          .resource-marker { width: 30px; height: 30px; border-radius: 15px; background: #27AE60; border: 2.5px solid #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 13px; animation: pulse-green 2s infinite; }
          .picked-marker { width: 34px; height: 34px; border-radius: 17px; background: #3498DB; border: 2.5px solid #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 4px 8px rgba(0,0,0,0.3); animation: bounce-blue 1s infinite; }
          .city-tag { background: rgba(255,255,255,0.95); color: #1A1A2E; font-size: 10px; font-weight: 800; padding: 1px 6px; border-radius: 6px; margin-top: 2px; box-shadow: 0 2px 4px rgba(0,0,0,0.15); white-space: nowrap; }
          .leaflet-popup-content-wrapper { border-radius: 14px; padding: 2px; direction: rtl; text-align: right; box-shadow: 0 4px 16px rgba(0,0,0,0.15); border: 1px solid #E5E7EB; }
          .popup-box { padding: 4px; }
          .popup-badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 10px; margin-bottom: 4px; }
          .popup-badge-crisis { background: #FEE2E2; color: #E74C3C; }
          .popup-badge-resource { background: #DCFCE7; color: #27AE60; }
          .popup-title { font-size: 14px; font-weight: 800; color: #1A5276; margin-bottom: 2px; }
          .popup-desc { font-size: 11px; color: #6B7280; line-height: 1.3; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
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
          ${markersScript}
          ${pickedScript}
          ${clickEventScript}
        </script>
      </body>
      </html>
    `;
  }, [markers, centerLat, centerLng, zoom, isMini, pickedLocation, onMapPress]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data) as { type?: string; id?: string; lat?: number; lng?: number };
        
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
        onMessage={handleMessage}
        scrollEnabled={!isMini}
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
