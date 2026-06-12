import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';

// GET /api/discussions/[lessonId]
// Get discussion messages for a specific lesson
export async function GET(req, { params }) {
  const { lessonId } = params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check enrollment/access is handled inside player, but we can verify here too if needed
  // Fetch comments
  const { data: discussions, error } = await supabase
    .from('discussions')
    .select(`
      id, lesson_id, course_id, user_id, message, parent_id, is_pinned, created_at, updated_at
    `)
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch discussions' }, { status: 500 });
  }

  // Fetch profiles for the authors
  const userIds = [...new Set(discussions.map(d => d.user_id))];
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('user_id, name, avatar_url, role')
    .in('user_id', userIds);

  const profileMap = {};
  profiles?.forEach(p => {
    profileMap[p.user_id] = p;
  });

  const discussionsWithProfiles = discussions.map(d => ({
    ...d,
    user: profileMap[d.user_id] || { name: 'Anonymous Student', role: 'student' }
  }));

  return NextResponse.json({ discussions: discussionsWithProfiles });
}

// POST /api/discussions/[lessonId]
// Post a new comment or reply
export async function POST(req, { params }) {
  const { lessonId } = params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { message, parent_id, course_id } = await req.json();
  if (!message || !message.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  // If course_id is not sent, lookup from lessons table
  let actualCourseId = course_id;
  if (!actualCourseId) {
    const { data: lesson } = await supabase
      .from('lessons')
      .select('course_id')
      .eq('id', lessonId)
      .single();
    if (lesson) {
      actualCourseId = lesson.course_id;
    }
  }

  if (!actualCourseId) {
    return NextResponse.json({ error: 'Invalid lesson or course association' }, { status: 400 });
  }

  const { data: discussion, error } = await supabase
    .from('discussions')
    .insert({
      lesson_id: lessonId,
      course_id: actualCourseId,
      user_id: session.userId,
      message: message.trim(),
      parent_id: parent_id || null,
      is_pinned: false
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to post message' }, { status: 500 });
  }

  // Get poster profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('name, avatar_url, role')
    .eq('user_id', session.userId)
    .single();

  return NextResponse.json({
    discussion: {
      ...discussion,
      user: profile || { name: 'Anonymous Student', role: 'student' }
    }
  });
}
