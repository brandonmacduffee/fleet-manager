'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const LOGO_BASE64 = 'data:image/jpeg;base64,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';

// ─── Supabase API ───
async function fetchTeamsWithMembers() {
  const { data: teams, error: tErr } = await supabase.from('teams').select('*').order('sort_order');
  if (tErr) throw tErr;
  const { data: members, error: mErr } = await supabase.from('members').select('*').order('sort_order');
  if (mErr) throw mErr;
  return teams.map(t => ({
    id: t.id, name: t.name, color: t.color, doh: t.doh,
    truckLabel: 'TRUCK', lead: t.lead,
    members: members.filter(m => m.team_id === t.id).map(m => ({
      dbId: m.id, name: m.name, truck: m.truck, isLead: m.is_lead,
    })),
  }));
}

async function saveMemberToDB(teamId, member, sortOrder) {
  if (member.dbId) {
    const { error } = await supabase.from('members')
      .update({ name: member.name, truck: member.truck, is_lead: member.isLead || false })
      .eq('id', member.dbId);
    if (error) throw error;
  } else {
    const { data, error } = await supabase.from('members')
      .insert({ team_id: teamId, name: member.name, truck: member.truck, is_lead: member.isLead || false, sort_order: sortOrder })
      .select().single();
    if (error) throw error;
    return data.id;
  }
}

async function deleteMemberFromDB(dbId) {
  const { error } = await supabase.from('members').delete().eq('id', dbId);
  if (error) throw error;
}

async function saveAllMembers(teams) {
  for (const team of teams) {
    const { data: existing } = await supabase.from('members').select('id').eq('team_id', team.id);
    const existingIds = new Set((existing || []).map(e => e.id));
    const currentIds = new Set(team.members.filter(m => m.dbId).map(m => m.dbId));
    for (const id of existingIds) { if (!currentIds.has(id)) await deleteMemberFromDB(id); }
    for (let i = 0; i < team.members.length; i++) {
      const newId = await saveMemberToDB(team.id, team.members[i], i + 1);
      if (newId) team.members[i].dbId = newId;
    }
  }
}

async function authenticateUser(username, password) {
  const { data, error } = await supabase.from('app_users')
    .select('*').eq('username', username).eq('password', password).single();
  if (error || !data) return null;
  return { username: data.username, role: data.role };
}

// ─── Colors / Theme ───
const C = {
  bg: '#050508',
  card: '#0c0c14',
  cardBorder: 'rgba(255,255,255,0.04)',
  surface: '#08080f',
  blue: '#1E90FF',
  green: '#2ECC40',
  lime: '#00ff88',
  cyan: '#00d4ff',
  yellow: '#f5c518',
  orange: '#ff8c00',
  red: '#ff3b3b',
  purple: '#7B68EE',
  text: '#e8e8e8',
  textMuted: '#5a5a6e',
  textDim: '#3a3a4e',
  gradBlue: 'linear-gradient(135deg, #1E90FF, #00BFFF)',
  gradGreen: 'linear-gradient(135deg, #00ff88, #00cc66)',
  gradOrange: 'linear-gradient(135deg, #ff8c00, #f5c518)',
  gradPurple: 'linear-gradient(135deg, #7B68EE, #9B59B6)',
  gradRed: 'linear-gradient(135deg, #ff3b3b, #ff6b6b)',
  gradCyan: 'linear-gradient(135deg, #00d4ff, #1E90FF)',
};

const font = "'SF Mono', 'Fira Code', 'Courier New', monospace";

