// ============================================================
// TRAVEL RAVERS — SOSScreen (Full Welfare Build)
// Accent: #FF3344 | RAVESafe + Emergency Contacts + Hydration
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Platform, Linking, Alert, TextInput, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SQLite from 'expo-sqlite';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import Svg, { Defs, Pattern, Circle, Rect, Polygon } from 'react-native-svg';
import { Colors } from '../constants/colors';

const ACCENT = Colors.module.SOS; // #FF3344

// ── Types ──────────────────────────────────────────────────

type EmergencyContact = {
  id: number;
  name: string;
  phone: string;
};

type WelfareTent = {
  id: string;
  festival: string;
  lat: number;
  lng: number;
  address: string;
};

type RAVESafeCard = {
  substance: string;
  color: string;
  safeDose: string;
  dangerSigns: string[];
  ifCollapses: string[];
};

// ── Navigation type ────────────────────────────────────────
type SOSScreenProps = {
  navigation: { goBack: () => void };
};

// ── Constants ──────────────────────────────────────────────

const WELFARE_TENTS: WelfareTent[] = [
  { id: 'g', festival: 'GLASTONBURY', lat: 51.1485, lng: -2.7144, address: 'Worthy Farm, Pilton, Somerset' },
  { id: 'c', festival: 'CREAMFIELDS', lat: 53.3573, lng: -2.7415, address: 'Daresbury Estate, Cheshire' },
  { id: 'r', festival: 'READING', lat: 51.4566, lng: -0.9814, address: 'Little John\'s Farm, Reading' },
  { id: 'l', festival: 'LEEDS', lat: 53.8100, lng: -1.5500, address: 'Bramham Park, Leeds' },
  { id: 'b', festival: 'BOOMTOWN', lat: 51.0280, lng: -1.3350, address: 'Matterley Estate, Winchester' },
];

const RAVESAFE_CARDS: RAVESafeCard[] = [
  {
    substance: 'MDMA',
    color: '#FF2D78',
    safeDose: 'Max 75–100mg. Wait 90 mins before redosing. Test your pill first.',
    dangerSigns: ['Temperature above 39°C', 'Confusion / not responding', 'Muscle stiffness', 'Unable to pee for hours'],
    ifCollapses: ['Call 999 immediately', 'Move to cool area', 'Keep them awake', 'Do NOT give water if not responding'],
  },
  {
    substance: 'KETAMINE',
    color: '#CC00FF',
    safeDose: 'Start with small lines. Do not mix with alcohol. Never alone.',
    dangerSigns: ['Completely unresponsive (k-hole)', 'Breathing very slow', 'Blue lips or fingertips'],
    ifCollapses: ['Recovery position immediately', 'Call 999', 'Do not leave them alone', 'Tell medics what was taken'],
  },
  {
    substance: 'ALCOHOL',
    color: '#FFB300',
    safeDose: 'Drink water between each drink. Eat beforehand. Know your limit.',
    dangerSigns: ['Unresponsive / passed out', 'Choking or vomiting', 'Cold / clammy skin', 'Breathing very slowly'],
    ifCollapses: ['Recovery position', 'Call 999', 'Never leave alone to sleep it off', 'Stay until ambulance arrives'],
  },
  {
    substance: 'CANNABIS',
    color: '#00FF88',
    safeDose: 'Start very low with edibles — takes 1–2 hours to hit. Sit down if dizzy.',
    dangerSigns: ['Severe paranoia / panic attack', 'Rapid heart rate', 'Chest pain', 'Dissociation'],
    ifCollapses: ['Calm environment, quiet space', 'Talk slowly and reassuringly', 'Call 999 if no improvement', 'Do not restrain'],
  },
];

const SOS_NUMBERS = [
  { label: 'POLICE', number: '999', color: Colors.cyan },
  { label: 'AMBULANCE', number: '999', color: ACCENT },
  { label: 'FESTIVAL MEDICAL', number: '#FESTIVAL#', color: Colors.yellow },
  { label: 'DAN HELPLINE', number: '08007766600', color: '#CC00FF' },
];

const HYDRATION_NOTIF_ID = 'tr_hydration';
const HYDRATION_INTERVAL_MINS = 90;

