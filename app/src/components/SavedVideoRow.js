import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ellipsis } from 'lucide-react-native';

import { colors } from '../theme/colors';

export default function SavedVideoRow({ video }) {
  return (
    <View style={styles.row}>
      <ImageBackground imageStyle={styles.image} source={video.image} style={styles.thumbnail}>
        <View style={styles.imageShade} />
        <Text style={styles.overlay}>{video.overlay}</Text>
      </ImageBackground>
      <View style={styles.details}>
        <Text numberOfLines={2} style={styles.title}>{video.title}</Text>
        <View style={styles.metadata}>
          <View style={styles.dot} />
          <Text numberOfLines={1} style={styles.metaText}>{video.topic}</Text>
          <Text style={styles.separator}>•</Text>
          <Text numberOfLines={1} style={styles.metaText}>{video.source}</Text>
        </View>
      </View>
      <Pressable
        accessibilityLabel={`More options for ${video.title}`}
        accessibilityRole="button"
        style={({ pressed }) => [styles.moreButton, pressed && styles.moreButtonPressed]}
      >
        <Ellipsis color="#666C79" size={21} strokeWidth={2.6} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', minHeight: 90 },
  thumbnail: { height: 90, justifyContent: 'flex-end', overflow: 'hidden', padding: 11, width: 125 },
  image: { borderRadius: 10 },
  imageShade: { backgroundColor: 'rgba(0, 0, 0, 0.22)', borderRadius: 10, bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
  overlay: { color: colors.surface, fontSize: 11, fontWeight: '700', letterSpacing: 0.1, lineHeight: 13, maxWidth: 86, textTransform: 'uppercase', textShadowColor: 'rgba(0, 0, 0, 0.55)', textShadowOffset: { height: 1, width: 0 }, textShadowRadius: 2 },
  details: { flex: 1, justifyContent: 'center', minWidth: 0, paddingLeft: 18, paddingRight: 3 },
  title: { color: '#0E1118', fontSize: 17, fontWeight: '500', letterSpacing: -0.4, lineHeight: 21 },
  metadata: { alignItems: 'center', flexDirection: 'row', marginTop: 10, minWidth: 0 },
  dot: { backgroundColor: '#7750F8', borderRadius: 999, height: 7, marginRight: 10, width: 7 },
  metaText: { color: '#818796', flexShrink: 1, fontSize: 13, lineHeight: 17 },
  separator: { color: '#818796', fontSize: 13, marginHorizontal: 9 },
  moreButton: { alignItems: 'center', borderRadius: 999, height: 40, justifyContent: 'center', marginLeft: 2, width: 27 },
  moreButtonPressed: { backgroundColor: colors.backgroundSecondary },
});
