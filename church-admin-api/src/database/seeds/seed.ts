import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { databaseConfig } from '../../config/database.config';

// Define entity interfaces for seeding
interface Church {
  id: string;
  name: string;
  slug: string;
  description?: string;
  email?: string;
  phone?: string;
  timezone: string;
  currency: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface User {
  id: string;
  church_id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

interface Permission {
  id: string;
  church_id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface Category {
  id: string;
  church_id: string;
  name: string;
  slug: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

async function seed() {
  const config = databaseConfig() as any;
  const dataSource = new DataSource({
    ...config,
    type: config.type || 'better-sqlite3',
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('Database connection established');

    // IDs for seeding
    const churchId = uuidv4();
    const superAdminUserId = uuidv4();
    const adminUserId = uuidv4();
    const pastorUserId = uuidv4();

    // 1. Create default church
    const church: Church = {
      id: churchId,
      name: 'Grace Community Church',
      slug: 'grace-community-church',
      description: 'A welcoming faith community dedicated to spiritual growth and service',
      email: 'hello@gracechurch.com',
      phone: '+1-555-123-4567',
      timezone: 'America/New_York',
      currency: 'USD',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await dataSource.query(
      `INSERT INTO churches (id, name, slug, description, email, phone, timezone, currency, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        church.id,
        church.name,
        church.slug,
        church.description,
        church.email,
        church.phone,
        church.timezone,
        church.currency,
        church.is_active,
        church.created_at,
        church.updated_at,
      ],
    );

    console.log('✓ Default church created');

    // 2. Create default super admin user
    const superAdminPassword = await bcryptjs.hash('Admin@12345', 10);
    const superAdminUser: User = {
      id: superAdminUserId,
      church_id: churchId,
      email: 'admin@gracechurch.com',
      password_hash: superAdminPassword,
      first_name: 'Admin',
      last_name: 'User',
      role: 'super_admin',
      is_active: true,
      is_verified: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await dataSource.query(
      `INSERT INTO users (id, church_id, email, password_hash, first_name, last_name, role, is_active, is_verified, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        superAdminUser.id,
        superAdminUser.church_id,
        superAdminUser.email,
        superAdminUser.password_hash,
        superAdminUser.first_name,
        superAdminUser.last_name,
        superAdminUser.role,
        superAdminUser.is_active,
        superAdminUser.is_verified,
        superAdminUser.created_at,
        superAdminUser.updated_at,
      ],
    );

    console.log('✓ Super admin user created (Email: admin@gracechurch.com, Password: Admin@12345)');

    // 3. Create admin user
    const adminPassword = await bcryptjs.hash('Admin@12345', 10);
    const adminUser: User = {
      id: adminUserId,
      church_id: churchId,
      email: 'manager@gracechurch.com',
      password_hash: adminPassword,
      first_name: 'Manager',
      last_name: 'User',
      role: 'admin',
      is_active: true,
      is_verified: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await dataSource.query(
      `INSERT INTO users (id, church_id, email, password_hash, first_name, last_name, role, is_active, is_verified, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        adminUser.id,
        adminUser.church_id,
        adminUser.email,
        adminUser.password_hash,
        adminUser.first_name,
        adminUser.last_name,
        adminUser.role,
        adminUser.is_active,
        adminUser.is_verified,
        adminUser.created_at,
        adminUser.updated_at,
      ],
    );

    console.log('✓ Admin user created (Email: manager@gracechurch.com, Password: Admin@12345)');

    // 4. Create pastor user
    const pastorPassword = await bcryptjs.hash('Pastor@12345', 10);
    const pastorUser: User = {
      id: pastorUserId,
      church_id: churchId,
      email: 'pastor@gracechurch.com',
      password_hash: pastorPassword,
      first_name: 'John',
      last_name: 'Pastor',
      role: 'pastor',
      is_active: true,
      is_verified: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await dataSource.query(
      `INSERT INTO users (id, church_id, email, password_hash, first_name, last_name, role, is_active, is_verified, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        pastorUser.id,
        pastorUser.church_id,
        pastorUser.email,
        pastorUser.password_hash,
        pastorUser.first_name,
        pastorUser.last_name,
        pastorUser.role,
        pastorUser.is_active,
        pastorUser.is_verified,
        pastorUser.created_at,
        pastorUser.updated_at,
      ],
    );

    console.log('✓ Pastor user created (Email: pastor@gracechurch.com, Password: Pastor@12345)');

    // 5. Create default permissions
    const permissions: Permission[] = [
      // Church Management
      {
        id: uuidv4(),
        church_id: churchId,
        name: 'Manage Church Settings',
        slug: 'manage_church_settings',
        description: 'Update church information and settings',
        category: 'church',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // User Management
      {
        id: uuidv4(),
        church_id: churchId,
        name: 'Create Users',
        slug: 'create_users',
        description: 'Add new users to the church',
        category: 'users',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        church_id: churchId,
        name: 'Edit Users',
        slug: 'edit_users',
        description: 'Modify user information and roles',
        category: 'users',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        church_id: churchId,
        name: 'Delete Users',
        slug: 'delete_users',
        description: 'Remove users from the system',
        category: 'users',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Sermons
      {
        id: uuidv4(),
        church_id: churchId,
        name: 'Create Sermons',
        slug: 'create_sermons',
        description: 'Add new sermons to the library',
        category: 'sermons',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        church_id: churchId,
        name: 'Publish Sermons',
        slug: 'publish_sermons',
        description: 'Publish sermons to the public',
        category: 'sermons',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Events
      {
        id: uuidv4(),
        church_id: churchId,
        name: 'Create Events',
        slug: 'create_events',
        description: 'Create new church events',
        category: 'events',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        church_id: churchId,
        name: 'Edit Events',
        slug: 'edit_events',
        description: 'Modify event details',
        category: 'events',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Donations
      {
        id: uuidv4(),
        church_id: churchId,
        name: 'View Donations',
        slug: 'view_donations',
        description: 'View donation history and analytics',
        category: 'donations',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        church_id: churchId,
        name: 'Manage Donations',
        slug: 'manage_donations',
        description: 'Create and manage donation campaigns',
        category: 'donations',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Media
      {
        id: uuidv4(),
        church_id: churchId,
        name: 'Upload Media',
        slug: 'upload_media',
        description: 'Upload images, videos, and documents',
        category: 'media',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        church_id: churchId,
        name: 'Manage Media',
        slug: 'manage_media',
        description: 'Delete and organize media files',
        category: 'media',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Dashboard & Reports
      {
        id: uuidv4(),
        church_id: churchId,
        name: 'View Dashboard',
        slug: 'view_dashboard',
        description: 'Access the main dashboard',
        category: 'dashboard',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        church_id: churchId,
        name: 'View Reports',
        slug: 'view_reports',
        description: 'Generate and view reports',
        category: 'dashboard',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    for (const permission of permissions) {
      await dataSource.query(
        `INSERT INTO permissions (id, church_id, name, slug, description, category, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          permission.id,
          permission.church_id,
          permission.name,
          permission.slug,
          permission.description,
          permission.category,
          permission.is_active,
          permission.created_at,
          permission.updated_at,
        ],
      );
    }

    console.log(`✓ ${permissions.length} default permissions created`);

    // 6. Create default categories
    const categories: Category[] = [
      {
        id: uuidv4(),
        church_id: churchId,
        name: 'Sunday Service',
        slug: 'sunday-service',
        description: 'Sunday worship services',
        display_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        church_id: churchId,
        name: 'Bible Study',
        slug: 'bible-study',
        description: 'Bible study and teaching sessions',
        display_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        church_id: churchId,
        name: 'Prayer Meeting',
        slug: 'prayer-meeting',
        description: 'Prayer and intercession meetings',
        display_order: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        church_id: churchId,
        name: 'Youth Ministry',
        slug: 'youth-ministry',
        description: 'Youth and young adult ministry',
        display_order: 4,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        church_id: churchId,
        name: 'Children\'s Ministry',
        slug: 'childrens-ministry',
        description: 'Children and family ministry',
        display_order: 5,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        church_id: churchId,
        name: 'Special Events',
        slug: 'special-events',
        description: 'Special events and conferences',
        display_order: 6,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    for (const category of categories) {
      await dataSource.query(
        `INSERT INTO categories (id, church_id, name, slug, description, display_order, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          category.id,
          category.church_id,
          category.name,
          category.slug,
          category.description,
          category.display_order,
          category.is_active,
          category.created_at,
          category.updated_at,
        ],
      );
    }

    console.log(`✓ ${categories.length} default categories created`);

    console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║                    Database Seeding Complete!                           ║
║                                                                          ║
║  Church Name: Grace Community Church                                     ║
║  Church ID: ${churchId}                          ║
║                                                                          ║
║  Super Admin Account:                                                    ║
║    Email: admin@gracechurch.com                                          ║
║    Password: Admin@12345                                                 ║
║                                                                          ║
║  Admin Account:                                                          ║
║    Email: manager@gracechurch.com                                        ║
║    Password: Admin@12345                                                 ║
║                                                                          ║
║  Pastor Account:                                                         ║
║    Email: pastor@gracechurch.com                                         ║
║    Password: Pastor@12345                                                ║
║                                                                          ║
║  Summary:                                                                ║
║    • 1 Church created                                                    ║
║    • 3 Users created                                                     ║
║    • ${permissions.length} Permissions created                                     ║
║    • ${categories.length} Categories created                                       ║
║                                                                          ║
║  ⚠️  Remember to change these default passwords in production!           ║
╚══════════════════════════════════════════════════════════════════════════╝
    `);

    await dataSource.destroy();
  } catch (error) {
    console.error('Seed failed:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

seed();
