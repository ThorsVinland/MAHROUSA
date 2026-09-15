import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
  I18nManager,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme, { lightColors } from '../../theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');

const SLIDES = [
  {
    id: '1',
    title: 'مرحباً بك في محروسة',
    subtitle: 'المنصة المتكاملة لتمكين العمل التطوعي والدعم المجتمعي',
    description: 'نجمع بين المتطوعين الشغوفين والجمعيات والمؤسسات لبناء أثر مستدام ومجتمع متكاتف.',
    image: require('../../assets/images/1.png'),
    badge: 'محروسة',
  },
  {
    id: '2',
    title: 'استكشف الفرص والمبادرات',
    subtitle: 'تطوّع واصنع الفارق في منطقتك',
    description: 'تصفح المبادرات المتاحة بالقرب منك، واشترك بنقرة واحدة في الفعاليات التي تناسب مهاراتك وشغفك.',
    image: require('../../assets/images/2.png'),
    badge: 'للمتطوعين',
  },
  {
    id: '3',
    title: 'إدارة وتنسيق الجمعيات',
    subtitle: 'حلول عملية ومبتكرة للمؤسسات',
    description: 'أطلق مبادراتك الخيرية، استقطب الكفاءات التطوعية، وتابع تقارير الإنجاز بكل يسر وسهولة.',
    image: require('../../assets/images/3.png'),
    badge: 'للجمعيات',
  },
  {
    id: '4',
    title: 'ابدأ مسيرتك المعطاءة اليوم',
    subtitle: 'انضم لشبكة محروسة المجتمعية',
    description: 'سجل حسابك في ثوانٍ، واختر دورك كمتطوع أو كجمعية، وكن جزءاً من مسيرة العطاء والتمكين.',
    image: require('../../assets/images/4.png'),
    badge: 'انطلق الآن',
  },
];

export default function SplashScreen({ onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const brandPrimary = lightColors.primaryDarkBlue || '#1A5276';
  const brandAccent = lightColors.mainBlue || '#2E86C1';
  const successColor = lightColors.successGreen || '#27AE60';
  const darkTextColor = lightColors.primaryText || '#2C3E50';

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      if (onFinish) {
        onFinish();
      }
    }
  };

  const renderItem = ({ item, index }) => {
    const inputRange = [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH];

    const imageScale = scrollX.interpolate({
      inputRange,
      outputRange: [1.08, 1, 1.08],
      extrapolate: 'clamp',
    });

    const textTranslateY = scrollX.interpolate({
      inputRange,
      outputRange: [30, 0, 30],
      extrapolate: 'clamp',
    });

    const textOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.slideItem}>
        {/* Full Screen Image Background */}
        <Animated.Image
          source={item.image}
          style={[
            styles.fullScreenImage,
            {
              transform: [{ scale: imageScale }],
            },
          ]}
          resizeMode="cover"
        />

        {/* Text Container Overlay with Dark Text & Glass Backdrop */}
        <Animated.View
          style={[
            styles.textContainerOverlay,
            {
              transform: [{ translateY: textTranslateY }],
              opacity: textOpacity,
            },
          ]}
        >
          <View style={[styles.badgePill, { backgroundColor: brandPrimary }]}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
          <Text style={[styles.title, { color: brandPrimary }]}>{item.title}</Text>
          <Text style={[styles.subtitle, { color: brandAccent }]}>{item.subtitle}</Text>
          <Text style={[styles.description, { color: darkTextColor }]}>{item.description}</Text>
        </Animated.View>
      </View>
    );
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" transparent translucent backgroundColor="transparent" />

      {/* Background Slides Horizontal List */}
      <Animated.FlatList
        ref={slidesRef}
        data={SLIDES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Floating Bottom Section (Dots & Next/Start Button) */}
      <View style={styles.bottomBarContainer}>
        {/* Animated Pagination Dots */}
        <View style={styles.paginationContainer}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [9, 32, 9],
              extrapolate: 'clamp',
            });

            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.4, 1, 0.4],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={i.toString()}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity: dotOpacity,
                    backgroundColor: isLastSlide ? successColor : brandPrimary,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Action Button (Next / Get Started) */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: isLastSlide ? successColor : brandPrimary,
              shadowColor: isLastSlide ? successColor : brandPrimary,
            },
          ]}
          onPress={handleNext}
          activeOpacity={0.88}
        >
          <Text style={styles.actionButtonText}>
            {isLastSlide ? 'ابدأ الآن' : 'التالي'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  slideItem: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  fullScreenImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  textContainerOverlay: {
    position: 'absolute',
    bottom: 130, // Positioned in lower half over the image
    left: 20,
    right: 20,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // High clarity semi-transparent glass backdrop for text legibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  badgePill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 13.5,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 28,
    left: 24,
    right: 24,
    alignItems: 'center',
    zIndex: 30,
  },
  paginationContainer: {
    flexDirection: 'row',
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  dot: {
    height: 9,
    borderRadius: 4.5,
    marginHorizontal: 5,
  },
  actionButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  actionButtonIcon: {
    marginRight: 8,
  },
});
