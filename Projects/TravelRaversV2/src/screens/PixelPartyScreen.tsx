// ============================================================
// TRAVEL RAVERS — PixelPartyScreen
// Session 3-C/D: Full build — local SQLite photo albums, QR share code,
//   camera/gallery via expo-image-picker, Supabase cloud-sync upsell
// Accent: Hot Pink (#FF2D78)
//
// NOTE: Install expo-image-picker before testing camera:
//   npx expo install expo-image-picker
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, Platform, KeyboardAvoidingView,
  Pressable, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { sql } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import { db } from '../db/database';
import { pixelAlbums, pixelPhotos } from '../db/schema';
import type { PixelAlbum, PixelPhoto } from '../db/schema';
import { Colors } from '../constants/colors';

const C = Colors.module.PIXELPARTY; // '#FF2D78'

// Generate a random 6-char album code
const genCode = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

// ── Glass card helper ─────────────────────────────────────────
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
    borderRadius: 16, borderWidth: 1, borderColor: `${C}44`,
    backgroundColor: 'rgba(6,16,36,0.92)', overflow: 'hidden',
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

// ── Pick image via expo-image-picker (dynamic require — install separately) ──
async function pickImage(): Promise<string | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const IP = require('expo-image-picker');
    const { status } = await IP.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access in Settings.');
      return null;
    }
    const result = await IP.launchImageLibraryAsync({ mediaTypes: IP.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled && result.assets?.[0]) return result.assets[0].uri as string;
  } catch {
    Alert.alert('Camera unavailable', 'Run: npx expo install expo-image-picker');
  }
  return null;
}

async function takePhoto(): Promise<string | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const IP = require('expo-image-picker');
    const { status } = await IP.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow camera access in Settings.');
      return null;
    }
    const result = await IP.launchCameraAsync({ mediaTypes: IP.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled && result.assets?.[0]) return result.assets[0].uri as string;
  } catch {
    Alert.alert('Camera unavailable', 'Run: npx expo install expo-image-picker');
  }
  return null;
}

type AlbumWithCount = PixelAlbum & { photoCount: number };

