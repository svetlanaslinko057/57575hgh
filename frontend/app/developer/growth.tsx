import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../../src/theme';
import api from '../../src/api';

type Tier = {
  name: string;
  min_network: number;
  min_earnings: number;
  commission_rate: number;
  priority_bonus: number;
};

type Dashboard = {
  wallet: { available_balance: number; pending_balance: number; lifetime_earned: number };
  growth_score: number;
  invite_link: string | null;
  referrals_count: number;
  active_referrals_count: number;
  tier: {
    tier: string;
    network_size: number;
    network_earnings: number;
    commission_rate: number;
    priority_bonus: number;
    next_tier: {
      name: string;
      network_remaining: number;
      earnings_remaining: number;
      commission_rate: number;
      priority_bonus: number;
    } | null;
  };
  all_tiers: Tier[];
};

export default function DeveloperGrowth() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const load = React.useCallback(async () => {
    try {
      const r = await api.get('/developer/growth/dashboard');
      setData(r.data);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View style={[s.container, s.center]}>
        <ActivityIndicator color={T.primary} />
      </View>
    );
  }
  if (!data) {
    return (
      <View style={[s.container, s.center]}>
        <Text style={s.muted}>Growth data unavailable</Text>
      </View>
    );
  }

  const tier = data.tier;
  const next = tier.next_tier;

  return (
    <>
      <Stack.Screen options={{ title: 'Growth', headerStyle: { backgroundColor: T.bg }, headerTitleStyle: { color: T.text } }} />
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={T.primary} />}
      >
        {/* Hero — current tier */}
        <View style={s.heroCard}>
          <Text style={s.heroLabel}>Current tier</Text>
          <Text style={s.heroTier}>{tier.tier.toUpperCase()}</Text>
          <View style={s.heroStats}>
            <View style={s.heroStat}>
              <Text style={s.heroStatValue}>{(tier.commission_rate * 100).toFixed(1)}%</Text>
              <Text style={s.heroStatLabel}>Commission</Text>
            </View>
            <View style={s.heroStat}>
              <Text style={s.heroStatValue}>+{tier.priority_bonus}</Text>
              <Text style={s.heroStatLabel}>Priority bonus</Text>
            </View>
            <View style={s.heroStat}>
              <Text style={s.heroStatValue}>{data.active_referrals_count}</Text>
              <Text style={s.heroStatLabel}>Active refs</Text>
            </View>
          </View>
        </View>

        {/* Next tier — what to reach */}
        {next && (
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Ionicons name="arrow-up-circle-outline" size={20} color={T.primary} />
              <Text style={s.cardTitle}>Next: {next.name}</Text>
            </View>
            <ProgressLine
              label="Network size"
              remaining={next.network_remaining}
              suffix={next.network_remaining === 1 ? 'developer to go' : 'developers to go'}
            />
            {next.earnings_remaining > 0 && (
              <ProgressLine
                label="Network earnings"
                remaining={next.earnings_remaining}
                prefix="$"
                suffix="more required"
              />
            )}
            <View style={s.nextPerks}>
              <Text style={s.nextPerk}>+ commission → {(next.commission_rate * 100).toFixed(1)}%</Text>
              <Text style={s.nextPerk}>+ priority → +{next.priority_bonus}</Text>
            </View>
          </View>
        )}

        {/* Growth score */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Ionicons name="pulse-outline" size={20} color={T.primary} />
            <Text style={s.cardTitle}>30-day growth score</Text>
          </View>
          <Text style={s.scoreNumber}>{data.growth_score.toFixed(0)}</Text>
          <Text style={s.scoreLabel}>
            Calculated from referrals, completed tasks, and earnings velocity
          </Text>
        </View>

        {/* Wallet snapshot */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Ionicons name="wallet-outline" size={20} color={T.primary} />
            <Text style={s.cardTitle}>Wallet snapshot</Text>
          </View>
          <Row label="Available" value={`$${data.wallet.available_balance.toFixed(2)}`} highlight />
          <Row label="Pending" value={`$${data.wallet.pending_balance.toFixed(2)}`} />
          <Row label="Lifetime earned" value={`$${data.wallet.lifetime_earned.toFixed(2)}`} />
        </View>

        {/* All tiers ladder */}
        <Text style={s.sectionTitle}>Tier ladder</Text>
        {data.all_tiers.map((t) => (
          <View
            key={t.name}
            style={[s.tierRow, t.name === tier.tier && s.tierRowActive]}
          >
            <View style={s.tierLeft}>
              <Text style={[s.tierName, t.name === tier.tier && s.tierNameActive]}>
                {t.name.toUpperCase()}
              </Text>
              <Text style={s.tierMeta}>
                {t.min_network}+ network · ${t.min_earnings}+ earnings
              </Text>
            </View>
            <View style={s.tierRight}>
              <Text style={s.tierComm}>{(t.commission_rate * 100).toFixed(1)}%</Text>
              <Text style={s.tierBonus}>+{t.priority_bonus}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={[s.rowValue, highlight && { color: T.primary }]}>{value}</Text>
    </View>
  );
}

function ProgressLine({ label, remaining, prefix = '', suffix }: { label: string; remaining: number; prefix?: string; suffix: string }) {
  return (
    <View style={s.progRow}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.progValue}>
        {remaining > 0 ? `${prefix}${remaining} ${suffix}` : '✓ reached'}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: T.lg, paddingBottom: T.xl * 2 },
  muted: { color: T.textMuted },
  heroCard: {
    backgroundColor: T.surface,
    borderRadius: T.radius,
    borderWidth: 1,
    borderColor: 'rgba(47,230,166,0.30)',
    padding: T.lg,
    marginBottom: T.lg,
  },
  heroLabel: { color: T.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2 },
  heroTier: { color: T.primary, fontSize: 32, fontWeight: '900', marginTop: 4, marginBottom: T.md },
  heroStats: { flexDirection: 'row', gap: T.sm },
  heroStat: { flex: 1, backgroundColor: T.bg, borderRadius: 10, padding: T.sm, alignItems: 'center' },
  heroStatValue: { color: T.text, fontSize: 16, fontWeight: '700' },
  heroStatLabel: { color: T.textMuted, fontSize: 10, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.6 },
  card: {
    backgroundColor: T.surface,
    borderRadius: T.radius,
    borderWidth: 1, borderColor: T.border,
    padding: T.md,
    marginBottom: T.md,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: T.sm },
  cardTitle: { color: T.text, fontSize: T.body, fontWeight: '700' },
  scoreNumber: { color: T.primary, fontSize: 36, fontWeight: '900', marginVertical: 4 },
  scoreLabel: { color: T.textMuted, fontSize: 12, lineHeight: 17 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  rowLabel: { color: T.textMuted, fontSize: 13 },
  rowValue: { color: T.text, fontSize: 13, fontWeight: '600' },
  progRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  progValue: { color: T.primary, fontSize: 13, fontWeight: '600' },
  nextPerks: { flexDirection: 'row', gap: T.md, marginTop: T.sm, paddingTop: T.sm, borderTopWidth: 1, borderTopColor: T.border },
  nextPerk: { color: T.textMuted, fontSize: 12 },
  sectionTitle: {
    color: T.textMuted, fontSize: 12, fontWeight: '700',
    letterSpacing: 1.2, textTransform: 'uppercase',
    marginBottom: T.sm, paddingHorizontal: 4, marginTop: T.sm,
  },
  tierRow: {
    flexDirection: 'row',
    backgroundColor: T.surface,
    borderRadius: T.radius,
    borderWidth: 1, borderColor: T.border,
    padding: T.md,
    marginBottom: 6,
  },
  tierRowActive: { borderColor: T.primary, backgroundColor: 'rgba(47,230,166,0.06)' },
  tierLeft: { flex: 1 },
  tierName: { color: T.text, fontSize: 14, fontWeight: '700' },
  tierNameActive: { color: T.primary },
  tierMeta: { color: T.textMuted, fontSize: 11, marginTop: 2 },
  tierRight: { alignItems: 'flex-end', justifyContent: 'center' },
  tierComm: { color: T.text, fontSize: 13, fontWeight: '700' },
  tierBonus: { color: T.textMuted, fontSize: 11 },
});
