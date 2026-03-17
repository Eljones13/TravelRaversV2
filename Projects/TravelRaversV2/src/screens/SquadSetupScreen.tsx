// ============================================================
// TRAVEL RAVERS — SquadSetupScreen
// Session 2-B: Full build — SQLite squad_members + squad_config
// Create crew, add members, homebase, emergency contacts — 100% offline
// Accent: Medium Purple (#9D4EDD)
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, Platform, KeyboardAvoidingView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { sql } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import { db } from '../db/database';
import { squadMembers, squadConfig } from '../db/schema';
import type { SquadMember, SquadConfig } from '../db/schema';
import { Colors } from '../constants/colors';

const C = Colors.module.SQUAD; // '#9D4EDD'

const ROLES = ['CAPTAIN', 'NAVIGATOR', 'MEDIC', 'DJ', 'CREW'] as const;
type Role = typeof ROLES[number];

const AVATARS = ['🦁', '🐺', '🦊', '🐉', '🦅', '🐙', '🦋', '🐸', '🌟', '👾'];

const ROLE_COLOR: Record<string, string> = {
  CAPTAIN:   Colors.module.SOS,
  NAVIGATOR: Colors.module.MAP,
  MEDIC:     Colors.green,
  DJ:        Colors.module.TRACK,
  CREW:      C,
};

// ── Glass card ────────────────────────────────────────────────
const GlassCard: React.FC<{ children: React.ReactNode; style?: object }> = ({ children, style }) => (
  <View style={[gc.card, style]}>
    <LinearGradient
      colors={['rgba(255,255,255,0.06)', 'transparent']}
      start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
      style={StyleSheet.absoluteFillObject}
      pointerEvents="none"
    />
    <View style={gc.lip} pointerEvents="none" />
    {children}
  </View>
);

