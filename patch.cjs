const fs = require('fs');
let code = fs.readFileSync('src/components/LiveMatchControlModal.tsx', 'utf8');

const start = code.indexOf('{/* Bottom Footer Area */}');
code = code.substring(0, start) + `      </div>
      {/* Bottom Footer Area */}
      <div style={{ position: "relative", background: "white", padding: "16px 24px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          
          {showActivityLog && (
            <div style={{ position: "absolute", bottom: "100%", right: "24px", marginBottom: "8px", width: "320px", background: "white", borderRadius: "12px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0", zIndex: 10, display: "flex", flexDirection: "column", maxHeight: "300px" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", fontWeight: "600", fontSize: "13px", color: "#0f172a" }}>Activity Log</div>
              <div style={{ padding: "8px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "2px" }}>
                {db.activityLogs.filter(log => log.message.includes(match.sport)).slice().reverse().slice(0, 15).map((log, i) => (
                  <div key={i} style={{ padding: "8px", fontSize: "12px", color: "#475569", borderBottom: i < 14 ? "1px solid #f8fafc" : "none" }}>
                    <span style={{ color: "#94a3b8", fontSize: "10px", marginRight: "8px" }}>{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    {log.message}
                  </div>
                ))}
                {db.activityLogs.filter(log => log.message.includes(match.sport)).length === 0 && (
                  <div style={{ padding: "16px", textAlign: "center", color: "#94a3b8", fontSize: "12px" }}>No recent activity for this sport.</div>
                )}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <button 
              onClick={handleUndo}
              disabled={actionHistory.length === 0}
              style={{ background: actionHistory.length > 0 ? "#ec4899" : "#f1f5f9", color: actionHistory.length > 0 ? "white" : "#94a3b8", padding: "8px 24px", borderRadius: "100px", fontWeight: "600", border: "none", fontSize: "11px", cursor: actionHistory.length > 0 ? "pointer" : "not-allowed", display: "flex", gap: "8px", alignItems: "center", letterSpacing: "0.5px", transition: "all 0.2s" }}
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
               UNDO LAST ACTION
            </button>
            <div style={{ background: "#f8fafc", padding: "8px 16px", borderRadius: "100px", fontSize: "11px", fontWeight: "600", color: "#475569", display: "flex", alignItems: "center", gap: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ width: 6, height: 6, background: match.clock_status === "paused" ? "#1e293b" : "#22c55e", borderRadius: "50%" }}></span>
              {match.clock_status === "paused" ? "MATCH PAUSED" : "CLOCK RUNNING"}
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ background: "#f0fdf4", color: "#16a34a", padding: "8px 16px", borderRadius: "100px", fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: 6, height: 6, background: "#16a34a", borderRadius: "50%", animation: "pulse 2s infinite" }}></span>
              LIVE BROADCAST ACTIVE
            </div>
            <button onClick={() => setShowActivityLog(!showActivityLog)} style={{ background: showActivityLog ? "#eff6ff" : "transparent", color: "#3b82f6", padding: "8px 16px", borderRadius: "100px", fontSize: "11px", fontWeight: "600", border: "none", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", letterSpacing: "0.5px", transition: "all 0.2s" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              VIEW ACTIVITY LOG
            </button>
          </div>
      </div>
    </div>
  );
}
`;

// Also clean up any extra closing braces at the end.
code = code.replace(/}iv>\s*}\s*$/, '}\n');
fs.writeFileSync('src/components/LiveMatchControlModal.tsx', code);
