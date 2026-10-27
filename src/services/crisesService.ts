// ============================================================
// src/services/crisesService.ts
// Real-time Firestore service for crises & disaster zones
// Only returns crises explicitly added by Admin in the Dashboard
// ============================================================

import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { MapMarker } from '../types/home.types';

const CRISES_COLLECTION = 'crises';

/**
 * Subscribe to real-time crises from Firestore.
 * Maps Firestore documents directly into MapMarker format used by SolidarityMap.
 * Only displays actual crises created by admin (no default mock crises).
 */
export function subscribeToLiveCrises(
  callback: (crises: MapMarker[]) => void,
  onError?: (error: Error) => void
): () => void {
  try {
    const crisesRef = collection(db, CRISES_COLLECTION);
    const q = query(crisesRef, orderBy('createdAt', 'desc'));

    const parseDocs = (snapshotDocs: any[]): MapMarker[] => {
      const liveCrises: MapMarker[] = [];
      snapshotDocs.forEach((docSnap) => {
        const data = docSnap.data();
        const lat = parseFloat(String(data.latitude));
        const lng = parseFloat(String(data.longitude));

        if (!isNaN(lat) && !isNaN(lng)) {
          // If the crisis has been resolved by admin, do not show on active map
          if (data.status === 'resolved') {
            return;
          }

          const pct = data.severityPercentage !== undefined && data.severityPercentage !== null
            ? Number(data.severityPercentage)
            : 50;

          const marker: MapMarker = {
            id: docSnap.id,
            city: data.city || data.wilayaName || 'منطقة أزمة',
            title: data.title || data.city || 'أزمة طارئة',
            latitude: lat,
            longitude: lng,
            type: 'crisis',
            description: data.description || '',
            severityPercentage: pct,
            severityLevel: data.severityLevel || (pct >= 75 ? 'urgent' : pct >= 40 ? 'medium' : 'normal'),
            wilayaCode: String(data.wilaya || ''),
            wilayaName: data.wilayaName || data.city || '',
            locationDetails: data.locationDetails || '',
            status: data.status || 'active',
            createdAt: data.createdAt,
          };
          liveCrises.push(marker);
        }
      });
      return liveCrises;
    };

    return onSnapshot(
      q,
      (snapshot) => {
        callback(parseDocs(snapshot.docs));
      },
      (error) => {
        console.warn('Live crises subscription with order error, using fallback query:', error);
        return onSnapshot(
          crisesRef,
          (fallbackSnap) => {
            const list = parseDocs(fallbackSnap.docs);
            list.sort((a, b) => {
              const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
              const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
              return timeB - timeA;
            });
            callback(list);
          },
          (fallbackErr) => {
            console.warn('Live crises fallback error:', fallbackErr);
            callback([]);
            if (onError) onError(fallbackErr);
          }
        );
      }
    );
  } catch (err: any) {
    console.warn('Failed to initialize crises listener:', err);
    callback([]);
    return () => {};
  }
}
