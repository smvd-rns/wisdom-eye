'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Clock, Award, AlertCircle, HelpCircle, Check,
  ChevronRight, ChevronLeft, Loader2, CheckCircle2, XCircle, FileText
} from 'lucide-react';
import Navbar from '@/components/Navbar';

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
  const [lockModal, setLockModal] = useState(null); // { title: '', message: '' }
  const timerRef = useRef(null);

  const [radialOffset, setRadialOffset] = useState(390);

  // Trigger animation for the score circle gauge
  useEffect(() => {
    if (quizState === 'result' && activeAttempt) {
      const radius = 62;
      const circumference = 2 * Math.PI * radius;
      const percentage = activeAttempt.total_marks > 0
        ? Math.round((activeAttempt.score / activeAttempt.total_marks) * 100)
        : 0;
      const targetOffset = circumference - (percentage / 100) * circumference;
      const t = setTimeout(() => {
        setRadialOffset(targetOffset);
      }, 150);
      return () => clearTimeout(t);
    } else {
      setRadialOffset(390);
    }
  }, [quizState, activeAttempt]);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch course info
        const courseRes = await fetch(`/api/courses/by-slug/${slug}`);
        if (!courseRes.ok) { router.push('/courses'); return; }
        const { course: fetchedCourse } = await courseRes.json();
        setCourse(fetchedCourse);

        // Fetch quiz info
        const quizRes = await fetch(`/api/quizzes/${quizId}`);
        if (!quizRes.ok) {
          router.push(`/courses/${slug}`);
          return;
        }
        const { quiz: fetchedQuiz } = await quizRes.json();
        setQuiz(fetchedQuiz);

        // Fetch student's enrollment and progress
        const enrollRes = await fetch(`/api/courses/${fetchedCourse.id}/enrollment-check`);
        if (!enrollRes.ok) {
          router.push(`/courses/${slug}`);
          return;
        }
        const { enrolled, progress: progressSummary } = await enrollRes.json();
        if (!enrolled) {
          router.push(`/courses/${slug}`);
          return;
        }

        // Verify sequential progress locking
        if (fetchedCourse.is_sequential) {
          // Get all course outline items sorted sequentially
          const allFlat = [];
          if (fetchedCourse.modules) {
            fetchedCourse.modules.forEach(mod => {
              const lessons = (mod.lessons || []).map(l => ({ ...l, itemType: 'lesson' }));
              const quizzes = (mod.quizzes || []).map(q => ({ ...q, itemType: 'quiz' }));
              const combined = [...lessons, ...quizzes].sort((a, b) => {
                if (a.order_index === b.order_index) return a.itemType === 'lesson' ? -1 : 1;
                return a.order_index - b.order_index;
              });
              allFlat.push(...combined);
            });
          }

          const targetIdx = allFlat.findIndex(it => it.id === quizId);
          if (targetIdx > 0) {
            for (let i = 0; i < targetIdx; i++) {
              const prevItem = allFlat[i];
              const isPrevCompleted = prevItem.itemType === 'lesson'
                ? progressSummary?.completed_lessons_ids?.includes(prevItem.id)
                : progressSummary?.passed_quiz_ids?.includes(prevItem.id);

              if (!isPrevCompleted) {
                setLockModal({
                  title: 'Quiz Locked',
                  message: 'This quiz is locked sequentially. Redirecting you back to your syllabus outline.',
                  onClose: () => {
                    router.push(`/courses/${slug}/learn`);
                  }
                });
                return;
              }
            }
          }
        }
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
        // Update quiz state with the server's response which includes
        // correct_answer per question (only present when show_correct_answers=true)
        if (data.quiz) {
          setQuiz(prev => ({
            ...prev,
            show_correct_answers: data.quiz.show_correct_answers,
            // If server returned questions with correct_answer, use those
            // otherwise keep existing questions (no correct_answer available)
            questions: data.quiz.questions
              ? data.quiz.questions
              : prev.questions,
          }));
        }
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
    <div style={styles.container}>
      <div style={styles.loadingWrap}>
        <Loader2 size={40} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
        <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', fontWeight: '600', letterSpacing: '0.05em' }}>Loading Quiz Details...</span>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );

  const activeQuestion = quiz.questions?.[currentQuestionIdx];

  // Calculate score radial metrics
  const percentage = activeAttempt
    ? (activeAttempt.total_marks > 0
        ? Math.round((activeAttempt.score / activeAttempt.total_marks) * 100)
        : 0)
    : 0;
  const radius = 62;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="quiz-page-root" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0c0a1c', position: 'relative' }}>
      <Navbar />
      <div style={{ ...styles.container, flex: 1, minHeight: 'auto' }}>
      {/* Decorative ambient glowing backdrops */}
      <div className="ambient-glow" />
      <div className="ambient-glow-2" />

      {/* Intro Screen */}
      {quizState === 'intro' && (
        <div className="glass-card" style={styles.introCard}>
          {(() => {
            // Find next and prev items in syllabus sequence
            const allFlat = [];
            if (course?.modules) {
              course.modules.forEach(mod => {
                const lessons = (mod.lessons || []).map(l => ({ ...l, itemType: 'lesson' }));
                const quizzes = (mod.quizzes || []).map(q => ({ ...q, itemType: 'quiz' }));
                const combined = [...lessons, ...quizzes].sort((a, b) => {
                  if (a.order_index === b.order_index) return a.itemType === 'lesson' ? -1 : 1;
                  return a.order_index - b.order_index;
                });
                allFlat.push(...combined);
              });
            }

            const curIdx = allFlat.findIndex(it => it.id === quizId);
            const prevItem = curIdx > 0 ? allFlat[curIdx - 1] : null;
            const nextItem = curIdx < allFlat.length - 1 ? allFlat[curIdx + 1] : null;

            return (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {prevItem ? (
                    <Link href={prevItem.itemType === 'quiz' ? `/courses/${slug}/quiz/${prevItem.id}` : `/courses/${slug}/learn/${prevItem.id}`} className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <ChevronLeft size={14} /> Prev
                    </Link>
                  ) : (
                    <Link href={`/courses/${slug}/learn`} className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <ArrowLeft size={14} /> Back to Player
                    </Link>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {nextItem && (
                    <Link href={nextItem.itemType === 'quiz' ? `/courses/${slug}/quiz/${nextItem.id}` : `/courses/${slug}/learn/${nextItem.id}`} className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      Next <ChevronRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })()}

          <h1 style={styles.title}>{quiz.title}</h1>
          <p style={styles.description}>{quiz.description || 'Test your knowledge on this module.'}</p>

          <div className="info-grid-responsive" style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <div className="info-icon-wrapper">
                <Clock size={20} color="#FF9F1C" />
              </div>
              <div>
                <div style={styles.infoHeading}>Time Limit</div>
                <div style={styles.infoVal}>{quiz.time_limit_mins ? `${quiz.time_limit_mins} minutes` : 'No limit'}</div>
              </div>
            </div>
            <div style={styles.infoItem}>
              <div className="info-icon-wrapper">
                <Award size={20} color="#FF9F1C" />
              </div>
              <div>
                <div style={styles.infoHeading}>Passing Score</div>
                <div style={styles.infoVal}>{quiz.pass_score_percent}% passing grade</div>
              </div>
            </div>
            <div style={styles.infoItem}>
              <div className="info-icon-wrapper">
                <HelpCircle size={20} color="#FF9F1C" />
              </div>
              <div>
                <div style={styles.infoHeading}>Questions</div>
                <div style={styles.infoVal}>{quiz.questions?.length || 0} questions</div>
              </div>
            </div>
            <div style={styles.infoItem}>
              <div className="info-icon-wrapper">
                <AlertCircle size={20} color="#FF9F1C" />
              </div>
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
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#FF9F1C' }} />
              </div>
            ) : attempts.length === 0 ? (
              <p style={styles.noAttempts}>No attempts recorded yet.</p>
            ) : (
              <div style={styles.attemptsTable}>
                {attempts.map((att, index) => (
                  <div key={att.id} className="history-row">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={styles.attNum}>Attempt {attempts.length - index}</span>
                      <span style={styles.attDate}>{new Date(att.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div>
                      <span style={{
                        ...styles.attStatus,
                        background: att.status === 'graded' || att.status === 'auto_graded'
                          ? (att.passed ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)')
                          : 'rgba(245, 158, 11, 0.12)',
                        color: att.status === 'graded' || att.status === 'auto_graded'
                          ? (att.passed ? '#34D399' : '#F87171')
                          : '#FBBF24',
                        border: att.status === 'graded' || att.status === 'auto_graded'
                          ? (att.passed ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)')
                          : '1px solid rgba(245, 158, 11, 0.2)'
                      }}>
                        {att.status === 'pending_grade' ? 'Pending Grade' : att.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                    <div style={styles.attScore}>
                      <span style={{ color: '#fff', fontWeight: '800' }}>{att.score}</span>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginLeft: '2px' }}>/ {att.total_marks}</span>
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
              <button onClick={startQuiz} className="btn-primary">
                Start Quiz <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active Quiz Viewport */}
      {quizState === 'active' && activeQuestion && (
        <div className="glass-card" style={styles.activeCard}>
          {/* Progress Bar indicator */}
          <div style={styles.progressBarContainer}>
            <div style={{ 
              ...styles.progressBarFill, 
              width: `${((currentQuestionIdx + 1) / quiz.questions.length) * 100}%` 
            }} />
          </div>

          {/* Quiz timer & stats */}
          <div style={styles.quizHeader}>
            <span style={styles.questionNavProgress}>
              Question <strong style={{ color: '#fff' }}>{currentQuestionIdx + 1}</strong> of <strong style={{ color: '#fff' }}>{quiz.questions.length}</strong>
            </span>
            {timeLeft !== null && (
              <div className={`timer-pill ${timeLeft < 60 ? 'timer-danger' : ''}`}>
                <Clock size={15} />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>

          {/* Question Text */}
          <div style={styles.questionBody}>
            <h2 style={styles.questionText}>{activeQuestion.question_text}</h2>
            <span style={styles.questionMarks}>
              {activeQuestion.marks || 1} mark{activeQuestion.marks !== 1 ? 's' : ''}
            </span>

            {/* MCQ Option Radios */}
            {activeQuestion.type === 'mcq' && (
              <div style={styles.optionsGrid}>
                {activeQuestion.options?.map((opt, optIdx) => {
                  const isSelected = answers[activeQuestion.id] === String(optIdx);
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(activeQuestion.id, optIdx)}
                      className={`mcq-option ${isSelected ? 'selected' : ''}`}
                    >
                      <span className="option-dot" />
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
                  className="essay-textarea"
                />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div style={styles.quizFooter}>
            <button
              onClick={() => setCurrentQuestionIdx(p => Math.max(0, p - 1))}
              disabled={currentQuestionIdx === 0}
              className="btn-secondary"
            >
              <ChevronLeft size={16} /> Back
            </button>

            {currentQuestionIdx < quiz.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIdx(p => p + 1)}
                className="btn-primary"
                style={{ padding: '10px 24px' }}
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={submitQuiz}
                disabled={submitting}
                className="btn-success"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Submitting...
                  </>
                ) : (
                  <>Submit Test</>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results Screen */}
      {quizState === 'result' && activeAttempt && (
        <div className="glass-card" style={styles.resultCard}>
          <div style={styles.resultStatusHeader}>
            {activeAttempt.status === 'pending_grade' ? (
              <div style={styles.statusBlockPending}>
                <FileText size={56} color="#FF9F1C" style={{ marginBottom: '8px', filter: 'drop-shadow(0 0 10px rgba(255, 159, 28, 0.4))' }} />
                <h2 style={{ color: '#FF9F1C', fontSize: '26px', fontWeight: '800', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>Attempt Submitted!</h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', margin: 0 }}>This quiz has subjective questions and is pending grading by an evaluator.</p>
              </div>
            ) : activeAttempt.passed ? (
              <div style={styles.statusBlockPass}>
                <CheckCircle2 size={56} color="#10B981" style={{ marginBottom: '8px', filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.4))' }} />
                <h2 style={{ color: '#10B981', fontSize: '26px', fontWeight: '800', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>Congratulations! Passed!</h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', margin: 0 }}>You have successfully passed this quiz.</p>
              </div>
            ) : (
              <div style={styles.statusBlockFail}>
                <XCircle size={56} color="#EF4444" style={{ marginBottom: '8px', filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.4))' }} />
                <h2 style={{ color: '#EF4444', fontSize: '26px', fontWeight: '800', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>Failed</h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', margin: 0 }}>You did not reach the passing score of {quiz.pass_score_percent}% for this test.</p>
              </div>
            )}
          </div>

          {/* Circular Score Visualizer */}
          {activeAttempt.status !== 'pending_grade' && (
            <div className="score-circle-container">
              <svg width="160" height="160" className="score-circle-svg">
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="score-circle-bg"
                />
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className={activeAttempt.passed ? "score-circle-fill-pass" : "score-circle-fill-fail"}
                  strokeDasharray={circumference + 4}
                  strokeDashoffset={radialOffset}
                />
              </svg>
              <div className="score-circle-text">
                <span className="score-percentage">{percentage}%</span>
                <span className="score-label">{activeAttempt.passed ? 'PASSED' : 'FAILED'}</span>
              </div>
            </div>
          )}

          {/* Scores details */}
          <div className="info-grid-responsive" style={styles.resultsGrid}>
            <div style={styles.resultStatCard} className="stat-card">
              <div style={styles.statHeading}>Your Score</div>
              <div style={styles.statVal}>{activeAttempt.score} / {activeAttempt.total_marks}</div>
            </div>
            <div style={styles.resultStatCard} className="stat-card">
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

          {/* Student Review of Answers with Explanations */}
          {quiz.show_correct_answers && activeAttempt.status !== 'pending_grade' && quiz.questions && (
            <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#FF9F1C', marginBottom: '16px' }}>Review Questions & Explanations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {quiz.questions.map((q, idx) => {
                  const studentAns = activeAttempt.answers?.[q.id];
                  let isCorrect = false;
                  if (q.type === 'mcq') {
                    // Only correct if student actually answered AND it matches
                    isCorrect = studentAns !== undefined && studentAns !== null &&
                      String(studentAns) === String(q.correct_answer);
                  } else if (q.type === 'mcq_multi') {
                    // Only correct if student actually answered AND arrays match
                    try {
                      if (!studentAns) {
                        isCorrect = false; // Not answered = not correct
                      } else {
                        const sArr = JSON.parse(studentAns).sort();
                        const cArr = JSON.parse(q.correct_answer || '[]').sort();
                        // Both must be non-empty and equal
                        isCorrect = sArr.length > 0 && cArr.length > 0 &&
                          JSON.stringify(sArr) === JSON.stringify(cArr);
                      }
                    } catch {
                      isCorrect = false;
                    }
                  }

                  return (
                    <div key={q.id} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`, borderRadius: '12px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.4)' }}>Question {idx + 1}</span>
                        <span style={{ fontSize: '11px', color: isCorrect ? '#10B981' : '#EF4444', fontWeight: '800', background: isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', padding: '2px 8px', borderRadius: '4px' }}>
                          {isCorrect ? 'CORRECT' : 'INCORRECT'}
                        </span>
                      </div>
                      <p style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '12px', lineHeight: 1.45 }}>{q.question_text}</p>
                      
                      {q.type === 'mcq' && q.options && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                          {q.options.map((opt, oIdx) => {
                            const isSelected = String(oIdx) === String(studentAns);
                            const isCorrectOpt = String(oIdx) === String(q.correct_answer);
                            let borderCol = 'rgba(255,255,255,0.05)';
                            let bgCol = 'transparent';
                            let textCol = 'rgba(255,255,255,0.6)';
                            
                            if (isCorrectOpt) {
                              borderCol = '#10B981';
                              bgCol = 'rgba(16,185,129,0.05)';
                              textCol = '#10B981';
                            } else if (isSelected) {
                              borderCol = '#EF4444';
                              bgCol = 'rgba(239,68,68,0.05)';
                              textCol = '#EF4444';
                            }

                            return (
                              <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', border: `1.5px solid ${borderCol}`, background: bgCol, borderRadius: '8px', fontSize: '13px', color: textCol, fontWeight: isCorrectOpt || isSelected ? '700' : '500' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isCorrectOpt ? '#10B981' : isSelected ? '#EF4444' : 'rgba(255,255,255,0.2)' }} />
                                <span>{opt}</span>
                                {isCorrectOpt && <span style={{ marginLeft: 'auto', fontSize: '10px', background: 'rgba(16,185,129,0.1)', padding: '1px 6px', borderRadius: '4px' }}>Correct Option</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {q.explanation && (
                        <div style={{ background: 'rgba(255, 159, 28, 0.05)', borderLeft: '3px solid #FF9F1C', padding: '10px 14px', borderRadius: '0 8px 8px 0', fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                          <strong style={{ color: '#FF9F1C', display: 'block', marginBottom: '4px', fontSize: '12px' }}>💡 Explanation:</strong>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ ...styles.resultActions, display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={`/courses/${slug}/learn`} className="btn-secondary" style={{ textDecoration: 'none' }}>
              Return to Syllabus player
            </Link>
            {(() => {
              const allFlat = [];
              if (course?.modules) {
                course.modules.forEach(mod => {
                  const lessons = (mod.lessons || []).map(l => ({ ...l, itemType: 'lesson' }));
                  const quizzes = (mod.quizzes || []).map(q => ({ ...q, itemType: 'quiz' }));
                  const combined = [...lessons, ...quizzes].sort((a, b) => {
                    if (a.order_index === b.order_index) return a.itemType === 'lesson' ? -1 : 1;
                    return a.order_index - b.order_index;
                  });
                  allFlat.push(...combined);
                });
              }

              const curIdx = allFlat.findIndex(it => it.id === quizId);
              const nextItem = curIdx < allFlat.length - 1 ? allFlat[curIdx + 1] : null;

              if (nextItem) {
                return (
                  <Link
                    href={nextItem.itemType === 'quiz' ? `/courses/${slug}/quiz/${nextItem.id}` : `/courses/${slug}/learn/${nextItem.id}`}
                    className="btn-primary"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    Go to Next Lesson <ChevronRight size={16} />
                  </Link>
                );
              }
              return null;
            })()}
          </div>
        </div>
      )}

      {/* Sleek Alert Modal for locked quiz */}
      {lockModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '16px', padding: '24px',
            maxWidth: '380px', width: '90%', textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            animation: 'scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              backgroundColor: '#FEE2E2', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#EF4444',
              margin: '0 auto 16px'
            }}>
              🔒
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1E293B', margin: '0 0 8px 0', fontFamily: 'Outfit, sans-serif' }}>
              {lockModal.title}
            </h3>
            <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: '1.5', margin: '0 0 20px 0' }}>
              {lockModal.message}
            </p>
            <button
              onClick={() => {
                if (lockModal.onClose) {
                  lockModal.onClose();
                }
                setLockModal(null);
              }}
              style={{
                width: '100%', padding: '10px 16px', borderRadius: '10px',
                border: 'none', backgroundColor: '#1A1B4B',
                color: '#ffffff', fontSize: '13px', fontWeight: '700',
                cursor: 'pointer', transition: 'all 0.15s ease',
                fontFamily: 'Outfit, sans-serif'
              }}
              onMouseOver={e => e.target.style.backgroundColor = '#2E3072'}
              onMouseOut={e => e.target.style.backgroundColor = '#1A1B4B'}
            >
              Okay, I understand
            </button>
          </div>
        </div>
      )}
      </div>
      
      {/* Global CSS overrides for micro-interactions and ambient depth */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 900px) {
          .quiz-page-root {
            padding: 12px !important;
            padding-bottom: 120px !important;
          }
          .glass-card {
            padding: 20px 14px !important;
            margin: 0 !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          /* Adjust grid columns for info cards on mobile */
          .info-grid-responsive {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
        }
        
        .ambient-glow {
          position: absolute;
          top: -10%;
          left: 15%;
          width: 50%;
          height: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(99, 102, 241, 0.03) 60%, transparent 100%);
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }

        .ambient-glow-2 {
          position: absolute;
          bottom: -10%;
          right: 15%;
          width: 50%;
          height: 50%;
          background: radial-gradient(circle, rgba(251, 159, 28, 0.05) 0%, rgba(245, 158, 11, 0.01) 60%, transparent 100%);
          filter: blur(100px);
          pointer-events: none;
          z-index: 0;
        }

        .glass-card {
          background: rgba(15, 16, 53, 0.65) !important;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
          z-index: 1;
        }

        .info-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(255, 159, 28, 0.08);
          border: 1px solid rgba(255, 159, 28, 0.15);
          flex-shrink: 0;
        }

        .history-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 14px 20px;
          border-radius: 12px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .history-row:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateX(4px);
        }

        .mcq-option {
          position: relative;
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 16px 20px;
          border-radius: 12px;
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
          color: rgba(255, 255, 255, 0.8);
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
        }

        .mcq-option:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 159, 28, 0.4);
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        }

        .mcq-option.selected {
          background: rgba(255, 159, 28, 0.08);
          border-color: #FF9F1C;
          color: #FF9F1C;
          box-shadow: 0 0 16px rgba(255, 159, 28, 0.12);
        }

        .option-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.3);
          display: inline-block;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .mcq-option.selected .option-dot {
          background: #FF9F1C;
          border-color: #FF9F1C;
          box-shadow: 0 0 8px rgba(255, 159, 28, 0.5);
        }

        .essay-textarea {
          width: 100%;
          min-height: 150px;
          background: rgba(255, 255, 255, 0.02);
          border: 1.5px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 16px;
          color: #fff;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.6;
          box-sizing: border-box;
          outline: none;
          resize: vertical;
          transition: all 0.2s;
        }

        .essay-textarea:focus {
          background: rgba(255, 255, 255, 0.04);
          border-color: #FF9F1C;
          box-shadow: 0 0 16px rgba(255, 159, 28, 0.12);
        }

        .btn-primary {
          background: linear-gradient(135deg, #FF9F1C 0%, #EA580C 100%);
          color: #0c0a1c;
          border: none;
          border-radius: 12px;
          padding: 12px 28px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 14px rgba(255, 159, 28, 0.25);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 159, 28, 0.4);
          opacity: 0.95;
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 10px 20px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.07);
          color: #fff;
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .btn-secondary:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }

        .btn-success {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 10px 24px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-success:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }

        .btn-success:active {
          transform: translateY(0);
        }

        .timer-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 30px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #FF9F1C;
          font-weight: 700;
          font-size: 13px;
        }

        .timer-danger {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.2);
          color: #EF4444;
          animation: pulse 1s infinite alternate;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.03); }
        }

        /* Radial Progress Chart */
        .score-circle-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 32px auto;
          position: relative;
          width: 160px;
          height: 160px;
        }

        .score-circle-svg {
          transform: rotate(-90deg);
        }

        .score-circle-bg {
          fill: none;
          stroke: rgba(255, 255, 255, 0.04);
          stroke-width: 8;
        }

        .score-circle-fill-pass {
          fill: none;
          stroke: #10B981;
          stroke-width: 8;
          stroke-linecap: round;
          transition: stroke-dashoffset 1s ease-out;
          filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.4));
        }

        .score-circle-fill-fail {
          fill: none;
          stroke: #EF4444;
          stroke-width: 8;
          stroke-linecap: round;
          transition: stroke-dashoffset 1s ease-out;
          filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.4));
        }

        .score-circle-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .score-percentage {
          font-size: 30px;
          font-weight: 800;
          color: #fff;
          line-height: 1;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
        }

        .score-label {
          font-size: 9px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.45);
          font-weight: 700;
          margin-top: 4px;
          letter-spacing: 0.08em;
        }

        .stat-card {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .stat-card:hover {
          background: rgba(255, 255, 255, 0.04) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 50% 0%, #17153B 0%, #0C0A1C 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    fontFamily: 'Outfit, sans-serif',
    position: 'relative',
    overflow: 'hidden'
  },
  loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#fff', zIndex: 2 },
  introCard: {
    borderRadius: '24px',
    padding: '40px',
    maxWidth: '620px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  title: { 
    fontSize: '28px', 
    fontWeight: '800', 
    marginBottom: '12px', 
    background: 'linear-gradient(135deg, #fff 60%, #cbd5e1 100%)', 
    WebkitBackgroundClip: 'text', 
    WebkitTextFillColor: 'transparent',
    lineHeight: 1.25
  },
  description: { fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '28px' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' },
  infoItem: { display: 'flex', gap: '14px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '14px 18px', borderRadius: '14px' },
  infoHeading: { fontSize: '11px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' },
  infoVal: { fontSize: '14px', fontWeight: '800', color: '#fff', marginTop: '3px' },
  historySection: { borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px', marginBottom: '28px' },
  historyTitle: { fontSize: '15px', fontWeight: '800', color: '#FF9F1C', marginBottom: '16px', letterSpacing: '0.02em' },
  noAttempts: { fontSize: '14px', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', textAlign: 'center', padding: '16px 0' },
  attemptsTable: { display: 'flex', flexDirection: 'column', gap: '10px' },
  attNum: { fontSize: '13px', fontWeight: '700', color: '#fff' },
  attDate: { fontSize: '11px', color: 'rgba(255,255,255,0.4)' },
  attStatus: { fontSize: '9px', fontWeight: '800', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  attScore: { fontSize: '13px', fontWeight: '700' },
  actionBlock: { display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px' },
  startBtnDisabled: { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', border: 'none', borderRadius: '12px', padding: '14px 28px', fontSize: '14px', fontWeight: '700', cursor: 'not-allowed' },

  activeCard: {
    borderRadius: '24px',
    padding: '40px',
    maxWidth: '720px',
    width: '100%'
  },
  progressBarContainer: {
    width: '100%',
    height: '4px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '28px'
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #FF9F1C, #EA580C)',
    borderRadius: '2px',
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  quizHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' },
  questionNavProgress: { fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
  questionBody: { minHeight: '220px', marginBottom: '28px' },
  questionText: { fontSize: '20px', fontWeight: '800', lineHeight: 1.45, color: '#fff', marginBottom: '10px' },
  questionMarks: { display: 'inline-block', fontSize: '11px', color: '#FF9F1C', background: 'rgba(255,159,28,0.08)', border: '1px solid rgba(255,159,28,0.15)', padding: '3px 10px', borderRadius: '6px', fontWeight: '800', letterSpacing: '0.02em' },
  optionsGrid: { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' },
  subjectiveArea: { marginTop: '24px' },
  essayLabel: { display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '10px', fontWeight: '700', letterSpacing: '0.02em' },
  quizFooter: { display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px' },

  resultCard: {
    borderRadius: '24px',
    padding: '40px',
    maxWidth: '620px',
    width: '100%',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch'
  },
  resultStatusHeader: { marginBottom: '28px' },
  statusBlockPending: { background: 'rgba(255,159,28,0.05)', border: '1px solid rgba(255,159,28,0.15)', padding: '28px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  statusBlockPass: { background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', padding: '28px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  statusBlockFail: { background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', padding: '28px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  resultsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' },
  resultStatCard: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '16px 12px', borderRadius: '14px' },
  statHeading: { fontSize: '11px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' },
  statVal: { fontSize: '18px', fontWeight: '800', color: '#fff', marginTop: '6px' },
  feedbackBlock: { background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', padding: '20px', borderRadius: '14px', textAlign: 'left', marginBottom: '28px' },
  feedbackTitle: { fontSize: '13px', fontWeight: '800', color: '#FF9F1C', marginBottom: '6px', letterSpacing: '0.02em' },
  feedbackText: { fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.55 },
  resultActions: { display: 'flex', justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px' }
};