// ─── Print HTML ───
function generatePrintHTML(teams) {
  const d = new Date();
  const title = `PROJECT MANAGERS — ${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}`;

  const cols = teams.length;
  const colWidth = Math.floor(100 / cols);

  const teamCols = teams.map(t => {
    const rows = t.members.map((m, i) => `
      <tr style="background:${m.isLead ? t.color + '22' : i % 2 === 0 ? '#f5f7fa' : '#ffffff'}">
        <td style="padding:3px 6px;border:1px solid #d0d0d0;font-size:10px;font-weight:${m.isLead ? 'bold' : 'normal'};${m.name === 'Vacant' ? 'color:#cc0000;font-style:italic;' : ''}">${m.name}</td>
        <td style="padding:3px 6px;border:1px solid #d0d0d0;font-size:10px;text-align:center;font-weight:bold;">${m.truck}</td>
      </tr>`).join('');

    return `
      <td style="width:${colWidth}%;vertical-align:top;padding:0 4px;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr><th colspan="2" style="background:${t.color};color:#fff;padding:6px;text-align:center;font-size:12px;font-weight:bold;border:1px solid ${t.color};letter-spacing:1px;">${t.name}</th></tr>
            <tr style="background:#e8e8e8;">
              <th style="padding:4px 6px;text-align:left;border:1px solid #bbb;font-size:9px;width:65%">NAME</th>
              <th style="padding:4px 6px;text-align:center;border:1px solid #bbb;font-size:9px;width:35%">TRUCK</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </td>`;
  }).join('');

  return `<!DOCTYPE html><html><head><title>${title}</title>
    <style>
      @page { size: landscape; margin: 0.3in; }
      @media print { body { margin: 0; padding: 0; } }
      body { font-family: Arial, Helvetica, sans-serif; }
    </style>
    </head><body style="padding:12px;margin:0;">
    <div style="text-align:center;margin-bottom:12px;">
      <img src="${LOGO_BASE64}" style="height:50px;margin-bottom:6px;" />
      <h1 style="font-size:16px;margin:0;letter-spacing:2px;color:#222;">${title}</h1>
      <hr style="border:1.5px solid #333;margin:6px 0 0 0;">
    </div>
    <table style="width:100%;border-collapse:separate;border-spacing:6px 0;">
      <tr>${teamCols}</tr>
    </table>
    <script>window.onload=function(){window.print()}<\/script>
  </body></html>`;
}

// ─── Login ───
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await authenticateUser(username, password);
      if (user) { localStorage.setItem('rpusa_auth', JSON.stringify(user)); onLogin(user); }
      else setError('Invalid credentials.');
    } catch { setError('Connection error.'); }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: C.bg, position: 'relative', overflow: 'hidden', fontFamily: font,
    }}>
      <div style={{
        position: 'absolute', width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(30,144,255,0.04) 0%, transparent 70%)',
        top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
      }} />
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,255,136,0.03) 0%, transparent 70%)',
        top: '60%', left: '30%', transform: 'translate(-50%,-50%)',
      }} />

      <div style={{
        background: 'linear-gradient(145deg, #0c0c18, #10101e)',
        border: '1px solid rgba(30,144,255,0.12)', borderRadius: 20,
        padding: '44px 38px', width: 400, maxWidth: '92vw',
        boxShadow: '0 0 80px rgba(30,144,255,0.04), 0 30px 60px rgba(0,0,0,0.7)',
        position: 'relative', zIndex: 1, backdropFilter: 'blur(20px)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src="/logo.png" alt="Roofing Pros USA" style={{ height: 80, objectFit: 'contain' }} />
        </div>
        <h1 style={{
          textAlign: 'center', color: C.cyan, fontSize: 24, margin: '0 0 6px',
          letterSpacing: 8, background: C.gradCyan, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>FLEET MANAGER</h1>
        <p style={{ textAlign: 'center', color: C.textDim, fontSize: 10, letterSpacing: 3, margin: '0 0 32px' }}>PM TRUCK ASSIGNMENT SYSTEM</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ color: C.blue, fontSize: 9, letterSpacing: 3, display: 'block', marginBottom: 6, fontWeight: 600 }}>USERNAME</label>
            <input type="text" value={username} onChange={(e) => { setUsername(e.target.value); setError(''); }}
              style={{
                width: '100%', boxSizing: 'border-box', background: '#06060c',
                border: '1px solid rgba(30,144,255,0.15)', borderRadius: 10,
                padding: '13px 14px', color: C.text, fontSize: 14, fontFamily: font,
              }} placeholder="Enter username" autoFocus />
          </div>
          <div>
            <label style={{ color: C.blue, fontSize: 9, letterSpacing: 3, display: 'block', marginBottom: 6, fontWeight: 600 }}>PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                style={{
                  width: '100%', boxSizing: 'border-box', background: '#06060c',
                  border: '1px solid rgba(30,144,255,0.15)', borderRadius: 10,
                  padding: '13px 14px', color: C.text, fontSize: 14, fontFamily: font,
                }} placeholder="Enter password" />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', fontSize: 10, fontFamily: font, letterSpacing: 1,
              }}>{showPw ? 'HIDE' : 'SHOW'}</button>
            </div>
          </div>
          {error && <p style={{ color: C.red, fontSize: 12, textAlign: 'center', margin: 0 }}>{error}</p>}
          <button type="submit" disabled={loading} style={{
            background: loading ? '#111' : C.gradBlue,
            border: 'none', borderRadius: 10, padding: 14, color: '#fff',
            fontSize: 13, fontWeight: 700, letterSpacing: 3, cursor: 'pointer',
            fontFamily: font, marginTop: 4, boxShadow: loading ? 'none' : '0 4px 20px rgba(30,144,255,0.25)',
          }}>{loading ? 'AUTHENTICATING...' : '▸ LOG IN'}</button>
        </form>
        <p style={{ textAlign: 'center', color: C.textDim, fontSize: 8, letterSpacing: 2, marginTop: 24 }}>AUTHORIZED PERSONNEL ONLY</p>
      </div>
    </div>
  );
}

