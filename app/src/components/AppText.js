import { forwardRef } from 'react';
import { Text } from 'react-native';

import { typography } from '../theme/typography';

const AppText = forwardRef(function AppText(
  { fontRole = 'text', style, ...props },
  ref,
) {
  const fontStyle = fontRole === 'display' ? typography.display : typography.text;

  return <Text ref={ref} style={[fontStyle, style]} {...props} />;
});

export default AppText;
