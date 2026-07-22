import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(
  process.env.LMS_JWT_SECRET || 'wisdom-eye-lms-secret-change-in-production'
);
const COOKIE_NAME = 'lms_session';
const SESSION_DURATION = '7d';

// Sign a JWT and set it as a cookie
export async function createSession(user) {
  const { getActiveTenant } = await import('./tenant');
  const tenant = await getActiveTenant();
  const cookieName = `lms_session_${tenant.slug || 'wisdom-eye'}`;

  const token = await new SignJWT({
    id: user.id,
    userId: user.user_id,
    email: user.email,
    name: user.name,
    role: user.role,
    organizationId: user.organization_id,
    organization_id: user.organization_id
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(SECRET);

  cookies().set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return token;
}

// Read and verify the session cookie
export async function getSession() {
  const { getActiveTenant } = await import('./tenant');
  const tenant = await getActiveTenant();
  const cookieName = `lms_session_${tenant.slug || 'wisdom-eye'}`;

  const cookieStore = cookies();
  const token = cookieStore.get(cookieName)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (payload) {
      // Normalize both casings to prevent API undefined bugs
      if (payload.organizationId && !payload.organization_id) {
        payload.organization_id = payload.organizationId;
      }
      if (payload.organization_id && !payload.organizationId) {
        payload.organizationId = payload.organization_id;
      }

      // Enforce strict tenant boundary: user must belong to this tenant or be a superadmin
      if (payload.role !== 'superadmin' && payload.organization_id !== tenant.id) {
        return null;
      }
    }
    return payload;
  } catch {
    return null;
  }
}

// Delete the session cookie (logout)
export async function clearSession() {
  const { getActiveTenant } = await import('./tenant');
  const tenant = await getActiveTenant();
  const cookieName = `lms_session_${tenant.slug || 'wisdom-eye'}`;

  cookies().set(cookieName, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

// Role hierarchy helpers
export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  COURSE_BUILDER: 'course_builder',
  EVALUATOR: 'evaluator',
  STUDENT: 'student',
};

const ADMIN_ROLES = [ROLES.SUPERADMIN, ROLES.ADMIN];
const STAFF_ROLES = [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.COURSE_BUILDER, ROLES.EVALUATOR];

export function isAdmin(role) {
  return ADMIN_ROLES.includes(role);
}

export function isSuperAdmin(role) {
  return role === ROLES.SUPERADMIN;
}

export function isStaff(role) {
  return STAFF_ROLES.includes(role);
}

export function canManageCourses(role) {
  return [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.COURSE_BUILDER].includes(role);
}

export function canGrade(role) {
  return [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.EVALUATOR].includes(role);
}