// ─── Team Card ───
function TeamSection({ team, allMembers, onUpdate, isEditing }) {
  const active = team.members.filter(m => m.name !== 'Vacant');
  const vacant = team.members.filter(m => m.name === 'Vacant');

  const handleChange = (idx, field, val) => {
    const u = { ...team, members: [...team.members] };
    u.members[idx] = { ...u.members[idx], [field]: val };
    onUpdate(u);
  };
  const addMember = () => onUpdate({ ...team, members: [...team.members, { name: '', truck: '' }] });
  const removeMember = (idx) => onUpdate({ ...team, members: team.members.filter((_, i) => i !== idx) });

  return (
    <div style={{
      background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14,
      overflow: 'hidden', boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px',
        background: `linear-gradient(135deg, ${team.color}dd, ${team.color}88)`,
      }}>
        <h2 style={{ margin: 0, fontSize: 14, color: '#fff', fontWeight: 700, letterSpacing: 2.5, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{team.name}</h2>
        <div style={{ display: 'flex', gap: 5 }}>
          <span style={{ fontSize: 9, color: '#fff', background: 'rgba(0,0,0,0.25)', padding: '3px 9px', borderRadius: 10, fontWeight: 600 }}>{active.length}</span>
          {vacant.length > 0 && <span style={{ fontSize: 9, color: '#ff8888', background: 'rgba(255,0,0,0.15)', padding: '3px 9px', borderRadius: 10, fontWeight: 600 }}>{vacant.length} vacant</span>}
        </div>
      </div>

      <div style={{ display: 'flex', padding: '8px 16px', background: '#06060c', borderBottom: `1px solid ${C.cardBorder}` }}>
        <div style={{ flex: 2, fontSize: 8, color: C.textDim, letterSpacing: 2.5, fontWeight: 700 }}>PROJECT MANAGER</div>
        <div style={{ flex: 1, fontSize: 8, color: C.textDim, letterSpacing: 2.5, fontWeight: 700 }}>TRUCK</div>
        {isEditing && <div style={{ flex: 0.4 }} />}
      </div>

      {team.members.map((m, idx) => (
        <div key={m.dbId || `new-${idx}`} style={{
          display: 'flex', padding: '6px 16px', alignItems: 'center',
          borderBottom: `1px solid ${C.cardBorder}`,
          background: m.isLead ? `${team.color}0a` : m.name === 'Vacant' ? '#0a0608' : idx % 2 === 0 ? '#08080f' : '#0a0a14',
        }}>
          <div style={{ flex: 2, fontSize: 12 }}>
            {isEditing ? (
              <select value={m.name} onChange={(e) => handleChange(idx, 'name', e.target.value)}
                style={{ background: '#06060c', border: '1px solid #222', borderRadius: 6, padding: '5px 8px', color: C.text, fontSize: 11, fontFamily: font, width: '100%', maxWidth: 220 }}>
                <option value="">-- Select PM --</option>
                <option value="Vacant">Vacant</option>
                {allMembers.map((n, i) => <option key={i} value={n}>{n}</option>)}
              </select>
            ) : (
              <span style={{
                color: m.isLead ? team.color : m.name === 'Vacant' ? C.red : '#c8c8d0',
                fontWeight: m.isLead ? 700 : 400, fontSize: 12,
                fontStyle: m.name === 'Vacant' ? 'italic' : 'normal',
              }}>{m.isLead && '★ '}{m.name || '—'}</span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            {isEditing ? (
              <input type="text" value={m.truck} onChange={(e) => handleChange(idx, 'truck', e.target.value)}
                style={{ background: '#06060c', border: '1px solid #222', borderRadius: 6, padding: '5px 8px', color: C.lime, fontSize: 12, fontFamily: font, width: 56, textAlign: 'center' }}
                placeholder="#" />
            ) : (
              <span style={{
                fontSize: 13, fontWeight: 700,
                color: m.truck === 'NT' ? C.textDim : C.lime,
              }}>{m.truck || '—'}</span>
            )}
          </div>
          {isEditing && (
            <div style={{ flex: 0.4, textAlign: 'right' }}>
              <button onClick={() => removeMember(idx)} style={{
                background: 'rgba(255,59,59,0.08)', border: '1px solid rgba(255,59,59,0.2)',
                borderRadius: 6, padding: '3px 10px', color: C.red, fontSize: 11, cursor: 'pointer',
              }}>✕</button>
            </div>
          )}
        </div>
      ))}

      {isEditing && (
        <button onClick={addMember} style={{
          display: 'block', width: '100%', background: 'transparent',
          border: 'none', borderTop: '1px dashed #1a1a2e', padding: 10,
          color: C.blue, fontSize: 10, letterSpacing: 1.5, cursor: 'pointer', fontFamily: font,
        }}>+ ADD MEMBER</button>
      )}
    </div>
  );
}

// ─── Vacant Section ───
function VacantSection({ teams, onAddTruck }) {
  const vacants = [];
  const ntTrucks = [];
  teams.forEach(t => t.members.forEach(m => {
    if (m.name === 'Vacant') vacants.push({ team: t.name, teamId: t.id, truck: m.truck, color: t.color });
    if (m.truck === 'NT' && m.name !== 'Vacant') ntTrucks.push({ team: t.name, name: m.name, color: t.color });
  }));

  const [showAdd, setShowAdd] = useState(false);
  const [newTruck, setNewTruck] = useState('');
  const [newTeam, setNewTeam] = useState(teams[0]?.id || '');

  const handleAdd = () => {
    if (newTruck.trim() && newTeam) {
      onAddTruck(newTeam, newTruck.trim());
      setNewTruck('');
      setShowAdd(false);
    }
  };

  const Card = ({ label, sub, accent }) => (
    <div style={{
      background: C.card, border: `1px solid ${C.cardBorder}`,
      borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4,
      borderLeft: `3px solid ${accent}`,
    }}>
      <span style={{ fontSize: 16, fontWeight: 700, color: accent }}>{label}</span>
      <span style={{ fontSize: 9, color: C.textMuted, letterSpacing: 1.5, fontWeight: 600 }}>{sub}</span>
    </div>
  );

  return (
    <div style={{
      background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 16, color: C.red, letterSpacing: 3 }}>🚛 VACANT TRUCKS</h2>
        <button onClick={() => setShowAdd(!showAdd)} style={{
          background: C.gradBlue, border: 'none', borderRadius: 8, padding: '8px 16px',
          color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, cursor: 'pointer',
          fontFamily: font, boxShadow: '0 2px 12px rgba(30,144,255,0.2)',
        }}>+ ADD TRUCK</button>
      </div>

      {showAdd && (
        <div style={{
          background: '#06060c', border: '1px solid rgba(30,144,255,0.15)', borderRadius: 10,
          padding: 16, marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap',
        }}>
          <div>
            <label style={{ color: C.blue, fontSize: 8, letterSpacing: 2, display: 'block', marginBottom: 4, fontWeight: 600 }}>TRUCK #</label>
            <input type="text" value={newTruck} onChange={(e) => setNewTruck(e.target.value)}
              style={{ background: C.bg, border: '1px solid #222', borderRadius: 6, padding: '8px 10px', color: C.lime, fontSize: 13, fontFamily: font, width: 80, textAlign: 'center' }}
              placeholder="###" />
          </div>
          <div>
            <label style={{ color: C.blue, fontSize: 8, letterSpacing: 2, display: 'block', marginBottom: 4, fontWeight: 600 }}>ASSIGN TO TEAM</label>
            <select value={newTeam} onChange={(e) => setNewTeam(e.target.value)}
              style={{ background: C.bg, border: '1px solid #222', borderRadius: 6, padding: '8px 10px', color: C.text, fontSize: 11, fontFamily: font }}>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <button onClick={handleAdd} style={{
            background: C.gradGreen, border: 'none', borderRadius: 8, padding: '9px 18px',
            color: '#000', fontSize: 10, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', fontFamily: font,
          }}>ADD</button>
          <button onClick={() => setShowAdd(false)} style={{
            background: 'transparent', border: '1px solid #333', borderRadius: 8, padding: '9px 14px',
            color: C.textMuted, fontSize: 10, cursor: 'pointer', fontFamily: font,
          }}>CANCEL</button>
        </div>
      )}

      {vacants.length === 0 ? (
        <p style={{ color: C.lime, fontSize: 13 }}>All trucks assigned!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10 }}>
          {vacants.map((v, i) => <Card key={i} label={`#${v.truck}`} sub={v.team} accent={v.color} />)}
        </div>
      )}
      {ntTrucks.length > 0 && (
        <>
          <h3 style={{ margin: '24px 0 14px', fontSize: 13, color: C.orange, letterSpacing: 2 }}>📋 NO TRUCK ASSIGNED (NT)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10 }}>
            {ntTrucks.map((v, i) => <Card key={i} label={v.name} sub={v.team} accent={v.color} />)}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main App ───
export default function FleetManager() {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try { const s = localStorage.getItem('rpusa_auth'); if (s) setUser(JSON.parse(s)); } catch {}
    setLoading(false);
  }, []);

  const loadData = useCallback(async () => {
    if (!user) return;
    try { setTeams(await fetchTeamsWithMembers()); } catch (err) { console.error(err); notify('❌ Failed to load data.'); }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    if (!user || isEditing) return;
    const i = setInterval(loadData, 30000);
    return () => clearInterval(i);
  }, [user, isEditing, loadData]);

  const allNames = [...new Set(teams.flatMap(t => t.members.filter(m => m.name !== 'Vacant').map(m => m.name)))].sort();
  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAllMembers(teams);
      setTeams(await fetchTeamsWithMembers());
      setIsEditing(false);
      notify('✅ Saved to cloud!');
    } catch { notify('❌ Save failed.'); }
    setSaving(false);
  };

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (w) { w.document.write(generatePrintHTML(teams)); w.document.close(); }
  };

  const handleLogout = () => { localStorage.removeItem('rpusa_auth'); setUser(null); setTeams([]); setIsEditing(false); };

  const handleAddVacantTruck = async (teamId, truckNum) => {
    try {
      await supabase.from('members').insert({
        team_id: teamId, name: 'Vacant', truck: truckNum, is_lead: false,
        sort_order: 999,
      });
      await loadData();
      notify(`✅ Truck #${truckNum} added as vacant`);
    } catch { notify('❌ Failed to add truck.'); }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="loading-pulse" style={{ color: C.cyan, fontSize: 13, letterSpacing: 4, fontFamily: font }}>LOADING SYSTEM...</p>
      </div>
    );
  }

  if (!user) return <LoginPage onLogin={setUser} />;

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const totalPMs = teams.reduce((s, t) => s + t.members.filter(m => m.name !== 'Vacant').length, 0);
  const totalVacant = teams.reduce((s, t) => s + t.members.filter(m => m.name === 'Vacant').length, 0);
  const totalTrucks = teams.reduce((s, t) => s + t.members.length, 0);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: font }}>
      {/* Toast */}
      {toast && (
        <div className="toast" style={{
          position: 'fixed', top: 16, right: 16,
          background: toast.includes('❌') ? C.gradRed : C.gradGreen,
          color: '#fff', padding: '10px 22px', borderRadius: 10, fontSize: 12, fontWeight: 600,
          zIndex: 10000, boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>{toast}</div>
      )}

      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', background: 'linear-gradient(180deg, #0a0a14, #08080f)',
        borderBottom: '1px solid rgba(30,144,255,0.06)', flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src="/logo.png" alt="Logo" style={{ height: 42, objectFit: 'contain' }} />
          <h1 style={{
            margin: 0, fontSize: 18, letterSpacing: 5, fontWeight: 700,
            background: C.gradCyan, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>FLEET MANAGER</h1>
          <span style={{ fontSize: 13, color: C.textMuted, fontWeight: 500, letterSpacing: 0.5 }}>{dateStr}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <nav style={{ display: 'flex', gap: 2 }}>
            {[
              { id: 'dashboard', label: 'DASHBOARD', icon: '📊' },
              { id: 'vacant', label: 'VACANT', icon: '🚛' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                background: activeTab === tab.id ? 'rgba(30,144,255,0.1)' : 'transparent',
                border: `1px solid ${activeTab === tab.id ? 'rgba(30,144,255,0.3)' : 'rgba(255,255,255,0.04)'}`,
                borderRadius: 8, padding: '6px 14px',
                color: activeTab === tab.id ? C.cyan : C.textDim,
                fontSize: 9, letterSpacing: 2, cursor: 'pointer', fontFamily: font, fontWeight: 600,
              }}>{tab.icon} {tab.label}</button>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.lime, boxShadow: `0 0 6px ${C.lime}` }} />
            <span style={{ fontSize: 8, color: C.lime, letterSpacing: 1.5, fontWeight: 600 }}>SYNCED</span>
          </div>
          <span style={{
            fontSize: 9, color: C.textMuted, padding: '4px 12px',
            border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 14, letterSpacing: 1, fontWeight: 500,
          }}>{user.role} ▸ {user.username}</span>
          <button onClick={handleLogout} style={{
            background: 'rgba(255,59,59,0.06)', border: '1px solid rgba(255,59,59,0.15)', borderRadius: 8,
            padding: '4px 12px', color: C.red, fontSize: 8, letterSpacing: 1.5, cursor: 'pointer', fontFamily: font, fontWeight: 600,
          }}>LOGOUT</button>
        </div>
      </header>

      {/* Stats + Actions */}
      <div style={{
        display: 'flex', gap: 14, padding: '12px 20px',
        borderBottom: `1px solid ${C.cardBorder}`, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', gap: 18, flex: 1, flexWrap: 'wrap' }}>
          {[
            { label: 'TEAMS', value: teams.length, color: C.blue },
            { label: 'ACTIVE PMs', value: totalPMs, color: C.lime },
            { label: 'VACANT', value: totalVacant, color: C.red },
            { label: 'TOTAL', value: totalTrucks, color: C.orange },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
              <span style={{ fontSize: 19, fontWeight: 800, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: 8, color: C.textDim, letterSpacing: 2.5, fontWeight: 700 }}>{s.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {activeTab === 'dashboard' && (
            <>
              {isEditing ? (
                <>
                  <button onClick={handleSave} disabled={saving} style={{
                    background: saving ? '#111' : C.gradGreen,
                    border: 'none', borderRadius: 10, padding: '8px 18px', color: saving ? '#555' : '#000',
                    fontSize: 10, fontWeight: 700, letterSpacing: 1.5, cursor: 'pointer', fontFamily: font,
                    boxShadow: saving ? 'none' : '0 2px 14px rgba(0,255,136,0.2)',
                  }}>{saving ? '⏳ SAVING...' : '💾 SAVE TO CLOUD'}</button>
                  <button onClick={() => { setIsEditing(false); loadData(); }} style={{
                    background: 'transparent', border: '1px solid #222', borderRadius: 10, padding: '8px 14px',
                    color: C.textMuted, fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: font,
                  }}>✕ CANCEL</button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} style={{
                  background: C.gradBlue, border: 'none', borderRadius: 10, padding: '8px 18px', color: '#fff',
                  fontSize: 10, fontWeight: 700, letterSpacing: 1.5, cursor: 'pointer', fontFamily: font,
                  boxShadow: '0 2px 14px rgba(30,144,255,0.2)',
                }}>✏️ EDIT MODE</button>
              )}
              <button onClick={handlePrint} style={{
                background: C.gradOrange, border: 'none', borderRadius: 10, padding: '8px 18px', color: '#000',
                fontSize: 10, fontWeight: 700, letterSpacing: 1.5, cursor: 'pointer', fontFamily: font,
                boxShadow: '0 2px 14px rgba(255,140,0,0.2)',
              }}>🖨️ PRINT REPORT</button>
              <button onClick={loadData} style={{
                background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10,
                padding: '8px 14px', color: C.textMuted, fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: font,
              }}>↻ REFRESH</button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <main style={{ padding: 20, maxWidth: 1480, margin: '0 auto' }}>
        {teams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <p className="loading-pulse" style={{ color: C.cyan, fontSize: 13, letterSpacing: 4 }}>LOADING FLEET DATA...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 18 }}>
                {teams.map(t => (
                  <TeamSection key={t.id} team={t} allMembers={allNames}
                    onUpdate={(u) => setTeams(p => p.map(x => x.id === u.id ? u : x))}
                    isEditing={isEditing} />
                ))}
              </div>
            )}
            {activeTab === 'vacant' && <VacantSection teams={teams} onAddTruck={handleAddVacantTruck} />}
          </>
        )}
      </main>

      <footer style={{
        textAlign: 'center', padding: 16, borderTop: `1px solid ${C.cardBorder}`,
        color: C.textDim, fontSize: 9, letterSpacing: 2.5,
      }}>
        ROOFING PROS USA — Fleet Management System v3.0 — Cloud Synced
      </footer>
    </div>
  );
}
