#!/bin/bash
# Run this on Render Shell to setup production database

echo "🔧 Setting up production database..."

# Step 1: Run migrations
echo "📦 Running Prisma migrations..."
npx prisma migrate deploy

# Step 2: Generate Prisma client
echo "⚙️  Generating Prisma client..."
npx prisma generate

# Step 3: Create admin user
echo "👤 Creating admin user..."
node -e "
import('./db.js').then(async ({ prisma }) => {
  const bcrypt = await import('bcryptjs');
  
  // Check if admin exists
  const existing = await prisma.admin.findFirst({
    where: { email: 'admin@replai.com' }
  });
  
  if (existing) {
    console.log('✅ Admin already exists');
    process.exit(0);
  }
  
  // Create admin
  const hashedPassword = await bcrypt.default.hash('admin123', 10);
  await prisma.admin.create({
    data: {
      id: 'admin_supabase',
      email: 'admin@replai.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'admin',
      updatedAt: new Date()
    }
  });
  
  console.log('✅ Admin created!');
  console.log('Email: admin@replai.com');
  console.log('Password: admin123');
  
  await prisma.\$disconnect();
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
"

echo ""
echo "✅ Setup complete!"
echo "Login at: https://replai-xc95.onrender.com/admin"
echo "Email: admin@replai.com"
echo "Password: admin123"
