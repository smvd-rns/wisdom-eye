import { NextResponse } from 'next/server';
import { getSession, canManageCourses } from '@/lib/session';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session || !canManageCourses(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const rootDir = process.cwd();
    
    // Read lms_schema.sql
    const schemaPath = path.join(rootDir, 'lms_schema.sql');
    const schemaSql = fs.existsSync(schemaPath) 
      ? fs.readFileSync(schemaPath, 'utf8') 
      : '-- Schema file not found';

    // Read packages_migration.sql
    const pkgMigrationPath = path.join(rootDir, 'src', 'app', 'api', 'admin', 'packages', 'packages_migration.sql');
    const pkgMigrationSql = fs.existsSync(pkgMigrationPath)
      ? fs.readFileSync(pkgMigrationPath, 'utf8')
      : '-- Packages migration file not found';

    return NextResponse.json({
      success: true,
      migrations: [
        {
          name: 'packages_migration.sql',
          title: 'Course Packages Migration (New)',
          description: 'Creates tables for Manual Course Packages / Bundling and corresponding RLS Policies.',
          sql: pkgMigrationSql,
        },
        {
          name: 'lms_schema.sql',
          title: 'LMS Core Schema',
          description: 'Defines the base tables for users, courses, modules, lessons, and enrollment stats.',
          sql: schemaSql,
        }
      ]
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
