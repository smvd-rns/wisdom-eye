'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Trash2, Edit3, Save, X, ChevronUp, ChevronDown,
  Loader2, BookOpen, AlertCircle, HelpCircle, Check, Settings, Users, Search,
  LayoutGrid, List as ListIcon
} from 'lucide-react';

export default function AdminQuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Active quiz being edited
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);

  // Quiz form state
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [quizForm, setQuizForm] = useState({
    title: '', description: '', pass_score_percent: '60',
    time_limit_mins: '', max_attempts: '3', show_correct_answers: true
  });
  const [editingQuizId, setEditingQuizId] = useState(null);

  // Evaluator Modal State
  const [showEvaluatorModal, setShowEvaluatorModal] = useState(false);
  const [evaluatorModalQuiz, setEvaluatorModalQuiz] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [assignedEvaluatorIds, setAssignedEvaluatorIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingEvaluators, setLoadingEvaluators] = useState(false);
  const [savingEvaluators, setSavingEvaluators] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null); // { title, message, onConfirm }

  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('title');
  const [filterCourseId, setFilterCourseId] = useState('all');

  const displayedQuizzes = quizzes.filter(q => filterCourseId === 'all' || String(q.course_id) === filterCourseId);

  const sortedQuizzes = [...displayedQuizzes].sort((a, b) => {
    if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
    if (sortBy === 'course') {
      const courseA = a.course?.title || 'ZZZ';
      const courseB = b.course?.title || 'ZZZ';
      const cmp = courseA.localeCompare(courseB);
      return cmp !== 0 ? cmp : (a.title || '').localeCompare(b.title || '');
    }
    if (sortBy === 'type') {
      const typeCmp = (a.type || '').localeCompare(b.type || '');
      return typeCmp !== 0 ? typeCmp : (a.title || '').localeCompare(b.title || '');
    }
    return 0;
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [quizzesRes, coursesRes] = await Promise.all([
          fetch(`/api/admin/quizzes?course_id=all`),
          fetch('/api/admin/courses')
        ]);
        if (quizzesRes.ok) {
          const { quizzes: list } = await quizzesRes.json();
          setQuizzes(list || []);
        }
        if (coursesRes.ok) {
          const { courses: cList } = await coursesRes.json();
          setCourses(cList || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCreateOrUpdateQuiz = async (e) => {
    e.preventDefault();
    if (!quizForm.title.trim()) return;
    setSaving(true);

    const payload = {
      ...quizForm,
      pass_score_percent: parseInt(quizForm.pass_score_percent) || 60,
      time_limit_mins: quizForm.time_limit_mins ? parseInt(quizForm.time_limit_mins) : null,
      max_attempts: quizForm.max_attempts ? parseInt(quizForm.max_attempts) : 3,
    };

    try {
      if (editingQuizId) {
        // Update
        const res = await fetch('/api/admin/quizzes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingQuizId, ...payload })
        });
        const data = await res.json();
        if (res.ok) {
          setQuizzes(p => p.map(q => q.id === editingQuizId ? { ...data.quiz, course: q.course } : q));
          setEditingQuizId(null);
          setShowQuizForm(false);
        }
      }
      setQuizForm({
        title: '', description: '', pass_score_percent: '60',
        time_limit_mins: '', max_attempts: '3', show_correct_answers: true
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleEditQuizSettings = (quiz) => {
    setEditingQuizId(quiz.id);
    setQuizForm({
      title: quiz.title,
      description: quiz.description || '',
      pass_score_percent: String(quiz.pass_score_percent),
      time_limit_mins: quiz.time_limit_mins ? String(quiz.time_limit_mins) : '',
      max_attempts: String(quiz.max_attempts),
      show_correct_answers: quiz.show_correct_answers
    });
    setShowQuizForm(true);
  };

  const handleDeleteQuiz = async (quizId) => {
    setConfirmModal({
      title: 'Delete Quiz',
      message: 'Are you sure you want to delete this quiz and all its questions? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/quizzes?id=${quizId}`, { method: 'DELETE' });
          if (res.ok) {
            setQuizzes(p => p.filter(q => q.id !== quizId));
            if (activeQuiz?.id === quizId) {
              setActiveQuiz(null);
              setQuestions([]);
            }
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const handleOpenQuestionsEditor = async (quiz) => {
    setActiveQuiz(quiz);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/quizzes?id=${quiz.id}`);
      const data = await res.json();
      if (res.ok) {
        setQuestions(data.quiz.questions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Question List Operations ──────────────────────────────

  const addQuestion = () => {
    setQuestions(p => [...p, {
      question_text: '',
      type: 'mcq',
      options: ['Option 1', 'Option 2'],
      correct_answer: '0',
      marks: 1
    }]);
  };

  const updateQuestionText = (index, val) => {
    setQuestions(p => p.map((q, i) => i === index ? { ...q, question_text: val } : q));
  };

  const updateQuestionType = (index, type) => {
    setQuestions(p => p.map((q, i) => {
      if (i !== index) return q;
      const defaultOpts = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
      if (type === 'mcq') return { ...q, type, options: defaultOpts, correct_answer: '0' };
      if (type === 'mcq_multi') return { ...q, type, options: defaultOpts, correct_answer: '[]' };
      return { ...q, type, options: null, correct_answer: '' }; // subjective
    }));
  };

  const updateQuestionMarks = (index, val) => {
    setQuestions(p => p.map((q, i) => i === index ? { ...q, marks: parseInt(val) || 1 } : q));
  };

  // MCQ Options operations
  const updateMcqOption = (qIdx, optIdx, val) => {
    setQuestions(p => p.map((q, i) => i === qIdx ? {
      ...q,
      options: q.options.map((o, oi) => oi === optIdx ? val : o)
    } : q));
  };

  const addMcqOption = (qIdx) => {
    setQuestions(p => p.map((q, i) => i === qIdx ? {
      ...q,
      options: [...q.options, `Option ${q.options.length + 1}`]
    } : q));
  };

  const removeMcqOption = (qIdx, optIdx) => {
    setQuestions(p => p.map((q, i) => {
      if (i !== qIdx) return q;
      const filtered = q.options.filter((_, oi) => oi !== optIdx);
      if (q.type === 'mcq_multi') {
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
  };

  const setMcqCorrectOption = (qIdx, optIdx) => {
    setQuestions(p => p.map((q, i) => i === qIdx ? { ...q, correct_answer: String(optIdx) } : q));
  };

  // Toggle a checkbox option in/out of multi-correct answer array
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

  const moveQuestion = (index, dir) => {
    const list = [...questions];
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    setQuestions(list);
  };

  const deleteQuestion = (index) => {
    setQuestions(p => p.filter((_, i) => i !== index));
  };

  const handleSaveQuestions = async () => {
    if (!activeQuiz) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/quizzes/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz_id: activeQuiz.id,
          questions
        })
      });
      if (res.ok) {
        alert('Quiz questions saved successfully!');
      } else {
        alert('Failed to save questions.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEvaluatorModal = async (quiz) => {
    setEvaluatorModalQuiz(quiz);
    setShowEvaluatorModal(true);
    setLoadingEvaluators(true);
    setSearchQuery('');
    try {
      const res = await fetch(`/api/admin/quizzes/evaluators?quiz_id=${quiz.id}`);
      if (res.ok) {
        const data = await res.json();
        setStaffList(data.allEvaluators || []);
        setAssignedEvaluatorIds(new Set(data.assignedEvaluatorIds || []));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvaluators(false);
    }
  };

  const handleToggleEvaluator = (userId) => {
    setAssignedEvaluatorIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleSaveEvaluatorAssignments = async () => {
    if (!evaluatorModalQuiz) return;
    setSavingEvaluators(true);
    try {
      const res = await fetch('/api/admin/quizzes/evaluators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz_id: evaluatorModalQuiz.id,
          evaluator_user_ids: Array.from(assignedEvaluatorIds)
        })
      });
      if (res.ok) {
        setShowEvaluatorModal(false);
        setEvaluatorModalQuiz(null);
      } else {
        alert('Failed to save evaluator assignments.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEvaluators(false);
    }
  };

  if (loading && !activeQuiz) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <Loader2 size={32} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <Link href="/lms-admin" style={styles.back}>
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <h1 style={styles.title}>Global Quiz Library</h1>
          <div style={styles.headerMeta}>
            <span style={styles.badge}>{quizzes.length} quizzes</span>
          </div>
        </div>
      </div>

      {/* Quiz Form */}
      {showQuizForm && (
        <form onSubmit={handleCreateOrUpdateQuiz} style={styles.quizForm}>
          <h3 style={styles.formTitle}>{editingQuizId ? 'Edit Quiz Settings' : 'New Quiz Info'}</h3>
          <div style={styles.formGrid}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={styles.label}>Quiz Title *</label>
              <input
                required
                value={quizForm.title}
                onChange={e => setQuizForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. End of Module 1 Test"
                style={styles.input}
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={styles.label}>Description</label>
              <textarea
                value={quizForm.description}
                onChange={e => setQuizForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Instructions, syllabus, grading criteria..."
                style={{ ...styles.input, minHeight: '60px', resize: 'vertical' }}
              />
            </div>
            <div>
              <label style={styles.label}>Passing Score (%) *</label>
              <input
                type="number" min="0" max="100" required
                value={quizForm.pass_score_percent}
                onChange={e => setQuizForm(p => ({ ...p, pass_score_percent: e.target.value }))}
                style={styles.input}
              />
            </div>
            <div>
              <label style={styles.label}>Time Limit (minutes - empty for none)</label>
              <input
                type="number" min="1"
                value={quizForm.time_limit_mins}
                onChange={e => setQuizForm(p => ({ ...p, time_limit_mins: e.target.value }))}
                style={styles.input}
              />
            </div>
            <div>
              <label style={styles.label}>Max Attempts</label>
              <input
                type="number" min="1" required
                value={quizForm.max_attempts}
                onChange={e => setQuizForm(p => ({ ...p, max_attempts: e.target.value }))}
                style={styles.input}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
              <label style={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={quizForm.show_correct_answers}
                  onChange={e => setQuizForm(p => ({ ...p, show_correct_answers: e.target.checked }))}
                />
                <span style={{ fontSize: '13px', color: '#374151' }}>Show correct answers on submission</span>
              </label>
            </div>
          </div>
          <div style={styles.formActions}>
            <button type="submit" disabled={saving} style={styles.saveFormBtn}>
              {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Save Quiz Settings'}
            </button>
            <button type="button" onClick={() => { setShowQuizForm(false); setEditingQuizId(null); }} style={styles.cancelFormBtn}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Main layout: Quiz list or Question editor */}
      {!activeQuiz ? (
        <div style={styles.quizzesList}>
          {quizzes.length === 0 ? (
            <div style={styles.emptyState}>
              <HelpCircle size={48} style={{ color: '#D1D5DB', marginBottom: '16px' }} />
              <h3>No Quizzes Created Yet</h3>
            </div>
          ) : (
            <>
              <div style={styles.toolbar}>
                <div style={styles.sortGroup}>
                  <span style={styles.sortLabel}>Filter by Course:</span>
                  <select value={filterCourseId} onChange={(e) => setFilterCourseId(e.target.value)} style={styles.sortSelect}>
                    <option value="all">All Courses</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>

                  <span style={{ ...styles.sortLabel, marginLeft: '16px' }}>Sort by:</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.sortSelect}>
                    <option value="course">Course</option>
                    <option value="title">Quiz Title (A-Z)</option>
                    <option value="type">Quiz Type</option>
                  </select>
                </div>
                <div style={styles.viewToggle}>
                  <button onClick={() => setViewMode('grid')} style={{ ...styles.viewBtn, ...(viewMode === 'grid' ? styles.viewBtnActive : {}) }}><LayoutGrid size={16} /></button>
                  <button onClick={() => setViewMode('list')} style={{ ...styles.viewBtn, ...(viewMode === 'list' ? styles.viewBtnActive : {}) }}><ListIcon size={16} /></button>
                </div>
              </div>
              <div style={viewMode === 'grid' ? styles.grid : styles.list}>
                {sortedQuizzes.map((quiz, idx) => (
                  <div key={quiz.id} style={viewMode === 'grid' ? styles.quizCard : styles.quizListCard}>
                    {viewMode === 'list' && (
                      <div style={styles.listIndex}>
                        {String.fromCharCode(65 + (idx % 26))}{idx >= 26 ? Math.floor(idx / 26) : ''}
                      </div>
                    )}
                    {viewMode === 'list' ? (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                          <span style={styles.quizTypeBadge}>{quiz.type?.toUpperCase()}</span>
                          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: 0 }}>{quiz.title}</h3>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                          <span>{quiz.questions_count || 0} questions</span>
                          <span>Pass: {quiz.pass_score_percent}%</span>
                          {quiz.course?.title ? (
                            <span style={{ fontSize: '11px', color: '#4338CA', background: '#EEF2FF', padding: '2px 8px', borderRadius: '9999px', fontWeight: '600' }}>
                              Course: {quiz.course.title}
                            </span>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Unassigned</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={styles.quizCardHeader}>
                          <span style={styles.quizTypeBadge}>{quiz.type?.toUpperCase()}</span>
                          <div style={styles.quizMeta}>
                            <span style={styles.metaBadge}>{quiz.questions_count || 0} questions</span>
                            <span style={styles.metaBadge}>Pass: {quiz.pass_score_percent}%</span>
                          </div>
                        </div>
                        <h3 style={styles.quizCardTitle}>{quiz.title}</h3>
                        <div>
                          {quiz.course?.title ? (
                            <div style={{ fontSize: '11px', color: '#4338CA', background: '#EEF2FF', display: 'inline-block', padding: '2px 8px', borderRadius: '9999px', marginBottom: '4px', fontWeight: '600' }}>Course: {quiz.course.title}</div>
                          ) : (
                            <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>Unassigned</div>
                          )}
                        </div>
                        <p style={styles.quizCardDesc}>{quiz.description || 'No description provided.'}</p>
                      </div>
                    )}
                    
                    <div style={viewMode === 'grid' ? styles.quizCardFooter : styles.quizListCardFooter}>
                      <div style={{ display: 'flex', flexDirection: viewMode === 'grid' ? 'column' : 'row', gap: '6px', alignItems: viewMode === 'grid' ? 'flex-start' : 'center' }}>
                        <button onClick={() => handleOpenQuestionsEditor(quiz)} style={styles.manageBtn}>
                          Manage Questions
                        </button>
                        <button onClick={() => handleOpenEvaluatorModal(quiz)} style={styles.evaluatorBtn}>
                          <Users size={12} style={{ marginRight: '4px' }} /> Assign Evaluators
                        </button>
                      </div>
                      <div style={styles.cardActions}>
                        <button onClick={() => handleEditQuizSettings(quiz)} style={styles.iconBtn}><Edit3 size={14} /></button>
                        <button onClick={() => handleDeleteQuiz(quiz.id)} style={{ ...styles.iconBtn, color: '#EF4444' }}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        /* Question Builder workspace */
        <div style={styles.questionsWorkspace}>
          <div style={styles.editorHeader}>
            <button onClick={() => setActiveQuiz(null)} style={styles.backToQuizzesBtn}>
              ← Back to Quizzes List
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <h2 style={styles.editorTitle}>Editing: {activeQuiz.title}</h2>
              <span style={styles.totalMarksBadge}>
                Total Marks: {questions.reduce((s, q) => s + (q.marks || 1), 0)}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={addQuestion} style={styles.addQuestionBtn}>
                <Plus size={14} /> Add Question
              </button>
              <button onClick={handleSaveQuestions} disabled={saving} style={styles.saveQuestionsBtn}>
                {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />} Save Quiz
              </button>
            </div>
          </div>

          <div style={styles.questionsListScroll}>
            {questions.length === 0 ? (
              <div style={styles.emptyQuestionsState}>
                <HelpCircle size={40} style={{ color: '#D1D5DB', marginBottom: '12px' }} />
                <h3>No questions in this quiz yet</h3>
              </div>
            ) : (
              questions.map((q, qIdx) => (
                <div key={qIdx} style={styles.questionCard}>
                  {/* Head */}
                  <div style={styles.questionCardHead}>
                    <div style={styles.questionIndex}>Question {qIdx + 1}</div>
                    <div style={styles.questionConfig}>
                      <select
                        value={q.type}
                        onChange={e => updateQuestionType(qIdx, e.target.value)}
                        style={styles.select}
                      >
                        <option value="mcq">MCQ — Single Answer ●</option>
                        <option value="mcq_multi">Multi-Answer ☑ (multiple correct)</option>
                        <option value="subjective">Subjective (Evaluator Graded)</option>
                      </select>

                      <div style={styles.marksInputBlock}>
                        <label style={styles.marksLabel}>Marks:</label>
                        <input
                          type="number" min="1"
                          value={q.marks || 1}
                          onChange={e => updateQuestionMarks(qIdx, e.target.value)}
                          style={styles.marksInput}
                        />
                      </div>

                      <button onClick={() => moveQuestion(qIdx, -1)} disabled={qIdx === 0} style={styles.iconBtnSm}><ChevronUp size={14} /></button>
                      <button onClick={() => moveQuestion(qIdx, 1)} disabled={qIdx === questions.length - 1} style={styles.iconBtnSm}><ChevronDown size={14} /></button>
                      <button onClick={() => deleteQuestion(qIdx)} style={{ ...styles.iconBtnSm, color: '#EF4444' }}><Trash2 size={14} /></button>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={styles.questionCardBody}>
                    <label style={styles.label}>Question Text *</label>
                    <textarea
                      value={q.question_text}
                      onChange={e => updateQuestionText(qIdx, e.target.value)}
                      placeholder="Type the question here..."
                      style={{ ...styles.input, minHeight: '50px', resize: 'vertical' }}
                    />

                    {/* MCQ Single-Answer Options */}
                    {q.type === 'mcq' && (
                      <div style={styles.optionsSection}>
                        <label style={styles.label}>Answer Options</label>
                        <div style={styles.optionsList}>
                          {q.options?.map((opt, optIdx) => (
                            <div key={optIdx} style={styles.optionRow}>
                              <input
                                type="radio"
                                name={`correct-${qIdx}`}
                                checked={String(optIdx) === q.correct_answer}
                                onChange={() => setMcqCorrectOption(qIdx, optIdx)}
                                style={styles.radio}
                              />
                              <input
                                value={opt}
                                onChange={e => updateMcqOption(qIdx, optIdx, e.target.value)}
                                style={styles.optionInput}
                              />
                              <button
                                type="button"
                                onClick={() => removeMcqOption(qIdx, optIdx)}
                                disabled={q.options.length <= 2}
                                style={styles.removeOptBtn}
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <button type="button" onClick={() => addMcqOption(qIdx)} style={styles.addOptBtn}>
                          + Add Option
                        </button>
                      </div>
                    )}

                    {/* MCQ Multi-Answer Options (checkboxes) */}
                    {q.type === 'mcq_multi' && (() => {
                      let selected = [];
                      try { selected = JSON.parse(q.correct_answer || '[]'); } catch { selected = []; }
                      return (
                        <div style={{ ...styles.optionsSection, borderColor: '#818CF8', borderWidth: '1.5px' }}>
                          <label style={{ ...styles.label, color: '#4338CA' }}>Multi-Answer — tick ALL correct options</label>
                          <div style={styles.optionsList}>
                            {q.options?.map((opt, optIdx) => {
                              const isChecked = selected.includes(String(optIdx));
                              return (
                                <div key={optIdx} style={styles.optionRow}>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleMultiCorrect(qIdx, optIdx)}
                                    style={{ ...styles.radio, width: '15px', height: '15px', accentColor: '#4338CA' }}
                                  />
                                  <input
                                    value={opt}
                                    onChange={e => updateMcqOption(qIdx, optIdx, e.target.value)}
                                    style={{ ...styles.optionInput, borderColor: isChecked ? '#818CF8' : '#D1D5DB', background: isChecked ? '#F5F3FF' : '#fff' }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeMcqOption(qIdx, optIdx)}
                                    disabled={q.options.length <= 2}
                                    style={styles.removeOptBtn}
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                          <button type="button" onClick={() => addMcqOption(qIdx)} style={styles.addOptBtn}>
                            + Add Option
                          </button>
                        </div>
                      );
                    })()}

                    {q.type === 'subjective' && (
                      <div style={styles.subjectiveInfo}>
                        <AlertCircle size={14} style={{ color: '#4F46E5', flexShrink: 0 }} />
                        <span>Subjective questions require grading by an Evaluator.</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Assign Evaluators Modal */}
      {showEvaluatorModal && evaluatorModalQuiz && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Assign Evaluators</h3>
                <p style={styles.modalSubtitle}>{evaluatorModalQuiz.title}</p>
              </div>
              <button 
                onClick={() => { setShowEvaluatorModal(false); setEvaluatorModalQuiz(null); }} 
                style={styles.modalCloseBtn}
              >
                <X size={18} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.searchContainer}>
                <Search size={14} style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search staff by name..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={styles.searchInput}
                />
              </div>

              {loadingEvaluators ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                  <Loader2 size={24} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
                </div>
              ) : (
                <div style={styles.evaluatorList}>
                  {staffList
                    .filter(staff => 
                      staff.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      staff.email?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(staff => {
                      const isChecked = assignedEvaluatorIds.has(staff.user_id);
                      return (
                        <div 
                          key={staff.user_id} 
                          onClick={() => handleToggleEvaluator(staff.user_id)}
                          style={{
                            ...styles.evaluatorRow,
                            background: isChecked ? '#EEF2FF' : 'transparent',
                            borderColor: isChecked ? '#C7D2FE' : '#E5E7EB'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} 
                            style={styles.checkbox}
                          />
                          <div style={styles.evaluatorRowInfo}>
                            <span style={styles.evaluatorName}>{staff.name}</span>
                            <span style={styles.evaluatorEmail}>{staff.email}</span>
                          </div>
                          <span style={{
                            ...styles.roleLabel,
                            background: staff.role === 'evaluator' ? '#FEE2E2' : staff.role === 'admin' || staff.role === 'superadmin' ? '#FEF3C7' : '#E0F2FE',
                            color: staff.role === 'evaluator' ? '#991B1B' : staff.role === 'admin' || staff.role === 'superadmin' ? '#92400E' : '#075985'
                          }}>
                            {staff.role}
                          </span>
                        </div>
                      );
                    })}
                  
                  {staffList.filter(staff => 
                    staff.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    staff.email?.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length === 0 && (
                    <div style={styles.noResults}>No matching staff members found.</div>
                  )}
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button 
                onClick={handleSaveEvaluatorAssignments} 
                disabled={savingEvaluators || loadingEvaluators} 
                style={styles.modalSaveBtn}
              >
                {savingEvaluators ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Save Assignments'}
              </button>
              <button 
                onClick={() => { setShowEvaluatorModal(false); setEvaluatorModalQuiz(null); }} 
                disabled={savingEvaluators}
                style={styles.modalCancelBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Beautiful Confirm Modal */}
      {confirmModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100000, animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', width: '420px', maxWidth: '90%',
            padding: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            transform: 'scale(1)', animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            fontFamily: 'Outfit, sans-serif'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
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
                style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#fff', color: '#475569', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s ease' }}
                onMouseOver={e => e.target.style.backgroundColor = '#F8FAFC'}
                onMouseOut={e => e.target.style.backgroundColor = '#fff'}
              >
                Cancel
              </button>
              <button
                onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }}
                style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', backgroundColor: '#EF4444', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}
                onMouseOver={e => e.target.style.backgroundColor = '#DC2626'}
                onMouseOut={e => e.target.style.backgroundColor = '#EF4444'}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

const styles = {
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' },
  back: { display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '12px', marginBottom: '6px', textDecoration: 'none' },
  title: { fontSize: '22px', fontWeight: '800', color: '#111827', fontFamily: 'Outfit, sans-serif' },
  subtitle: { fontSize: '13px', color: '#6B7280', marginTop: '2px' },
  addBtn: { background: '#1A1B4B', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 16px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' },
  quizForm: { background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB' },
  formTitle: { fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '14px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' },
  input: { width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' },
  checkboxRow: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
  formActions: { display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid #F3F4F6', paddingTop: '14px' },
  saveFormBtn: { background: '#FF9F1C', color: '#1A1B4B', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px' },
  cancelFormBtn: { background: '#F3F4F6', color: '#6B7280', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
  quizzesList: { marginTop: '12px' },
  emptyState: { textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: '12px', border: '1.5px dashed #D1D5DB' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' },
  quizCard: { background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', minHeight: '160px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' },
  quizCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  quizTypeBadge: { fontSize: '9px', fontWeight: '800', background: '#EEF2FF', color: '#4F46E5', padding: '2px 8px', borderRadius: '9999px' },
  quizMeta: { display: 'flex', gap: '8px', fontSize: '11px', color: '#6B7280' },
  quizCardTitle: { fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '6px' },
  quizCardDesc: { fontSize: '12px', color: '#6B7280', lineHeight: 1.4, flex: 1, marginBottom: '14px' },
  quizCardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F3F4F6', paddingTop: '10px', marginTop: 'auto' },
  manageBtn: { background: 'none', border: 'none', color: '#FF9F1C', fontSize: '12px', fontWeight: '700', cursor: 'pointer', padding: 0, fontFamily: 'inherit' },
  cardActions: { display: 'flex', gap: '2px' },
  iconBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '5px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280' },
  questionsWorkspace: { background: '#fff', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' },
  editorHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', flexWrap: 'wrap', gap: '12px' },
  backToQuizzesBtn: { background: 'none', border: 'none', color: '#6B7280', fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: 0, fontFamily: 'inherit' },
  editorTitle: { fontSize: '15px', fontWeight: '700', color: '#111827' },
  totalMarksBadge: { fontSize: '12px', fontWeight: '700', color: '#1A1B4B', background: '#FFE8CC', padding: '3px 10px', borderRadius: '9999px' },
  addQuestionBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1.5px solid #FF9F1C', color: '#FF9F1C', padding: '7px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' },
  saveQuestionsBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: '#1A1B4B', color: '#fff', padding: '7px 14px', borderRadius: '7px', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' },
  questionsListScroll: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '650px', overflowY: 'auto' },
  emptyQuestionsState: { textAlign: 'center', padding: '40px 0', color: '#6B7280' },
  questionCard: { background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '16px' },
  questionCardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: '10px', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' },
  questionIndex: { fontSize: '13px', fontWeight: '700', color: '#111827' },
  questionConfig: { display: 'flex', alignItems: 'center', gap: '10px' },
  select: { padding: '5px 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '12px', background: '#fff', fontFamily: 'inherit' },
  marksInputBlock: { display: 'flex', alignItems: 'center', gap: '4px' },
  marksLabel: { fontSize: '12px', color: '#374151' },
  marksInput: { width: '46px', padding: '4px 6px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '12px', textAlign: 'center' },
  iconBtnSm: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '5px', background: '#fff', border: '1px solid #D1D5DB', cursor: 'pointer', color: '#6B7280' },
  questionCardBody: { display: 'flex', flexDirection: 'column', gap: '10px' },
  optionsSection: { marginTop: '6px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '12px' },
  optionsList: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' },
  optionRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  radio: { cursor: 'pointer' },
  optionInput: { flex: 1, padding: '7px 10px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '12px' },
  removeOptBtn: { border: 'none', background: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '4px' },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '8px 12px', background: '#fff', borderRadius: '10px', border: '1px solid #E5E7EB' },
  sortGroup: { display: 'flex', alignItems: 'center', gap: '8px' },
  sortLabel: { fontSize: '13px', fontWeight: '600', color: '#6B7280' },
  sortSelect: { padding: '6px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px', background: '#F9FAFB', outline: 'none', cursor: 'pointer', color: '#111827', fontFamily: 'inherit' },
  viewToggle: { display: 'flex', gap: '4px', background: '#F3F4F6', padding: '4px', borderRadius: '8px' },
  viewBtn: { background: 'transparent', border: 'none', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6B7280' },
  viewBtnActive: { background: '#fff', color: '#1A1B4B', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  quizListCard: { background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' },
  listIndex: { fontSize: '14px', fontWeight: '800', color: '#D1D5DB', minWidth: '24px', textAlign: 'center' },
  listContent: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  quizListCardFooter: { display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '1px solid #F3F4F6', paddingLeft: '16px' },
  addOptBtn: { background: 'none', border: 'none', color: '#FF9F1C', fontSize: '11px', fontWeight: '700', cursor: 'pointer', padding: 0, alignSelf: 'flex-start' },
  subjectiveInfo: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#4F46E5', background: '#EEF2FF', padding: '8px 12px', borderRadius: '6px', marginTop: '4px' },
  evaluatorBtn: { background: 'none', border: 'none', color: '#4F46E5', fontSize: '11px', fontWeight: '700', cursor: 'pointer', padding: 0, fontFamily: 'inherit', display: 'flex', alignItems: 'center', marginTop: '4px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', maxHeight: '85vh', alignSelf: 'center' },
  modalHeader: { padding: '20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { fontSize: '16px', fontWeight: '700', color: '#111827', fontFamily: 'Outfit, sans-serif' },
  modalSubtitle: { fontSize: '12px', color: '#6B7280', marginTop: '2px' },
  modalCloseBtn: { background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' },
  modalBody: { padding: '20px', overflowY: 'auto', flex: 1 },
  searchContainer: { display: 'flex', alignItems: 'center', border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '2px 10px', marginBottom: '16px', background: '#F9FAFB' },
  searchIcon: { color: '#9CA3AF', marginRight: '8px' },
  searchInput: { border: 'none', background: 'transparent', width: '100%', padding: '8px 0', fontSize: '13px', outline: 'none', fontFamily: 'inherit' },
  evaluatorList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  evaluatorRow: { display: 'flex', alignItems: 'center', padding: '12px', borderRadius: '10px', border: '1px solid #E5E7EB', cursor: 'pointer', transition: 'all 0.15s ease' },
  checkbox: { cursor: 'pointer', marginRight: '12px' },
  evaluatorRowInfo: { display: 'flex', flexDirection: 'column', flex: 1 },
  evaluatorName: { fontSize: '13px', fontWeight: '600', color: '#111827' },
  evaluatorEmail: { fontSize: '11px', color: '#6B7280' },
  roleLabel: { fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '9999px' },
  noResults: { textAlign: 'center', padding: '20px', color: '#6B7280', fontSize: '13px' },
  modalFooter: { padding: '16px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#F9FAFB', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' },
  modalSaveBtn: { background: '#1A1B4B', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 16px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px' },
  modalCancelBtn: { background: '#fff', color: '#4B5563', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '9px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }
};
