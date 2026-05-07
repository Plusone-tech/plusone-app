import CText from "@/components/CText";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface TicketSelectorProps {
  selected: number;
  max: number;
  pricePerTicket: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export default function TicketSelector({
  selected,
  max,
  pricePerTicket,
  onIncrement,
  onDecrement,
}: TicketSelectorProps) {
  const total = pricePerTicket * selected;

  return (
    <View style={styles.ticketsCard}>
      <CText style={styles.sectionTitle}>Select Tickets</CText>
      <View style={styles.ticketSelector}>
        <TouchableOpacity
          style={styles.ticketButton}
          onPress={onDecrement}
          disabled={selected <= 1}
        >
          <Ionicons name="remove" size={24} color="#3D1A66" />
        </TouchableOpacity>
        <View style={styles.ticketCount}>
          <CText style={styles.ticketNumber}>{selected}</CText>
          <CText style={styles.ticketLabel}>
            {selected === 1 ? "Ticket" : "Tickets"}
          </CText>
        </View>
        <TouchableOpacity
          style={styles.ticketButton}
          onPress={onIncrement}
          disabled={selected >= max}
        >
          <Ionicons name="add" size={24} color="#3D1A66" />
        </TouchableOpacity>
      </View>
      <View style={styles.priceRow}>
        <CText style={styles.priceLabel}>Total Amount</CText>
        <CText style={styles.priceAmount}>₹{total}</CText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ticketsCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
  },
  ticketSelector: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 30,
    marginBottom: 20,
  },
  ticketButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E8D5FF",
    justifyContent: "center",
    alignItems: "center",
  },
  ticketCount: {
    alignItems: "center",
    minWidth: 80,
  },
  ticketNumber: {
    fontSize: 40,
    fontWeight: "700",
    color: "#3D1A66",
  },
  ticketLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  priceLabel: {
    fontSize: 16,
    color: "#666",
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3D1A66",
  },
});
