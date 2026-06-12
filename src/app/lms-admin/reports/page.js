'use client';

import { useState, useEffect } from 'react';
import {
  Users, BarChart2, Search, Award, CheckCircle, Loader2, ArrowLeft, ExternalLink, Percent
} from 'lucide-react';

export default function AdminReportsPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Drilldown state (selected course for detailed student progress)
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [studentReports, setStudentReports] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    const fetchReportsSummary = async () => {
      try {
        const res = await fetch('/api/admin/reports');
        if (res.ok) {
          const data = await res.json();
          setCourses(data.courses || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportsSummary();
  }, []);

  const handleSelectCourse = async (course) => {
    setSelectedCourse(course);
    setLoadingDetails(true);
    setStudentReports([]);
    try {
      const res = await fetch(`/api/admin/reports?course_id=${course.id}`);
      if (res.ok) {
        const data = await res.json();
        setStudentReports(data.report || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  const filteredStudents = studentReports.filter(s =>
    s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <Loader2 size={32} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div>
      {/* Detail overlay / view */}
      {selectedCourse ? (
        <div>
          {/* Back Header */}
          <div style={styles.header}>
            <div>
              <button onClick={() => setSelectedCourse(null)} style={styles.backBtn}>
                <ArrowLeft size={14} /> Back to Courses Report
              </button>
              <h1 style={styles.title}>{selectedCourse.title}</h1>
              <p style={styles.subtitle}>Detailed student progress & completions list</p>
            </div>
          </div>

          {/* Detailed stats cards */}
          <div style={styles.detailsStatsRow}>
            <div style={styles.detailStatCard}>
              <Users size={18} color="#FF9F1C" />
              <div>
                <span style={styles.detailStatLabel}>Enrolled Learners</span>
                <span style={styles.detailStatVal}>{selectedCourse.enrolled_count}</span>
              </div>
            </div>
            <div style={styles.detailStatCard}>
              <CheckCircle size={18} color="#10B981" />
              <div>
                <span style={styles.detailStatLabel}>Completions</span>
                <span style={styles.detailStatVal}>{selectedCourse.completed_count}</span>
              </div>
            </div>
            <div style={styles.detailStatCard}>
              <Award size={18} color="#3B82F6" />
              <div>
                <span style={styles.detailStatLabel}>Certificates Issued</span>
                <span style={styles.detailStatVal}>{selectedCourse.certs_issued_count}</span>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div style={styles.actionBar}>
            <div style={styles.searchWrap}>
              <Search size={16} style={styles.searchIcon} />
              <input
                type="text" value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                placeholder="Search student by name or email..."
                style={styles.searchInput}
              />
            </div>
            <div style={styles.countText}>{filteredStudents.length} students found</div>
          </div>

          {/* Students progress table */}
          {loadingDetails ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <Loader2 size={24} style={{ color: '#FF9F1C', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div style={styles.emptyState}>
              <Users size={48} style={{ color: '#D1D5DB', marginBottom: '16px' }} />
              <h3>No Students Enrolled Yet</h3>
              <p>Once users enroll, their lesson-by-lesson progress will appear here.</p>
            </div>
          ) : (
            <div style={styles.tableCard}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Student Info</th>
                    <th style={styles.th}>Enrollment Date</th>
                    <th style={styles.th}>Lessons Completed</th>
                    <th style={styles.th}>Progress %</th>
                    <th style={styles.th}>Certificate Status</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => {
                    const progress = student.progress;
                    const percent = Math.round(progress?.percent_complete || 0);
                    return (
                      <tr key={student.user_id} style={styles.tr}>
                        <td style={styles.td}>
                          <div style={styles.studentName}>{student.name}</div>
                          <div style={styles.studentEmail}>{student.email}</div>
                        </td>
                        <td style={styles.td}>
                          <span>{new Date(student.enrolled_at).toLocaleDateString()}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.lessonsCountText}>
                            {progress?.lessons_completed || 0} / {progress?.total_lessons || 0}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.progressCell}>
                            <span style={styles.percentText}>{percent}%</span>
                            <div style={styles.miniBarBg}>
                              <div style={{ ...styles.miniBarFill, width: `${percent}%` }} />
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}>
                          {progress?.certificate_issued ? (
                            <span style={styles.certIssuedBadge}>✓ Issued</span>
                          ) : (
                            <span style={styles.certNoneBadge}>Not Issued</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            background: percent >= 100 ? '#D1FAE5' : '#F3F4F6',
                            color: percent >= 100 ? '#065F46' : '#4B5563'
                          }}>
                            {percent >= 100 ? 'COMPLETED' : 'IN_PROGRESS'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Summary view for all courses */
        <div>
          {/* Header */}
          <div style={styles.header}>
            <div>
              <h1 style={styles.title}>LMS Reports & Analytics</h1>
              <p style={styles.subtitle}>Check course enrollment counts, average class completion rates, and certifications.</p>
            </div>
          </div>

          {/* Action Bar */}
          <div style={styles.actionBar}>
            <div style={styles.searchWrap}>
              <Search size={16} style={styles.searchIcon} />
              <input
                type="text" value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search courses..."
                style={styles.searchInput}
              />
            </div>
            <div style={styles.countText}>{filteredCourses.length} courses tracked</div>
          </div>

          {/* Courses summary cards */}
          {filteredCourses.length === 0 ? (
            <div style={styles.emptyState}>
              <BarChart2 size={48} style={{ color: '#D1D5DB', marginBottom: '16px' }} />
              <h3>No Reports Data Found</h3>
            </div>
          ) : (
            <div style={styles.tableCard}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Course Title</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Total Enrolled</th>
                    <th style={styles.th}>Class Avg Progress</th>
                    <th style={styles.th}>Completions</th>
                    <th style={styles.th}>Certificates</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((c) => (
                    <tr key={c.id} style={styles.tr}>
                      <td style={styles.td}>
                        <span style={styles.cTitle}>{c.title}</span>
                        <span style={{
                          ...styles.statusDotLabel,
                          color: c.status === 'published' ? '#10B981' : '#9CA3AF'
                        }}>
                          • {c.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span>{c.category}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.statsCountCell}>
                          <Users size={12} style={{ color: '#6B7280' }} />
                          <span>{c.enrolled_count}</span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.progressCell}>
                          <span style={styles.percentText}>{c.avg_completion}%</span>
                          <div style={styles.miniBarBg}>
                            <div style={{ ...styles.miniBarFill, width: `${c.avg_completion}%` }} />
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.completionsCountText}>{c.completed_count} students</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.completionsCountText}>{c.certs_issued_count} issued</span>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <button onClick={() => handleSelectCourse(c)} style={styles.drillBtn}>
                          Detail View <ExternalLink size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  header: { marginBottom: '24px' },
  backBtn: { background: 'none', border: 'none', color: '#6B7280', fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' },
  title: { fontSize: '22px', fontWeight: '800', color: '#1A1B4B', fontFamily: 'Outfit, sans-serif' },
  subtitle: { fontSize: '13px', color: '#6B7280', marginTop: '2px' },
  detailsStatsRow: { display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
  detailStatCard: { background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.03)', minWidth: '180px' },
  detailStatLabel: { display: 'block', fontSize: '10px', color: '#6B7280', textTransform: 'uppercase', fontWeight: '600' },
  detailStatVal: { display: 'block', fontSize: '20px', fontWeight: '800', color: '#1A1B4B', marginTop: '3px', fontFamily: 'Outfit, sans-serif' },
  actionBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' },
  searchWrap: { position: 'relative', maxWidth: '360px', width: '100%' },
  searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' },
  searchInput: { width: '100%', padding: '9px 12px 9px 36px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' },
  countText: { fontSize: '13px', color: '#6B7280' },
  emptyState: { textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: '12px', border: '1.5px dashed #D1D5DB' },
  tableCard: { background: '#fff', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  thRow: { background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' },
  th: { padding: '12px 18px', fontSize: '12px', fontWeight: '700', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr: { borderBottom: '1px solid #F3F4F6' },
  td: { padding: '14px 18px', fontSize: '13px', color: '#374151', verticalAlign: 'middle' },
  studentName: { fontWeight: '700', color: '#111827' },
  studentEmail: { fontSize: '11px', color: '#6B7280', marginTop: '2px' },
  cTitle: { fontWeight: '700', color: '#1A1B4B', display: 'block' },
  statusDotLabel: { fontSize: '10px', fontWeight: '800', display: 'block', marginTop: '3px' },
  statsCountCell: { display: 'flex', alignItems: 'center', gap: '6px' },
  progressCell: { display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '120px' },
  percentText: { fontSize: '12px', fontWeight: '700', color: '#111827' },
  miniBarBg: { height: '4px', background: '#E5E7EB', borderRadius: '2px', overflow: 'hidden' },
  miniBarFill: { height: '100%', background: '#FF9F1C', borderRadius: '2px' },
  completionsCountText: { fontWeight: '500', color: '#4B5563' },
  lessonsCountText: { fontWeight: '600', color: '#374151' },
  certIssuedBadge: { fontSize: '11px', fontWeight: '700', color: '#10B981', background: '#DCFCE7', padding: '2px 8px', borderRadius: '4px' },
  certNoneBadge: { fontSize: '11px', color: '#9CA3AF' },
  statusBadge: { fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '9999px', display: 'inline-block' },
  drillBtn: { display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#FF9F1C', fontWeight: '700', fontSize: '12px', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }
};