// ── DB helpers ─────────────────────────────────────────────

let db: SQLite.SQLiteDatabase | null = null;

async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('travel_ravers.db');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS emergency_contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL
      );
    `);
  }
  return db;
}

async function loadContacts(): Promise<EmergencyContact[]> {
  const database = await getDB();
  return database.getAllAsync<EmergencyContact>('SELECT * FROM emergency_contacts LIMIT 3;');
}

async function addContact(name: string, phone: string): Promise<void> {
  const database = await getDB();
  const count = await database.getFirstAsync<{ n: number }>('SELECT COUNT(*) as n FROM emergency_contacts;');
  if ((count?.n ?? 0) >= 3) throw new Error('MAX_CONTACTS');
  await database.runAsync('INSERT INTO emergency_contacts (name, phone) VALUES (?, ?);', [name, phone]);
}

async function deleteContact(id: number): Promise<void> {
  const database = await getDB();
  await database.runAsync('DELETE FROM emergency_contacts WHERE id = ?;', [id]);
}

// ── Distance ────────────────────────────────────────────────

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Glow shadow helper ─────────────────────────────────────

function glowStyle(color: string, radius = 8) {
  return Platform.select({
    web: { boxShadow: `0 0 ${radius}px ${color}` } as any,
    default: { shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowRadius: radius, shadowOpacity: 1 },
  })!;
}

// ── Corner brackets ────────────────────────────────────────
const Corners: React.FC<{ color: string }> = ({ color }) => (
  <>
    <View style={[s.cTL, { borderColor: color }]} pointerEvents="none" />
    <View style={[s.cTR, { borderColor: color }]} pointerEvents="none" />
    <View style={[s.cBL, { borderColor: color }]} pointerEvents="none" />
    <View style={[s.cBR, { borderColor: color }]} pointerEvents="none" />
  </>
);

// ── Section header ─────────────────────────────────────────
const SectionHeader: React.FC<{ title: string; icon: string }> = ({ title, icon }) => (
  <View style={s.sectionHeader}>
    <View style={[s.sectionLine, { backgroundColor: ACCENT }]} />
    <Text style={s.sectionTitle}>{icon} {title}</Text>
    <View style={[s.sectionLine, { backgroundColor: ACCENT }]} />
  </View>
);

// ── MAIN SCREEN ────────────────────────────────────────────

export const SOSScreen: React.FC<SOSScreenProps> = ({ navigation }) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [hydrationOn, setHydrationOn] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [selectedFestival, setSelectedFestival] = useState('GLASTONBURY');

  // ── Load contacts + GPS ─────────────────────────────────
  useEffect(() => {
    loadContacts().then(setContacts).catch(() => { });
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLat(loc.coords.latitude);
        setUserLng(loc.coords.longitude);
      }
    })();
  }, []);

  // ── Add contact ─────────────────────────────────────────
  const handleAddContact = useCallback(async () => {
    if (!newName.trim() || !newPhone.trim()) return;
    try {
      await addContact(newName.trim(), newPhone.trim());
      const updated = await loadContacts();
      setContacts(updated);
      setNewName('');
      setNewPhone('');
      setShowAddModal(false);
    } catch (e: any) {
      if (e.message === 'MAX_CONTACTS') Alert.alert('MAXIMUM CONTACTS', 'You can store up to 3 emergency contacts.');
    }
  }, [newName, newPhone]);

  const handleDeleteContact = useCallback(async (id: number) => {
    Alert.alert('REMOVE CONTACT', 'Delete this emergency contact?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'DELETE', style: 'destructive', onPress: async () => {
          await deleteContact(id);
          setContacts(await loadContacts());
        }
      },
    ]);
  }, []);

  // ── Hydration toggle ────────────────────────────────────
  const toggleHydration = useCallback(async () => {
    if (hydrationOn) {
      await Notifications.cancelScheduledNotificationAsync(HYDRATION_NOTIF_ID).catch(() => { });
      setHydrationOn(false);
    } else {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('NOTIFICATIONS OFF', 'Enable notifications in Settings to use hydration reminders.');
        return;
      }
      await Notifications.scheduleNotificationAsync({
        identifier: HYDRATION_NOTIF_ID,
        content: {
          title: '💧  DRINK WATER',
          body: 'Stay safe out there — hydration is critical at festivals.',
          sound: true,
        },
        trigger: { seconds: HYDRATION_INTERVAL_MINS * 60, repeats: true },
      });
      setHydrationOn(true);
    }
  }, [hydrationOn]);

  // ── I AM SAFE check-in ──────────────────────────────────
  const handleSafeCheckIn = useCallback(() => {
    if (contacts.length === 0) {
      Alert.alert('NO CONTACT', 'Add an emergency contact first.');
      return;
    }
    const contact = contacts[0];
    const ts = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const msg = encodeURIComponent(`I am safe at ${selectedFestival} — ${ts} ✅`);
    const phone = contact.phone.replace(/\D/g, '');
    Linking.openURL(`https://wa.me/${phone}?text=${msg}`).catch(() => {
      // Fallback to SMS if WhatsApp not available
      Linking.openURL(`sms:${contact.phone}?body=${msg}`);
    });
  }, [contacts, selectedFestival]);

  // ── Directions ─────────────────────────────────────────
  const openDirections = useCallback((tent: WelfareTent) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${tent.festival}+Welfare+Tent&ll=${tent.lat},${tent.lng}`,
      android: `geo:${tent.lat},${tent.lng}?q=${tent.lat},${tent.lng}(${tent.festival}+Welfare)`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${tent.lat},${tent.lng}`,
    })!;
    Linking.openURL(url);
  }, []);

  // ── Render ────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Dot grid background */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <Pattern id="dotG" width="44" height="44" patternUnits="userSpaceOnUse">
              <Circle cx="1" cy="1" r="0.5" fill="rgba(255,51,68,0.06)" />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#dotG)" />
        </Svg>
      </View>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={navigation.goBack} style={s.backBtn}>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Polygon points="15,5 7,12 15,19" fill={ACCENT} />
          </Svg>
          <Text style={[s.backText, { color: ACCENT }]}>BACK</Text>
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: ACCENT }, glowStyle(ACCENT, 6)]}>⚠ SOS</Text>
        <View style={s.headerRight} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── I AM SAFE ── */}
        <TouchableOpacity style={s.iamSafeBtn} onPress={handleSafeCheckIn} activeOpacity={0.8}>
          <View style={[s.iamSafeBtnInner, glowStyle(Colors.green, 14)]}>
            <Text style={s.iamSafeText}>✓  I AM SAFE</Text>
            <Text style={s.iamSafeSub}>SEND WHATSAPP CHECK-IN →</Text>
          </View>
          <Corners color={Colors.green} />
        </TouchableOpacity>

        {/* ── EMERGENCY CONTACTS ── */}
        <SectionHeader title="EMERGENCY CONTACTS" icon="📞" />

        {contacts.map(c => (
          <View key={c.id} style={s.contactCard}>
            <View>
              <Text style={s.contactName}>{c.name}</Text>
              <Text style={s.contactPhone}>{c.phone}</Text>
            </View>
            <View style={s.contactActions}>
              <TouchableOpacity style={[s.contactBtn, { borderColor: Colors.green + '66' }]} onPress={() => Linking.openURL(`tel:${c.phone}`)}>
                <Text style={[s.contactBtnText, { color: Colors.green }]}>CALL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.contactBtn, { borderColor: Colors.cyan + '66' }]} onPress={() => Linking.openURL(`sms:${c.phone}`)}>
                <Text style={[s.contactBtnText, { color: Colors.cyan }]}>TEXT</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteContact(c.id)}>
                <Text style={[s.contactBtnText, { color: ACCENT + '88' }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <Corners color={ACCENT} />
          </View>
        ))}

        {contacts.length < 3 && (
          <TouchableOpacity style={s.addContactBtn} onPress={() => setShowAddModal(true)}>
            <Text style={s.addContactText}>+ ADD EMERGENCY CONTACT</Text>
          </TouchableOpacity>
        )}

        {/* ── SOS NUMBERS ── */}
        <SectionHeader title="EMERGENCY NUMBERS" icon="🚨" />
        <View style={s.sosGrid}>
          {SOS_NUMBERS.map(n => (
            <TouchableOpacity
              key={n.label}
              style={[s.sosCard, { borderColor: n.color + '55' }, glowStyle(n.color, 6)]}
              onPress={() => {
                if (n.number.startsWith('#')) {
                  Alert.alert('FESTIVAL MEDICAL', 'Check the festival app or wristband for the on-site medical hotline.');
                } else {
                  Linking.openURL(`tel:${n.number}`);
                }
              }}
            >
              <Text style={[s.sosLabel, { color: n.color }]}>{n.label}</Text>
              <Text style={[s.sosNumber, { color: n.color }]}>{n.number.startsWith('#') ? 'CHECK IN-APP' : n.number}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── WELFARE TENT LOCATOR ── */}
        <SectionHeader title="WELFARE TENT LOCATOR" icon="⛺" />
        {WELFARE_TENTS.map(tent => {
          const dist = userLat !== null && userLng !== null
            ? `${haversineKm(userLat, userLng, tent.lat, tent.lng).toFixed(0)} KM`
            : null;
          return (
            <View key={tent.id} style={s.tentCard}>
              <View style={s.tentLeft}>
                <Text style={[s.tentName, { color: ACCENT }]}>{tent.festival}</Text>
                <Text style={s.tentAddr}>{tent.address}</Text>
                {dist && <Text style={[s.tentDist, { color: Colors.cyan }]}>{dist} FROM YOU</Text>}
              </View>
              <TouchableOpacity style={s.directionsBtn} onPress={() => openDirections(tent)}>
                <Text style={s.directionsBtnText}>DIRECTIONS →</Text>
              </TouchableOpacity>
              <Corners color={ACCENT} />
            </View>
          );
        })}

        {/* ── HYDRATION REMINDER ── */}
        <SectionHeader title="HYDRATION REMINDER" icon="💧" />
        <View style={s.hydrationCard}>
          <View>
            <Text style={s.hydrationTitle}>DRINK WATER ALERT</Text>
            <Text style={s.hydrationSub}>Notification every {HYDRATION_INTERVAL_MINS} minutes</Text>
          </View>
          <TouchableOpacity
            style={[s.toggle, hydrationOn && { backgroundColor: Colors.cyan + '22', borderColor: Colors.cyan }]}
            onPress={toggleHydration}
          >
            <Text style={[s.toggleText, { color: hydrationOn ? Colors.cyan : Colors.dim }]}>
              {hydrationOn ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
          <Corners color={hydrationOn ? Colors.cyan : Colors.dim} />
        </View>

        {/* ── RAVESAFE ── */}
        <SectionHeader title="RAVESAFE — HARM REDUCTION" icon="🔬" />
        {RAVESAFE_CARDS.map(card => {
          const isOpen = expandedCard === card.substance;
          return (
            <TouchableOpacity
              key={card.substance}
              style={[s.raveCard, { borderColor: card.color + '66' }, isOpen && glowStyle(card.color, 8)]}
              onPress={() => setExpandedCard(isOpen ? null : card.substance)}
              activeOpacity={0.8}
            >
              <View style={s.raveCardHeader}>
                <Text style={[s.raveSubstance, { color: card.color }]}>{card.substance}</Text>
                <Text style={[s.raveChevron, { color: card.color }]}>{isOpen ? '▲' : '▼'}</Text>
              </View>
              {isOpen && (
                <View style={s.raveBody}>
                  <Text style={s.raveSection}>SAFE DOSE</Text>
                  <Text style={s.raveText}>{card.safeDose}</Text>
                  <Text style={s.raveSection}>DANGER SIGNS</Text>
                  {card.dangerSigns.map((sign, i) => (
                    <Text key={i} style={[s.raveText, { color: ACCENT }]}>• {sign}</Text>
                  ))}
                  <Text style={s.raveSection}>IF SOMEONE COLLAPSES</Text>
                  {card.ifCollapses.map((step, i) => (
                    <Text key={i} style={s.raveText}>{i + 1}. {step}</Text>
                  ))}
                </View>
              )}
              <Corners color={card.color} />
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Add Contact Modal ── */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setShowAddModal(false)}>
          <TouchableOpacity activeOpacity={1} style={s.modalSheet}>
            <Corners color={ACCENT} />
            <Text style={[s.modalTitle, { color: ACCENT }]}>ADD EMERGENCY CONTACT</Text>
            <TextInput
              style={s.input}
              placeholder="Name"
              placeholderTextColor={Colors.dim}
              value={newName}
              onChangeText={setNewName}
              autoCapitalize="words"
            />
            <TextInput
              style={s.input}
              placeholder="Phone number"
              placeholderTextColor={Colors.dim}
              value={newPhone}
              onChangeText={setNewPhone}
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={[s.saveBtn, { borderColor: ACCENT, backgroundColor: ACCENT + '18' }]} onPress={handleAddContact}>
              <Text style={[s.saveBtnText, { color: ACCENT }]}>SAVE CONTACT</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
};

// ── Styles ─────────────────────────────────────────────────
const CORNER = 10;
const CW = 2;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,51,68,0.15)',
    backgroundColor: 'rgba(3,6,15,0.95)',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 60 },
  backText: { fontSize: 10, letterSpacing: 2, fontFamily: 'Orbitron_700Bold' },
  headerTitle: { fontSize: 15, fontFamily: 'Orbitron_700Bold', letterSpacing: 3 },
  headerRight: { minWidth: 60 },

  scroll: { flex: 1 },
  scrollContent: { paddingTop: 8, paddingHorizontal: 16, paddingBottom: 40 },

  // I AM SAFE
  iamSafeBtn: { position: 'relative', marginBottom: 20, marginTop: 8, borderRadius: 16 },
  iamSafeBtnInner: {
    backgroundColor: Colors.green + '12', borderWidth: 1.5, borderColor: Colors.green + '88',
    borderRadius: 16, paddingVertical: 20, alignItems: 'center', gap: 4,
    ...Platform.select({ web: { boxShadow: `0 0 20px ${Colors.green}40` } as any, default: {} }),
  },
  iamSafeText: { color: Colors.green, fontSize: 20, fontFamily: 'Orbitron_700Bold', letterSpacing: 3 },
  iamSafeSub: { color: Colors.green + 'AA', fontSize: 9, letterSpacing: 2, fontFamily: 'ShareTechMono_400Regular' },

  // Section header
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 14 },
  sectionLine: { flex: 1, height: 1, opacity: 0.3 },
  sectionTitle: { color: ACCENT, fontSize: 9, letterSpacing: 3, fontFamily: 'Orbitron_700Bold', textTransform: 'uppercase' },

  // Contacts
  contactCard: {
    position: 'relative', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(6,16,36,0.88)', borderWidth: 1, borderColor: 'rgba(255,51,68,0.2)',
    borderRadius: 10, padding: 14, marginBottom: 8,
  },
  contactName: { color: Colors.text, fontSize: 12, fontFamily: 'Orbitron_700Bold', letterSpacing: 1.5 },
  contactPhone: { color: Colors.dim, fontSize: 10, fontFamily: 'ShareTechMono_400Regular', marginTop: 2 },
  contactActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contactBtn: { borderWidth: 1, borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10 },
  contactBtnText: { fontSize: 9, fontFamily: 'Orbitron_700Bold', letterSpacing: 1.5 },
  addContactBtn: {
    borderWidth: 1, borderColor: ACCENT + '55', borderStyle: 'dashed', borderRadius: 10,
    paddingVertical: 14, alignItems: 'center', marginBottom: 4,
  },
  addContactText: { color: ACCENT, fontSize: 10, fontFamily: 'Orbitron_700Bold', letterSpacing: 2 },

  // SOS grid
  sosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  sosCard: {
    flex: 1, minWidth: '45%', backgroundColor: 'rgba(6,16,36,0.88)',
    borderWidth: 1, borderRadius: 10, padding: 14, gap: 4,
  },
  sosLabel: { fontSize: 8, letterSpacing: 2, fontFamily: 'Orbitron_700Bold' },
  sosNumber: { fontSize: 16, fontFamily: 'Orbitron_700Bold', letterSpacing: 1 },

  // Welfare tents
  tentCard: {
    position: 'relative', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(6,16,36,0.88)', borderWidth: 1, borderColor: 'rgba(255,51,68,0.2)',
    borderRadius: 10, padding: 14, marginBottom: 8,
  },
  tentLeft: { flex: 1 },
  tentName: { fontSize: 11, fontFamily: 'Orbitron_700Bold', letterSpacing: 2 },
  tentAddr: { color: Colors.dim, fontSize: 9, fontFamily: 'ShareTechMono_400Regular', marginTop: 2 },
  tentDist: { fontSize: 9, fontFamily: 'Orbitron_700Bold', letterSpacing: 1.5, marginTop: 4 },
  directionsBtn: { borderWidth: 1, borderColor: ACCENT + '66', borderRadius: 12, paddingVertical: 6, paddingHorizontal: 12, marginLeft: 8 },
  directionsBtnText: { color: ACCENT, fontSize: 9, fontFamily: 'Orbitron_700Bold', letterSpacing: 1.5 },

  // Hydration
  hydrationCard: {
    position: 'relative', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(6,16,36,0.88)', borderWidth: 1, borderColor: 'rgba(0,245,255,0.15)',
    borderRadius: 10, padding: 16, marginBottom: 4,
  },
  hydrationTitle: { color: Colors.text, fontSize: 12, fontFamily: 'Orbitron_700Bold', letterSpacing: 2 },
  hydrationSub: { color: Colors.dim, fontSize: 9, fontFamily: 'ShareTechMono_400Regular', marginTop: 2 },
  toggle: { borderWidth: 1, borderColor: Colors.dim, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 18 },
  toggleText: { fontSize: 10, fontFamily: 'Orbitron_700Bold', letterSpacing: 2 },

  // RAVESafe
  raveCard: {
    position: 'relative', backgroundColor: 'rgba(6,16,36,0.9)',
    borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 10,
  },
  raveCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  raveSubstance: { fontSize: 13, fontFamily: 'Orbitron_700Bold', letterSpacing: 3 },
  raveChevron: { fontSize: 11, fontFamily: 'Orbitron_700Bold' },
  raveBody: { marginTop: 12, gap: 4 },
  raveSection: { color: Colors.dim, fontSize: 8, letterSpacing: 2, fontFamily: 'Orbitron_700Bold', marginTop: 10, marginBottom: 2 },
  raveText: { color: Colors.text, fontSize: 11, fontFamily: 'ShareTechMono_400Regular', lineHeight: 17 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(3,6,15,0.85)', justifyContent: 'flex-end' },
  modalSheet: {
    position: 'relative', backgroundColor: 'rgba(6,16,36,0.98)',
    borderTopWidth: 1.5, borderLeftWidth: 1, borderRightWidth: 1, borderColor: ACCENT + '66',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40, gap: 12,
  },
  modalTitle: { fontSize: 13, fontFamily: 'Orbitron_700Bold', letterSpacing: 2, marginBottom: 4 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1,
    borderColor: 'rgba(255,51,68,0.3)', borderRadius: 8,
    paddingVertical: 12, paddingHorizontal: 14, color: Colors.text,
    fontFamily: 'ShareTechMono_400Regular', fontSize: 13, letterSpacing: 1,
  },
  saveBtn: { marginTop: 4, borderWidth: 1.5, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { fontSize: 12, fontFamily: 'Orbitron_700Bold', letterSpacing: 2 },

  // Corner brackets
  cTL: { position: 'absolute', top: 0, left: 0, width: CORNER, height: CORNER, borderTopWidth: CW, borderLeftWidth: CW },
  cTR: { position: 'absolute', top: 0, right: 0, width: CORNER, height: CORNER, borderTopWidth: CW, borderRightWidth: CW },
  cBL: { position: 'absolute', bottom: 0, left: 0, width: CORNER, height: CORNER, borderBottomWidth: CW, borderLeftWidth: CW },
  cBR: { position: 'absolute', bottom: 0, right: 0, width: CORNER, height: CORNER, borderBottomWidth: CW, borderRightWidth: CW },
});
