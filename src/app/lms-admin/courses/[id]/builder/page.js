'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Trash2, Edit3, Save, X, ChevronUp, ChevronDown,
  Youtube, FileText, Eye, Loader2, GripVertical,
  BookOpen, Check, Settings, ClipboardCheck, HelpCircle,
  AlertCircle, ChevronRight, ChevronLeft, Link2
} from 'lucide-react';

const LESSON_TYPES = [
  { value: 'youtube', label: '▶️ YouTube', desc: 'Paste a YouTube video URL' },
  { value: 'gdrive', label: '📄 Drive File', desc: 'Embed PDF, PPT or DOC from Drive' },
  { value: 'text', label: '📝 Text / Notes', desc: 'Rich text content or instructions' },
];

export default function CourseBuilderPage() {
  const { id } = useParams();
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [allCourseQuizzes, setAllCourseQuizzes] = useState([]); // All quizzes for this course (library)
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null); // { message, type }
  
  const showNotification = (msg, type = 'success') => setNotification({ message: msg, type });

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Module form
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [addingModule, setAddingModule] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState('');

  // Lesson form
  const [addingLesson, setAddingLesson] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: '', type: 'youtube', content_url: '', content_text: '',
    description: '', duration_seconds: '', is_free_preview: false,
  });

  // Quiz panel state
  const [quizPanel, setQuizPanel] = useState(null); // { moduleId, mode: 'list'|'create'|'questions'|'assign' }
  const [quizForm, setQuizForm] = useState({
    title: '', description: '', pass_score_percent: '60',
    time_limit_mins: '', max_attempts: '3', show_correct_answers: true
  });
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [activeQuizForQuestions, setActiveQuizForQuestions] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [savingQuestions, setSavingQuestions] = useState(false);

  // Load course data + quizzes
  const loadData = useCallback(async () => {
    try {
      const [courseRes, quizzesRes] = await Promise.all([
        fetch(`/api/courses/${id}`),
        fetch(`/api/admin/quizzes?course_id=${id}`)
      ]);
      if (!courseRes.ok) { router.push('/lms-admin/courses'); return; }
      const { course: data } = await courseRes.json();
      setCourse(data);
      setModules(data.modules || []);
      if (quizzesRes.ok) {
        const { quizzes } = await quizzesRes.json();
        setAllCourseQuizzes(quizzes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Module operations ─────────────────────────────────────

  const addModule = async () => {
    if (!newModuleTitle.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: id, title: newModuleTitle.trim(), order_index: modules.length }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed'); }
      const data = await res.json();
      setModules(p => [...p, { ...data.module, lessons: [], quizzes: [] }]);
      setNewModuleTitle(''); setAddingModule(false);
    } catch (err) { showNotification(err.message, 'error'); } finally { setSaving(false); }
  };

  const saveModuleTitle = async (moduleId) => {
    try {
      const res = await fetch('/api/admin/modules', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: moduleId, title: editingModuleTitle }),
      });
      if (!res.ok) throw new Error('Failed');
      setModules(p => p.map(m => m.id === moduleId ? { ...m, title: editingModuleTitle } : m));
      setEditingModuleId(null);
    } catch (err) { showNotification('Failed to save module title.', 'error'); }
  };

  const deleteModule = async (moduleId) => {
    if (!confirm('Delete this module and all its lessons and quizzes?')) return;
    try {
      const res = await fetch(`/api/admin/modules?id=${moduleId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      setModules(p => p.filter(m => m.id !== moduleId));
      setAllCourseQuizzes(p => p.filter(q => q.module_id !== moduleId));
    } catch (err) { showNotification('Failed to delete module.', 'error'); }
  };

  const moveModule = async (index, dir) => {
    const newMods = [...modules];
    const target = index + dir;
    if (target < 0 || target >= newMods.length) return;
    [newMods[index], newMods[target]] = [newMods[target], newMods[index]];
    try {
      await Promise.all(newMods.map((m, i) =>
        fetch('/api/admin/modules', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: m.id, order_index: i }) })
      ));
      setModules(newMods);
    } catch { showNotification('Failed to reorder.', 'error'); }
  };

  // ── Lesson operations ─────────────────────────────────────

  const resetLessonForm = () => setLessonForm({ title: '', type: 'youtube', content_url: '', content_text: '', description: '', duration_seconds: '', is_free_preview: false });

  const openAddLesson = (moduleId) => { resetLessonForm(); setEditingLesson(null); setAddingLesson(moduleId); setQuizPanel(null); };
  const openEditLesson = (lesson) => { setAddingLesson(null); setEditingLesson(lesson); setQuizPanel(null); setLessonForm({ title: lesson.title || '', type: lesson.type || 'youtube', content_url: lesson.content_url || '', content_text: lesson.content_text || '', description: lesson.description || '', duration_seconds: lesson.duration_seconds || '', is_free_preview: lesson.is_free_preview || false }); };

  const saveLesson = async (moduleId) => {
    if (!lessonForm.title.trim()) return;
    setSaving(true);
    const mod = modules.find(m => m.id === moduleId);
    const payload = { ...lessonForm, duration_seconds: parseInt(lessonForm.duration_seconds) || 0 };
    try {
      if (editingLesson) {
        const res = await fetch('/api/admin/lessons', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingLesson.id, ...payload }) });
        if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed'); }
        const data = await res.json();
        setModules(p => p.map(m => ({ ...m, lessons: m.lessons?.map(l => l.id === editingLesson.id ? data.lesson : l) || [] })));
        setEditingLesson(null);
      } else {
        const res = await fetch('/api/admin/lessons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ module_id: moduleId, course_id: id, order_index: mod?.lessons?.length || 0, ...payload }) });
        if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed'); }
        const data = await res.json();
        setModules(p => p.map(m => m.id === moduleId ? { ...m, lessons: [...(m.lessons || []), data.lesson] } : m));
        setAddingLesson(null);
      }
      resetLessonForm();
    } catch (err) { showNotification(err.message || 'An error occurred.', 'error'); } finally { setSaving(false); }
  };

  const deleteLesson = async (moduleId, lessonId) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      const res = await fetch(`/api/admin/lessons?id=${lessonId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      setModules(p => p.map(m => m.id === moduleId ? { ...m, lessons: m.lessons?.filter(l => l.id !== lessonId) || [] } : m));
    } catch (err) { showNotification('Failed to delete lesson.', 'error'); }
  };

  const moveLesson = async (moduleId, index, dir) => {
    const mod = modules.find(m => m.id === moduleId);
    const lessons = [...(mod?.lessons || [])];
    const target = index + dir;
    if (target < 0 || target >= lessons.length) return;
    [lessons[index], lessons[target]] = [lessons[target], lessons[index]];
    try {
      await Promise.all(lessons.map((l, i) => fetch('/api/admin/lessons', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: l.id, order_index: i }) })));
      setModules(p => p.map(m => m.id === moduleId ? { ...m, lessons } : m));
    } catch { showNotification('Failed to reorder lessons.', 'error'); }
  };

  // ── Quiz operations ─────────────────────────────────────

  const openQuizPanel = (moduleId, mode = 'list') => {
    setAddingLesson(null); setEditingLesson(null); resetLessonForm();
    setQuizPanel({ moduleId, mode });
    setQuizForm({ title: '', description: '', pass_score_percent: '60', time_limit_mins: '', max_attempts: '3', show_correct_answers: true });
    setEditingQuizId(null);
    setActiveQuizForQuestions(null);
    setQuestions([]);
  };

  const closeQuizPanel = () => { setQuizPanel(null); setActiveQuizForQuestions(null); setQuestions([]); };

  const getModuleQuizzes = (moduleId) => allCourseQuizzes.filter(q => q.module_id === moduleId);

  const handleCreateOrUpdateQuiz = async (e) => {
    e.preventDefault();
    if (!quizForm.title.trim() || !quizPanel) return;
    setSaving(true);
    const payload = {
      course_id: id,
      module_id: quizPanel.moduleId,
      ...quizForm,
      pass_score_percent: parseInt(quizForm.pass_score_percent) || 60,
      time_limit_mins: quizForm.time_limit_mins ? parseInt(quizForm.time_limit_mins) : null,
      max_attempts: quizForm.max_attempts ? parseInt(quizForm.max_attempts) : 3,
    };
    try {
      if (editingQuizId) {
        const res = await fetch('/api/admin/quizzes', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingQuizId, ...payload }) });
        const data = await res.json();
        if (res.ok) {
          setAllCourseQuizzes(p => p.map(q => q.id === editingQuizId ? data.quiz : q));
          setEditingQuizId(null);
          setQuizPanel(prev => ({ ...prev, mode: 'list' }));
        }
      } else {
        const res = await fetch('/api/admin/quizzes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (res.ok) {
          setAllCourseQuizzes(p => [...p, data.quiz]);
          setQuizPanel(prev => ({ ...prev, mode: 'questions', quizId: data.quiz.id }));
          setActiveQuizForQuestions(data.quiz);
          setQuestions([]);
        }
      }
      setQuizForm({ title: '', description: '', pass_score_percent: '60', time_limit_mins: '', max_attempts: '3', show_correct_answers: true });
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!confirm('Delete this quiz and all its questions?')) return;
    try {
      const res = await fetch(`/api/admin/quizzes?id=${quizId}`, { method: 'DELETE' });
      if (res.ok) setAllCourseQuizzes(p => p.filter(q => q.id !== quizId));
    } catch (err) { console.error(err); }
  };

  const handleOpenQuestionsEditor = async (quiz) => {
    setActiveQuizForQuestions(quiz);
    setQuizPanel(prev => ({ ...prev, mode: 'questions' }));
    try {
      const res = await fetch(`/api/admin/quizzes?id=${quiz.id}`);
      const data = await res.json();
      if (res.ok) setQuestions(data.quiz.questions || []);
    } catch (err) { console.error(err); }
  };

  const handleEditQuizSettings = (quiz) => {
    setEditingQuizId(quiz.id);
    setQuizForm({ title: quiz.title, description: quiz.description || '', pass_score_percent: String(quiz.pass_score_percent), time_limit_mins: quiz.time_limit_mins ? String(quiz.time_limit_mins) : '', max_attempts: String(quiz.max_attempts), show_correct_answers: quiz.show_correct_answers });
    setQuizPanel(prev => ({ ...prev, mode: 'create' }));
  };

  // Assign existing quiz to module
  const handleAssignQuizToModule = async (quizId, targetModuleId) => {
    try {
      const res = await fetch('/api/admin/quizzes', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: quizId, module_id: targetModuleId }) });
      const data = await res.json();
      if (res.ok) {
        setAllCourseQuizzes(p => p.map(q => q.id === quizId ? data.quiz : q));
        setQuizPanel(prev => ({ ...prev, mode: 'list' }));
      }
    } catch (err) { console.error(err); }
  };

  // ── Question operations ─────────────────────────────────────

  const addQuestion = () => setQuestions(p => [...p, { question_text: '', type: 'mcq', options: ['Option A', 'Option B', 'Option C', 'Option D'], correct_answer: '0', marks: 1 }]);

  const updateQ = (index, key, val) => setQuestions(p => p.map((q, i) => i === index ? { ...q, [key]: val } : q));

  const updateQuestionType = (index, type) => setQuestions(p => p.map((q, i) => {
    if (i !== index) return q;
    const defaultOpts = ['Option A', 'Option B', 'Option C', 'Option D'];
    if (type === 'mcq') return { ...q, type, options: defaultOpts, correct_answer: '0' };
    if (type === 'mcq_multi') return { ...q, type, options: defaultOpts, correct_answer: '[]' };
    return { ...q, type, options: null, correct_answer: '' }; // subjective
  }));

  // Toggle one option in/out of the multi-correct answer array
  const toggleMultiCorrect = (qIdx, optIdx) => {
    setQuestions(p => p.map((q, i) => {
      if (i !== qIdx) return q;
      let current = [];
      try { current = JSON.parse(q.correct_answer || '[]'); } catch { current = []; }
      const key = String(optIdx);
      const next = current.includes(key) ? current.filter(k => k !== key) : [...current, key];
      return { ...q, correct_answer: JSON.stringify(next) };
    }));
  };

  const updateMcqOption = (qIdx, optIdx, val) => setQuestions(p => p.map((q, i) => i === qIdx ? { ...q, options: q.options.map((o, oi) => oi === optIdx ? val : o) } : q));

  const addMcqOption = (qIdx) => setQuestions(p => p.map((q, i) => i === qIdx ? { ...q, options: [...q.options, `Option ${String.fromCharCode(65 + q.options.length)}`] } : q));

  const removeMcqOption = (qIdx, optIdx) => setQuestions(p => p.map((q, i) => {
    if (i !== qIdx) return q;
    const filtered = q.options.filter((_, oi) => oi !== optIdx);
    if (q.type === 'mcq_multi') {
      // Remove removed index from multi-answer array and re-index
      let current = [];
      try { current = JSON.parse(q.correct_answer || '[]'); } catch { current = []; }
      const removed = String(optIdx);
      const updated = current
        .filter(k => k !== removed)
        .map(k => parseInt(k) > optIdx ? String(parseInt(k) - 1) : k);
      return { ...q, options: filtered, correct_answer: JSON.stringify(updated) };
    }
    let correct = parseInt(q.correct_answer) || 0;
    if (correct >= filtered.length) correct = Math.max(0, filtered.length - 1);
    return { ...q, options: filtered, correct_answer: String(correct) };
  }));

  const moveQuestion = (index, dir) => {
    const list = [...questions];
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    setQuestions(list);
  };

  const deleteQuestion = (index) => setQuestions(p => p.filter((_, i) => i !== index));

  const handleSaveQuestions = async () => {
    if (!activeQuizForQuestions) return;
    setSavingQuestions(true);
    try {
      const res = await fetch('/api/admin/quizzes/questions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz_id: activeQuizForQuestions.id, questions })
      });
      if (res.ok) {
        showNotification('Quiz questions saved!');
        // Refresh quiz list to update counts
        const r = await fetch(`/api/admin/quizzes?course_id=${id}`);
        if (r.ok) { const { quizzes } = await r.json(); setAllCourseQuizzes(quizzes || []); }
        setQuizPanel(prev => ({ ...prev, mode: 'list' }));
        setActiveQuizForQuestions(null);
        setQuestions([]);
      } else {
        showNotification('Failed to save questions. Please try again.', 'error');
      }
    } catch (err) { console.error(err); } finally { setSavingQuestions(false); }
  };

  const typeIcon = (type) => type === 'youtube' ? '▶️' : type === 'gdrive' ? '📄' : '📝';

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <Loader2 size={32} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  // Quizzes that are in the library but not assigned to any module (available to assign)
  const unassignedQuizzes = allCourseQuizzes.filter(q => !q.module_id);

  return (
    <div>
      {/* Header */}
      <div style={S.header}>
        <div>
          <Link href="/lms-admin/courses" style={S.back}><ArrowLeft size={14} /> All Courses</Link>
          <h1 style={S.title}>{course?.title}</h1>
          <div style={S.headerMeta}>
            <span style={S.badge}>{modules.reduce((s, m) => s + (m.lessons?.length || 0), 0)} lessons</span>
            <span style={S.badge}>{modules.length} modules</span>
            <span style={{ ...S.badge, background: '#EEF2FF', color: '#4338CA' }}>{allCourseQuizzes.length} quizzes</span>
          </div>
        </div>
        <div style={S.headerActions}>
          <Link href={`/lms-admin/courses/${id}/quizzes`} style={S.outlineBtn}>
            <ClipboardCheck size={15} /> Quiz Library
          </Link>
          <Link href={`/lms-admin/courses/${id}`} style={S.outlineBtn}>
            <Settings size={15} /> Settings
          </Link>
          <Link href={`/courses/${course?.slug}`} target="_blank" style={S.previewBtn}>
            <Eye size={15} /> Preview
          </Link>
        </div>
      </div>

      {/* Builder Layout */}
      <div style={S.builder} className="builder-grid">
        {/* Modules List */}
        <div style={S.modulesList}>
          {modules.map((mod, mi) => {
            const moduleQuizzes = getModuleQuizzes(mod.id);
            const isQuizPanelOpen = quizPanel?.moduleId === mod.id;

            return (
              <div key={mod.id} style={S.moduleCard}>
                {/* Module Header */}
                <div style={S.moduleHead}>
                  <div style={S.moduleLeft}>
                    <span style={S.moduleNum}>Module {mi + 1}</span>
                    {editingModuleId === mod.id ? (
                      <input value={editingModuleTitle} onChange={e => setEditingModuleTitle(e.target.value)} style={S.inlineInput} onKeyDown={e => e.key === 'Enter' && saveModuleTitle(mod.id)} autoFocus />
                    ) : (
                      <span style={S.moduleTitle}>{mod.title}</span>
                    )}
                  </div>
                  <div style={S.moduleActions}>
                    {editingModuleId === mod.id ? (
                      <>
                        <button onClick={() => saveModuleTitle(mod.id)} style={S.iconBtn}><Check size={14} /></button>
                        <button onClick={() => setEditingModuleId(null)} style={S.iconBtn}><X size={14} /></button>
                      </>
                    ) : (
                      <button onClick={() => { setEditingModuleId(mod.id); setEditingModuleTitle(mod.title); }} style={S.iconBtn}><Edit3 size={14} /></button>
                    )}
                    <button onClick={() => moveModule(mi, -1)} disabled={mi === 0} style={S.iconBtn}><ChevronUp size={14} /></button>
                    <button onClick={() => moveModule(mi, 1)} disabled={mi === modules.length - 1} style={S.iconBtn}><ChevronDown size={14} /></button>
                    <button onClick={() => deleteModule(mod.id)} style={{ ...S.iconBtn, color: '#EF4444' }}><Trash2 size={14} /></button>
                  </div>
                </div>

                {/* Lessons List */}
                <div style={S.lessonsList}>
                  {(mod.lessons || []).map((lesson, li) => (
                    <div key={lesson.id} style={{ ...S.lessonRow, ...(editingLesson?.id === lesson.id ? S.lessonRowActive : {}) }}>
                      {editingLesson?.id === lesson.id ? (
                        <LessonForm form={lessonForm} setForm={setLessonForm} onSave={() => saveLesson(mod.id)} onCancel={() => { setEditingLesson(null); resetLessonForm(); }} saving={saving} />
                      ) : (
                        <>
                          <span style={S.lessonIcon}>{typeIcon(lesson.type)}</span>
                          <span style={S.lessonTitle}>{lesson.title}</span>
                          {lesson.is_free_preview && <span style={S.freeBadge}>Free</span>}
                          <div style={S.lessonActions}>
                            <button onClick={() => moveLesson(mod.id, li, -1)} disabled={li === 0} style={S.iconBtnSm}><ChevronUp size={12} /></button>
                            <button onClick={() => moveLesson(mod.id, li, 1)} disabled={li === (mod.lessons?.length || 0) - 1} style={S.iconBtnSm}><ChevronDown size={12} /></button>
                            <button onClick={() => openEditLesson({ ...lesson, module_id: mod.id })} style={S.iconBtnSm}><Edit3 size={12} /></button>
                            <button onClick={() => deleteLesson(mod.id, lesson.id)} style={{ ...S.iconBtnSm, color: '#EF4444' }}><Trash2 size={12} /></button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {/* Add lesson form inline */}
                  {addingLesson === mod.id && !editingLesson && (
                    <div style={S.addLessonForm}>
                      <LessonForm form={lessonForm} setForm={setLessonForm} onSave={() => saveLesson(mod.id)} onCancel={() => { setAddingLesson(null); resetLessonForm(); }} saving={saving} isNew />
                    </div>
                  )}

                  {/* Module Quizzes */}
                  {moduleQuizzes.length > 0 && (
                    <div style={S.quizzesInModule}>
                      <div style={S.quizzesInModuleHeader}>
                        <span style={S.quizzesInModuleLabel}>📋 Quizzes ({moduleQuizzes.length})</span>
                      </div>
                      {moduleQuizzes.map(quiz => (
                        <div key={quiz.id} style={S.quizRow}>
                          <span style={S.quizIcon}>📋</span>
                          <div style={S.quizRowInfo}>
                            <span style={S.quizRowTitle}>{quiz.title}</span>
                            <span style={S.quizRowMeta}>
                              {quiz.type?.toUpperCase()} · Pass {quiz.pass_score_percent}% · {quiz.questions_count || 0} questions
                            </span>
                          </div>
                          <div style={S.lessonActions}>
                            <button onClick={() => { openQuizPanel(mod.id, 'questions'); setActiveQuizForQuestions(quiz); fetch(`/api/admin/quizzes?id=${quiz.id}`).then(r => r.json()).then(d => setQuestions(d.quiz?.questions || [])); }} style={{ ...S.iconBtnSm, color: '#4F46E5' }} title="Edit Questions"><Edit3 size={12} /></button>
                            <button onClick={() => handleDeleteQuiz(quiz.id)} style={{ ...S.iconBtnSm, color: '#EF4444' }} title="Delete Quiz"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={S.moduleFooterActions}>
                    <button onClick={() => openAddLesson(mod.id)} style={S.addLessonBtn}>
                      <Plus size={13} /> Add Lesson
                    </button>
                    <button onClick={() => isQuizPanelOpen && quizPanel.mode === 'list' ? closeQuizPanel() : openQuizPanel(mod.id, 'list')} style={{ ...S.addLessonBtn, borderColor: '#C7D2FE', color: '#4338CA' }}>
                      <ClipboardCheck size={13} /> {isQuizPanelOpen ? 'Close Quiz Panel' : 'Manage Quizzes'}
                    </button>
                  </div>
                </div>

                {/* Quiz Panel (inline below module) */}
                {isQuizPanelOpen && (
                  <div style={S.quizPanel}>
                    {/* Quiz Panel: List */}
                    {quizPanel.mode === 'list' && (
                      <QuizListPanel
                        moduleId={mod.id}
                        moduleQuizzes={moduleQuizzes}
                        unassignedQuizzes={unassignedQuizzes}
                        onCreateNew={() => setQuizPanel(prev => ({ ...prev, mode: 'create' }))}
                        onEditSettings={handleEditQuizSettings}
                        onManageQuestions={handleOpenQuestionsEditor}
                        onDeleteQuiz={handleDeleteQuiz}
                        onAssignQuiz={handleAssignQuizToModule}
                        onClose={closeQuizPanel}
                      />
                    )}

                    {/* Quiz Panel: Create / Edit */}
                    {quizPanel.mode === 'create' && (
                      <QuizCreateForm
                        form={quizForm}
                        setForm={setQuizForm}
                        onSubmit={handleCreateOrUpdateQuiz}
                        onCancel={() => { setQuizPanel(prev => ({ ...prev, mode: 'list' })); setEditingQuizId(null); }}
                        saving={saving}
                        isEditing={!!editingQuizId}
                      />
                    )}

                    {/* Quiz Panel: Question Editor */}
                    {quizPanel.mode === 'questions' && activeQuizForQuestions && (
                      <QuestionEditor
                        quiz={activeQuizForQuestions}
                        questions={questions}
                        setQuestions={setQuestions}
                        onAddQuestion={addQuestion}
                        onUpdateQ={updateQ}
                        onUpdateType={updateQuestionType}
                        onToggleMultiCorrect={toggleMultiCorrect}
                        onUpdateOption={updateMcqOption}
                        onAddOption={addMcqOption}
                        onRemoveOption={removeMcqOption}
                        onMoveQuestion={moveQuestion}
                        onDeleteQuestion={deleteQuestion}
                        onSave={handleSaveQuestions}
                        onBack={() => { setQuizPanel(prev => ({ ...prev, mode: 'list' })); setActiveQuizForQuestions(null); setQuestions([]); }}
                        saving={savingQuestions}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add Module */}
          {addingModule ? (
            <div style={S.addModuleForm}>
              <input value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)} placeholder="Module title e.g. Introduction to Values" style={S.moduleInput} onKeyDown={e => e.key === 'Enter' && addModule()} autoFocus />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={addModule} disabled={saving || !newModuleTitle.trim()} style={S.saveModuleBtn}>
                  {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />} Save Module
                </button>
                <button onClick={() => { setAddingModule(false); setNewModuleTitle(''); }} style={S.cancelBtn}><X size={14} /> Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddingModule(true)} style={S.addModuleBtn}>
              <Plus size={16} /> Add Module
            </button>
          )}
        </div>

        {/* Help Panel */}
        <div style={S.helpPanel}>
          <h3 style={S.helpTitle}>💡 Builder Guide</h3>
          <div style={S.helpItem}>
            <strong>Lessons</strong>
            <p>Each module can have multiple lessons: YouTube videos, Google Drive files, or text notes.</p>
          </div>
          <div style={S.helpItem}>
            <strong>Quizzes Per Module</strong>
            <p>Click <strong>"Manage Quizzes"</strong> on any module to create quizzes with MCQ or subjective questions.</p>
          </div>
          <div style={S.helpItem}>
            <strong>Quiz Library</strong>
            <p>Use <strong>"Quiz Library"</strong> in the header to see all course quizzes and reassign them to modules.</p>
          </div>
          <div style={S.helpItem}>
            <strong>Question Types</strong>
            <p><strong>MCQ</strong> — Single correct answer (radio button, auto-graded).<br /><strong>Multi-Answer</strong> — Multiple correct answers (checkboxes, auto-graded).<br /><strong>Subjective</strong> — Evaluator-graded essays/long answers.</p>
          </div>
          <div style={S.helpItem}>
            <strong>Free Preview</strong>
            <p>Mark lessons as "Free Preview" to let non-enrolled students view them.</p>
          </div>
          <div style={S.helpItem}>
            <strong>Reorder</strong>
            <p>Use ↑↓ arrows to reorder modules, lessons, and questions.</p>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: notification.type === 'success' ? '#10B981' : '#EF4444',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 9999,
          animation: 'slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          fontSize: '13px',
          fontWeight: '700',
          fontFamily: 'Outfit, sans-serif'
        }}>
          {notification.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{notification.message}</span>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn {
          from { transform: translateY(20px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────

function QuizListPanel({ moduleId, moduleQuizzes, unassignedQuizzes, onCreateNew, onEditSettings, onManageQuestions, onDeleteQuiz, onAssignQuiz, onClose }) {
  const [showAssign, setShowAssign] = useState(false);

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#4338CA' }}>📋 Module Quizzes</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {unassignedQuizzes.length > 0 && (
            <button onClick={() => setShowAssign(p => !p)} style={{ ...qS.btnOutline, fontSize: '11px' }}>
              <Link2 size={11} /> {showAssign ? 'Hide' : 'Assign Existing'}
            </button>
          )}
          <button onClick={onCreateNew} style={qS.btnPrimary}>
            <Plus size={12} /> New Quiz
          </button>
        </div>
      </div>

      {/* Assign existing quiz section */}
      {showAssign && (
        <div style={{ marginBottom: '14px', background: '#F5F3FF', borderRadius: '8px', padding: '12px', border: '1px solid #C4B5FD' }}>
          <p style={{ fontSize: '11px', color: '#4338CA', fontWeight: '600', marginBottom: '8px' }}>
            📚 Assign quiz from course library to this module:
          </p>
          {unassignedQuizzes.map(quiz => (
            <div key={quiz.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: '#fff', borderRadius: '6px', marginBottom: '6px', border: '1px solid #E5E7EB' }}>
              <span style={{ fontSize: '12px', color: '#374151' }}>{quiz.title}</span>
              <button onClick={() => onAssignQuiz(quiz.id, moduleId)} style={{ ...qS.btnPrimary, padding: '3px 10px', fontSize: '11px' }}>Assign Here</button>
            </div>
          ))}
        </div>
      )}

      {/* Module quiz list */}
      {moduleQuizzes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#9CA3AF' }}>
          <HelpCircle size={28} style={{ marginBottom: '8px' }} />
          <p style={{ fontSize: '12px' }}>No quizzes in this module yet.</p>
          <p style={{ fontSize: '11px' }}>Create a new quiz or assign one from the course library.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {moduleQuizzes.map(quiz => (
            <div key={quiz.id} style={qS.quizCard}>
              <div style={qS.quizCardLeft}>
                <span style={qS.quizTypePill}>{quiz.type?.toUpperCase()}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{quiz.title}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                    {quiz.questions_count || 0} questions · Pass {quiz.pass_score_percent}% · {quiz.time_limit_mins ? `${quiz.time_limit_mins}m` : 'No limit'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button onClick={() => onManageQuestions(quiz)} style={{ ...qS.btnOutline, fontSize: '11px', padding: '4px 10px' }}>Edit Questions</button>
                <button onClick={() => onEditSettings(quiz)} style={qS.iconBtn}><Edit3 size={13} /></button>
                <button onClick={() => onDeleteQuiz(quiz.id)} style={{ ...qS.iconBtn, color: '#EF4444' }}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuizCreateForm({ form, setForm, onSubmit, onCancel, saving, isEditing }) {
  return (
    <form onSubmit={onSubmit} style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#4338CA' }}>{isEditing ? '✏️ Edit Quiz Settings' : '➕ Create New Quiz'}</span>
        <button type="button" onClick={onCancel} style={qS.iconBtn}><X size={14} /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={qS.label}>Quiz Title *</label>
          <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Module 1 Assessment" style={qS.input} />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={qS.label}>Description / Instructions</label>
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Instructions for students..." style={{ ...qS.input, minHeight: '52px', resize: 'vertical' }} />
        </div>
        <div>
          <label style={qS.label}>Passing Score (%)</label>
          <input type="number" min="0" max="100" required value={form.pass_score_percent} onChange={e => setForm(p => ({ ...p, pass_score_percent: e.target.value }))} style={qS.input} />
        </div>
        <div>
          <label style={qS.label}>Time Limit (mins, empty = none)</label>
          <input type="number" min="1" value={form.time_limit_mins} onChange={e => setForm(p => ({ ...p, time_limit_mins: e.target.value }))} placeholder="No limit" style={qS.input} />
        </div>
        <div>
          <label style={qS.label}>Max Attempts</label>
          <input type="number" min="1" value={form.max_attempts} onChange={e => setForm(p => ({ ...p, max_attempts: e.target.value }))} style={qS.input} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '2px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: '#374151' }}>
            <input type="checkbox" checked={form.show_correct_answers} onChange={e => setForm(p => ({ ...p, show_correct_answers: e.target.checked }))} />
            Show correct answers on submit
          </label>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
        <button type="submit" disabled={saving} style={qS.btnSave}>
          {saving ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={13} />}
          {isEditing ? 'Save Changes' : 'Create & Add Questions →'}
        </button>
        <button type="button" onClick={onCancel} style={qS.btnCancel}>Cancel</button>
      </div>
    </form>
  );
}

function QuestionEditor({ quiz, questions, setQuestions, onAddQuestion, onUpdateQ, onUpdateType, onToggleMultiCorrect, onUpdateOption, onAddOption, onRemoveOption, onMoveQuestion, onDeleteQuestion, onSave, onBack, saving }) {
  const totalMarks = questions.reduce((s, q) => s + (q.marks || 1), 0);

  return (
    <div style={{ padding: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}>
            ← Back to Quizzes
          </button>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{quiz.title}</span>
          <span style={{ fontSize: '11px', background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '9999px', fontWeight: '700' }}>
            Total: {totalMarks} marks
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onAddQuestion} style={qS.btnOutline}>
            <Plus size={12} /> Add Question
          </button>
          <button onClick={onSave} disabled={saving} style={qS.btnSave}>
            {saving ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={12} />}
            Save Quiz
          </button>
        </div>
      </div>

      {/* Questions */}
      {questions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 0', color: '#9CA3AF' }}>
          <HelpCircle size={32} style={{ marginBottom: '8px' }} />
          <p style={{ fontSize: '12px' }}>No questions yet. Click "Add Question" to start building.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '550px', overflowY: 'auto', paddingRight: '4px' }}>
          {questions.map((q, qIdx) => (
            <div key={qIdx} style={qS.questionCard}>
              {/* Question Header */}
              <div style={qS.questionHead}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#111827' }}>Q{qIdx + 1}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <select value={q.type} onChange={e => onUpdateType(qIdx, e.target.value)} style={qS.select}>
                    <option value="mcq">MCQ — Single Answer ●</option>
                    <option value="mcq_multi">Multi-Answer ☑ (multiple correct)</option>
                    <option value="subjective">Subjective (Evaluator)</option>
                  </select>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: '#374151' }}>Marks:</label>
                    <input type="number" min="1" value={q.marks || 1} onChange={e => onUpdateQ(qIdx, 'marks', parseInt(e.target.value) || 1)} style={{ width: '44px', padding: '3px 6px', border: '1px solid #D1D5DB', borderRadius: '5px', fontSize: '11px', textAlign: 'center' }} />
                  </div>
                  <button onClick={() => onMoveQuestion(qIdx, -1)} disabled={qIdx === 0} style={qS.iconBtnSm}><ChevronUp size={12} /></button>
                  <button onClick={() => onMoveQuestion(qIdx, 1)} disabled={qIdx === questions.length - 1} style={qS.iconBtnSm}><ChevronDown size={12} /></button>
                  <button onClick={() => onDeleteQuestion(qIdx)} style={{ ...qS.iconBtnSm, color: '#EF4444' }}><Trash2 size={12} /></button>
                </div>
              </div>

              {/* Question Body */}
              <textarea
                value={q.question_text}
                onChange={e => onUpdateQ(qIdx, 'question_text', e.target.value)}
                placeholder="Type the question here..."
                style={{ ...qS.input, minHeight: '48px', resize: 'vertical', marginTop: '10px' }}
              />

              {/* MCQ Single-Answer Options */}
              {q.type === 'mcq' && (
                <div style={{ marginTop: '10px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '10px' }}>
                  <label style={{ ...qS.label, marginBottom: '8px' }}>Answer Options — select the ONE correct answer (●)</label>
                  {q.options?.map((opt, optIdx) => (
                    <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <input type="radio" name={`correct-${qIdx}`} checked={String(optIdx) === q.correct_answer} onChange={() => onUpdateQ(qIdx, 'correct_answer', String(optIdx))} style={{ cursor: 'pointer', accentColor: '#4338CA' }} />
                      <input value={opt} onChange={e => onUpdateOption(qIdx, optIdx, e.target.value)} style={{ flex: 1, padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '12px' }} />
                      <button onClick={() => onRemoveOption(qIdx, optIdx)} disabled={q.options.length <= 2} style={{ border: 'none', background: 'none', color: '#9CA3AF', cursor: 'pointer' }}><X size={12} /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => onAddOption(qIdx)} style={{ background: 'none', border: 'none', color: '#FF9F1C', fontSize: '11px', fontWeight: '700', cursor: 'pointer', padding: 0 }}>+ Add Option</button>
                </div>
              )}

              {/* MCQ Multi-Answer Options (checkboxes) */}
              {q.type === 'mcq_multi' && (() => {
                let selected = [];
                try { selected = JSON.parse(q.correct_answer || '[]'); } catch { selected = []; }
                return (
                  <div style={{ marginTop: '10px', background: '#fff', border: '1.5px solid #818CF8', borderRadius: '8px', padding: '10px' }}>
                    <label style={{ ...qS.label, marginBottom: '4px', color: '#4338CA' }}>☑ Multi-Answer — tick ALL correct options</label>
                    <p style={{ fontSize: '10px', color: '#6B7280', marginBottom: '8px', marginTop: '2px' }}>
                      Students must select all correct answers to score full marks.
                    </p>
                    {q.options?.map((opt, optIdx) => {
                      const isChecked = selected.includes(String(optIdx));
                      return (
                        <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => onToggleMultiCorrect(qIdx, optIdx)}
                            style={{ cursor: 'pointer', accentColor: '#4338CA', width: '15px', height: '15px' }}
                          />
                          <input
                            value={opt}
                            onChange={e => onUpdateOption(qIdx, optIdx, e.target.value)}
                            style={{ flex: 1, padding: '6px 10px', border: `1px solid ${isChecked ? '#818CF8' : '#D1D5DB'}`, borderRadius: '6px', fontSize: '12px', background: isChecked ? '#F5F3FF' : '#fff' }}
                          />
                          <button onClick={() => onRemoveOption(qIdx, optIdx)} disabled={q.options.length <= 2} style={{ border: 'none', background: 'none', color: '#9CA3AF', cursor: 'pointer' }}><X size={12} /></button>
                        </div>
                      );
                    })}
                    {selected.length === 0 && (
                      <p style={{ fontSize: '10px', color: '#F59E0B', marginTop: '4px' }}>⚠ No correct answer selected yet. Tick at least one.</p>
                    )}
                    <button type="button" onClick={() => onAddOption(qIdx)} style={{ background: 'none', border: 'none', color: '#FF9F1C', fontSize: '11px', fontWeight: '700', cursor: 'pointer', padding: 0, marginTop: '4px' }}>+ Add Option</button>
                  </div>
                );
              })()}

              {/* Subjective Info */}
              {q.type === 'subjective' && (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#4F46E5', background: '#EEF2FF', padding: '8px 10px', borderRadius: '6px' }}>
                  <AlertCircle size={13} />
                  <span>Subjective — will be graded manually by an evaluator or admin after student submission.</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LessonForm({ form, setForm, onSave, onCancel, saving, isNew }) {
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const [fetchingTitle, setFetchingTitle] = useState(false);

  useEffect(() => {
    if (form.type !== 'youtube' || !form.content_url) return;
    
    const isYoutube = form.content_url.includes('youtube.com') || form.content_url.includes('youtu.be') || form.content_url.includes('youtube-nocookie.com');
    if (!isYoutube) return;

    const handler = setTimeout(async () => {
      setFetchingTitle(true);
      try {
        const res = await fetch(`/api/youtube?url=${encodeURIComponent(form.content_url)}`);
        if (res.ok) {
          const data = await res.json();
          // Auto fill title if it's empty
          if (data.title && (!form.title || form.title.trim() === '')) {
            set('title', data.title);
          }
          // Auto fill duration in seconds if empty/unset
          if (data.duration && (!form.duration_seconds || String(form.duration_seconds).trim() === '')) {
            set('duration_seconds', String(data.duration));
          }
        }
      } catch (err) {
        console.error('Failed to auto-fetch youtube title', err);
      } finally {
        setFetchingTitle(false);
      }
    }, 600);

    return () => clearTimeout(handler);
  }, [form.content_url, form.type]);

  return (
    <div style={lf.wrap}>
      <div style={lf.typeRow}>
        {[{ value: 'youtube', label: '▶️ YouTube' }, { value: 'gdrive', label: '📄 Drive File' }, { value: 'text', label: '📝 Text' }].map(t => (
          <button key={t.value} type="button" onClick={() => set('type', t.value)} style={{ ...lf.typeBtn, ...(form.type === t.value ? lf.typeBtnActive : {}) }}>{t.label}</button>
        ))}
      </div>
      <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Lesson title *" style={lf.input} />
      {(form.type === 'youtube' || form.type === 'gdrive') && (
        <div style={{ position: 'relative' }}>
          <input value={form.content_url} onChange={e => set('content_url', e.target.value)} placeholder={form.type === 'youtube' ? 'YouTube URL e.g. https://youtu.be/abc' : 'Google Drive share URL'} style={lf.input} type="url" />
          {fetchingTitle && (
            <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#6B7280' }}>
              <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Fetching...</span>
            </div>
          )}
        </div>
      )}
      {form.type === 'text' && (
        <textarea value={form.content_text} onChange={e => set('content_text', e.target.value)} placeholder="Lesson notes, text content or instructions…" style={{ ...lf.input, minHeight: '80px', resize: 'vertical' }} />
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Short description (optional)" style={lf.input} />
        <input value={form.duration_seconds} onChange={e => set('duration_seconds', e.target.value)} placeholder="Duration (seconds)" type="number" min="0" style={lf.input} />
      </div>
      <label style={lf.checkRow}>
        <input type="checkbox" checked={form.is_free_preview} onChange={e => set('is_free_preview', e.target.checked)} />
        <span style={{ fontSize: '12px', color: '#374151' }}>Free preview (visible without enrollment)</span>
      </label>
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button onClick={onSave} disabled={saving || !form.title.trim()} style={lf.saveBtn}>
          {saving ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={13} />}
          {isNew ? 'Add Lesson' : 'Save Changes'}
        </button>
        <button onClick={onCancel} style={lf.cancelBtn}><X size={13} /> Cancel</button>
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────

const S = {
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  back: { display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '12px', marginBottom: '6px', textDecoration: 'none' },
  title: { fontSize: '22px', fontWeight: '800', color: '#111827', fontFamily: 'Outfit, sans-serif' },
  headerMeta: { display: 'flex', gap: '8px', marginTop: '4px' },
  badge: { fontSize: '11px', color: '#6B7280', background: '#F3F4F6', padding: '3px 10px', borderRadius: '9999px' },
  headerActions: { display: 'flex', gap: '10px' },
  outlineBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: '13px', fontWeight: '600', textDecoration: 'none', cursor: 'pointer' },
  previewBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', background: '#FF9F1C', color: '#1A1B4B', fontSize: '13px', fontWeight: '700', textDecoration: 'none' },
  builder: { display: 'grid', gridTemplateColumns: '1fr 260px', gap: '20px', alignItems: 'start' },
  modulesList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  moduleCard: { background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.07)', border: '1px solid #F3F4F6' },
  moduleHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#F9FAFB', borderBottom: '1px solid #F3F4F6' },
  moduleLeft: { display: 'flex', alignItems: 'center', gap: '10px', flex: 1 },
  moduleNum: { fontSize: '10px', fontWeight: '800', color: '#FF9F1C', textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 },
  moduleTitle: { fontSize: '14px', fontWeight: '700', color: '#111827' },
  inlineInput: { flex: 1, padding: '4px 10px', border: '1.5px solid #FF9F1C', borderRadius: '6px', fontSize: '14px', fontWeight: '600', background: '#fff', outline: 'none' },
  moduleActions: { display: 'flex', gap: '4px' },
  iconBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280' },
  lessonsList: { padding: '12px', display: 'flex', flexDirection: 'column', gap: '2px' },
  lessonRow: { display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '7px' },
  lessonRowActive: { background: '#EEF2FF', border: '1.5px solid #C7D2FE' },
  lessonIcon: { fontSize: '14px', flexShrink: 0 },
  lessonTitle: { fontSize: '13px', color: '#374151', flex: 1, fontWeight: '500' },
  freeBadge: { fontSize: '10px', fontWeight: '700', color: '#16A34A', background: '#DCFCE7', padding: '2px 8px', borderRadius: '9999px', flexShrink: 0 },
  lessonActions: { display: 'flex', gap: '2px' },
  iconBtnSm: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '5px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF' },
  quizzesInModule: { marginTop: '6px', background: '#F5F3FF', borderRadius: '8px', padding: '8px 10px', border: '1px dashed #C4B5FD' },
  quizzesInModuleHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  quizzesInModuleLabel: { fontSize: '11px', fontWeight: '700', color: '#4338CA' },
  quizRow: { display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', background: '#fff', borderRadius: '6px', marginTop: '4px', border: '1px solid #E5E7EB' },
  quizIcon: { fontSize: '13px', flexShrink: 0 },
  quizRowInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '1px' },
  quizRowTitle: { fontSize: '12px', fontWeight: '700', color: '#111827' },
  quizRowMeta: { fontSize: '10px', color: '#6B7280' },
  moduleFooterActions: { display: 'flex', gap: '8px', marginTop: '10px' },
  addLessonForm: { background: '#F9FAFB', borderRadius: '8px', padding: '12px', marginBottom: '6px', border: '1.5px dashed #E5E7EB' },
  addLessonBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1.5px dashed #D1D5DB', borderRadius: '7px', padding: '7px 14px', cursor: 'pointer', color: '#6B7280', fontSize: '12px', fontWeight: '600', fontFamily: 'inherit', flex: 1, justifyContent: 'center' },
  quizPanel: { borderTop: '2px solid #EEF2FF', background: '#FAFAFF' },
  addModuleForm: { background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' },
  moduleInput: { width: '100%', padding: '12px 14px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', marginBottom: '12px', boxSizing: 'border-box', fontFamily: 'inherit' },
  saveModuleBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: '#1A1B4B', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' },
  cancelBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: '#F3F4F6', color: '#6B7280', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
  addModuleBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#fff', border: '2px dashed #D1D5DB', borderRadius: '14px', padding: '18px', cursor: 'pointer', color: '#6B7280', fontSize: '14px', fontWeight: '600', width: '100%', fontFamily: 'inherit' },
  helpPanel: { background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', position: 'sticky', top: '80px', border: '1px solid #F3F4F6' },
  helpTitle: { fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #F3F4F6' },
  helpItem: { marginBottom: '14px', fontSize: '12px', color: '#6B7280', lineHeight: 1.5 },
};

// Quiz sub-component styles
const qS = {
  label: { fontSize: '11px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '4px' },
  input: { width: '100%', padding: '8px 10px', border: '1.5px solid #E5E7EB', borderRadius: '7px', fontSize: '12px', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' },
  select: { padding: '5px 8px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '12px', background: '#fff', fontFamily: 'inherit' },
  btnPrimary: { display: 'flex', alignItems: 'center', gap: '5px', background: '#1A1B4B', color: '#fff', border: 'none', borderRadius: '7px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' },
  btnSave: { display: 'flex', alignItems: 'center', gap: '5px', background: '#FF9F1C', color: '#1A1B4B', border: 'none', borderRadius: '7px', padding: '7px 14px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' },
  btnOutline: { display: 'flex', alignItems: 'center', gap: '5px', background: '#fff', color: '#4338CA', border: '1.5px solid #C4B5FD', borderRadius: '7px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
  btnCancel: { display: 'flex', alignItems: 'center', gap: '5px', background: '#F3F4F6', color: '#6B7280', border: 'none', borderRadius: '7px', padding: '7px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
  iconBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280' },
  iconBtnSm: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '5px', background: '#fff', border: '1px solid #D1D5DB', cursor: 'pointer', color: '#6B7280' },
  quizCard: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '9px', gap: '8px' },
  quizCardLeft: { display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1 },
  quizTypePill: { fontSize: '9px', fontWeight: '800', background: '#EEF2FF', color: '#4F46E5', padding: '2px 7px', borderRadius: '9999px', marginTop: '2px', flexShrink: 0 },
  questionCard: { background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '12px 14px' },
  questionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' },
};

const lf = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '8px' },
  typeRow: { display: 'flex', gap: '6px', marginBottom: '2px' },
  typeBtn: { padding: '5px 12px', borderRadius: '6px', border: '1.5px solid #E5E7EB', background: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: '#6B7280', fontFamily: 'inherit' },
  typeBtnActive: { background: '#EEF2FF', borderColor: '#818CF8', color: '#4338CA' },
  input: { width: '100%', padding: '8px 11px', border: '1.5px solid #E5E7EB', borderRadius: '7px', fontSize: '13px', background: '#fff', boxSizing: 'border-box', fontFamily: 'inherit' },
  checkRow: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
  saveBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: '#1A1B4B', color: '#fff', border: 'none', borderRadius: '7px', padding: '8px 14px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' },
  cancelBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: '#F3F4F6', color: '#6B7280', border: 'none', borderRadius: '7px', padding: '8px 14px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' },
};
