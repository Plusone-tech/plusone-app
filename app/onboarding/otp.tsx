import CText from "@/components/CText";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native";

export default function OTP() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      // Focus next input logic would go here
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      // Verify OTP logic
      router.push("/onboarding/profile-setup" as any);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/grid-fill-warp.svg")}
        style={{
          ...StyleSheet.absoluteFillObject,
          opacity: 0.5,
          transform: [{ scale: 1.2 }],
        }}
        contentFit="cover"
      />
      <View
        style={{
          width: "100%",
          paddingHorizontal: 25,
          marginTop: 60,
          paddingBottom: 0,
          gap: 10,
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            alignSelf: "flex-start",
            borderRadius: 999,
            padding: 10,
            gap: 10,
          }}
        >
          <Ionicons name="chevron-back-outline" size={20} color="#3D1A66" />
        </View>
        <CText
          fontSize={48}
          weight="semibold"
          style={{
            alignSelf: "flex-start",
            lineHeight: 48,
          }}
        >
          Verify Your {"\n"}Number
        </CText>
      </View>
      <View style={styles.whiteViewContainer}>
        <View style={styles.whiteViewContent}>
          <View
            style={{
              width: "100%",
              alignItems: "center",
              paddingTop: 15,
              marginBottom: 20,
            }}
          >
            <CText fontSize={24} weight="semibold" letterSpacing="-0.06">
              Enter OTP
            </CText>
            <CText fontSize={14} style={{ color: "#666", marginTop: 8 }}>
              We&apos;ve sent a code to your phone
            </CText>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                style={styles.otpInput}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                keyboardType="number-pad"
                maxLength={1}
              />
            ))}
          </View>

          <Pressable style={styles.buttonContainer} onPress={handleVerify} disabled={isVerifying}>
            {isVerifying ? (
              <ActivityIndicator size="small" color="#3D1A66" />
            ) : (
              <CText>Verify</CText>
            )}
          </Pressable>

          <Pressable style={{ marginTop: 15 }}>
            <CText fontSize={14} style={{ color: "#666" }}>
              Didn&apos;t receive code?{" "}
              <CText style={{ color: "#000", fontWeight: "600" }}>Resend</CText>
            </CText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE4F6",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 20,
  },
  whiteViewContainer: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
  },
  whiteViewContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  otpContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 50,
    height: 56,
    borderWidth: 1,
    borderColor: "#000",
    borderBottomWidth: 2,
    borderRadius: 12,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
    backgroundColor: "#FFFFFF",
  },
  buttonContainer: {
    width: "100%",
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderBottomWidth: 4,
    borderColor: "black",
    overflow: "hidden",
  },
});
