import { getAllBusinesses } from './db.js';

console.log('\n🔍 Checking database for businesses...\n');

getAllBusinesses()
  .then(businesses => {
    console.log(`Found ${businesses.length} business(es) in database:\n`);
    
    businesses.forEach(b => {
      console.log(`Business: ${b.name}`);
      console.log(`  ID: ${b.id}`);
      
      let ig = b.instagram;
      if (typeof ig === 'string') {
        try {
          ig = JSON.parse(ig);
        } catch(e) {
          console.log('  Instagram: (parse error)');
          return;
        }
      }
      
      if (ig) {
        console.log(`  Instagram userId: ${ig.userId || 'MISSING'}`);
        console.log(`  Instagram username: ${ig.username || 'MISSING'}`);
        console.log(`  Instagram connected: ${ig.connected || false}`);
      } else {
        console.log('  Instagram: NOT SET');
      }
      console.log('');
    });
    
    if (businesses.length === 0) {
      console.log('❌ Database is EMPTY!');
      console.log('   Need to insert business from businesses.json\n');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
