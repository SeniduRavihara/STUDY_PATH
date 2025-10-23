import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Reward = {
  id: number;
  title: string;
  points: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  description?: string;
  available?: boolean;
  cost?: number;
  type?: "daily" | "achievement" | "event" | "vip";
  rarity?: "common" | "rare" | "epic" | "legendary";
  progress?: number;
  maxProgress?: number;
};

export default function RewardsScreen() {
  const [userPoints, setUserPoints] = useState(2847);
  const [selectedTab, setSelectedTab] = useState<"daily" | "battle" | "spin">(
    "daily",
  );
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [vipLevel] = useState(3);
  const [battlePassLevel] = useState(15);
  const [spinCoins, setSpinCoins] = useState(3);

  const [spinAnimation] = useState(new Animated.Value(0));
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [wonReward, setWonReward] = useState<Reward | null>(null);

  // Reset spin animation when tab changes
  useEffect(() => {
    spinAnimation.setValue(0);
  }, [selectedTab, spinAnimation]);

  const dailyRewards: Reward[] = [
    {
      id: 1,
      title: "Day 1",
      points: 50,
      icon: "star",
      color: "#f59e0b",
      type: "daily",
      rarity: "common",
    },
    {
      id: 2,
      title: "Day 2",
      points: 75,
      icon: "star",
      color: "#f59e0b",
      type: "daily",
      rarity: "common",
    },
    {
      id: 3,
      title: "Day 3",
      points: 100,
      icon: "star",
      color: "#f59e0b",
      type: "daily",
      rarity: "rare",
    },
    {
      id: 4,
      title: "Day 4",
      points: 125,
      icon: "star",
      color: "#f59e0b",
      type: "daily",
      rarity: "common",
    },
    {
      id: 5,
      title: "Day 5",
      points: 150,
      icon: "star",
      color: "#f59e0b",
      type: "daily",
      rarity: "epic",
    },
    {
      id: 6,
      title: "Day 6",
      points: 175,
      icon: "star",
      color: "#f59e0b",
      type: "daily",
      rarity: "common",
    },
    {
      id: 7,
      title: "Day 7",
      points: 500,
      icon: "diamond",
      color: "#f59e0b",
      type: "daily",
      rarity: "legendary",
    },
  ];

  const battlePassRewards: Reward[] = [
    {
      id: 1,
      title: "Level 1",
      points: 100,
      icon: "trophy",
      color: "#f59e0b",
      type: "event",
      rarity: "common",
      progress: 100,
      maxProgress: 100,
    },
    {
      id: 2,
      title: "Level 5",
      points: 250,
      icon: "trophy",
      color: "#f59e0b",
      type: "event",
      rarity: "rare",
      progress: 100,
      maxProgress: 100,
    },
    {
      id: 3,
      title: "Level 10",
      points: 500,
      icon: "trophy",
      color: "#f59e0b",
      type: "event",
      rarity: "epic",
      progress: 100,
      maxProgress: 100,
    },
    {
      id: 4,
      title: "Level 15",
      points: 1000,
      icon: "trophy",
      color: "#f59e0b",
      type: "event",
      rarity: "legendary",
      progress: 60,
      maxProgress: 100,
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const vipRewards: Reward[] = [
    {
      id: 1,
      title: "VIP 1",
      points: 0,
      icon: "diamond",
      color: "#f59e0b",
      type: "vip",
      rarity: "rare",
      description: "Daily bonus points +10%",
    },
    {
      id: 2,
      title: "VIP 2",
      points: 0,
      icon: "diamond",
      color: "#f59e0b",
      type: "vip",
      rarity: "epic",
      description: "Daily bonus points +25%",
    },
    {
      id: 3,
      title: "VIP 3",
      points: 0,
      icon: "diamond",
      color: "#f59e0b",
      type: "vip",
      rarity: "legendary",
      description: "Daily bonus points +50%",
    },
  ];

  const spinRewards: Reward[] = [
    {
      id: 1,
      title: "50 Points",
      points: 50,
      icon: "star",
      color: "#f59e0b",
      rarity: "common",
    },
    {
      id: 2,
      title: "100 Points",
      points: 100,
      icon: "star",
      color: "#f59e0b",
      rarity: "common",
    },
    {
      id: 3,
      title: "200 Points",
      points: 200,
      icon: "star",
      color: "#f59e0b",
      rarity: "rare",
    },
    {
      id: 4,
      title: "500 Points",
      points: 500,
      icon: "star",
      color: "#f59e0b",
      rarity: "epic",
    },
    {
      id: 5,
      title: "1000 Points",
      points: 1000,
      icon: "star",
      color: "#f59e0b",
      rarity: "legendary",
    },
  ];

  const handleRedeem = (reward: Reward) => {
    setSelectedReward(reward);
    setShowRedeemModal(true);
  };

  const confirmRedeem = () => {
    if (selectedReward) {
      setUserPoints(userPoints + selectedReward.points);
      setShowRedeemModal(false);
      setSelectedReward(null);
    }
  };

  const getRarityColor = (rarity: Reward["rarity"]) => {
    switch (rarity) {
      case "common":
        return "#6b7280";
      case "rare":
        return "#3b82f6";
      case "epic":
        return "#8b5cf6";
      case "legendary":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const handleSpin = () => {
    if (spinCoins > 0) {
      setSpinCoins(spinCoins - 1);
      // Animate spin
      Animated.sequence([
        Animated.timing(spinAnimation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Random reward
        const randomReward =
          spinRewards[Math.floor(Math.random() * spinRewards.length)];
        setWonReward(randomReward);
        setUserPoints(userPoints + randomReward.points);
        setShowRewardAnimation(true);
        setTimeout(() => {
          setShowRewardAnimation(false);
          setWonReward(null);
          spinAnimation.setValue(0);
        }, 2000);
      });
    }
  };

  const TabButton = ({
    title,
    icon,
    isActive,
    onPress,
    gradientColors,
  }: {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    isActive: boolean;
    onPress: () => void;
    gradientColors: [string, string];
  }) => {
    if (isActive) {
      return (
        <TouchableOpacity style={styles.tabButtonContainer} onPress={onPress}>
          <LinearGradient
            colors={gradientColors}
            style={styles.activeTabGradient}
          >
            <Ionicons name={icon} size={20} color="white" />
            <Text style={styles.activeTabText}>{title}</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity style={styles.inactiveTabButton} onPress={onPress}>
        <View style={styles.inactiveTabContent}>
          <Ionicons name={icon} size={20} color="#6b7280" />
          <Text style={styles.inactiveTabText}>{title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header with Game-like Design */}
      <LinearGradient
        colors={["#0f0f23", "#1a1a2e"]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTitle}>
            <Ionicons name="trophy" size={32} color="#f59e0b" />
            <Text style={styles.headerText}>
              Rewards Center
            </Text>
          </View>
          <View style={styles.badgesContainer}>
            <LinearGradient
              colors={["#f59e0b", "#d97706"]}
              style={[styles.badge, styles.pointsBadge]}
            >
              <View style={styles.badgeContent}>
                <Ionicons name="star" size={24} color="white" />
                <Text style={styles.badgeText}>
                  {userPoints.toLocaleString()}
                </Text>
              </View>
            </LinearGradient>
            <LinearGradient
              colors={["#8b5cf6", "#6d28d9"]}
              style={[styles.badge, styles.vipBadge]}
            >
              <View style={styles.badgeContent}>
                <Ionicons name="diamond" size={24} color="white" />
                <Text style={styles.badgeText}>
                  VIP {vipLevel}
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>
      </LinearGradient>

      {/* Tab Navigation with Game-like Design */}
      <View style={styles.tabNavigation}>
        <View style={styles.tabContainer}>
          <TabButton
            title="Daily"
            icon="calendar"
            isActive={selectedTab === "daily"}
            onPress={() => setSelectedTab("daily")}
            gradientColors={["#3b82f6", "#60a5fa"]}
          />
          <TabButton
            title="Battle Pass"
            icon="trophy"
            isActive={selectedTab === "battle"}
            onPress={() => setSelectedTab("battle")}
            gradientColors={["#8b5cf6", "#a78bfa"]}
          />
          <TabButton
            title="Lucky Spin"
            icon="gift"
            isActive={selectedTab === "spin"}
            onPress={() => setSelectedTab("spin")}
            gradientColors={["#eab308", "#facc15"]}
          />
        </View>
      </View>

      {/* Content based on selected tab */}
      <View style={styles.content}>
        {selectedTab === "daily" && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Daily Rewards
              </Text>
              <View style={styles.dayBadge}>
                <Text style={styles.dayBadgeText}>Day 3/7</Text>
              </View>
            </View>
            <View style={styles.rewardsGrid}>
              {dailyRewards.map(reward => (
                <TouchableOpacity
                  key={reward.id}
                  style={styles.rewardCard}
                  onPress={() => handleRedeem(reward)}
                >
                  <LinearGradient
                    colors={["#1a1a2e", "#16213e"]}
                    style={styles.rewardGradient}
                  >
                    <View
                      style={[
                        styles.rewardIcon,
                        {
                          backgroundColor: getRarityColor(reward.rarity),
                          borderColor:
                            reward.rarity === "legendary"
                              ? "#f59e0b"
                              : "transparent",
                        },
                      ]}
                    >
                      <Ionicons name={reward.icon} size={24} color="white" />
                    </View>
                    <Text style={styles.rewardTitle}>
                      {reward.title}
                    </Text>
                    <Text style={styles.rewardPoints}>
                      {reward.points} Points
                    </Text>
                    {reward.rarity === "legendary" && (
                      <View style={styles.legendaryBadge}>
                        <Ionicons name="flash" size={20} color="#f59e0b" />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {selectedTab === "battle" && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Battle Pass</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>
                  Level {battlePassLevel}
                </Text>
              </View>
            </View>
            {battlePassRewards.map(reward => (
              <View
                key={reward.id}
                style={styles.battlePassCard}
              >
                <View style={styles.battlePassContent}>
                  <View
                    style={[
                      styles.battlePassIcon,
                      {
                        backgroundColor: getRarityColor(reward.rarity),
                        borderColor:
                          reward.rarity === "legendary"
                            ? "#f59e0b"
                            : "transparent",
                      },
                    ]}
                  >
                    <Ionicons name={reward.icon} size={24} color="white" />
                  </View>
                  <View style={styles.battlePassInfo}>
                    <Text style={styles.battlePassTitle}>
                      {reward.title}
                    </Text>
                    <Text style={styles.battlePassPoints}>
                      {reward.points} points
                    </Text>
                  </View>
                  <View style={styles.progressBadge}>
                    <Text style={styles.progressText}>
                      {reward.progress}%
                    </Text>
                  </View>
                </View>
                <View style={styles.progressBarBackground}>
                  <LinearGradient
                    colors={["#3b82f6", "#60a5fa"]}
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${((reward.progress || 0) / (reward.maxProgress || 100)) * 100}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {selectedTab === "spin" && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Lucky Spin</Text>
              <View style={styles.spinBadge}>
                <Text style={styles.spinBadgeText}>
                  {spinCoins} Spins
                </Text>
              </View>
            </View>
            <View style={styles.spinContainer}>
              <Animated.View
                style={[
                  styles.spinWheel,
                  {
                    transform: [
                      {
                        rotate: spinAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "1440deg"],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.spinText}>
                  SPIN TO WIN!
                </Text>
              </Animated.View>
              <TouchableOpacity
                onPress={handleSpin}
                disabled={spinCoins === 0}
                style={{
                  opacity: spinCoins === 0 ? 0.5 : 1,
                }}
              >
                <LinearGradient
                  colors={["#eab308", "#facc15"]}
                  style={styles.spinButton}
                >
                  <Text style={styles.spinButtonText}>
                    {spinCoins === 0 ? "NO SPINS LEFT" : "SPIN NOW"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <Text style={styles.possibleRewardsTitle}>
              Possible Rewards
            </Text>
            <View style={styles.rewardsGrid}>
              {spinRewards.map(reward => (
                <View key={reward.id} style={styles.spinRewardCard}>
                  <LinearGradient
                    colors={["#1a1a2e", "#16213e"]}
                    style={styles.spinRewardGradient}
                  >
                    <View
                      style={[
                        styles.spinRewardIcon,
                        {
                          backgroundColor: getRarityColor(reward.rarity),
                          borderColor:
                            reward.rarity === "legendary"
                              ? "#f59e0b"
                              : "transparent",
                        },
                      ]}
                    >
                      <Ionicons name={reward.icon} size={24} color="white" />
                    </View>
                    <Text style={styles.spinRewardTitle}>
                      {reward.title}
                    </Text>
                  </LinearGradient>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Won Reward Animation */}
      {showRewardAnimation && wonReward && (
        <Modal visible={showRewardAnimation} transparent animationType="fade">
          <View style={styles.wonRewardOverlay}>
            <View style={styles.wonRewardCard}>
              <View
                style={[
                  styles.wonRewardIcon,
                  {
                    backgroundColor: getRarityColor(wonReward.rarity),
                    borderColor:
                      wonReward.rarity === "legendary"
                        ? "#f59e0b"
                        : "transparent",
                  },
                ]}
              >
                <Ionicons name={wonReward.icon} size={32} color="white" />
              </View>
              <Text style={styles.congratsText}>
                Congratulations!
              </Text>
              <Text style={styles.wonRewardText}>
                You won {wonReward.title}!
              </Text>
            </View>
          </View>
        </Modal>
      )}

      {/* Redeem Modal with Game-like Design */}
      <Modal
        visible={showRedeemModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRedeemModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Redeem Reward
            </Text>
            {selectedReward && (
              <>
                <View style={styles.modalRewardInfo}>
                  <View
                    style={[
                      styles.modalRewardIcon,
                      {
                        backgroundColor: selectedReward.color,
                        borderColor:
                          selectedReward.rarity === "legendary"
                            ? "#f59e0b"
                            : "transparent",
                      },
                    ]}
                  >
                    <Ionicons
                      name={selectedReward.icon}
                      size={32}
                      color="white"
                    />
                  </View>
                  <Text style={styles.modalRewardTitle}>
                    {selectedReward.title}
                  </Text>
                  <Text style={styles.modalRewardPoints}>
                    +{selectedReward.points} Points
                  </Text>
                  {selectedReward.description && (
                    <Text style={styles.modalRewardDescription}>
                      {selectedReward.description}
                    </Text>
                  )}
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowRedeemModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={confirmRedeem}
                    style={styles.confirmButtonContainer}
                  >
                    <LinearGradient
                      colors={["#3b82f6", "#60a5fa"]}
                      style={styles.confirmButton}
                    >
                      <Text style={styles.confirmButtonText}>
                        Confirm
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  badge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
    borderWidth: 2,
  },
  pointsBadge: {
    borderColor: '#facc15',
  },
  vipBadge: {
    borderColor: '#a78bfa',
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tabNavigation: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  tabContainer: {
    backgroundColor: '#1e293b',
    padding: 4,
    borderRadius: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#334155',
  },
  tabButtonContainer: {
    flex: 1,
  },
  activeTabGradient: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  activeTabText: {
    marginLeft: 8,
    fontWeight: '600',
    color: '#ffffff',
  },
  inactiveTabButton: {
    flex: 1,
    paddingVertical: 12,
  },
  inactiveTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveTabText: {
    marginLeft: 8,
    fontWeight: '600',
    color: '#9ca3af',
  },
  content: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dayBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  dayBadgeText: {
    color: '#60a5fa',
    fontWeight: 'bold',
  },
  levelBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#8b5cf6',
  },
  levelBadgeText: {
    color: '#a78bfa',
    fontWeight: 'bold',
  },
  spinBadge: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#eab308',
  },
  spinBadgeText: {
    color: '#facc15',
    fontWeight: 'bold',
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  rewardCard: {
    width: '30%',
    marginBottom: 16,
  },
  rewardGradient: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  rewardIcon: {
    padding: 12,
    borderRadius: 9999,
    marginBottom: 8,
    borderWidth: 2,
  },
  rewardTitle: {
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
  rewardPoints: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
  },
  legendaryBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  battlePassCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  battlePassContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  battlePassIcon: {
    padding: 12,
    borderRadius: 9999,
    marginRight: 16,
    borderWidth: 2,
  },
  battlePassInfo: {
    flex: 1,
  },
  battlePassTitle: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  battlePassPoints: {
    color: '#9ca3af',
    fontSize: 14,
  },
  progressBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  progressText: {
    color: '#4ade80',
    fontWeight: 'bold',
    fontSize: 14,
  },
  progressBarBackground: {
    backgroundColor: '#334155',
    borderRadius: 9999,
    height: 8,
    marginTop: 12,
  },
  progressBarFill: {
    borderRadius: 9999,
    height: 8,
  },
  spinContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  spinWheel: {
    width: 256,
    height: 256,
    borderRadius: 128,
    borderWidth: 4,
    borderColor: '#eab308',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  spinText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  spinButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: '#facc15',
  },
  spinButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  possibleRewardsTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  spinRewardCard: {
    width: '30%',
    marginBottom: 16,
  },
  spinRewardGradient: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  spinRewardIcon: {
    padding: 12,
    borderRadius: 9999,
    marginBottom: 8,
    borderWidth: 2,
  },
  spinRewardTitle: {
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
  wonRewardOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  wonRewardCard: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#eab308',
  },
  wonRewardIcon: {
    padding: 16,
    borderRadius: 9999,
    marginBottom: 16,
    borderWidth: 2,
  },
  congratsText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  wonRewardText: {
    color: '#facc15',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 24,
    width: '80%',
    borderWidth: 2,
    borderColor: '#334155',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalRewardInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalRewardIcon: {
    padding: 16,
    borderRadius: 9999,
    marginBottom: 8,
    borderWidth: 2,
  },
  modalRewardTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalRewardPoints: {
    color: '#facc15',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  modalRewardDescription: {
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#475569',
  },
  cancelButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
  },
  confirmButtonContainer: {
    flex: 1,
    marginLeft: 8,
  },
  confirmButton: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#60a5fa',
  },
  confirmButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 32,
  },
});