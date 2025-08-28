import React from "react";
import { Text, StyleSheet, Dimensions } from "react-native";

// Get device width for responsive font scaling
const { width } = Dimensions.get("window");

const Heading = ({ title }) => {
  return <Text style={styles.heading}>{title}</Text>;
};

const styles = StyleSheet.create({
  heading: {
    color: "#fff",
    backgroundColor: "#007BFF",
    fontWeight: "bold",
    textAlign: "left",           // Align text to the left
    marginTop: 35,               // Push header down from the top
    marginBottom: 20,
    marginLeft: 10,              // Add left margin for spacing
    marginRight: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 4,                // Android shadow
    shadowColor: "#000",         // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    fontSize: width > 400 ? 28 : width > 320 ? 24 : 20,
    letterSpacing:1 ,
  },
});

export default Heading;
