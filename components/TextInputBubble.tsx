import CText from "@/components/CText";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  KeyboardTypeOptions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface TextInputBubbleProps {
  visible: boolean;
  label: string;
  value: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

export default function TextInputBubble({
  visible,
  label,
  value,
  onConfirm,
  onCancel,
  placeholder = "",
  multiline = false,
  keyboardType,
  maxLength,
  secureTextEntry = false,
  autoCapitalize,
}: TextInputBubbleProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showPassword, setShowPassword] = useState(false);
  const [kbHeight, setKbHeight] = useState(0);
  const inputRef = useRef<TextInput>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  // Sync when value prop changes or modal opens
  useEffect(() => {
    if (visible) {
      setInputValue(value);
      setShowPassword(false);
    }
  }, [value, visible]);

  // Track keyboard height on both platforms
  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKbHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKbHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Animate in and focus input immediately
  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      slideAnim.setValue(300);

      // Focus immediately so keyboard starts opening at the same time as the animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }),
      ]).start();
    }
  }, [visible]);

  const animateOut = (callback: () => void) => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => callback());
  };

  const handleConfirm = () => {
    animateOut(() => onConfirm(inputValue));
  };

  const handleCancel = () => {
    animateOut(() => onCancel());
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      statusBarTranslucent
      animationType="none"
    >
      <View style={styles.overlay}>
        {/* Dark backdrop */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.backdrop,
            { opacity: fadeAnim },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={handleCancel} />
        </Animated.View>

        {/* Dialog — positioned above keyboard via marginBottom */}
        <Animated.View
          style={[
            styles.dialog,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              marginBottom: kbHeight,
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.editIcon}>
                  <Ionicons name="create" size={18} color="#3D1A66" />
                </View>
                <CText
                  weight="semibold"
                  fontSize={18}
                  style={styles.headerTitle}
                >
                  {label}
                </CText>
              </View>
              <TouchableOpacity
                onPress={handleCancel}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Current value preview */}
            {value ? (
              <View style={styles.previewContainer}>
                <CText
                  weight="regular"
                  fontSize={13}
                  style={styles.previewLabel}
                >
                  Current value
                </CText>
                <CText
                  weight="medium"
                  fontSize={14}
                  style={styles.previewText}
                  numberOfLines={1}
                >
                  {secureTextEntry ? "••••••••" : value}
                </CText>
              </View>
            ) : null}

            {/* Input */}
            <View
              style={[
                styles.inputContainer,
                multiline && styles.inputContainerMultiline,
              ]}
            >
              <TextInput
                ref={inputRef}
                style={[styles.input, multiline && styles.inputMultiline]}
                value={inputValue}
                onChangeText={setInputValue}
                placeholder={placeholder}
                placeholderTextColor="#999"
                multiline={multiline}
                numberOfLines={multiline ? 4 : 1}
                textAlignVertical={multiline ? "top" : "center"}
                keyboardType={keyboardType}
                maxLength={maxLength}
                secureTextEntry={secureTextEntry && !showPassword}
                autoCapitalize={autoCapitalize}
                selectionColor="#3D1A66"
              />
              {secureTextEntry && (
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Confirm button */}
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Ionicons
                name="checkmark-circle"
                size={20}
                color="#000"
                style={{ marginRight: 8 }}
              />
              <CText weight="medium" fontSize={16} style={styles.confirmText}>
                Confirm
              </CText>
            </TouchableOpacity>
          </Animated.View>
        </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  dialog: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 54,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  editIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F3EAFF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#1a1a1a",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  previewContainer: {
    backgroundColor: "#F8F4FF",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8D5FF",
  },
  previewLabel: {
    color: "#999",
    marginBottom: 2,
  },
  previewText: {
    color: "#3D1A66",
  },
  inputContainer: {
    backgroundColor: "#F8F6FA",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(61, 26, 102, 0.12)",
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
  },
  inputContainerMultiline: {
    minHeight: 120,
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    fontFamily: "fontMainRegular",
    paddingVertical: 12,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: "top",
    paddingTop: 0,
  },
  eyeButton: {
    padding: 8,
    marginLeft: 4,
  },
  confirmButton: {
    width: "100%",
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderBottomWidth: 4,
    borderColor: "black",
    flexDirection: "row",
  },
  confirmText: {
    color: "#000",
  },
});
