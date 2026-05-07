import CText from "@/components/CText";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HelpSupport() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleContactSupport = () => {
    Alert.alert("Contact Support", "Choose your preferred method:", [
      {
        text: "Email",
        onPress: () => Linking.openURL("mailto:support@plusone.com"),
      },
      { text: "Phone", onPress: () => Linking.openURL("tel:+911234567890") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const faqs = [
    {
      question: "How do I create an event?",
      answer:
        "Tap the '+' button on the home screen, fill in event details, and publish!",
    },
    {
      question: "How can I join an event?",
      answer:
        "Browse events, tap on one you like, and click the 'Join Event' button.",
    },
    {
      question: "Can I invite friends to events?",
      answer:
        "Yes! Share the event link or use the invite feature in the event details.",
    },
    {
      question: "How do I report inappropriate content?",
      answer: "Tap the three dots on any event or profile and select 'Report'.",
    },
    {
      question: "How can I delete my account?",
      answer: "Go to Profile > Privacy & Security > Delete Account.",
    },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#3D1A66" />
          </TouchableOpacity>
          <CText style={styles.headerTitle}>Help & Support</CText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for help..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleContactSupport}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="mail-outline" size={28} color="#3D1A66" />
              </View>
              <CText style={styles.actionText}>Contact Us</CText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={28}
                  color="#3D1A66"
                />
              </View>
              <CText style={styles.actionText}>Live Chat</CText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIcon}>
                <Ionicons name="book-outline" size={28} color="#3D1A66" />
              </View>
              <CText style={styles.actionText}>Guide</CText>
            </TouchableOpacity>
          </View>

          {/* FAQs */}
          <View style={styles.section}>
            <CText style={styles.sectionTitle}>
              Frequently Asked Questions
            </CText>
            {faqs.map((faq, index) => (
              <View key={index} style={styles.faqItem}>
                <View style={styles.faqQuestion}>
                  <Ionicons
                    name="help-circle-outline"
                    size={20}
                    color="#3D1A66"
                  />
                  <CText style={styles.faqQuestionText}>{faq.question}</CText>
                </View>
                <CText style={styles.faqAnswer}>{faq.answer}</CText>
              </View>
            ))}
          </View>

          {/* Contact Info */}
          <View style={styles.contactCard}>
            <CText style={styles.contactTitle}>Still need help?</CText>
            <CText style={styles.contactText}>
              Our support team is available 24/7 to assist you
            </CText>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleContactSupport}
            >
              <CText style={styles.contactButtonText}>Contact Support</CText>
            </TouchableOpacity>
          </View>

          <View style={{ height: 150 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE4F6",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3D1A66",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  quickActions: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 30,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    gap: 10,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F8F5FF",
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3D1A66",
    marginBottom: 15,
  },
  faqItem: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  faqQuestion: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  faqAnswer: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginLeft: 30,
  },
  contactCard: {
    backgroundColor: "#3D1A66",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginBottom: 15,
  },
  contactButton: {
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3D1A66",
  },
});
