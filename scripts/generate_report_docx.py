import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=180, right=180):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def add_header_styled(doc, text, level):
    h = doc.add_heading(text, level=level)
    h.paragraph_format.keep_with_next = True
    h.paragraph_format.space_before = Pt(12)
    h.paragraph_format.space_after = Pt(4)
    run = h.runs[0]
    if level == 1:
        run.font.size = Pt(18)
        run.font.bold = True
        run.font.color.rgb = RGBColor(15, 44, 89) # Deep Navy
    elif level == 2:
        run.font.size = Pt(14)
        run.font.bold = True
        run.font.color.rgb = RGBColor(30, 90, 150) # Slate Blue
    elif level == 3:
        run.font.size = Pt(12)
        run.font.bold = True
        run.font.color.rgb = RGBColor(50, 70, 90)
    return h

def add_callout(doc, title, text, bg_hex="F0F4F8", border_hex="1E5A96"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    tbl.columns[0].width = Inches(6.5)
    
    cell = tbl.cell(0, 0)
    set_cell_background(cell, bg_hex)
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    # Left border only
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="none"/>'
        f'<w:left w:val="single" w:sz="24" w:space="0" w:color="{border_hex}"/>'
        f'<w:bottom w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(tcBorders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    r_title = p.add_run(f"📌 {title}\n")
    r_title.bold = True
    r_title.font.size = Pt(10.5)
    r_title.font.color.rgb = RGBColor(15, 44, 89)
    
    r_text = p.add_run(text)
    r_text.font.size = Pt(9.5)
    r_text.font.color.rgb = RGBColor(40, 40, 40)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def style_table(tbl, col_widths, headers, data):
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    
    # Header Row
    hdr_row = tbl.rows[0]
    for i, title in enumerate(headers):
        cell = hdr_row.cells[i]
        cell.width = col_widths[i]
        set_cell_background(cell, "1F3A60")
        set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.space_before = Pt(0)
        run = p.add_run(title)
        run.bold = True
        run.font.size = Pt(9.5)
        run.font.color.rgb = RGBColor(255, 255, 255)
    
    # Data Rows
    for r_idx, row_data in enumerate(data):
        row = tbl.add_row()
        bg = "FFFFFF" if r_idx % 2 == 0 else "F7FAFC"
        for c_idx, val in enumerate(row_data):
            cell = row.cells[c_idx]
            cell.width = col_widths[c_idx]
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=80, bottom=80, left=140, right=140)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.space_before = Pt(0)
            run = p.add_run(str(val))
            run.font.size = Pt(9)
            run.font.color.rgb = RGBColor(30, 30, 30)

