/**
 * AI Itinerary Wizard Screen
 * 
 * CURRENT STATUS: Using MOCK AI RESPONSES
 * 
 * TO ENABLE REAL GEMINI AI:
 * 1. Get API key from: https://ai.google.dev/
 * 2. Add to .env: EXPO_PUBLIC_GEMINI_API_KEY=your_key
 * 3. Uncomment real API calls in: src/lib/ai/geminiService.ts
 * 4. See full guide: docs/GEMINI_SETUP.md
 */

import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { generateItinerary } from "@/lib/ai/geminiService";
import { Colors, useColorScheme } from "@/shared";

const { width } = Dimensions.get('window');

type ActivityType = 'deadline' | 'food-tour' | 'date-chill' | 'hangout';
type TransportType = 'walking-bus' | 'motorbike';
type BudgetType = 'low' | 'high';

interface WizardData {
  activity?: ActivityType;
  transport?: TransportType;
  budget?: BudgetType;
}

const ACTIVITIES = [
  {
    id: 'deadline' as ActivityType,
    icon: '🍱',
    title: 'Chay Deadline',
    subtitle: 'Chạy đến hẹn, xả hơi, vui lắm lun',
  },
  {
    id: 'food-tour' as ActivityType,
    icon: '😋',
    title: 'Food Tour',
    subtitle: 'Chạy ăn, ngon và vui, lạ chưởng',
  },
  {
    id: 'date-chill' as ActivityType,
    icon: '💖',
    title: 'Hẹn hò / Chill',
    subtitle: 'Hẹn hò, cafe vừa, riêng tư',
  },
  {
    id: 'hangout' as ActivityType,
    icon: '🎮',
    title: 'Tụ tập bạn bè',
    subtitle: 'Boardgame, quán nhậu, karaoke',
  },
];

const TRANSPORTS = [
  {
    id: 'walking-bus' as TransportType,
    icon: '🚶',
    title: 'Đi bộ / Xe buýt',
    subtitle: 'Gợi ý xa điểm gần nhau',
  },
  {
    id: 'motorbike' as TransportType,
    icon: '🏍️',
    title: 'Xe máy',
    subtitle: 'Có thể đi xa hơn',
  },
];

const BUDGETS = [
  {
    id: 'low' as BudgetType,
    icon: '💰',
    title: 'thích bao nhiêu chơi bấy nhiêu',
    subtitle: 'Casadao, cạn tiền, rẻ vô đối',
  },
  {
    id: 'high' as BudgetType,
    icon: '💎',
    title: 'thích sang chảnh một chút',
    subtitle: 'Quán mấy bự, thượng hạo',
  },
];

