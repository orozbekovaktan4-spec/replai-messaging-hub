import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function setupWhiteGoldInstagram() {
  try {
    // Find White Gold business by email
    const business = await prisma.business.findUnique({
      where: { email: 'claudeformac12@gmail.com' }
    });

    if (!business) {
      console.error('❌ Business not found with email: claudeformac12@gmail.com');
      await prisma.$disconnect();
      return;
    }

    console.log('\n✅ Found business:');
    console.log(`   Name: ${business.name}`);
    console.log(`   ID: ${business.id}`);
    console.log(`   Email: ${business.email}`);
    console.log(`   Owner: ${business.ownerName || 'N/A'}`);
    console.log('');

    // Create RAG file for this business
    const ragFileName = `business-info-${business.id}.json`;
    
    // Check if template exists
    if (fs.existsSync('business-info-white-gold.json')) {
      const templateData = JSON.parse(fs.readFileSync('business-info-white-gold.json', 'utf8'));
      
      // Update with actual business data
      templateData.businessName = business.name;
      templateData.ownerName = business.ownerName || 'Business Owner';
      templateData.contact.email = business.email;
      templateData.contact.phone = business.phone || '+996 555 001 001';
      
      // Write to business-specific RAG file
      fs.writeFileSync(ragFileName, JSON.stringify(templateData, null, 2));
      console.log(`✅ Created RAG file: ${ragFileName}`);
    } else {
      console.log('⚠️  Template business-info-white-gold.json not found');
      console.log('   Creating basic RAG file...');
      
      const basicRAG = {
        businessName: business.name,
        description: "Luxury jewelry store specializing in gold jewelry, custom designs, and professional repair services.",
        industry: business.industry || "Jewelry",
        ownerName: business.ownerName || "Business Owner",
        contact: {
          phone: business.phone || "+996 555 001 001",
          email: business.email,
          address: business.address || "Bishkek, Kyrgyzstan",
          website: business.website || ""
        },
        hours: {
          monday: { open: "09:00", close: "18:00", closed: false },
          tuesday: { open: "09:00", close: "18:00", closed: false },
          wednesday: { open: "09:00", close: "18:00", closed: false },
          thursday: { open: "09:00", close: "18:00", closed: false },
          friday: { open: "09:00", close: "18:00", closed: false },
          saturday: { open: "10:00", close: "17:00", closed: false },
          sunday: { open: "10:00", close: "17:00", closed: true }
        },
        services: [
          {
            name: "Gold Jewelry Collection",
            description: "Wide selection of gold rings, necklaces, bracelets, and earrings. Prices based on current gold market rates.",
            price: "Market rate"
          },
          {
            name: "Custom Jewelry Design",
            description: "We create unique custom jewelry pieces according to your preferences",
            price: "Consultation required"
          },
          {
            name: "Jewelry Repair & Resizing",
            description: "Professional jewelry repair, ring resizing, chain repair",
            price: "Starting from 1,500 сом"
          }
        ],
        faqs: [
          {
            question: "Do you buy gold?",
            answer: "Yes, we buy gold jewelry at fair market prices based on current gold rates."
          },
          {
            question: "How much are gold rings?",
            answer: "Ring prices depend on gold weight and current market rates. Typically range from 10,000 to 100,000 сом. Visit us to see our collection and get exact pricing."
          }
        ],
        aiSettings: {
          tone: "friendly",
          language: "auto",
          responseLength: "medium"
        }
      };
      
      fs.writeFileSync(ragFileName, JSON.stringify(basicRAG, null, 2));
      console.log(`✅ Created basic RAG file: ${ragFileName}`);
    }

    // Update Instagram connection for this business
    const instagramConfig = {
      connected: true,
      userId: process.env.INSTAGRAM_USER_ID || '17841442927870144',
      igUserId: process.env.INSTAGRAM_USER_ID || '17841442927870144',
      username: 'akt4n.o',
      accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
      pageId: process.env.INSTAGRAM_PAGE_ID || '1077310258808665',
      pageName: 'Akt4n.o',
      connectedAt: new Date().toISOString(),
      config: {
        dmEnabled: true,
        rules: []
      }
    };

    await prisma.business.update({
      where: { id: business.id },
      data: {
        instagram: JSON.stringify(instagramConfig)
      }
    });

    console.log('✅ Instagram configured for this business');
    console.log(`   Username: @${instagramConfig.username}`);
    console.log(`   Page: ${instagramConfig.pageName}`);
    console.log('');
    console.log('🎉 Setup complete!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`   Business: ${business.name} (${business.id})`);
    console.log(`   RAG File: ${ragFileName}`);
    console.log(`   Instagram: @${instagramConfig.username}`);
    console.log('');
    console.log('✅ Now when someone DMs @akt4n.o on Instagram,');
    console.log('   the AI will use the White Gold business context!');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
  }
}

setupWhiteGoldInstagram();
