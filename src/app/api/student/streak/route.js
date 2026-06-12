import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';

// POST /api/student/streak
// Updates the student's daily active learning streak
export async function POST(req) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Fetch current profile streak details
  const { data: profile, error: fetchError } = await supabase
    .from('user_profiles')
    .select('current_streak, last_active_date')
    .eq('user_id', session.userId)
    .single();

  if (fetchError || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // Calculate local date strings
  const todayStr = new Date().toISOString().split('T')[0];
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const lastActiveStr = profile.last_active_date || null;
  let newStreak = parseInt(profile.current_streak) || 0;
  let didUpdate = false;

  if (lastActiveStr === todayStr) {
    // Already active today, do nothing
    didUpdate = false;
  } else if (lastActiveStr === yesterdayStr) {
    // Consecutive day! Increment streak
    newStreak += 1;
    didUpdate = true;
  } else {
    // Break in streak, reset to 1
    newStreak = 1;
    didUpdate = true;
  }

  if (didUpdate) {
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        current_streak: newStreak,
        last_active_date: todayStr
      })
      .eq('user_id', session.userId);

    if (updateError) {
      console.error('Streak update error:', updateError);
      return NextResponse.json({ error: 'Failed to update streak' }, { status: 500 });
    }
  }

  return NextResponse.json({
    success: true,
    current_streak: newStreak,
    last_active_date: todayStr,
    streak_maintained: !didUpdate && lastActiveStr === todayStr
  });
}