def generate_report():
    doc = docx.Document()
    
    # Set standard margins (1 inch)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
    
    # Document Title Block
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(2)
    run_title = title_p.add_run("WealthWise — Comprehensive System Audit & Onboarding Architecture Guide")
    run_title.bold = True
    run_title.font.size = Pt(22)
    run_title.font.color.rgb = RGBColor(15, 44, 89)
    
    subtitle_p = doc.add_paragraph()
    subtitle_p.paragraph_format.space_after = Pt(14)
    run_sub = subtitle_p.add_run("Part A: Operational Deployments, Role Features, Credentials & Pipeline Diagnostics\nPart B: Core Architectural Blueprint & Working Mechanics for Newcomers")
    run_sub.font.size = Pt(11)
    run_sub.font.italic = True
    run_sub.font.color.rgb = RGBColor(80, 90, 100)
    
    add_callout(
        doc,
        "Executive Summary & Project Health",
        "WealthWise is an AI-powered personal wealth planning platform built as a high-performance modular monolith (Node.js/Express REST API with a React/Vite/TypeScript Single Page Application). The system delivers unified income/expense tracking, an explainable 4-pillar algorithmic Wealth Score engine, multi-horizon financial goal conflict evaluation, macro stress-testing, and dynamic Gemini/OpenAI advisory chats. All 14 user/admin screens and 26+ backend API endpoints are implemented (~100% feature complete against functional specs)."
    )

    # ==========================================
    # PART A
    # ==========================================
    add_header_styled(doc, "PART A: Project Deployments, Role Features, Credentials & Pipeline Diagnostics", level=1)
    
    # 1. Frontend Deployment
    add_header_styled(doc, "1. Frontend Deployment Analysis", level=2)
    p_fe = doc.add_paragraph(
        "The frontend is structured as a client-side Single Page Application (SPA) optimized for fast rendering, reactive state management, and modern responsive UI styling."
    )
    p_fe.paragraph_format.space_after = Pt(6)
    
    fe_tbl = doc.add_table(rows=1, cols=2)
    style_table(
        fe_tbl,
        [Inches(2.2), Inches(4.3)],
        ["Deployment Parameter", "Technical Specification & Configuration"],
        [
            ["Framework & Engine", "React 18, TypeScript, Vite 5.4, TailwindCSS 3.4"],
            ["Local Development URL", "http://localhost:5173 (via 'npm run dev' or 'npm run dev:frontend')"],
            ["Production Build Output", "Directory: 'frontend/dist/' generated via 'npm run build' (Vite bundle)"],
            ["Docker Containerization", "docker/Dockerfile.frontend (Node 20 Alpine, builds dist, exposes port 5173, runs 'npm run preview')"],
            ["Routing & State Management", "React Router v6 declarative routing; AuthContext manages token lifecycle, user session, and role state"],
            ["Chart & Visualization Stack", "Recharts (interactive responsive SVG line, bar, pie, and radar charts)"],
            ["Target Cloud Platforms", "Vercel, Netlify, Cloudflare Pages, AWS S3 + CloudFront distribution, or Railway/Render static hosting"],
            ["API Backend Connectivity", "Configured via VITE_API_URL pointing to Express API (defaults to http://localhost:3100/api/v1)"]
        ]
    )
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # 2. Backend Deployment
    add_header_styled(doc, "2. Backend Deployment Analysis", level=2)
    p_be = doc.add_paragraph(
        "The backend is architected as an Express.js modular monolith providing RESTful API services, JWT token lifecycle management, database transactions, background cron jobs, and AI provider integrations."
    )
    p_be.paragraph_format.space_after = Pt(6)
    
    be_tbl = doc.add_table(rows=1, cols=2)
    style_table(
        be_tbl,
        [Inches(2.2), Inches(4.3)],
        ["Backend Parameter", "Technical Specification & Configuration"],
        [
            ["Runtime & Framework", "Node.js (v20+ / v24 tested), Express 4.19, CommonJS"],
            ["Service Port & Endpoints", "PORT=3100; REST base URL: http://localhost:3100/api/v1; Health check: /health"],
            ["Database Engine", "PostgreSQL (PostgreSQL 18 locally installed at D:\\postgre; or managed Supabase PostgreSQL instance)"],
            ["Connection Pooler", "node-postgres ('pg' Pool) with 10 max connections, 30s idle timeout, 15s connection timeout"],
            ["Redis Cache & Blacklist", "Redis 7 (redis://localhost:6379) for caching wealth scores, dashboard metrics, and revoked JWT tokens"],
            ["AI Provider Layer", "Hot-swappable AI adapter (backend/src/config/ai-provider.js) supporting Google Gemini (gemini-1.5-flash) and OpenAI (gpt-4o)"],
            ["Background Jobs", "node-cron scheduling automated nightly wealth score recalculations (backend/src/jobs/recalculate.job.js)"],
            ["Docker Deployment", "docker/Dockerfile.api (Node 20 Alpine, multi-stage build, starts server via 'npm start')"],
            ["Target Cloud Platforms", "Railway, Render, AWS ECS/Fargate, Fly.io, DigitalOcean App Platform, or GCP Cloud Run"]
        ]
    )
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # 3. Main Features by Role & Credentials
    add_header_styled(doc, "3. Main Features by Role & Default Credentials", level=2)
    
    add_callout(
        doc,
        "System Access Credentials (Local & Staging Environment)",
        "The system includes seeded accounts with encrypted passwords (via bcrypt, 10 rounds). Ensure the PostgreSQL server is running before logging in:\n\n"
        "• REGULAR USER ROLE:\n"
        "   - Email: user@wealthwise.demo\n"
        "   - Password: WealthWise@123\n"
        "   - Name: Rahul Sharma (Demo User)\n\n"
        "• PLATFORM ADMIN ROLE:\n"
        "   - Email: admin@wealthwise.demo\n"
        "   - Password: WealthWise@123\n"
        "   - Name: Admin User"
    )

    doc.add_paragraph("Comprehensive breakdown of page-by-page and role-specific capabilities:").paragraph_format.space_after = Pt(4)
    
    feat_tbl = doc.add_table(rows=1, cols=4)
    style_table(
        feat_tbl,
        [Inches(1.0), Inches(1.7), Inches(2.3), Inches(1.5)],
        ["Role", "Page / Module", "Core Features & Business Logic", "Underlying APIs"],
        [
            ["USER", "Dashboard (/app/dashboard)", "Net worth card, liquid runway, monthly savings rate, cashflow trends, asset allocation charts.", "GET /dashboard/summary\nGET /dashboard/trends"],
            ["USER", "Finances (/app/finances)", "CRUD management for monthly incomes, fixed/discretionary expenses, assets, and liabilities/loans.", "GET/POST/PUT/DELETE /finances/records"],
            ["USER", "Wealth Score (/app/wealth-score)", "0–100 overall score across 4 pillars: Liquidity, Debt, Savings, Net Worth. AI-generated pillar explanations.", "GET /wealth-score\nPOST /wealth-score/explain"],
            ["USER", "Stress Test (/app/stress-test)", "Macroeconomic shock simulation (Job loss, medical emergency, inflation). Calculates survival runway in months.", "POST /stress-test/run\nGET /stress-test/latest"],
            ["USER", "Goals & Conflicts (/app/goals)", "Multi-horizon goal creation (Short/Med/Long), progress tracking, capital conflict detector, decision evaluator.", "CRUD /goals\nPOST /decisions/evaluate"],
            ["USER", "AI Advisor (/app/advisor)", "Contextual conversational financial assistant. Automatically injects user finances & goals into prompt context.", "POST /advisor/chat\nGET /advisor/history"],
            ["USER", "Settings (/app/settings)", "Profile updates, idle timeout toggle (15 min), password change, JWT revocation on logout.", "GET/PUT /users/me\nPOST /auth/logout"],
            ["ADMIN", "Admin Dashboard (/admin/dashboard)", "Platform KPI overview, total registered users, active sessions, API health status, error counters.", "GET /admin/usage-summary\nGET /admin/system-status"],
            ["ADMIN", "AI Configuration (/admin/ai-config)", "Live switching between OpenAI and Gemini, model selection, temperature tuning, token budget control.", "GET /admin/ai-config\nPUT /admin/ai-config"],
            ["ADMIN", "System Audit Logs (/admin/audit-logs)", "Security & compliance audit trail tracking logins, failed auth, data mutations, role changes; CSV export.", "GET /admin/audit-logs\nGET /admin/audit-logs/export"]
        ]
    )
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # 4. Pipeline & Workflow Analysis (Broken/Incomplete Items)
    add_header_styled(doc, "4. Pipeline & Workflow Diagnostics (Broken or Incomplete Items)", level=2)
    p_pipe = doc.add_paragraph(
        "A rigorous audit of the repository's continuous integration, continuous deployment, containerization, and backend integration pipelines revealed several configuration discrepancies that must be addressed for production readiness:"
    )
    p_pipe.paragraph_format.space_after = Pt(6)

    pipe_tbl = doc.add_table(rows=1, cols=4)
    style_table(
        pipe_tbl,
        [Inches(1.5), Inches(1.1), Inches(2.5), Inches(1.4)],
        ["Pipeline / Workflow", "Status", "Detailed Diagnosis & Root Cause", "Recommended Resolution"],
        [
            [
                "CD Deployment Pipeline\n(.github/workflows/cd-deploy.yml)",
                "⚠️ Incomplete / Stub",
                "The workflow triggers on push to 'main' but executes only a placeholder echo command: echo 'Deploy step goes here (Railway / AWS / GCP — TBD-03)'. No actual deployment is performed.",
                "Implement real deployment action (e.g. Railway CLI deploy, Render webhook trigger, or AWS ECS task definition update)."
            ],
            [
                "Docker Compose Port Alignment\n(docker/docker-compose.yml)",
                "⚠️ Port Mismatch",
                "docker-compose.yml maps port 3000:3000 for the 'api' service, whereas backend/.env defines PORT=3100. This causes port forwarding failures in dockerized runs.",
                "Align ports across docker-compose.yml and Dockerfile.api to 3100:3100 (or pass PORT=3000 via env_file)."
            ],
            [
                "Email Service Credentials\n(backend/.env)",
                "⚠️ Inactive Provider",
                "EMAIL_PROVIDER=resend is enabled, but RESEND_API_KEY is blank. Triggering forgot-password / reset-password results in unhandled email dispatch errors.",
                "Configure a valid Resend API key or switch to SMTP with host/port credentials."
            ],
            [
                "CI Build Dependencies\n(.github/workflows/ci.yml)",
                "⚠️ Risk of Lock Drift",
                "The CI workflow executes 'npm ci' inside both 'backend' and 'frontend' subdirectories. Root package.json also manages monorepo concurrently runner.",
                "Ensure both subdirectories maintain up-to-date package-lock.json files committed to git."
            ],
            [
                "Local PostgreSQL Service Dependency",
                "⚠️ Runtime Gotcha",
                "If the local PostgreSQL service ('postgresql-x64-18' at D:\\postgre) is stopped, backend API queries fail with ECONNREFUSED, emitting HTTP 500.",
                "Ensure PostgreSQL runs as an automatic Windows Service or point DATABASE_URL to a cloud Supabase instance."
            ]
        ]
    )
    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # ==========================================
    # PART B
    # ==========================================
    add_header_styled(doc, "PART B: Architectural Blueprint & Working Mechanics for Newcomers", level=1)
    
    p_b_intro = doc.add_paragraph(
        "This section provides an architectural onboarding roadmap designed to help any newly joined engineer or technical stakeholder rapidly understand the design principles, request lifecycles, and core algorithms powering WealthWise."
    )
    p_b_intro.paragraph_format.space_after = Pt(8)

    # Key Architectural Points
    points = [
        (
            "1. Architectural Pattern — Modular Monolith",
            "Rather than prematurely adopting distributed microservices (which introduces network latency, RPC complexity, and distributed transaction overhead), WealthWise adopts a domain-driven Modular Monolith architecture. The backend divides financial concerns into clean, self-contained domain modules located in 'backend/src/modules/':\n"
            "• auth: Registration, JWT issuance, password hashing, and token revocation.\n"
            "• finances: Income, expense, asset, and liability record management.\n"
            "• wealth-score: Mathematical scoring algorithm across 4 financial pillars.\n"
            "• stress-test: Shock modeling (inflation, layoff, emergency) and runway calculation.\n"
            "• goals: Multi-horizon goal planning and capital conflict evaluation.\n"
            "• advisor: Context-aware AI advisory chat with automated financial prompt injection.\n"
            "• admin: Platform metrics, audit logs, and AI provider runtime switching.\n"
            "• dashboard: Aggregate financial health summary and trend aggregations."
        ),
        (
            "2. End-to-End Request & Data Lifecycle",
            "Every user interaction flows through a deterministic, secure 5-layer pipeline:\n"
            "1. Client Layer: React 18 SPA triggers strongly-typed Axios API calls from 'frontend/src/services/app.service.ts'.\n"
            "2. Security & Rate Limiting: Express applies Helmet HTTP headers, CORS origin verification, and express-rate-limit to protect endpoints.\n"
            "3. Authentication & RBAC: 'auth.middleware.js' validates the incoming Bearer JWT against JWT_SECRET, checks Redis blacklist for logged-out tokens, and injects 'req.user'. For admin routes, 'admin.middleware.js' verifies role === 'ADMIN'.\n"
            "4. Business Logic & Validation: Route handlers validate request schemas using 'express-validator' before invoking service functions in 'src/modules/*/service.js'.\n"
            "5. Persistence & Cache: The service queries PostgreSQL using parameterized SQL via the 'pg' connection pool, logs mutations to 'audit_logs', invalidates relevant Redis caches, and triggers asynchronous recalculation jobs if financial data changed."
        ),
        (
            "3. The Explainable Wealth Score Engine (Core Mathematical IP)",
            "Unlike black-box financial scoring, WealthWise calculates a transparent, deterministic 0–100 score based on 4 weighted pillars calibrated to modern financial guidelines (including Indian economic conditions):\n"
            "• Liquidity & Emergency Cushion (0–25 pts): Evaluates liquid runway against monthly expenses. 6+ months expenses in liquid cash yields full 25 points; <1 month yields 0 points.\n"
            "• Debt-to-Income Health (0–25 pts): Evaluates monthly debt EMIs against gross income. DTI < 20% scores full 25 points; DTI > 50% drops score toward 0.\n"
            "• Savings & Investment Ratio (0–25 pts): Measures percentage of monthly income directed into assets/savings. >=30% savings rate achieves 25 points.\n"
            "• Net Worth Trajectory (0–25 pts): Compares total assets against total liabilities and assesses positive net worth trajectory relative to age/income bracket.\n\n"
            "AI is deliberately NOT used to calculate the score (guaranteeing mathematical accuracy, regulatory explainability, and determinism). AI is only invoked on-demand to generate personalized, plain-English coaching tips interpreting why the score moved."
        ),
        (
            "4. Financial Stress-Testing Mechanics",
            "The stress-test module ('backend/src/modules/stress-test/service.js') simulates severe macroeconomic scenarios:\n"
            "• IT Sector Layoffs / Career Break: Income drops by 100% for 6 months.\n"
            "• Family Medical Emergency: 35% expense surge combined with 20% temporary income dip.\n"
            "• High Inflation & Rate Hikes: 25% surge in living expenses + EMI rate increases.\n\n"
            "The simulator calculates Net Monthly Deficit and divides liquid assets by the burn rate to output Exact Runway in Months. If runway is < 3 months, the system issues a High Risk advisory flag with actionable mitigation steps."
        ),
        (
            "5. Swappable AI Advisory Architecture",
            "WealthWise abstracts AI vendors through a clean adapter interface ('backend/src/config/ai-provider.js'):\n"
            "• At boot or via Admin configuration, the system loads either Google Gemini (via Google Generative AI SDK) or OpenAI (via OpenAI SDK).\n"
            "• When a user chats with the AI Advisor, the backend pre-fetches the user's latest monthly income, monthly expenses, total assets, active debt EMIs, and upcoming financial goals.\n"
            "• It compiles this into an encrypted system prompt context, ensuring the AI delivers grounded, hyper-personalized advice while enforcing a strict compliance disclaimer: 'Informational only, not certified financial advice'."
        ),
        (
            "6. Security & Audit Governance",
            "• Stateless JWT Authentication with 15-minute access token expiry.\n"
            "• Token Revocation: On logout, token signatures are stored in Redis until expiry, preventing replay attacks.\n"
            "• Progressive Account Lockout: 5 consecutive failed login attempts locks the account for 15 minutes to defeat credential stuffing and brute-force attacks.\n"
            "• Audit Logging: Every sensitive mutation (user login, password change, financial record deletion, goal modification, AI config change) writes an immutable record to the 'audit_logs' table."
        ),
        (
            "7. Quick Navigation Map for New Developers",
            "• Want to modify the Database Schema? Look at 'database/migrations/V1__init_wealthwise_schema.sql'.\n"
            "• Want to inspect or add Seed Data? Look at 'backend/scripts/seed.js'.\n"
            "• Want to add a new API Endpoint? Add route in 'backend/src/modules/<domain>/routes.js' and business logic in 'service.js'.\n"
            "• Want to add a new Frontend Screen? Create page in 'frontend/src/pages/', register route in 'frontend/src/App.tsx', and add API call to 'frontend/src/services/app.service.ts'.\n"
            "• Want to test locally? Run 'npm run dev' from root to start both backend (port 3100) and frontend (port 5173)."
        )
    ]

    for title, body in points:
        add_header_styled(doc, title, level=2)
        p = doc.add_paragraph(body)
        p.paragraph_format.space_after = Pt(6)

    # Save document
    output_docs_path = r"c:\Users\chaud\OneDrive\Desktop\projects\wealthwise\WelthWise\docs\WealthWise_Project_Report_Part_A_and_Part_B.docx"
    output_root_path = r"c:\Users\chaud\OneDrive\Desktop\projects\wealthwise\WelthWise\WealthWise_Project_Report_Part_A_and_Part_B.docx"
    
    doc.save(output_docs_path)
    doc.save(output_root_path)
    print("SUCCESS: Document generated at:")
    print(output_docs_path)
    print(output_root_path)

if __name__ == "__main__":
    generate_report()
