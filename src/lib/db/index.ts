import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const isServerless = Boolean(process.env.VERCEL) || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
  const dbDirectory = isServerless ? "/tmp" : path.join(process.cwd(), "data");
  if (!fs.existsSync(dbDirectory)) {
    fs.mkdirSync(dbDirectory, { recursive: true });
  }

  const dbPath = path.join(dbDirectory, "beacon.db");
  const db = new Database(dbPath, { timeout: 15000 });
  try {
    if (!isServerless) {
      db.pragma("journal_mode = WAL");
    } else {
      db.pragma("journal_mode = DELETE");
    }
    db.pragma("busy_timeout = 15000");
  } catch (e) {
    // ignore
  }

  dbInstance = db;
  initDatabase(db);
  return dbInstance;
}

export function initDatabase(db: Database.Database) {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT DEFAULT 'password123',
        full_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'student',
        avatar_url TEXT,
        headline TEXT,
        bio TEXT,
        location TEXT,
        education_stage TEXT,
        college TEXT,
        degree TEXT,
        graduation_year INTEGER,
        cgpa REAL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS student_profiles (
        user_id TEXT PRIMARY KEY,
        interests TEXT,
        constraints TEXT,
        preferred_language TEXT DEFAULT 'English',
        github_url TEXT,
        linkedin_url TEXT,
        portfolio_url TEXT,
        resume_filename TEXT,
        resume_url TEXT,
        resume_updated_at TEXT,
        is_public INTEGER DEFAULT 1,
        groq_api_key TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        provider TEXT NOT NULL,
        category TEXT NOT NULL,
        level TEXT NOT NULL,
        duration TEXT NOT NULL,
        rating REAL NOT NULL,
        review_count INTEGER NOT NULL,
        is_free INTEGER DEFAULT 1,
        url TEXT NOT NULL,
        skills_covered TEXT NOT NULL,
        description TEXT NOT NULL,
        thumbnail_url TEXT
      );

      CREATE TABLE IF NOT EXISTS skills (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS skill_claims (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        skill_id TEXT NOT NULL,
        skill_name TEXT NOT NULL,
        level TEXT NOT NULL,
        provenance TEXT NOT NULL,
        evidence_notes TEXT,
        verified_at TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS certificates (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        issuer TEXT NOT NULL,
        issue_date TEXT NOT NULL,
        expiry_date TEXT,
        credential_id TEXT,
        credential_url TEXT,
        file_path TEXT,
        file_name TEXT,
        file_size INTEGER,
        file_type TEXT,
        provenance TEXT NOT NULL DEFAULT 'Self-reported',
        verified_status TEXT NOT NULL DEFAULT 'Verified Upload',
        skills_covered TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS resumes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        file_type TEXT NOT NULL,
        parsed_skills TEXT,
        parsed_summary TEXT,
        is_primary INTEGER DEFAULT 0,
        uploaded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        target_date TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        progress INTEGER DEFAULT 0,
        reasoning TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS learning_tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        goal_id TEXT,
        title TEXT NOT NULL,
        description TEXT,
        estimated_minutes INTEGER DEFAULT 30,
        prerequisite TEXT,
        status TEXT NOT NULL DEFAULT 'todo',
        deadline TEXT,
        order_index INTEGER DEFAULT 0,
        completed_at TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS opportunities (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        organization TEXT NOT NULL,
        type TEXT NOT NULL,
        location TEXT NOT NULL,
        is_remote INTEGER DEFAULT 1,
        stipend TEXT NOT NULL,
        deadline TEXT NOT NULL,
        source_url TEXT NOT NULL,
        verified_status TEXT NOT NULL DEFAULT 'Source Verified',
        last_checked TEXT NOT NULL,
        eligibility_criteria TEXT NOT NULL,
        skills_required TEXT NOT NULL,
        description TEXT NOT NULL,
        likes_count INTEGER DEFAULT 142,
        applicants_count INTEGER DEFAULT 89,
        featured INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        opportunity_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Applied',
        resume_id TEXT,
        cover_note TEXT,
        applicant_name TEXT,
        applicant_email TEXT,
        applicant_phone TEXT,
        college TEXT,
        degree TEXT,
        cgpa REAL,
        resume_url TEXT,
        project_link TEXT,
        skills_declared TEXT,
        screening_answers TEXT,
        availability TEXT,
        checklist_completed INTEGER DEFAULT 1,
        applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        memory_key TEXT NOT NULL,
        memory_value TEXT NOT NULL,
        source TEXT NOT NULL DEFAULT 'Conversation',
        confidence REAL DEFAULT 0.9,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        metadata_json TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        repository_url TEXT,
        live_url TEXT,
        rubric_score REAL,
        evidence_notes TEXT,
        status TEXT NOT NULL DEFAULT 'in_progress',
        is_public INTEGER DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS mentors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        bio TEXT NOT NULL,
        avatar_url TEXT,
        verified_level TEXT NOT NULL DEFAULT 'Domain Verified Practitioner',
        domains TEXT NOT NULL,
        availability TEXT NOT NULL DEFAULT '3 slots this week',
        hourly_rate TEXT NOT NULL DEFAULT 'Free for Students'
      );

      CREATE TABLE IF NOT EXISTS mentor_requests (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        mentor_id TEXT NOT NULL,
        topic TEXT NOT NULL,
        student_brief TEXT NOT NULL,
        artifact_link TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        feedback TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(mentor_id) REFERENCES mentors(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS activity_events (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        metadata_json TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS mentor_masterclasses (
        id TEXT PRIMARY KEY,
        mentor_id TEXT NOT NULL,
        mentor_name TEXT NOT NULL,
        mentor_company TEXT NOT NULL,
        mentor_avatar TEXT,
        title TEXT NOT NULL,
        topic TEXT NOT NULL,
        scheduled_at TEXT NOT NULL,
        duration_minutes INTEGER DEFAULT 60,
        meeting_url TEXT,
        attendees_count INTEGER DEFAULT 18,
        max_capacity INTEGER DEFAULT 100,
        status TEXT NOT NULL DEFAULT 'upcoming',
        description TEXT NOT NULL,
        FOREIGN KEY(mentor_id) REFERENCES mentors(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS mentor_office_hours (
        id TEXT PRIMARY KEY,
        mentor_id TEXT NOT NULL,
        day_of_week TEXT NOT NULL,
        slot_time TEXT NOT NULL,
        is_booked INTEGER DEFAULT 0,
        FOREIGN KEY(mentor_id) REFERENCES mentors(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS mentor_bookings (
        id TEXT PRIMARY KEY,
        mentor_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        slot_time TEXT NOT NULL,
        topic TEXT NOT NULL,
        student_name TEXT,
        student_email TEXT,
        status TEXT NOT NULL DEFAULT 'confirmed',
        meeting_link TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(mentor_id) REFERENCES mentors(id) ON DELETE CASCADE,
        FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS mentor_articles (
        id TEXT PRIMARY KEY,
        mentor_id TEXT NOT NULL,
        mentor_name TEXT NOT NULL,
        mentor_title TEXT NOT NULL,
        mentor_company TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        read_time TEXT NOT NULL,
        summary TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT NOT NULL,
        published_at TEXT NOT NULL,
        likes_count INTEGER DEFAULT 42
      );

      CREATE TABLE IF NOT EXISTS mentor_applications (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        company TEXT NOT NULL,
        title TEXT NOT NULL,
        experience_years INTEGER NOT NULL,
        career_start_year INTEGER NOT NULL,
        linkedin_url TEXT NOT NULL,
        domains TEXT NOT NULL,
        bio TEXT NOT NULL,
        verification_status TEXT NOT NULL DEFAULT 'verified',
        council_votes_for INTEGER DEFAULT 3,
        council_votes_against INTEGER DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS cryptographic_credentials (
        id TEXT PRIMARY KEY,
        credential_hash TEXT UNIQUE NOT NULL,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        college TEXT,
        degree TEXT,
        artifact_type TEXT NOT NULL,
        artifact_id TEXT,
        artifact_title TEXT NOT NULL,
        artifact_url TEXT,
        rubric_score REAL NOT NULL,
        signature TEXT NOT NULL,
        issuer TEXT NOT NULL DEFAULT 'Beacon Proof-of-Work Protocol (SHA-256 HMAC Verified)',
        issued_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS recruiter_invites (
        id TEXT PRIMARY KEY,
        recruiter_id TEXT NOT NULL,
        recruiter_name TEXT NOT NULL,
        recruiter_company TEXT NOT NULL,
        student_id TEXT NOT NULL,
        role_title TEXT NOT NULL,
        stipend TEXT,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'sent',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Safe dynamic column migrations
    try { db.exec("ALTER TABLE mentors ADD COLUMN experience_years INTEGER DEFAULT 10;"); } catch (e) {}
    try { db.exec("ALTER TABLE mentors ADD COLUMN linkedin_url TEXT;"); } catch (e) {}
    try { db.exec("ALTER TABLE mentors ADD COLUMN career_start_year INTEGER DEFAULT 2014;"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN experience_years INTEGER;"); } catch (e) {}
    try { db.exec("ALTER TABLE users ADD COLUMN linkedin_url TEXT;"); } catch (e) {}

    seedInitialData(db);
  } catch (e) {
    // ignore
  }
}

function seedInitialData(db: Database.Database) {
  try {
    // 1. Ensure Verified Courses are seeded
    const courseCheck = db.prepare("SELECT COUNT(*) as count FROM courses").get() as { count: number };
    if (courseCheck.count === 0) {
      const sampleCourses = [
        {
          id: "crs_1",
          title: "CS50: Introduction to Computer Science",
          provider: "Harvard University / edX",
          category: "Computer Science Foundations",
          level: "Beginner to Intermediate",
          duration: "10-12 weeks (Self-paced)",
          rating: 4.9,
          review_count: 345000,
          is_free: 1,
          url: "https://cs50.harvard.edu/x",
          skills_covered: "C, Python, SQL, Algorithms, Data Structures, Web Dev",
          description: "An introduction to the intellectual enterprises of computer science and the art of programming. Free certificates through Harvard OpenCourseWare.",
          thumbnail_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80"
        },
        {
          id: "crs_2",
          title: "Generative AI with Large Language Models",
          provider: "DeepLearning.AI & AWS",
          category: "Artificial Intelligence",
          level: "Intermediate",
          duration: "4 weeks (8-10 hrs/wk)",
          rating: 4.8,
          review_count: 48200,
          is_free: 1,
          url: "https://www.deeplearning.ai/courses/generative-ai-with-llms/",
          skills_covered: "LLMs, Transformers, Fine-Tuning, LoRA, Prompt Engineering, RLHF",
          description: "Understand the fundamentals of how generative AI works, and how to deploy, evaluate, and tune LLMs in production applications.",
          thumbnail_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80"
        },
        {
          id: "crs_3",
          title: "Full Stack Open (Modern Web Development)",
          provider: "University of Helsinki",
          category: "Full Stack Engineering",
          level: "Intermediate",
          duration: "Comprehensive 13 Parts",
          rating: 4.9,
          review_count: 89000,
          is_free: 1,
          url: "https://fullstackopen.com/en/",
          skills_covered: "React, Redux, Node.js, Express, MongoDB, GraphQL, TypeScript, CI/CD",
          description: "World-class, completely free deep-dive into modern JavaScript-based web development with verified European university credits.",
          thumbnail_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80"
        },
        {
          id: "crs_4",
          title: "System Design & Distributed Primitives",
          provider: "MIT 6.824 / Distributed Systems",
          category: "Systems Engineering",
          level: "Advanced",
          duration: "12 weeks",
          rating: 4.9,
          review_count: 27500,
          is_free: 1,
          url: "https://pdos.csail.mit.edu/6.824/",
          skills_covered: "Raft, Paxos, Fault Tolerance, Sharding, Concurrency, RPC",
          description: "MIT's legendary distributed systems laboratory lectures and exercises with open-source test harnesses.",
          thumbnail_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80"
        },
        {
          id: "crs_5",
          title: "Google Data Analytics Professional Certificate",
          provider: "Google Career Certificates",
          category: "Data Science & Analytics",
          level: "Beginner Friendly",
          duration: "6 months (10 hrs/wk)",
          rating: 4.8,
          review_count: 142000,
          is_free: 0,
          url: "https://grow.google/certificates/data-analytics/",
          skills_covered: "SQL, Spreadsheets, Tableau, R Programming, Data Cleaning",
          description: "Gain in-demand skills that prepare you for an entry-level job in data analytics with real-world case studies from Google.",
          thumbnail_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80"
        }
      ];

      const insertCourse = db.prepare(`
        INSERT INTO courses (id, title, provider, category, level, duration, rating, review_count, is_free, url, skills_covered, description, thumbnail_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const crs of sampleCourses) {
        insertCourse.run(crs.id, crs.title, crs.provider, crs.category, crs.level, crs.duration, crs.rating, crs.review_count, crs.is_free, crs.url, crs.skills_covered, crs.description, crs.thumbnail_url);
      }
    }

    // 2. Ensure Verified Opportunities are seeded
    const oppCheck = db.prepare("SELECT COUNT(*) as count FROM opportunities").get() as { count: number };
    if (oppCheck.count === 0) {
      const sampleOpportunities = [
        {
          id: "opp_isro_01",
          title: "Student Research Internship (Satellite Data Systems)",
          organization: "ISRO - Space Applications Centre (SAC)",
          type: "Internship",
          location: "Ahmedabad, Gujarat (Hybrid)",
          is_remote: 0,
          stipend: "₹18,000 / month + Lab Housing",
          deadline: "2026-11-15",
          source_url: "https://www.isro.gov.in/Careers.html",
          verified_status: "Verified Official Portal",
          last_checked: "Today",
          eligibility_criteria: "B.Tech/BE pre-final & final year students (CSE/IT/ECE). CGPA 7.5+",
          skills_required: JSON.stringify(["Python / C++", "Data Structures", "Linux", "Telemetry APIs"]),
          description: "Work with senior ISRO scientists on high-frequency telemetry ingestion engines and earth-observation geospatial processing pipelines.",
          likes_count: 420,
          applicants_count: 154,
          featured: 1
        },
        {
          id: "opp_google_02",
          title: "Software Student Training in Engineering Program (STEP)",
          organization: "Google India",
          type: "Internship",
          location: "Bengaluru / Hyderabad (Hybrid)",
          is_remote: 0,
          stipend: "₹1,10,000 / month + Health & Relocation",
          deadline: "2026-12-10",
          source_url: "https://careers.google.com/students/",
          verified_status: "Verified Career Portal",
          last_checked: "Today",
          eligibility_criteria: "First-year and second-year undergraduate students in Computer Science or related degree.",
          skills_required: JSON.stringify(["Data Structures", "Algorithms", "C++ / Java", "Problem Solving"]),
          description: "12-week developmental software engineering internship focusing on scalable software systems and 1-on-1 mentorship from Google engineers.",
          likes_count: 1420,
          applicants_count: 980,
          featured: 1
        },
        {
          id: "opp_razorpay_03",
          title: "Software Engineering Intern - Core Payments Platform",
          organization: "Razorpay",
          type: "Internship",
          location: "Bengaluru, Karnataka (Flexible)",
          is_remote: 0,
          stipend: "₹50,000 / month + Relocation",
          deadline: "2026-11-30",
          source_url: "https://razorpay.com/jobs/",
          verified_status: "Verified Career Board",
          last_checked: "Today",
          eligibility_criteria: "Batches of 2026 & 2027. Demonstrable project work on GitHub with REST APIs.",
          skills_required: JSON.stringify(["Node.js / Go", "React", "PostgreSQL", "REST APIs"]),
          description: "Join India's premier payments engine processing millions of transactions per minute with sub-50ms latency.",
          likes_count: 730,
          applicants_count: 420,
          featured: 1
        },
        {
          id: "opp_microsoft_04",
          title: "Microsoft Learn Student Ambassador & Engineering Cohort",
          organization: "Microsoft India",
          type: "Internship",
          location: "Hyderabad / Noida (Hybrid)",
          is_remote: 0,
          stipend: "₹65,000 / month + Surface Grant",
          deadline: "2026-12-05",
          source_url: "https://careers.microsoft.com/students/us/en",
          verified_status: "Verified Official Program",
          last_checked: "Today",
          eligibility_criteria: "Pre-final year students graduating in 2027. All engineering branches.",
          skills_required: JSON.stringify(["Data Structures", "Algorithms", "Cloud (Azure)", "Git / GitHub"]),
          description: "Mentorship program paired with senior Microsoft engineers, culminating in direct summer software engineering offers.",
          likes_count: 1150,
          applicants_count: 810,
          featured: 1
        },
        {
          id: "opp_flipkart_05",
          title: "Flipkart GRiD 7.0 Software Development Track & PPO",
          organization: "Flipkart",
          type: "Hackathon",
          location: "Online + Grand Finale in Bengaluru",
          is_remote: 1,
          stipend: "₹1,50,000 Cash Prize + PPO Interview",
          deadline: "2026-11-20",
          source_url: "https://unstop.com/hackathons/flipkart-grid-60-software-development-track-flipkart-994112",
          verified_status: "Official Unstop Challenge",
          last_checked: "Today",
          eligibility_criteria: "B.Tech/BE batches of 2026, 2027 & 2028. Teams of 2 to 3 students.",
          skills_required: JSON.stringify(["Algorithms", "System Design", "Problem Solving", "Full Stack"]),
          description: "India's premier engineering challenge tackling supply chain routing, catalog indexing, and real-time e-commerce warehouse automation.",
          likes_count: 980,
          applicants_count: 750,
          featured: 1
        },
        {
          id: "opp_sih_06",
          title: "Smart India Hackathon (SIH) 2026 National Finale",
          organization: "Ministry of Education & AICTE",
          type: "Hackathon",
          location: "Pan-India Nodal Centers (On-Site)",
          is_remote: 0,
          stipend: "₹1,00,000 per Problem + Govt Seed Grants",
          deadline: "2026-11-25",
          source_url: "https://sih.gov.in",
          verified_status: "Official Govt of India Portal",
          last_checked: "Today",
          eligibility_criteria: "Teams of 6 students from recognized Indian colleges with at least one female teammate.",
          skills_required: JSON.stringify(["Rapid Prototyping", "Full-Stack Development", "AI / IoT", "Cloud Systems"]),
          description: "World's largest open innovation challenge solving problem statements from 50+ central ministries, state governments, and top PSUs.",
          likes_count: 1650,
          applicants_count: 1200,
          featured: 1
        },
        {
          id: "opp_ethindia_07",
          title: "ETHIndia 2026 Global Hackathon",
          organization: "ETHGlobal & Devfolio",
          type: "Hackathon",
          location: "Bengaluru, Karnataka (In-Person)",
          is_remote: 0,
          stipend: "₹85,00,000+ ($100k+) in Bounties",
          deadline: "2026-12-01",
          source_url: "https://ethindia.co",
          verified_status: "Official Devfolio Event",
          last_checked: "Today",
          eligibility_criteria: "Open to all students, builders, and designers worldwide.",
          skills_required: JSON.stringify(["Solidity / Rust", "React / Next.js", "Smart Contracts", "APIs"]),
          description: "Asia's largest Ethereum hackathon with 2,000+ hackers building open financial systems, identity tooling, and decentralized apps.",
          likes_count: 890,
          applicants_count: 610,
          featured: 0
        },
        {
          id: "opp_nasa_08",
          title: "NASA Space Apps Challenge Global Hackathon",
          organization: "NASA & Global Space Agencies",
          type: "Hackathon",
          location: "Online + 300+ Local Cities Worldwide",
          is_remote: 1,
          stipend: "Global Winner Accolades + NASA Launch Invite",
          deadline: "2026-10-31",
          source_url: "https://www.spaceappschallenge.org",
          verified_status: "Official NASA Challenge",
          last_checked: "Today",
          eligibility_criteria: "Open to students, coders, scientists, and makers worldwide.",
          skills_required: JSON.stringify(["Data Analytics", "Python", "Orbital Science", "UI/UX"]),
          description: "Annual 48-hour global hackathon utilizing NASA open earth and space data to solve real-world challenges on Earth and in space.",
          likes_count: 670,
          applicants_count: 480,
          featured: 0
        },
        {
          id: "opp_gsoc_09",
          title: "Google Summer of Code 2027 Fellowship",
          organization: "The Linux Foundation & CNCF (Google)",
          type: "Fellowship",
          location: "100% Remote",
          is_remote: 1,
          stipend: "₹2,65,000 Total ($3,000 USD)",
          deadline: "2027-02-15",
          source_url: "https://summerofcode.withgoogle.com",
          verified_status: "Annual Global Program",
          last_checked: "Verified",
          eligibility_criteria: "Students and open source beginners aged 18+.",
          skills_required: JSON.stringify(["Git / GitHub", "Open Source", "Python / Go", "System Software"]),
          description: "Global 12-week program bringing student contributors into open source software development on Kubernetes, Envoy, and Linux.",
          likes_count: 1280,
          applicants_count: 890,
          featured: 1
        },
        {
          id: "opp_amazon_10",
          title: "Software Development Engineer (SDE) Intern",
          organization: "Amazon India",
          type: "Internship",
          location: "Bengaluru / Hyderabad / Chennai",
          is_remote: 0,
          stipend: "₹80,000 / month + Housing Allowance",
          deadline: "2026-12-15",
          source_url: "https://amazon.jobs/en/teams/student-programs",
          verified_status: "Verified Career Portal",
          last_checked: "Today",
          eligibility_criteria: "Penultimate year undergraduate/master's students in Computer Science or related fields.",
          skills_required: JSON.stringify(["Java / C++", "Data Structures", "Algorithms", "Object-Oriented Design"]),
          description: "Build scalable distributed services and customer-facing features utilized by millions of Amazon customers.",
          likes_count: 950,
          applicants_count: 680,
          featured: 1
        }
      ];

      const insertOpp = db.prepare(`
        INSERT INTO opportunities (
          id, title, organization, type, location, is_remote, stipend, deadline, source_url, verified_status, last_checked, eligibility_criteria, skills_required, description, likes_count, applicants_count, featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const o of sampleOpportunities) {
        insertOpp.run(o.id, o.title, o.organization, o.type, o.location, o.is_remote, o.stipend, o.deadline, o.source_url, o.verified_status, o.last_checked, o.eligibility_criteria, o.skills_required, o.description, o.likes_count, o.applicants_count, o.featured);
      }
    }

    // 4. Ensure Mentors have 10+ year experience fields populated
    try {
      db.prepare(`
        UPDATE mentors SET 
          experience_years = CASE 
            WHEN id = 'men_01' THEN 11
            WHEN id = 'men_02' THEN 12
            WHEN id = 'men_03' THEN 10
            ELSE 10
          END,
          career_start_year = CASE 
            WHEN id = 'men_01' THEN 2015
            WHEN id = 'men_02' THEN 2014
            WHEN id = 'men_03' THEN 2016
            ELSE 2015
          END,
          linkedin_url = CASE 
            WHEN id = 'men_01' THEN 'https://linkedin.com/in/priya-sen-sre'
            WHEN id = 'men_02' THEN 'https://linkedin.com/in/karan-verma-ml'
            WHEN id = 'men_03' THEN 'https://linkedin.com/in/sneha-mukherjee-design'
            ELSE 'https://linkedin.com'
          END
      `).run();
    } catch (e) {}

    // 5. Seed Live Virtual Masterclasses (Phase 3)
    const mcCheck = db.prepare("SELECT COUNT(*) as count FROM mentor_masterclasses").get() as { count: number };
    if (mcCheck.count === 0) {
      const sampleMasterclasses = [
        {
          id: "mc_01",
          mentor_id: "men_01",
          mentor_name: "Priya Sen",
          mentor_company: "Razorpay (Ex-Cisco)",
          mentor_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
          title: "Designing High-Throughput Distributed Payment Systems at 25k RPS",
          topic: "Distributed Systems & Idempotency",
          scheduled_at: "2026-11-04T18:00:00Z",
          duration_minutes: 60,
          meeting_url: "https://meet.google.com/bcn-dist-sys",
          attendees_count: 42,
          max_capacity: 100,
          status: "upcoming",
          description: "Deep teardown of real-world distributed transaction pipelines. We will trace payment webhooks, database connection starvation, and zero-loss Kafka consumer offset recovery."
        },
        {
          id: "mc_02",
          mentor_id: "men_02",
          mentor_name: "Karan Verma",
          mentor_company: "Microsoft IDC, Hyderabad",
          mentor_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
          title: "Production LLM Inference Optimization: Quantization (AWQ/GGUF) & vLLM",
          topic: "Machine Learning & Performance",
          scheduled_at: "2026-11-08T17:30:00Z",
          duration_minutes: 75,
          meeting_url: "https://meet.google.com/bcn-llm-opt",
          attendees_count: 67,
          max_capacity: 100,
          status: "upcoming",
          description: "Step-by-step masterclass on deploying frontier open-weights models (Llama 3.3, Mistral) on commodity GPUs with paged attention, continuous batching, and sub-50ms TTFT."
        },
        {
          id: "mc_03",
          mentor_id: "men_03",
          mentor_name: "Sneha Mukherjee",
          mentor_company: "Cred (Ex-Swiggy)",
          mentor_avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
          title: "Foundational Product Taste: Building Software Founders Actually Want to Use",
          topic: "Product Architecture & Typography",
          scheduled_at: "2026-11-12T19:00:00Z",
          duration_minutes: 60,
          meeting_url: "https://meet.google.com/bcn-prod-taste",
          attendees_count: 31,
          max_capacity: 80,
          status: "upcoming",
          description: "Why most student portfolios look amateur and how to cultivate tactile micro-interactions, symmetric layout hierarchies, and high-contrast typography that impress hiring managers."
        }
      ];

      const insertMc = db.prepare(`
        INSERT INTO mentor_masterclasses (
          id, mentor_id, mentor_name, mentor_company, mentor_avatar, title, topic, scheduled_at, duration_minutes, meeting_url, attendees_count, max_capacity, status, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const m of sampleMasterclasses) {
        insertMc.run(m.id, m.mentor_id, m.mentor_name, m.mentor_company, m.mentor_avatar, m.title, m.topic, m.scheduled_at, m.duration_minutes, m.meeting_url, m.attendees_count, m.max_capacity, m.status, m.description);
      }
    }

    // 6. Seed Architecture Teardowns & Guides (Phase 3)
    const artCheck = db.prepare("SELECT COUNT(*) as count FROM mentor_articles").get() as { count: number };
    if (artCheck.count === 0) {
      const sampleArticles = [
        {
          id: "art_01",
          mentor_id: "men_01",
          mentor_name: "Priya Sen",
          mentor_title: "Staff SRE",
          mentor_company: "Razorpay",
          title: "Tuning Linux Epoll and PostgreSQL Connection Pools for 100k Simultaneous Concurrency",
          category: "Systems & Infrastructure",
          read_time: "7 min read",
          summary: "Why blindly increasing max_connections destroys PostgreSQL throughput and how to tune PgBouncer with transaction-level pooling in production Kubernetes clusters.",
          content: "In high-throughput fintech infrastructure, connection churn is the silent killer of databases. When an application spikes to 50,000 active client connections, each backend PostgreSQL worker thread consumes RAM, context switching spikes exponentially, and lock contention triggers cascade timeouts...",
          tags: JSON.stringify(["PostgreSQL", "Linux", "PgBouncer", "Kubernetes", "High Concurrency"]),
          published_at: "2026-10-20",
          likes_count: 89
        },
        {
          id: "art_02",
          mentor_id: "men_02",
          mentor_name: "Karan Verma",
          mentor_title: "Senior ML Engineer",
          mentor_company: "Microsoft IDC",
          title: "KV Cache Eviction Strategies & FlashAttention-3 in Latency-Critical RAG Pipelines",
          category: "Generative AI & Inference",
          read_time: "9 min read",
          summary: "A practical practitioner breakdown of memory bandwidth constraints when deploying 70B parameter models for enterprise document retrieval.",
          content: "In large language model deployment, memory bandwidth rather than raw compute is the primary bottleneck during token generation. For every token generated, the model must read all weights and the entire KV cache history from HBM into SRAM...",
          tags: JSON.stringify(["LLMs", "vLLM", "FlashAttention", "PyTorch", "GPU Memory"]),
          published_at: "2026-10-22",
          likes_count: 114
        },
        {
          id: "art_03",
          mentor_id: "men_03",
          mentor_name: "Sneha Mukherjee",
          mentor_title: "Principal Designer",
          mentor_company: "Cred",
          title: "The Architecture of Dark Mode: Why Contrast Math (#020617 vs #000000) Matters",
          category: "Design & UX Architecture",
          read_time: "5 min read",
          summary: "Mathematical guidelines for WCAG AAA compliance, surface elevation tokens, and avoiding pure black eye fatigue in engineering tools.",
          content: "Pure black (#000000) causes intense halation on OLED screens when juxtaposed with bright white text. Professional developer tools use obsidian slate palettes (#020617, #0f172a) with distinct z-axis elevation borders (#1e293b) to provide tactile depth...",
          tags: JSON.stringify(["Dark Mode", "UI/UX", "Tailwind CSS", "WCAG Accessibility"]),
          published_at: "2026-10-24",
          likes_count: 67
        }
      ];

      const insertArt = db.prepare(`
        INSERT INTO mentor_articles (
          id, mentor_id, mentor_name, mentor_title, mentor_company, title, category, read_time, summary, content, tags, published_at, likes_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const a of sampleArticles) {
        insertArt.run(a.id, a.mentor_id, a.mentor_name, a.mentor_title, a.mentor_company, a.title, a.category, a.read_time, a.summary, a.content, a.tags, a.published_at, a.likes_count);
      }
    }

    // 7. Seed Mentor Council Applications (Phase 3)
    const appCheck = db.prepare("SELECT COUNT(*) as count FROM mentor_applications").get() as { count: number };
    if (appCheck.count === 0) {
      db.prepare(`
        INSERT INTO mentor_applications (
          id, name, email, company, title, experience_years, career_start_year, linkedin_url, domains, bio, verification_status, council_votes_for, council_votes_against
        ) VALUES 
        (
          'app_mentor_01', 'Arjun Nambiar', 'arjun.n@uber.com', 'Uber', 'Principal Software Engineer',
          13, 2013, 'https://linkedin.com/in/arjunnambiar-uber', '["Distributed Systems","Go","Kafka"]',
          '13 years architecting dispatch and geospatial matching engines across Uber and Grab.', 'verified', 4, 0
        ),
        (
          'app_mentor_02', 'Dr. Meera Iyer', 'meera@iisc.ac.in', 'IISc Bangalore (Ex-Google Brain)', 'Adjunct Research Scientist',
          14, 2012, 'https://linkedin.com/in/meera-iyer-research', '["Machine Learning","PyTorch","Computer Vision"]',
          '14+ years research experience in sparse neural networks and edge vision transformers.', 'pending', 2, 0
        )
      `).run();
    }

    // 8. Seed Initial Cryptographic Proof-of-Work Credentials (Phase 5)
    const credCheck = db.prepare("SELECT COUNT(*) as count FROM cryptographic_credentials").get() as { count: number };
    if (credCheck.count === 0) {
      db.prepare(`
        INSERT INTO cryptographic_credentials (
          id, credential_hash, user_id, user_name, college, degree, artifact_type, artifact_id, artifact_title, artifact_url, rubric_score, signature, issuer, issued_at
        ) VALUES 
        (
          'cred_init_01', 'BCN-POW-8E4A-91C2', 'usr_student_01', 'Aabhas Goswami', 'National Institute of Technology Kurukshetra (NITK)',
          'B.Tech Robotics & Machine Learning', 'Project Codebase', 'proj_01', 'Autonomous Edge Telemetry & High-Throughput Stream Processor',
          'https://github.com/aabhas/edge-telemetry-engine', 94.5,
          'a89fbc01d9238e4a91c2b57e9301daec72109841bbcefa0143892019ab76ef02',
          'Beacon Proof-of-Work Protocol (SHA-256 HMAC Verified)', '2026-10-25T14:30:00Z'
        ),
        (
          'cred_init_02', 'BCN-POW-4F1D-77B0', 'usr_student_01', 'Aabhas Goswami', 'National Institute of Technology Kurukshetra (NITK)',
          'B.Tech Robotics & Machine Learning', 'Project Codebase', 'proj_02', 'Distributed Append-Only Consensus Ledger in Go & Raft',
          'https://github.com/aabhas/distributed-consensus-ledger', 91.0,
          '58e41a9bc74f1d77b029a109ecf80214deba7011984210ab721980314bcfe019',
          'Beacon Proof-of-Work Protocol (SHA-256 HMAC Verified)', '2026-10-26T09:15:00Z'
        )
      `).run();
    }
  } catch (e) {
    // ignore
  }
}

const db = {
  prepare: (sql: string) => getDb().prepare(sql),
  exec: (sql: string) => getDb().exec(sql),
};

export default db;
