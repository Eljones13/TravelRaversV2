// ============================================================
// TRAVEL RAVERS — BudgetScreen (Session 2-C: Full Build)
// SQLite expenses · settlement calc · WhatsApp share
// Accent: Gold #FFD700  (Colors.module.BUDGET)
// ============================================================

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Platform, TouchableOpacity,
  Modal, TextInput, Alert, Linking, KeyboardAvoidingView,
  Pressable, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { eq, sql } from 'drizzle-orm';
import { db } from '../db/database';
import { expenses as expensesTable } from '../db/schema';
import { Colors } from '../constants/colors';

// ── Constants ─────────────────────────────────────────────────
const C           = Colors.module.BUDGET;   // #FFD700
const FESTIVAL_ID = 'creamfields-2026';

type Category = 'FOOD' | 'DRINKS' | 'TRAVEL' | 'CAMP' | 'OTHER';
const CATEGORIES: Category[] = ['FOOD', 'DRINKS', 'TRAVEL', 'CAMP', 'OTHER'];
const CAT_EMOJI: Record<Category, string> = {
  FOOD: '🍔', DRINKS: '🍺', TRAVEL: '🚗', CAMP: '⛺', OTHER: '💳',
};

interface Expense {
  id: string;
  festivalId: string | null;
  description: string;
  amount: number;
  paidBy: string;
  category: string;
  createdAt: string;
}

interface Settlement { from: string; to: string; amount: number; }

// ── Settlement algorithm (min cash-flow) ──────────────────────
function calcSettlement(exps: Expense[]): Settlement[] {
  if (!exps.length) return [];
  const people = [...new Set(exps.map(e => e.paidBy))];
  if (people.length < 2) return [];

  const paid: Record<string, number> = {};
  people.forEach(p => { paid[p] = 0; });
  exps.forEach(e => { paid[e.paidBy] += e.amount; });

  const total = Object.values(paid).reduce((a, b) => a + b, 0);
  const share = total / people.length;

  const balances = people.map(p => ({ name: p, bal: +(paid[p] - share).toFixed(2) }));
  const creds = balances.filter(b => b.bal > 0.01).sort((a, b) => b.bal - a.bal).map(b => ({ ...b }));
  const debts = balances.filter(b => b.bal < -0.01).sort((a, b) => a.bal - b.bal).map(b => ({ ...b }));

  const result: Settlement[] = [];
  let ci = 0, di = 0;
  while (ci < creds.length && di < debts.length) {
    const pay = Math.min(creds[ci].bal, -debts[di].bal);
    if (pay > 0.01) result.push({ from: debts[di].name, to: creds[ci].name, amount: +pay.toFixed(2) });
    creds[ci].bal  -= pay;
    debts[di].bal  += pay;
    if (creds[ci].bal  < 0.01) ci++;
    if (-debts[di].bal < 0.01) di++;
  }
  return result;
}

// ── Glow helper ───────────────────────────────────────────────
function glow(color: string, r = 10) {
  return Platform.select({
    web: { boxShadow: `0 0 ${r}px ${color}55` } as object,
    default: { shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowRadius: r, shadowOpacity: 0.5 },
  });
}

