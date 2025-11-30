import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  FlashcardActivity,
  MCQActivity,
  PollActivity,
  QuizActivity,
} from "../../components/feed-activities";
import { FeedPost, FeedService } from "../../lib/feedService";

type SubjectColors = {
  [key: string]: [string, string];
};

export default function FeedScreen() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  // Comments dialog state
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  // Load feed posts from Supabase
  const loadFeedPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await FeedService.getFeedPosts();

      if (error) {
        console.error("Error loading feed posts:", error);
        Alert.alert("Error", "Failed to load feed posts");
        return;
      }

      setPosts(data || []);

      // Mark posts as viewed (non-blocking)
      if (data && data.length > 0) {
        data.slice(0, 5).forEach((post) => {
          FeedService.markPostViewed(post.id).catch((err) =>
            console.log("Failed to mark post viewed:", err)
          );
        });
      }
    } catch (error) {
      console.error("Error loading feed posts:", error);
      Alert.alert("Error", "Failed to load feed posts");
    } finally {
      setLoading(false);
    }
  };

  // Refresh feed posts
  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeedPosts();
    setRefreshing(false);
  };

  // Handle like/unlike post
  const handleLike = async (postId: string): Promise<void> => {
    try {
      const isLiked = likedPosts.has(postId);

      // Optimistically update UI
      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: isLiked ? post.likes - 1 : post.likes + 1,
              }
            : post
        )
      );

      // Update in database
      const { error } = isLiked
        ? await FeedService.unlikePost(postId)
        : await FeedService.likePost(postId);

      if (error) {
        console.error("Error updating like:", error);
        // Revert optimistic update
        setLikedPosts((prev) => {
          const newSet = new Set(prev);
          if (isLiked) {
            newSet.add(postId);
          } else {
            newSet.delete(postId);
          }
          return newSet;
        });
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likes: isLiked ? post.likes + 1 : post.likes - 1,
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  // Load posts on component mount
  useEffect(() => {
    loadFeedPosts();
  }, []);

  // Set up real-time subscription for feed updates
  useEffect(() => {
    const subscription = FeedService.subscribeToFeedUpdates((payload) => {
      console.log("Real-time feed update:", payload);

      if (payload.eventType === "INSERT") {
        // New post added
        setPosts((prevPosts) => [payload.new, ...prevPosts]);
      } else if (payload.eventType === "UPDATE") {
        // Post updated (like count, etc.)
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === payload.new.id ? payload.new : post
          )
        );
      } else if (payload.eventType === "DELETE") {
        // Post deleted
        setPosts((prevPosts) =>
          prevPosts.filter((post) => post.id !== payload.old.id)
        );
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const subjectColors: SubjectColors = FeedService.getSubjectColors();

  const getPostTypeIcon = (
    type: FeedPost["type"]
  ): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case "achievement":
        return "trophy";
      case "question":
        return "help-circle";
      case "milestone":
        return "flag";
      case "tip":
        return "bulb";
      case "quiz_pack":
        return "library";
      case "lesson_pack":
        return "school";
      default:
        return "star";
    }
  };

  const handleImportPack = async (post: FeedPost) => {
    try {
      const result = await FeedService.importMCQPack(post.id);
      if (result.success) {
        Alert.alert(
          "Success",
          result.message || "Quiz pack imported successfully!"
        );
        // Refresh the feed to show updated pack status
        loadFeedPosts();
      } else {
        Alert.alert(
          result.error === "Already imported" ? "Already Imported" : "Error",
          result.message || "Failed to import quiz pack"
        );
      }
    } catch (error) {
      console.error("Error importing pack:", error);
      Alert.alert("Error", "Failed to import quiz pack");
    }
  };

  // Handle opening comments dialog
  const handleOpenComments = async (postId: string) => {
    setSelectedPostId(postId);
    setCommentsModalVisible(true);
    setLoadingComments(true);

    try {
      const { data, error } = await FeedService.getComments(postId);
      if (error) {
        console.error("Error loading comments:", error);
        Alert.alert("Error", "Failed to load comments");
      } else {
        setComments(data || []);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
      Alert.alert("Error", "Failed to load comments");
    } finally {
      setLoadingComments(false);
    }
  };

  // Handle adding a new comment
  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPostId) return;

    try {
      const { data, error } = await FeedService.createComment(
        selectedPostId,
        newComment.trim()
      );
      if (error) {
        console.error("Error creating comment:", error);
        Alert.alert("Error", "Failed to add comment");
      } else {
        // Add the new comment to the list
        setComments((prev) => [...prev, data]);
        setNewComment("");

        // Update the post's comment count
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === selectedPostId
              ? { ...post, comments: post.comments + 1 }
              : post
          )
        );
      }
    } catch (error) {
      console.error("Error creating comment:", error);
      Alert.alert("Error", "Failed to add comment");
    }
  };

  // Handle closing comments dialog
  const handleCloseComments = () => {
    setCommentsModalVisible(false);
    setSelectedPostId(null);
    setComments([]);
    setNewComment("");
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient colors={["#0f0f23", "#1a1a2e"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Study Feed</Text>
            <Text style={styles.headerSubtitle}>
              Connect with fellow students
            </Text>
          </View>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color="#00d4ff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading feed posts...</Text>
        </View>
      )}

      {/* Posts */}
      <View style={styles.postsContainer}>
        {!loading && posts.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>
              Be the first to share your study progress!
            </Text>
          </View>
        )}

        {posts.map((post) => (
          <View key={post.id} style={styles.postCard}>
            {/* User Info */}
            <View style={styles.postHeader}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={["#3b82f6", "#9333ea"]}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>
                    {post.users.name.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
              </View>
              <View style={styles.userInfo}>
                <View style={styles.userNameRow}>
                  <Text style={styles.userName}>{post.users.name}</Text>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>{post.users.level}</Text>
                  </View>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>{post.users.rank}</Text>
                  </View>
                </View>
                <View style={styles.userStatsRow}>
                  <Text style={styles.userStats}>
                    {post.users.points} points
                  </Text>
                  <Text style={styles.userStatsSeparator}>•</Text>
                  <View style={styles.streakContainer}>
                    <Ionicons name="flame" size={14} color="#FF6B6B" />
                    <Text style={styles.streakText}>
                      {post.users.streak} days
                    </Text>
                  </View>
                  <Text style={styles.userStatsSeparator}>•</Text>
                  <Text style={styles.timeAgo}>
                    {FeedService.formatTimeAgo(post.created_at)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Subject & Achievement */}
            <View style={styles.badgesRow}>
              <LinearGradient
                colors={subjectColors[post.subject] || ["#6b7280", "#4b5563"]}
                style={styles.subjectBadge}
              >
                <Text style={styles.subjectText}>{post.subject}</Text>
              </LinearGradient>
              <View style={styles.achievementBadge}>
                <Text style={styles.achievementText}>{post.achievement}</Text>
              </View>
              {post.points_earned > 0 && (
                <View style={styles.xpBadge}>
                  <Text style={styles.xpText}>+{post.points_earned} XP</Text>
                </View>
              )}
            </View>

            {/* Content */}
            <Text style={styles.postContent}>{post.content}</Text>

            {/* Interactive Activities */}
            {post.activity_type === "poll" && post.activity_data && (
              <PollActivity
                postId={post.id}
                question={post.activity_data.question}
                options={post.activity_data.options}
                allowMultiple={post.activity_data.allow_multiple}
              />
            )}

            {post.activity_type === "quiz" && post.activity_data && (
              <QuizActivity
                postId={post.id}
                title={post.activity_data.title}
                questions={post.activity_data.questions}
              />
            )}

            {post.activity_type === "mcq_single" && post.activity_data && (
              <MCQActivity
                postId={post.id}
                question={post.activity_data.question}
                options={post.activity_data.options}
                correctAnswer={post.activity_data.correct_answer}
                explanation={post.activity_data.explanation}
              />
            )}

            {(post.activity_type === "flashcard" ||
              post.activity_type === "flashcard_deck") &&
              post.activity_data && (
                <FlashcardActivity
                  postId={post.id}
                  title={post.activity_data.title || "Flashcards"}
                  cards={post.activity_data.cards}
                />
              )}

            {/* Media */}
            {post.media_url && post.activity_type !== "video_quiz" && (
              <Image
                source={{ uri: post.media_url }}
                style={styles.postImage}
                resizeMode="cover"
              />
            )}

            {/* Import Button for Educational Packs */}
            {(post.type === "quiz_pack" || post.type === "lesson_pack") && (
              <View style={styles.packContainer}>
                {post.pack_data?.imported ? (
                  <View style={styles.importedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#10b981"
                    />
                    <Text style={styles.importedText}>
                      {post.type === "quiz_pack"
                        ? "Quiz Pack Imported"
                        : "Lesson Pack Imported"}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.importButton}
                    onPress={() => handleImportPack(post)}
                  >
                    <Ionicons name="download" size={20} color="white" />
                    <Text style={styles.importButtonText}>
                      {post.type === "quiz_pack"
                        ? "Import Quiz Pack"
                        : "Import Lesson Pack"}
                    </Text>
                  </TouchableOpacity>
                )}
                {post.pack_data && (
                  <View style={styles.packInfo}>
                    <Text style={styles.packInfoText}>
                      📚 {post.pack_data.question_count || 0} questions •{" "}
                      {post.pack_data.difficulty || "Medium"} level
                      {post.pack_data?.imported && (
                        <Text style={styles.packInfoImported}>
                          {" "}
                          • Added to {post.subject}
                        </Text>
                      )}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleLike(post.id)}
              >
                <Ionicons
                  name={likedPosts.has(post.id) ? "heart" : "heart-outline"}
                  size={20}
                  color={likedPosts.has(post.id) ? "#ef4444" : "#6b7280"}
                />
                <Text
                  style={[
                    styles.actionText,
                    likedPosts.has(post.id) && styles.actionTextLiked,
                  ]}
                >
                  {post.likes}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleOpenComments(post.id)}
              >
                <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
                <Text style={styles.actionText}>{post.comments}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={20} color="#6b7280" />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Ionicons
                  name={getPostTypeIcon(post.type)}
                  size={20}
                  color="#6b7280"
                />
                <Text style={styles.actionText}>
                  {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.bottomSpacer} />

      {/* Comments Modal */}
      <Modal
        visible={commentsModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCloseComments}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseComments}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <TouchableOpacity
                  onPress={handleCloseComments}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Comments List */}
            <ScrollView style={styles.commentsList}>
              {loadingComments ? (
                <View style={styles.loadingCommentsContainer}>
                  <Text style={styles.loadingCommentsText}>
                    Loading comments...
                  </Text>
                </View>
              ) : comments.length === 0 ? (
                <View style={styles.emptyCommentsContainer}>
                  <Text style={styles.emptyCommentsText}>No comments yet</Text>
                  <Text style={styles.emptyCommentsSubtext}>
                    Be the first to comment!
                  </Text>
                </View>
              ) : (
                <View style={styles.commentsContent}>
                  {comments.map((comment) => (
                    <View key={comment.id} style={styles.commentCard}>
                      {/* Comment User Info */}
                      <View style={styles.commentHeader}>
                        <View style={styles.commentAvatarContainer}>
                          <LinearGradient
                            colors={["#3b82f6", "#9333ea"]}
                            style={styles.commentAvatar}
                          >
                            <Text style={styles.commentAvatarText}>
                              {comment.users?.name?.charAt(0)?.toUpperCase() ||
                                "?"}
                            </Text>
                          </LinearGradient>
                        </View>
                        <View style={styles.commentUserInfo}>
                          <View style={styles.commentUserNameRow}>
                            <Text style={styles.commentUserName}>
                              {comment.users?.name || "Unknown User"}
                            </Text>
                            <View style={styles.commentLevelBadge}>
                              <Text style={styles.commentLevelText}>
                                {comment.users?.level || "Beginner"}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.commentTimeAgo}>
                            {FeedService.formatTimeAgo(comment.created_at)}
                          </Text>
                        </View>
                      </View>

                      {/* Comment Content */}
                      <Text style={styles.commentText}>{comment.content}</Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Comment Input */}
            <View style={styles.commentInputContainer}>
              <View style={styles.commentInputRow}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Write a comment..."
                  placeholderTextColor="#9ca3af"
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                  textAlignVertical="top"
                />
                <TouchableOpacity
                  onPress={handleAddComment}
                  disabled={!newComment.trim()}
                  style={[
                    styles.sendButton,
                    newComment.trim()
                      ? styles.sendButtonActive
                      : styles.sendButtonInactive,
                  ]}
                >
                  <Ionicons
                    name="send"
                    size={20}
                    color={newComment.trim() ? "white" : "#6b7280"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#9ca3af",
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 9999,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  loadingText: {
    color: "#9ca3af",
    fontSize: 18,
  },
  postsContainer: {
    paddingHorizontal: 24,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 18,
  },
  emptySubtext: {
    color: "#6b7280",
    fontSize: 14,
    marginTop: 8,
  },
  postCard: {
    backgroundColor: "#1e293b",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
  },
  avatar: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 18,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  levelBadge: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    marginLeft: 8,
  },
  levelText: {
    color: "#ffffff",
    fontSize: 12,
  },
  rankBadge: {
    backgroundColor: "rgba(234, 179, 8, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    marginLeft: 8,
  },
  rankText: {
    color: "#facc15",
    fontSize: 12,
  },
  userStatsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userStats: {
    color: "#9ca3af",
    fontSize: 14,
  },
  userStatsSeparator: {
    color: "#9ca3af",
    fontSize: 14,
    marginHorizontal: 8,
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  streakText: {
    color: "#f87171",
    fontSize: 14,
    marginLeft: 4,
  },
  timeAgo: {
    color: "#9ca3af",
    fontSize: 14,
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  subjectBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    marginRight: 8,
  },
  subjectText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  achievementBadge: {
    backgroundColor: "#eab308",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  achievementText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "bold",
  },
  xpBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    marginLeft: 8,
  },
  xpText: {
    color: "#4ade80",
    fontSize: 12,
    fontWeight: "bold",
  },
  postContent: {
    color: "#ffffff",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  postImage: {
    width: "100%",
    height: 192,
    borderRadius: 16,
    marginBottom: 16,
  },
  packContainer: {
    marginBottom: 16,
  },
  importedBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    padding: 12,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  importedText: {
    color: "#4ade80",
    fontWeight: "600",
    marginLeft: 8,
  },
  importButton: {
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  importButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    marginLeft: 8,
  },
  packInfo: {
    marginTop: 8,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    padding: 12,
    borderRadius: 12,
  },
  packInfoText: {
    color: "#60a5fa",
    fontSize: 14,
    textAlign: "center",
  },
  packInfoImported: {
    color: "#4ade80",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#9ca3af",
  },
  actionTextLiked: {
    color: "#f87171",
  },
  bottomSpacer: {
    height: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 64,
  },
  modalContent: {
    backgroundColor: "#0f172a",
    borderRadius: 24,
    width: "100%",
    maxWidth: 448,
    height: "90%",
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.5)",
  },
  modalHeader: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  closeButton: {
    backgroundColor: "rgba(51, 65, 85, 0.8)",
    padding: 8,
    borderRadius: 9999,
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  loadingCommentsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  loadingCommentsText: {
    color: "#9ca3af",
    fontSize: 18,
  },
  emptyCommentsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyCommentsText: {
    color: "#9ca3af",
    fontSize: 18,
  },
  emptyCommentsSubtext: {
    color: "#6b7280",
    fontSize: 14,
    marginTop: 8,
  },
  commentsContent: {
    paddingVertical: 16,
  },
  commentCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  commentAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  commentAvatar: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  commentAvatarText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  commentUserInfo: {
    flex: 1,
    marginLeft: 12,
  },
  commentUserNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentUserName: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  commentLevelBadge: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    marginLeft: 8,
  },
  commentLevelText: {
    color: "#ffffff",
    fontSize: 12,
  },
  commentTimeAgo: {
    color: "#9ca3af",
    fontSize: 12,
  },
  commentText: {
    color: "#ffffff",
    fontSize: 14,
    lineHeight: 20,
  },
  commentInputContainer: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(51, 65, 85, 0.5)",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#334155",
    color: "#ffffff",
    padding: 12,
    borderRadius: 16,
    marginRight: 12,
    maxHeight: 80,
  },
  sendButton: {
    padding: 12,
    borderRadius: 16,
  },
  sendButtonActive: {
    backgroundColor: "#3b82f6",
  },
  sendButtonInactive: {
    backgroundColor: "#475569",
  },
});
