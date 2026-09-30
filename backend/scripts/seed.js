require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function seed() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL or DIRECT_URL is required in .env');
    process.exit(1);
  }

  const client = new Client({ connectionString, connectionTimeoutMillis: 15000 });
  await client.connect();
  console.log('Connected to database for Indian wealth seed...');

  try {
    await client.query('BEGIN');

    // 1. Stress test scenarios (Indian context: Layoffs, Medical emergency, Startup slowdown, Inflation)
    console.log('Seeding Indian stress test scenarios...');
    await client.query(`
      INSERT INTO stress_test_scenarios (name, description, income_impact_pct, expense_impact_pct)
      VALUES
        ('IT Sector Layoff / Career Break', 'Primary IT consulting salary stops completely for up to 6 months.', 100.00, 0.00),
        ('Family Medical Emergency', 'Hospitalization copay & medicines with temporary income dip.', 20.00, 35.00),
        ('Freelance Slowdown / Pay Cut', 'Sustained 50% drop in freelance contracts & variable bonus.', 50.00, 0.00),
        ('High Inflation & RBI Rate Hike', 'Domestic living costs surge by 20% while loan EMIs increase.', 10.00, 25.00)
      ON CONFLICT DO NOTHING;
    `);

    const scenariosRes = await client.query('SELECT scenario_id, name FROM stress_test_scenarios LIMIT 4');
    const jobLossScenarioId = scenariosRes.rows.find((r) => r.name.includes('Layoff'))?.scenario_id || scenariosRes.rows[0].scenario_id;

    // 2. Demo User and Admin
    console.log('Seeding demo users...');
    const passwordHash = await bcrypt.hash('WealthWise@123', 10);

    const userUpsert = await client.query(
      `INSERT INTO users (full_name, email, password_hash, role, account_status)
       VALUES ($1, $2, $3, $4, 'ACTIVE')
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, full_name = EXCLUDED.full_name
       RETURNING user_id, email`,
      ['Rahul Sharma (Demo User)', 'user@wealthwise.demo', passwordHash, 'USER']
    );
    const demoUserId = userUpsert.rows[0].user_id;

    await client.query(
      `INSERT INTO users (full_name, email, password_hash, role, account_status)
       VALUES ($1, $2, $3, $4, 'ACTIVE')
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
       RETURNING user_id`,
      ['Admin User', 'admin@wealthwise.demo', passwordHash, 'ADMIN']
    );

    console.log(`Demo user active with ID ${demoUserId} (user@wealthwise.demo)`);

    // Clean existing financial records for clean re-seeding
    await client.query('DELETE FROM incomes WHERE user_id = $1', [demoUserId]);
    await client.query('DELETE FROM expenses WHERE user_id = $1', [demoUserId]);
    await client.query('DELETE FROM assets WHERE user_id = $1', [demoUserId]);
    await client.query('DELETE FROM liabilities WHERE user_id = $1', [demoUserId]);
    await client.query('DELETE FROM investments WHERE user_id = $1', [demoUserId]);
    await client.query('DELETE FROM financial_goals WHERE user_id = $1', [demoUserId]);
    await client.query('DELETE FROM goal_conflicts WHERE user_id = $1', [demoUserId]);
    await client.query('DELETE FROM financial_snapshots WHERE user_id = $1', [demoUserId]);
    await client.query('DELETE FROM wealth_scores WHERE user_id = $1', [demoUserId]);
    await client.query('DELETE FROM stress_test_results WHERE user_id = $1', [demoUserId]);
    await client.query('DELETE FROM ai_insights WHERE user_id = $1', [demoUserId]);
    await client.query('DELETE FROM advisor_chat_messages WHERE user_id = $1', [demoUserId]);

    // 3. Incomes (Monthly in ₹)
    console.log('Seeding Indian incomes...');
    await client.query(
      `INSERT INTO incomes (user_id, source, amount, frequency) VALUES
       ($1, 'Tech Lead Salary (Bangalore MNC)', 185000.00, 'MONTHLY'),
       ($1, 'Freelance Web Architecture Consulting', 45000.00, 'MONTHLY'),
       ($1, 'Dividend Yield (Nifty 50 & TCS/Infy)', 12000.00, 'MONTHLY')`,
      [demoUserId]
    );

    // 4. Expenses (Monthly in ₹)
    console.log('Seeding Indian expenses...');
    await client.query(
      `INSERT INTO expenses (user_id, category, amount, frequency) VALUES
       ($1, '3BHK Apartment Rent & Society Maintenance (Whitefield)', 45000.00, 'MONTHLY'),
       ($1, 'Kirana & Groceries (Blinkit, BigBasket)', 18000.00, 'MONTHLY'),
       ($1, 'Electricity (BESCOM), Gas & Fiber WiFi', 6500.00, 'MONTHLY'),
       ($1, 'Family Term Insurance & Mediclaim (HDFC ERGO)', 8000.00, 'MONTHLY'),
       ($1, 'Car Petrol, FASTag Tolls & Namma Metro', 9500.00, 'MONTHLY'),
       ($1, 'Cook & Maid Staff Monthly Salary', 7500.00, 'MONTHLY'),
       ($1, 'Weekend Dining, Swiggy/Zomato & OTT Subscriptions', 9000.00, 'MONTHLY')`,
      [demoUserId]
    );

    // 5. Assets (in ₹)
    console.log('Seeding Indian assets...');
    await client.query(
      `INSERT INTO assets (user_id, asset_type, current_value, liquidity_level) VALUES
       ($1, 'HDFC Bank Salary Account', 125000.00, 'HIGH'),
       ($1, 'SBI Multi-Option Fixed Deposit (7.25% FD)', 650000.00, 'HIGH'),
       ($1, 'Public Provident Fund (PPF 15-Yr Tax-Free)', 780000.00, 'LOW'),
       ($1, 'Sovereign Gold Bonds (SGB RBI Tranche)', 550000.00, 'MEDIUM'),
       ($1, 'Hyundai Creta SX (O) Car', 1450000.00, 'LOW')`,
      [demoUserId]
    );

    // 6. Liabilities (in ₹)
    console.log('Seeding Indian liabilities...');
    await client.query(
      `INSERT INTO liabilities (user_id, liability_type, outstanding_amount, interest_rate) VALUES
       ($1, 'SBI Auto Loan (Car EMI)', 380000.00, 8.25),
       ($1, 'ICICI Amazon Pay Credit Card (Monthly Cleared)', 28000.00, 18.00)`,
      [demoUserId]
    );

    // 7. Investments (in ₹)
    console.log('Seeding Indian investments...');
    await client.query(
      `INSERT INTO investments (user_id, investment_type, amount_invested, risk_level) VALUES
       ($1, 'UTI Nifty 50 Index Mutual Fund (SIP)', 1250000.00, 'MEDIUM'),
       ($1, 'Parag Parikh Flexi Cap Direct Growth', 880000.00, 'MEDIUM'),
       ($1, 'Mirae Asset Large & Midcap Fund', 620000.00, 'HIGH'),
       ($1, 'Employee Provident Fund (EPF Organization Corpus)', 940000.00, 'LOW')`,
      [demoUserId]
    );

    // 8. Goals (in ₹)
    console.log('Seeding Indian financial goals...');
    const goalRes = await client.query(
      `INSERT INTO financial_goals (user_id, goal_name, target_amount, current_amount, target_date, priority, status) VALUES
       ($1, '6-Month Emergency Safety Buffer', 650000.00, 650000.00, '2026-12-31', 1, 'ACTIVE'),
       ($1, '3BHK Apartment Down Payment (Bangalore)', 3500000.00, 1850000.00, '2028-06-30', 2, 'ACTIVE'),
       ($1, 'Family Vacation to Ladakh & Kashmir', 250000.00, 175000.00, '2027-05-15', 3, 'ACTIVE'),
       ($1, 'Diwali Gold Coin & Jewellery Fund', 150000.00, 90000.00, '2026-11-01', 4, 'ACTIVE')
       RETURNING goal_id`,
      [demoUserId]
    );

    const goalIds = goalRes.rows.map((r) => r.goal_id);

    // 9. Goal Conflict
    console.log('Seeding goal conflict...');
    await client.query(
      `INSERT INTO goal_conflicts (user_id, goal_ids_involved, recommended_plan, resolution_status)
       VALUES ($1, $2, $3, 'PENDING')`,
      [
        demoUserId,
        JSON.stringify(goalIds.slice(1, 3)),
        JSON.stringify({
          summary: 'Simultaneous aggressive SIP contributions to 3BHK Down Payment and Ladakh Vacation compete for your monthly surplus.',
          recommendation: 'Namaste Rahul! We suggest keeping ₹25,000/month dedicated to your Ladakh trip so it reaches the full ₹2.5 Lakh target by April 2027, while channeling the remaining ₹75,000/month surplus into your 3BHK Down Payment fund.',
          suggestedSplit: { '3BHK Down Payment': '75%', 'Ladakh Vacation': '25%' }
        })
      ]
    );

    // 10. Historical Financial Snapshots (past 6 months in ₹)
    console.log('Seeding financial snapshots in INR...');
    const now = new Date();
    const snapshotsData = [
      { monthsAgo: 5, inc: 220000, exp: 105000, net: 5800000 },
      { monthsAgo: 4, inc: 225000, exp: 102000, net: 6150000 },
      { monthsAgo: 3, inc: 235000, exp: 104000, net: 6420000 },
      { monthsAgo: 2, inc: 240000, exp: 103000, net: 6680000 },
      { monthsAgo: 1, inc: 242000, exp: 102500, net: 6950000 },
      { monthsAgo: 0, inc: 242000, exp: 103500, net: 7237000 }
    ];

    for (const snap of snapshotsData) {
      const date = new Date(now.getFullYear(), now.getMonth() - snap.monthsAgo, 1);
      await client.query(
        `INSERT INTO financial_snapshots (user_id, monthly_income, monthly_expense, net_worth, taken_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [demoUserId, snap.inc, snap.exp, snap.net, date]
      );
    }

    // 11. Historical Wealth Scores
    console.log('Seeding wealth scores...');
    const scorePoints = [
      { monthsAgo: 5, overall: 72, savings: 70, debt: 75, liquidity: 72, growth: 76 },
      { monthsAgo: 4, overall: 75, savings: 74, debt: 78, liquidity: 74, growth: 78 },
      { monthsAgo: 3, overall: 78, savings: 77, debt: 80, liquidity: 78, growth: 80 },
      { monthsAgo: 2, overall: 80, savings: 80, debt: 82, liquidity: 80, growth: 82 },
      { monthsAgo: 1, overall: 83, savings: 83, debt: 84, liquidity: 82, growth: 85 },
      { monthsAgo: 0, overall: 86, savings: 86, debt: 86, liquidity: 85, growth: 88 }
    ];

    for (const sp of scorePoints) {
      const date = new Date(now.getFullYear(), now.getMonth() - sp.monthsAgo, 15);
      await client.query(
        `INSERT INTO wealth_scores (user_id, overall_score, savings_subscore, debt_subscore, liquidity_subscore, growth_subscore, ai_explanation, calculated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          demoUserId,
          sp.overall,
          sp.savings,
          sp.debt,
          sp.liquidity,
          sp.growth,
          'Namaste Rahul! Your savings rate of 57.2% is outstanding and well above the recommended 20-30% benchmark for Indian urban professionals. Your total liabilities (₹4.08 Lakhs) are very well contained relative to your total assets (₹72.45 Lakhs). With ₹7.75 Lakhs in liquid bank savings and SBI multi-option FD, your emergency reserves cover over 7.5 months of living expenses, providing rock-solid peace of mind.',
          date
        ]
      );
    }

    // 12. Stress Test Result
    console.log('Seeding Indian stress test result...');
    await client.query(
      `INSERT INTO stress_test_results (user_id, scenario_id, months_of_runway, weakest_point, ai_recommendation, is_stale)
       VALUES ($1, $2, 7.5, $3, $4, FALSE)`,
      [
        demoUserId,
        jobLossScenarioId,
        'Fixed car loan EMI and apartment rent of ₹53,000/month continue even during an IT career sabbatical.',
        'Namaste! With ₹7.75 Lakhs in high-liquidity funds (HDFC Salary + SBI FD), you have 7.5 months of full survival runway under total income disruption without liquidating your equity mutual funds or EPF retirement corpus.'
      ]
    );

    // 13. AI Insights (Indian financial vocabulary)
    console.log('Seeding AI insights...');
    await client.query(
      `INSERT INTO ai_insights (user_id, insight_type, message, is_read) VALUES
       ($1, 'SCORE_CHANGE', 'Badhai ho! Your Wealth Score improved from 83 to 86 this month thanks to disciplined SIP investments in Nifty 50 and prepaying your credit card.', FALSE),
       ($1, 'GOAL_CONFLICT', 'Goal conflict detected: Balancing your ₹35 Lakh 3BHK Flat Down Payment with the Ladakh vacation. Check Goals tab for the optimized SIP split.', FALSE),
       ($1, 'STRESS_ALERT', 'Stress-tested for job loss: You comfortably have 7.5 months of emergency runway, beating the 6-month safety benchmark.', FALSE),
       ($1, 'GENERAL', 'Tax-saving tip: Your PPF and EPF contributions are currently maximizing your Section 80C deductions (₹1.5 Lakhs limit).', TRUE)`,
      [demoUserId]
    );

    // 14. Advisor Chat Messages (Indian conversational tone & accent)
    console.log('Seeding advisor conversation...');
    await client.query(
      `INSERT INTO advisor_chat_messages (user_id, sender, message_text) VALUES
       ($1, 'USER', 'Namaste! I have received an extra ₹40,000 performance bonus this month. Where should I deploy it?'),
       ($1, 'AI', 'Namaste Rahul! Bahut badhiya on the bonus! Since your 6-Month Emergency Safety Buffer is already 100% funded with ₹6.5 Lakhs in liquid reserves, here is the most tax-efficient and growth-focused way to deploy your ₹40,000 bonus:\n\n1. **₹25,000 (62.5%)** ➔ Direct into your **Parag Parikh Flexi Cap Fund** via a lumpsum top-up to compound long-term wealth.\n2. **₹15,000 (37.5%)** ➔ Add to your **3BHK Flat Down Payment Goal** to bring you one step closer to your ₹35 Lakh milestone in Whitefield.\n\nKeep up this fantastic financial discipline! Shubh kamnayein!')`,
      [demoUserId]
    );

    await client.query('COMMIT');
    console.log('Successfully seeded rich Indian demo data for WealthWise!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seeding error:', err);
    throw err;
  } finally {
    await client.end();
  }
}

seed().catch(() => process.exit(1));
