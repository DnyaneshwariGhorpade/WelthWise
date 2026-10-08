import docx
from docx.shared import Pt
import sys

doc = docx.Document()

doc.add_heading('WealthWise Project Report', 0)

# PART A
doc.add_heading('Part A: Project Analysis', level=1)

doc.add_heading('1. Frontend Deployment', level=2)
doc.add_paragraph("The frontend is a React SPA built with Vite. Based on the CI/CD pipeline (.github/workflows/cd-deploy.yml), the deployment is currently configured as a placeholder ('TBD-03') and only echoes a message rather than actually deploying. No explicit cloud host (e.g. Vercel, Netlify, Railway) has been configured yet.")

doc.add_heading('2. Backend Deployment', level=2)
doc.add_paragraph("The backend is a Node.js/Express application. Similar to the frontend, the deployment pipeline in cd-deploy.yml is just a stub. However, there are Docker configurations (docker-compose.yml, Dockerfile.api, Dockerfile.frontend) indicating it can be containerized and deployed using Docker.")

doc.add_heading('3. Main Features by Role', level=2)
doc.add_heading('Role: User', level=3)
doc.add_paragraph("- Financial Overview Dashboard: At-a-glance view of net worth, wealth score, active goals, and AI insights.\n- Financial Data Management: Manage income, expenses, assets, liabilities, and investments.\n- Wealth Score Engine: Provides an explainable overall financial health score.\n- Financial Stress Test Simulator: Simulates financial shocks (e.g., Job Loss) and calculates runway with AI recommendations.\n- Goals & Conflict Advisor: Sets financial goals, detects conflicts, and provides AI-backed conflict resolution.\n- AI Financial Advisor Chat: Natural language query interface grounded on user data.")

doc.add_heading('Role: Administrator', level=3)
doc.add_paragraph("- Platform Admin Dashboard: View system health, total users, and active sessions.\n- AI Provider Configuration: Toggle between AI providers (e.g. OpenAI vs Gemini) without code changes.\n- System Audit Log Viewer: Read-only searchable logs of critical financial operations and logins.")

doc.add_heading('4. Credentials', level=2)
doc.add_paragraph("Demo User:\n- Email: user@wealthwise.demo\n- Password: WealthWise@123\n\nAdmin:\n- Email: admin@wealthwise.demo\n- Password: WealthWise@123")

doc.add_heading('5. Pipeline/Workflow Analysis', level=2)
doc.add_paragraph("The ci.yml workflow is functional but does not contain testing steps for the backend (only linting is present). The cd-deploy.yml workflow is effectively broken/incomplete, acting purely as a placeholder echoing deploy text ('TBD-03') without deploying anywhere.")

# PART B
doc.add_heading('Part B: Architecture & Working Guide for New Developers', level=1)
doc.add_paragraph("1. High-Level Architecture: The app is a Modular Monolith built with Node.js/Express and React. Instead of microservices, each logical domain (wealth-score, stress-test, goals) sits in a separate module within the single backend, making it lean but easy to split later.")
doc.add_paragraph("2. Database Inconsistency Warning: The design schema document explicitly specifies MySQL 8 (InnoDB), while the .env.example points to a Supabase PostgreSQL pooler. Developers should be cautious when writing queries or migrations.")
doc.add_paragraph("3. AI Integration: The platform relies on a Swappable AI Provider Abstraction (OpenAI/Gemini). It does not blindly query AI; it strictly pairs the user's raw financial data snapshot with the AI prompts (Explainable AI Data Binding) so all advice is grounded in truth.")
doc.add_paragraph("4. Stateless Authentication: Sessions use JWT tokens with short expirations. A Redis-backed blacklist ensures that users are immediately invalidated upon logout or when forcibly expired after 15 minutes of inactivity.")
doc.add_paragraph("5. Event-Driven Updates: Key engines (stress test, goal conflicts) are automatically recalculated in the background using cron jobs (Bull/node-cron) whenever a user updates their fundamental financial data, avoiding stale insights.")

doc.save('WealthWise_Project_Report_Part_A_and_Part_B.docx')
