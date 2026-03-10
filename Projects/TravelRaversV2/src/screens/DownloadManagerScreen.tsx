import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { downloadOfflineRegion, checkOfflineTiles } from '../utils/mapService';

export const DownloadManagerScreen = () => {
    const navigation = useNavigation();
    const [isDownloading, setIsDownloading] = useState(false);
    const [hasMapPack, setHasMapPack] = useState<boolean | null>(null);

    // Check initial state
    React.useEffect(() => {
        checkOfflineTiles('glastonbury').then(setHasMapPack);
    }, []);

    const handleDownload = async () => {
        setIsDownloading(true);
        await downloadOfflineRegion('glastonbury');
        setIsDownloading(false);
        setHasMapPack(true);
        Alert.alert('DOWNLOAD COMPLETE', 'Mapbox offline region successfully downloaded for Glastonbury.');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>‹ BACK</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>DOWNLOAD MANAGER</Text>
                <View style={{ width: 60 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.packCard}>
                    <Text style={styles.packTitle}>GLASTONBURY FESTIVAL</Text>
                    <Text style={styles.packInfo}>Contains: Map Tiles, POIs, Stages</Text>
                    <Text style={styles.packInfo}>Size: ~25MB</Text>

                    <View style={styles.statusRow}>
                        <Text style={styles.statusLabel}>STATUS:</Text>
                        <Text style={[styles.statusValue, { color: hasMapPack ? Colors.green : Colors.yellow }]}>
                            {hasMapPack ? 'DOWNLOADED ✓' : 'NOT DOWNLOADED'}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.downloadBtn, isDownloading && styles.downloadBtnActive]}
                        onPress={handleDownload}
                        disabled={isDownloading || hasMapPack === true}
                    >
                        <Text style={styles.downloadBtnText}>
                            {isDownloading ? 'DOWNLOADING...' : hasMapPack ? 'PACK IS READY' : 'DOWNLOAD OFFLINE PACK ↓'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.nudgeCard}>
                    <Text style={styles.nudgeText}>⚠ WIFI RECOMMENDED</Text>
                    <Text style={styles.nudgeSubtext}>Download before reaching the festival site.</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 245, 255, 0.2)', // Cyan glow
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        color: Colors.cyan,
        fontFamily: 'ShareTechMono-Regular',
        fontSize: 16,
    },
    headerTitle: {
        color: Colors.text,
        fontFamily: 'Orbitron-Bold',
        fontSize: 18,
        letterSpacing: 2,
    },
    content: {
        padding: 24,
    },
    packCard: {
        backgroundColor: 'rgba(6, 16, 36, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(0, 245, 255, 0.3)',
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
    },
    packTitle: {
        color: Colors.cyan,
        fontSize: 18,
        fontFamily: 'Orbitron-Bold',
        letterSpacing: 2,
        marginBottom: 12,
    },
    packInfo: {
        color: Colors.dim,
        fontFamily: 'Rajdhani-Medium',
        fontSize: 14,
        marginBottom: 6,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    statusLabel: {
        color: Colors.dim,
        fontFamily: 'ShareTechMono-Regular',
        fontSize: 12,
        marginRight: 8,
    },
    statusValue: {
        fontFamily: 'Orbitron-Bold',
        fontSize: 12,
        letterSpacing: 1,
    },
    downloadBtn: {
        backgroundColor: 'rgba(0, 245, 255, 0.1)',
        borderWidth: 1,
        borderColor: Colors.cyan,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    downloadBtnActive: {
        backgroundColor: 'rgba(0, 245, 255, 0.3)',
    },
    downloadBtnText: {
        color: Colors.cyan,
        fontFamily: 'Orbitron-Bold',
        fontSize: 12,
        letterSpacing: 2,
    },
    nudgeCard: {
        backgroundColor: 'rgba(255, 179, 0, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 179, 0, 0.3)',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    nudgeText: {
        color: Colors.yellow,
        fontFamily: 'Orbitron-Bold',
        fontSize: 12,
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    nudgeSubtext: {
        color: Colors.dim,
        fontFamily: 'Rajdhani-Medium',
        fontSize: 12,
    },
});
