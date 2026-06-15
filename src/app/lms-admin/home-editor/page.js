'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Eye, EyeOff, ChevronUp, ChevronDown, Save, RotateCcw,
  Bell, BellOff, Youtube, BookOpen, Image, Megaphone,
  CheckCircle, AlertCircle, Plus, Trash2, GripVertical,
  ExternalLink, Palette, Link2, Type, Calendar, X,
  Monitor, Play, Loader2, Info, Layers, LayoutDashboard,
  Star, RefreshCw
} from 'lucide-react';
import { DEFAULT_HOME_CONFIG } from '@/lib/homeConfig';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

function Toast({ msg, type }) {
  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
      padding: '12px 20px', borderRadius: '10px', fontWeight: '600', fontSize: '14px',
      display: 'flex', alignItems: 'center', gap: '8px',
      background: type === 'success' ? '#16A34A' : type === 'error' ? '#DC2626' : '#1A1B4B',
      color: '#FFF', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      animation: 'slideUpFade 0.3s ease',
    }}>
      {type === 'success' ? <CheckCircle size={16} /> : type === 'error' ? <AlertCircle size={16} /> : <Info size={16} />}
      {msg}
    </div>
  );
}

// ─────────────────────────────────────────────
// Sub-editors
// ─────────────────────────────────────────────

