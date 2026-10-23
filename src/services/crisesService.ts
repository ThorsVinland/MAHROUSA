// ============================================================
// src/services/crisesService.ts
// Real-time Firestore service for crises & disaster zones
// Automatically reflects crises added from the Admin Dashboard
// ============================================================

import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { MapMarker } from '../types/home.types';
import { MAP_MARKERS } from '../data/homeMockData';

const CRISES_COLLECTION = 'crises';

/**
 * Subscribe to real-time crises from Firestore.
 * Maps Firestore documents directly into MapMarker format used by SolidarityMap.
 * Falls back to default mock crises if collection is empty or offline.
 */
export function subscribeToLiveCrises(
  callback: (crises: MapMarker[]) => void,
  onError?: (error: Error) => void
): () => void {
  try {
    const crisesRef = collection(db, CRISES_COLLECTION);
    const q = query(crisesRef, orderBy('createdAt', 'desc'));

    const defaultCrises = MAP_MARKERS.filter((m) => m.type === 'crisis');

    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          callback(defaultCrises);
          return;
        }

        const liveCrises: MapMarker[] = [];
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const lat = Number(data.latitude);
          const lng = Number(data.longitude);

          if (!isNaN(lat) && !isNaN(lng)) {
            const marker: MapMarker = {
              id: docSnap.id,
              city: data.city || data.wilayaName || 'منطقة أزمة',
              title: data.title || '',
              latitude: lat,
              longitude: lng,
              type: 'crisis',
              description: data.description || '',
              severityPercentage: data.severityPercentage !== undefined ? Number(data.severityPercentage) : 75,
              severityLevel: data.severityLevel || 'critical',
              wilayaCode: data.wilaya || '',
              wilayaName: data.wilayaName || data.city || '',
              locationDetails: data.locationDetails || '',
              status: data.status || 'active',
              createdAt: data.createdAt,
            };
            liveCrises.push(marker);
          }
        });

        if (liveCrises.length === 0) {
          callback(defaultCrises);
        } else {
          callback(liveCrises);
        }
      },
      (error) => {
        console.warn('Live crises subscription error, using fallback query:', error);
        return onSnapshot(
          crisesRef,
          (fallbackSnap) => {
            if (fallbackSnap.empty) {
              callback(defaultCrises);
              return;
            }

            const liveCrises: MapMarker[] = [];
            fallbackSnap.docs.forEach((docSnap) => {
              const data = docSnap.data();
              const lat = Number(data.latitude);
              const lng = Number(data.longitude);
              if (!isNaN(lat) && !isNaN(lng)) {
                const marker: MapMarker = {
                  id: docSnap.id,
                  city: data.city || data.wilayaName || 'منطقة أزمة',
                  title: data.title || '',
                  latitude: lat,
                  longitude: lng,
                  type: 'crisis',
                  description: data.description || '',
                  severityPercentage: data.severityPercentage !== undefined ? Number(data.severityPercentage) : 75,
                  severityLevel: data.severityLevel || 'critical',
                  wilayaCode: data.wilaya || '',
                  wilayaName: data.wilayaName || data.city || '',
                  locationDetails: data.locationDetails || '',
                  status: data.status || 'active',
                  createdAt: data.createdAt,
                };
                liveCrises.push(marker);
              }
            });

            callback(liveCrises.length > 0 ? liveCrises : defaultCrises);
          },
          (fallbackErr) => {
            console.warn('Live crises complete fallback, using default mock:', fallbackErr);
            callback(defaultCrises);
            if (onError) onError(fallbackErr);
          }
        );
      }
    );
  } catch (err: any) {
    console.warn('Failed to initialize crises listener:', err);
    callback(MAP_MARKERS.filter((m) => m.type === 'crisis'));
    return () => {};
  }
}
