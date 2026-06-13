'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ClipboardCheck, Loader2, AlertCircle, Search,
  ChevronRight, Clock, CheckCircle2, User,
  BookOpen, Filter, RefreshCw, Eye, Pen,
  CheckCheck, XCircle, Star
} from 'lucide-react';

const STATUS_TABS = [
  { key: 'pending_grade', label: 'Pending Grading', color: '#D97706', bg: '#FEF3C7', icon: Clock },
  { key: 'graded',        label: 'Graded',          color: '#059669', bg: '#D1FAE5', icon: CheckCheck },
  { key: 'all',           label: 'All Attempts',    color: '#6B7280', bg: '#F3F4F6', icon: ClipboardCheck },
];

export default function GradingQueuePage() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending_grade');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  // Grading modal
  const [gradingAttempt, setGradingAttempt] = useState(null); // { attempt, quiz, student }
  const [scores, setScores] = useState({});      // { questionId: marksAwarded }
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [gradeSuccess, setGradeSuccess] = useState('');

  const loadAttempts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.set('status', activeTab);
      const res = await fetch(`/api/admin/attempts?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAttempts(data.attempts || []);
      } else {
        setError('Failed to load grading queue.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { loadAttempts(); }, [loadAttempts]);

  const openGradingModal = async (attempt) => {
    try {
      const res = await fetch(`/api/admin/attempts?id=${attempt.id}`);
      if (res.ok) {
        const data = await res.json();
        setGradingAttempt(data);
        // Pre-fill scores for subjective questions that have already been graded
        const prefill = {};
        data.quiz?.questions?.forEach(q => {
          if (q.type === 'subjective' && data.attempt?.subjective_scores?.[q.id] !== undefined) {
            prefill[q.id] = data.attempt.subjective_scores[q.id];
          }
        });
        setScores(prefill);
        setFeedback(data.attempt?.evaluator_feedback || '');
        setGradeSuccess('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGradeSubmit = async () => {
    if (!gradingAttempt) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/quizzes/${gradingAttempt.attempt.quiz_id}/grade`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attempt_id: gradingAttempt.attempt.id,
          scores,
          feedback
        })
      });
      if (res.ok) {
        setGradeSuccess('✅ Graded and saved! Student has been notified.');
        // Update local state
        setAttempts(prev => prev.map(a =>
          a.id === gradingAttempt.attempt.id ? { ...a, status: 'graded' } : a
        ));
        setTimeout(() => {
          setGradingAttempt(null);
          setScores({});
          setFeedback('');
          setGradeSuccess('');
          loadAttempts();
        }, 2000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save grades.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = attempts.filter(a => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.student?.name?.toLowerCase().includes(q) ||
      a.student?.email?.toLowerCase().includes(q) ||
      a.quizzes?.title?.toLowerCase().includes(q) ||
      a.quizzes?.courses?.title?.toLowerCase().includes(q)
    );
  });

  const counts = {
    pending_grade: attempts.filter(a => a.status === 'pending_grade').length,
    graded: attempts.filter(a => a.status === 'graded').length,
    all: attempts.length,
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
            Grading Queue
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '3px' }}>
            Review and grade student quiz submissions
          </p>
        </div>
        <button onClick={loadAttempts} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1.5px solid #E5E7EB', background: '#fff', fontSize: '12px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
        <div style={{ background: '#FEF3C7', borderRadius: '12px', padding: '16px 20px', border: '1px solid #FDE68A' }}>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#D97706' }}>{counts.pending_grade}</div>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#92400E', marginTop: '2px' }}>⏳ Awaiting Grading</div>
        </div>
        <div style={{ background: '#D1FAE5', borderRadius: '12px', padding: '16px 20px', border: '1px solid #A7F3D0' }}>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#059669' }}>{counts.graded}</div>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#065F46', marginTop: '2px' }}>✅ Graded</div>
        </div>
        <div style={{ background: '#F3F4F6', borderRadius: '12px', padding: '16px 20px', border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#374151' }}>{counts.all}</div>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', marginTop: '2px' }}>📋 Total Submissions</div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', fontSize: '13px', marginBottom: '14px' }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Table Card */}
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>

        {/* Tabs + Search */}
        <div style={{ borderBottom: '1px solid #E5E7EB' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0', padding: '0 20px', overflowX: 'auto' }}>
            {STATUS_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '14px 18px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap',
                  background: 'none',
                  color: activeTab === tab.key ? '#1A1B4B' : '#6B7280',
                  borderBottom: activeTab === tab.key ? '2px solid #FF9F1C' : '2px solid transparent',
                  transition: 'all 0.15s'
                }}
              >
                {tab.label}
                <span style={{ marginLeft: '6px', padding: '1px 7px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: activeTab === tab.key ? tab.bg : '#F3F4F6', color: activeTab === tab.key ? tab.color : '#9CA3AF' }}>
                  {counts[tab.key]}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ padding: '12px 20px', borderTop: '1px solid #F3F4F6' }}>
            <div style={{ position: 'relative', maxWidth: '360px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                type="text"
                placeholder="Search student, quiz, or course..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Loader2 size={32} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#6B7280', fontSize: '13px', margin: 0 }}>Loading submissions...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: '#6B7280' }}>
            <ClipboardCheck size={44} style={{ color: '#D1D5DB', marginBottom: '12px' }} />
            <h3 style={{ margin: '0 0 4px', color: '#374151' }}>
              {activeTab === 'pending_grade' ? 'No submissions pending grading 🎉' : 'No submissions found'}
            </h3>
            <p style={{ margin: 0, fontSize: '13px' }}>
              {activeTab === 'pending_grade' ? 'All student submissions have been graded.' : 'Try adjusting your search or tab filter.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '680px' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['STUDENT', 'QUIZ / COURSE', 'SUBMITTED', 'STATUS', 'SCORE', 'ACTION'].map((h, i) => (
                    <th key={h} style={{ padding: '10px 14px', fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: i === 5 ? 'center' : 'left', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => {
                  const isPending = a.status === 'pending_grade';
                  const submittedAt = a.submitted_at ? new Date(a.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

                  return (
                    <tr key={a.id} style={{ borderBottom: '1px solid #F3F4F6' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                      {/* Student */}
                      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E0F2FE', color: '#0369A1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', flexShrink: 0 }}>
                            {a.student?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: '#111827', fontSize: '13px' }}>{a.student?.name || 'Unknown'}</div>
                            <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{a.student?.email || ''}</div>
                          </div>
                        </div>
                      </td>

                      {/* Quiz / Course */}
                      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: '600', color: '#111827', fontSize: '13px' }}>{a.quizzes?.title || '—'}</div>
                        <div style={{ fontSize: '11px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <BookOpen size={10} /> {a.quizzes?.courses?.title || '—'}
                        </div>
                      </td>

                      {/* Submitted */}
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: '#6B7280', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                        {submittedAt}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                        <span style={{
                          fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', whiteSpace: 'nowrap',
                          background: isPending ? '#FEF3C7' : '#D1FAE5',
                          color: isPending ? '#D97706' : '#059669'
                        }}>
                          {isPending ? '⏳ Pending' : '✅ Graded'}
                        </span>
                      </td>

                      {/* Score */}
                      <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                        {a.score !== null && a.score !== undefined ? (
                          <div>
                            <span style={{ fontWeight: '800', fontSize: '14px', color: a.passed ? '#059669' : '#DC2626' }}>
                              {a.score}/{a.total_marks}
                            </span>
                            <span style={{ marginLeft: '6px', fontSize: '11px', color: '#9CA3AF' }}>
                              {a.passed ? '✅ Pass' : '❌ Fail'}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Not graded</span>
                        )}
                      </td>

                      {/* Action */}
                      <td style={{ padding: '12px 14px', textAlign: 'center', verticalAlign: 'middle' }}>
                        <button
                          onClick={() => openGradingModal(a)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            padding: '6px 13px', borderRadius: '7px', fontSize: '12px', fontWeight: '700',
                            cursor: 'pointer', fontFamily: 'inherit', border: 'none',
                            background: isPending ? '#FF9F1C' : '#F3F4F6',
                            color: isPending ? '#fff' : '#374151',
                            transition: 'opacity 0.15s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                          {isPending ? <><Pen size={11} /> Grade</> : <><Eye size={11} /> Review</>}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ padding: '10px 20px', borderTop: '1px solid #F3F4F6', fontSize: '12px', color: '#9CA3AF', textAlign: 'right' }}>
            Showing {filtered.length} submission{filtered.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* ── Grading Modal ── */}
      {gradingAttempt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={e => { if (e.target === e.currentTarget) setGradingAttempt(null); }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '740px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>

            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#111827', fontFamily: 'Outfit, sans-serif' }}>
                  {gradingAttempt.attempt.status === 'graded' ? '📋 Review Submission' : '✏️ Grade Submission'}
                </h2>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#6B7280' }}>
                  <strong>{gradingAttempt.student?.name}</strong> · {gradingAttempt.quiz?.title}
                </p>
              </div>
              <button onClick={() => setGradingAttempt(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', color: '#6B7280', fontSize: '20px', lineHeight: 1 }}>
                ✕
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>

              {gradeSuccess && (
                <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>
                  {gradeSuccess}
                </div>
              )}

              {/* Questions */}
              {gradingAttempt.quiz?.questions?.map((q, idx) => {
                const studentAnswer = gradingAttempt.attempt?.answers?.[q.id];
                const isSubjective = q.type === 'subjective';
                const isMultiMcq = q.type === 'mcq_multi';

                let correctAnswers = [];
                if (isMultiMcq) {
                  try { correctAnswers = JSON.parse(q.correct_answer || '[]'); } catch { correctAnswers = []; }
                }

                return (
                  <div key={q.id} style={{ marginBottom: '20px', padding: '16px', border: '1px solid #E5E7EB', borderRadius: '10px', background: '#FAFAFA' }}>
                    {/* Question Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827', flex: 1 }}>
                        <span style={{ color: '#6B7280', fontWeight: '600', marginRight: '6px' }}>Q{idx + 1}.</span>
                        {q.question_text || <em style={{ color: '#9CA3AF' }}>No question text</em>}
                      </div>
                      <span style={{ marginLeft: '12px', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', background: '#EEF2FF', color: '#4338CA', whiteSpace: 'nowrap' }}>
                        {q.marks || 1} mark{(q.marks || 1) !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* MCQ single answer */}
                    {q.type === 'mcq' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {q.options?.map((opt, optIdx) => {
                          const isCorrect = String(optIdx) === String(q.correct_answer);
                          const isStudentAnswer = String(optIdx) === String(studentAnswer);
                          return (
                            <div key={optIdx} style={{
                              padding: '8px 12px', borderRadius: '7px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px',
                              background: isCorrect ? '#D1FAE5' : isStudentAnswer ? '#FEE2E2' : '#fff',
                              border: `1px solid ${isCorrect ? '#6EE7B7' : isStudentAnswer ? '#FCA5A5' : '#E5E7EB'}`,
                            }}>
                              <span style={{ fontWeight: '700', color: '#6B7280' }}>{String.fromCharCode(65 + optIdx)}.</span>
                              <span style={{ flex: 1 }}>{opt}</span>
                              {isCorrect && <span style={{ fontSize: '10px', color: '#059669', fontWeight: '700' }}>✓ CORRECT</span>}
                              {isStudentAnswer && !isCorrect && <span style={{ fontSize: '10px', color: '#DC2626', fontWeight: '700' }}>✗ STUDENT</span>}
                              {isCorrect && isStudentAnswer && <span style={{ fontSize: '10px', color: '#059669', fontWeight: '700' }}>✓ STUDENT</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* MCQ multi answer */}
                    {isMultiMcq && (() => {
                      let studentSelected = [];
                      try { studentSelected = JSON.parse(studentAnswer || '[]'); } catch { studentSelected = []; }
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {q.options?.map((opt, optIdx) => {
                            const isCorrect = correctAnswers.includes(String(optIdx));
                            const isSelected = studentSelected.includes(String(optIdx));
                            return (
                              <div key={optIdx} style={{
                                padding: '8px 12px', borderRadius: '7px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px',
                                background: isCorrect && isSelected ? '#D1FAE5' : isSelected && !isCorrect ? '#FEE2E2' : isCorrect ? '#ECFDF5' : '#fff',
                                border: `1px solid ${isCorrect ? '#6EE7B7' : isSelected ? '#FCA5A5' : '#E5E7EB'}`,
                              }}>
                                <span style={{ fontWeight: '700', color: '#6B7280' }}>{String.fromCharCode(65 + optIdx)}.</span>
                                <span style={{ flex: 1 }}>{opt}</span>
                                {isCorrect && <span style={{ fontSize: '10px', color: '#059669', fontWeight: '700' }}>✓ KEY</span>}
                                {isSelected && <span style={{ fontSize: '10px', color: isCorrect ? '#059669' : '#DC2626', fontWeight: '700' }}>{isCorrect ? '✓ PICKED' : '✗ PICKED'}</span>}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* Subjective answer */}
                    {isSubjective && (
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#6B7280', marginBottom: '6px' }}>STUDENT'S ANSWER:</div>
                        <div style={{ padding: '12px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', color: '#374151', minHeight: '60px', whiteSpace: 'pre-wrap' }}>
                          {studentAnswer || <em style={{ color: '#9CA3AF' }}>No answer provided</em>}
                        </div>

                        {/* Marks input */}
                        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151' }}>
                            Marks Awarded:
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={q.marks || 1}
                            step="0.5"
                            value={scores[q.id] ?? ''}
                            onChange={e => setScores(p => ({ ...p, [q.id]: e.target.value }))}
                            placeholder={`0 – ${q.marks || 1}`}
                            disabled={gradingAttempt.attempt.status === 'graded'}
                            style={{ width: '80px', padding: '6px 10px', border: '1.5px solid #818CF8', borderRadius: '7px', fontSize: '13px', fontWeight: '700', textAlign: 'center', outline: 'none', background: gradingAttempt.attempt.status === 'graded' ? '#F9FAFB' : '#F5F3FF' }}
                          />
                          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>/ {q.marks || 1}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Feedback */}
              <div style={{ marginTop: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#374151', display: 'block', marginBottom: '6px' }}>
                  Overall Feedback / Comments (optional):
                </label>
                <textarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  disabled={gradingAttempt.attempt.status === 'graded'}
                  placeholder="Write feedback for the student..."
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', minHeight: '80px', resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: gradingAttempt.attempt.status === 'graded' ? '#F9FAFB' : '#fff' }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: '10px', flexShrink: 0, background: '#F9FAFB' }}>
              <button onClick={() => setGradingAttempt(null)} style={{ padding: '9px 18px', borderRadius: '8px', border: '1.5px solid #E5E7EB', background: '#fff', fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer', fontFamily: 'inherit' }}>
                Close
              </button>
              {gradingAttempt.attempt.status !== 'graded' && (
                <button
                  onClick={handleGradeSubmit}
                  disabled={saving}
                  style={{ padding: '9px 22px', borderRadius: '8px', border: 'none', background: saving ? '#9CA3AF' : '#FF9F1C', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {saving ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><CheckCircle2 size={13} /> Submit Grades</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
