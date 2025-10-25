/**
 * Script to analyze job board categorization
 * Connects to Supabase and analyzes all categorization fields
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually load .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeCategories() {
  console.log('🔍 Analyzing job board categorization system...\n');

  try {
    // Fetch all active boards
    const { data: boards, error } = await supabase
      .from('hidden_job_boards')
      .select('*')
      .eq('active', true);

    if (error) {
      console.error('❌ Error fetching boards:', error);
      return;
    }

    console.log(`📊 Total active boards: ${boards.length}\n`);

    // Analyze industries
    const industryCount = {};
    const experienceLevelCount = {};
    const boardTypeCount = {};
    const tagCount = {};
    let remoteFriendlyCount = 0;
    let featuredCount = 0;
    let boardsWithoutIndustry = 0;
    let boardsWithoutExperience = 0;
    let boardsWithoutType = 0;

    boards.forEach(board => {
      // Industry analysis
      if (board.industry && board.industry.length > 0) {
        board.industry.forEach(ind => {
          industryCount[ind] = (industryCount[ind] || 0) + 1;
        });
      } else {
        boardsWithoutIndustry++;
      }

      // Experience level analysis
      if (board.experience_level && board.experience_level.length > 0) {
        board.experience_level.forEach(level => {
          experienceLevelCount[level] = (experienceLevelCount[level] || 0) + 1;
        });
      } else {
        boardsWithoutExperience++;
      }

      // Board type analysis
      if (board.board_type && board.board_type.length > 0) {
        board.board_type.forEach(type => {
          boardTypeCount[type] = (boardTypeCount[type] || 0) + 1;
        });
      } else {
        boardsWithoutType++;
      }

      // Tags analysis
      if (board.tags && board.tags.length > 0) {
        board.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }

      // Remote and featured counts
      if (board.remote_friendly) remoteFriendlyCount++;
      if (board.featured) featuredCount++;
    });

    // Print industry analysis
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 INDUSTRY CATEGORIZATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const sortedIndustries = Object.entries(industryCount)
      .sort((a, b) => b[1] - a[1]);

    sortedIndustries.forEach(([industry, count]) => {
      const percentage = ((count / boards.length) * 100).toFixed(1);
      console.log(`  ${industry.padEnd(30)} ${count.toString().padStart(4)} boards (${percentage}%)`);
    });

    console.log(`\n  ⚠️  Boards without industry: ${boardsWithoutIndustry}`);
    console.log(`  📊 Unique industries: ${sortedIndustries.length}\n`);

    // Print experience level analysis
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎓 EXPERIENCE LEVEL CATEGORIZATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const sortedLevels = Object.entries(experienceLevelCount)
      .sort((a, b) => b[1] - a[1]);

    sortedLevels.forEach(([level, count]) => {
      const percentage = ((count / boards.length) * 100).toFixed(1);
      console.log(`  ${level.padEnd(30)} ${count.toString().padStart(4)} boards (${percentage}%)`);
    });

    console.log(`\n  ⚠️  Boards without experience level: ${boardsWithoutExperience}`);
    console.log(`  📊 Unique experience levels: ${sortedLevels.length}\n`);

    // Print board type analysis
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 BOARD TYPE CATEGORIZATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const sortedTypes = Object.entries(boardTypeCount)
      .sort((a, b) => b[1] - a[1]);

    sortedTypes.forEach(([type, count]) => {
      const percentage = ((count / boards.length) * 100).toFixed(1);
      console.log(`  ${type.padEnd(30)} ${count.toString().padStart(4)} boards (${percentage}%)`);
    });

    console.log(`\n  ⚠️  Boards without type: ${boardsWithoutType}`);
    console.log(`  📊 Unique board types: ${sortedTypes.length}\n`);

    // Print top tags
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏷️  TOP TAGS (showing top 20)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const sortedTags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    sortedTags.forEach(([tag, count]) => {
      const percentage = ((count / boards.length) * 100).toFixed(1);
      console.log(`  ${tag.padEnd(30)} ${count.toString().padStart(4)} boards (${percentage}%)`);
    });

    console.log(`\n  📊 Total unique tags: ${Object.keys(tagCount).length}\n`);

    // Print other attributes
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔧 OTHER ATTRIBUTES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const remotePercentage = ((remoteFriendlyCount / boards.length) * 100).toFixed(1);
    const featuredPercentage = ((featuredCount / boards.length) * 100).toFixed(1);

    console.log(`  Remote-friendly boards:        ${remoteFriendlyCount.toString().padStart(4)} (${remotePercentage}%)`);
    console.log(`  Featured boards:               ${featuredCount.toString().padStart(4)} (${featuredPercentage}%)\n`);

    // Check for frontend filter alignment
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚙️  FRONTEND FILTER ALIGNMENT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const frontendIndustries = ['tech', 'health', 'finance', 'education', 'nonprofit', 'government', 'climate', 'design', 'remote', 'startups'];
    const frontendExperienceLevels = ['Entry', 'Mid', 'Senior', 'Executive'];

    console.log('Frontend industry filters:');
    frontendIndustries.forEach(industry => {
      const count = industryCount[industry] || 0;
      const status = count > 0 ? '✅' : '❌';
      console.log(`  ${status} ${industry.padEnd(20)} ${count.toString().padStart(4)} boards`);
    });

    console.log('\nFrontend experience level filters:');
    frontendExperienceLevels.forEach(level => {
      const count = experienceLevelCount[level] || 0;
      const status = count > 0 ? '✅' : '❌';
      console.log(`  ${status} ${level.padEnd(20)} ${count.toString().padStart(4)} boards`);
    });

    // Find missing industries
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 INDUSTRIES IN DATA BUT NOT IN FILTERS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const missingFromFilters = sortedIndustries
      .filter(([industry]) => !frontendIndustries.includes(industry))
      .slice(0, 15);

    if (missingFromFilters.length > 0) {
      missingFromFilters.forEach(([industry, count]) => {
        console.log(`  ⚠️  ${industry.padEnd(30)} ${count.toString().padStart(4)} boards`);
      });
    } else {
      console.log('  ✅ All data industries are included in filters\n');
    }

    console.log('\n✅ Analysis complete!\n');

  } catch (error) {
    console.error('❌ Error during analysis:', error);
  }
}

analyzeCategories();
