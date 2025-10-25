const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rtkqwupaavdkmoqisulv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0a3F3dXBhYXZka21vcWlzdWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2NTAwOTIsImV4cCI6MjA1NzIyNjA5Mn0.i0XcaPKDd3YuMK_Phb-XwOu8DvkLuUN--Ub7O8PutMk'
);

async function analyze() {
  const { data: boards } = await supabase
    .from('hidden_job_boards')
    .select('*')
    .eq('active', true);

  const industryCount = {};
  const expCount = {};
  const typeCount = {};
  const tagCount = {};

  let remote = 0;
  let noIndustry = 0;
  let noExp = 0;
  let noType = 0;

  boards.forEach(board => {
    // Industry
    if (!board.industry || board.industry.length === 0) {
      noIndustry++;
    } else {
      board.industry.forEach(ind => {
        industryCount[ind] = (industryCount[ind] || 0) + 1;
      });
    }

    // Experience
    if (!board.experience_level || board.experience_level.length === 0) {
      noExp++;
    } else {
      board.experience_level.forEach(exp => {
        expCount[exp] = (expCount[exp] || 0) + 1;
      });
    }

    // Board type
    if (!board.board_type || board.board_type.length === 0) {
      noType++;
    } else {
      board.board_type.forEach(type => {
        typeCount[type] = (typeCount[type] || 0) + 1;
      });
    }

    // Tags
    if (board.tags) {
      board.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    }

    if (board.remote_friendly) remote++;
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 EXPERIENCE LEVEL CATEGORIZATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  Object.entries(expCount).sort((a,b) => b[1] - a[1]).forEach(([exp, count]) => {
    const pct = ((count/boards.length)*100).toFixed(1);
    console.log('  ' + exp.padEnd(30) + count.toString().padStart(4) + ' (' + pct + '%)');
  });
  console.log('\n  ⚠️  Boards without exp level:  ' + noExp);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 BOARD TYPE CATEGORIZATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  Object.entries(typeCount).sort((a,b) => b[1] - a[1]).forEach(([type, count]) => {
    const pct = ((count/boards.length)*100).toFixed(1);
    console.log('  ' + type.padEnd(30) + count.toString().padStart(4) + ' (' + pct + '%)');
  });
  console.log('\n  ⚠️  Boards without type:       ' + noType);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏷️  TOP 40 TAGS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  Object.entries(tagCount).sort((a,b) => b[1] - a[1]).slice(0,40).forEach(([tag, count]) => {
    const pct = ((count/boards.length)*100).toFixed(1);
    console.log('  ' + tag.padEnd(30) + count.toString().padStart(4) + ' (' + pct + '%)');
  });

  console.log('\n  📊 Total unique tags: ' + Object.keys(tagCount).length);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('  Total boards:              ' + boards.length);
  console.log('  Remote friendly:           ' + remote + ' (' + ((remote/boards.length)*100).toFixed(1) + '%)');
  console.log('  Without industry:          ' + noIndustry);
  console.log('  Without experience level:  ' + noExp);
  console.log('  Without board type:        ' + noType);
  console.log('  Unique industries:         ' + Object.keys(industryCount).length);
  console.log('  Unique experience levels:  ' + Object.keys(expCount).length);
  console.log('  Unique board types:        ' + Object.keys(typeCount).length);

  // Frontend filter check
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚙️  FRONTEND FILTER STATUS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const frontendIndustries = ['tech', 'health', 'finance', 'education', 'nonprofit', 'government', 'climate', 'design', 'remote', 'startups'];

  console.log('Hard-coded industry filters:');
  frontendIndustries.forEach(ind => {
    const count = industryCount[ind] || 0;
    const status = count > 0 ? '✅' : '❌';
    console.log('  ' + status + ' ' + ind.padEnd(20) + count.toString().padStart(4) + ' boards');
  });

  console.log('\n🔍 Case sensitivity issues detected:');

  // Check for case variations
  const industryLower = {};
  Object.keys(industryCount).forEach(ind => {
    const lower = ind.toLowerCase();
    if (!industryLower[lower]) {
      industryLower[lower] = [];
    }
    industryLower[lower].push(ind);
  });

  // Find duplicates (different cases of same word)
  const duplicates = Object.entries(industryLower)
    .filter(([_, variations]) => variations.length > 1)
    .sort((a, b) => {
      const sumA = a[1].reduce((sum, v) => sum + industryCount[v], 0);
      const sumB = b[1].reduce((sum, v) => sum + industryCount[v], 0);
      return sumB - sumA;
    })
    .slice(0, 10);

  if (duplicates.length > 0) {
    console.log('');
    duplicates.forEach(([base, variations]) => {
      const totalCount = variations.reduce((sum, v) => sum + industryCount[v], 0);
      console.log('  "' + base + '" (' + totalCount + ' total boards):');
      variations.forEach(v => {
        console.log('    - "' + v + '": ' + industryCount[v] + ' boards');
      });
    });
  }

  console.log('\n✅ Analysis complete!\n');
}

analyze().catch(console.error);