// ── PixelPartyScreen ──────────────────────────────────────────
export const PixelPartyScreen: React.FC<{ navigation: { goBack: () => void } }> = ({ navigation }) => {
  const [albums,      setAlbums]      = useState<AlbumWithCount[]>([]);
  const [activeAlbum, setActiveAlbum] = useState<AlbumWithCount | null>(null);
  const [photos,      setPhotos]      = useState<PixelPhoto[]>([]);
  const [showCreate,  setShowCreate]  = useState(false);
  const [showJoin,    setShowJoin]    = useState(false);
  const [newName,     setNewName]     = useState('');
  const [revealDate,  setRevealDate]  = useState('');
  const [joinCode,    setJoinCode]    = useState('');

  const loadAlbums = async () => {
    try {
      const rows = await db.select().from(pixelAlbums);
      const withCount: AlbumWithCount[] = await Promise.all(
        (rows as PixelAlbum[]).map(async (a) => {
          const ph = await db.select().from(pixelPhotos).where(eq(pixelPhotos.albumId, a.id));
          return { ...a, photoCount: (ph as PixelPhoto[]).length };
        })
      );
      setAlbums(withCount.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    } catch { /* web mock */ }
  };

  const loadPhotos = async (albumId: string) => {
    try {
      const rows = await db.select().from(pixelPhotos).where(eq(pixelPhotos.albumId, albumId));
      setPhotos(rows as PixelPhoto[]);
    } catch { /* web mock */ }
  };

  useEffect(() => { void loadAlbums(); }, []);

  // ── Create album ──────────────────────────────────────────
  const createAlbum = async () => {
    if (!newName.trim()) { Alert.alert('Album name required'); return; }
    const id = `album-${Date.now()}`;
    try {
      await db.run(sql`
        INSERT INTO pixel_albums (id, name, code, created_at, reveal_at)
        VALUES (${id}, ${newName.trim()}, ${genCode()}, ${new Date().toISOString()}, ${revealDate || null})
      `);
    } catch { /* web mock */ }
    setShowCreate(false);
    setNewName('');
    setRevealDate('');
    void loadAlbums();
  };

  // ── Join album by code ─────────────────────────────────────
  const joinByCode = async () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 6) { Alert.alert('Enter a 6-character code'); return; }
    const found = albums.find((a) => a.code === code);
    if (!found) {
      Alert.alert('Not found', `No local album with code ${code}.\nAsk the creator to share it.`);
      return;
    }
    setActiveAlbum(found);
    setShowJoin(false);
    setJoinCode('');
    void loadPhotos(found.id);
  };

  // ── Add photo to active album ──────────────────────────────
  const addPhoto = async (source: 'camera' | 'gallery') => {
    if (!activeAlbum) return;
    const uri = source === 'camera' ? await takePhoto() : await pickImage();
    if (!uri) return;
    const id = `photo-${Date.now()}`;
    try {
      await db.run(sql`
        INSERT INTO pixel_photos (id, album_id, uri, taken_at)
        VALUES (${id}, ${activeAlbum.id}, ${uri}, ${new Date().toISOString()})
      `);
    } catch { /* web mock */ }
    void loadPhotos(activeAlbum.id);
    void loadAlbums();
  };

  // ── Delete album ───────────────────────────────────────────
  const deleteAlbum = (album: AlbumWithCount) => {
    Alert.alert('Delete Album', `Delete "${album.name}" and all its photos?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await db.delete(pixelPhotos).where(eq(pixelPhotos.albumId, album.id));
            await db.delete(pixelAlbums).where(eq(pixelAlbums.id, album.id));
          } catch { /* web */ }
          if (activeAlbum?.id === album.id) setActiveAlbum(null);
          void loadAlbums();
        },
      },
    ]);
  };

  // ── Album detail view ──────────────────────────────────────
  if (activeAlbum) {
    const isRevealed = !activeAlbum.revealAt || new Date(activeAlbum.revealAt) <= new Date();

    return (
      <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => { setActiveAlbum(null); void loadAlbums(); }}>
            <Text style={s.backText}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>{activeAlbum.name.toUpperCase()}</Text>
            <Text style={s.subtitle}>{photos.length} PHOTOS · CODE: {activeAlbum.code}</Text>
          </View>
        </View>

        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
          {/* Share code card */}
          <GlassCard style={s.codeCard}>
            <Text style={s.codeLabelSmall}>SHARE CODE</Text>
            <Text style={s.codeText}>{activeAlbum.code}</Text>
            <Text style={s.codeHint}>SHOW THIS TO YOUR CREW TO JOIN THIS ALBUM</Text>
          </GlassCard>

          {/* Reveal status */}
          {!isRevealed ? (
            <GlassCard style={s.lockedCard}>
              <Text style={s.lockedIcon}>🔒</Text>
              <Text style={s.lockedLabel}>PHOTOS LOCKED UNTIL</Text>
              <Text style={s.lockedDate}>{activeAlbum.revealAt?.split('T')[0] ?? '—'}</Text>
              <Text style={s.lockedHint}>ALBUM REVEALS AT END OF FESTIVAL</Text>
            </GlassCard>
          ) : null}

          {/* Add photo buttons */}
          <View style={s.addPhotoRow}>
            <TouchableOpacity style={s.addPhotoBtn} onPress={() => void addPhoto('camera')}>
              <Text style={s.addPhotoIcon}>📷</Text>
              <Text style={s.addPhotoBtnText}>CAMERA</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.addPhotoBtn} onPress={() => void addPhoto('gallery')}>
              <Text style={s.addPhotoIcon}>🖼️</Text>
              <Text style={s.addPhotoBtnText}>GALLERY</Text>
            </TouchableOpacity>
          </View>

          {/* Photos grid */}
          {isRevealed && photos.length > 0 ? (
            <View>
              <Text style={s.gridHeader}>SHOTS ({photos.length})</Text>
              <View style={s.photoGrid}>
                {photos.map((p) => (
                  <View key={p.id} style={s.photoSlot}>
                    <Text style={s.photoEmoji}>📸</Text>
                    <Text style={s.photoTime}>
                      {new Date(p.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {isRevealed && photos.length === 0 ? (
            <View style={s.emptyPhotos}>
              <Text style={s.emptyPhotoText}>NO SHOTS YET — HIT CAMERA TO ADD YOUR FIRST PHOTO</Text>
            </View>
          ) : null}

          {/* Supabase upsell */}
          <GlassCard style={s.upsellCard}>
            <LinearGradient
              colors={[`${C}11`, 'transparent']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />
            <Text style={s.upsellIcon}>☁️</Text>
            <Text style={s.upsellTitle}>SYNC TO CLOUD</Text>
            <Text style={s.upsellDesc}>
              Share photos with your whole squad in real-time.{'\n'}
              Cloud sync unlocks with Travel Ravers Pro.
            </Text>
            <TouchableOpacity style={s.upsellBtn} onPress={() =>
              Alert.alert('Travel Ravers Pro', 'Cloud sync coming in Phase 4. Stay tuned!')
            }>
              <Text style={s.upsellBtnText}>UNLOCK PRO →</Text>
            </TouchableOpacity>
          </GlassCard>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Album list view ────────────────────────────────────────
  return (
    <SafeAreaView style={s.safeArea} edges={['top', 'left', 'right']}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>PIXEL PARTY</Text>
          <Text style={s.subtitle}>SHARED PHOTO ALBUMS</Text>
        </View>
        <TouchableOpacity style={s.joinBtn} onPress={() => setShowJoin(true)}>
          <Text style={s.joinBtnText}>JOIN</Text>
        </TouchableOpacity>
      </View>

      {/* Album list */}
      {albums.length === 0 ? (
        <View style={s.emptyState}>
          <Text style={s.emptyEmoji}>📸</Text>
          <Text style={s.emptyTitle}>NO ALBUMS YET</Text>
          <Text style={s.emptyDesc}>
            Create your first disposable album{'\n'}
            and share the code with your crew.
          </Text>
          <TouchableOpacity style={s.createBigBtn} onPress={() => setShowCreate(true)}>
            <Text style={s.createBigText}>+ CREATE ALBUM</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.joinTextBtn} onPress={() => setShowJoin(true)}>
            <Text style={s.joinTextBtnText}>Or enter a crew's album code →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={albums}
          keyExtractor={(a) => a.id}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: album }) => (
            <TouchableOpacity
              onPress={() => { setActiveAlbum(album); void loadPhotos(album.id); }}
            >
              <GlassCard style={s.albumCard}>
                <View style={s.albumRow}>
                  <Text style={s.albumEmoji}>📸</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.albumName}>{album.name.toUpperCase()}</Text>
                    <View style={s.albumMeta}>
                      <Text style={s.albumCode}>CODE: {album.code}</Text>
                      <Text style={s.albumDot}> · </Text>
                      <Text style={s.albumCount}>{album.photoCount} PHOTOS</Text>
                    </View>
                    {album.revealAt ? (
                      <Text style={s.albumReveal}>
                        {new Date(album.revealAt) <= new Date() ? '🔓 REVEALED' : `🔒 REVEALS ${album.revealAt.split('T')[0]}`}
                      </Text>
                    ) : null}
                  </View>
                  <TouchableOpacity onPress={() => deleteAlbum(album)} style={s.albumDelete}>
                    <Text style={s.albumDeleteText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            <View style={{ paddingHorizontal: 14, paddingBottom: 100 }}>
              <GlassCard style={s.upsellCard}>
                <LinearGradient
                  colors={[`${C}11`, 'transparent']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                  pointerEvents="none"
                />
                <Text style={s.upsellIcon}>☁️</Text>
                <Text style={s.upsellTitle}>SYNC TO CLOUD</Text>
                <Text style={s.upsellDesc}>
                  Share with your whole crew in real-time.{'\n'}
                  Cloud sync unlocks with Travel Ravers Pro.
                </Text>
                <TouchableOpacity style={s.upsellBtn} onPress={() =>
                  Alert.alert('Travel Ravers Pro', 'Cloud sync coming in Phase 4. Stay tuned!')
                }>
                  <Text style={s.upsellBtnText}>UNLOCK PRO →</Text>
                </TouchableOpacity>
              </GlassCard>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={s.fab} onPress={() => setShowCreate(true)}>
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>

      {/* Create Album Modal */}
      <Modal visible={showCreate} transparent animationType="slide">
        <KeyboardAvoidingView style={s.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable style={s.modalBackdrop} onPress={() => setShowCreate(false)} />
          <View style={s.modalSheet}>
            <LinearGradient
              colors={['rgba(255,255,255,0.05)', 'transparent']}
              start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />
            <Text style={s.modalTitle}>CREATE ALBUM</Text>

            <Text style={s.fieldLabel}>ALBUM NAME *</Text>
            <TextInput
              style={s.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="e.g. Friday Night Crew"
              placeholderTextColor={Colors.dim}
              autoCapitalize="words"
              autoFocus
            />

            <Text style={s.fieldLabel}>REVEAL DATE (optional)</Text>
            <TextInput
              style={s.input}
              value={revealDate}
              onChangeText={setRevealDate}
              placeholder="YYYY-MM-DD (leave blank to reveal now)"
              placeholderTextColor={Colors.dim}
            />
            <Text style={s.fieldHint}>Photos are hidden until this date — the classic disposable camera effect.</Text>

            <View style={s.modalActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowCreate(false)}>
                <Text style={s.cancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.addBtn} onPress={() => void createAlbum()}>
                <Text style={s.addText}>CREATE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Join Album Modal */}
      <Modal visible={showJoin} transparent animationType="slide">
        <KeyboardAvoidingView style={s.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable style={s.modalBackdrop} onPress={() => setShowJoin(false)} />
          <View style={s.modalSheet}>
            <LinearGradient
              colors={['rgba(255,255,255,0.05)', 'transparent']}
              start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />
            <Text style={s.modalTitle}>JOIN ALBUM</Text>
            <Text style={s.fieldLabel}>6-CHARACTER CODE</Text>
            <TextInput
              style={[s.input, s.codeInput]}
              value={joinCode}
              onChangeText={(v) => setJoinCode(v.toUpperCase())}
              placeholder="e.g. X4F7K2"
              placeholderTextColor={Colors.dim}
              maxLength={6}
              autoCapitalize="characters"
              autoFocus
            />
            <View style={s.modalActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowJoin(false)}>
                <Text style={s.cancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.addBtn} onPress={() => void joinByCode()}>
                <Text style={s.addText}>JOIN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
};

export default PixelPartyScreen;

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
  joinBtn: {
    borderWidth: 1, borderColor: `${C}66`, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6, backgroundColor: `${C}11`,
  },
  joinBtnText: { color: C, fontSize: 9, letterSpacing: 2, fontWeight: '700' },

  // Scroll / list
  scroll: { flex: 1 },
  scrollContent: { padding: 14, gap: 12 },
  listContent: { padding: 14, gap: 10 },

  // Empty state
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 12 },
  emptyDesc: {
    color: Colors.dim, fontSize: 12, letterSpacing: 1,
    textAlign: 'center', lineHeight: 20, marginBottom: 28,
  },
  createBigBtn: {
    paddingVertical: 16, paddingHorizontal: 32, borderRadius: 14,
    borderWidth: 1.5, borderColor: C, backgroundColor: `${C}22`, marginBottom: 16,
    ...Platform.select({
      web: { boxShadow: `0 0 20px ${C}66` } as object,
      default: { shadowColor: C, shadowRadius: 20, shadowOpacity: 0.5, elevation: 10 },
    }),
  },
  createBigText: { color: C, fontSize: 12, letterSpacing: 3, fontWeight: '700' },
  joinTextBtn: { marginTop: 8 },
  joinTextBtnText: { color: Colors.dim, fontSize: 10, letterSpacing: 1 },

  // Album cards
  albumCard: { padding: 14 },
  albumRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  albumEmoji: { fontSize: 28 },
  albumName: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  albumMeta: { flexDirection: 'row', alignItems: 'center' },
  albumCode: { color: C, fontSize: 9, letterSpacing: 2, fontWeight: '700' },
  albumDot: { color: Colors.dim, fontSize: 9 },
  albumCount: { color: Colors.dim, fontSize: 9, letterSpacing: 1 },
  albumReveal: { color: Colors.dim, fontSize: 8, letterSpacing: 1, marginTop: 4 },
  albumDelete: { padding: 4 },
  albumDeleteText: { color: Colors.module.SOS, fontSize: 16, fontWeight: '700', opacity: 0.7 },

  // FAB
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(6,16,36,0.95)',
    borderWidth: 1.5, borderColor: C, alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: `0 0 20px ${C}99` } as object,
      default: { shadowColor: C, shadowRadius: 20, shadowOpacity: 0.7, elevation: 12 },
    }),
  },
  fabText: { color: C, fontSize: 28, fontWeight: '300', lineHeight: 32 },

  // Album detail — code card
  codeCard: { padding: 20, alignItems: 'center' },
  codeLabelSmall: { color: Colors.dim, fontSize: 8, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 },
  codeText: {
    color: C, fontSize: 36, fontWeight: '900', letterSpacing: 12,
    textTransform: 'uppercase', marginBottom: 8,
    ...Platform.select({
      web: { textShadow: `0 0 20px ${C}` } as object,
      default: { textShadowColor: C, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20 },
    }),
  },
  codeHint: { color: Colors.dim, fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center' },

  // Album detail — locked
  lockedCard: { padding: 20, alignItems: 'center' },
  lockedIcon: { fontSize: 32, marginBottom: 8 },
  lockedLabel: { color: Colors.dim, fontSize: 8, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 },
  lockedDate: { color: Colors.yellow, fontSize: 18, fontWeight: '900', letterSpacing: 4, marginBottom: 4 },
  lockedHint: { color: Colors.dim, fontSize: 8, letterSpacing: 2, textTransform: 'uppercase' },

  // Album detail — add photo buttons
  addPhotoRow: { flexDirection: 'row', gap: 10 },
  addPhotoBtn: {
    flex: 1, paddingVertical: 16, alignItems: 'center',
    borderRadius: 14, borderWidth: 1.5, borderColor: `${C}66`, backgroundColor: `${C}11`,
  },
  addPhotoIcon: { fontSize: 28, marginBottom: 4 },
  addPhotoBtnText: { color: C, fontSize: 9, letterSpacing: 2, fontWeight: '700' },

  // Photos grid
  gridHeader: { color: Colors.dim, fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoSlot: {
    width: 80, height: 80, borderRadius: 10,
    backgroundColor: 'rgba(255,45,120,0.1)',
    borderWidth: 1, borderColor: `${C}33`,
    alignItems: 'center', justifyContent: 'center',
  },
  photoEmoji: { fontSize: 28, marginBottom: 2 },
  photoTime: { color: Colors.dim, fontSize: 6, letterSpacing: 1 },

  // Empty photos
  emptyPhotos: { alignItems: 'center', paddingVertical: 24 },
  emptyPhotoText: {
    color: Colors.dim, fontSize: 9, letterSpacing: 2,
    textTransform: 'uppercase', textAlign: 'center', lineHeight: 16,
  },

  // Upsell
  upsellCard: { padding: 20, alignItems: 'center' },
  upsellIcon: { fontSize: 32, marginBottom: 10 },
  upsellTitle: {
    color: C, fontSize: 13, fontWeight: '900', letterSpacing: 3,
    textTransform: 'uppercase', marginBottom: 8,
  },
  upsellDesc: { color: Colors.dim, fontSize: 11, letterSpacing: 1, textAlign: 'center', lineHeight: 18, marginBottom: 16 },
  upsellBtn: {
    paddingVertical: 12, paddingHorizontal: 28, borderRadius: 12,
    borderWidth: 1.5, borderColor: C, backgroundColor: `${C}22`,
    ...Platform.select({
      web: { boxShadow: `0 0 14px ${C}66` } as object,
      default: { shadowColor: C, shadowRadius: 14, shadowOpacity: 0.5, elevation: 8 },
    }),
  },
  upsellBtnText: { color: C, fontSize: 10, letterSpacing: 3, fontWeight: '700' },

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
  fieldHint: { color: Colors.dim, fontSize: 8, letterSpacing: 1, marginTop: 6, opacity: 0.7 },
  input: { color: Colors.text, fontSize: 14, borderBottomWidth: 1, borderBottomColor: `${C}44`, paddingVertical: 6 },
  codeInput: { fontSize: 22, letterSpacing: 8, fontWeight: '700', textAlign: 'center' },
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
