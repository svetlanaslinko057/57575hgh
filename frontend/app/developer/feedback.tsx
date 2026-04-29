import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { T } from '../../src/theme';
import api from '../../src/api';

type Issue = { title?: string; description?: string; severity?: string };
type Item = {
  submission_id?: string;
  validation_id?: string;
  unit_id: string;
  unit_title: string;
  result: string;
  feedback?: string;
  issues?: Issue[];
  reviewed_at?: string;
};

const RESULT_META: Record<string, { color: string; icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  approved:           { color: T.primary, icon: 'checkmark-circle', label: 'Approved' },
  revision_needed:    { color: T.risk,    icon: 'alert-circle',     label: 'Needs revision' },
  rejected:           { color: T.danger,  icon: 'close-circle',     label: 'Rejected' },
  failed_validation:  { color: T.danger,  icon: 'shield-outline',   label: 'Failed validation' },
};

const SEVERITY_COLOR: Record<string, string> = {
  critical: T.danger,
  high: T.danger,
  medium: T.risk,
  low: T.textMuted,
};

function formatDate(iso?: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function DeveloperFeedback() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const load = React.useCallback(async () => {
    try {
      const r = await api.get('/developer/feedback');
      setItems(r.data?.items || []);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <Stack.Screen options={{ title: 'QA Feedback', headerStyle: { backgroundColor: T.bg }, headerTitleStyle: { color: T.text } }} />
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={T.primary} />}
      >
        {loading && <ActivityIndicator color={T.primary} />}

        {!loading && items.length === 0 && (
          <View style={s.emptyCard}>
            <Ionicons name="thumbs-up-outline" size={32} color={T.primary} />
            <Text style={s.emptyTitle}>No feedback yet</Text>
            <Text style={s.emptySub}>Once QA reviews your submissions, you'll see their notes here.</Text>
          </View>
        )}

        {items.map((it, idx) => {
          const meta = RESULT_META[it.result] || { color: T.textMuted, icon: 'ellipse-outline', label: it.result };
          return (
            <View key={(it.submission_id || it.validation_id || `i-${idx}`)} style={s.card} testID={`feedback-${idx}`}>
              <View style={s.cardHeader}>
                <Ionicons name={meta.icon} size={20} color={meta.color} />
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle} numberOfLines={1}>{it.unit_title}</Text>
                  <Text style={s.cardMeta}>{formatDate(it.reviewed_at)}</Text>
                </View>
                <View style={[s.pill, { backgroundColor: `${meta.color}22`, borderColor: `${meta.color}55` }]}>
                  <Text style={[s.pillText, { color: meta.color }]}>{meta.label}</Text>
                </View>
              </View>

              {!!it.feedback && (
                <Text style={s.feedbackBody}>{it.feedback}</Text>
              )}

              {!!it.issues?.length && (
                <View style={s.issues}>
                  {it.issues.map((iss, j) => (
                    <View key={j} style={s.issue}>
                      <View style={[s.sevDot, { backgroundColor: SEVERITY_COLOR[iss.severity || 'low'] || T.textMuted }]} />
                      <View style={{ flex: 1 }}>
                        {!!iss.title && <Text style={s.issueTitle}>{iss.title}</Text>}
                        {!!iss.description && <Text style={s.issueDesc}>{iss.description}</Text>}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.bg },
  content: { padding: T.lg, paddingBottom: T.xl * 2 },
  card: {
    backgroundColor: T.surface,
    borderRadius: T.radius,
    borderWidth: 1, borderColor: T.border,
    padding: T.md,
    marginBottom: T.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: T.sm, marginBottom: T.sm },
  cardTitle: { color: T.text, fontSize: T.body, fontWeight: '700' },
  cardMeta: { color: T.textMuted, fontSize: 11, marginTop: 2 },
  pill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  pillText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  feedbackBody: {
    color: T.text,
    fontSize: 13,
    lineHeight: 19,
    backgroundColor: T.bg,
    borderRadius: 8,
    padding: T.sm,
    borderLeftWidth: 3,
    borderLeftColor: T.risk,
  },
  issues: { gap: T.sm, marginTop: T.sm },
  issue: { flexDirection: 'row', gap: T.sm, alignItems: 'flex-start' },
  sevDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  issueTitle: { color: T.text, fontSize: 13, fontWeight: '600' },
  issueDesc: { color: T.textMuted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  emptyCard: {
    backgroundColor: T.surface,
    borderRadius: T.radius,
    borderWidth: 1, borderColor: T.border,
    padding: T.xl,
    alignItems: 'center',
  },
  emptyTitle: { color: T.text, fontSize: 16, fontWeight: '700', marginTop: T.sm },
  emptySub: { color: T.textMuted, fontSize: 13, textAlign: 'center', marginTop: 4, lineHeight: 18 },
});
