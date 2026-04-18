import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLocalLeaderboard, clearLocalLeaderboard } from '../services/localLeaderboard';
import { fetchLeaderboard } from '../services/leaderboardApi';
import useGameStore from '../store/gameStore';
import { PALETTE } from '../constants';
import { Card, Title, Body, Button } from '../components/ui';

const SHAPE_ICONS = { triangle: '▲', circle: '●', hexagon: '⬡', square: '■', pentagon: '⬠' };

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function RankBadge({ rank }) {
  const color = rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : PALETTE.textDim;
  const label = rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`;
  return <Body style={{ width: 36, fontSize: rank <= 3 ? 18 : 13, color, textAlign: 'center' }}>{label}</Body>;
}

function ScoreRow({ item, index, myName }) {
  const isMe = item.playerName === myName;
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: 10, paddingHorizontal: 8,
      borderBottomWidth: 1, borderColor: PALETTE.border,
      backgroundColor: isMe ? 'rgba(255,204,68,0.06)' : 'transparent',
    }}>
      <RankBadge rank={index + 1} />
      <Body style={{ flex: 1, fontSize: 13, color: isMe ? '#FFCC44' : PALETTE.textPrimary, fontWeight: isMe ? 'bold' : 'normal' }}>
        {item.playerName}
      </Body>
      <Body style={{ fontSize: 11, color: PALETTE.textDim, marginRight: 8 }}>
        {SHAPE_ICONS[item.shape] || '?'}
      </Body>
      <Body style={{ width: 52, fontSize: 11, color: PALETTE.textDim, textAlign: 'right', marginRight: 8 }}>
        {formatTime(item.survivalTime || 0)}
      </Body>
      <Body style={{ width: 70, fontSize: 13, color: '#BB88FF', fontWeight: 'bold', textAlign: 'right' }}>
        {(item.score || 0).toLocaleString()}
      </Body>
    </View>
  );
}

export default function LeaderboardScreen() {
  const goToMenu    = useGameStore(s => s.goToMenu);
  const meta        = useGameStore(s => s.meta);
  const playerName  = meta.playerName || 'Anonyme';

  const [tab, setTab]         = useState('local');
  const [local, setLocal]     = useState([]);
  const [global, setGlobal]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalErr, setGlobalErr] = useState(null);

  useEffect(() => {
    getLocalLeaderboard().then(setLocal);
  }, []);

  useEffect(() => {
    if (tab === 'global' && global.length === 0 && !globalErr) {
      setLoading(true);
      fetchLeaderboard()
        .then(setGlobal)
        .catch(e => setGlobalErr(e.message || 'Non disponible'))
        .finally(() => setLoading(false));
    }
  }, [tab]);

  const handleClearLocal = async () => {
    await clearLocalLeaderboard();
    setLocal([]);
  };

  const data = tab === 'local' ? local : global;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PALETTE.bg }}>
      {/* Header */}
      <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Button label="← Menu" onPress={goToMenu} style={{ minWidth: 80, paddingVertical: 8 }} />
        <Title style={{ fontSize: 18 }}>🏆 Leaderboard</Title>
        <View style={{ width: 80 }} />
      </Card>

      {/* Onglets */}
      <View style={{ flexDirection: 'row', marginHorizontal: 12, marginBottom: 12, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: PALETTE.border }}>
        {['local', 'global'].map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={{ flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: tab === t ? PALETTE.accent : PALETTE.bgCard }}
          >
            <Body style={{ fontSize: 13, fontWeight: 'bold', color: tab === t ? '#111' : PALETTE.textDim }}>
              {t === 'local' ? '📱 Local' : '🌍 Mondial'}
            </Body>
          </TouchableOpacity>
        ))}
      </View>

      {/* Colonnes header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, marginBottom: 4 }}>
        <Body style={{ width: 36, fontSize: 10, color: PALETTE.textDim, textAlign: 'center' }}>#</Body>
        <Body style={{ flex: 1, fontSize: 10, color: PALETTE.textDim }}>Joueur</Body>
        <Body style={{ fontSize: 10, color: PALETTE.textDim, marginRight: 8 }}>Classe</Body>
        <Body style={{ width: 52, fontSize: 10, color: PALETTE.textDim, textAlign: 'right', marginRight: 8 }}>Temps</Body>
        <Body style={{ width: 70, fontSize: 10, color: PALETTE.textDim, textAlign: 'right' }}>Score</Body>
      </View>

      {/* Liste */}
      {loading ? (
        <ActivityIndicator color={PALETTE.accent} style={{ marginTop: 40 }} />
      ) : tab === 'global' && globalErr ? (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Body style={{ color: PALETTE.textDim, fontSize: 14, marginBottom: 8 }}>🌐 Serveur non disponible</Body>
          <Body style={{ color: PALETTE.textDim, fontSize: 12 }}>{globalErr}</Body>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => item.id || String(item.date)}
          contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 20 }}
          renderItem={({ item, index }) => (
            <ScoreRow item={item} index={index} myName={playerName} />
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Body style={{ color: PALETTE.textDim, fontSize: 14 }}>
                {tab === 'local' ? 'Aucune run enregistrée.' : 'Aucun score mondial.'}
              </Body>
              {tab === 'local' && (
                <Body style={{ color: PALETTE.textDim, fontSize: 12, marginTop: 8 }}>
                  Joue ta première run pour apparaître ici !
                </Body>
              )}
            </View>
          }
        />
      )}

      {/* Clear local */}
      {tab === 'local' && local.length > 0 && (
        <TouchableOpacity onPress={handleClearLocal} style={{ alignItems: 'center', paddingVertical: 12 }}>
          <Body style={{ fontSize: 11, color: '#FF4455' }}>Effacer l'historique local</Body>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
