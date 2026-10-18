import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useDatabase } from '../context/DatabaseContext';

export const MigrateImages: React.FC = () => {
  const { db, updateTeam, updatePlayer } = useDatabase();
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState('');

  const base64ToFile = (base64: string, filename: string): File => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const migrate = async () => {
    if (!supabase) return alert('Supabase not configured');
    setMigrating(true);
    setProgress('Starting migration...');

    // Migrate Teams
    for (const team of db.teams) {
      if (team.logo && team.logo.startsWith('data:image/')) {
        setProgress(`Migrating logo for team: ${team.team_name}`);
        const file = base64ToFile(team.logo, `team_${team.team_id}.png`);
        const { error, data } = await supabase.storage.from('athlete-images').upload(`${Date.now()}_${file.name}`, file);
        if (!error && data) {
          const { data: { publicUrl } } = supabase.storage.from('athlete-images').getPublicUrl(data.path);
          updateTeam(team.team_id, { logo: publicUrl });
        }
      }
    }

    // Migrate Players
    for (const player of db.players) {
      if (player.photo_url && player.photo_url.startsWith('data:image/')) {
        setProgress(`Migrating photo for player: ${player.player_name}`);
        const file = base64ToFile(player.photo_url, `player_${player.player_id}.png`);
        const { error, data } = await supabase.storage.from('athlete-images').upload(`${Date.now()}_${file.name}`, file);
        if (!error && data) {
          const { data: { publicUrl } } = supabase.storage.from('athlete-images').getPublicUrl(data.path);
          updatePlayer(player.player_id, { photo_url: publicUrl });
        }
      }
    }

    setMigrating(false);
    setProgress('Migration complete!');
  };

  return (
    <div className="p-4 border rounded bg-gray-50 mt-4">
      <h3 className="font-bold">Image Migration</h3>
      <p className="text-sm text-gray-600 mb-2">Migrate existing base64 images to Supabase Storage.</p>
      <button 
        onClick={migrate} 
        disabled={migrating}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {migrating ? 'Migrating...' : 'Start Migration'}
      </button>
      {progress && <p className="mt-2 text-sm">{progress}</p>}
    </div>
  );
};
