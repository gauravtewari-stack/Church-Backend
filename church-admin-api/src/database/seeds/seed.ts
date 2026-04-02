import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { databaseConfig } from '../../config/database.config';

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

    const now = new Date().toISOString();
    const churchId = uuidv4();
    const superAdminUserId = uuidv4();
    const adminUserId = uuidv4();
    const editorUserId = uuidv4();

    // 1. Create default church
    await dataSource.query(
      `INSERT INTO churches (id, name, slug, description, email, phone, timezone, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        churchId,
        'Grace Community Church',
        'grace-community-church',
        'A welcoming faith community dedicated to spiritual growth and service',
        'hello@gracechurch.com',
        '+1-555-123-4567',
        'America/New_York',
        1,
        now,
        now,
      ],
    );
    console.log('✓ Default church created');

    // 2. Create super admin user
    const superAdminPassword = await bcryptjs.hash('Admin@12345', 10);
    await dataSource.query(
      `INSERT INTO users (id, church_id, email, password_hash, name, role, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        superAdminUserId,
        churchId,
        'admin@gracechurch.com',
        superAdminPassword,
        'Admin User',
        'super_admin',
        'active',
        now,
        now,
      ],
    );
    console.log('✓ Super admin user created (Email: admin@gracechurch.com, Password: Admin@12345)');

    // 3. Create church admin user
    const adminPassword = await bcryptjs.hash('Admin@12345', 10);
    await dataSource.query(
      `INSERT INTO users (id, church_id, email, password_hash, name, role, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        adminUserId,
        churchId,
        'manager@gracechurch.com',
        adminPassword,
        'Manager User',
        'church_admin',
        'active',
        now,
        now,
      ],
    );
    console.log('✓ Church admin user created (Email: manager@gracechurch.com, Password: Admin@12345)');

    // 4. Create editor user
    const editorPassword = await bcryptjs.hash('Editor@12345', 10);
    await dataSource.query(
      `INSERT INTO users (id, church_id, email, password_hash, name, role, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        editorUserId,
        churchId,
        'editor@gracechurch.com',
        editorPassword,
        'John Editor',
        'editor',
        'active',
        now,
        now,
      ],
    );
    console.log('✓ Editor user created (Email: editor@gracechurch.com, Password: Editor@12345)');

    // 5. Create default permissions (role + module + action)
    const modules = ['church', 'users', 'sermons', 'events', 'donations', 'media', 'categories'];
    const actions = ['create', 'read', 'update', 'delete', 'publish'];
    const roles = ['super_admin', 'church_admin', 'editor'];
    let permCount = 0;

    for (const role of roles) {
      for (const mod of modules) {
        for (const action of actions) {
          // Skip publish for non-content modules
          if (action === 'publish' && !['sermons', 'events'].includes(mod)) continue;
          // Editors can only read/create/update content, not delete or manage users/church
          if (role === 'editor' && ['church', 'users'].includes(mod)) continue;
          if (role === 'editor' && action === 'delete') continue;

          await dataSource.query(
            `INSERT INTO permissions (id, church_id, role, module, action, description, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              uuidv4(),
              churchId,
              role,
              mod,
              action,
              `${role} can ${action} ${mod}`,
              now,
              now,
            ],
          );
          permCount++;
        }
      }
    }
    console.log(`✓ ${permCount} default permissions created`);

    // 6. Create default categories
    const categories = [
      { name: 'Sunday Service', slug: 'sunday-service', description: 'Sunday worship services', order: 1 },
      { name: 'Bible Study', slug: 'bible-study', description: 'Bible study and teaching sessions', order: 2 },
      { name: 'Prayer Meeting', slug: 'prayer-meeting', description: 'Prayer and intercession meetings', order: 3 },
      { name: 'Youth Ministry', slug: 'youth-ministry', description: 'Youth and young adult ministry', order: 4 },
      { name: "Children's Ministry", slug: 'childrens-ministry', description: 'Children and family ministry', order: 5 },
      { name: 'Special Events', slug: 'special-events', description: 'Special events and conferences', order: 6 },
    ];

    for (const cat of categories) {
      await dataSource.query(
        `INSERT INTO categories (id, church_id, name, slug, description, "order", status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          churchId,
          cat.name,
          cat.slug,
          cat.description,
          cat.order,
          'active',
          now,
          now,
        ],
      );
    }
    console.log(`✓ ${categories.length} default categories created`);

    console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║                    Database Seeding Complete!                           ║
║                                                                        ║
║  Church: Grace Community Church                                        ║
║                                                                        ║
║  Super Admin:  admin@gracechurch.com   / Admin@12345                   ║
║  Church Admin: manager@gracechurch.com / Admin@12345                   ║
║  Editor:       editor@gracechurch.com  / Editor@12345                  ║
║                                                                        ║
║  ${permCount} Permissions, ${categories.length} Categories created                            ║
║                                                                        ║
║  ⚠️  Change default passwords in production!                            ║
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
