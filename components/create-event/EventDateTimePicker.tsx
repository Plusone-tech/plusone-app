import CText from "@/components/CText";
import CustomDatePicker from "@/components/CustomDatePicker";
import CustomTimePicker from "@/components/CustomTimePicker";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface EventDateTimePickerProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  dateError?: string | null;
}

// Generate next N days starting from today
function getUpcomingDays(count: number): Date[] {
  const days: Date[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Always shows the day name (Today for today, actual day name for everything else)
function formatDayLabel(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (isSameDay(date, today)) return "Today";
  return DAY_NAMES[date.getDay()];
}

function formatFullDate(date: Date): string {
  return `${DAY_NAMES[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventDateTimePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  dateError,
}: EventDateTimePickerProps) {
  const upcomingDays = getUpcomingDays(14);
  const [activeField, setActiveField] = useState<"start" | "end">("start");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const activeDate = activeField === "start" ? startDate : endDate;
  const setActiveDate =
    activeField === "start" ? onStartDateChange : onEndDateChange;

  const handleDaySelect = (day: Date) => {
    const newDate = new Date(activeDate);
    newDate.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    setActiveDate(newDate);
  };

  const handleDateConfirm = (date: Date) => {
    const newDate = new Date(activeDate);
    newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    setActiveDate(newDate);
    setShowDatePicker(false);
  };

  const handleTimeConfirm = (date: Date) => {
    const newDate = new Date(activeDate);
    newDate.setHours(date.getHours(), date.getMinutes(), 0, 0);
    setActiveDate(newDate);
    setShowTimePicker(false);
  };

  return (
    <View style={styles.container}>
      {/* Custom Date Picker Modal */}
      <CustomDatePicker
        visible={showDatePicker}
        value={activeDate}
        onConfirm={handleDateConfirm}
        onCancel={() => setShowDatePicker(false)}
        minimumDate={new Date()}
      />

      {/* Custom Time Picker Modal */}
      <CustomTimePicker
        visible={showTimePicker}
        value={activeDate}
        onConfirm={handleTimeConfirm}
        onCancel={() => setShowTimePicker(false)}
      />

      {/* Summary Cards — tappable to switch active field */}
      <View style={styles.summaryRow}>
        <TouchableOpacity
          style={[
            styles.summaryCard,
            activeField === "start" && styles.summaryCardHighlight,
            activeField !== "start" && styles.summaryCardDimmed,
          ]}
          onPress={() => setActiveField("start")}
          activeOpacity={0.7}
        >
          <View style={styles.summaryIconWrap}>
            <Ionicons name="play-circle" size={18} color="#3D1A66" />
          </View>
          <View style={styles.summaryContent}>
            <CText style={styles.summaryLabel}>Starts</CText>
            <CText style={styles.summaryDate}>
              {formatFullDate(startDate)}
            </CText>
            <CText style={styles.summaryTime}>{formatTime(startDate)}</CText>
          </View>
          {activeField === "start" && (
            <View style={styles.activeIndicator}>
              <Ionicons name="chevron-forward" size={14} color="#3D1A66" />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.summaryArrow}>
          <Ionicons name="arrow-forward" size={16} color="#B39DDB" />
        </View>

        <TouchableOpacity
          style={[
            styles.summaryCard,
            activeField === "end" && styles.summaryCardHighlight,
            activeField !== "end" && styles.summaryCardDimmed,
          ]}
          onPress={() => setActiveField("end")}
          activeOpacity={0.7}
        >
          <View style={styles.summaryIconWrap}>
            <Ionicons name="flag" size={18} color="#3D1A66" />
          </View>
          <View style={styles.summaryContent}>
            <CText style={styles.summaryLabel}>Ends</CText>
            <CText style={styles.summaryDate}>{formatFullDate(endDate)}</CText>
            <CText style={styles.summaryTime}>{formatTime(endDate)}</CText>
          </View>
          {activeField === "end" && (
            <View style={styles.activeIndicator}>
              <Ionicons name="chevron-forward" size={14} color="#3D1A66" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Date Selector – Horizontal scroll */}
      <View style={styles.section}>
        <CText style={styles.sectionLabel}>
          <Ionicons name="calendar-outline" size={14} color="#666" /> Pick a
          Date
        </CText>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayScroll}
        >
          {upcomingDays.map((day, idx) => {
            const selected = isSameDay(day, activeDate);
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.dayCard, selected && styles.dayCardSelected]}
                onPress={() => handleDaySelect(day)}
                activeOpacity={0.7}
              >
                <CText
                  style={[
                    styles.dayLabel,
                    selected && styles.dayLabelSelected,
                  ]}
                >
                  {formatDayLabel(day)}
                </CText>
                <CText
                  style={[
                    styles.dayNumber,
                    selected && styles.dayNumberSelected,
                  ]}
                >
                  {day.getDate()}
                </CText>
                <CText
                  style={[
                    styles.dayMonth,
                    selected && styles.dayMonthSelected,
                  ]}
                >
                  {MONTH_NAMES[day.getMonth()]}
                </CText>
              </TouchableOpacity>
            );
          })}

          {/* More dates button — opens the custom date picker */}
          <TouchableOpacity
            style={styles.moreDatesCard}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color="#3D1A66" />
            <CText style={styles.moreDatesText}>More</CText>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Time Selector */}
      <View style={styles.section}>
        <CText style={styles.sectionLabel}>
          <Ionicons name="time-outline" size={14} color="#666" />{" "}
          {activeField === "start" ? "Start" : "End"} Time
        </CText>
        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => setShowTimePicker(true)}
          activeOpacity={0.7}
        >
          <View style={styles.timeIconWrap}>
            <Ionicons name="time" size={22} color="#3D1A66" />
          </View>
          <CText style={styles.timeText}>{formatTime(activeDate)}</CText>
          <Ionicons name="chevron-forward" size={18} color="#B39DDB" />
        </TouchableOpacity>
      </View>

      {/* Error */}
      {dateError && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color="#FF4444" />
          <CText style={styles.errorText}>{dateError}</CText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },

  // Summary
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 14,
    gap: 10,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  summaryCardHighlight: {
    borderColor: "#3D1A66",
    backgroundColor: "#F8F4FF",
  },
  summaryCardDimmed: {
    opacity: 0.45,
  },
  summaryIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#E8D5FF",
    justifyContent: "center",
    alignItems: "center",
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  summaryDate: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  summaryTime: {
    fontSize: 12,
    color: "#3D1A66",
    fontWeight: "600",
    marginTop: 1,
  },
  summaryArrow: {
    width: 24,
    alignItems: "center",
  },
  activeIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E8D5FF",
    justifyContent: "center",
    alignItems: "center",
  },

  // Sections
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginLeft: 4,
  },

  // Day cards
  dayScroll: {
    paddingVertical: 4,
    paddingHorizontal: 2,
    gap: 10,
  },
  dayCard: {
    width: 68,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: "white",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E8E8E8",
    gap: 4,
  },
  dayCardSelected: {
    backgroundColor: "#3D1A66",
    borderColor: "#3D1A66",
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
  },
  dayLabelSelected: {
    color: "#E8D5FF",
  },
  dayNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
  },
  dayNumberSelected: {
    color: "#fff",
  },
  dayMonth: {
    fontSize: 11,
    fontWeight: "600",
    color: "#999",
  },
  dayMonthSelected: {
    color: "#E8D5FF",
  },

  // More dates
  moreDatesCard: {
    width: 68,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: "#F8F4FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E8D5FF",
    borderStyle: "dashed",
    gap: 4,
  },
  moreDatesText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#3D1A66",
  },

  // Time button
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: "#E8E8E8",
  },
  timeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#E8D5FF",
    justifyContent: "center",
    alignItems: "center",
  },
  timeText: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    letterSpacing: 0.5,
  },

  // Error
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#FFD0D0",
  },
  errorText: {
    fontSize: 13,
    color: "#FF4444",
    flex: 1,
  },
});
