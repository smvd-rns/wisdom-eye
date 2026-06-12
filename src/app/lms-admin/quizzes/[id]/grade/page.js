'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, CheckCircle, XCircle, AlertCircle, Loader2,
  Save, Check, Award, FileText, User
} from 'lucide-react';

export default function AdminGradeQuizPage() {
  const { id: attemptId } = useParams(); // URL parameter is the attemptId
  const router = useRouter();

  const [attempt, setAttempt] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Grading state
  const [scores, setScores] = useState({}); // { [questionId]: marksGiven }
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const loadAttempt = async () => {
      try {
        const res = await fetch(`/api/admin/attempts?id=${attemptId}`);
        if (!res.ok) {
          router.push('/lms-admin');
          return;
        }
        const data = await res.json();
        setAttempt(data.attempt);
        setQuiz(data.quiz);
        setStudent(data.student);
        setFeedback(data.attempt.evaluator_feedback || '');

        // Populate initial scores for subjective questions if already graded
        const initialScores = {};
        data.quiz?.questions?.forEach(q => {
          if (q.type === 'subjective') {
            // If attempt is already graded, retrieve score from somewhere or set to 0
            // We can check if it's graded. If it is, the attempt.score holds total score,
            // but we might not have a breakdown in the DB (since we only store overall score in quiz_attempts).
            // Let's default it to the max marks or 0.
            initialScores[q.id] = '0';
          }
        });
        setScores(initialScores);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAttempt();
  }, [attemptId, router]);

  const handleScoreChange = (qId, val, maxMarks) => {
    // Parse to float and cap at maxMarks
    let num = parseFloat(val) || 0;
    if (num < 0) num = 0;
    if (num > maxMarks) num = maxMarks;
    setScores(p => ({ ...p, [qId]: String(num) }));
  };

  const handleSubmitGrades = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/quizzes/${attempt.quiz_id}/grade`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attempt_id: attemptId,
          scores,
          feedback
        })
      });
      if (res.ok) {
        alert('Attempt graded and finalized successfully!');
        router.push(`/lms-admin/courses/${quiz.course_id}/quizzes`);
      } else {
        alert('Failed to save grades.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <Loader2 size={32} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <button onClick={() => router.back()} style={styles.backBtn}>
            ← Back
          </button>
          <h1 style={styles.title}>Grade Student Attempt</h1>
          <p style={styles.subtitle}>{quiz?.title} (Attempt #{attempt?.attempt_number})</p>
        </div>
      </div>

      <div style={styles.container}>
        {/* Main grading form */}
        <form onSubmit={handleSubmitGrades} style={styles.gradingForm}>
          <div style={styles.questionsList}>
            {quiz?.questions?.map((q, idx) => {
              const studentAnswer = attempt.answers[q.id];
              const isMcq = q.type === 'mcq';
              const isCorrect = isMcq && String(studentAnswer) === String(q.correct_answer);

              return (
                <div key={q.id} style={styles.questionCard}>
                  <div style={styles.cardHeader}>
                    <span style={styles.qNum}>Question {idx + 1}</span>
                    <span style={styles.qMarks}>Max Marks: {q.marks || 1}</span>
                  </div>

                  <p style={styles.qText}>{q.question_text}</p>

                  {isMcq ? (
                    /* MCQ review block */
                    <div style={styles.mcqReview}>
                      <div style={styles.reviewOption}>
                        <strong>Student Response:</strong>{' '}
                        <span style={{ color: isCorrect ? '#10B981' : '#EF4444', fontWeight: '700' }}>
                          {studentAnswer !== undefined ? q.options?.[parseInt(studentAnswer)] || 'No response' : 'No response'}
                        </span>
                      </div>
                      <div style={styles.reviewOption}>
                        <strong>Correct Answer:</strong>{' '}
                        <span style={{ color: '#10B981', fontWeight: '700' }}>
                          {q.options?.[parseInt(q.correct_answer)]}
                        </span>
                      </div>
                      <div style={styles.mcqGradeBadge}>
                        {isCorrect ? (
                          <span style={styles.correctBadge}><CheckCircle size={13} /> Correct (+{q.marks} marks)</span>
                        ) : (
                          <span style={styles.incorrectBadge}><XCircle size={13} /> Incorrect (0 marks)</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Subjective response + award input */
                    <div style={styles.subjectiveReview}>
                      <div style={styles.essayBox}>
                        <h4 style={styles.essayHeading}>Student Essay Response:</h4>
                        <div style={styles.essayContent}>{studentAnswer || '(No response provided)'}</div>
                      </div>

                      <div style={styles.awardBlock}>
                        <label style={styles.awardLabel}>Award Score (out of {q.marks}):</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max={q.marks || 1}
                          required
                          value={scores[q.id] || '0'}
                          onChange={e => handleScoreChange(q.id, e.target.value, q.marks || 1)}
                          style={styles.awardInput}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Feedback & Submit */}
          <div style={styles.feedbackSection}>
            <label style={styles.label}>Evaluator Feedback for Student</label>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Write review remarks, guidance, or overall praise..."
              style={styles.textarea}
            />

            <div style={styles.actions}>
              <button type="submit" disabled={saving} style={styles.saveBtn}>
                {saving ? (
                  <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Save size={15} />
                )}
                Finalize & Submit Grade
              </button>
            </div>
          </div>
        </form>

        {/* Student metadata sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.metaCard}>
            <h3 style={styles.metaTitle}>Student Details</h3>
            <div style={styles.metaRow}>
              <User size={16} style={{ color: '#6B7280' }} />
              <div>
                <strong>Name</strong>
                <p>{student?.name}</p>
              </div>
            </div>
            <div style={styles.metaRow}>
              <FileText size={16} style={{ color: '#6B7280' }} />
              <div>
                <strong>Email</strong>
                <p>{student?.email}</p>
              </div>
            </div>
          </div>

          <div style={styles.infoCard}>
            <Award size={18} style={{ color: '#FF9F1C' }} />
            <div>
              <strong>Passing Rule</strong>
              <p>Student must score {quiz?.pass_score_percent}% or higher to pass this test.</p>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  header: { marginBottom: '24px' },
  backBtn: { background: 'none', border: 'none', color: '#6B7280', fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: 0, marginBottom: '8px' },
  title: { fontSize: '22px', fontWeight: '800', color: '#111827', fontFamily: 'Outfit, sans-serif' },
  subtitle: { fontSize: '13px', color: '#6B7280', marginTop: '2px' },
  container: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', alignItems: 'start' },
  gradingForm: { display: 'flex', flexDirection: 'column', gap: '20px' },
  questionsList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  questionCard: { background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F3F4F6', paddingBottom: '10px', marginBottom: '14px' },
  qNum: { fontSize: '13px', fontWeight: '700', color: '#111827' },
  qMarks: { fontSize: '11px', fontWeight: '700', color: '#4F46E5', background: '#EEF2FF', padding: '3px 10px', borderRadius: '9999px' },
  qText: { fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '16px', lineHeight: 1.4 },
  mcqReview: { background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' },
  reviewOption: { fontSize: '13px', color: '#374151' },
  mcqGradeBadge: { marginTop: '4px' },
  correctBadge: { display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: '#10B981', background: '#DCFCE7', padding: '3px 10px', borderRadius: '4px' },
  incorrectBadge: { display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: '#EF4444', background: '#FEE2E2', padding: '3px 10px', borderRadius: '4px' },
  subjectiveReview: { display: 'flex', flexDirection: 'column', gap: '14px' },
  essayBox: { background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px' },
  essayHeading: { fontSize: '12px', fontWeight: '700', color: '#4B5563', marginBottom: '6px' },
  essayContent: { fontSize: '13px', color: '#111827', lineHeight: 1.6, whiteSpace: 'pre-wrap' },
  awardBlock: { display: 'flex', alignItems: 'center', gap: '12px', background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: '8px', padding: '12px 16px', alignSelf: 'flex-start' },
  awardLabel: { fontSize: '13px', fontWeight: '700', color: '#4F46E5' },
  awardInput: { width: '60px', padding: '6px', border: '1.5px solid #C7D2FE', borderRadius: '6px', fontSize: '13px', textAlign: 'center', outline: 'none', fontWeight: '700', color: '#4F46E5', background: '#fff' },
  feedbackSection: { background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' },
  label: { display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' },
  textarea: { width: '100%', minHeight: '100px', padding: '12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', marginBottom: '16px', resize: 'vertical' },
  actions: { display: 'flex', justifyContent: 'flex-end' },
  saveBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' },
  sidebar: { display: 'flex', flexDirection: 'column', gap: '16px' },
  metaCard: { background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' },
  metaTitle: { fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '14px', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' },
  metaRow: { display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'flex-start' },
  infoCard: { display: 'flex', gap: '10px', background: '#FFF9DB', border: '1px solid #FFE066', borderRadius: '12px', padding: '14px', color: '#664D03', fontSize: '12px', lineHeight: 1.4 }
};
