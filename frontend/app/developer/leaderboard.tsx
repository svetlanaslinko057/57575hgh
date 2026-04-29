import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../../src/theme';
import api from '../../src/api';

type Row = {
  rank: number;
  user_id: string;
  name: string;
  growth_score: number;
  active_referrals: number;
  completed_tasks: number;
  total_earnings: number;
};

export default function DeveloperLeaderboard() {
  const [top, setTop] = useState<Row[]>([]);
  const [me, setMe] = useState<Row | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = React.useCallback(async () => {
    try {
      const r = await api.get('/developer/growth/leaderboard');
      setTop(r.data?.top || []);
      setMe(r.data?.me || null);
      setTotal(r.data?.total_participants || 0);
    } catch {
      /* swallow — render empty state */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <Stack.Screen options={{ title: 'Leaderboard', headerStyle: { backgroundColor: T.bg }, headerTitleStyle: { color: T.text } }} />
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={T.primary} />}
      >
        {/* Hero — your rank */}
        <View style={s.heroCard} testID="leaderboard-me">
          <View style={s.heroHeader}>
            <View style={s.rankPill}>
              <Text style={s.rankPillText}>#{me?.rank || '—'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.heroName}>{me?.name || 'You'}</Text>
              <Text style={s.heroSub}>
                of {total || '—'} developer{total === 1 ? '' : 's'} on the platform
              </Text>
            </View>
          </View>
          <View style={s.heroStats}>
            <Stat label="Growth score" value={(me?.growth_score ?? 0).toFixed(0)} />
            <Stat label="Referrals" value={String(me?.active_referrals ?? 0)} />
            <Stat label="Tasks done" value={String(me?.completed_tasks ?? 0)} />
            <Stat label="Earned" value={`$${(me?.total_earnings ?? 0).toFixed(0)}`} />
          </View>
        </View>

        <Text style={s.sectionTitle}>Top developers</Text>

        {loading && <ActivityIndicator color={T.primary} style={{ marginTop: T.lg }} />}

        {!loading && top.length === 0 && (
          <View style={s.emptyCard}>
            <Ionicons name="trophy-outline" size={32} color={T.textMuted} />
            <Text style={s.emptyTitle}>Leaderboard is forming</Text>
            <Text style={s.emptySub}>Once 5+ developers are active on the platform, you'll see rankings here.</Text>
          </View>
        )}

        {top.map((row, idx) => (
          <View key={row.user_id} style={[s.row, idx === 0 && s.rowGold]} testID={`leaderboard-row-${row.rank}`}>
            <Text style={[s.rowRank, idx === 0 && s.rowRankGold]}>#{row.rank}</Text>
            <View style={s.rowBody}>
              <Text style={s.rowName}>{row.name}</Text>
              <Text style={s.rowMeta}>
                {row.completed_tasks} task{row.completed_tasks === 1 ? '' : 's'} · ${row.total_earnings.toFixed(0)}
              </Text>
            </View>
            <View style={s.rowScore}>
              <Text style={s.rowScoreText}>{row.growth_score.toFixed(0)}</Text>
              <Text style={s.rowScoreLabel}>growth</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.stat}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  content: { padding: T.lg, paddingBottom: T.xl * 2 },
  heroCard: {
    backgroundColor: T.surface,
    borderRadius: T.radius,
    borderWidth: 1,
    borderColor: 'rgba(47,230,166,0.30)',
    padding: T.lg,
    marginBottom: T.lg,
  },
  heroHeader: { flexDirection: 'row', alignItems: 'center', gap: T.md, marginBottom: T.md },
  rankPill: {
    backgroundColor: 'rgba(47,230,166,0.12)',
    borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  rankPillText: { color: T.primary, fontSize: 22, fontWeight: '900' },
  heroName: { color: T.text, fontSize: T.title, fontWeight: '800' },
  heroSub: { color: T.textMuted, fontSize: 12, marginTop: 2 },
  heroStats: { flexDirection: 'row', gap: T.sm, flexWrap: 'wrap' },
  stat: {
    flex: 1, minWidth: 70,
    paddingVertical: T.sm,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: T.bg,
    alignItems: 'center',
  },
  statValue: { color: T.text, fontSize: 16, fontWeight: '700' },
  statLabel: { color: T.textMuted, fontSize: 10, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.8 },
  sectionTitle: {
    color: T.textMuted, fontSize: 12, fontWeight: '700',
    letterSpacing: 1.2, textTransform: 'uppercase',
    marginBottom: T.sm, paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: T.surface,
    borderRadius: T.radius,
    borderWidth: 1, borderColor: T.border,
    padding: T.md,
    marginBottom: T.sm,
    gap: T.md,
  },
  rowGold: { borderColor: 'rgba(245,196,81,0.45)' },
  rowRank: { color: T.textMuted, fontSize: 16, fontWeight: '700', width: 38 },
  rowRankGold: { color: T.risk },
  rowBody: { flex: 1 },
  rowName: { color: T.text, fontSize: T.body, fontWeight: '600' },
  rowMeta: { color: T.textMuted, fontSize: 12, marginTop: 2 },
  rowScore: { alignItems: 'flex-end' },
  rowScoreText: { color: T.primary, fontSize: 16, fontWeight: '700' },
  rowScoreLabel: { color: T.textMuted, fontSize: 10, textTransform: 'uppercase' },
  emptyCard: {
    backgroundColor: T.surface,
    borderRadius: T.radius,
    borderWidth: 1,
    borderColor: T.border,
    padding: T.xl,
    alignItems: 'center',
    marginTop: T.md,
  },
  emptyTitle: { color: T.text, fontSize: 16, fontWeight: '700', marginTop: T.sm },
  emptySub: { color: T.textMuted, fontSize: 13, textAlign: 'center', marginTop: 4, lineHeight: 18 },
});
