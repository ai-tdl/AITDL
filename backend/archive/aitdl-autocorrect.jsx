import { useState, useEffect, useCallback } from "react";

const REPO = "ai-tdl/AITDL";
const WORKFLOW = "AITDL Platform V3 Deployment";

const MOCK_RUNS = [
  {
    id: "22901698060",
    name: "update md files",
    workflow: "AITDL Platform V3 Deployment",
    status: "completed",
    conclusion: "success",
    commit: "924e50d",
    branch: "main",
    triggered_by: "ai-tdl",
    created_at: "2026-03-10T09:41:00Z",
    duration: "17s",
    issues: [],
  },
  {
    id: "22901635512",
    name: "feat: Add initial Next.js portal pages, global layout, styles, and vi…",
    workflow: "AITDL Platform V3 Deployment",
    status: "completed",
    conclusion: "failure",
    commit: "54187fc",
    branch: "main",
    triggered_by: "ai-tdl",
    created_at: "2026-03-10T09:38:00Z",
    duration: "14s",
    issues: [
      { id: "c1", type: "lint", file: "apps/portal/pages/index.jsx", line: 42, message: "Missing key prop in list render", severity: "warning", fix: "Add key={item.id} to mapped elements" },
      { id: "c2", type: "type", file: "apps/portal/pages/index.jsx", line: 87, message: "Prop 'role' expected string, got undefined", severity: "error", fix: "Add defaultProps or optional chaining: role?.name" },
    ],
  },
  {
    id: "22889148638",
    name: "feat: Add initial portal page with gate, role picker, and favicon.",
    workflow: "AITDL Platform V3 Deployment",
    status: "completed",
    conclusion: "failure",
    commit: "ac89a42",
    branch: "main",
    triggered_by: "ai-tdl",
    created_at: "2026-03-09T22:15:00Z",
    duration: "11s",
    issues: [
      { id: "c3", type: "import", file: "apps/portal/pages/_app.jsx", line: 3, message: "Unused import 'Head' from 'next/head'", severity: "warning", fix: "Remove unused import" },
      { id: "c4", type: "style", file: "apps/portal/styles/globals.css", line: 18, message: "Duplicate CSS rule for .btn-primary", severity: "warning", fix: "Merge duplicate rule into single declaration" },
      { id: "c5", type: "security", file: "backend/api/auth.py", line: 54, message: "Hardcoded secret key detected", severity: "critical", fix: "Move to environment variable: os.getenv('SECRET_KEY')" },
    ],
  },
  {
    id: "22878582690",
    name: "heavy corrections",
    workflow: "AITDL Platform V3 Deployment",
    status: "completed",
    conclusion: "success",
    commit: "349164f",
    branch: "main",
    triggered_by: "ai-tdl",
    created_at: "2026-03-09T17:02:00Z",
    duration: "13s",
    issues: [],
  },
];

const SEV_COLOR = { critical: "#ff4444", error: "#ff8c00", warning: "#f0c040", info: "#4fc3f7" };
const SEV_BG = { critical: "#2a0a0a", error: "#1e1000", warning: "#1e1800", info: "#0a1520" };
const CONCL_COLOR = { success: "#00e676", failure: "#ff4444", cancelled: "#888", skipped: "#555" };

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) + " " +
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

const Badge = ({ label, color, bg }) => (
  <span style={{
    display: "inline-block", padding: "2px 10px", borderRadius: "999px",
    fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em",
    color, background: bg || color + "22", border: `1px solid ${color}44`
  }}>{label}</span>
);

