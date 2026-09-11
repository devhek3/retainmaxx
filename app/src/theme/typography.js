import { Platform } from 'react-native';

const WEB_SYSTEM_FONT_STACK =
  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const systemFontFamily = Platform.select({
  ios: 'system-ui',
  android: 'sans-serif',
  web: WEB_SYSTEM_FONT_STACK,
  default: 'sans-serif',
});

export const fontFamilies = Object.freeze({
  // iOS applies SF Pro's optical sizing automatically for both roles.
  display: systemFontFamily,
  text: systemFontFamily,
});

export const fontWeights = Object.freeze({
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extraBold: '800',
});

export const typography = Object.freeze({
  display: Object.freeze({ fontFamily: fontFamilies.display }),
  text: Object.freeze({ fontFamily: fontFamilies.text }),
  scale: Object.freeze({
    display: Object.freeze({ fontSize: 32, fontWeight: fontWeights.bold }),
    pageTitle: Object.freeze({ fontSize: 24, fontWeight: fontWeights.bold }),
    sectionTitle: Object.freeze({ fontSize: 18, fontWeight: fontWeights.semibold }),
    body: Object.freeze({ fontSize: 16, fontWeight: fontWeights.regular }),
    bodyEmphasis: Object.freeze({ fontSize: 16, fontWeight: fontWeights.semibold }),
    topicCardTitle: Object.freeze({ fontSize: 16, fontWeight: fontWeights.semibold }),
    secondary: Object.freeze({ fontSize: 14, fontWeight: fontWeights.regular }),
    caption: Object.freeze({ fontSize: 12, fontWeight: fontWeights.regular }),
  }),
});
