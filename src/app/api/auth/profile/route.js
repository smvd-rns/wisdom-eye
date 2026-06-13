import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession, createSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';

export async function PUT(req) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please log in again.' }, { status: 401 });
    }

    const { name, phone, currentPassword, newPassword } = await req.json();

    // 1. Fetch current user from DB to verify existence and get the password hash
    const { data: user, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', session.userId)
      .single();

    if (fetchError || !user) {
      console.error('Fetch user error in profile update:', fetchError);
      return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
    }

    const updateData = {};

    // 2. Handle profile detail updates (Name and Phone)
    if (name !== undefined) {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return NextResponse.json({ error: 'Name cannot be empty.' }, { status: 400 });
      }
      updateData.name = trimmedName;
    }

    if (phone !== undefined) {
      updateData.phone = phone.trim() || null;
    }

    // 3. Handle password change request
    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ 
          error: 'Both current password and new password are required to change your password.' 
        }, { status: 400 });
      }

      if (newPassword.length < 8) {
        return NextResponse.json({ 
          error: 'New password must be at least 8 characters long.' 
        }, { status: 400 });
      }

      // Verify current password matches existing hash
      const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isPasswordCorrect) {
        return NextResponse.json({ error: 'The current password you entered is incorrect.' }, { status: 400 });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      updateData.password_hash = hashedNewPassword;
    }

    // If nothing to update, return early
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: true, message: 'No changes to update.' });
    }

    // 4. Perform database update
    const { data: updatedUser, error: updateError } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', session.userId)
      .select()
      .single();

    if (updateError) {
      console.error('Database update error in profile route:', updateError);
      return NextResponse.json({ error: 'Failed to update user profile. Please try again.' }, { status: 500 });
    }

    // 5. Update/refresh the session cookie with updated user profile details
    await createSession(updatedUser);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updatedUser.id,
        user_id: updatedUser.user_id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        current_streak: updatedUser.current_streak,
        last_active_date: updatedUser.last_active_date,
      }
    });

  } catch (err) {
    console.error('Profile update API exception:', err);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
