'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Trash2, Edit3, Save, X, ChevronUp, ChevronDown,
  Youtube, FileText, Type, Eye, EyeOff, Loader2, GripVertical,
  BookOpen, Check, Settings, Upload
} from 'lucide-react';

const LESSON_TYPES = [
  { value: 'youtube', label: 'YouTube Video', icon: '▶️', desc: 'Paste a YouTube video URL' },
  { value: 'gdrive', label: 'Google Drive', icon: '📄', desc: 'Embed PDF, PPT or DOC from Drive' },
  { value: 'text', label: 'Text / Notes', icon: '📝', desc: 'Rich text content, notes or instructions' },
];

export default function CourseBuilderPage() {
  const { id } = useParams();
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Module form
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [addingModule, setAddingModule] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState('');

  // Lesson form
  const [addingLesson, setAddingLesson] = useState(null); // moduleId
  const [editingLesson, setEditingLesson] = useState(null); // lesson object
  const [lessonForm, setLessonForm] = useState({
    title: '', type: 'youtube', content_url: '', content_text: '',
    description: '', duration_seconds: '', is_free_preview: false,
  });

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/courses/${id}`);
      const data = await res.json();
      if (!res.ok) { router.push('/lms-admin/courses'); return; }
      setCourse(data.course);
      setModules(data.course.modules || []);
      setLoading(false);
    };
    load();
  }, [id]);

  // ── Module operations ─────────────────────────────────────

  const addModule = async () => {
    if (!newModuleTitle.trim()) return;
    setSaving(true);
    const res = await fetch('/api/admin/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: id, title: newModuleTitle.trim(), order_index: modules.length }),
    });
    const data = await res.json();
    setModules(p => [...p, { ...data.module, lessons: [] }]);
    setNewModuleTitle('');
    setAddingModule(false);
    setSaving(false);
  };

  const saveModuleTitle = async (moduleId) => {
    await fetch('/api/admin/modules', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: moduleId, title: editingModuleTitle }),
    });
    setModules(p => p.map(m => m.id === moduleId ? { ...m, title: editingModuleTitle } : m));
    setEditingModuleId(null);
  };

  const deleteModule = async (moduleId) => {
    if (!confirm('Delete this module and all its lessons?')) return;
    await fetch(`/api/admin/modules?id=${moduleId}`, { method: 'DELETE' });
    setModules(p => p.filter(m => m.id !== moduleId));
  };

  const moveModule = async (index, dir) => {
    const newMods = [...modules];
    const target = index + dir;
    if (target < 0 || target >= newMods.length) return;
    [newMods[index], newMods[target]] = [newMods[target], newMods[index]];
    // Update order_index
    await Promise.all(newMods.map((m, i) =>
      fetch('/api/admin/modules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: m.id, order_index: i }),
      })
    ));
    setModules(newMods);
  };

  // ── Lesson operations ─────────────────────────────────────

  const resetLessonForm = () => setLessonForm({
    title: '', type: 'youtube', content_url: '', content_text: '',
    description: '', duration_seconds: '', is_free_preview: false,
  });

  const openAddLesson = (moduleId) => {
    resetLessonForm();
    setEditingLesson(null);
    setAddingLesson(moduleId);
  };

  const openEditLesson = (lesson) => {
    setAddingLesson(null);
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title || '',
      type: lesson.type || 'youtube',
      content_url: lesson.content_url || '',
      content_text: lesson.content_text || '',
      description: lesson.description || '',
      duration_seconds: lesson.duration_seconds || '',
      is_free_preview: lesson.is_free_preview || false,
    });
  };

  const saveLesson = async (moduleId) => {
    if (!lessonForm.title.trim()) return;
    setSaving(true);
    const mod = modules.find(m => m.id === moduleId);
    const payload = {
      ...lessonForm,
      duration_seconds: parseInt(lessonForm.duration_seconds) || 0,
    };

    if (editingLesson) {
      // Update
      const res = await fetch('/api/admin/lessons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingLesson.id, ...payload }),
      });
      const data = await res.json();
      setModules(p => p.map(m => ({
        ...m,
        lessons: m.lessons?.map(l => l.id === editingLesson.id ? data.lesson : l) || [],
      })));
      setEditingLesson(null);
    } else {
      // Create
      const res = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module_id: moduleId,
          course_id: id,
          order_index: mod?.lessons?.length || 0,
          ...payload,
        }),
      });
      const data = await res.json();
      setModules(p => p.map(m => m.id === moduleId
        ? { ...m, lessons: [...(m.lessons || []), data.lesson] }
        : m
      ));
      setAddingLesson(null);
    }
    resetLessonForm();
    setSaving(false);
  };

  const deleteLesson = async (moduleId, lessonId) => {
    if (!confirm('Delete this lesson?')) return;
    await fetch(`/api/admin/lessons?id=${lessonId}`, { method: 'DELETE' });
    setModules(p => p.map(m => m.id === moduleId
      ? { ...m, lessons: m.lessons?.filter(l => l.id !== lessonId) || [] }
      : m
    ));
  };

  const moveLesson = async (moduleId, index, dir) => {
    const mod = modules.find(m => m.id === moduleId);
    const lessons = [...(mod?.lessons || [])];
    const target = index + dir;
    if (target < 0 || target >= lessons.length) return;
    [lessons[index], lessons[target]] = [lessons[target], lessons[index]];
    await Promise.all(lessons.map((l, i) =>
      fetch('/api/admin/lessons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: l.id, order_index: i }),
      })
    ));
    setModules(p => p.map(m => m.id === moduleId ? { ...m, lessons } : m));
  };

  const typeIcon = (type) => type === 'youtube' ? '▶️' : type === 'gdrive' ? '📄' : '📝';

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <Loader2 size={32} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  const activeModuleId = addingLesson || editingLesson?.module_id;

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <Link href="/lms-admin/courses" style={styles.back}><ArrowLeft size={14} /> All Courses</Link>
          <h1 style={styles.title}>{course?.title}</h1>
          <div style={styles.headerMeta}>
            <span style={styles.lessonCount}>{modules.reduce((s, m) => s + (m.lessons?.length || 0), 0)} lessons</span>
            <span style={styles.modulCount}>{modules.length} modules</span>
          </div>
        </div>
        <div style={styles.headerActions}>
          <Link href={`/lms-admin/courses/${id}`} style={styles.settingsBtn}>
            <Settings size={15} /> Course Settings
          </Link>
          <Link href={`/courses/${course?.slug}`} target="_blank" style={styles.previewBtn}>
            <Eye size={15} /> Preview
          </Link>
        </div>
      </div>

      {/* Builder */}
      <div style={styles.builder}>
        {/* Modules list */}
        <div style={styles.modulesList}>
          {modules.map((mod, mi) => (
            <div key={mod.id} style={styles.moduleCard}>
              {/* Module header */}
              <div style={styles.moduleHead}>
                <div style={styles.moduleLeft}>
                  <span style={styles.moduleNum}>Module {mi + 1}</span>
                  {editingModuleId === mod.id ? (
                    <input
                      value={editingModuleTitle}
                      onChange={e => setEditingModuleTitle(e.target.value)}
                      style={styles.inlineInput}
                      onKeyDown={e => e.key === 'Enter' && saveModuleTitle(mod.id)}
                      autoFocus
                    />
                  ) : (
                    <span style={styles.moduleTitle}>{mod.title}</span>
                  )}
                </div>
                <div style={styles.moduleActions}>
                  {editingModuleId === mod.id ? (
                    <>
                      <button onClick={() => saveModuleTitle(mod.id)} style={styles.iconBtn}><Check size={14} /></button>
                      <button onClick={() => setEditingModuleId(null)} style={styles.iconBtn}><X size={14} /></button>
                    </>
                  ) : (
                    <button onClick={() => { setEditingModuleId(mod.id); setEditingModuleTitle(mod.title); }} style={styles.iconBtn}><Edit3 size={14} /></button>
                  )}
                  <button onClick={() => moveModule(mi, -1)} disabled={mi === 0} style={styles.iconBtn}><ChevronUp size={14} /></button>
                  <button onClick={() => moveModule(mi, 1)} disabled={mi === modules.length - 1} style={styles.iconBtn}><ChevronDown size={14} /></button>
                  <button onClick={() => deleteModule(mod.id)} style={{ ...styles.iconBtn, color: '#EF4444' }}><Trash2 size={14} /></button>
                </div>
              </div>

              {/* Lessons */}
              <div style={styles.lessonsList}>
                {(mod.lessons || []).map((lesson, li) => (
                  <div key={lesson.id} style={{
                    ...styles.lessonRow,
                    ...(editingLesson?.id === lesson.id ? styles.lessonRowActive : {})
                  }}>
                    {editingLesson?.id === lesson.id ? (
                      <LessonForm
                        form={lessonForm} setForm={setLessonForm}
                        onSave={() => saveLesson(mod.id)}
                        onCancel={() => { setEditingLesson(null); resetLessonForm(); }}
                        saving={saving}
                      />
                    ) : (
                      <>
                        <span style={styles.lessonIcon}>{typeIcon(lesson.type)}</span>
                        <span style={styles.lessonTitle}>{lesson.title}</span>
                        {lesson.is_free_preview && <span style={styles.freeBadge}>Free preview</span>}
                        <div style={styles.lessonActions}>
                          <button onClick={() => moveLesson(mod.id, li, -1)} disabled={li === 0} style={styles.iconBtnSm}><ChevronUp size={12} /></button>
                          <button onClick={() => moveLesson(mod.id, li, 1)} disabled={li === (mod.lessons?.length || 0) - 1} style={styles.iconBtnSm}><ChevronDown size={12} /></button>
                          <button onClick={() => openEditLesson({ ...lesson, module_id: mod.id })} style={styles.iconBtnSm}><Edit3 size={12} /></button>
                          <button onClick={() => deleteLesson(mod.id, lesson.id)} style={{ ...styles.iconBtnSm, color: '#EF4444' }}><Trash2 size={12} /></button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* Add lesson form */}
                {addingLesson === mod.id && !editingLesson && (
                  <div style={styles.addLessonForm}>
                    <LessonForm
                      form={lessonForm} setForm={setLessonForm}
                      onSave={() => saveLesson(mod.id)}
                      onCancel={() => { setAddingLesson(null); resetLessonForm(); }}
                      saving={saving}
                      isNew
                    />
                  </div>
                )}

                <button onClick={() => openAddLesson(mod.id)} style={styles.addLessonBtn}>
                  <Plus size={14} /> Add Lesson
                </button>
              </div>
            </div>
          ))}

          {/* Add Module */}
          {addingModule ? (
            <div style={styles.addModuleForm}>
              <input
                value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)}
                placeholder="Module title e.g. Introduction to Values"
                style={styles.moduleInput}
                onKeyDown={e => e.key === 'Enter' && addModule()}
                autoFocus
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={addModule} disabled={saving || !newModuleTitle.trim()} style={styles.saveModuleBtn}>
                  {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />} Save Module
                </button>
                <button onClick={() => { setAddingModule(false); setNewModuleTitle(''); }} style={styles.cancelBtn}>
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddingModule(true)} style={styles.addModuleBtn}>
              <Plus size={16} /> Add Module
            </button>
          )}
        </div>

        {/* Help panel */}
        <div style={styles.helpPanel}>
          <h3 style={styles.helpTitle}>💡 Builder Guide</h3>
          <div style={styles.helpItem}>
            <strong>YouTube Video</strong>
            <p>Paste a YouTube URL like:<br/><code>https://youtube.com/watch?v=xxxxx</code></p>
          </div>
          <div style={styles.helpItem}>
            <strong>Google Drive File</strong>
            <p>Share your PDF/PPT "Anyone with link can view" then paste the Drive URL.</p>
          </div>
          <div style={styles.helpItem}>
            <strong>Free Preview</strong>
            <p>Mark a lesson as "Free Preview" so non-enrolled students can see it on the course landing page.</p>
          </div>
          <div style={styles.helpItem}>
            <strong>Order</strong>
            <p>Use ↑↓ arrows to reorder modules and lessons.</p>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Lesson Form Component ─────────────────────────────────────

function LessonForm({ form, setForm, onSave, onCancel, saving, isNew }) {
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div style={lfStyles.wrap}>
      <div style={lfStyles.typeRow}>
        {[
          { value: 'youtube', label: '▶️ YouTube' },
          { value: 'gdrive', label: '📄 Drive File' },
          { value: 'text', label: '📝 Text' },
        ].map(t => (
          <button key={t.value} type="button"
            onClick={() => set('type', t.value)}
            style={{ ...lfStyles.typeBtn, ...(form.type === t.value ? lfStyles.typeBtnActive : {}) }}>
            {t.label}
          </button>
        ))}
      </div>

      <input value={form.title} onChange={e => set('title', e.target.value)}
        placeholder="Lesson title *" style={lfStyles.input} />

      {(form.type === 'youtube' || form.type === 'gdrive') && (
        <input value={form.content_url} onChange={e => set('content_url', e.target.value)}
          placeholder={form.type === 'youtube' ? 'YouTube URL' : 'Google Drive share URL'}
          style={lfStyles.input} type="url" />
      )}

      {form.type === 'text' && (
        <textarea value={form.content_text} onChange={e => set('content_text', e.target.value)}
          placeholder="Lesson text content, notes, or instructions…"
          style={{ ...lfStyles.input, minHeight: '100px', resize: 'vertical' }} />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <input value={form.description} onChange={e => set('description', e.target.value)}
          placeholder="Short description (optional)" style={lfStyles.input} />
        <input value={form.duration_seconds} onChange={e => set('duration_seconds', e.target.value)}
          placeholder="Duration in seconds" type="number" min="0" style={lfStyles.input} />
      </div>

      <label style={lfStyles.checkRow}>
        <input type="checkbox" checked={form.is_free_preview}
          onChange={e => set('is_free_preview', e.target.checked)} />
        <span style={{ fontSize: '12px', color: '#374151' }}>Free preview (visible without enrollment)</span>
      </label>

      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button onClick={onSave} disabled={saving || !form.title.trim()} style={lfStyles.saveBtn}>
          {saving ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={13} />}
          {isNew ? 'Add Lesson' : 'Save Changes'}
        </button>
        <button onClick={onCancel} style={lfStyles.cancelBtn}><X size={13} /> Cancel</button>
      </div>
    </div>
  );
}

const styles = {
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  back: { display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '12px', marginBottom: '6px', textDecoration: 'none' },
  title: { fontSize: '22px', fontWeight: '800', color: '#111827', fontFamily: 'Outfit, sans-serif' },
  headerMeta: { display: 'flex', gap: '12px', marginTop: '4px' },
  lessonCount: { fontSize: '12px', color: '#6B7280', background: '#F3F4F6', padding: '3px 10px', borderRadius: '9999px' },
  modulCount: { fontSize: '12px', color: '#6B7280', background: '#F3F4F6', padding: '3px 10px', borderRadius: '9999px' },
  headerActions: { display: 'flex', gap: '10px' },
  settingsBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: '13px', fontWeight: '600', textDecoration: 'none' },
  previewBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', background: '#FF9F1C', color: '#1A1B4B', fontSize: '13px', fontWeight: '700', textDecoration: 'none' },
  builder: { display: 'grid', gridTemplateColumns: '1fr 260px', gap: '20px', alignItems: 'start' },
  modulesList: { display: 'flex', flexDirection: 'column', gap: '14px' },
  moduleCard: { background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' },
  moduleHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' },
  moduleLeft: { display: 'flex', alignItems: 'center', gap: '10px', flex: 1 },
  moduleNum: { fontSize: '10px', fontWeight: '800', color: '#FF9F1C', textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 },
  moduleTitle: { fontSize: '14px', fontWeight: '700', color: '#111827' },
  inlineInput: { flex: 1, padding: '4px 10px', border: '1.5px solid #FF9F1C', borderRadius: '6px', fontSize: '14px', fontWeight: '600', background: '#fff', outline: 'none' },
  moduleActions: { display: 'flex', gap: '4px' },
  iconBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280', transition: 'background 0.15s' },
  lessonsList: { padding: '12px' },
  lessonRow: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', marginBottom: '4px' },
  lessonRowActive: { background: '#EEF2FF', border: '1.5px solid #C7D2FE' },
  lessonIcon: { fontSize: '14px', flexShrink: 0 },
  lessonTitle: { fontSize: '13px', color: '#374151', flex: 1, fontWeight: '500' },
  freeBadge: { fontSize: '10px', fontWeight: '700', color: '#16A34A', background: '#DCFCE7', padding: '2px 8px', borderRadius: '9999px', flexShrink: 0 },
  lessonActions: { display: 'flex', gap: '2px' },
  iconBtnSm: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '5px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF' },
  addLessonForm: { background: '#F9FAFB', borderRadius: '8px', padding: '12px', marginBottom: '8px', border: '1.5px dashed #E5E7EB' },
  addLessonBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1.5px dashed #D1D5DB', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', color: '#6B7280', fontSize: '13px', fontWeight: '600', width: '100%', justifyContent: 'center', fontFamily: 'inherit', marginTop: '4px' },
  addModuleForm: { background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' },
  moduleInput: { width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', marginBottom: '12px', boxSizing: 'border-box', fontFamily: 'inherit' },
  saveModuleBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: '#1A1B4B', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' },
  cancelBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: '#F3F4F6', color: '#6B7280', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
  addModuleBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#fff', border: '2px dashed #D1D5DB', borderRadius: '14px', padding: '18px', cursor: 'pointer', color: '#6B7280', fontSize: '14px', fontWeight: '600', width: '100%', fontFamily: 'inherit', transition: 'border-color 0.2s' },
  helpPanel: { background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', position: 'sticky', top: '80px' },
  helpTitle: { fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #F3F4F6' },
  helpItem: { marginBottom: '16px' },
};

const lfStyles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '8px' },
  typeRow: { display: 'flex', gap: '6px', marginBottom: '4px' },
  typeBtn: { padding: '5px 12px', borderRadius: '6px', border: '1.5px solid #E5E7EB', background: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: '#6B7280', fontFamily: 'inherit' },
  typeBtnActive: { background: '#EEF2FF', borderColor: '#818CF8', color: '#4338CA' },
  input: { width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', background: '#fff', boxSizing: 'border-box', fontFamily: 'inherit' },
  checkRow: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
  saveBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: '#1A1B4B', color: '#fff', border: 'none', borderRadius: '7px', padding: '8px 14px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' },
  cancelBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: '#F3F4F6', color: '#6B7280', border: 'none', borderRadius: '7px', padding: '8px 14px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' },
};
