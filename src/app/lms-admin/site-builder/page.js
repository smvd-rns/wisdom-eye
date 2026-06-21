'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus, Globe, Edit3, Trash2, Eye, EyeOff, ExternalLink,
  Loader2, FileText, CheckCircle, AlertCircle, Clock, Search,
  LayoutTemplate, X, Menu, ArrowUp, ArrowDown, ChevronRight
} from 'lucide-react';

export default function SiteBuilderPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [newPage, setNewPage] = useState({ title: '', slug: '', meta_description: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Navbar Links Editor State
  const [showNavEditor, setShowNavEditor] = useState(false);
  const [navLinks, setNavLinks] = useState([]);
  const [savingNav, setSavingNav] = useState(false);
  const [newNavLink, setNewNavLink] = useState({ label: '', url: '', is_visible: true });

  // Branding & Footer Editor State
  const [showBrandingEditor, setShowBrandingEditor] = useState(false);
  const [brandingData, setBrandingData] = useState({
    name: '', slogan: '', description: '', address: '', email: '', phone: ''
  });
  const [savingBranding, setSavingBranding] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    loadPages();
    loadNavLinks();
    loadBrandingData();
  }, []);

  const loadPages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/site-pages');
      if (res.ok) {
        const data = await res.json();
        setPages(data.pages || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadNavLinks = async () => {
    try {
      const res = await fetch('/api/site-pages/navigation');
      if (res.ok) {
        const data = await res.json();
        setNavLinks(data.links || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadBrandingData = async () => {
    try {
      const res = await fetch('/api/tenant/metadata');
      if (res.ok) {
        const data = await res.json();
        setBrandingData({
          name: data.name || '',
          slogan: data.slogan || '',
          description: data.description || '',
          address: data.address || '',
          email: data.email || '',
          phone: data.phone || '',
          facebook_url: data.facebook_url || '',
          youtube_url: data.youtube_url || '',
          instagram_url: data.instagram_url || '',
          linkedin_url: data.linkedin_url || ''
        });
      }
    } catch (e) {
      console.error('Failed to load branding data', e);
    }
  };

  const handleSaveBranding = async () => {
    setSavingBranding(true);
    try {
      const res = await fetch('/api/tenant/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandingData)
      });
      if (res.ok) {
        showToast('Site branding and footer details updated successfully!', 'success');
        setShowBrandingEditor(false);
      } else {
        const errData = await res.json();
        showToast(errData.error || 'Failed to update branding details', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingBranding(false);
    }
  };

  const handleCreate = async () => {
    if (!newPage.title.trim() || !newPage.slug.trim()) {
      showToast('Title and URL slug are required', 'error');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/site-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPage),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Create failed', 'error'); return; }
      showToast('Page created! Opening builder...', 'success');
      setShowNew(false);
      setNewPage({ title: '', slug: '', meta_description: '' });
      setTimeout(() => {
        window.location.href = `/lms-admin/site-builder/${encodeURIComponent(data.page.slug)}`;
      }, 800);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const togglePublish = async (page) => {
    const res = await fetch(`/api/site-pages/${encodeURIComponent(page.slug)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !page.is_published }),
    });
    if (res.ok) {
      setPages(prev => prev.map(p => p.slug === page.slug ? { ...p, is_published: !p.is_published } : p));
      showToast(page.is_published ? 'Page unpublished' : 'Page published!', 'success');
    }
  };

  const handleDelete = async (page) => {
    const res = await fetch(`/api/site-pages/${encodeURIComponent(page.slug)}`, { method: 'DELETE' });
    if (res.ok) {
      setPages(prev => prev.filter(p => p.slug !== page.slug));
      showToast('Page deleted', 'success');
    } else {
      showToast('Delete failed', 'error');
    }
    setDeleteTarget(null);
  };

  const handleSaveNavLinks = async () => {
    setSavingNav(true);
    try {
      const res = await fetch('/api/site-pages/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links: navLinks })
      });
      if (res.ok) {
        showToast('Navbar links updated successfully!', 'success');
        setShowNavEditor(false);
      } else {
        showToast('Failed to update navigation', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingNav(false);
    }
  };

  const addNavLinkItem = () => {
    if (!newNavLink.label.trim() || !newNavLink.url.trim()) {
      showToast('Label and URL are required', 'error');
      return;
    }
    setNavLinks(prev => [...prev, { ...newNavLink, order_index: prev.length + 1 }]);
    setNewNavLink({ label: '', url: '', is_visible: true });
  };

  const removeNavLinkItem = (idx) => {
    setNavLinks(prev => prev.filter((_, i) => i !== idx));
  };

  const moveNavLinkItem = (idx, dir) => {
    const nextIdx = idx + dir;
    if (nextIdx < 0 || nextIdx >= navLinks.length) return;
    const updated = [...navLinks];
    [updated[idx], updated[nextIdx]] = [updated[nextIdx], updated[idx]];
    setNavLinks(updated);
  };

  const toggleLinkVisible = (idx) => {
    setNavLinks(prev => prev.map((l, i) => i === idx ? { ...l, is_visible: !l.is_visible } : l));
  };

  const slugify = (title) => {
    const clean = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')     // remove non-alphanumeric except spaces and hyphens
      .replace(/\s+/g, '-')             // replace spaces with single hyphen
      .replace(/-+/g, '-');             // replace multiple hyphens with single hyphen
    return '/' + (clean.startsWith('/') ? clean.slice(1) : clean);
  };

  const filtered = pages.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  const TEMPLATE_PAGES = [
    { title: 'Events Page', slug: '/events', desc: 'Upcoming events and programs' },
    { title: 'Gallery Page', slug: '/gallery', desc: 'Photo and media gallery' },
    { title: 'Testimonials Page', slug: '/testimonials', desc: 'Student reviews and success stories' },
    { title: 'FAQ Page', slug: '/faq', desc: 'Frequently asked questions' },
    { title: 'Donate Page', slug: '/donate', desc: 'Donation / support us page' },
  ];

  return (
    <div>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .page-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; }
        .action-btn:hover { opacity: 0.8; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#111827', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe size={22} color="#FF9F1C" /> Site Builder
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>
            Create and manage any page on your website with a visual drag-and-drop builder.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => { loadBrandingData(); setShowBrandingEditor(true); }} style={btnSecondary}>
            <Edit3 size={16} /> Edit Branding & Footer
          </button>
          <button onClick={() => setShowNavEditor(true)} style={btnSecondary}>
            <Menu size={16} /> Edit Navbar Links
          </button>
          <button onClick={() => setShowNew(true)} style={btnPrimary}>
            <Plus size={16} /> New Page
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search pages by title or URL..."
          style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '14px', background: '#FFF', boxSizing: 'border-box', fontFamily: 'inherit' }} />
      </div>

      {/* Pages List */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px', color: '#9CA3AF' }}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#FF9F1C' }} />
          Loading pages...
        </div>
      ) : filtered.length === 0 && !search ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <LayoutTemplate size={48} style={{ color: '#E5E7EB', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>No pages yet</h3>
          <p style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '24px' }}>Create your first page or start from a template below.</p>

          {/* Quick Templates */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', maxWidth: '700px', margin: '0 auto' }}>
            {TEMPLATE_PAGES.map(t => (
              <button key={t.slug} onClick={() => setNewPage({ title: t.title, slug: t.slug, meta_description: t.desc })}
                style={{ padding: '16px', borderRadius: '12px', border: '2px dashed #E5E7EB', background: '#FAFAFA', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = '#FF9F1C'; e.currentTarget.style.background = 'rgba(255,159,28,0.04)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#FAFAFA'; }}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>📄</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1A1B4B' }}>{t.title}</div>
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '3px' }}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>No pages match "{search}"</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filtered.map(page => (
            <div key={page.slug} className="page-card" style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.04)', transition: 'all 0.2s' }}>
              {/* Card Header */}
              <div style={{ padding: '16px 20px', background: page.slug === '/' ? 'linear-gradient(135deg, #1A1B4B, #2D1B69)' : '#F9FAFB', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: page.slug === '/' ? 'rgba(255,159,28,0.2)' : '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={16} color={page.slug === '/' ? '#FF9F1C' : '#1E40AF'} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: page.slug === '/' ? '#FFF' : '#111827', fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {page.title}
                    {page.slug === '/' && <span style={{ marginLeft: '8px', fontSize: '10px', background: 'rgba(255,159,28,0.2)', color: '#FF9F1C', padding: '2px 6px', borderRadius: '4px' }}>HOMEPAGE</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: page.slug === '/' ? 'rgba(255,255,255,0.6)' : '#6B7280', fontFamily: 'monospace' }}>{page.slug}</div>
                </div>
                <span style={{ padding: '3px 8px', borderRadius: '9999px', fontSize: '10px', fontWeight: '700', background: page.is_published ? '#DCFCE7' : '#FEF3C7', color: page.is_published ? '#16A34A' : '#D97706' }}>
                  {page.is_published ? '● Live' : '○ Draft'}
                </span>
              </div>

              {/* Card Body */}
              <div style={{ padding: '14px 20px' }}>
                {page.meta_description && (
                  <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '12px', lineHeight: 1.5 }}>{page.meta_description}</p>
                )}
                <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '14px' }}>
                  Updated {page.updated_at ? new Date(page.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never'}
                  {page.updated_by && ` by ${page.updated_by}`}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Link href={`/lms-admin/site-builder/${encodeURIComponent(page.slug)}`}
                    style={{ ...btnPrimary, flex: 1, justifyContent: 'center', fontSize: '12px', padding: '8px 14px' }}>
                    <Edit3 size={13} /> Edit Page
                  </Link>
                  <a href={page.slug} target="_blank" rel="noopener noreferrer"
                    style={{ ...iconBtn, color: '#1E40AF', background: '#EFF6FF' }} title="View live">
                    <ExternalLink size={14} />
                  </a>
                  <button onClick={() => togglePublish(page)} style={{ ...iconBtn, color: page.is_published ? '#D97706' : '#16A34A', background: page.is_published ? '#FEF3C7' : '#DCFCE7' }} title={page.is_published ? 'Unpublish' : 'Publish'}>
                    {page.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button onClick={() => setDeleteTarget(page)} style={{ ...iconBtn, color: '#DC2626', background: '#FEF2F2' }} title="Delete page">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Visual Navbar Editor Modal */}
      {showNavEditor && (
        <div style={modalOverlay} onClick={() => setShowNavEditor(false)}>
          <div style={{ ...modalBox, maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', fontFamily: 'Outfit, sans-serif' }}>Configure Navbar Links</h3>
                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>Drag or use arrows to sort. Toggle visibility of main header links.</p>
              </div>
              <button onClick={() => setShowNavEditor(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X size={20} /></button>
            </div>

            {/* Links List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto', paddingRight: '6px', marginBottom: '20px' }}>
              {navLinks.map((link, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: '10px', background: link.is_visible ? '#FFF' : '#FAFAFA' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <button onClick={() => moveNavLinkItem(idx, -1)} disabled={idx === 0} style={{ background: 'none', border: 'none', cursor: 'pointer', color: idx === 0 ? '#D1D5DB' : '#6B7280' }}><ArrowUp size={12} /></button>
                    <button onClick={() => moveNavLinkItem(idx, 1)} disabled={idx === navLinks.length - 1} style={{ background: 'none', border: 'none', cursor: 'pointer', color: idx === navLinks.length - 1 ? '#D1D5DB' : '#6B7280' }}><ArrowDown size={12} /></button>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: link.is_visible ? '#1A1B4B' : '#9CA3AF' }}>{link.label}</div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: 'monospace' }}>{link.url}</div>
                  </div>

                  <button onClick={() => toggleLinkVisible(idx)} style={{ ...iconBtn, width: '64px', height: '28px', fontSize: '11px', fontWeight: '600', color: link.is_visible ? '#16A34A' : '#D97706', background: link.is_visible ? '#DCFCE7' : '#FEF3C7' }}>
                    {link.is_visible ? 'Visible' : 'Hidden'}
                  </button>

                  <button onClick={() => removeNavLinkItem(idx)} style={{ ...iconBtn, color: '#DC2626', background: '#FEF2F2', width: '28px', height: '28px' }}><Trash2 size={13} /></button>
                </div>
              ))}
              {navLinks.length === 0 && <div style={{ textAlign: 'center', padding: '20px', color: '#9CA3AF', fontSize: '13px' }}>No links configured.</div>}
            </div>

            {/* Add New Link Block */}
            <div style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', marginBottom: '10px' }}>Add Link</h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input placeholder="Label (e.g. Events)" value={newNavLink.label} onChange={e => setNewNavLink(prev => ({ ...prev, label: e.target.value }))} style={{ ...fieldInput, flex: 1, minWidth: '120px' }} />
                <input placeholder="URL Slug (e.g. /events)" value={newNavLink.url} onChange={e => setNewNavLink(prev => ({ ...prev, url: e.target.value }))} style={{ ...fieldInput, flex: 2, minWidth: '180px' }} />
                <button onClick={addNavLinkItem} style={{ ...btnPrimary, padding: '9px 20px' }}><Plus size={14} /> Add</button>
              </div>
              
              {/* Quick Select Custom Page dropdown */}
              {pages.length > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#6B7280' }}>Quick add custom page:</span>
                  <select onChange={e => {
                    if (e.target.value) {
                      const selectedPage = pages.find(p => p.slug === e.target.value);
                      if (selectedPage) setNewNavLink({ label: selectedPage.title, url: selectedPage.slug, is_visible: true });
                    }
                  }} style={{ ...fieldInput, width: 'auto', padding: '4px 8px', fontSize: '11px' }}>
                    <option value="">-- select created page --</option>
                    {pages.map(p => <option key={p.slug} value={p.slug}>{p.title} ({p.slug})</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Save Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowNavEditor(false)} style={btnSecondary}>Cancel</button>
              <button onClick={handleSaveNavLinks} disabled={savingNav} style={{ ...btnPrimary, opacity: savingNav ? 0.7 : 1 }}>
                {savingNav ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={14} />}
                {savingNav ? 'Saving...' : 'Save Navigation Config'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Branding & Footer Editor Modal */}
      {showBrandingEditor && (
        <div style={modalOverlay} onClick={() => setShowBrandingEditor(false)}>
          <div style={{ ...modalBox, maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', fontFamily: 'Outfit, sans-serif' }}>Edit Site Branding & Footer</h3>
                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>Customize branding names, logo text, header slogan, and footer details.</p>
              </div>
              <button onClick={() => setShowBrandingEditor(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X size={20} /></button>
            </div>

            <div style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '6px', marginBottom: '20px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={fieldLabel}>Brand Logo Name (Navbar & Footer Heading)</label>
                <input style={fieldInput} value={brandingData.name} placeholder="e.g. Radheshyam Das" onChange={e => setBrandingData(prev => ({ ...prev, name: e.target.value }))} />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={fieldLabel}>Header Tagline / Slogan</label>
                <input style={fieldInput} value={brandingData.slogan} placeholder="e.g. Vedic Character & Leadership Mentoring" onChange={e => setBrandingData(prev => ({ ...prev, slogan: e.target.value }))} />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={fieldLabel}>Footer Description Text</label>
                <textarea style={{ ...fieldInput, resize: 'vertical' }} rows={3} value={brandingData.description} placeholder="Vedic Character & Leadership Mentoring under VOICE..." onChange={e => setBrandingData(prev => ({ ...prev, description: e.target.value }))} />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={fieldLabel}>Contact Address</label>
                <input style={fieldInput} value={brandingData.address} placeholder="Govardhan Ecovillage, Wada..." onChange={e => setBrandingData(prev => ({ ...prev, address: e.target.value }))} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={fieldLabel}>Contact Email</label>
                  <input style={fieldInput} value={brandingData.email} placeholder="manager@voicepune.com" onChange={e => setBrandingData(prev => ({ ...prev, email: e.target.value }))} />
                </div>
                <div>
                  <label style={fieldLabel}>Contact Phone</label>
                  <input style={fieldInput} value={brandingData.phone} placeholder="+91 8605036000" onChange={e => setBrandingData(prev => ({ ...prev, phone: e.target.value }))} />
                </div>
              </div>

              <div style={{ borderTop: '1.5px solid #F3F4F6', paddingTop: '14px', marginTop: '14px' }}>
                <h4 style={{ fontSize: '11px', fontWeight: '800', color: '#1A1B4B', textTransform: 'uppercase', marginBottom: '12px' }}>Social Media Links</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={fieldLabel}>Facebook URL</label>
                    <input style={fieldInput} value={brandingData.facebook_url} placeholder="https://facebook.com/yourpage" onChange={e => setBrandingData(prev => ({ ...prev, facebook_url: e.target.value }))} />
                  </div>
                  <div>
                    <label style={fieldLabel}>YouTube URL</label>
                    <input style={fieldInput} value={brandingData.youtube_url} placeholder="https://youtube.com/c/yourchannel" onChange={e => setBrandingData(prev => ({ ...prev, youtube_url: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={fieldLabel}>Instagram URL</label>
                    <input style={fieldInput} value={brandingData.instagram_url} placeholder="https://instagram.com/yourhandle" onChange={e => setBrandingData(prev => ({ ...prev, instagram_url: e.target.value }))} />
                  </div>
                  <div>
                    <label style={fieldLabel}>LinkedIn URL</label>
                    <input style={fieldInput} value={brandingData.linkedin_url} placeholder="https://linkedin.com/in/yourprofile" onChange={e => setBrandingData(prev => ({ ...prev, linkedin_url: e.target.value }))} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowBrandingEditor(false)} style={btnSecondary}>Cancel</button>
              <button onClick={handleSaveBranding} disabled={savingBranding} style={{ ...btnPrimary, opacity: savingBranding ? 0.7 : 1 }}>
                {savingBranding ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={14} />}
                {savingBranding ? 'Saving...' : 'Save Branding'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showNew && (
        <div style={modalOverlay} onClick={() => setShowNew(false)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', fontFamily: 'Outfit, sans-serif' }}>Create New Page</h3>
              <button onClick={() => setShowNew(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X size={20} /></button>
            </div>

            <label style={fieldLabel}>Page Title</label>
            <input style={{ ...fieldInput, marginBottom: '14px' }}
              value={newPage.title} placeholder="e.g. Events Page"
              onChange={e => {
                const t = e.target.value;
                setNewPage(prev => ({ ...prev, title: t, slug: prev.slug || slugify(t) }));
              }} />

            <label style={fieldLabel}>URL Slug</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden', marginBottom: '14px', background: '#FAFAFA' }}>
              <span style={{ padding: '9px 10px', background: '#F3F4F6', color: '#6B7280', fontSize: '13px', borderRight: '1px solid #E5E7EB' }}>
                radheshyamdas.com
              </span>
              <input style={{ flex: 1, padding: '9px 12px', border: 'none', outline: 'none', fontSize: '13px', background: 'transparent', fontFamily: 'monospace' }}
                value={newPage.slug}
                onChange={e => setNewPage(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="/events" />
            </div>

            <label style={fieldLabel}>Meta Description (optional)</label>
            <textarea style={{ ...fieldInput, resize: 'vertical', marginBottom: '20px' }}
              value={newPage.meta_description} rows={2}
              placeholder="Brief description for search engines..."
              onChange={e => setNewPage(prev => ({ ...prev, meta_description: e.target.value }))} />

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowNew(false)} style={btnSecondary}>Cancel</button>
              <button onClick={handleCreate} disabled={creating} style={{ ...btnPrimary, opacity: creating ? 0.7 : 1 }}>
                {creating ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={14} />}
                {creating ? 'Creating...' : 'Create & Open Builder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div style={modalOverlay} onClick={() => setDeleteTarget(null)}>
          <div style={{ ...modalBox, maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '32px', textAlign: 'center', marginBottom: '12px' }}>🗑️</div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '8px' }}>Delete Page?</h3>
            <p style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', marginBottom: '24px' }}>
              This will permanently delete <strong>"{deleteTarget.title}"</strong> ({deleteTarget.slug}).<br />This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteTarget(null)} style={{ ...btnSecondary, flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button onClick={() => handleDelete(deleteTarget)} style={{ ...btnPrimary, flex: 1, justifyContent: 'center', background: '#DC2626' }}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, padding: '12px 20px', borderRadius: '10px', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', background: toast.type === 'success' ? '#16A34A' : '#DC2626', color: '#FFF', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', animation: 'slideUp 0.3s ease' }}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

const btnPrimary = { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '9999px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', background: '#FF9F1C', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif', transition: 'all 0.15s', textDecoration: 'none' };
const btnSecondary = { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '9999px', border: '1.5px solid #E5E7EB', cursor: 'pointer', fontSize: '13px', fontWeight: '700', background: '#FFF', color: '#374151', fontFamily: 'Outfit, sans-serif' };
const iconBtn = { width: '34px', height: '34px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
const modalBox = { background: '#FFF', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', animation: 'slideUp 0.25s ease' };
const fieldLabel = { display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' };
const fieldInput = { width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #E5E7EB', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' };

