import CText from "@/components/CText";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const LIST_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface CustomTimePickerProps {
  visible: boolean;
  value: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
}

// Generates an array of numbers from start to end (inclusive)
function range(start: number, end: number): number[] {
  const arr: number[] = [];
  for (let i = start; i <= end; i++) arr.push(i);
  return arr;
}

// ─── Scroll Column ──────────────────────────────────────────────────────────
interface ScrollColumnProps {
  data: (number | string)[];
  selectedValue: number | string;
  onValueChange: (value: number | string) => void;
  renderLabel: (value: number | string) => string;
}

function ScrollColumn({
  data,
  selectedValue,
  onValueChange,
  renderLabel,
}: ScrollColumnProps) {
  const flatListRef = useRef<FlatList>(null);
  const isUserScroll = useRef(true);

  // Pad the data so the first/last items can be centred
  const paddedData = [null, null, ...data, null, null];

  // Scroll to the selected value on mount / when selection changes externally
  useEffect(() => {
    const idx = data.indexOf(selectedValue);
    if (idx !== -1 && flatListRef.current) {
      isUserScroll.current = false;
      flatListRef.current.scrollToOffset({
        offset: idx * ITEM_HEIGHT,
        animated: false,
      });
      setTimeout(() => {
        isUserScroll.current = true;
      }, 100);
    }
  }, [selectedValue, data]);

  const handleMomentumScrollEnd = (e: any) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const idx = Math.round(offsetY / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(idx, data.length - 1));
    if (data[clamped] !== undefined && data[clamped] !== selectedValue) {
      onValueChange(data[clamped]);
    }
  };

  const getItemLayout = (_: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  return (
    <View style={columnStyles.wrapper}>
      {/* Highlight band for selected row */}
      <View style={columnStyles.highlight} pointerEvents="none" />
      <FlatList
        ref={flatListRef}
        data={paddedData}
        keyExtractor={(item, idx) => `${item}-${idx}`}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumScrollEnd}
        getItemLayout={getItemLayout}
        renderItem={({ item }) => {
          if (item === null) {
            return <View style={{ height: ITEM_HEIGHT }} />;
          }
          const isSelected = item === selectedValue;
          return (
            <View style={columnStyles.item}>
              <CText
                weight={isSelected ? "semibold" : "regular"}
                fontSize={isSelected ? 22 : 16}
                style={[
                  columnStyles.itemText,
                  isSelected
                    ? columnStyles.itemTextSelected
                    : columnStyles.itemTextDefault,
                ]}
              >
                {renderLabel(item)}
              </CText>
            </View>
          );
        }}
        style={{ height: LIST_HEIGHT }}
      />
    </View>
  );
}

const columnStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  highlight: {
    position: "absolute",
    top: ITEM_HEIGHT * 2,
    left: 4,
    right: 4,
    height: ITEM_HEIGHT,
    backgroundColor: "#F3EAFF",
    borderRadius: 12,
    zIndex: -1,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  itemText: {
    textAlign: "center",
  },
  itemTextSelected: {
    color: "#3D1A66",
  },
  itemTextDefault: {
    color: "#B0B0B0",
  },
});