// ── BudgetScreen ──────────────────────────────────────────────
export const BudgetScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // Data state
  const [expenses,    setExpenses]    = useState<Expense[]>([]);
  const [loading,     setLoading]     = useState(true);

  // Modal state
  const [modalOpen,   setModalOpen]   = useState(false);
  const [desc,        setDesc]        = useState('');
  const [amount,      setAmount]      = useState('');
  const [paidBy,      setPaidBy]      = useState('');
  const [category,    setCategory]    = useState<Category>('OTHER');
  const [saving,      setSaving]      = useState(false);

  // ── Load expenses from SQLite ──────────────────────────────────
  const loadExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await db.select().from(expensesTable)
        .where(eq(expensesTable.festivalId, FESTIVAL_ID));
      setExpenses(rows as Expense[]);
    } catch (e) {
      console.error('[Budget] load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadExpenses(); }, [loadExpenses]);

  // ── Add expense ───────────────────────────────────────────────
  const handleAdd = async () => {
    const amt = parseFloat(amount.replace('£', '').trim());
    if (!desc.trim() || isNaN(amt) || amt <= 0 || !paidBy.trim()) {
      Alert.alert('Missing Info', 'Please fill in all fields with a valid amount.');
      return;
    }
    setSaving(true);
    try {
      const id = `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      await db.insert(expensesTable).values({
        id,
        festivalId:  FESTIVAL_ID,
        description: desc.trim(),
        amount:      amt,
        paidBy:      paidBy.trim().toUpperCase(),
        category:    category,
        createdAt:   new Date().toISOString(),
      });
      setDesc(''); setAmount(''); setPaidBy(''); setCategory('OTHER');
      setModalOpen(false);
      await loadExpenses();
    } catch (e) {
      Alert.alert('Error', 'Could not save expense. Try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete expense ────────────────────────────────────────────
  const handleDelete = (id: string, description: string) => {
    Alert.alert('Delete Expense', `Remove "${description}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await db.delete(expensesTable).where(eq(expensesTable.id, id));
            await loadExpenses();
          } catch { Alert.alert('Error', 'Could not delete.'); }
        },
      },
    ]);
  };

  // ── WhatsApp share ────────────────────────────────────────────
  const handleShare = () => {
    const total = expenses.reduce((a, e) => a + e.amount, 0);
    const settlements = calcSettlement(expenses);
    const lines = [
      `🎪 TRAVEL RAVERS — BUDGET SUMMARY`,
      `Festival: CREAMFIELDS 2026`,
      `Total Spent: £${total.toFixed(2)}`,
      ``,
      settlements.length
        ? `SETTLEMENTS:\n${settlements.map(s => `  ${s.from} → ${s.to}: £${s.amount.toFixed(2)}`).join('\n')}`
        : 'All square — no debts!',
      ``,
      `Shared via Travel Ravers 🎉`,
    ];
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(lines.join('\n'))}`).catch(() => {
      Alert.alert('WhatsApp not found', 'Make sure WhatsApp is installed on this device.');
    });
  };

  // ── Derived values ────────────────────────────────────────────
  const total       = expenses.reduce((a, e) => a + e.amount, 0);
  const people      = [...new Set(expenses.map(e => e.paidBy))];
  const avgPer      = people.length ? total / people.length : 0;
  const settlements = calcSettlement(expenses);

  // ── Summary card ──────────────────────────────────────────────
  function SummaryCard() {
    return (
      <View style={[s.summaryCard, glow(C, 12)]}>
        <LinearGradient colors={['rgba(255,255,255,0.06)', 'transparent']}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject} pointerEvents="none" />
        <View style={s.lip} pointerEvents="none" />
        <View style={s.summaryRow}>
          {[
            { val: `£${total.toFixed(2)}`, key: 'TOTAL SPENT'  },
            { val: `${people.length}`,     key: 'PEOPLE'       },
            { val: `£${avgPer.toFixed(2)}`,key: 'AVG / PERSON' },
          ].map((st, i) => (
            <React.Fragment key={st.key}>
              {i > 0 && <View style={s.statDiv} />}
              <View style={s.summStat}>
                <Text style={[s.summVal, { color: C }]}>{st.val}</Text>
                <Text style={s.summKey}>{st.key}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </View>
    );
  }

  // ── Expense row ───────────────────────────────────────────────
  function ExpenseRow({ exp }: { exp: Expense }) {
    return (
      <View style={[s.expRow, glow(C, 5)]}>
        <LinearGradient colors={['rgba(255,255,255,0.03)', 'transparent']}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject} pointerEvents="none" />
        <View style={[s.catBadge, { backgroundColor: C + '18', borderColor: C + '44' }]}>
          <Text style={s.catEmoji}>{CAT_EMOJI[exp.category as Category] ?? '💳'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.expDesc} numberOfLines={1}>{exp.description.toUpperCase()}</Text>
          <Text style={s.expMeta}>{exp.paidBy} PAID · {exp.category}</Text>
        </View>
        <Text style={[s.expAmt, { color: C }]}>£{exp.amount.toFixed(2)}</Text>
        <TouchableOpacity style={s.delBtn} onPress={() => handleDelete(exp.id, exp.description)}>
          <Text style={s.delText}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Settlement card ───────────────────────────────────────────
  function SettlementCard() {
    if (!expenses.length) return null;
    return (
      <View style={[s.settleCard, glow(Colors.green, 8)]}>
        <LinearGradient colors={['rgba(0,255,136,0.05)', 'transparent']}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject} pointerEvents="none" />
        <View style={[s.lip, { backgroundColor: Colors.green, opacity: 0.3 }]} pointerEvents="none" />
        <Text style={[s.settleTitle, { color: Colors.green }]}>SETTLEMENT CALCULATOR</Text>
        {settlements.length === 0 ? (
          <Text style={s.settleAllClear}>✅  ALL SQUARE — NO DEBTS</Text>
        ) : (
          settlements.map((st, i) => (
            <View key={i} style={s.settleRow}>
              <Text style={s.settleName}>{st.from}</Text>
              <Text style={s.settleArrow}>→</Text>
              <Text style={s.settleName}>{st.to}</Text>
              <Text style={[s.settleAmt, { color: Colors.green }]}>£{st.amount.toFixed(2)}</Text>
            </View>
          ))
        )}
        <TouchableOpacity style={[s.waBtn, glow(Colors.green, 6)]} onPress={handleShare}>
          <Text style={s.waBtnText}>📱  SHARE VIA WHATSAPP</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Add Expense Modal ─────────────────────────────────────────
  function AddModal() {
    return (
      <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <KeyboardAvoidingView style={s.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setModalOpen(false)} />
          <View style={[s.modalCard, glow(C, 16)]}>
            <LinearGradient colors={['rgba(255,255,255,0.06)', 'transparent']}
              start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFillObject} pointerEvents="none" />
            <View style={s.lip} pointerEvents="none" />

            <Text style={[s.modalTitle, { color: C }]}>ADD EXPENSE</Text>

            <Text style={s.inputLabel}>DESCRIPTION</Text>
            <TextInput
              style={[s.input, { borderColor: C + '55' }]}
              placeholder="e.g. Festival food run"
              placeholderTextColor={Colors.dim}
              value={desc}
              onChangeText={setDesc}
              autoCapitalize="words"
            />

            <Text style={s.inputLabel}>AMOUNT (£)</Text>
            <TextInput
              style={[s.input, { borderColor: C + '55' }]}
              placeholder="0.00"
              placeholderTextColor={Colors.dim}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />

            <Text style={s.inputLabel}>PAID BY</Text>
            <TextInput
              style={[s.input, { borderColor: C + '55' }]}
              placeholder="Name"
              placeholderTextColor={Colors.dim}
              value={paidBy}
              onChangeText={setPaidBy}
              autoCapitalize="words"
            />

            <Text style={s.inputLabel}>CATEGORY</Text>
            <View style={s.catRow}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[s.catChip, category === cat && { backgroundColor: C + '22', borderColor: C + '88' }]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={s.catChipEmoji}>{CAT_EMOJI[cat]}</Text>
                  <Text style={[s.catChipText, category === cat && { color: C }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={s.modalBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setModalOpen(false)}>
                <Text style={s.cancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.confirmBtn, { backgroundColor: C + '18', borderColor: C + '88' }, glow(C, 8)]}
                onPress={handleAdd}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color={C} size="small" />
                  : <Text style={[s.confirmText, { color: C }]}>+ SAVE EXPENSE</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }

  // ── Main render ───────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={[s.backText, { color: C }]}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[s.headerTitle, { color: C }]}>BUDGET</Text>
          <Text style={s.headerSub}>EXPENSE SPLITTER</Text>
        </View>
        <View style={[s.totalBadge, glow(C, 6)]}>
          <Text style={[s.totalBadgeText, { color: C }]}>£{total.toFixed(2)}</Text>
        </View>
      </View>

      {loading ? (
        <View style={s.centred}>
          <ActivityIndicator color={C} size="large" />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}>
          <SummaryCard />

          {/* Expense list */}
          {expenses.length === 0 ? (
            <View style={[s.emptyCard, glow(C, 5)]}>
              <Text style={s.emptyEmoji}>💳</Text>
              <Text style={s.emptyTitle}>NO EXPENSES YET</Text>
              <Text style={s.emptyDesc}>Tap the button below to log your first expense.</Text>
            </View>
          ) : (
            <View style={s.expList}>
              {expenses.map(exp => <ExpenseRow key={exp.id} exp={exp} />)}
            </View>
          )}

          <SettlementCard />
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[s.fab, glow(C, 14)]}
        onPress={() => setModalOpen(true)}
      >
        <Text style={[s.fabText, { color: C }]}>+ ADD EXPENSE</Text>
      </TouchableOpacity>

      <AddModal />
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: Colors.bg },
  scrollContent: { padding: 12, gap: 10 },
  centred:       { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderBottomWidth: 1, borderBottomColor: C + '22',
  },
  backBtn: {
    width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C + '44', backgroundColor: C + '11',
  },
  backText:    { fontSize: 18, fontWeight: '700' },
  headerTitle: { fontFamily: 'Orbitron_700Bold', fontSize: 13, letterSpacing: 3, textTransform: 'uppercase' },
  headerSub:   {
    fontFamily: 'ShareTechMono_400Regular', fontSize: 9,
    color: Colors.dim, letterSpacing: 2, textTransform: 'uppercase',
  },
  totalBadge: {
    borderWidth: 1, borderColor: C + '66', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: C + '0F',
  },
  totalBadgeText: { fontFamily: 'Orbitron_700Bold', fontSize: 12, letterSpacing: 1 },

  // Shared card utils
  lip: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 1.5, backgroundColor: 'white', opacity: 0.15,
  },
  statDiv: { width: 1, height: 28, backgroundColor: C + '22' },

  // Summary card
  summaryCard: {
    backgroundColor: 'rgba(6,16,36,0.95)', borderRadius: 16,
    borderWidth: 1.5, borderColor: C + '55', overflow: 'hidden', padding: 18,
  },
  summaryRow:  { flexDirection: 'row', alignItems: 'center' },
  summStat:    { flex: 1, alignItems: 'center' },
  summVal:     { fontFamily: 'Orbitron_700Bold', fontSize: 18 },
  summKey: {
    fontFamily: 'ShareTechMono_400Regular', fontSize: 8,
    color: Colors.dim, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 2,
  },

  // Expense list
  expList: { gap: 7 },
  expRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(6,16,36,0.88)', borderRadius: 12,
    borderWidth: 1, borderColor: C + '33', overflow: 'hidden', padding: 12,
  },
  catBadge: {
    width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  catEmoji:   { fontSize: 18 },
  expDesc: {
    fontFamily: 'Orbitron_700Bold', fontSize: 10,
    color: Colors.text, letterSpacing: 1, textTransform: 'uppercase',
  },
  expMeta: {
    fontFamily: 'ShareTechMono_400Regular', fontSize: 8,
    color: Colors.dim, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2,
  },
  expAmt:  { fontFamily: 'Orbitron_700Bold', fontSize: 14 },
  delBtn:  { padding: 4 },
  delText: { color: Colors.red + 'AA', fontSize: 12, fontWeight: '700' },

  // Empty state
  emptyCard: {
    backgroundColor: 'rgba(6,16,36,0.88)', borderRadius: 14,
    borderWidth: 1, borderColor: C + '22', padding: 32,
    alignItems: 'center', gap: 8,
  },
  emptyEmoji: { fontSize: 40, marginBottom: 8 },
  emptyTitle: {
    fontFamily: 'Orbitron_700Bold', fontSize: 12,
    color: C + 'AA', letterSpacing: 2, textTransform: 'uppercase',
  },
  emptyDesc: {
    fontFamily: 'ShareTechMono_400Regular', fontSize: 10,
    color: Colors.dim, textAlign: 'center', letterSpacing: 1,
  },

  // Settlement
  settleCard: {
    backgroundColor: 'rgba(6,16,36,0.92)', borderRadius: 14,
    borderWidth: 1, borderColor: Colors.green + '44', overflow: 'hidden', padding: 16, gap: 10,
  },
  settleTitle: {
    fontFamily: 'Orbitron_700Bold', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
  },
  settleAllClear: {
    fontFamily: 'ShareTechMono_400Regular', fontSize: 11,
    color: Colors.green, letterSpacing: 1.5, textTransform: 'uppercase',
  },
  settleRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settleName: {
    fontFamily: 'Orbitron_700Bold', fontSize: 10, color: Colors.text, flex: 1,
  },
  settleArrow: { color: Colors.dim, fontSize: 14 },
  settleAmt: { fontFamily: 'Orbitron_700Bold', fontSize: 12 },
  waBtn: {
    backgroundColor: Colors.green + '14', borderWidth: 1, borderColor: Colors.green + '55',
    borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginTop: 4,
  },
  waBtnText: {
    fontFamily: 'Orbitron_700Bold', fontSize: 10,
    color: Colors.green, letterSpacing: 1.5, textTransform: 'uppercase',
  },

  // FAB
  fab: {
    position: 'absolute', bottom: 24, alignSelf: 'center',
    backgroundColor: 'rgba(6,16,36,0.95)',
    borderWidth: 1.5, borderColor: C + '88',
    borderRadius: 30, paddingHorizontal: 28, paddingVertical: 14,
  },
  fabText: { fontFamily: 'Orbitron_700Bold', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' },

  // Modal
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalCard: {
    backgroundColor: 'rgba(6,14,30,0.98)',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, borderColor: C + '44', overflow: 'hidden',
    padding: 24, gap: 10,
  },
  modalTitle: {
    fontFamily: 'Orbitron_700Bold', fontSize: 14,
    letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4,
  },
  inputLabel: {
    fontFamily: 'ShareTechMono_400Regular', fontSize: 8,
    color: Colors.dim, letterSpacing: 2, textTransform: 'uppercase',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 10, color: Colors.text,
    fontFamily: 'ShareTechMono_400Regular', fontSize: 13,
  },
  catRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 2 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: Colors.dim + '55',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  catChipEmoji: { fontSize: 14 },
  catChipText: {
    fontFamily: 'ShareTechMono_400Regular', fontSize: 9,
    color: Colors.dim, letterSpacing: 1, textTransform: 'uppercase',
  },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: {
    flex: 1, borderWidth: 1, borderColor: Colors.dim + '44', borderRadius: 10,
    paddingVertical: 12, alignItems: 'center',
  },
  cancelText: {
    fontFamily: 'Orbitron_700Bold', fontSize: 10,
    color: Colors.dim, letterSpacing: 1.5, textTransform: 'uppercase',
  },
  confirmBtn: {
    flex: 2, borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center',
  },
  confirmText: {
    fontFamily: 'Orbitron_700Bold', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase',
  },
});

export default BudgetScreen;
