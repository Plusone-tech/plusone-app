import CText from "@/components/CText";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyPolicy() {
  const router = useRouter();

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
          <CText style={styles.headerTitle}>Privacy Policy</CText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <CText style={styles.lastUpdated}>
            Last updated: November 9, 2025
          </CText>

          <View style={styles.section}>
            <CText style={styles.sectionTitle}>1. Information We Collect</CText>
            <CText style={styles.paragraph}>
              We collect information that you provide directly to us, including:
            </CText>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <CText style={styles.bullet}>•</CText>
                <CText style={styles.bulletText}>
                  Name, email address, and phone number
                </CText>
              </View>
              <View style={styles.bulletItem}>
                <CText style={styles.bullet}>•</CText>
                <CText style={styles.bulletText}>
                  Profile information and photos
                </CText>
              </View>
              <View style={styles.bulletItem}>
                <CText style={styles.bullet}>•</CText>
                <CText style={styles.bulletText}>
                  Event details and preferences
                </CText>
              </View>
              <View style={styles.bulletItem}>
                <CText style={styles.bullet}>•</CText>
                <CText style={styles.bulletText}>
                  Location data (with your permission)
                </CText>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <CText style={styles.sectionTitle}>
              2. How We Use Your Information
            </CText>
            <CText style={styles.paragraph}>
              We use the information we collect to:
            </CText>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <CText style={styles.bullet}>•</CText>
                <CText style={styles.bulletText}>
                  Provide and improve our services
                </CText>
              </View>
              <View style={styles.bulletItem}>
                <CText style={styles.bullet}>•</CText>
                <CText style={styles.bulletText}>
                  Connect you with events and other users
                </CText>
              </View>
              <View style={styles.bulletItem}>
                <CText style={styles.bullet}>•</CText>
                <CText style={styles.bulletText}>
                  Send you updates and notifications
                </CText>
              </View>
              <View style={styles.bulletItem}>
                <CText style={styles.bullet}>•</CText>
                <CText style={styles.bulletText}>
                  Personalize your experience
                </CText>
              </View>
              <View style={styles.bulletItem}>
                <CText style={styles.bullet}>•</CText>
                <CText style={styles.bulletText}>
                  Ensure safety and security
                </CText>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <CText style={styles.sectionTitle}>3. Information Sharing</CText>
            <CText style={styles.paragraph}>
              We do not sell your personal information. We may share your
              information with:
            </CText>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <CText style={styles.bullet}>•</CText>
                <CText style={styles.bulletText}>
                  Other users as necessary for the service (e.g., event
                  attendees)
                </CText>
              </View>
              <View style={styles.bulletItem}>
                <CText style={styles.bullet}>•</CText>
                <CText style={styles.bulletText}>
                  Service providers who assist in operating our platform
                </CText>
              </View>
              <View style={styles.bulletItem}>
                <CText style={styles.bullet}>•</CText>
                <CText style={styles.bulletText}>
                  Law enforcement when required by law
                </CText>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <CText style={styles.sectionTitle}>4. Data Security</CText>
            <CText style={styles.paragraph}>
              We implement appropriate security measures to protect your
              personal information. However, no method of transmission over the
              internet is 100% secure, and we cannot guarantee absolute
              security.
            </CText>
          </View>

          <View style={styles.section}>
            <CText style={styles.sectionTitle}>5. Your Privacy Rights</CText>
            <CText style={styles.paragraph}>You have the right to:</CText>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <CText style={styles.bullet}>•</CText>
                <CText style={styles.bulletText}>
                  Access and update your personal information
                </CText>
              </View>
              <View style={styles.bulletItem}>
                <CText style={styles.bullet}>•</CText>
                <CText style={styles.bulletText}>
                  Delete your account and data
                </CText>
              </View>
              <View style={styles.bulletItem}>
                <CText style={styles.bullet}>•</CText>
                <CText style={styles.bulletText}>
                  Opt out of marketing communications
                </CText>
              </View>
              <View style={styles.bulletItem}>
                <CText style={styles.bullet}>•</CText>
                <CText style={styles.bulletText}>
                  Control location services and other permissions
                </CText>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <CText style={styles.sectionTitle}>6. Cookies and Tracking</CText>
            <CText style={styles.paragraph}>
              We use cookies and similar tracking technologies to improve your
              experience, analyze usage, and personalize content. You can
              control cookies through your device settings.
            </CText>
          </View>

          <View style={styles.section}>
            <CText style={styles.sectionTitle}>
              7. Children&apos;s Privacy
            </CText>
            <CText style={styles.paragraph}>
              PlusOne is not intended for users under 18 years of age. We do not
              knowingly collect personal information from children under 18.
            </CText>
          </View>

          <View style={styles.section}>
            <CText style={styles.sectionTitle}>
              8. Changes to Privacy Policy
            </CText>
            <CText style={styles.paragraph}>
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new policy on this page
              and updating the &quot;Last updated&quot; date.
            </CText>
          </View>

          <View style={styles.section}>
            <CText style={styles.sectionTitle}>9. Contact Us</CText>
            <CText style={styles.paragraph}>
              If you have questions about this Privacy Policy, please contact us
              at:
            </CText>
            <CText style={styles.contactInfo}>Email: privacy@plusone.com</CText>
            <CText style={styles.contactInfo}>Phone: +91 1234567890</CText>
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
  lastUpdated: {
    fontSize: 13,
    color: "#999",
    marginTop: 10,
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3D1A66",
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    marginBottom: 10,
  },
  bulletList: {
    marginTop: 8,
    gap: 8,
  },
  bulletItem: {
    flexDirection: "row",
    gap: 8,
  },
  bullet: {
    fontSize: 14,
    color: "#3D1A66",
    fontWeight: "700",
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
  },
  contactInfo: {
    fontSize: 14,
    color: "#3D1A66",
    fontWeight: "600",
    marginBottom: 5,
  },
});
