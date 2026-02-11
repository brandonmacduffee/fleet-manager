'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// ─── Supabase API helpers ───

async function fetchTeamsWithMembers() {
  const { data: teams, error: tErr } = await supabase
    .from('teams')
    .select('*')
    .order('sort_order');

  if (tErr) throw tErr;

  const { data: members, error: mErr } = await supabase
    .from('members')
    .select('*')
    .order('sort_order');

  if (mErr) throw mErr;

  return teams.map(t => ({
    id: t.id,
    name: t.name,
    color: t.color,
    doh: t.doh,
    truckLabel: t.truck_label,
    lead: t.lead,
    members: members
      .filter(m => m.team_id === t.id)
      .map(m => ({
        dbId: m.id,
        name: m.name,
        truck: m.truck,
        isLead: m.is_lead,
      })),
  }));
}

async function saveMemberToDB(teamId, member, sortOrder) {
  if (member.dbId) {
    const { error } = await supabase
      .from('members')
      .update({ name: member.name, truck: member.truck, is_lead: member.isLead || false })
      .eq('id', member.dbId);
    if (error) throw error;
  } else {
    const { data, error } = await supabase
      .from('members')
      .insert({ team_id: teamId, name: member.name, truck: member.truck, is_lead: member.isLead || false, sort_order: sortOrder })
      .select()
      .single();
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
    // Get current DB members for this team
    const { data: existing } = await supabase
      .from('members')
      .select('id')
      .eq('team_id', team.id);

    const existingIds = new Set((existing || []).map(e => e.id));
    const currentIds = new Set(team.members.filter(m => m.dbId).map(m => m.dbId));

    // Delete removed members
    for (const id of existingIds) {
      if (!currentIds.has(id)) {
        await deleteMemberFromDB(id);
      }
    }

    // Upsert current members
    for (let i = 0; i < team.members.length; i++) {
      const m = team.members[i];
      const newId = await saveMemberToDB(team.id, m, i + 1);
      if (newId) team.members[i].dbId = newId;
    }
  }
}

async function authenticateUser(username, password) {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single();

  if (error || !data) return null;
  return { username: data.username, role: data.role };
}

