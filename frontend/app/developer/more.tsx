import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../../src/theme';
import { PressScale } from '../../src/ui';

type Item = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  desc: string;
  route: string;
  badge?: string;
};

const SECTIONS: { title: string; items: Item[] }[] = [
  {
    title: 'Performance',
    items: [
      { icon: 'trophy-outline',     label: 'Leaderboard', desc: 'Where you stand vs. other devs', route: '/developer/leaderboard' },
      { icon: 'trending-up-outline', label: 'Growth',     desc: 'Your trajectory · 30-day window', route: '/developer/growth' },
    ],
  },
  {
    title: 'Work',
    items: [
      { icon: 'time-outline',       label: 'Time Logs',   desc: 'Hours logged across all tasks',   route: '/developer/time-logs' },
      { icon: 'chatbubble-ellipses-outline', label: 'QA Feedback', desc: 'What QA flagged on your work', route: '/developer/feedback' },
    ],
  },
  {
    title: 'Account',
    items: [
      { icon: 'person-circle-outline', label: 'Profile & Settings', desc: 'Avatar · theme · language · 2FA', route: '/profile' },
      { icon: 'wallet-outline',     label: 'Wallet',      desc: 'Balance · withdraw · history',     route: '/developer/wallet' },
    ],
  },
];

export default function DeveloperMore() {
  const router = useRouter();
  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {SECTIONS.map((sec) => (
        <View key={sec.title} style={s.section}>
          <Text style={s.sectionTitle}>{sec.title}</Text>
          {sec.items.map((it) => (
            <PressScale
              key={it.route}
              testID={`more-${it.route.replace(/\//g, '-')}`}
              onPress={() => router.push(it.route as any)}
              style={s.row}
            >
              <View style={s.iconWrap}>
                <Ionicons name={it.icon} size={20} color={T.primary} />
              </View>
              <View style={s.body}>
                <Text style={s.label}>{it.label}</Text>
                <Text style={s.desc}>{it.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={T.textMuted} />
            </PressScale>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  content: { padding: T.lg, paddingBottom: T.xl * 2 },
  h1: { color: T.text, fontSize: T.title, fontWeight: '800', marginBottom: T.lg },
  section: { marginBottom: T.lg },
  sectionTitle: {
    color: T.textMuted, fontSize: 12, fontWeight: '700',
    letterSpacing: 1.2, textTransform: 'uppercase',
    marginBottom: T.sm, paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: T.md,
    backgroundColor: T.surface,
    borderRadius: T.radius,
    borderWidth: 1,
    borderColor: T.border,
    padding: T.md,
    marginBottom: T.sm,
  },
  iconWrap: {
    width: 38, height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(47,230,166,0.10)',
    alignItems: 'center', justifyContent: 'center',
  },
  body: { flex: 1 },
  label: { color: T.text, fontSize: T.body, fontWeight: '700' },
  desc: { color: T.textMuted, fontSize: 12, marginTop: 2 },
});
