'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Trash2, Edit3, Save, X, ChevronUp, ChevronDown,
  Loader2, BookOpen, AlertCircle, HelpCircle, Check, Settings
} from 'lucide-react';

export default function AdminQuizzesPage() {
  const { id: courseId } = useParams();
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
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

  useEffect(() => {
    const load = async () => {
      try {
        const courseRes = await fetch(`/api/courses/${courseId}`);
        if (!courseRes.ok) { router.push('/lms-admin/courses'); return; }
        const { course: data } = await courseRes.json();
        setCourse(data);

        const quizzesRes = await fetch(`/api/admin/quizzes?course_id=${courseId}`);
        if (quizzesRes.ok) {
          const { quizzes: list } = await quizzesRes.json();
          setQuizzes(list || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId, router]);

  const handleCreateOrUpdateQuiz = async (e) => {
    e.preventDefault();
    if (!quizForm.title.trim()) return;
    setSaving(true);

    const payload = {
      course_id: courseId,
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
          setQuizzes(p => p.map(q => q.id === editingQuizId ? data.quiz : q));
          setEditingQuizId(null);
          setShowQuizForm(false);
        }
      } else {
        // Create
        const res = await fetch('/api/admin/quizzes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          setQuizzes(p => [...p, data.quiz]);
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
    if (!confirm('Are you sure you want to delete this quiz and all its questions?')) return;
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
    setQuestions(p => p.map((q, i) => i === index ? {
      ...q,
      type,
      options: type === 'mcq' ? ['Option 1', 'Option 2'] : null,
      correct_answer: type === 'mcq' ? '0' : ''
    } : q));
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
      // Adjust correct answer index if needed
      let correct = parseInt(q.correct_answer) || 0;
      if (correct >= filtered.length) correct = Math.max(0, filtered.length - 1);
      return {
        ...q,
        options: filtered,
        correct_answer: String(correct)
      };
    }));
  };

  const setMcqCorrectOption = (qIdx, optIdx) => {
    setQuestions(p => p.map((q, i) => i === qIdx ? { ...q, correct_answer: String(optIdx) } : q));
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
        // Reload quizzes list to update mixed/mcq/subjective type badge
        const quizzesRes = await fetch(`/api/admin/quizzes?course_id=${courseId}`);
        if (quizzesRes.ok) {
          const { quizzes: list } = await quizzesRes.json();
          setQuizzes(list || []);
        }
      } else {
        alert('Failed to save questions.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
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
          <Link href={`/lms-admin/courses/${courseId}`} style={styles.back}>
            <ArrowLeft size={14} /> Course Settings
          </Link>
          <h1 style={styles.title}>Quizzes & Assessments</h1>
          <p style={styles.subtitle}>{course?.title}</p>
        </div>
        {!activeQuiz && (
          <button onClick={() => setShowQuizForm(!showQuizForm)} style={styles.addBtn}>
            {showQuizForm ? 'Cancel' : 'Create New Quiz'}
          </button>
        )}
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
              <p>Add module tests, final exams, or subjective homework assignments.</p>
            </div>
          ) : (
            <div style={styles.grid}>
              {quizzes.map((quiz) => (
                <div key={quiz.id} style={styles.quizCard}>
                  <div style={styles.quizCardHeader}>
                    <span style={styles.quizTypeBadge}>{quiz.type.toUpperCase()}</span>
                    <div style={styles.quizMeta}>
                      <span>⏱️ {quiz.time_limit_mins ? `${quiz.time_limit_mins}m` : 'No limit'}</span>
                      <span>🎯 Passing: {quiz.pass_score_percent}%</span>
                    </div>
                  </div>
                  <h3 style={styles.quizCardTitle}>{quiz.title}</h3>
                  <p style={styles.quizCardDesc}>{quiz.description || 'No description provided.'}</p>
                  
                  <div style={styles.quizCardFooter}>
                    <button onClick={() => handleOpenQuestionsEditor(quiz)} style={styles.manageBtn}>
                      Manage Questions ({quiz.questions_count || 0})
                    </button>
                    <div style={styles.cardActions}>
                      <button onClick={() => handleEditQuizSettings(quiz)} style={styles.iconBtn}><Edit3 size={14} /></button>
                      <button onClick={() => handleDeleteQuiz(quiz.id)} style={{ ...styles.iconBtn, color: '#EF4444' }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                <p>Click "Add Question" above to begin adding Multiple Choice or Subjective questions.</p>
              </div>
            ) : (
              questions.map((q, qIdx) => (
                <div key={qIdx} style={styles.questionCard}>
                  {/* Head */}
                  <div style={styles.questionCardHead}>
                    <div style={styles.questionIndex}>Question {qIdx + 1}</div>
                    <div style={styles.questionConfig}>
                      {/* Type switcher */}
                      <select
                        value={q.type}
                        onChange={e => updateQuestionType(qIdx, e.target.value)}
                        style={styles.select}
                      >
                        <option value="mcq">MCQ (Auto-Graded)</option>
                        <option value="subjective">Subjective (Evaluator Graded)</option>
                      </select>

                      {/* Marks */}
                      <div style={styles.marksInputBlock}>
                        <label style={styles.marksLabel}>Marks:</label>
                        <input
                          type="number" min="1"
                          value={q.marks || 1}
                          onChange={e => updateQuestionMarks(qIdx, e.target.value)}
                          style={styles.marksInput}
                        />
                      </div>

                      {/* Reorder and Delete */}
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

                    {/* MCQ Options Config */}
                    {q.type === 'mcq' && (
                      <div style={styles.optionsSection}>
                        <label style={styles.label}>Answer Options & Correct Key</label>
                        <div style={styles.optionsList}>
                          {q.options?.map((opt, optIdx) => (
                            <div key={optIdx} style={styles.optionRow}>
                              {/* Checkbox for correct option */}
                              <input
                                type="radio"
                                name={`correct-${qIdx}`}
                                checked={String(optIdx) === q.correct_answer}
                                onChange={() => setMcqCorrectOption(qIdx, optIdx)}
                                style={styles.radio}
                              />
                              {/* Text input */}
                              <input
                                value={opt}
                                onChange={e => updateMcqOption(qIdx, optIdx, e.target.value)}
                                style={styles.optionInput}
                              />
                              {/* Remove option */}
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

                    {q.type === 'subjective' && (
                      <div style={styles.subjectiveInfo}>
                        <AlertCircle size={14} style={{ color: '#4F46E5', flexShrink: 0 }} />
                        <span>Subjective questions require grading by an Evaluator or Admin once submitted by a student.</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
  addOptBtn: { background: 'none', border: 'none', color: '#FF9F1C', fontSize: '11px', fontWeight: '700', cursor: 'pointer', padding: 0, alignSelf: 'flex-start' },
  subjectiveInfo: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#4F46E5', background: '#EEF2FF', padding: '8px 12px', borderRadius: '6px', marginTop: '4px' }
};
