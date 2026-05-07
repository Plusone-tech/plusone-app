import { Text, TextProps, StyleSheet, TextStyle } from "react-native";
import React from "react";

type fontWeight = "extralight" | "light" | "regular" | "medium" | "semibold" | "bold" | "extrabold";

interface CTextProps extends TextProps {
  weight?: fontWeight;
  fontSize?: number;
  letterSpacing?: string;
}

export default function CText({ weight="regular", fontSize=16, letterSpacing="-0.05", style, ...props }: CTextProps) {
  let ff: string;
  switch(weight) {
    case "extralight": ff = "fontMainExtraLight"; break;
    case "light": ff = "fontMainLight"; break;
    case "regular": ff = "fontMainRegular"; break;
    case "medium": ff = "fontMainMedium"; break;
    case "semibold": ff = "fontMainSemiBold"; break;
    case "bold": ff = "fontMainBold"; break;
    case "extrabold": ff = "fontMainExtraBold"; break;
  }

  //Handling only sign error
  let ls = 0
  if(letterSpacing === "-") {
    ls = 0;
  } else {
    const num = Number(letterSpacing);
    ls = isNaN(num) ? 0 : num;
  }

  const letterSpacingEm = ls;
  const FontFamily = ff;
  const LetterSpacing = fontSize * letterSpacingEm;

  const textStyle: TextStyle = {
    fontFamily: FontFamily,
    fontSize: fontSize,
    letterSpacing: LetterSpacing,
  };

  return <Text {...props} style={[textStyle, style]} />;
}