// ─── Print HTML Generator ───
function generatePrintHTML(teams) {
  const d = new Date();
  const title = `PROJECT MANAGERS - ${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}`;

  const teamHtml = teams.map(t => `
    <div style="break-inside:avoid;margin-bottom:18px;">
      <table style="width:100%;border-collapse:collapse;font-size:11px;font-family:Arial,sans-serif;">
        <thead>
          <tr><th colspan="3" style="background:${t.color};color:#fff;padding:7px 10px;text-align:left;font-size:13px;border:1px solid #666;">
            ${t.name}<span style="float:right;font-size:10px;opacity:.8">${t.doh}</span>
          </th></tr>
          <tr style="background:#e0e0e0;">
            <th style="padding:5px 8px;text-align:left;border:1px solid #aaa;width:50%">${t.name}</th>
            <th style="padding:5px 8px;text-align:left;border:1px solid #aaa;width:25%">${t.truckLabel}</th>
            <th style="padding:5px 8px;text-align:left;border:1px solid #aaa;width:25%">${t.doh}</th>
          </tr>
        </thead>
        <tbody>${t.members.map((m, i) => `
          <tr style="background:${m.isLead ? '#ffffcc' : i % 2 === 0 ? '#f0f4ff' : '#fff'}">
            <td style="padding:4px 8px;border:1px solid #ccc;font-weight:${m.isLead ? 'bold' : 'normal'};${m.name === 'Vacant' ? 'color:#c00;' : ''}">${m.name}</td>
            <td style="padding:4px 8px;border:1px solid #ccc;">${m.truck}</td>
            <td style="padding:4px 8px;border:1px solid #ccc;"></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`).join('');

  return `<!DOCTYPE html><html><head><title>${title}</title>
    <style>@media print{body{margin:0;padding:15px}@page{margin:0.5in}}</style>
    </head><body style="padding:20px;margin:0;">
    <h1 style="font-family:Arial;font-size:20px;text-align:center;margin:0 0 4px;letter-spacing:2px">${title}</h1>
    <hr style="border:1px solid #333;margin:0 0 16px">
    ${teamHtml}
    <script>window.onload=function(){window.print()}<\/script>
  </body></html>`;
}

// ─── Login Component ───
function LoginPage({ onLogin, loading: authLoading }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await authenticateUser(username, password);
      if (user) {
        localStorage.setItem('rpusa_auth', JSON.stringify(user));
        onLogin(user);
      } else {
        setError('Invalid credentials. Try again.');
      }
    } catch (err) {
      setError('Connection error. Check your internet.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1b2a 40%, #1b2838 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
      }} />

      <div style={{
        background: 'linear-gradient(145deg, #111827, #1a2332)',
        border: '1px solid rgba(0,255,136,0.15)', borderRadius: 16,
        padding: '44px 38px', width: 400, maxWidth: '92vw',
        boxShadow: '0 0 80px rgba(0,255,136,0.05), 0 24px 60px rgba(0,0,0,0.6)',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src="/logo.png" alt="Roofing Pros USA" style={{
            height: 80, objectFit: 'contain',
            filter: 'drop-shadow(0 0 12px rgba(0,255,136,0.25))',
          }} />
        </div>
        <h1 style={{
          textAlign: 'center', color: '#00ff88', fontSize: 26, margin: '0 0 6px',
          letterSpacing: 6, textShadow: '0 0 20px rgba(0,255,136,0.35)',
        }}>FLEET MANAGER</h1>
        <p style={{
          textAlign: 'center', color: '#556', fontSize: 11, letterSpacing: 2.5, margin: '0 0 30px',
        }}>PM TRUCK ASSIGNMENT SYSTEM</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ color: '#00ff88', fontSize: 10, letterSpacing: 3, display: 'block', marginBottom: 6 }}>USERNAME</label>
            <input type="text" value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              style={{
                width: '100%', boxSizing: 'border-box', background: '#0a0f18',
                border: '1px solid rgba(0,255,136,0.2)', borderRadius: 8,
                padding: '13px 14px', color: '#e0e0e0', fontSize: 15,
                fontFamily: "'Courier New', monospace",
              }}
              placeholder="Enter username" autoFocus />
          </div>
          <div>
            <label style={{ color: '#00ff88', fontSize: 10, letterSpacing: 3, display: 'block', marginBottom: 6 }}>PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                style={{
                  width: '100%', boxSizing: 'border-box', background: '#0a0f18',
                  border: '1px solid rgba(0,255,136,0.2)', borderRadius: 8,
                  padding: '13px 14px', color: '#e0e0e0', fontSize: 15,
                  fontFamily: "'Courier New', monospace",
                }}
                placeholder="Enter password" />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: '#556', cursor: 'pointer', fontSize: 12,
                fontFamily: "'Courier New', monospace",
              }}>{showPw ? 'HIDE' : 'SHOW'}</button>
            </div>
          </div>
          {error && <p style={{ color: '#ff4444', fontSize: 13, textAlign: 'center', margin: 0 }}>{error}</p>}
          <button type="submit" disabled={loading} style={{
            background: loading ? '#224' : 'linear-gradient(135deg, #00ff88, #00cc66)',
            border: 'none', borderRadius: 8, padding: 14, color: loading ? '#888' : '#0a0a1a',
            fontSize: 14, fontWeight: 700, letterSpacing: 3, cursor: 'pointer',
            fontFamily: "'Courier New', monospace", marginTop: 4,
          }}>{loading ? 'AUTHENTICATING...' : '▸ LOG IN'}</button>
        </form>
        <p style={{ textAlign: 'center', color: '#334', fontSize: 9, letterSpacing: 2, marginTop: 22 }}>AUTHORIZED PERSONNEL ONLY</p>
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

  const addMember = () => onUpdate({
    ...team,
    members: [...team.members, { name: '', truck: '' }],
  });

  const removeMember = (idx) => onUpdate({
    ...team,
    members: team.members.filter((_, i) => i !== idx),
  });

  return (
    <div style={{
      background: 'linear-gradient(145deg, #111827, #1a2235)',
      border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12,
      overflow: 'hidden', boxShadow: '0 4px 30px rgba(0,0,0,0.25)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '13px 18px',
        background: `linear-gradient(135deg, ${team.color}, ${team.color}aa)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 15, color: '#fff', fontWeight: 700, letterSpacing: 2, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{team.name}</h2>
          <span style={{ fontSize: 9, color: '#ffffffaa', background: '#00000030', padding: '2px 8px', borderRadius: 4, letterSpacing: 1 }}>{team.doh}</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ fontSize: 10, color: '#fff', background: '#00000030', padding: '3px 10px', borderRadius: 12 }}>{active.length} Active</span>
          {vacant.length > 0 && <span style={{ fontSize: 10, color: '#ff6b6b', background: '#ff444420', padding: '3px 10px', borderRadius: 12 }}>{vacant.length} Vacant</span>}
        </div>
      </div>

      <div style={{ display: 'flex', padding: '9px 18px', background: '#080d16', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ flex: 2, fontSize: 9, color: '#556', letterSpacing: 2.5, fontWeight: 600 }}>PROJECT MANAGER</div>
        <div style={{ flex: 1, fontSize: 9, color: '#556', letterSpacing: 2.5, fontWeight: 600 }}>TRUCK #</div>
        {isEditing && <div style={{ flex: 0.4 }} />}
      </div>

      {team.members.map((m, idx) => (
        <div key={m.dbId || `new-${idx}`} style={{
          display: 'flex', padding: '7px 18px', alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.02)',
          background: m.isLead ? `${team.color}15` : m.name === 'Vacant' ? '#1a0a0a' : idx % 2 === 0 ? '#0f1520' : '#121a28',
        }}>
          <div style={{ flex: 2, fontSize: 13 }}>
            {isEditing ? (
              <select value={m.name} onChange={(e) => handleChange(idx, 'name', e.target.value)}
                style={{ background: '#080d16', border: '1px solid #333', borderRadius: 4, padding: '5px 8px', color: '#e0e0e0', fontSize: 12, fontFamily: "'Courier New', monospace", width: '100%', maxWidth: 220 }}>
                <option value="">-- Select PM --</option>
                <option value="Vacant">Vacant</option>
                {allMembers.map((n, i) => <option key={i} value={n}>{n}</option>)}
              </select>
            ) : (
              <span style={{
                color: m.isLead ? team.color : m.name === 'Vacant' ? '#ff4444' : '#d0d0d0',
                fontWeight: m.isLead ? 700 : 400,
              }}>{m.isLead && '★ '}{m.name || '—'}</span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            {isEditing ? (
              <input type="text" value={m.truck} onChange={(e) => handleChange(idx, 'truck', e.target.value)}
                style={{ background: '#080d16', border: '1px solid #333', borderRadius: 4, padding: '5px 8px', color: '#00ff88', fontSize: 13, fontFamily: "'Courier New', monospace", width: 60, textAlign: 'center' }}
                placeholder="#" />
            ) : (
              <span style={{ fontSize: 14, fontWeight: 700, color: m.truck === 'NT' ? '#666' : '#00ff88' }}>{m.truck || '—'}</span>
            )}
          </div>
          {isEditing && (
            <div style={{ flex: 0.4, textAlign: 'right' }}>
              <button onClick={() => removeMember(idx)} style={{ background: '#ff444418', border: '1px solid #ff444430', borderRadius: 4, padding: '3px 10px', color: '#ff4444', fontSize: 12, cursor: 'pointer' }}>✕</button>
            </div>
          )}
        </div>
      ))}

      {isEditing && (
        <button onClick={addMember} style={{
          display: 'block', width: '100%', background: 'transparent',
          border: 'none', borderTop: '1px dashed #222', padding: 10,
          color: '#00ff88', fontSize: 11, letterSpacing: 1, cursor: 'pointer',
          fontFamily: "'Courier New', monospace",
        }}>+ ADD MEMBER</button>
      )}
    </div>
  );
}

