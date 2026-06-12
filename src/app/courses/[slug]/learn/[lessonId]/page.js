'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, CheckCircle, Circle, Play, FileText, ChevronRight,
  ChevronLeft, MessageSquare, BookOpen, Clock, Loader2, Send, CornerDownRight, Award
} from 'lucide-react';

export default function StudentPlayerPage() {
  const { slug, lessonId } = useParams();
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [lessonProgress, setLessonProgress] = useState({ completed: false, watch_seconds: 0 });
  const [progressSummary, setProgressSummary] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [newReply, setNewReply] = useState('');

  const [loading, setLoading] = useState(true);
  const [lessonLoading, setLessonLoading] = useState(true);
  const [savingProgress, setSavingProgress] = useState(false);
  const [postingComment, setPostingComment] = useState(false);

  // Active tab: 'about' or 'discussion'
  const [activeTab, setActiveTab] = useState('about');

  // Load Course Outline & Enrollment Check
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const courseRes = await fetch(`/api/courses/by-slug/${slug}`);
        if (!courseRes.ok) {
          router.push('/courses');
          return;
        }
        const { course: fetchedCourse } = await courseRes.json();

        // Check enrollment
        const enrollRes = await fetch(`/api/courses/${fetchedCourse.id}/enrollment-check`);
        if (!enrollRes.ok) {
          router.push(`/courses/${slug}`);
          return;
        }
        const { enrolled, progress } = await enrollRes.json();
        if (!enrolled) {
          router.push(`/courses/${slug}`);
          return;
        }

        setCourse(fetchedCourse);
        setProgressSummary(progress);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    checkAccess();
  }, [slug, router]);

  // Load Lesson Details & Discussions when lessonId changes
  useEffect(() => {
    if (!lessonId) return;

    const loadLesson = async () => {
      setLessonLoading(true);
      try {
        const res = await fetch(`/api/lessons/${lessonId}`);
        if (!res.ok) {
          setLessonLoading(false);
          return;
        }
        const { lesson, progress } = await res.json();
        setActiveLesson(lesson);
        setLessonProgress(progress || { completed: false, watch_seconds: 0 });

        // Load discussions
        const commentsRes = await fetch(`/api/discussions/${lessonId}`);
        if (commentsRes.ok) {
          const { discussions } = await commentsRes.json();
          setComments(discussions || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLessonLoading(false);
      }
    };

    loadLesson();
  }, [lessonId]);

  // Helper: Find next/previous lesson
  const getFlatLessons = () => {
    if (!course?.modules) return [];
    return course.modules.reduce((list, mod) => {
      if (mod.lessons) {
        const sorted = [...mod.lessons].sort((a, b) => a.order_index - b.order_index);
        return [...list, ...sorted];
      }
      return list;
    }, []);
  };

  const getNavigation = () => {
    const lessons = getFlatLessons();
    const idx = lessons.findIndex(l => l.id === lessonId);
    return {
      prev: idx > 0 ? lessons[idx - 1] : null,
      next: idx < lessons.length - 1 ? lessons[idx + 1] : null,
      currentIdx: idx,
      total: lessons.length
    };
  };

  const handleMarkComplete = async () => {
    if (!activeLesson) return;
    setSavingProgress(true);
    try {
      const res = await fetch(`/api/lessons/${activeLesson.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed: true,
          watch_seconds: lessonProgress.watch_seconds
        })
      });
      const data = await res.json();
      if (res.ok) {
        setLessonProgress(p => ({ ...p, completed: true }));
        // Update enrollment check status
        const enrollRes = await fetch(`/api/courses/${course.id}/enrollment-check`);
        if (enrollRes.ok) {
          const { progress } = await enrollRes.json();
          setProgressSummary(progress);
        }

        // Auto-navigate to next lesson
        const { next } = getNavigation();
        if (next) {
          router.push(`/courses/${slug}/learn/${next.id}`);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProgress(false);
    }
  };

  const handlePostComment = async (e, parentId = null) => {
    e.preventDefault();
    const text = parentId ? newReply : newComment;
    if (!text.trim()) return;

    setPostingComment(true);
    try {
      const res = await fetch(`/api/discussions/${lessonId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          parent_id: parentId,
          course_id: course.id
        })
      });
      const data = await res.json();
      if (res.ok) {
        setComments(p => [...p, data.discussion]);
        if (parentId) {
          setNewReply('');
          setReplyingTo(null);
        } else {
          setNewComment('');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPostingComment(false);
    }
  };

  // Helper: YouTube URL parser
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return '';
    let videoId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0` : '';
  };

  // Helper: Google Drive link parser
  const getGoogleDriveEmbedUrl = (url) => {
    if (!url) return '';
    // If it's already an embed link
    if (url.includes('/preview')) return url;
    // Replace view/edit links with preview
    return url.replace(/\/view(\?.*)?$/, '/preview').replace(/\/edit(\?.*)?$/, '/preview');
  };

  if (loading) return (
    <div style={styles.loadingWrap}>
      <Loader2 size={36} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
      <span>Loading course...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const nav = getNavigation();
  const flatLessons = getFlatLessons();

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <div style={{ ...styles.sidebar, display: sidebarOpen ? 'flex' : 'none' }}>
        <div style={styles.sidebarHeader}>
          <Link href="/dashboard" style={styles.backLink}>
            <ArrowLeft size={14} /> Student Dashboard
          </Link>
          <h2 style={styles.sidebarCourseTitle}>{course?.title}</h2>

          {/* Progress bar */}
          {progressSummary && (
            <div style={styles.progressSection}>
              <div style={styles.progressLabel}>
                <span>Your Progress</span>
                <span>{Math.round(progressSummary.percent_complete)}%</span>
              </div>
              <div style={styles.progressBarBg}>
                <div style={{ ...styles.progressBarFill, width: `${progressSummary.percent_complete}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Modules & Lessons accordion */}
        <div style={styles.outlineScroll}>
          {course?.modules?.map((mod, mi) => (
            <div key={mod.id} style={styles.sidebarModule}>
              <div style={styles.moduleTitle}>
                Module {mi + 1}: {mod.title}
              </div>
              <div style={styles.sidebarLessons}>
                {mod.lessons?.map((les) => {
                  const isActive = les.id === lessonId;
                  // Check if completed (need to track from completion checklist or state)
                  const isCompleted = progressSummary?.completed_lessons_ids?.includes(les.id) || 
                                      (les.id === lessonId && lessonProgress.completed);

                  return (
                    <Link
                      key={les.id}
                      href={`/courses/${slug}/learn/${les.id}`}
                      style={{
                        ...styles.lessonItem,
                        ...(isActive ? styles.lessonItemActive : {})
                      }}
                    >
                      <span style={{ marginRight: '8px', flexShrink: 0 }}>
                        {isCompleted ? (
                          <CheckCircle size={15} color="#10B981" />
                        ) : (
                          <Circle size={15} color="#9CA3AF" />
                        )}
                      </span>
                      <span style={styles.lessonTitleText}>{les.title}</span>
                      <span style={styles.lessonTypeIcon}>
                        {les.type === 'youtube' ? '▶️' : les.type === 'gdrive' ? '📄' : '📝'}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Certificate section */}
        {course?.has_certificate && progressSummary?.percent_complete >= 100 && (
          <div style={styles.certificateCard}>
            <Award size={24} color="#FF9F1C" />
            <div>
              <div style={styles.certHeading}>Certificate Earned!</div>
              <Link href="/certificates" style={styles.certLink}>
                View Certificate <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Main player workspace */}
      <div style={styles.workspace}>
        {/* Top bar */}
        <div style={styles.topBar}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={styles.toggleSidebarBtn}>
            {sidebarOpen ? 'Hide Syllabus' : 'Show Syllabus'}
          </button>

          <div style={styles.topActions}>
            <button
              onClick={() => nav.prev && router.push(`/courses/${slug}/learn/${nav.prev.id}`)}
              disabled={!nav.prev}
              style={styles.navBtn}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <button
              onClick={handleMarkComplete}
              disabled={savingProgress || !activeLesson}
              style={{
                ...styles.navBtn,
                background: lessonProgress.completed ? '#10B981' : '#FF9F1C',
                color: lessonProgress.completed ? '#fff' : '#1A1B4B',
                fontWeight: '700'
              }}
            >
              {savingProgress ? (
                <Loader2 size={16} style={{ animation: 'spin 1s linear' }} />
              ) : lessonProgress.completed ? (
                'Completed ✓'
              ) : (
                'Mark Completed & Next'
              )}
            </button>
          </div>
        </div>

        {/* Player viewport */}
        <div style={styles.playerArea}>
          {lessonLoading ? (
            <div style={styles.lessonLoadingWrap}>
              <Loader2 size={32} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : activeLesson ? (
            <div style={styles.playerContent}>
              {/* Media viewer */}
              <div style={styles.mediaContainer}>
                {activeLesson.type === 'youtube' && (
                  <iframe
                    src={getYoutubeEmbedUrl(activeLesson.content_url)}
                    style={styles.videoIFrame}
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                )}

                {activeLesson.type === 'gdrive' && (
                  <iframe
                    src={getGoogleDriveEmbedUrl(activeLesson.content_url)}
                    style={styles.driveIFrame}
                    allow="autoplay"
                  />
                )}

                {activeLesson.type === 'text' && (
                  <div style={styles.textContent}>
                    <h2 style={styles.textLessonTitle}>{activeLesson.title}</h2>
                    <div style={styles.richTextBody}>
                      {activeLesson.content_text ? (
                        activeLesson.content_text.split('\n').map((paragraph, pi) => (
                          <p key={pi} style={{ marginBottom: '14px', lineHeight: 1.6 }}>{paragraph}</p>
                        ))
                      ) : (
                        <p style={{ color: '#9CA3AF', fontStyle: 'italic' }}>No text content available.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Info tabs */}
              <div style={styles.tabsContainer}>
                <div style={styles.tabHeaders}>
                  <button
                    onClick={() => setActiveTab('about')}
                    style={{ ...styles.tabBtn, ...(activeTab === 'about' ? styles.tabBtnActive : {}) }}
                  >
                    <BookOpen size={14} /> Lesson Details
                  </button>
                  <button
                    onClick={() => setActiveTab('discussion')}
                    style={{ ...styles.tabBtn, ...(activeTab === 'discussion' ? styles.tabBtnActive : {}) }}
                  >
                    <MessageSquare size={14} /> Q&A Discussion ({comments.length})
                  </button>
                </div>

                <div style={styles.tabContent}>
                  {activeTab === 'about' && (
                    <div style={styles.aboutTab}>
                      <h3 style={styles.lessonInfoTitle}>{activeLesson.title}</h3>
                      <div style={styles.metaRow}>
                        {activeLesson.duration_seconds > 0 && (
                          <span style={styles.metaBadge}><Clock size={12} /> {Math.ceil(activeLesson.duration_seconds / 60)} mins</span>
                        )}
                        <span style={{ ...styles.metaBadge, background: '#EEF2FF', color: '#4F46E5' }}>
                          Type: {activeLesson.type.toUpperCase()}
                        </span>
                      </div>
                      <p style={styles.lessonDescription}>{activeLesson.description || 'No description provided.'}</p>
                    </div>
                  )}

                  {activeTab === 'discussion' && (
                    <div style={styles.discussionTab}>
                      {/* Comment Input */}
                      <form onSubmit={(e) => handlePostComment(e)} style={styles.commentForm}>
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Ask a question or share a thought about this lesson..."
                          style={styles.commentInput}
                        />
                        <button type="submit" disabled={postingComment || !newComment.trim()} style={styles.postBtn}>
                          <Send size={14} />
                        </button>
                      </form>

                      {/* Comments List */}
                      <div style={styles.commentsList}>
                        {comments.filter(c => !c.parent_id).length === 0 ? (
                          <div style={styles.noComments}>No discussions yet. Be the first to ask!</div>
                        ) : (
                          comments.filter(c => !c.parent_id).map((parent) => (
                            <div key={parent.id} style={styles.commentCard}>
                              <div style={styles.commentHeader}>
                                <div style={styles.commentAuthor}>
                                  <div style={styles.avatarPlaceholder}>
                                    {parent.user?.name ? parent.user.name[0].toUpperCase() : 'S'}
                                  </div>
                                  <div>
                                    <div style={styles.commentName}>
                                      {parent.user?.name}
                                      {parent.user?.role !== 'student' && <span style={styles.roleBadge}>{parent.user?.role}</span>}
                                    </div>
                                    <div style={styles.commentTime}>{new Date(parent.created_at).toLocaleDateString()}</div>
                                  </div>
                                </div>
                                <button onClick={() => setReplyingTo(parent.id)} style={styles.replyLink}>
                                  Reply
                                </button>
                              </div>

                              <div style={styles.commentMessage}>{parent.message}</div>

                              {/* Replies */}
                              <div style={styles.repliesBlock}>
                                {comments.filter(r => r.parent_id === parent.id).map((reply) => (
                                  <div key={reply.id} style={styles.replyCard}>
                                    <CornerDownRight size={14} style={{ color: '#D1D5DB', marginTop: '4px' }} />
                                    <div style={{ flex: 1 }}>
                                      <div style={styles.commentHeader}>
                                        <div style={styles.commentAuthor}>
                                          <div style={styles.avatarPlaceholderSm}>
                                            {reply.user?.name ? reply.user.name[0].toUpperCase() : 'S'}
                                          </div>
                                          <div>
                                            <div style={styles.commentName}>
                                              {reply.user?.name}
                                              {reply.user?.role !== 'student' && <span style={styles.roleBadge}>{reply.user?.role}</span>}
                                            </div>
                                            <div style={styles.commentTime}>{new Date(reply.created_at).toLocaleDateString()}</div>
                                          </div>
                                        </div>
                                      </div>
                                      <div style={styles.replyMessage}>{reply.message}</div>
                                    </div>
                                  </div>
                                ))}

                                {/* Reply Input */}
                                {replyingTo === parent.id && (
                                  <form onSubmit={(e) => handlePostComment(e, parent.id)} style={styles.replyForm}>
                                    <input
                                      type="text"
                                      value={newReply}
                                      onChange={(e) => setNewReply(e.target.value)}
                                      placeholder="Write a reply..."
                                      style={styles.replyInput}
                                      autoFocus
                                    />
                                    <button type="submit" disabled={postingComment || !newReply.trim()} style={styles.replySubmitBtn}>
                                      Reply
                                    </button>
                                    <button type="button" onClick={() => setReplyingTo(null)} style={styles.replyCancelBtn}>
                                      Cancel
                                    </button>
                                  </form>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.emptyWrap}>
              <h3>Select a lesson from the outline to get started.</h3>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    background: '#1A1B4B',
    color: '#fff',
    fontFamily: 'Outfit, sans-serif'
  },
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#1A1B4B',
    color: '#fff',
    gap: '12px'
  },
  sidebar: {
    width: '320px',
    background: '#0F1035',
    borderRight: '1px solid rgba(255,255,255,0.08)',
    flexDirection: 'column',
    flexShrink: 0
  },
  sidebarHeader: {
    padding: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.08)'
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '12px',
    textDecoration: 'none',
    marginBottom: '14px'
  },
  sidebarCourseTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#fff',
    lineHeight: 1.4,
    marginBottom: '16px'
  },
  progressSection: {
    marginTop: '10px'
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: '6px',
    fontWeight: '600'
  },
  progressBarBg: {
    height: '6px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    background: '#FF9F1C',
    borderRadius: '3px',
    transition: 'width 0.3s ease'
  },
  outlineScroll: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 0'
  },
  sidebarModule: {
    marginBottom: '16px'
  },
  moduleTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#FF9F1C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '8px 20px',
    background: 'rgba(255,255,255,0.02)'
  },
  sidebarLessons: {
    display: 'flex',
    flexDirection: 'column'
  },
  lessonItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 20px',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    transition: 'background 0.2s',
    borderLeft: '3px solid transparent'
  },
  lessonItemActive: {
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    borderLeftColor: '#FF9F1C'
  },
  lessonTitleText: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  lessonTypeIcon: {
    fontSize: '12px',
    opacity: 0.6,
    marginLeft: '6px'
  },
  certificateCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    margin: '16px',
    background: 'rgba(255,159,28,0.1)',
    borderRadius: '10px',
    border: '1px solid rgba(255,159,28,0.2)'
  },
  certHeading: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#FF9F1C'
  },
  certLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '600',
    textDecoration: 'none',
    marginTop: '3px'
  },
  workspace: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: '#121331'
  },
  topBar: {
    height: '60px',
    padding: '0 24px',
    background: '#0F1035',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0
  },
  toggleSidebarBtn: {
    background: 'rgba(255,255,255,0.08)',
    border: 'none',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  topActions: {
    display: 'flex',
    gap: '10px'
  },
  navBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '6px',
    background: 'rgba(255,255,255,0.08)',
    border: 'none',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit'
  },
  playerArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '30px'
  },
  lessonLoadingWrap: {
    display: 'flex',
    justifyContent: 'center',
    padding: '100px 0'
  },
  playerContent: {
    maxWidth: '960px',
    margin: '0 auto'
  },
  mediaContainer: {
    background: '#000',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
    aspectRatio: '16/9',
    position: 'relative',
    marginBottom: '24px'
  },
  videoIFrame: {
    width: '100%',
    height: '100%',
    border: 'none'
  },
  driveIFrame: {
    width: '100%',
    height: '100%',
    border: 'none',
    background: '#fff'
  },
  textContent: {
    padding: '40px',
    background: '#fff',
    color: '#1A1B4B',
    height: '100%',
    overflowY: 'auto',
    boxSizing: 'border-box'
  },
  textLessonTitle: {
    fontSize: '24px',
    fontWeight: '800',
    marginBottom: '20px',
    color: '#1A1B4B'
  },
  richTextBody: {
    fontSize: '15px',
    color: '#374151',
    lineHeight: 1.7
  },
  tabsContainer: {
    background: '#0F1035',
    borderRadius: '14px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.08)'
  },
  tabHeaders: {
    display: 'flex',
    background: 'rgba(0,0,0,0.2)',
    borderBottom: '1px solid rgba(255,255,255,0.08)'
  },
  tabBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px',
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    borderBottom: '2.5px solid transparent',
    transition: 'all 0.2s',
    fontFamily: 'inherit'
  },
  tabBtnActive: {
    color: '#FF9F1C',
    borderBottomColor: '#FF9F1C',
    background: 'rgba(255,255,255,0.02)'
  },
  tabContent: {
    padding: '24px'
  },
  aboutTab: {
    color: 'rgba(255,255,255,0.8)'
  },
  lessonInfoTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '10px'
  },
  metaRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px'
  },
  metaBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '4px',
    background: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.7)'
  },
  lessonDescription: {
    fontSize: '14px',
    lineHeight: 1.6,
    color: 'rgba(255,255,255,0.7)'
  },
  discussionTab: {},
  commentForm: {
    display: 'flex',
    gap: '10px',
    marginBottom: '24px'
  },
  commentInput: {
    flex: 1,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#fff',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'inherit'
  },
  postBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    background: '#FF9F1C',
    color: '#1A1B4B',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  commentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  noComments: {
    textAlign: 'center',
    padding: '30px 0',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '13px',
    fontStyle: 'italic'
  },
  commentCard: {
    padding: '16px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)'
  },
  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px'
  },
  commentAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  avatarPlaceholder: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#FF9F1C',
    color: '#1A1B4B',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '13px'
  },
  avatarPlaceholderSm: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#FF9F1C',
    color: '#1A1B4B',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '11px'
  },
  commentName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  roleBadge: {
    fontSize: '9px',
    fontWeight: '800',
    textTransform: 'uppercase',
    background: 'rgba(255,159,28,0.15)',
    color: '#FF9F1C',
    padding: '1px 6px',
    borderRadius: '4px',
    letterSpacing: '0.5px'
  },
  commentTime: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.4)',
    marginTop: '1px'
  },
  replyLink: {
    background: 'none',
    border: 'none',
    color: '#FF9F1C',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  commentMessage: {
    fontSize: '13px',
    lineHeight: 1.5,
    color: 'rgba(255,255,255,0.85)',
    paddingLeft: '42px'
  },
  repliesBlock: {
    paddingLeft: '42px',
    marginTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  replyCard: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
    background: 'rgba(255,255,255,0.01)',
    padding: '8px 10px',
    borderRadius: '6px'
  },
  replyMessage: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.8)',
    marginTop: '4px',
    paddingLeft: '34px'
  },
  replyForm: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px'
  },
  replyInput: {
    flex: 1,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '6px',
    padding: '8px 12px',
    color: '#fff',
    fontSize: '12px',
    outline: 'none',
    fontFamily: 'inherit'
  },
  replySubmitBtn: {
    background: '#FF9F1C',
    color: '#1A1B4B',
    border: 'none',
    borderRadius: '6px',
    padding: '0 12px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  replyCancelBtn: {
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0 12px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  emptyWrap: {
    textAlign: 'center',
    padding: '80px 0',
    color: 'rgba(255,255,255,0.4)'
  }
};