export function AIItineraryWizardScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState<any>(null);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const loadingDots = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in animation when step changes
    slideAnim.setValue(300);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 9,
    }).start();
  }, [currentStep]);

  useEffect(() => {
    if (isGenerating) {
      // Animate loading dots
      Animated.loop(
        Animated.sequence([
          Animated.timing(loadingDots, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(loadingDots, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isGenerating]);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGenerate();
    }
  };

  const handleBack = () => {
    if (currentStep > 1 && !isGenerating && !generatedItinerary) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      // This will use mock data now, but will use real Gemini AI when you add API key
      const itinerary = await generateItinerary({
        activity: wizardData.activity!,
        transport: wizardData.transport!,
        budget: wizardData.budget!,
      });

      setGeneratedItinerary(itinerary);
    } catch (error) {
      console.error('Failed to generate itinerary:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveItinerary = async () => {
    if (!generatedItinerary) return;

    try {
      const tripId = Date.now().toString();
      const now = new Date();

      const newTrip = {
        id: tripId,
        tripName: generatedItinerary.title,
        startDate: now.toISOString(),
        startTime: now.toISOString(),
        destinations: generatedItinerary.destinations,
        createdAt: now.toISOString(),
        status: 'upcoming',
      };

      const tripsJson = await AsyncStorage.getItem('@trips');
      const trips = tripsJson ? JSON.parse(tripsJson) : [];
      trips.push(newTrip);
      await AsyncStorage.setItem('@trips', JSON.stringify(trips));

      // Navigate to itinerary detail
      router.replace({
        pathname: "/(modals)/itinerary-detail" as any,
        params: {
          tripId,
          tripName: newTrip.tripName,
          startDate: newTrip.startDate,
          startTime: newTrip.startTime,
          destinations: JSON.stringify(newTrip.destinations),
        }
      });
    } catch (error) {
      console.error('Failed to save itinerary:', error);
    }
  };

  const canContinue = () => {
    if (currentStep === 1) return !!wizardData.activity;
    if (currentStep === 2) return !!wizardData.transport;
    if (currentStep === 3) return !!wizardData.budget;
    return false;
  };

  const getActivityLabel = (id: ActivityType) => {
    return ACTIVITIES.find(a => a.id === id)?.title || '';
  };

  const getTransportLabel = (id: TransportType) => {
    return TRANSPORTS.find(t => t.id === id)?.title || '';
  };

  const renderProgressBar = () => {
    const progress = (currentStep - 1) / 2; // 0, 0.5, 1 for steps 1, 2, 3
    return (
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <Animated.View 
            style={[
              styles.progressFill,
              { 
                backgroundColor: colors.info,
                width: `${progress * 100}%`,
              }
            ]} 
          />
        </View>
        {[1, 2, 3].map((step) => (
          <View 
            key={step}
            style={[
              styles.progressDot,
              { 
                backgroundColor: currentStep >= step ? colors.info : colors.border,
                left: step === 1 ? '0%' : step === 2 ? '50%' : '100%',
                marginLeft: step === 2 ? -6 : step === 3 ? -12 : 0,
              }
            ]}
          />
        ))}
      </View>
    );
  };

  const renderStep1 = () => (
    <Animated.View style={[styles.stepContainer, { transform: [{ translateX: slideAnim }] }]}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Bạn đang muốn làm gì?
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        Chọn loại hoạt động cho lịch trình nay
      </Text>

      <View style={styles.optionsContainer}>
        {ACTIVITIES.map((activity) => (
          <Pressable
            key={activity.id}
            style={[
              styles.optionCard,
              {
                backgroundColor: colors.card,
                borderColor: wizardData.activity === activity.id ? colors.info : colors.border,
                borderWidth: wizardData.activity === activity.id ? 2 : 1,
              }
            ]}
            onPress={() => setWizardData({ ...wizardData, activity: activity.id })}
          >
            <Text style={styles.optionIcon}>{activity.icon}</Text>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                {activity.title}
              </Text>
              <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>
                {activity.subtitle}
              </Text>
            </View>
            {wizardData.activity === activity.id && (
              <Ionicons name="checkmark-circle" size={24} color={colors.info} />
            )}
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View style={[styles.stepContainer, { transform: [{ translateX: slideAnim }] }]}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Phương tiện di chuyển?
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        Hiện tại gợi ý thường sẽ phù hợp
      </Text>

      <View style={styles.optionsContainer}>
        {TRANSPORTS.map((transport) => (
          <Pressable
            key={transport.id}
            style={[
              styles.optionCard,
              {
                backgroundColor: colors.card,
                borderColor: wizardData.transport === transport.id ? colors.info : colors.border,
                borderWidth: wizardData.transport === transport.id ? 2 : 1,
              }
            ]}
            onPress={() => setWizardData({ ...wizardData, transport: transport.id })}
          >
            <Text style={styles.optionIcon}>{transport.icon}</Text>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                {transport.title}
              </Text>
              <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>
                {transport.subtitle}
              </Text>
            </View>
            {wizardData.transport === transport.id && (
              <Ionicons name="checkmark-circle" size={24} color={colors.info} />
            )}
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View style={[styles.stepContainer, { transform: [{ translateX: slideAnim }] }]}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Tình trạng ví tiền?
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        Mức độ gợi ý phù hợp với túi tiền bạn nha
      </Text>

      <View style={styles.optionsContainer}>
        {BUDGETS.map((budget) => (
          <Pressable
            key={budget.id}
            style={[
              styles.optionCard,
              {
                backgroundColor: colors.card,
                borderColor: wizardData.budget === budget.id ? colors.info : colors.border,
                borderWidth: wizardData.budget === budget.id ? 2 : 1,
              }
            ]}
            onPress={() => setWizardData({ ...wizardData, budget: budget.id })}
          >
            <Text style={styles.optionIcon}>{budget.icon}</Text>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                {budget.title}
              </Text>
              <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>
                {budget.subtitle}
              </Text>
            </View>
            {wizardData.budget === budget.id && (
              <Ionicons name="checkmark-circle" size={24} color={colors.info} />
            )}
          </Pressable>
        ))}
      </View>

      {/* Summary */}
      <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.summaryTitle, { color: colors.textSecondary }]}>
          📋 Xem lại
        </Text>
        <Text style={[styles.summaryText, { color: colors.text }]}>
          Mục đích: {getActivityLabel(wizardData.activity!)}
        </Text>
        <Text style={[styles.summaryText, { color: colors.text }]}>
          Di chuyển: {getTransportLabel(wizardData.transport!)}
        </Text>
      </View>
    </Animated.View>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingContent}>
        <View style={styles.aiIconContainer}>
          <Animated.View 
            style={[
              styles.aiIconPulse,
              {
                transform: [{
                  scale: loadingDots.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  })
                }]
              }
            ]}
          >
            <Ionicons name="sparkles" size={48} color="#FFFFFF" />
          </Animated.View>
        </View>

        <Text style={[styles.loadingTitle, { color: colors.text }]}>
          AI đang nghĩ cho bạn...
        </Text>
        <Text style={[styles.loadingSubtitle, { color: colors.textSecondary }]}>
          Đang phân tích yêu cầu và tạo lịch trình phù hợp nhất
        </Text>

        <View style={styles.loadingDots}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              style={[
                styles.loadingDot,
                { backgroundColor: colors.info },
                {
                  opacity: loadingDots.interpolate({
                    inputRange: [0, 1],
                    outputRange: i === 0 ? [0.3, 1] : i === 1 ? [0.3, 0.6] : [0.3, 0.3],
                  })
                }
              ]}
            />
          ))}
        </View>

        <Text style={[styles.loadingHint, { color: colors.textSecondary }]}>
            Nhanh thôi mà, chờ xíu xíu nha!
        </Text>
        <Text style={[styles.loadingHint, { color: colors.textSecondary }]}>
            (Thường mất khoảng 10-20 giây)
        </Text>
      </View>
    </View>
  );

  const renderResult = () => {
    if (!generatedItinerary) return null;

    return (
      <ScrollView style={styles.resultContainer} showsVerticalScrollIndicator={false}>
        <Text style={[styles.resultTitle, { color: colors.text }]}>
          Lộ trình của bạn
        </Text>
        <Text style={[styles.resultSubtitle, { color: colors.textSecondary }]}>
          {generatedItinerary.title}
        </Text>

        {/* Map Preview Placeholder */}
        <View style={[styles.mapPreview, { backgroundColor: colors.border }]}>
          <Ionicons name="map" size={48} color={colors.icon} />
          <Text style={[styles.mapPreviewText, { color: colors.textSecondary }]}>
            Bản đồ lộ trình
          </Text>
        </View>

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          {generatedItinerary.destinations.map((dest: any, index: number) => (
            <View key={dest.id} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, { backgroundColor: colors.info }]} />
                {index < generatedItinerary.destinations.length - 1 && (
                  <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                )}
              </View>

              <View style={[styles.timelineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.timelineHeader}>
                  <View style={[styles.timeChip, { backgroundColor: '#E3F2FD' }]}>
                    <Ionicons name="time-outline" size={14} color="#2196F3" />
                    <Text style={[styles.timeChipText, { color: '#2196F3' }]}>
                      {dest.time}
                    </Text>
                  </View>
                  <Text style={[styles.durationText, { color: colors.textSecondary }]}>
                    {dest.duration || '~30 phút'}
                  </Text>
                </View>

                <Text style={[styles.destinationName, { color: colors.text }]}>
                  {dest.name}
                </Text>
                <Text style={[styles.destinationDesc, { color: colors.textSecondary }]}>
                  {dest.description}
                </Text>

                <View style={styles.chipRow}>
                  <View style={[styles.chip, { backgroundColor: '#E8F5E9' }]}>
                    <Text style={[styles.chipText, { color: '#4CAF50' }]}>
                      {dest.category}
                    </Text>
                  </View>
                  {dest.budget && (
                    <View style={[styles.chip, { backgroundColor: '#FFF3E0' }]}>
                      <Text style={[styles.chipText, { color: '#FF9800' }]}>
                        {dest.budget}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    );
  };

  if (isGenerating) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        {renderLoading()}
      </SafeAreaView>
    );
  }

  if (generatedItinerary) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { paddingTop: insets.top, borderBottomColor: colors.border }]}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.icon} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Gợi ý lịch trình
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {renderResult()}

        {/* Action Buttons */}
        <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <Pressable 
            style={[styles.halfButton, { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1.5 }]}
            onPress={() => {
              setGeneratedItinerary(null);
              setCurrentStep(1);
              setWizardData({});
            }}
          >
            <Ionicons name="refresh-outline" size={20} color={colors.text} />
            <Text style={[styles.halfButtonText, { color: colors.text }]}>Tạo lại</Text>
          </Pressable>
          <Pressable 
            style={[styles.halfButton, { backgroundColor: colors.info }]}
            onPress={handleSaveItinerary}
          >
            <Ionicons name="rocket-outline" size={20} color="#FFFFFF" />
            <Text style={[styles.halfButtonText, { color: '#FFFFFF' }]}>Bắt đầu đi</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { paddingTop: insets.top, borderBottomColor: colors.border }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.icon} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Gợi ý nhanh
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {renderProgressBar()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Pressable 
          style={[
            styles.continueButton, 
            { 
              backgroundColor: canContinue() ? colors.info : colors.border,
              opacity: canContinue() ? 1 : 0.5,
            }
          ]}
          onPress={handleNext}
          disabled={!canContinue()}
        >
          <Text style={[styles.continueButtonText, { color: '#FFFFFF' }]}>
            {currentStep === 3 ? 'Gợi ý cho tôi ngay!' : 'Tiếp tục'} →
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressContainer: {
    position: 'relative',
    marginHorizontal: 16,
    marginVertical: 20,
    height: 4,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    top: -4,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 15,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  optionIcon: {
    fontSize: 32,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
  },
  summaryCard: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 6,
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  continueButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingContent: {
    alignItems: 'center',
  },
  aiIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#7C4DFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  aiIconPulse: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  loadingHint: {
    fontSize: 13,
    marginBottom: 4,
  },
  resultContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 15,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  mapPreview: {
    marginHorizontal: 20,
    height: 200,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  mapPreviewText: {
    marginTop: 8,
    fontSize: 14,
  },
  timelineContainer: {
    paddingHorizontal: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 12,
    width: 24,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  timelineCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  durationText: {
    fontSize: 12,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  destinationDesc: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 20,
  },
  resultActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  resultActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  halfButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  halfButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