function BannerEditor({ banner, onChange }) {
  return (
    <div style={s.panel}>
      <div style={s.panelHeader}>
        <Bell size={16} color="#FF9F1C" />
        <span style={s.panelTitle}>Notification Banner</span>
        <label style={s.toggle}>
          <input type="checkbox" checked={banner.enabled}
            onChange={e => onChange({ ...banner, enabled: e.target.checked })} />
          <span style={{ ...s.togglePill, background: banner.enabled ? '#16A34A' : '#D1D5DB' }} />
        </label>
      </div>
      <div style={{ ...s.panelBody, opacity: banner.enabled ? 1 : 0.5, pointerEvents: banner.enabled ? 'auto' : 'none' }}>
        <Field label="Banner Text" icon={<Type size={13} />}>
          <input style={s.input} value={banner.text}
            onChange={e => onChange({ ...banner, text: e.target.value })}
            placeholder="e.g. 🎉 New book release! Check it out." />
        </Field>
        <Field label="Link URL (optional)" icon={<Link2 size={13} />}>
          <input style={s.input} value={banner.link}
            onChange={e => onChange({ ...banner, link: e.target.value })}
            placeholder="https://... or /books" />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Field label="Background Color" icon={<Palette size={13} />}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="color" value={banner.bgColor}
                onChange={e => onChange({ ...banner, bgColor: e.target.value })}
                style={{ width: '36px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '2px' }} />
              <input style={{ ...s.input, flex: 1 }} value={banner.bgColor}
                onChange={e => onChange({ ...banner, bgColor: e.target.value })} />
            </div>
          </Field>
          <Field label="Text Color" icon={<Palette size={13} />}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="color" value={banner.textColor}
                onChange={e => onChange({ ...banner, textColor: e.target.value })}
                style={{ width: '36px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '2px' }} />
              <input style={{ ...s.input, flex: 1 }} value={banner.textColor}
                onChange={e => onChange({ ...banner, textColor: e.target.value })} />
            </div>
          </Field>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
          <input type="checkbox" checked={banner.dismissable}
            onChange={e => onChange({ ...banner, dismissable: e.target.checked })} />
          Allow users to dismiss the banner
        </label>

        {banner.enabled && banner.text && (
          <div style={{
            marginTop: '8px', padding: '12px 16px', borderRadius: '8px',
            background: banner.bgColor, color: banner.textColor,
            fontSize: '13px', fontWeight: '600', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            {banner.text}
            {banner.dismissable && <X size={14} style={{ cursor: 'pointer', opacity: 0.7 }} />}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionsEditor({ sections, onChange }) {
  const move = (idx, dir) => {
    const arr = [...sections];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    onChange(arr.map((s, i) => ({ ...s, order: i + 1 })));
  };

  return (
    <div style={s.panel}>
      <div style={s.panelHeader}>
        <Layers size={16} color="#FF9F1C" />
        <span style={s.panelTitle}>Section Visibility & Order</span>
      </div>
      <div style={s.panelBody}>
        <p style={s.hint}>Toggle visibility and reorder sections on the homepage.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sections.map((sec, idx) => (
            <div key={sec.id} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 14px', borderRadius: '10px', border: '1px solid #E5E7EB',
              background: sec.visible ? '#FFF' : '#F9FAFB',
              transition: 'all 0.2s ease',
            }}>
              <GripVertical size={15} color="#D1D5DB" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: sec.visible ? '#111827' : '#9CA3AF' }}>
                  {sec.label}
                </div>
                <div style={{ fontSize: '11px', color: '#9CA3AF' }}>order: {sec.order}</div>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => move(idx, -1)} disabled={idx === 0}
                  style={{ ...s.iconBtn, opacity: idx === 0 ? 0.3 : 1 }}>
                  <ChevronUp size={14} />
                </button>
                <button onClick={() => move(idx, 1)} disabled={idx === sections.length - 1}
                  style={{ ...s.iconBtn, opacity: idx === sections.length - 1 ? 0.3 : 1 }}>
                  <ChevronDown size={14} />
                </button>
              </div>
              <button
                onClick={() => onChange(sections.map(x => x.id === sec.id ? { ...x, visible: !x.visible } : x))}
                style={{ ...s.iconBtn, background: sec.visible ? 'rgba(22,163,74,0.08)' : '#F3F4F6', color: sec.visible ? '#16A34A' : '#9CA3AF' }}>
                {sec.visible ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnnouncementsEditor({ announcements, onChange }) {
  const add = () => onChange([...announcements, {
    id: Date.now().toString(), text: '', expiresAt: '', visible: true, type: 'info'
  }]);
  const remove = (id) => onChange(announcements.filter(a => a.id !== id));
  const update = (id, key, val) => onChange(announcements.map(a => a.id === id ? { ...a, [key]: val } : a));

  return (
    <div style={s.panel}>
      <div style={s.panelHeader}>
        <Megaphone size={16} color="#FF9F1C" />
        <span style={s.panelTitle}>Announcements</span>
        <button onClick={add} style={s.addBtn}><Plus size={13} /> Add</button>
      </div>
      <div style={s.panelBody}>
        {announcements.length === 0 && (
          <p style={s.hint}>No announcements. Click "Add" to create one.</p>
        )}
        {announcements.map((a) => (
          <div key={a.id} style={{ marginBottom: '16px', padding: '14px', borderRadius: '10px', border: '1px solid #E5E7EB', background: '#FFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <select value={a.type} onChange={e => update(a.id, 'type', e.target.value)} style={s.select}>
                <option value="info">ℹ️ Info</option>
                <option value="success">✅ Success</option>
                <option value="warning">⚠️ Warning</option>
                <option value="promo">🎉 Promo</option>
              </select>
              <div style={{ display: 'flex', gap: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={a.visible} onChange={e => update(a.id, 'visible', e.target.checked)} />
                  Visible
                </label>
                <button onClick={() => remove(a.id)} style={{ ...s.iconBtn, color: '#DC2626' }}><Trash2 size={14} /></button>
              </div>
            </div>
            <input style={{ ...s.input, marginBottom: '8px' }} value={a.text}
              onChange={e => update(a.id, 'text', e.target.value)}
              placeholder="Announcement text..." />
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Calendar size={13} color="#9CA3AF" />
              <input type="datetime-local" style={s.input} value={a.expiresAt}
                onChange={e => update(a.id, 'expiresAt', e.target.value)} />
              <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Expiry (optional)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VideosEditor({ pinnedVideos, ytCache, onChange }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = ytCache.filter(v =>
    v.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const togglePin = (id) => {
    if (pinnedVideos.includes(id)) {
      onChange(pinnedVideos.filter(v => v !== id));
    } else {
      onChange([...pinnedVideos, id]);
    }
  };

  const addManual = () => {
    const url = prompt('Paste a YouTube video URL or video ID:');
    if (!url) return;
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
    const id = match ? match[1] : url.trim();
    if (id && !pinnedVideos.includes(id)) {
      onChange([...pinnedVideos, id]);
    }
  };

  return (
    <div style={s.panel}>
      <div style={s.panelHeader}>
        <Youtube size={16} color="#FF0000" />
        <span style={s.panelTitle}>Pinned Videos</span>
        <button onClick={addManual} style={s.addBtn}><Plus size={13} /> Paste URL</button>
      </div>
      <div style={s.panelBody}>
        {pinnedVideos.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
              📌 Pinned ({pinnedVideos.length}) — shown first
            </div>
            {pinnedVideos.map(id => {
              const v = ytCache.find(x => x.id === id);
              return (
                <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', background: 'rgba(255,159,28,0.07)', marginBottom: '6px', border: '1px solid rgba(255,159,28,0.2)' }}>
                  <img src={v?.thumbnail || `https://img.youtube.com/vi/${id}/mqdefault.jpg`}
                    style={{ width: '60px', height: '36px', objectFit: 'cover', borderRadius: '4px' }} alt="" />
                  <div style={{ flex: 1, fontSize: '12px', fontWeight: '600', color: '#1A1B4B' }}>
                    {v?.title || id}
                  </div>
                  <button onClick={() => togglePin(id)} style={{ ...s.iconBtn, color: '#DC2626' }}>
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {ytCache.length > 0 && (
          <>
            <input style={{ ...s.input, marginBottom: '10px' }} value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="🔍 Search from cached videos..." />
            <div style={{ maxHeight: '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {filtered.slice(0, 20).map(v => {
                const pinned = pinnedVideos.includes(v.id);
                return (
                  <div key={v.id} onClick={() => togglePin(v.id)} style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '8px',
                    borderRadius: '8px', cursor: 'pointer', border: `1px solid ${pinned ? '#FF9F1C' : '#E5E7EB'}`,
                    background: pinned ? 'rgba(255,159,28,0.06)' : '#FFF',
                    transition: 'all 0.15s'
                  }}>
                    <img src={v.thumbnail} style={{ width: '60px', height: '36px', objectFit: 'cover', borderRadius: '4px' }} alt="" />
                    <div style={{ flex: 1, fontSize: '12px', color: '#374151', lineHeight: 1.3 }}>{v.title}</div>
                    {pinned && <Star size={14} fill="#FF9F1C" color="#FF9F1C" />}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BooksEditor({ books, onChange }) {
  const move = (idx, dir) => {
    const arr = [...books];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    onChange(arr);
  };
  const remove = (idx) => onChange(books.filter((_, i) => i !== idx));
  const update = (idx, key, val) => onChange(books.map((b, i) => i === idx ? { ...b, [key]: val } : b));
  const addBook = () => onChange([...books, { id: Date.now(), title: '', price: '', url: '', image: '' }]);

  return (
    <div style={s.panel}>
      <div style={s.panelHeader}>
        <BookOpen size={16} color="#FF9F1C" />
        <span style={s.panelTitle}>Featured Books ({books.length})</span>
        <button onClick={addBook} style={s.addBtn}><Plus size={13} /> Add Book</button>
      </div>
      <div style={s.panelBody}>
        {books.map((book, idx) => (
          <div key={book.id || idx} style={{ marginBottom: '12px', padding: '12px', borderRadius: '10px', border: '1px solid #E5E7EB', background: '#FFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              {book.image && <img src={book.image} alt="" style={{ width: '32px', height: '42px', objectFit: 'contain', borderRadius: '3px' }} />}
              <div style={{ flex: 1, fontSize: '13px', fontWeight: '700', color: '#111827' }}>{book.title || '(Untitled)'}</div>
              <button onClick={() => move(idx, -1)} disabled={idx === 0} style={{ ...s.iconBtn, opacity: idx === 0 ? 0.3 : 1 }}><ChevronUp size={13} /></button>
              <button onClick={() => move(idx, 1)} disabled={idx === books.length - 1} style={{ ...s.iconBtn, opacity: idx === books.length - 1 ? 0.3 : 1 }}><ChevronDown size={13} /></button>
              <button onClick={() => remove(idx)} style={{ ...s.iconBtn, color: '#DC2626' }}><Trash2 size={13} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <input style={s.input} value={book.title} onChange={e => update(idx, 'title', e.target.value)} placeholder="Title" />
              <input style={s.input} value={book.price} onChange={e => update(idx, 'price', e.target.value)} placeholder="Price (e.g. ₹200)" />
              <input style={{ ...s.input, gridColumn: 'span 2' }} value={book.url} onChange={e => update(idx, 'url', e.target.value)} placeholder="Store URL" />
              <input style={{ ...s.input, gridColumn: 'span 2' }} value={book.image} onChange={e => update(idx, 'image', e.target.value)} placeholder="Image URL (Shopify CDN or Google Drive)" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroSlidesEditor({ slides, onChange }) {
  const remove = (idx) => onChange(slides.filter((_, i) => i !== idx));
  const add = () => {
    const url = prompt('Paste image URL (Google Drive or direct link):');
    if (url?.trim()) onChange([...slides, url.trim()]);
  };
  const move = (idx, dir) => {
    const arr = [...slides];
    const t = idx + dir;
    if (t < 0 || t >= arr.length) return;
    [arr[idx], arr[t]] = [arr[t], arr[idx]];
    onChange(arr);
  };

  return (
    <div style={s.panel}>
      <div style={s.panelHeader}>
        <Image size={16} color="#FF9F1C" />
        <span style={s.panelTitle}>Hero Slides ({slides.length})</span>
        <button onClick={add} style={s.addBtn}><Plus size={13} /> Add</button>
      </div>
      <div style={s.panelBody}>
        {slides.map((url, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', padding: '8px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#FFF' }}>
            <img src={url} alt="" style={{ width: '60px', height: '36px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
              onError={e => { e.target.style.display = 'none'; }} />
            <div style={{ flex: 1, fontSize: '11px', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</div>
            <button onClick={() => move(idx, -1)} disabled={idx === 0} style={{ ...s.iconBtn, opacity: idx === 0 ? 0.3 : 1 }}><ChevronUp size={13} /></button>
            <button onClick={() => move(idx, 1)} disabled={idx === slides.length - 1} style={{ ...s.iconBtn, opacity: idx === slides.length - 1 ? 0.3 : 1 }}><ChevronDown size={13} /></button>
            <button onClick={() => remove(idx)} style={{ ...s.iconBtn, color: '#DC2626' }}><Trash2 size={13} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CredentialsEditor({ credentials, onChange }) {
  const remove = (idx) => onChange(credentials.filter((_, i) => i !== idx));
  const add = () => {
    const url = prompt('Paste Google Drive image URL:');
    if (!url?.trim()) return;
    const alt = prompt('Enter a description (e.g. IIT Mumbai Topper):') || '';
    onChange([...credentials, { src: url.trim(), alt }]);
  };
  const update = (idx, key, val) => onChange(credentials.map((c, i) => i === idx ? { ...c, [key]: val } : c));
  const move = (idx, dir) => {
    const arr = [...credentials];
    const t = idx + dir;
    if (t < 0 || t >= arr.length) return;
    [arr[idx], arr[t]] = [arr[t], arr[idx]];
    onChange(arr);
  };

  return (
    <div style={s.panel}>
      <div style={s.panelHeader}>
        <Star size={16} color="#FF9F1C" />
        <span style={s.panelTitle}>Credentials ({credentials.length})</span>
        <button onClick={add} style={s.addBtn}><Plus size={13} /> Add</button>
      </div>
      <div style={s.panelBody}>
        {credentials.map((cred, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', padding: '8px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#FFF' }}>
            <img src={cred.src} alt={cred.alt} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', flexShrink: 0 }}
              onError={e => { e.target.style.display = 'none'; }} />
            <input style={{ ...s.input, flex: 1 }} value={cred.alt}
              onChange={e => update(idx, 'alt', e.target.value)} placeholder="Description" />
            <button onClick={() => move(idx, -1)} disabled={idx === 0} style={{ ...s.iconBtn, opacity: idx === 0 ? 0.3 : 1 }}><ChevronUp size={13} /></button>
            <button onClick={() => move(idx, 1)} disabled={idx === credentials.length - 1} style={{ ...s.iconBtn, opacity: idx === credentials.length - 1 ? 0.3 : 1 }}><ChevronDown size={13} /></button>
            <button onClick={() => remove(idx)} style={{ ...s.iconBtn, color: '#DC2626' }}><Trash2 size={13} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Field wrapper
// ─────────────────────────────────────────────
function Field({ label, icon, children }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
        {icon}{label}
      </label>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function HomeEditorPage() {
  const [config, setConfig] = useState(null);
  const [original, setOriginal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('sections');
  const [ytCache, setYtCache] = useState([]);
  const [lastSavedBy, setLastSavedBy] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load config and YouTube cache
  useEffect(() => {
    const init = async () => {
      try {
        const [cfgRes, ytRes] = await Promise.all([
          fetch('/api/home-config'),
          fetch('/api/youtube'),
        ]);
        if (cfgRes.ok) {
          const data = await cfgRes.json();
          const lastBy = cfgRes.headers.get('X-Updated-By');
          if (lastBy) setLastSavedBy(lastBy);
          const merged = { ...deepClone(DEFAULT_HOME_CONFIG), ...data };
          setConfig(merged);
          setOriginal(deepClone(merged));
        }
        if (ytRes.ok) {
          const yt = await ytRes.json();
          setYtCache(Array.isArray(yt) ? yt : []);
        }
      } catch (err) {
        console.error(err);
        showToast('Failed to load config', 'error');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Detect unsaved changes
  useEffect(() => {
    if (!config || !original) return;
    setHasChanges(JSON.stringify(config) !== JSON.stringify(original));
  }, [config, original]);

  const update = useCallback((key, val) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/home-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || 'Save failed', 'error');
        return;
      }
      setOriginal(deepClone(config));
      setHasChanges(false);
      showToast('Homepage saved successfully! Changes are live.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!confirm('Discard all unsaved changes?')) return;
    setConfig(deepClone(original));
  };

  const TABS = [
    { id: 'sections',       label: 'Sections',       icon: <Layers size={14} /> },
    { id: 'banner',         label: 'Banner',          icon: <Bell size={14} /> },
    { id: 'announcements',  label: 'Announcements',   icon: <Megaphone size={14} /> },
    { id: 'hero',           label: 'Hero Slides',     icon: <Monitor size={14} /> },
    { id: 'books',          label: 'Books',           icon: <BookOpen size={14} /> },
    { id: 'videos',         label: 'Videos',          icon: <Youtube size={14} /> },
    { id: 'credentials',    label: 'Credentials',     icon: <Star size={14} /> },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '14px' }}>
        <Loader2 size={36} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>Loading Home Editor...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .tab-btn:hover { background: rgba(255,159,28,0.08) !important; color: #FF9F1C !important; }
        .he-section::-webkit-scrollbar { width: 5px; } .he-section::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#111827', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LayoutDashboard size={22} color="#FF9F1C" /> Home Screen Editor
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>
            Manage everything on the public homepage. Changes go live instantly.
            {lastSavedBy && <span style={{ color: '#9CA3AF', marginLeft: '8px' }}>Last saved by: <strong>{lastSavedBy}</strong></span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {hasChanges && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#D97706', fontWeight: '600', background: '#FEF3C7', padding: '6px 12px', borderRadius: '9999px' }}>
              <AlertCircle size={13} /> Unsaved changes
            </div>
          )}
          <button onClick={handleReset} disabled={!hasChanges}
            style={{ ...sBtn, background: '#F3F4F6', color: '#374151', opacity: hasChanges ? 1 : 0.4 }}>
            <RotateCcw size={14} /> Reset
          </button>
          <a href="/" target="_blank" rel="noopener noreferrer"
            style={{ ...sBtn, background: '#1A1B4B', color: '#FFF', textDecoration: 'none' }}>
            <ExternalLink size={14} /> View Site
          </a>
          <button onClick={handleSave} disabled={saving || !hasChanges}
            style={{ ...sBtn, background: hasChanges ? '#FF9F1C' : '#D1D5DB', color: '#1A1B4B', opacity: saving ? 0.7 : 1 }}>
            {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
            {saving ? 'Saving...' : 'Save & Go Live'}
          </button>
        </div>
      </div>

      {/* Visual Editor Override Promo Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1A1B4B, #2D1B69)',
        border: '1px solid rgba(255,159,28,0.3)',
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '24px',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 8px 32px rgba(26,27,75,0.15)',
        animation: 'slideUpFade 0.4s ease'
      }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,159,28,0.15)', color: '#FF9F1C', padding: '4px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: '800', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ✨ Premium Feature
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: '800', margin: '0 0 6px', fontFamily: 'Outfit, sans-serif', color: '#fff' }}>
            Design Your Homepage with the Drag & Drop Visual Editor
          </h3>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.5 }}>
            Unlock free-hand column resizing, 20+ custom sections, testimonial carousels, maps, countdown timers, and block layouts by switching the homepage to the visual site builder mode.
          </p>
        </div>
        <button
          onClick={async () => {
            try {
              const checkRes = await fetch('/api/site-pages/%2F');
              if (checkRes.ok) {
                window.location.href = '/lms-admin/site-builder/%252F';
              } else {
                const createRes = await fetch('/api/site-pages', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    title: 'Home Page',
                    slug: '/',
                    meta_description: 'Welcome to Wisdom Eye website.',
                    is_published: true,
                    blocks: [
                      { id: 'sys_hero', type: 'system_hero_slides', props: {} },
                      { id: 'sys_creds', type: 'system_credentials', props: {} },
                      { id: 'sys_logos', type: 'system_logos', props: {} },
                      { id: 'sys_feat', type: 'system_featured', props: {} },
                      { id: 'sys_about', type: 'system_about', props: {} },
                      { id: 'sys_books', type: 'system_books', props: {} },
                      { id: 'sys_yt', type: 'system_youtube', props: {} }
                    ]
                  })
                });
                if (createRes.ok) {
                  window.location.href = '/lms-admin/site-builder/%252F';
                } else {
                  const data = await createRes.json();
                  alert(data.error || 'Failed to initialize homepage visual page.');
                }
              }
            } catch (err) {
              console.error(err);
              alert('An error occurred. Please try again.');
            }
          }}
          style={{
            background: 'linear-gradient(135deg, #FF9F1C, #E07A5F)',
            color: '#1A1B4B',
            border: 'none',
            borderRadius: '12px',
            padding: '14px 28px',
            fontSize: '14px',
            fontWeight: '800',
            cursor: 'pointer',
            fontFamily: 'Outfit, sans-serif',
            boxShadow: '0 8px 20px rgba(255,159,28,0.35)',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Open Visual Homepage Editor →
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: '#F9FAFB', padding: '6px', borderRadius: '12px', border: '1px solid #E5E7EB', flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button key={tab.id} className="tab-btn"
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: '600', transition: 'all 0.15s',
              background: activeTab === tab.id ? '#FFF' : 'transparent',
              color: activeTab === tab.id ? '#FF9F1C' : '#6B7280',
              boxShadow: activeTab === tab.id ? '0 1px 6px rgba(0,0,0,0.08)' : 'none',
            }}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="he-section" style={{ maxHeight: 'calc(100vh - 260px)', overflowY: 'auto', paddingRight: '4px' }}>
        {config && (
          <>
            {activeTab === 'sections' && (
              <SectionsEditor sections={config.sections} onChange={v => update('sections', v)} />
            )}
            {activeTab === 'banner' && (
              <BannerEditor banner={config.notificationBanner} onChange={v => update('notificationBanner', v)} />
            )}
            {activeTab === 'announcements' && (
              <AnnouncementsEditor announcements={config.announcements || []} onChange={v => update('announcements', v)} />
            )}
            {activeTab === 'hero' && (
              <HeroSlidesEditor slides={config.heroSlides || []} onChange={v => update('heroSlides', v)} />
            )}
            {activeTab === 'books' && (
              <BooksEditor books={config.featuredBooks || []} onChange={v => update('featuredBooks', v)} />
            )}
            {activeTab === 'videos' && (
              <VideosEditor pinnedVideos={config.pinnedVideos || []} ytCache={ytCache} onChange={v => update('pinnedVideos', v)} />
            )}
            {activeTab === 'credentials' && (
              <CredentialsEditor credentials={config.credentials || []} onChange={v => update('credentials', v)} />
            )}
          </>
        )}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const s = {
  panel: { background: '#FFF', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', marginBottom: '16px' },
  panelHeader: { display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 20px', borderBottom: '1px solid #F3F4F6', background: '#FAFAFA' },
  panelTitle: { fontSize: '15px', fontWeight: '800', color: '#111827', flex: 1, fontFamily: 'Outfit, sans-serif' },
  panelBody: { padding: '20px' },
  input: {
    width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #E5E7EB',
    fontSize: '13px', color: '#111827', background: '#FAFAFA', outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s',
  },
  select: {
    padding: '7px 12px', borderRadius: '8px', border: '1.5px solid #E5E7EB',
    fontSize: '12px', color: '#374151', background: '#FFF', fontFamily: 'inherit', cursor: 'pointer',
  },
  hint: { fontSize: '12px', color: '#9CA3AF', marginBottom: '12px' },
  toggle: { display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', position: 'relative' },
  togglePill: {
    width: '40px', height: '22px', borderRadius: '11px', transition: 'background 0.2s',
    display: 'inline-block', position: 'relative', cursor: 'pointer',
  },
  iconBtn: {
    width: '28px', height: '28px', borderRadius: '6px', border: 'none',
    background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#374151', transition: 'all 0.15s', flexShrink: 0,
  },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: '4px',
    padding: '5px 12px', borderRadius: '9999px', border: 'none', cursor: 'pointer',
    background: 'rgba(255,159,28,0.12)', color: '#FF9F1C',
    fontSize: '12px', fontWeight: '700', transition: 'all 0.15s',
  },
};

const sBtn = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '9px 18px', borderRadius: '9999px', border: 'none', cursor: 'pointer',
  fontSize: '13px', fontWeight: '700', transition: 'all 0.15s', fontFamily: 'Outfit, sans-serif',
};
