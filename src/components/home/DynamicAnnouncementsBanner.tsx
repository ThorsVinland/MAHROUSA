// ============================================================
// src/components/home/DynamicAnnouncementsBanner.tsx
// Real-time Announcements Banner for MAHROUSA Home Screen
// Supports: Supervisor Upgrade Approval, Urgent Crisis/Need,
// Backup Promotion & Attendance Confirmation
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { HomeAnnouncement } from '../../types/notification.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 36;

interface Props {
  announcements: HomeAnnouncement[];
}

export const DynamicAnnouncementsBanner: React.FC<Props> = ({ announcements }) => {
  const { colors: Colors, isDarkMode } = useTheme();
  const styles = React.useMemo(() => getStyles(Colors, isDarkMode), [Colors, isDarkMode]);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for urgent/critical announcements
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulseAnim]);

  // Auto scroll if multiple announcements
  useEffect(() => {
    if (announcements.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % announcements.length;
        scrollRef.current?.scrollTo({ x: next * (BANNER_WIDTH + 12), animated: true });
        return next;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [announcements.length]);

  if (!announcements || announcements.length === 0) {
    return null;
  }

  const handleScroll = (event: any) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / (BANNER_WIDTH + 12));
    if (slide !== activeIndex && slide >= 0 && slide < announcements.length) {
      setActiveIndex(slide);
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={BANNER_WIDTH + 12}
        snapToAlignment="center"
      >
        {announcements.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.bannerCard,
              {
                backgroundColor: item.bgColor,
                borderColor: item.borderColor,
              },
            ]}
            onPress={item.onPress}
            activeOpacity={0.9}
          >
            {/* Top Bar: Badge + Icon */}
            <View style={styles.topRow}>
              <View style={styles.badgeRow}>
                {item.type === 'urgent_crisis' && (
                  <Animated.View
                    style={[styles.pulseDot, { transform: [{ scale: pulseAnim }] }]}
                  />
                )}
                <View style={[styles.badge, { backgroundColor: item.badgeColor || item.color }]}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              </View>

              <View style={[styles.iconCircle, { backgroundColor: item.color + '22' }]}>
                <Ionicons name={item.iconName as any} size={18} color={item.color} />
              </View>
            </View>

            {/* Content */}
            <Text style={[styles.title, { color: item.color }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>

            {/* Action Button Footer */}
            <View style={styles.footerRow}>
              <View
                style={[
                  styles.actionButton,
                  { backgroundColor: item.color },
                ]}
              >
                <Ionicons name="arrow-back" size={14} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>{item.actionText}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      {announcements.length > 1 && (
        <View style={styles.dotsRow}>
          {announcements.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                activeIndex === i && styles.dotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const getStyles = (Colors: any, isDarkMode: boolean) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: 16,
    },
    scrollContent: {
      paddingHorizontal: 18,
      gap: 12,
    },
    bannerCard: {
      width: BANNER_WIDTH,
      borderRadius: 20,
      borderWidth: 1.5,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDarkMode ? 0.3 : 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    topRow: {
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    badgeRow: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 6,
    },
    pulseDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#EF4444',
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '800',
    },
    iconCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 16,
      fontWeight: '900',
      textAlign: 'right',
      marginBottom: 4,
      lineHeight: 22,
    },
    description: {
      fontSize: 12,
      fontWeight: '500',
      color: Colors.textSecondary,
      textAlign: 'right',
      lineHeight: 18,
      marginBottom: 12,
    },
    footerRow: {
      flexDirection: 'row-reverse',
      justifyContent: 'flex-start',
    },
    actionButton: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 14,
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '800',
    },
    dotsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      marginTop: 8,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: isDarkMode ? '#4B5563' : '#D1D5DB',
    },
    dotActive: {
      width: 18,
      backgroundColor: Colors.primaryNavy || '#1E3A8A',
    },
  });
