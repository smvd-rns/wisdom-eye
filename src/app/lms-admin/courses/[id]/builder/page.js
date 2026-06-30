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
  const [confirmModal, setConfirmModal] = useState(null); // { title, message, onConfirm }

  // Load course data + quizzes
  const loadData = useCallback(async () => {
    try {
      const [courseRes, quizzesRes] = await Promise.all([
        fetch(`/api/courses/${id}`),
        fetch(`/api/admin/quizzes?course_id=all`)
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

  const moveItem = async (moduleId, index, dir) => {
    const mod = modules.find(m => m.id === moduleId);
    const moduleQuizzes = getModuleQuizzes(moduleId);
    
    // Combine lessons and quizzes and sort by order_index
    const items = [
      ...(mod?.lessons || []).map(l => ({ ...l, itemType: 'lesson' })),
      ...moduleQuizzes.map(q => ({ ...q, itemType: 'quiz' }))
    ].sort((a, b) => {
      if (a.order_index === b.order_index) {
        return a.itemType === 'lesson' ? -1 : 1;
      }
      return a.order_index - b.order_index;
    });

    const target = index + dir;
    if (target < 0 || target >= items.length) return;

    // Swap items
    [items[index], items[target]] = [items[target], items[index]];

    try {
      // Send updates to server
      await Promise.all(items.map((item, i) => {
        const url = item.itemType === 'lesson' ? '/api/admin/lessons' : '/api/admin/quizzes';
        return fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.id, order_index: i })
        });
      }));

      // Update local state
      const updatedLessons = items.filter(item => item.itemType === 'lesson').map((l, idx) => ({ ...l, order_index: items.findIndex(it => it.id === l.id && it.itemType === 'lesson') }));
      const updatedQuizzes = items.filter(item => item.itemType === 'quiz').map((q, idx) => ({ ...q, order_index: items.findIndex(it => it.id === q.id && it.itemType === 'quiz') }));

      setModules(p => p.map(m => m.id === moduleId ? { ...m, lessons: updatedLessons.sort((a, b) => a.order_index - b.order_index) } : m));
      setAllCourseQuizzes(p => p.map(q => {
        const found = updatedQuizzes.find(uq => uq.id === q.id);
        return found ? { ...q, order_index: found.order_index } : q;
      }));
    } catch (err) {
      showNotification('Failed to reorder items.', 'error');
    }
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
    const mod = modules.find(m => m.id === quizPanel.moduleId);
    const moduleQuizzes = getModuleQuizzes(quizPanel.moduleId);
    const currentItemsCount = (mod?.lessons?.length || 0) + moduleQuizzes.length;
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
        const res = await fetch('/api/admin/quizzes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, order_index: currentItemsCount }) });
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

  const handleRemoveQuizFromModule = async (quizId) => {
    setConfirmModal({
      title: 'Remove Quiz from Module',
      message: 'Are you sure you want to remove this quiz from the module? It will remain in the course library.',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/quizzes`, { 
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: quizId, module_id: null, order_index: 0 }) 
          });
          const data = await res.json();
          if (res.ok) setAllCourseQuizzes(p => p.map(q => q.id === quizId ? data.quiz : q));
        } catch (err) { console.error(err); }
      }
    });
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
      const quizToAssign = allCourseQuizzes.find(q => q.id === quizId);
      if (!quizToAssign) return;

      if (String(quizToAssign.course_id) !== String(id)) {
        // Cross-course assignment -> duplicate
        const res = await fetch('/api/admin/quizzes/duplicate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quiz_id: quizId, target_course_id: id, target_module_id: targetModuleId })
        });
        const data = await res.json();
        if (res.ok) {
          setAllCourseQuizzes(p => [...p, data.quiz]);
          setQuizPanel(prev => ({ ...prev, mode: 'list' }));
        }
      } else {
        const res = await fetch('/api/admin/quizzes', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: quizId, module_id: targetModuleId }) });
        const data = await res.json();
        if (res.ok) {
          setAllCourseQuizzes(p => p.map(q => q.id === quizId ? data.quiz : q));
          setQuizPanel(prev => ({ ...prev, mode: 'list' }));
        }
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

  const courseQuizzes = allCourseQuizzes.filter(q => String(q.course_id) === String(id));
  const unassignedQuizzes = courseQuizzes.filter(q => !q.module_id);

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
            <span style={{ ...S.badge, background: '#EEF2FF', color: '#4338CA' }}>{courseQuizzes.length} quizzes</span>
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

            // Combine lessons and quizzes for unified rendering and sorting
            const combinedItems = [
              ...(mod.lessons || []).map(l => ({ ...l, itemType: 'lesson' })),
              ...moduleQuizzes.map(q => ({ ...q, itemType: 'quiz' }))
            ].sort((a, b) => {
              if (a.order_index === b.order_index) {
                return a.itemType === 'lesson' ? -1 : 1;
              }
              return a.order_index - b.order_index;
            });

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

                {/* Lessons & Quizzes List */}
                <div style={S.lessonsList}>
                  {combinedItems.map((item, index) => {
                    const isLesson = item.itemType === 'lesson';
                    if (isLesson) {
                      return (
                        <div key={`lesson-${item.id}`} style={{ ...S.lessonRow, ...(editingLesson?.id === item.id ? S.lessonRowActive : {}) }}>
                          {editingLesson?.id === item.id ? (
                            <LessonForm form={lessonForm} setForm={setLessonForm} onSave={() => saveLesson(mod.id)} onCancel={() => { setEditingLesson(null); resetLessonForm(); }} saving={saving} />
                          ) : (
                            <>
                              <span style={S.lessonIcon}>{typeIcon(item.type)}</span>
                              <span style={S.lessonTitle}>{item.title}</span>
                              {item.is_free_preview && <span style={S.freeBadge}>Free</span>}
                              <div style={S.lessonActions}>
                                <button onClick={() => moveItem(mod.id, index, -1)} disabled={index === 0} style={S.iconBtnSm}><ChevronUp size={12} /></button>
                                <button onClick={() => moveItem(mod.id, index, 1)} disabled={index === combinedItems.length - 1} style={S.iconBtnSm}><ChevronDown size={12} /></button>
                                <button onClick={() => openEditLesson({ ...item, module_id: mod.id })} style={S.iconBtnSm}><Edit3 size={12} /></button>
                                <button onClick={() => deleteLesson(mod.id, item.id)} style={{ ...S.iconBtnSm, color: '#EF4444' }}><Trash2 size={12} /></button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    } else {
                      // It's a quiz
                      return (
                        <div key={`quiz-${item.id}`} style={S.quizRowUnified}>
                          <span style={S.quizIcon}>📋</span>
                          <div style={S.quizRowInfo}>
                            <span style={S.quizRowTitle}>{item.title}</span>
                            <span style={S.quizRowMeta}>
                              {item.type?.toUpperCase()} · Pass {item.pass_score_percent}% · {item.questions_count || 0} questions
                            </span>
                          </div>
                          <div style={S.lessonActions}>
                            <button onClick={() => moveItem(mod.id, index, -1)} disabled={index === 0} style={S.iconBtnSm}><ChevronUp size={12} /></button>
                            <button onClick={() => moveItem(mod.id, index, 1)} disabled={index === combinedItems.length - 1} style={S.iconBtnSm}><ChevronDown size={12} /></button>
                            <button onClick={() => { openQuizPanel(mod.id, 'questions'); setActiveQuizForQuestions(item); fetch(`/api/admin/quizzes?id=${item.id}`).then(r => r.json()).then(d => setQuestions(d.quiz?.questions || [])); }} style={{ ...S.iconBtnSm, color: '#4F46E5' }} title="Edit Questions"><Edit3 size={12} /></button>
                            <button onClick={() => handleRemoveQuizFromModule(item.id)} style={{ ...S.iconBtnSm, color: '#EF4444' }} title="Remove from module"><X size={12} /></button>
                          </div>
                        </div>
                      );
                    }
                  })}

                  {/* Add lesson form inline */}
                  {addingLesson === mod.id && !editingLesson && (
                    <div style={S.addLessonForm}>
                      <LessonForm form={lessonForm} setForm={setLessonForm} onSave={() => saveLesson(mod.id)} onCancel={() => { setAddingLesson(null); resetLessonForm(); }} saving={saving} isNew />
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
                        courseId={id}
                        moduleQuizzes={moduleQuizzes}
                        unassignedQuizzes={unassignedQuizzes}
                        allCourseQuizzes={allCourseQuizzes}
                        modules={modules}
                        onCreateNew={() => setQuizPanel(prev => ({ ...prev, mode: 'create' }))}
                        onEditSettings={handleEditQuizSettings}
                        onManageQuestions={handleOpenQuestionsEditor}
                        onRemoveQuiz={handleRemoveQuizFromModule}
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
                        triggerConfirm={setConfirmModal}
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

      {/* Beautiful Confirm Modal */}
      {confirmModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            width: '420px',
            maxWidth: '90%',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            transform: 'scale(1)',
            animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            fontFamily: 'Outfit, sans-serif'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                backgroundColor: '#FEF3C7', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: '#D97706'
              }}>
                <AlertCircle size={22} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1E293B', margin: 0 }}>
                {confirmModal.title || 'Confirm Action'}
              </h3>
            </div>
            
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6', margin: '0 0 24px 0' }}>
              {confirmModal.message}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setConfirmModal(null)}
                style={{
                  padding: '10px 18px', borderRadius: '10px',
                  border: '1px solid #E2E8F0', backgroundColor: '#fff',
                  color: '#475569', fontSize: '13px', fontWeight: '700',
                  cursor: 'pointer', transition: 'all 0.15s ease'
                }}
                onMouseOver={e => e.target.style.backgroundColor = '#F8FAFC'}
                onMouseOut={e => e.target.style.backgroundColor = '#fff'}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                style={{
                  padding: '10px 20px', borderRadius: '10px',
                  border: 'none', backgroundColor: '#EF4444',
                  color: '#fff', fontSize: '13px', fontWeight: '700',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                }}
                onMouseOver={e => e.target.style.backgroundColor = '#DC2626'}
                onMouseOut={e => e.target.style.backgroundColor = '#EF4444'}
              >
                Yes, Replace
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateY(20px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────

function QuizListPanel({ moduleId, courseId, moduleQuizzes, unassignedQuizzes, allCourseQuizzes, modules, onCreateNew, onEditSettings, onManageQuestions, onRemoveQuiz, onAssignQuiz, onClose }) {
  const [showAssign, setShowAssign] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter quizzes that aren't in this module AND match search query
  const availableQuizzes = allCourseQuizzes
    .filter(q => q.module_id !== moduleId)
    .filter(q => q.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#4338CA' }}>📋 Module Quizzes</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowAssign(p => !p)} style={{ ...qS.btnOutline, fontSize: '11px' }}>
            <Link2 size={11} /> {showAssign ? 'Hide' : 'Assign / Move Existing'}
          </button>
          <button onClick={onCreateNew} style={qS.btnPrimary}>
            <Plus size={12} /> New Quiz
          </button>
        </div>
      </div>

      {/* Assign existing quiz section */}
      {showAssign && (
          <div style={{ marginBottom: '14px', background: '#F5F3FF', borderRadius: '8px', padding: '12px', border: '1px solid #C4B5FD' }}>
            <p style={{ fontSize: '11px', color: '#4338CA', fontWeight: '600', marginBottom: '8px' }}>
              📚 Assign or Move a quiz from course library / another module:
            </p>
            
            {/* Search Input Box */}
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="🔍 Search quizzes by title..."
                style={{
                  width: '100%',
                  padding: '6px 12px',
                  border: '1px solid #C4B5FD',
                  borderRadius: '6px',
                  fontSize: '12px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {availableQuizzes.length === 0 ? (
              <p style={{ fontSize: '11px', color: '#6B7280', fontStyle: 'italic', padding: '6px 0' }}>
                {searchQuery ? 'No matching quizzes found.' : 'No other quizzes exist in this course.'}
              </p>
            ) : (
              <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '2px' }}>
                {availableQuizzes.map(quiz => (
                  <div key={quiz.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: '#fff', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: '#374151', fontWeight: '600', display: 'block' }}>{quiz.title}</span>
                      {String(quiz.course_id) !== String(courseId) ? (
                        <span style={{ fontSize: '9px', color: '#F59E0B', fontWeight: '700' }}>
                          From another course (Will be cloned)
                        </span>
                      ) : quiz.module_id ? (
                        <span style={{ fontSize: '9px', color: '#6B7280' }}>
                          Currently in: {modules.find(m => m.id === quiz.module_id)?.title || `Module`}
                        </span>
                      ) : (
                        <span style={{ fontSize: '9px', color: '#10B981', fontWeight: '700' }}>
                          In Course Library (Unassigned)
                        </span>
                      )}
                    </div>
                    <button onClick={() => onAssignQuiz(quiz.id, moduleId)} style={{ ...qS.btnPrimary, padding: '3px 10px', fontSize: '11px', flexShrink: 0 }}>
                      {quiz.module_id ? 'Move here' : 'Assign here'}
                    </button>
                  </div>
                ))}
              </div>
            )}
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
                <button onClick={() => onRemoveQuiz(quiz.id)} style={{ ...qS.iconBtn, color: '#EF4444' }} title="Remove from module"><X size={13} /></button>
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
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Correct Answer Visibility
          </label>
          <div
            onClick={() => setForm(p => ({ ...p, show_correct_answers: !p.show_correct_answers }))}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer',
              background: form.show_correct_answers ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.04)',
              border: `1.5px solid ${form.show_correct_answers ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.2)'}`,
              borderRadius: '10px', padding: '10px 14px', transition: 'all 0.2s ease', userSelect: 'none'
            }}
          >
            {/* Toggle pill */}
            <div style={{
              position: 'relative', width: '40px', height: '22px', borderRadius: '11px',
              background: form.show_correct_answers ? '#10B981' : '#D1D5DB',
              transition: 'background 0.2s ease', flexShrink: 0
            }}>
              <div style={{
                position: 'absolute', top: '3px',
                left: form.show_correct_answers ? '21px' : '3px',
                width: '16px', height: '16px', borderRadius: '50%',
                background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                transition: 'left 0.2s ease'
              }} />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: form.show_correct_answers ? '#065F46' : '#991B1B' }}>
                {form.show_correct_answers ? '✅ Show correct answers after submission' : '🚫 Hide correct answers after submission'}
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '1px' }}>
                {form.show_correct_answers ? 'Students will see which answers were right/wrong.' : 'Students will only see their score, not which were correct.'}
              </div>
            </div>
          </div>
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

