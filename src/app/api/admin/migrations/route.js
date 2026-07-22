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

    // Read site_pages_migration.sql
    const sitePagesMigrationPath = path.join(rootDir, 'site_pages_migration.sql');
    const sitePagesMigrationSql = fs.existsSync(sitePagesMigrationPath) 
      ? fs.readFileSync(sitePagesMigrationPath, 'utf8') 
      : '-- Site pages migration file not found';

    // Read migration_coupons_multitenancy.sql
    const couponMigrationPath = path.join(rootDir, 'migration_coupons_multitenancy.sql');
    const couponMigrationSql = fs.existsSync(couponMigrationPath)
      ? fs.readFileSync(couponMigrationPath, 'utf8')
      : '-- Coupons multi-tenancy migration file not found';

    // Read migration_user_email_multitenancy.sql
    const userEmailMigrationPath = path.join(rootDir, 'migration_user_email_multitenancy.sql');
    const userEmailMigrationSql = fs.existsSync(userEmailMigrationPath)
      ? fs.readFileSync(userEmailMigrationPath, 'utf8')
      : '-- User email multi-tenancy migration file not found';

    return NextResponse.json({
      success: true,
      migrations: [
        {
          name: 'migration_user_email_multitenancy.sql',
          title: 'User Email Multi-tenancy Isolation Migration',
          description: 'Drops the global unique constraint on email in user_profiles and scopes uniqueness per organization.',
          sql: userEmailMigrationSql,
        },
        {
          name: 'migration_coupons_multitenancy.sql',
          title: 'Coupons Multi-tenancy Isolation Migration',
          description: 'Adds organization_id field, populates it for existing coupons, and adds unique constraint scoped to organization.',
          sql: couponMigrationSql,
        },
        {
          name: 'site_pages_migration.sql',
          title: 'Site Pages Multi-tenancy Migration',
          description: 'Adds organization_id field and unique index per organization to the site_pages table.',
          sql: sitePagesMigrationSql,
        },
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