const gc = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${C}44`,
    backgroundColor: 'rgba(6,16,36,0.92)',
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: `0 0 10px ${C}33` } as object,
      default: { shadowColor: C, shadowRadius: 10, shadowOpacity: 0.25, elevation: 5 },
    }),
  },
  lip: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 1.5, backgroundColor: 'white', opacity: 0.1,
  },
});

// ── Default form state ─────────────────────────────────────────
const defaultForm = () => ({
  name: '', nickname: '', role: 'CREW' as Role,
  avatar: '👾', emergencyContact: '', phone: '',
});

// ── SquadSetupScreen ──────────────────────────────────────────
export const SquadSetupScreen: React.FC<{ navigation: { goBack: () => void } }> = ({ navigation }) => {
  const [members, setMembers]         = useState<SquadMember[]>([]);
  const [config, setConfig]           = useState<{ squadName: string; homebase: string }>({ squadName: 'RAVE SQUAD', homebase: '' });
  const [editingName, setEditingName] = useState(false);
  const [editingBase, setEditingBase] = useState(false);
  const [showModal, setShowModal]     = useState(false);
  const [form, setForm]               = useState(defaultForm());

  const load = async () => {
    try {
      const rows = await db.select().from(squadMembers);
      setMembers(rows as SquadMember[]);
      const cfg = await db.select().from(squadConfig)
        .where(eq(squadConfig.id, 'default')).limit(1);
      if (cfg[0]) setConfig({ squadName: cfg[0].squadName, homebase: cfg[0].homebase ?? '' });
    } catch { /* first launch / web */ }
  };

  useEffect(() => { void load(); }, []);

  const saveConfig = async (updated: { squadName: string; homebase: string }) => {
    try {
      await db.run(sql`
        INSERT OR REPLACE INTO squad_config (id, squad_name, homebase, festival_id)
        VALUES ('default', ${updated.squadName}, ${updated.homebase}, 'creamfields-2026')
      `);
    } catch { /* web mock */ }
  };

  const addMember = async () => {
    if (!form.name.trim()) { Alert.alert('Name required', 'Enter a name for this crew member.'); return; }
    const id = `member-${Date.now()}`;
    try {
      await db.insert(squadMembers).values({
        id,
        name:             form.name.trim(),
        nickname:         form.nickname.trim() || null,
        role:             form.role,
        avatar:           form.avatar,
        emergencyContact: form.emergencyContact.trim() || null,
        phone:            form.phone.trim() || null,
        createdAt:        new Date().toISOString(),
      });
    } catch { /* web mock */ }
    setShowModal(false);
    setForm(defaultForm());
    void load();
  };

  const removeMember = (id: string, name: string) => {
    Alert.alert('Remove Member', `Remove ${name} from your squad?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try { await db.delete(squadMembers).where(eq(squadMembers.id, id)); } catch { /* web */ }
          void load();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>SQUAD SETUP</Text>
          <Text style={s.subtitle}>BUILD YOUR CREW</Text>
        </View>
        <View style={s.badge}>
          <Text style={s.badgeText}>{members.length} MEMBERS</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Squad Name ── */}
        <GlassCard style={s.sectionCard}>
          <Text style={s.sectionLabel}>SQUAD NAME</Text>
          {editingName ? (
            <TextInput
              style={s.nameInput}
              value={config.squadName}
              onChangeText={(v) => setConfig((c) => ({ ...c, squadName: v }))}
              onBlur={() => { setEditingName(false); void saveConfig(config); }}
              autoFocus
              maxLength={30}
              autoCapitalize="characters"
            />
          ) : (
            <TouchableOpacity onPress={() => setEditingName(true)}>
              <Text style={s.squadName}>{config.squadName}</Text>
              <Text style={s.editHint}>TAP TO EDIT</Text>
            </TouchableOpacity>
          )}
        </GlassCard>

        {/* ── Homebase ── */}
        <GlassCard style={s.sectionCard}>
          <Text style={s.sectionLabel}>HOMEBASE / MEETUP POINT</Text>
          {editingBase ? (
            <TextInput
              style={s.homebaseInput}
              value={config.homebase}
              placeholder="e.g. Stage 3 entrance, near the big flagpole"
              placeholderTextColor={Colors.dim}
              onChangeText={(v) => setConfig((c) => ({ ...c, homebase: v }))}
              onBlur={() => { setEditingBase(false); void saveConfig(config); }}
              autoFocus
            />
          ) : (
            <TouchableOpacity onPress={() => setEditingBase(true)}>
              <Text style={[s.homebaseText, !config.homebase && { color: Colors.dim }]}>
                {config.homebase || 'TAP TO SET HOMEBASE LOCATION'}
              </Text>
            </TouchableOpacity>
          )}
        </GlassCard>

        {/* ── Crew List ── */}
        <Text style={s.listHeader}>CREW ({members.length})</Text>

        {members.length === 0 && (
          <View style={s.emptyWrap}>
            <Text style={s.emptyEmoji}>👥</Text>
            <Text style={s.emptyText}>NO CREW YET{'\n'}HIT + TO ADD YOUR FIRST MEMBER</Text>
          </View>
        )}

        {members.map((m) => (
          <GlassCard key={m.id} style={s.memberCard}>
            <View style={s.memberRow}>
              <Text style={s.memberAvatar}>{m.avatar}</Text>
              <View style={s.memberInfo}>
                <Text style={s.memberName}>{m.name.toUpperCase()}</Text>
                {m.nickname ? <Text style={s.memberNick}>"{m.nickname}"</Text> : null}
                <View style={[s.roleChip, { borderColor: ROLE_COLOR[m.role] ?? C }]}>
                  <Text style={[s.roleChipText, { color: ROLE_COLOR[m.role] ?? C }]}>{m.role}</Text>
                </View>
              </View>
              <View style={s.memberRight}>
                {m.phone ? <Text style={s.memberPhone}>{m.phone}</Text> : null}
                <TouchableOpacity onPress={() => removeMember(m.id, m.name)}>
                  <Text style={s.removeBtn}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
            {m.emergencyContact ? (
              <Text style={s.emergencyText}>🆘 {m.emergencyContact}</Text>
            ) : null}
          </GlassCard>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity style={s.fab} onPress={() => setShowModal(true)}>
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>

      {/* ── Add Member Modal ── */}
      <Modal visible={showModal} transparent animationType="slide">
        <KeyboardAvoidingView
          style={s.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={s.modalBackdrop} onPress={() => setShowModal(false)} />
          <View style={s.modalSheet}>
            <LinearGradient
              colors={['rgba(255,255,255,0.05)', 'transparent']}
              start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />
            <Text style={s.modalTitle}>ADD CREW MEMBER</Text>

            {/* Avatar */}
            <Text style={s.fieldLabel}>AVATAR</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.avatarScroll}>
              {AVATARS.map((a) => (
                <TouchableOpacity key={a} onPress={() => setForm((f) => ({ ...f, avatar: a }))}>
                  <Text style={[s.avatarOpt, form.avatar === a && s.avatarSel]}>{a}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={s.fieldLabel}>NAME *</Text>
            <TextInput
              style={s.input}
              value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="Full name"
              placeholderTextColor={Colors.dim}
              autoCapitalize="words"
            />

            <Text style={s.fieldLabel}>NICKNAME</Text>
            <TextInput
              style={s.input}
              value={form.nickname}
              onChangeText={(v) => setForm((f) => ({ ...f, nickname: v }))}
              placeholder="What the squad calls you"
              placeholderTextColor={Colors.dim}
            />

            <Text style={s.fieldLabel}>ROLE</Text>
            <View style={s.roleRow}>
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    s.roleOpt,
                    form.role === r && { backgroundColor: `${ROLE_COLOR[r]}22`, borderColor: ROLE_COLOR[r] },
                  ]}
                  onPress={() => setForm((f) => ({ ...f, role: r }))}
                >
                  <Text style={[s.roleOptText, form.role === r && { color: ROLE_COLOR[r] }]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.fieldLabel}>EMERGENCY CONTACT NAME</Text>
            <TextInput
              style={s.input}
              value={form.emergencyContact}
              onChangeText={(v) => setForm((f) => ({ ...f, emergencyContact: v }))}
              placeholder="Mum, Dad, Partner..."
              placeholderTextColor={Colors.dim}
              autoCapitalize="words"
            />

            <Text style={s.fieldLabel}>EMERGENCY PHONE</Text>
            <TextInput
              style={s.input}
              value={form.phone}
              onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
              placeholder="+44 7700 000000"
              placeholderTextColor={Colors.dim}
              keyboardType="phone-pad"
            />

            <View style={s.modalActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={s.cancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.addBtn} onPress={() => void addMember()}>
                <Text style={s.addText}>ADD TO SQUAD</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
};

export default SquadSetupScreen;

// ── Styles ────────────────────────────────────────────────────
const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },

  // Header
  header: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderBottomWidth: 1, borderBottomColor: `${C}22`,
    paddingHorizontal: 16, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  backBtn: {
    width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
    borderRadius: 8, borderWidth: 1, borderColor: `${C}44`, backgroundColor: `${C}11`,
  },
  backText: { color: C, fontSize: 18, fontWeight: '700' },
  title: {
    color: C, fontSize: 12, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase',
    ...Platform.select({
      web: { textShadow: `0 0 8px ${C}` } as object,
      default: { textShadowColor: C, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
    }),
  },
  subtitle: { color: Colors.dim, fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 },
  badge: {
    borderWidth: 1, borderColor: `${C}44`, borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 4, backgroundColor: `${C}11`,
  },
  badgeText: { color: C, fontSize: 8, letterSpacing: 2, fontWeight: '700' },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 14, gap: 10 },

  // Config cards
  sectionCard: { padding: 16 },
  sectionLabel: {
    color: Colors.dim, fontSize: 8, letterSpacing: 3,
    textTransform: 'uppercase', marginBottom: 8,
  },
  nameInput: {
    color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 4,
    textTransform: 'uppercase', borderBottomWidth: 1, borderBottomColor: C, paddingBottom: 4,
  },
  squadName: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 4, textTransform: 'uppercase' },
  editHint: { color: Colors.dim, fontSize: 7, letterSpacing: 2, marginTop: 4 },
  homebaseInput: {
    color: Colors.text, fontSize: 13,
    borderBottomWidth: 1, borderBottomColor: `${C}66`, paddingBottom: 4,
  },
  homebaseText: { color: Colors.text, fontSize: 13 },

  // Member list
  listHeader: {
    color: Colors.dim, fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', marginTop: 4,
  },
  emptyWrap: { alignItems: 'center', paddingVertical: 32 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyText: {
    color: Colors.dim, fontSize: 9, letterSpacing: 2,
    textTransform: 'uppercase', textAlign: 'center', lineHeight: 16,
  },
  memberCard: { padding: 14 },
  memberRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  memberAvatar: { fontSize: 32 },
  memberInfo: { flex: 1 },
  memberName: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 2 },
  memberNick: { color: C, fontSize: 10, fontStyle: 'italic', marginTop: 2 },
  roleChip: {
    alignSelf: 'flex-start', borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2, marginTop: 6,
  },
  roleChipText: { fontSize: 8, letterSpacing: 2, fontWeight: '700' },
  memberRight: { alignItems: 'flex-end', gap: 8 },
  memberPhone: { color: Colors.dim, fontSize: 9, letterSpacing: 1 },
  removeBtn: { color: Colors.module.SOS, fontSize: 16, fontWeight: '700', opacity: 0.7 },
  emergencyText: { color: Colors.dim, fontSize: 9, letterSpacing: 1, marginTop: 8 },

  // FAB
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(6,16,36,0.95)',
    borderWidth: 1.5, borderColor: C,
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: `0 0 20px ${C}99` } as object,
      default: { shadowColor: C, shadowRadius: 20, shadowOpacity: 0.7, elevation: 12 },
    }),
  },
  fabText: { color: C, fontSize: 28, fontWeight: '300', lineHeight: 32 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
  modalSheet: {
    backgroundColor: 'rgba(6,14,30,0.98)',
    borderTopWidth: 1, borderTopColor: `${C}66`,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 36, overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: `0 -4px 40px ${C}44` } as object,
      default: { shadowColor: C, shadowRadius: 40, shadowOpacity: 0.3, elevation: 20 },
    }),
  },
  modalTitle: {
    color: C, fontSize: 14, fontWeight: '900', letterSpacing: 4,
    textTransform: 'uppercase', marginBottom: 20, textAlign: 'center',
  },
  fieldLabel: {
    color: Colors.dim, fontSize: 8, letterSpacing: 3,
    textTransform: 'uppercase', marginBottom: 6, marginTop: 12,
  },
  input: {
    color: Colors.text, fontSize: 14,
    borderBottomWidth: 1, borderBottomColor: `${C}44`, paddingVertical: 6,
  },
  avatarScroll: { marginBottom: 4 },
  avatarOpt: { fontSize: 28, padding: 6, marginRight: 4 },
  avatarSel: {
    backgroundColor: `${C}22`, borderRadius: 8,
    borderWidth: 1, borderColor: C,
  },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  roleOpt: {
    borderWidth: 1, borderColor: `${Colors.dim}44`, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  roleOptText: { color: Colors.dim, fontSize: 9, letterSpacing: 2, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1,
    borderColor: `${Colors.dim}44`, alignItems: 'center',
  },
  cancelText: { color: Colors.dim, fontSize: 10, letterSpacing: 2 },
  addBtn: {
    flex: 2, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1.5, borderColor: C, backgroundColor: `${C}22`, alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: `0 0 14px ${C}66` } as object,
      default: { shadowColor: C, shadowRadius: 14, shadowOpacity: 0.5, elevation: 8 },
    }),
  },
  addText: { color: C, fontSize: 11, letterSpacing: 3, fontWeight: '700' },
});
