'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Clock, Award, AlertCircle, HelpCircle, Check,
  ChevronRight, ChevronLeft, Loader2, CheckCircle2, XCircle, FileText
} from 'lucide-react';

export default function StudentQuizPage() {
  const { slug, quizId } = useParams();
  const router = useRouter();

  const [quiz, setQuiz] = useState(null);
  const [course, setCourse] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Playback state
  const [quizState, setQuizState] = useState('intro'); // intro, active, result
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: answerTextOrIndex }
  const [timeLeft, setTimeLeft] = useState(null);
  const [activeAttempt, setActiveAttempt] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch course info
        const courseRes = await fetch(`/api/courses/by-slug/${slug}`);
        if (!courseRes.ok) { router.push('/courses'); return; }
        const { course: fetchedCourse } = await courseRes.json();
        setCourse(fetchedCourse);

        // Fetch quiz info
        const quizRes = await fetch(`/api/admin/quizzes?id=${quizId}`);
        if (!quizRes.ok) {
          router.push(`/courses/${slug}`);
          return;
        }
        const { quiz: fetchedQuiz } = await quizRes.json();
        setQuiz(fetchedQuiz);

        // Fetch student's past attempts for this quiz
        const attemptsRes = await fetch(`/api/student/enrollments`); // Helper or simple query
        // Let's query attempts directly if we can, or write a quick endpoint.
        // Instead of writing another endpoint, we can query Supabase via a small public-ish lookup,
        // or just fetch from an attempts list. Let's make a call to check if we can select attempts.
        // Wait, does `/api/courses/[id]/enrollment-check` return attempts? No, just enrollment status.
        // Let's do a direct fetch on `/api/quizzes/${quizId}/attempts` or similar, or check if we need one.
        // Let's check attempts:
        const attRes = await fetch(`/api/lessons/${quizId}/progress`); // we can repurpose or make a quick endpoint,
        // Actually, let's fetch attempts using supabase client on the client-side,
        // or let's create a small route `/api/quizzes/[id]/attempts`! Yes, let's fetch.
        // Wait, we can fetch all attempts of the current user for this quiz.
        // Let's create `/api/quizzes/[id]/attempts` route to fetch student's past attempts!
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, quizId, router]);

  // Load past attempts
  const [attemptsLoading, setAttemptsLoading] = useState(true);
  useEffect(() => {
    const loadAttempts = async () => {
      try {
        const res = await fetch(`/api/quizzes/${quizId}/attempts`);
        if (res.ok) {
          const data = await res.json();
          setAttempts(data.attempts || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setAttemptsLoading(false);
      }
    };
    if (quizId) loadAttempts();
  }, [quizId]);

  // Timer Countdown
  useEffect(() => {
    if (quizState === 'active' && timeLeft !== null) {
      if (timeLeft <= 0) {
        handleAutoSubmit();
        return;
      }
      timerRef.current = setTimeout(() => {
        setTimeLeft(p => p - 1);
      }, 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, quizState]);

  const startQuiz = () => {
    setAnswers({});
    setCurrentQuestionIdx(0);
    setQuizState('active');
    if (quiz.time_limit_mins) {
      setTimeLeft(quiz.time_limit_mins * 60);
    } else {
      setTimeLeft(null);
    }
  };

  const handleSelectOption = (questionId, optionIdx) => {
    setAnswers(p => ({ ...p, [questionId]: String(optionIdx) }));
  };

  const handleTextChange = (questionId, text) => {
    setAnswers(p => ({ ...p, [questionId]: text }));
  };

  const handleAutoSubmit = () => {
    alert('Time has expired! Submitting your answers automatically.');
    submitQuiz();
  };

  const submitQuiz = async () => {
    clearTimeout(timerRef.current);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      if (res.ok) {
        setActiveAttempt(data.attempt);
        // Add to history
        setAttempts(p => [data.attempt, ...p]);
        setQuizState('result');
      } else {
        alert(data.error || 'Failed to submit quiz.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading || !quiz) return (
    <div style={styles.loadingWrap}>
      <Loader2 size={36} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
      <span>Loading Quiz...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const activeQuestion = quiz.questions?.[currentQuestionIdx];

  return (
    <div style={styles.container}>
      {/* Intro Screen */}
      {quizState === 'intro' && (
        <div style={styles.introCard}>
          <Link href={`/courses/${slug}/learn`} style={styles.backBtn}>
            <ArrowLeft size={14} /> Back to Course Player
          </Link>

          <h1 style={styles.title}>{quiz.title}</h1>
          <p style={styles.description}>{quiz.description || 'Test your knowledge on this module.'}</p>

          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <Clock size={18} style={{ color: '#FF9F1C' }} />
              <div>
                <div style={styles.infoHeading}>Time Limit</div>
                <div style={styles.infoVal}>{quiz.time_limit_mins ? `${quiz.time_limit_mins} minutes` : 'No limit'}</div>
              </div>
            </div>
            <div style={styles.infoItem}>
              <Award size={18} style={{ color: '#FF9F1C' }} />
              <div>
                <div style={styles.infoHeading}>Passing Score</div>
                <div style={styles.infoVal}>{quiz.pass_score_percent}% passing grade</div>
              </div>
            </div>
            <div style={styles.infoItem}>
              <HelpCircle size={18} style={{ color: '#FF9F1C' }} />
              <div>
                <div style={styles.infoHeading}>Questions</div>
                <div style={styles.infoVal}>{quiz.questions?.length || 0} questions</div>
              </div>
            </div>
            <div style={styles.infoItem}>
              <AlertCircle size={18} style={{ color: '#FF9F1C' }} />
              <div>
                <div style={styles.infoHeading}>Attempts</div>
                <div style={styles.infoVal}>
                  {attempts.length} / {quiz.max_attempts || 'unlimited'} used
                </div>
              </div>
            </div>
          </div>

          {/* Past attempts history */}
          <div style={styles.historySection}>
            <h3 style={styles.historyTitle}>Your Previous Attempts</h3>
            {attemptsLoading ? (
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', margin: '20px auto' }} />
            ) : attempts.length === 0 ? (
              <p style={styles.noAttempts}>No attempts recorded yet.</p>
            ) : (
              <div style={styles.attemptsTable}>
                {attempts.map((att, index) => (
                  <div key={att.id} style={styles.attemptRow}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={styles.attNum}>Attempt {attempts.length - index}</span>
                      <span style={styles.attDate}>{new Date(att.submitted_at).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span style={{
                        ...styles.attStatus,
                        background: att.status === 'graded' || att.status === 'auto_graded'
                          ? (att.passed ? '#D1FAE5' : '#FEE2E2')
                          : '#FEF3C7',
                        color: att.status === 'graded' || att.status === 'auto_graded'
                          ? (att.passed ? '#065F46' : '#991B1B')
                          : '#92400E'
                      }}>
                        {att.status === 'pending_grade' ? 'Pending Grade' : att.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                    <div style={styles.attScore}>
                      {att.score} / {att.total_marks} marks
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.actionBlock}>
            {quiz.max_attempts && attempts.length >= quiz.max_attempts ? (
              <button disabled style={styles.startBtnDisabled}>
                Attempts Limit Reached
              </button>
            ) : (
              <button onClick={startQuiz} style={styles.startBtn}>
                Start Quiz
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active Quiz Viewport */}
      {quizState === 'active' && activeQuestion && (
        <div style={styles.activeCard}>
          {/* Quiz timer & stats */}
          <div style={styles.quizHeader}>
            <span style={styles.questionNavProgress}>
              Question {currentQuestionIdx + 1} of {quiz.questions.length}
            </span>
            {timeLeft !== null && (
              <div style={{ ...styles.timer, background: timeLeft < 60 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.05)' }}>
                <Clock size={14} color={timeLeft < 60 ? '#EF4444' : '#FF9F1C'} />
                <span style={{ color: timeLeft < 60 ? '#EF4444' : '#fff', fontWeight: '700' }}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>

          {/* Question Text */}
          <div style={styles.questionBody}>
            <h2 style={styles.questionText}>{activeQuestion.question_text}</h2>
            <span style={styles.questionMarks}>({activeQuestion.marks || 1} mark{activeQuestion.marks !== 1 ? 's' : ''})</span>

            {/* MCQ Option Radios */}
            {activeQuestion.type === 'mcq' && (
              <div style={styles.optionsGrid}>
                {activeQuestion.options?.map((opt, optIdx) => {
                  const isSelected = answers[activeQuestion.id] === String(optIdx);
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(activeQuestion.id, optIdx)}
                      style={{
                        ...styles.optionCard,
                        borderColor: isSelected ? '#FF9F1C' : 'rgba(255,255,255,0.1)',
                        background: isSelected ? 'rgba(255,159,28,0.1)' : 'rgba(255,255,255,0.02)',
                        color: isSelected ? '#FF9F1C' : '#fff'
                      }}
                    >
                      <span style={{
                        ...styles.optionDot,
                        background: isSelected ? '#FF9F1C' : 'transparent',
                        borderColor: isSelected ? '#FF9F1C' : 'rgba(255,255,255,0.3)'
                      }} />
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Subjective Essay Box */}
            {activeQuestion.type === 'subjective' && (
              <div style={styles.subjectiveArea}>
                <label style={styles.essayLabel}>Type your response below *</label>
                <textarea
                  value={answers[activeQuestion.id] || ''}
                  onChange={(e) => handleTextChange(activeQuestion.id, e.target.value)}
                  placeholder="Provide your answer in detail..."
                  style={styles.essayTextarea}
                />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div style={styles.quizFooter}>
            <button
              onClick={() => setCurrentQuestionIdx(p => Math.max(0, p - 1))}
              disabled={currentQuestionIdx === 0}
              style={styles.navBtn}
            >
              <ChevronLeft size={16} /> Back
            </button>

            {currentQuestionIdx < quiz.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIdx(p => p + 1)}
                style={styles.nextBtn}
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={submitQuiz}
                disabled={submitting}
                style={styles.submitBtn}
              >
                {submitting ? (
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  'Submit Test'
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results Screen */}
      {quizState === 'result' && activeAttempt && (
        <div style={styles.resultCard}>
          <div style={styles.resultStatusHeader}>
            {activeAttempt.status === 'pending_grade' ? (
              <div style={styles.statusBlockPending}>
                <FileText size={48} color="#FF9F1C" style={{ marginBottom: '14px' }} />
                <h2>Attempt Submitted!</h2>
                <p>This quiz has subjective questions and is pending grading by an evaluator.</p>
              </div>
            ) : activeAttempt.passed ? (
              <div style={styles.statusBlockPass}>
                <CheckCircle2 size={48} color="#10B981" style={{ marginBottom: '14px' }} />
                <h2>Congratulations! Passed!</h2>
                <p>You have successfully passed this quiz.</p>
              </div>
            ) : (
              <div style={styles.statusBlockFail}>
                <XCircle size={48} color="#EF4444" style={{ marginBottom: '14px' }} />
                <h2>Failed</h2>
                <p>You did not reach the passing score of {quiz.pass_score_percent}% for this test.</p>
              </div>
            )}
          </div>

          {/* Scores details */}
          <div style={styles.resultsGrid}>
            <div style={styles.resultStatCard}>
              <div style={styles.statHeading}>Your Score</div>
              <div style={styles.statVal}>{activeAttempt.score} / {activeAttempt.total_marks}</div>
            </div>
            <div style={styles.resultStatCard}>
              <div style={styles.statHeading}>Percentage</div>
              <div style={styles.statVal}>
                {activeAttempt.total_marks > 0
                  ? Math.round((activeAttempt.score / activeAttempt.total_marks) * 100)
                  : 0}%
              </div>
            </div>
            <div style={styles.resultStatCard}>
              <div style={styles.statHeading}>Required Passing</div>
              <div style={styles.statVal}>{quiz.pass_score_percent}%</div>
            </div>
          </div>

          {/* Feedback */}
          {activeAttempt.evaluator_feedback && (
            <div style={styles.feedbackBlock}>
              <h4 style={styles.feedbackTitle}>Evaluator Feedback:</h4>
              <p style={styles.feedbackText}>{activeAttempt.evaluator_feedback}</p>
            </div>
          )}

          <div style={styles.resultActions}>
            <Link href={`/courses/${slug}/learn`} style={styles.finishLink}>
              Return to Syllabus player
            </Link>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#121331',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px 20px',
    fontFamily: 'Outfit, sans-serif'
  },
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#fff' },
  introCard: {
    background: '#0F1035',
    borderRadius: '16px',
    padding: '36px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.08)'
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '12px',
    textDecoration: 'none',
    marginBottom: '20px'
  },
  title: { fontSize: '26px', fontWeight: '800', marginBottom: '8px', color: '#fff' },
  description: { fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, marginBottom: '24px' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '30px' },
  infoItem: { display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '8px' },
  infoHeading: { fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: '600' },
  infoVal: { fontSize: '13px', fontWeight: '700', color: '#fff', marginTop: '2px' },
  historySection: { borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', marginBottom: '24px' },
  historyTitle: { fontSize: '14px', fontWeight: '700', color: '#FF9F1C', marginBottom: '12px' },
  noAttempts: { fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' },
  attemptsTable: { display: 'flex', flexDirection: 'column', gap: '8px' },
  attemptRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: '6px' },
  attNum: { fontSize: '12px', fontWeight: '700' },
  attDate: { fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' },
  attStatus: { fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' },
  attScore: { fontSize: '12px', fontWeight: '700' },
  actionBlock: { display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' },
  startBtn: { background: '#FF9F1C', color: '#1A1B4B', border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
  startBtnDisabled: { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: '700' },

  activeCard: {
    background: '#0F1035',
    borderRadius: '16px',
    padding: '36px',
    maxWidth: '720px',
    width: '100%',
    boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.08)'
  },
  quizHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' },
  questionNavProgress: { fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  timer: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px' },
  questionBody: { minHeight: '200px', marginBottom: '24px' },
  questionText: { fontSize: '18px', fontWeight: '700', lineHeight: 1.4, color: '#fff' },
  questionMarks: { display: 'inline-block', fontSize: '11px', color: '#FF9F1C', background: 'rgba(255,159,28,0.12)', padding: '2px 8px', borderRadius: '4px', marginTop: '6px', fontWeight: '700' },
  optionsGrid: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' },
  optionCard: { display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 18px', borderRadius: '8px', border: '1.5px solid', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', transition: 'all 0.15s' },
  optionDot: { width: '12px', height: '12px', borderRadius: '50%', border: '2px solid', display: 'inline-block' },
  subjectiveArea: { marginTop: '20px' },
  essayLabel: { display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', fontWeight: '600' },
  essayTextarea: { width: '100%', minHeight: '140px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '12px', color: '#fff', fontSize: '13px', lineHeight: 1.5, boxSizing: 'border-box', outline: 'none', resize: 'vertical' },
  quizFooter: { display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' },
  navBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '13px' },
  nextBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: '#FF9F1C', color: '#1A1B4B', border: 'none', borderRadius: '6px', padding: '8px 18px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
  submitBtn: { background: '#10B981', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 18px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },

  resultCard: {
    background: '#0F1035',
    borderRadius: '16px',
    padding: '36px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.08)',
    textAlign: 'center'
  },
  resultStatusHeader: { marginBottom: '24px' },
  statusBlockPending: { background: 'rgba(255,159,28,0.1)', border: '1px solid rgba(255,159,28,0.2)', padding: '24px', borderRadius: '12px' },
  statusBlockPass: { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '24px', borderRadius: '12px' },
  statusBlockFail: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '24px', borderRadius: '12px' },
  resultsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' },
  resultStatCard: { background: 'rgba(255,255,255,0.03)', padding: '14px 10px', borderRadius: '8px' },
  statHeading: { fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: '600' },
  statVal: { fontSize: '16px', fontWeight: '800', color: '#fff', marginTop: '4px' },
  feedbackBlock: { background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', textAlign: 'left', marginBottom: '24px' },
  feedbackTitle: { fontSize: '12px', fontWeight: '700', color: '#FF9F1C', marginBottom: '4px' },
  feedbackText: { fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 },
  resultActions: { display: 'flex', justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' },
  finishLink: { background: '#FF9F1C', color: '#1A1B4B', textDecoration: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: '700' }
};