// ─── Vacant Section ───
function VacantSection({ teams }) {
  const vacants = [];
  const ntTrucks = [];
  teams.forEach(t => t.members.forEach(m => {
    if (m.name === 'Vacant') vacants.push({ team: t.name, truck: m.truck, color: t.color });
    if (m.truck === 'NT' && m.name !== 'Vacant') ntTrucks.push({ team: t.name, name: m.name, color: t.color });
  }));

  const Card = ({ label, sub, accent }) => (
    <div style={{
      background: '#0a0f18', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 8, padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 4,
      borderLeft: `3px solid ${accent}`,
    }}>
      <span style={{ fontSize: 17, fontWeight: 700, color: accent }}>{label}</span>
      <span style={{ fontSize: 10, color: '#556', letterSpacing: 1 }}>{sub}</span>
    </div>
  );

  return (
    <div style={{
      background: 'linear-gradient(145deg, #111827, #1a2235)',
      border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24,
    }}>
      <h2 style={{ margin: '0 0 20px', fontSize: 17, color: '#ff4444', letterSpacing: 3 }}>🚛 VACANT TRUCKS</h2>
      {vacants.length === 0 ? (
        <p style={{ color: '#00ff88', fontSize: 14 }}>All trucks assigned!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {vacants.map((v, i) => <Card key={i} label={`#${v.truck}`} sub={v.team} accent={v.color} />)}
        </div>
      )}
      {ntTrucks.length > 0 && (
        <>
          <h3 style={{ margin: '28px 0 16px', fontSize: 14, color: '#E8A838', letterSpacing: 2 }}>📋 NO TRUCK ASSIGNED (NT)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {ntTrucks.map((v, i) => <Card key={i} label={v.name} sub={v.team} accent={v.color} />)}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main FleetManager ───
export default function FleetManager() {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Check saved auth on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rpusa_auth');
      if (saved) setUser(JSON.parse(saved));
    } catch (e) {}
    setLoading(false);
  }, []);

  // Load data from Supabase when user logs in
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchTeamsWithMembers();
      setTeams(data);
    } catch (err) {
      console.error('Failed to load data:', err);
      notify('❌ Failed to load data. Check connection.');
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh data every 30 seconds when not editing
  useEffect(() => {
    if (!user || isEditing) return;
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [user, isEditing, loadData]);

  const allNames = [...new Set(
    teams.flatMap(t => t.members.filter(m => m.name !== 'Vacant').map(m => m.name))
  )].sort();

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAllMembers(teams);
      // Reload fresh data from DB
      const data = await fetchTeamsWithMembers();
      setTeams(data);
      setIsEditing(false);
      notify('✅ Changes saved to cloud!');
    } catch (err) {
      console.error('Save failed:', err);
      notify('❌ Save failed. Try again.');
    }
    setSaving(false);
  };

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (w) { w.document.write(generatePrintHTML(teams)); w.document.close(); }
  };

  const handleLogout = () => {
    localStorage.removeItem('rpusa_auth');
    setUser(null);
    setTeams([]);
    setIsEditing(false);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="loading-pulse" style={{ color: '#00ff88', fontSize: 14, letterSpacing: 3 }}>LOADING SYSTEM...</p>
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a0a1a 0%, #0d1525 100%)' }}>
      {/* Toast */}
      {toast && (
        <div className="toast" style={{
          position: 'fixed', top: 20, right: 20,
          background: toast.includes('❌') ? 'linear-gradient(135deg, #cc3333, #992222)' : 'linear-gradient(135deg, #00cc66, #009944)',
          color: '#fff', padding: '12px 24px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          zIndex: 10000, boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>{toast}</div>
      )}

      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 22px', background: 'linear-gradient(135deg, #111827, #1a2332)',
        borderBottom: '1px solid rgba(0,255,136,0.12)', flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src="/logo.png" alt="Logo" style={{ height: 46, objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(0,255,136,0.25))' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: 18, color: '#00ff88', letterSpacing: 4, textShadow: '0 0 15px rgba(0,255,136,0.3)' }}>FLEET MANAGER</h1>
            <p style={{ margin: 0, fontSize: 10, color: '#556', letterSpacing: 1 }}>{dateStr}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <nav style={{ display: 'flex', gap: 3 }}>
            {[
              { id: 'dashboard', label: 'DASHBOARD', icon: '📊' },
              { id: 'vacant', label: 'VACANT', icon: '🚛' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                background: activeTab === tab.id ? 'rgba(0,255,136,0.1)' : 'transparent',
                border: `1px solid ${activeTab === tab.id ? 'rgba(0,255,136,0.4)' : '#222'}`,
                borderRadius: 6, padding: '7px 14px',
                color: activeTab === tab.id ? '#00ff88' : '#667',
                fontSize: 10, letterSpacing: 1.5, cursor: 'pointer',
                fontFamily: "'Courier New', monospace",
              }}>{tab.icon} {tab.label}</button>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 6px #00ff88' }} />
            <span style={{ fontSize: 9, color: '#00ff88', letterSpacing: 1 }}>SYNCED</span>
          </div>
          <span style={{ fontSize: 10, color: '#778', padding: '5px 12px', border: '1px solid #222', borderRadius: 16, letterSpacing: 1 }}>
            {user.role} ▸ {user.username}
          </span>
          <button onClick={handleLogout} style={{
            background: 'transparent', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 6,
            padding: '5px 12px', color: '#ff4444', fontSize: 9, letterSpacing: 1, cursor: 'pointer',
            fontFamily: "'Courier New', monospace",
          }}>LOGOUT</button>
        </div>
      </header>

      {/* Stats + Actions */}
      <div style={{
        display: 'flex', gap: 16, padding: '14px 22px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        flexWrap: 'wrap', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', gap: 16, flex: 1, flexWrap: 'wrap' }}>
          {[
            { label: 'TEAMS', value: teams.length, color: '#4A90D9' },
            { label: 'ACTIVE PMs', value: totalPMs, color: '#00ff88' },
            { label: 'VACANT', value: totalVacant, color: '#ff4444' },
            { label: 'TOTAL SLOTS', value: totalTrucks, color: '#E8A838' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: 9, color: '#556', letterSpacing: 2 }}>{s.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {activeTab === 'dashboard' && (
            <>
              {isEditing ? (
                <>
                  <button onClick={handleSave} disabled={saving} style={{
                    background: saving ? '#224' : 'linear-gradient(135deg, #00cc66, #009944)',
                    border: 'none', borderRadius: 8, padding: '9px 18px', color: saving ? '#888' : '#fff',
                    fontSize: 11, fontWeight: 600, letterSpacing: 1.5, cursor: 'pointer',
                    fontFamily: "'Courier New', monospace", boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  }}>{saving ? '⏳ SAVING...' : '💾 SAVE TO CLOUD'}</button>
                  <button onClick={() => { setIsEditing(false); loadData(); }} style={{
                    background: 'transparent', border: '1px solid #444',
                    borderRadius: 8, padding: '9px 18px', color: '#888',
                    fontSize: 11, fontWeight: 600, letterSpacing: 1.5, cursor: 'pointer',
                    fontFamily: "'Courier New', monospace",
                  }}>✕ CANCEL</button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} style={{
                  background: 'linear-gradient(135deg, #4A90D9, #357ABD)',
                  border: 'none', borderRadius: 8, padding: '9px 18px', color: '#fff',
                  fontSize: 11, fontWeight: 600, letterSpacing: 1.5, cursor: 'pointer',
                  fontFamily: "'Courier New', monospace", boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                }}>✏️ EDIT MODE</button>
              )}
              <button onClick={handlePrint} style={{
                background: 'linear-gradient(135deg, #E8A838, #CC8800)',
                border: 'none', borderRadius: 8, padding: '9px 18px', color: '#fff',
                fontSize: 11, fontWeight: 600, letterSpacing: 1.5, cursor: 'pointer',
                fontFamily: "'Courier New', monospace", boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
              }}>🖨️ PRINT REPORT</button>
              <button onClick={loadData} style={{
                background: 'transparent', border: '1px solid #333',
                borderRadius: 8, padding: '9px 18px', color: '#888',
                fontSize: 11, fontWeight: 600, letterSpacing: 1.5, cursor: 'pointer',
                fontFamily: "'Courier New', monospace",
              }}>↻ REFRESH</button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <main style={{ padding: 22, maxWidth: 1440, margin: '0 auto' }}>
        {teams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <p className="loading-pulse" style={{ color: '#00ff88', fontSize: 14, letterSpacing: 3 }}>LOADING FLEET DATA...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(370px, 1fr))', gap: 22 }}>
                {teams.map(t => (
                  <TeamSection key={t.id} team={t} allMembers={allNames}
                    onUpdate={(u) => setTeams(p => p.map(x => x.id === u.id ? u : x))}
                    isEditing={isEditing} />
                ))}
              </div>
            )}
            {activeTab === 'vacant' && <VacantSection teams={teams} />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center', padding: 18,
        borderTop: '1px solid rgba(255,255,255,0.04)',
        color: '#334', fontSize: 10, letterSpacing: 2,
      }}>
        ROOFING PROS USA — Fleet Management System v2.0 — Cloud Synced
      </footer>
    </div>
  );
}