function QuestionEditor({ quiz, questions, setQuestions, onAddQuestion, onUpdateQ, onUpdateType, onToggleMultiCorrect, onUpdateOption, onAddOption, onRemoveOption, onMoveQuestion, onDeleteQuestion, onSave, onBack, saving, triggerConfirm }) {
  const totalMarks = questions.reduce((s, q) => s + (q.marks || 1), 0);

  // Export questions to CSV
  const handleExportCSV = () => {
    const headers = ['question_text', 'type', 'marks', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer_indices_or_index', 'explanation'];
    const rows = questions.map(q => {
      let optA = '', optB = '', optC = '', optD = '';
      if (q.options && q.options.length > 0) {
        optA = q.options[0] || '';
        optB = q.options[1] || '';
        optC = q.options[2] || '';
        optD = q.options[3] || '';
      }
      
      // For multi-select correct answers, keep the raw array string, e.g. [0,1]. Otherwise, single choice index string e.g. 0.
      return [
        `"${(q.question_text || '').replace(/"/g, '""')}"`,
        q.type || 'mcq',
        q.marks || 1,
        `"${optA.replace(/"/g, '""')}"`,
        `"${optB.replace(/"/g, '""')}"`,
        `"${optC.replace(/"/g, '""')}"`,
        `"${optD.replace(/"/g, '""')}"`,
        `"${(q.correct_answer || '').replace(/"/g, '""')}"`,
        `"${(q.explanation || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${quiz.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_questions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Sample Template CSV
  const handleDownloadTemplate = () => {
    const headers = ['question_text', 'type', 'marks', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer_indices_or_index', 'explanation'];
    const sampleRows = [
      [
        '"What is the capital of France?"',
        'mcq',
        1,
        '"London"',
        '"Paris"',
        '"Berlin"',
        '"Madrid"',
        '"1"',
        '"Paris is the capital of France."'
      ],
      [
        '"Which of the following are prime numbers?"',
        'mcq_multi',
        2,
        '"2"',
        '"4"',
        '"5"',
        '"9"',
        '"[0,2]"',
        '"2 and 5 are prime numbers, while 4 and 9 are composite numbers."'
      ],
      [
        '"Write a brief essay describing the water cycle."',
        'subjective',
        5,
        '""',
        '""',
        '""',
        '""',
        '""',
        '"Should describe evaporation, condensation, precipitation, and runoff."'
      ]
    ];

    const csvContent = [headers.join(','), ...sampleRows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'quiz_questions_sample_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import questions from CSV
  const handleImportCSV = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        // Simple CSV parser that handles quotes
        const lines = [];
        let row = [""];
        let inQuotes = false;

        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          const nextChar = text[i+1];
          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              row[row.length - 1] += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            row.push("");
          } else if ((char === '\r' || char === '\n') && !inQuotes) {
            if (char === '\r' && nextChar === '\n') { i++; }
            lines.push(row);
            row = [""];
          } else {
            row[row.length - 1] += char;
          }
        }
        if (row.length > 1 || row[0] !== "") {
          lines.push(row);
        }

        if (lines.length < 2) {
          alert('CSV file is empty or invalid.');
          return;
        }

        // Header index check
        const headers = lines[0].map(h => h.trim().toLowerCase());
        const qIdx = headers.indexOf('question_text');
        const tIdx = headers.indexOf('type');
        const mIdx = headers.indexOf('marks');
        const aIdx = headers.indexOf('option_a');
        const bIdx = headers.indexOf('option_b');
        const cIdx = headers.indexOf('option_c');
        const dIdx = headers.indexOf('option_d');
        const ansIdx = headers.indexOf('correct_answer_indices_or_index');
        const expIdx = headers.indexOf('explanation');

        if (qIdx === -1 || tIdx === -1 || ansIdx === -1) {
          alert('Invalid CSV headers. Required: question_text, type, correct_answer_indices_or_index');
          return;
        }

        const importedQuestions = [];
        for (let idx = 1; idx < lines.length; idx++) {
          const r = lines[idx];
          if (r.length < 3 || !r[qIdx]?.trim()) continue;

          const questionText = r[qIdx]?.trim() || '';
          const type = r[tIdx]?.trim() || 'mcq';
          const marks = parseInt(r[mIdx]) || 1;
          const explanation = expIdx !== -1 ? r[expIdx]?.trim() : '';

          let options = null;
          if (type === 'mcq' || type === 'mcq_multi') {
            options = [
              r[aIdx]?.trim() || 'Option A',
              r[bIdx]?.trim() || 'Option B',
              r[cIdx]?.trim() || 'Option C',
              r[dIdx]?.trim() || 'Option D'
            ];
          }

          let correctAnswer = r[ansIdx]?.trim() || '0';

          // If it is single choice MCQ, handle letter indices (e.g., "A", "B", "C", "D") or matching text
          if (type === 'mcq' && options) {
            const rawAns = correctAnswer.toUpperCase();
            if (rawAns === 'A' || rawAns === '0') correctAnswer = '0';
            else if (rawAns === 'B' || rawAns === '1') correctAnswer = '1';
            else if (rawAns === 'C' || rawAns === '2') correctAnswer = '2';
            else if (rawAns === 'D' || rawAns === '3') correctAnswer = '3';
            else {
              // Try to find if correct answer value matches the text of one of the options
              const optMatchIdx = options.findIndex(opt => opt.toLowerCase() === correctAnswer.toLowerCase());
              if (optMatchIdx !== -1) {
                correctAnswer = String(optMatchIdx);
              }
            }
          } else if (type === 'mcq_multi' && options) {
            // Handle parsing comma separated array string or JSON array, e.g. "A, C" or "[0, 2]"
            let parsedArr = [];
            try {
              if (correctAnswer.startsWith('[') && correctAnswer.endsWith(']')) {
                parsedArr = JSON.parse(correctAnswer);
              } else {
                parsedArr = correctAnswer.split(',').map(item => item.trim());
              }
            } catch {
              parsedArr = correctAnswer.split(',').map(item => item.trim());
            }

            const mappedIndices = parsedArr.map(item => {
              const rawItem = item.toUpperCase();
              if (rawItem === 'A' || rawItem === '0') return '0';
              if (rawItem === 'B' || rawItem === '1') return '1';
              if (rawItem === 'C' || rawItem === '2') return '2';
              if (rawItem === 'D' || rawItem === '3') return '3';
              
              // Text match fallback
              const matchIdx = options.findIndex(opt => opt.toLowerCase() === item.toLowerCase());
              return matchIdx !== -1 ? String(matchIdx) : null;
            }).filter(item => item !== null);

            correctAnswer = JSON.stringify(mappedIndices);
          }

          importedQuestions.push({
            question_text: questionText,
            type,
            options,
            correct_answer: correctAnswer,
            explanation,
            marks
          });
        }

        if (importedQuestions.length === 0) {
          alert('No valid questions found to import.');
          return;
        }

        // Use custom confirmation modal
        triggerConfirm({
          title: 'Import Questions',
          message: `Are you sure you want to replace all existing questions with these ${importedQuestions.length} imported questions? This action cannot be undone.`,
          onConfirm: () => {
            setQuestions(importedQuestions);
          }
        });
      } catch (err) {
        console.error(err);
        alert('Failed to parse CSV. Please verify formatting.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Import / Export Controls */}
          <button onClick={handleDownloadTemplate} style={{ ...qS.btnOutline, background: '#F9FAFB', borderColor: '#E5E7EB', color: '#4B5563' }} title="Download template sample CSV">
            📄 Sample CSV
          </button>
          <button onClick={handleExportCSV} style={{ ...qS.btnOutline, background: '#F9FAFB', borderColor: '#E5E7EB', color: '#4B5563' }} title="Export questions to CSV">
            📤 Export CSV
          </button>
          <label style={{ ...qS.btnOutline, background: '#F9FAFB', borderColor: '#E5E7EB', color: '#4B5563', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }} title="Import questions from CSV">
            📥 Import CSV
            <input type="file" accept=".csv" onChange={handleImportCSV} style={{ display: 'none' }} />
          </label>

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
                  {q.options?.map((opt, optIdx) => {
                    const isCorrect = String(optIdx) === q.correct_answer;
                    return (
                      <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <input type="radio" name={`correct-${qIdx}`} checked={isCorrect} onChange={() => onUpdateQ(qIdx, 'correct_answer', String(optIdx))} style={{ cursor: 'pointer', accentColor: '#10B981' }} />
                        <input value={opt} onChange={e => onUpdateOption(qIdx, optIdx, e.target.value)} style={{ flex: 1, padding: '6px 10px', border: `1px solid ${isCorrect ? '#10B981' : '#D1D5DB'}`, borderRadius: '6px', fontSize: '12px', background: isCorrect ? '#ECFDF5' : '#fff', color: isCorrect ? '#065F46' : '#374151', fontWeight: isCorrect ? '700' : 'normal' }} />
                        <button onClick={() => onRemoveOption(qIdx, optIdx)} disabled={q.options.length <= 2} style={{ border: 'none', background: 'none', color: '#9CA3AF', cursor: 'pointer' }}><X size={12} /></button>
                      </div>
                    );
                  })}
                  <button type="button" onClick={() => onAddOption(qIdx)} style={{ background: 'none', border: 'none', color: '#FF9F1C', fontSize: '11px', fontWeight: '700', cursor: 'pointer', padding: 0 }}>+ Add Option</button>

                  <div style={{ marginTop: '12px', borderTop: '1px dashed #E5E7EB', paddingTop: '10px' }}>
                    <label style={{ ...qS.label, color: '#374151', display: 'block', marginBottom: '4px' }}>💡 Answer Explanation (optional)</label>
                    <textarea value={q.explanation || ''} onChange={e => onUpdateQ(qIdx, 'explanation', e.target.value)} placeholder="Explain why this answer is correct..." style={{ ...qS.input, minHeight: '44px', fontSize: '12px', resize: 'vertical' }} />
                  </div>
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
                            style={{ cursor: 'pointer', accentColor: '#10B981', width: '15px', height: '15px' }}
                          />
                          <input
                            value={opt}
                            onChange={e => onUpdateOption(qIdx, optIdx, e.target.value)}
                            style={{ flex: 1, padding: '6px 10px', border: `1px solid ${isChecked ? '#10B981' : '#D1D5DB'}`, borderRadius: '6px', fontSize: '12px', background: isChecked ? '#ECFDF5' : '#fff', color: isChecked ? '#065F46' : '#374151', fontWeight: isChecked ? '700' : 'normal' }}
                          />
                          <button onClick={() => onRemoveOption(qIdx, optIdx)} disabled={q.options.length <= 2} style={{ border: 'none', background: 'none', color: '#9CA3AF', cursor: 'pointer' }}><X size={12} /></button>
                        </div>
                      );
                    })}
                    {selected.length === 0 && (
                      <p style={{ fontSize: '10px', color: '#F59E0B', marginTop: '4px' }}>⚠ No correct answer selected yet. Tick at least one.</p>
                    )}
                    <button type="button" onClick={() => onAddOption(qIdx)} style={{ background: 'none', border: 'none', color: '#FF9F1C', fontSize: '11px', fontWeight: '700', cursor: 'pointer', padding: 0, marginTop: '4px' }}>+ Add Option</button>

                    <div style={{ marginTop: '12px', borderTop: '1px dashed #E5E7EB', paddingTop: '10px' }}>
                      <label style={{ ...qS.label, color: '#374151', display: 'block', marginBottom: '4px' }}>💡 Answer Explanation (optional)</label>
                      <textarea value={q.explanation || ''} onChange={e => onUpdateQ(qIdx, 'explanation', e.target.value)} placeholder="Explain why this answer is correct..." style={{ ...qS.input, minHeight: '44px', fontSize: '12px', resize: 'vertical' }} />
                    </div>
                  </div>
                );
              })()}

              {/* Subjective Info */}
              {q.type === 'subjective' && (
                <div style={{ marginTop: '8px', background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: '8px', padding: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#4F46E5', marginBottom: '8px' }}>
                    <AlertCircle size={13} />
                    <span>Subjective — will be graded manually by an evaluator or admin after student submission.</span>
                  </div>
                  <div style={{ borderTop: '1px dashed #C7D2FE', paddingTop: '8px' }}>
                    <label style={{ ...qS.label, color: '#374151', display: 'block', marginBottom: '4px' }}>💡 Reference Answer / Explanation (optional)</label>
                    <textarea value={q.explanation || ''} onChange={e => onUpdateQ(qIdx, 'explanation', e.target.value)} placeholder="Provide reference answer/rubric to guide grading..." style={{ ...qS.input, minHeight: '44px', fontSize: '12px', resize: 'vertical' }} />
                  </div>
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
  moduleCard: { background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #E5E7EB' },
  moduleHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#F8F9FA', borderBottom: '1.5px solid #E5E7EB' },
  moduleLeft: { display: 'flex', alignItems: 'center', gap: '10px', flex: 1 },
  moduleNum: { fontSize: '10px', fontWeight: '800', color: '#FF9F1C', textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 },
  moduleTitle: { fontSize: '14px', fontWeight: '700', color: '#1A1B4B' },
  inlineInput: { flex: 1, padding: '4px 10px', border: '1.5px solid #FF9F1C', borderRadius: '6px', fontSize: '14px', fontWeight: '600', background: '#fff', outline: 'none' },
  moduleActions: { display: 'flex', gap: '4px' },
  iconBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280' },
  lessonsList: { padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' },
  lessonRow: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', background: '#F0F5FF', border: '1px solid #DBEAFE', borderLeft: '4px solid #3B82F6' },
  lessonRowActive: { background: '#EFF6FF', border: '1.5px solid #3B82F6' },
  lessonIcon: { fontSize: '14px', flexShrink: 0 },
  lessonTitle: { fontSize: '13px', color: '#1E3A8A', flex: 1, fontWeight: '600' },
  freeBadge: { fontSize: '10px', fontWeight: '700', color: '#16A34A', background: '#DCFCE7', padding: '2px 8px', borderRadius: '9999px', flexShrink: 0 },
  lessonActions: { display: 'flex', gap: '2px' },
  iconBtnSm: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '5px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#4B5563' },
  quizRowUnified: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', background: '#F5F3FF', border: '1px solid #DDD6FE', borderLeft: '4px solid #7C3AED' },
  quizIcon: { fontSize: '13px', flexShrink: 0 },
  quizRowInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '1px' },
  quizRowTitle: { fontSize: '12px', fontWeight: '700', color: '#4C1D95' },
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