// ─── Main Component ─────────────────────────────────────────────────────────
export default function CustomTimePicker({
  visible,
  value,
  onConfirm,
  onCancel,
}: CustomTimePickerProps) {
  // Convert 24h to 12h format
  const getHour12 = (date: Date) => {
    const h = date.getHours();
    return h === 0 ? 12 : h > 12 ? h - 12 : h;
  };
  const getPeriod = (date: Date): "AM" | "PM" => {
    return date.getHours() >= 12 ? "PM" : "AM";
  };

  const [selectedHour, setSelectedHour] = useState(getHour12(value));
  const [selectedMinute, setSelectedMinute] = useState(value.getMinutes());
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">(
    getPeriod(value)
  );

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  // Sync internal state when the prop value changes
  useEffect(() => {
    setSelectedHour(getHour12(value));
    setSelectedMinute(value.getMinutes());
    setSelectedPeriod(getPeriod(value));
  }, [value]);

  // Animate in
  useEffect(() => {
    if (visible) {
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

  // Data ranges
  const hours = range(1, 12);
  const minutes = range(0, 59);
  const periods: ("AM" | "PM")[] = ["AM", "PM"];

  const handleConfirm = () => {
    // Convert 12h back to 24h and build a full Date
    let hour24 = selectedHour;
    if (selectedPeriod === "AM") {
      hour24 = selectedHour === 12 ? 0 : selectedHour;
    } else {
      hour24 = selectedHour === 12 ? 12 : selectedHour + 12;
    }

    const result = new Date(value);
    result.setHours(hour24, selectedMinute, 0, 0);
    animateOut(() => onConfirm(result));
  };

  const handleCancel = () => {
    animateOut(() => onCancel());
  };

  // Format the preview time string — same format as native toLocaleTimeString
  const previewHour = selectedHour;
  const previewMinute = String(selectedMinute).padStart(2, "0");
  const previewString = `${previewHour}:${previewMinute} ${selectedPeriod}`;

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

        {/* Dialog */}
        <Animated.View
          style={[
            styles.dialog,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.clockIcon}>
                <Ionicons name="time" size={18} color="#3D1A66" />
              </View>
              <CText
                weight="semibold"
                fontSize={18}
                style={styles.headerTitle}
              >
                Select Time
              </CText>
            </View>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Preview */}
          <View style={styles.previewContainer}>
            <CText weight="medium" fontSize={15} style={styles.previewText}>
              {previewString}
            </CText>
          </View>

          {/* Column headers */}
          <View style={styles.columnHeaders}>
            <View style={styles.columnHeaderItem}>
              <CText
                weight="medium"
                fontSize={12}
                style={styles.columnHeaderText}
              >
                HOUR
              </CText>
            </View>
            <View style={styles.columnHeaderItem}>
              <CText
                weight="medium"
                fontSize={12}
                style={styles.columnHeaderText}
              >
                MIN
              </CText>
            </View>
            <View style={styles.columnHeaderItem}>
              <CText
                weight="medium"
                fontSize={12}
                style={styles.columnHeaderText}
              >
                {""}
              </CText>
            </View>
          </View>

          {/* Scroll columns */}
          <View style={styles.columnsContainer}>
            <ScrollColumn
              data={hours}
              selectedValue={selectedHour}
              onValueChange={(v) => setSelectedHour(v as number)}
              renderLabel={(v) => String(v)}
            />
            <View style={styles.columnSeparator} />
            <ScrollColumn
              data={minutes}
              selectedValue={selectedMinute}
              onValueChange={(v) => setSelectedMinute(v as number)}
              renderLabel={(v) => String(v).padStart(2, "0")}
            />
            <View style={styles.columnSeparator} />
            <ScrollColumn
              data={periods}
              selectedValue={selectedPeriod}
              onValueChange={(v) => setSelectedPeriod(v as "AM" | "PM")}
              renderLabel={(v) => String(v)}
            />
          </View>

          {/* Confirm button */}
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
            activeOpacity={0.8}
          >
            <CText weight="medium" fontSize={16} style={styles.confirmText}>
              Confirm
            </CText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dialog: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 34,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  clockIcon: {
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E8D5FF",
    alignItems: "center",
  },
  previewText: {
    color: "#3D1A66",
  },
  columnHeaders: {
    flexDirection: "row",
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  columnHeaderItem: {
    flex: 1,
    alignItems: "center",
  },
  columnHeaderText: {
    color: "#999",
    letterSpacing: 1,
  },
  columnsContainer: {
    flexDirection: "row",
    height: LIST_HEIGHT,
    marginBottom: 20,
  },
  columnSeparator: {
    width: 1,
    backgroundColor: "#F0E6FF",
    marginVertical: ITEM_HEIGHT * 1.5,
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
  },
  confirmText: {
    color: "#000",
  },
});
