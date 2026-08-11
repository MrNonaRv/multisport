const fs = require('fs');

function patchFile(filePath, isSportPage) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Insert mvp resolution logic
  const searchStr = `const getStat = (playerId: number, statKey: string) => {`;
  const insertLogic = `
    const mvpIdToUse = match.mvp_id || (match.status === "completed" ? (() => {
        const matchStats = db.playerStats.filter(s => s.match_id === match.match_id);
        if (matchStats.length > 0) {
           return [...matchStats].sort((a, b) => ((b as any)[sportStats[0]] || 0) - ((a as any)[sportStats[0]] || 0))[0]?.player_id;
        }
        return null;
    })() : null);
    
    const mvpPlayer = mvpIdToUse ? db.players.find(p => p.player_id === mvpIdToUse) : null;
    const mvpTeam = mvpPlayer && isSportPage ? gTeam(mvpPlayer.team_id) : (mvpPlayer ? teamsMap[mvpPlayer.team_id] : null);
  `;
  
  if (isSportPage) {
     code = code.replace(searchStr, insertLogic.replace('isSportPage', 'true') + '\n' + searchStr);
  } else {
     code = code.replace(searchStr, insertLogic.replace('isSportPage', 'false') + '\n' + searchStr);
  }

  // Insert MVP UI block inside the modal body
  // For Dashboard.tsx
  if (!isSportPage) {
    const dashboardSearch = `<div style={{ padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 30 }}>`;
    const mvpUi = `
            {mvpPlayer && (
              <div style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", padding: 20, borderRadius: 12, display: "flex", alignItems: "center", gap: 20, color: "#fff", boxShadow: "0 10px 15px -3px rgba(245, 158, 11, 0.3)" }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#fff", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900 }}>
                  {mvpPlayer.player_name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, opacity: 0.9 }}>Match MVP</div>
                  <div style={{ fontSize: 24, fontWeight: 900 }}>{mvpPlayer.player_name}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, opacity: 0.9 }}>{mvpTeam?.team_name} • No. {mvpPlayer.jersey_number}</div>
                </div>
              </div>
            )}
    `;
    code = code.replace(dashboardSearch, dashboardSearch + mvpUi);
  } else {
    // For SportPage.tsx
    const sportSearch = `{/* Match Info summary */}`;
    const mvpUi = `
                {mvpPlayer && (
                  <div style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", padding: 20, borderRadius: 12, display: "flex", alignItems: "center", gap: 20, color: "#fff", boxShadow: "0 10px 15px -3px rgba(245, 158, 11, 0.3)" }}>
                    <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#fff", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900 }}>
                      {mvpPlayer.player_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, opacity: 0.9 }}>Match MVP</div>
                      <div style={{ fontSize: 24, fontWeight: 900 }}>{mvpPlayer.player_name}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, opacity: 0.9 }}>{mvpTeam?.team_name} • No. {mvpPlayer.jersey_number}</div>
                    </div>
                  </div>
                )}
    `;
    code = code.replace(sportSearch, mvpUi + '\n                ' + sportSearch);
  }

  // Also include MVP in print report logic
  const printSearch = `WINNER: \${match.winner.toUpperCase()}</div>\` : ''}`;
  const mvpPrintUi = `
                            \${mvpPlayer ? \`
                              <div style="margin-bottom: 20px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 16px;">
                                <div style="width: 50px; height: 50px; border-radius: 50%; background: #f59e0b; color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 900;">
                                  \${mvpPlayer.player_name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div style="font-size: 11px; font-weight: 800; color: #d97706; text-transform: uppercase;">Match MVP</div>
                                  <div style="font-size: 18px; font-weight: 900; color: #92400e;">\${mvpPlayer.player_name}</div>
                                  <div style="font-size: 12px; font-weight: 700; color: #b45309;">\${mvpTeam?.team_name} • No. \${mvpPlayer.jersey_number}</div>
                                </div>
                              </div>
                            \` : ''}
  `;
  code = code.replace(printSearch, printSearch + mvpPrintUi);

  fs.writeFileSync(filePath, code);
}

patchFile('src/pages/Dashboard.tsx', false);
patchFile('src/pages/SportPage.tsx', true);
