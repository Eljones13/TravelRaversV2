import { create } from 'zustand';

export interface Peer {
  id: string;
  name: string;
  bearing: number;   // degrees 0–359, 0 = North
  distance: number;  // metres
  color: string;
  lastSeen: number;  // unix timestamp ms
}

export type ConnectionStatus = 'SCANNING' | 'ACTIVE' | 'OFFLINE';

interface MeshStore {
  myNodeId: string;
  peers: Peer[];
  connectionStatus: ConnectionStatus;
}

const generateNodeId = (): string =>
  Math.random().toString(16).slice(2, 10).toUpperCase();

const NOW = Date.now();

const SIMULATED_PEERS: Peer[] = [
  {
    id: 'peer-sandy',
    name: 'SANDY',
    bearing: 45,
    distance: 180,
    color: '#00f5ff',
    lastSeen: NOW,
  },
  {
    id: 'peer-basecamp',
    name: 'BASE CAMP',
    bearing: 260,
    distance: 320,
    color: '#ff8c00',
    lastSeen: NOW - 12000,
  },
  {
    id: 'peer-rtag',
    name: 'RTAG',
    bearing: 190,
    distance: 90,
    color: '#00ff88',
    lastSeen: NOW - 5000,
  },
  {
    id: 'peer-dex',
    name: 'DEX',
    bearing: 310,
    distance: 140,
    color: '#ff00ff',
    lastSeen: NOW - 45000,
  },
];

export const useMeshStore = create<MeshStore>(() => ({
  myNodeId: generateNodeId(),
  peers: SIMULATED_PEERS,
  connectionStatus: 'ACTIVE',
}));
