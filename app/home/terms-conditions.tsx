import CText from "@/components/CText";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsConditions() {
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
          <CText style={styles.headerTitle}>Terms & Conditions</CText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <CText style={styles.lastUpdated}>
            Last updated: November 9, 2025
          </CText>

          <View style={styles.section}>
            <CText style={styles.sectionTitle}>1. Acceptance of Terms</CText>
            <CText style={styles.paragraph}>
              By accessing and using PlusOne, you accept and agree to be bound
              by the terms and provision of this agreement. If you do not agree
              to these terms, please do not use our service.
            </CText>
          </View>

          <View style={styles.section}>
            <CText style={styles.sectionTitle}>2. User Accounts</CText>
            <CText style={styles.paragraph}>
              You are responsible for maintaining the confidentiality of your
              account and password. You agree to accept responsibility for all
              activities that occur under your account.
            </CText>
            <CText style={styles.paragraph}>
              You must provide accurate and complete information when creating
              an account and keep this information up to date.
            </CText>
          </View>

          <View style={styles.section}>
            <CText style={styles.sectionTitle}>3. User Conduct</CText>
            <CText style={styles.paragraph}>You agree not to:</CText>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <CText style={styles.bullet}>•</CText>
                <CText style={styles.bulletText}>
                  Post offensive, harmful, or inappropriate content
                </CText>
              </View>
              <View style={styles.bulletItem}>
                <CText style={styles.bullet}>•</CText>
                <CText style={styles.bulletText}>
                  Harass, abuse, or harm other users
                </CText>
              </View>
              <View style={styles.bulletItem}>
                <CText style={styles.bullet}>•</CText>
                <CText style={styles.bulletText}>
                  Impersonate others or misrepresent your identity
                </CText>
              </View>
              <View style={styles.bulletItem}>
                <CText style={styles.bullet}>•</CText>
                <CText style={styles.bulletText}>
                  Violate any applicable laws or regulations
                </CText>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <CText style={styles.sectionTitle}>4. Events and Meetings</CText>
            <CText style={styles.paragraph}>
              PlusOne is a platform for organizing and discovering social
              events. Users are responsible for their own safety when attending
              events. We recommend meeting in public places and taking
              appropriate safety precautions.
            </CText>
          </View>

          <View style={styles.section}>
            <CText style={styles.sectionTitle}>5. Content Ownership</CText>
            <CText style={styles.paragraph}>
              You retain ownership of any content you post on PlusOne. By
              posting content, you grant us a license to use, modify, and
              display that content in connection with operating the service.
            </CText>
          </View>

          <View style={styles.section}>
            <CText style={styles.sectionTitle}>6. Termination</CText>
            <CText style={styles.paragraph}>
              We reserve the right to terminate or suspend your account at any
              time for violation of these terms or for any other reason at our
              discretion.
            </CText>
          </View>

          <View style={styles.section}>
            <CText style={styles.sectionTitle}>7. Disclaimer</CText>
            <CText style={styles.paragraph}>
              PlusOne is provided &quot;as is&quot; without warranties of any
              kind. We do not guarantee the accuracy, completeness, or
              reliability of any content or information on the platform.
            </CText>
          </View>

          <View style={styles.section}>
            <CText style={styles.sectionTitle}>8. Changes to Terms</CText>
            <CText style={styles.paragraph}>
              We reserve the right to modify these terms at any time. Continued
              use of the service after changes constitutes acceptance of the
              modified terms.
            </CText>
          </View>

          <View style={styles.section}>
            <CText style={styles.sectionTitle}>9. Contact Us</CText>
            <CText style={styles.paragraph}>
              If you have any questions about these Terms & Conditions, please
              contact us at support@plusone.com
            </CText>
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
});