export default function App() {
  const [runs] = useState(MOCK_RUNS);
  const [selected, setSelected] = useState(null);
  const [log, setLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem("aitdl_log") || "[]"); } catch { return []; }
  });
  const [approvals, setApprovals] = useState({});
  const [activeTab, setActiveTab] = useState("runs");
  const [toast, setToast] = useState(null);
  const [token, setToken] = useState("");
  const [tokenInput, setTokenInput] = useState("");

  const addLog = useCallback((entry) => {
    setLog(prev => {
      const next = [{ ...entry, timestamp: new Date().toISOString(), id: Date.now() }, ...prev].slice(0, 200);
      localStorage.setItem("aitdl_log", JSON.stringify(next));
      return next;
    });
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = (runId, issueId) => {
    setApprovals(prev => ({ ...prev, [`${runId}_${issueId}`]: "approved" }));
    const run = runs.find(r => r.id === runId);
    const issue = run?.issues.find(i => i.id === issueId);
    addLog({
      type: "APPROVED",
      runId,
      runName: run?.name,
      issueId,
      file: issue?.file,
      fix: issue?.fix,
      severity: issue?.severity,
    });
    showToast(`✅ Fix approved: ${issue?.file}`);
  };

  const handleReject = (runId, issueId) => {
    setApprovals(prev => ({ ...prev, [`${runId}_${issueId}`]: "rejected" }));
    const run = runs.find(r => r.id === runId);
    const issue = run?.issues.find(i => i.id === issueId);
    addLog({
      type: "REJECTED",
      runId,
      runName: run?.name,
      issueId,
      file: issue?.file,
      fix: issue?.fix,
      severity: issue?.severity,
    });
    showToast(`🚫 Fix rejected: ${issue?.file}`, "error");
  };

  const handleApproveAll = (runId) => {
    const run = runs.find(r => r.id === runId);
    run?.issues.forEach(issue => {
      if (!approvals[`${runId}_${issue.id}`]) handleApprove(runId, issue.id);
    });
    showToast("✅ All fixes approved for this run");
  };

  const clearLog = () => {
    setLog([]);
    localStorage.removeItem("aitdl_log");
    showToast("Log cleared", "info");
  };

  const exportLog = () => {
    const blob = new Blob([JSON.stringify(log, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `aitdl_correction_log_${Date.now()}.json`; a.click();
    showToast("📥 Log exported");
  };

  const failedRuns = runs.filter(r => r.conclusion === "failure");
  const pendingCount = failedRuns.reduce((acc, r) => acc + r.issues.filter(i => !approvals[`${r.id}_${i.id}`]).length, 0);

  return (
    <div style={{
      minHeight: "100vh", background: "#0d0f14", color: "#e8eaf0",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Space+Grotesk:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; background: #151820; }
        ::-webkit-scrollbar-thumb { background: #2a2e3e; border-radius: 3px; }
        .run-row { transition: background 0.15s; cursor: pointer; }
        .run-row:hover { background: #171b26 !important; }
        .run-row.active { background: #1a1f30 !important; border-left: 3px solid #7c6fff !important; }
        .btn { border: none; cursor: pointer; font-family: inherit; font-size: 12px; font-weight: 700;
          border-radius: 6px; padding: 6px 16px; letter-spacing: 0.04em; transition: all 0.15s; }
        .btn-approve { background: #00e67622; color: #00e676; border: 1px solid #00e67644; }
        .btn-approve:hover { background: #00e67633; }
        .btn-reject { background: #ff444422; color: #ff4444; border: 1px solid #ff444444; }
        .btn-reject:hover { background: #ff444433; }
        .btn-all { background: #7c6fff22; color: #a89fff; border: 1px solid #7c6fff44; }
        .btn-all:hover { background: #7c6fff33; }
        .btn-neutral { background: #ffffff11; color: #aaa; border: 1px solid #ffffff22; }
        .btn-neutral:hover { background: #ffffff1a; }
        .tab { background: none; border: none; cursor: pointer; font-family: inherit;
          font-size: 13px; padding: 8px 20px; color: #666; border-bottom: 2px solid transparent;
          transition: all 0.15s; }
        .tab.active { color: #a89fff; border-bottom-color: #7c6fff; }
        .tab:hover { color: #ccc; }
        .issue-card { border-radius: 8px; padding: 14px 16px; margin-bottom: 10px;
          border: 1px solid #ffffff0d; }
        .issue-card:hover { border-color: #ffffff1a; }
        input.token-input { background: #151820; border: 1px solid #2a2e3e; color: #e8eaf0;
          font-family: inherit; font-size: 13px; border-radius: 6px; padding: 8px 12px;
          outline: none; width: 300px; }
        input.token-input:focus { border-color: #7c6fff66; }
        .pulse { animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .toast { position: fixed; bottom: 28px; right: 28px; padding: 12px 20px;
          border-radius: 8px; font-size: 13px; z-index: 9999;
          animation: fadeIn 0.2s ease; box-shadow: 0 4px 24px #0008; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        .shine { background: linear-gradient(90deg,#7c6fff,#4fc3f7,#00e676,#7c6fff);
          background-size: 200%; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; animation: shine 4s linear infinite; }
        @keyframes shine { 0%{background-position:0%} 100%{background-position:200%} }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1e2230", padding: "16px 28px", display: "flex", alignItems: "center", gap: 16, background: "#0a0c12" }}>
        <div>
          <div style={{ fontSize: 11, color: "#666", letterSpacing: "0.15em", marginBottom: 2 }}>AI TECHNOLOGY DEVELOPMENT LAB</div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.02em" }}>
            <span className="shine">AITDL</span>
            <span style={{ color: "#555", fontWeight: 300 }}> / Auto Correction + Approval</span>
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          {pendingCount > 0 && (
            <div className="pulse" style={{ background: "#ff444422", border: "1px solid #ff444444", borderRadius: 999, padding: "4px 14px", fontSize: 12, color: "#ff8888" }}>
              {pendingCount} pending review{pendingCount !== 1 ? "s" : ""}
            </div>
          )}
          <a href={`https://github.com/${REPO}/actions`} target="_blank" rel="noreferrer"
            style={{ fontSize: 12, color: "#7c6fff", textDecoration: "none", border: "1px solid #7c6fff44", borderRadius: 6, padding: "6px 14px" }}>
            → GitHub Actions
          </a>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ display: "flex", gap: 1, background: "#0a0c12", borderBottom: "1px solid #1e2230" }}>
        {[
          { label: "Total Runs", value: runs.length, color: "#e8eaf0" },
          { label: "Failed", value: failedRuns.length, color: "#ff4444" },
          { label: "Issues Found", value: runs.reduce((a, r) => a + r.issues.length, 0), color: "#f0c040" },
          { label: "Approved", value: Object.values(approvals).filter(v => v === "approved").length, color: "#00e676" },
          { label: "Rejected", value: Object.values(approvals).filter(v => v === "rejected").length, color: "#ff4444" },
          { label: "Pending", value: pendingCount, color: "#a89fff" },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, padding: "14px 20px", textAlign: "center", borderRight: "1px solid #1e2230" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#555", marginTop: 2, letterSpacing: "0.08em" }}>{s.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #1e2230", background: "#0a0c12", padding: "0 20px" }}>
        {["runs", "corrections", "log", "settings"].map(t => (
          <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
            {t === "runs" ? "🔄 Workflow Runs" : t === "corrections" ? "🔧 Corrections" : t === "log" ? `📋 Local Log (${log.length})` : "⚙️ Settings"}
          </button>
        ))}
      </div>

      <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>

        {/* RUNS TAB */}
        {activeTab === "runs" && (
          <div>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 16, letterSpacing: "0.05em" }}>
              REPOSITORY: <span style={{ color: "#7c6fff" }}>{REPO}</span> · WORKFLOW: <span style={{ color: "#4fc3f7" }}>{WORKFLOW}</span>
            </div>
            {runs.map(run => (
              <div key={run.id}
                className={`run-row ${selected?.id === run.id ? "active" : ""}`}
                style={{ background: "#11141d", border: "1px solid #1e2230", borderRadius: 10, marginBottom: 10, padding: "14px 18px", borderLeft: "3px solid transparent" }}
                onClick={() => setSelected(selected?.id === run.id ? null : run)}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 18 }}>{run.conclusion === "success" ? "✅" : "❌"}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#e8eaf0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{run.name}</div>
                    <div style={{ fontSize: 11, color: "#555", marginTop: 3 }}>
                      #{run.id.slice(-6)} · <code style={{ color: "#7c6fff" }}>{run.commit}</code> · {formatDate(run.created_at)} · {run.duration}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                    <Badge label={run.conclusion.toUpperCase()} color={CONCL_COLOR[run.conclusion] || "#888"} />
                    {run.issues.length > 0 && (
                      <Badge label={`${run.issues.length} issue${run.issues.length !== 1 ? "s" : ""}`} color="#f0c040" />
                    )}
                    {run.issues.length > 0 && run.issues.every(i => approvals[`${run.id}_${i.id}`]) && (
                      <Badge label="ALL REVIEWED" color="#00e676" />
                    )}
                  </div>
                </div>

                {/* Expanded Issues */}
                {selected?.id === run.id && run.issues.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ fontSize: 12, color: "#555", letterSpacing: "0.08em" }}>DETECTED ISSUES — AUTO-CORRECTION CANDIDATES</div>
                      <button className="btn btn-all" onClick={(e) => { e.stopPropagation(); handleApproveAll(run.id); }}>
                        ✅ Approve All
                      </button>
                    </div>
                    {run.issues.map(issue => {
                      const state = approvals[`${run.id}_${issue.id}`];
                      return (
                        <div key={issue.id} className="issue-card" style={{ background: SEV_BG[issue.severity] || "#11141d" }}
                          onClick={e => e.stopPropagation()}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                                <Badge label={issue.severity.toUpperCase()} color={SEV_COLOR[issue.severity]} />
                                <Badge label={issue.type.toUpperCase()} color="#4fc3f7" />
                                <span style={{ fontSize: 12, color: "#7c6fff", fontFamily: "monospace" }}>{issue.file}:{issue.line}</span>
                              </div>
                              <div style={{ fontSize: 13, color: "#ccc", marginBottom: 6 }}>{issue.message}</div>
                              <div style={{ fontSize: 12, color: "#00e67688", background: "#00e67611", borderRadius: 4, padding: "6px 10px", border: "1px solid #00e67622" }}>
                                💡 <strong>Suggested Fix:</strong> {issue.fix}
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
                              {!state ? (
                                <>
                                  <button className="btn btn-approve" onClick={() => handleApprove(run.id, issue.id)}>✓ Approve</button>
                                  <button className="btn btn-reject" onClick={() => handleReject(run.id, issue.id)}>✗ Reject</button>
                                </>
                              ) : (
                                <Badge label={state === "approved" ? "✓ APPROVED" : "✗ REJECTED"} color={state === "approved" ? "#00e676" : "#ff4444"} />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {selected?.id === run.id && run.issues.length === 0 && (
                  <div style={{ marginTop: 12, padding: "10px 14px", background: "#00e67611", borderRadius: 6, color: "#00e676", fontSize: 13, border: "1px solid #00e67622" }}>
                    ✅ No issues detected in this run.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CORRECTIONS TAB */}
        {activeTab === "corrections" && (
          <div>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 16, letterSpacing: "0.05em" }}>ALL DETECTED ISSUES ACROSS RUNS</div>
            {failedRuns.every(r => r.issues.length === 0) ? (
              <div style={{ color: "#555", fontSize: 14, padding: 40, textAlign: "center" }}>No issues found across any runs.</div>
            ) : (
              failedRuns.map(run => (
                run.issues.length > 0 && (
                  <div key={run.id} style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: 13, color: "#7c6fff", marginBottom: 10, display: "flex", gap: 10, alignItems: "center" }}>
                      <span>Run #{run.id.slice(-6)}</span>
                      <span style={{ color: "#333" }}>·</span>
                      <span style={{ color: "#888" }}>{run.name.slice(0, 60)}</span>
                    </div>
                    {run.issues.map(issue => {
                      const state = approvals[`${run.id}_${issue.id}`];
                      return (
                        <div key={issue.id} className="issue-card" style={{ background: SEV_BG[issue.severity] }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                                <Badge label={issue.severity.toUpperCase()} color={SEV_COLOR[issue.severity]} />
                                <Badge label={issue.type.toUpperCase()} color="#4fc3f7" />
                                <span style={{ fontSize: 12, color: "#7c6fff" }}>{issue.file}:{issue.line}</span>
                              </div>
                              <div style={{ fontSize: 13, color: "#ccc", marginBottom: 6 }}>{issue.message}</div>
                              <div style={{ fontSize: 12, color: "#00e67688", background: "#00e67611", borderRadius: 4, padding: "6px 10px", border: "1px solid #00e67622" }}>
                                💡 {issue.fix}
                              </div>
                            </div>
                            <div style={{ flexShrink: 0 }}>
                              {!state ? (
                                <div style={{ display: "flex", gap: 8 }}>
                                  <button className="btn btn-approve" onClick={() => handleApprove(run.id, issue.id)}>✓ Approve</button>
                                  <button className="btn btn-reject" onClick={() => handleReject(run.id, issue.id)}>✗ Reject</button>
                                </div>
                              ) : (
                                <Badge label={state === "approved" ? "✓ APPROVED" : "✗ REJECTED"} color={state === "approved" ? "#00e676" : "#ff4444"} />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ))
            )}
          </div>
        )}

        {/* LOG TAB */}
        {activeTab === "log" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#555", letterSpacing: "0.05em" }}>LOCAL CORRECTION LOG — {log.length} ENTRIES</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-neutral" onClick={exportLog}>📥 Export JSON</button>
                <button className="btn btn-reject" onClick={clearLog}>🗑 Clear Log</button>
              </div>
            </div>
            {log.length === 0 ? (
              <div style={{ color: "#444", fontSize: 14, padding: 40, textAlign: "center" }}>
                No log entries yet. Approve or reject corrections to see them here.
              </div>
            ) : (
              <div style={{ fontFamily: "monospace", fontSize: 12 }}>
                {log.map(entry => (
                  <div key={entry.id} style={{
                    display: "grid", gridTemplateColumns: "160px 90px 200px 1fr",
                    gap: 12, padding: "10px 14px", borderBottom: "1px solid #1a1d28",
                    alignItems: "start"
                  }}>
                    <div style={{ color: "#555" }}>{formatDate(entry.timestamp)}</div>
                    <div>
                      <Badge
                        label={entry.type}
                        color={entry.type === "APPROVED" ? "#00e676" : entry.type === "REJECTED" ? "#ff4444" : "#4fc3f7"}
                      />
                    </div>
                    <div style={{ color: "#7c6fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {entry.file}
                    </div>
                    <div style={{ color: "#888" }}>{entry.fix}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div style={{ maxWidth: 600 }}>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 20, letterSpacing: "0.05em" }}>CONFIGURATION</div>

            <div style={{ background: "#11141d", border: "1px solid #1e2230", borderRadius: 10, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>GitHub Personal Access Token</div>
              <div style={{ fontSize: 12, color: "#555", marginBottom: 12 }}>Required to fetch live workflow run data via GitHub API (repo + actions:read scope)</div>
              <div style={{ display: "flex", gap: 10 }}>
                <input className="token-input" type="password" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={tokenInput} onChange={e => setTokenInput(e.target.value)} />
                <button className="btn btn-approve" onClick={() => { setToken(tokenInput); showToast("Token saved (session only)"); }}>
                  Save
                </button>
              </div>
              {token && <div style={{ fontSize: 11, color: "#00e676", marginTop: 8 }}>✓ Token configured (session only — not persisted)</div>}
            </div>

            <div style={{ background: "#11141d", border: "1px solid #1e2230", borderRadius: 10, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Repository Target</div>
              <div style={{ fontSize: 12, color: "#555", marginBottom: 6 }}>Monitored repo</div>
              <code style={{ color: "#7c6fff", fontSize: 13 }}>{REPO}</code>
            </div>

            <div style={{ background: "#11141d", border: "1px solid #1e2230", borderRadius: 10, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Local Log Storage</div>
              <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>Approval decisions are stored in browser localStorage under key <code style={{ color: "#4fc3f7" }}>aitdl_log</code></div>
              <div style={{ fontSize: 12, color: "#aaa" }}>Entries: <strong>{log.length}</strong> / 200 max</div>
              <div style={{ marginTop: 12 }}>
                <button className="btn btn-neutral" onClick={exportLog} style={{ marginRight: 10 }}>📥 Export Log</button>
                <button className="btn btn-reject" onClick={clearLog}>🗑 Clear Log</button>
              </div>
            </div>

            <div style={{ background: "#11141d", border: "1px solid #1e2230", borderRadius: 10, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>GitHub Actions API Usage</div>
              <div style={{ fontSize: 12, color: "#555", lineHeight: 1.8 }}>
                With a valid token, this dashboard can call:<br />
                <code style={{ color: "#4fc3f7" }}>GET /repos/{REPO}/actions/runs</code><br />
                <code style={{ color: "#4fc3f7" }}>GET /repos/{REPO}/actions/runs/:id/jobs</code><br />
                <code style={{ color: "#4fc3f7" }}>POST /repos/{REPO}/actions/runs/:id/rerun</code>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Toast */}
      {toast && (
        <div className="toast" style={{
          background: toast.type === "error" ? "#2a0a0a" : toast.type === "info" ? "#0a1520" : "#0a2015",
          border: `1px solid ${toast.type === "error" ? "#ff444444" : toast.type === "info" ? "#4fc3f744" : "#00e67644"}`,
          color: toast.type === "error" ? "#ff8888" : toast.type === "info" ? "#4fc3f7" : "#00e676",
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
