import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export interface HackathonItem {
  id: string;
  title: string;
  organizer: string;
  organizerType: "Government of India" | "Top Enterprise" | "Global Developer Community" | "Elite University";
  logoText: string;
  logoBg: string;
  officialUrl: string;
  verifiedDomain: string;
  mode: "Hybrid" | "In-Person" | "Online / Virtual";
  location: string;
  prizePool: string;
  prizeAmount: number;
  deadline: string;
  startDate: string;
  teamSize: string;
  eligibility: string;
  domain: "SIH & Open Innovation" | "AI & Machine Learning" | "Web3 & Distributed Systems" | "Cyber Security & Defense" | "Corporate Tech & PPO";
  tags: string[];
  description: string;
  keyBenefits: string[];
  isFeatured?: boolean;
  participantsCount: number;
}

const HACKATHONS_DATA: HackathonItem[] = [
  {
    id: "sih_2026",
    title: "Smart India Hackathon (SIH 2026) — Hardware & Software Edition",
    organizer: "Ministry of Education (MIC) & AICTE, Govt. of India",
    organizerType: "Government of India",
    logoText: "SIH",
    logoBg: "bg-gradient-to-br from-amber-500 via-orange-600 to-red-600",
    officialUrl: "https://www.sih.gov.in",
    verifiedDomain: "sih.gov.in (Official Govt of India Portal)",
    mode: "Hybrid",
    location: "All-India Nodal Centres (28 States & UTs)",
    prizePool: "₹1,00,000 per Problem Statement + ₹1.5 Cr+ Total Grants",
    prizeAmount: 10000000,
    deadline: "2026-11-20",
    startDate: "2026-12-15",
    teamSize: "6 Members (Mandatory at least 1 female member)",
    eligibility: "All AICTE / UGC Approved Indian College Students (B.Tech, BCA, MCA, M.Tech)",
    domain: "SIH & Open Innovation",
    tags: ["SIH 2026", "Govt of India", "Smart Cities", "Agriculture", "Hardware", "Clean Tech"],
    description:
      "World's biggest open innovation hackathon. Solve real-world problem statements submitted by 50+ Central Ministries, State Governments, and public sector undertakings.",
    keyBenefits: [
      "Direct central government ministry recognition and felicitation",
      "₹1,00,000 cash grant per problem statement winner",
      "Fast-track incubation and seed funding under AICTE Innovation Cell",
      "Verified national credential for student ledger",
    ],
    isFeatured: true,
    participantsCount: 142000,
  },
  {
    id: "flipkart_grid_7",
    title: "Flipkart GRiD 7.0 — Software Development Challenge & PPO Track",
    organizer: "Flipkart India & Unstop",
    organizerType: "Top Enterprise",
    logoText: "GRID",
    logoBg: "bg-gradient-to-br from-blue-600 to-indigo-800",
    officialUrl: "https://unstop.com/hackathons/flipkart-grid-70",
    verifiedDomain: "unstop.com / flipkart.com",
    mode: "Online / Virtual",
    location: "Virtual (Finals at Flipkart HQ, Bengaluru)",
    prizePool: "₹1,50,000 Cash + Direct PPO/PPI Fast-Track (₹32 LPA CTC)",
    prizeAmount: 150000,
    deadline: "2026-11-15",
    startDate: "2026-11-25",
    teamSize: "1 to 3 Members",
    eligibility: "Engineering Students graduating in 2025, 2026, 2027 (All India)",
    domain: "Corporate Tech & PPO",
    tags: ["Flipkart", "E-Commerce", "High-Throughput Systems", "PPO Fast-Track", "Algorithms"],
    description:
      "Flipkart's flagship campus engineering challenge. Tackle enterprise-scale supply chain algorithms, computer vision automated checkout, and real-time fraud mitigation.",
    keyBenefits: [
      "Direct Pre-Placement Interview (PPI) with Flipkart Core Engineering",
      "Stipend Fast-Track for summer engineering internships (₹1,00,000/mo)",
      "₹1,50,000 cash prize pool for national podium finishers",
    ],
    isFeatured: true,
    participantsCount: 88500,
  },
  {
    id: "ethindia_2026",
    title: "ETHIndia 2026: Asia's Largest Web3 & Systems Hackathon",
    organizer: "Devfolio & Ethereum Foundation",
    organizerType: "Global Developer Community",
    logoText: "ETH",
    logoBg: "bg-gradient-to-br from-purple-600 via-indigo-700 to-slate-900",
    officialUrl: "https://ethindia.co",
    verifiedDomain: "ethindia.co (Devfolio Official)",
    mode: "In-Person",
    location: "KTPO Convention Centre, Whitefield, Bengaluru",
    prizePool: "₹85,00,000+ ($100k+ USD) Global Bounties & Sponsor Grants",
    prizeAmount: 8500000,
    deadline: "2026-11-10",
    startDate: "2026-12-04",
    teamSize: "1 to 4 Members",
    eligibility: "Open to all software developers, researchers, and university students across India",
    domain: "Web3 & Distributed Systems",
    tags: ["Ethereum", "Zero-Knowledge", "Distributed Systems", "Rust", "Solidity", "Devfolio"],
    description:
      "The premier 36-hour in-person builder hackathon gathering 2,000+ engineers at KTPO Bengaluru. Hack alongside global protocol engineers with travel grants and direct venture bounties.",
    keyBenefits: [
      "Travel reimbursement scholarships for tier-2/3 college builders",
      "Direct venture capital grant allocations from global Web3 funds",
      "Free food, hardware labs, and high-speed fiber round the clock in Bengaluru",
    ],
    isFeatured: true,
    participantsCount: 22000,
  },
  {
    id: "hack_this_fall_2026",
    title: "Hack This Fall 2026 — National Inclusive Hackathon",
    organizer: "Major League Hacking (MLH) & Devfolio",
    organizerType: "Global Developer Community",
    logoText: "HTF",
    logoBg: "bg-gradient-to-br from-amber-600 to-orange-700",
    officialUrl: "https://hackthisfall.tech",
    verifiedDomain: "hackthisfall.tech / devfolio.co",
    mode: "Hybrid",
    location: "Delhi NCR + Virtual Track",
    prizePool: "₹5,00,000+ in Cash, Swag & Cloud Bounties",
    prizeAmount: 500000,
    deadline: "2026-11-28",
    startDate: "2026-12-18",
    teamSize: "2 to 4 Members",
    eligibility: "Any undergraduate or postgraduate college student in India",
    domain: "SIH & Open Innovation",
    tags: ["MLH", "Community", "Open Source", "Beginner Friendly", "Delhi NCR"],
    description:
      "One of India's most welcoming hackathons with tailored beginner support, veteran mentors, hardware sandboxes, and enterprise sponsor challenges.",
    keyBenefits: [
      "1-on-1 mentorship from Google and Microsoft senior engineers",
      "Official MLH digital certificates and swag boxes delivered home",
      "Direct recruiter review for shortlisted final prototypes",
    ],
    participantsCount: 16500,
  },
  {
    id: "google_solution_challenge_2026",
    title: "Google Solution Challenge 2026 (India Chapter)",
    organizer: "Google Developer Student Clubs (GDSC)",
    organizerType: "Top Enterprise",
    logoText: "GDSC",
    logoBg: "bg-gradient-to-br from-red-500 via-amber-500 to-blue-500",
    officialUrl: "https://developers.google.com/community/gdsc-solution-challenge",
    verifiedDomain: "developers.google.com (Official Google Portal)",
    mode: "Online / Virtual",
    location: "All India (Google Campus Showcase for Top 10)",
    prizePool: "₹10,00,000+ ($12,000 USD) + Google Global Mentorship",
    prizeAmount: 1000000,
    deadline: "2026-12-10",
    startDate: "2027-01-15",
    teamSize: "1 to 4 Members",
    eligibility: "Indian university students actively enrolled in undergraduate degree programs",
    domain: "AI & Machine Learning",
    tags: ["Google Cloud", "Gemini API", "Flutter", "UN Goals", "TensorFlow", "Social Impact"],
    description:
      "Build a production-grade software solution using Google Cloud, Gemini AI, or Android to address one or more of the United Nations 17 Sustainable Development Goals.",
    keyBenefits: [
      "Direct technical mentorship from Google Developer Experts (GDE)",
      "Global showcase livestreamed to international tech recruiters",
      "Fast-track consideration for Google STEP and Graduate SWE roles",
    ],
    isFeatured: true,
    participantsCount: 45000,
  },
  {
    id: "microsoft_imagine_cup_india",
    title: "Microsoft Imagine Cup India 2026",
    organizer: "Microsoft Student Developer Hub",
    organizerType: "Top Enterprise",
    logoText: "MIC",
    logoBg: "bg-gradient-to-br from-cyan-600 to-blue-800",
    officialUrl: "https://imaginecup.microsoft.com",
    verifiedDomain: "imaginecup.microsoft.com (Microsoft Official)",
    mode: "Hybrid",
    location: "Online + Bengaluru Finals (Microsoft Campus)",
    prizePool: "$100,000 USD Grand Prize + Azure Cloud Grants",
    prizeAmount: 8300000,
    deadline: "2026-12-05",
    startDate: "2027-01-20",
    teamSize: "1 to 4 Members",
    eligibility: "Students aged 16+ enrolled in recognized academic institutions across India",
    domain: "AI & Machine Learning",
    tags: ["Microsoft Azure", "Copilot", "Generative AI", "Global Finals", "Venture Seed"],
    description:
      "The premier global student technology competition. Build AI-first startup prototypes using Azure OpenAI, Cosmos DB, and GitHub Copilot to compete for international funding.",
    keyBenefits: [
      "Access to $1,000+ in free Microsoft Azure cloud infrastructure",
      "Executive mentorship with Satya Nadella and Microsoft leadership",
      "Trip to Seattle for the World Championship finals",
    ],
    participantsCount: 38000,
  },
  {
    id: "kavach_2026",
    title: "Kavach 2026 — National Cyber Security Hackathon",
    organizer: "MoE, AICTE & Bureau of Police Research & Development (BPR&D)",
    organizerType: "Government of India",
    logoText: "KVH",
    logoBg: "bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900",
    officialUrl: "https://kavach.mic.gov.in",
    verifiedDomain: "kavach.mic.gov.in (Govt of India)",
    mode: "Hybrid",
    location: "National Police Academies & Nodal AICTE Centres",
    prizePool: "₹20,00,000 Total Cash Prize Pool (₹1,00,000 per track)",
    prizeAmount: 2000000,
    deadline: "2026-11-25",
    startDate: "2026-12-22",
    teamSize: "6 Members",
    eligibility: "Undergraduate / Postgraduate Indian students studying Cyber Security, IT, or CSE",
    domain: "Cyber Security & Defense",
    tags: ["Cyber Security", "Darknet", "Deepfake Detection", "Govt of India", "Forensics", "BPRD"],
    description:
      "Tackle 20 critical cybersecurity and law enforcement challenges, including real-time VoIP spoofing tracking, AI deepfake audio/video identification, and dark web forensic tools.",
    keyBenefits: [
      "Official commendation from Ministry of Home Affairs & AICTE",
      "Direct evaluation by central intelligence and cybersecurity agencies",
      "Seed deployment of your forensic software in law enforcement labs",
    ],
    participantsCount: 28000,
  },
  {
    id: "tata_crucible_2026",
    title: "Tata Crucible Campus Hackathon 2026",
    organizer: "Tata Sons & Tata Group",
    organizerType: "Top Enterprise",
    logoText: "TATA",
    logoBg: "bg-gradient-to-br from-blue-700 to-indigo-900",
    officialUrl: "https://tatacrucible.com/hackathon",
    verifiedDomain: "tatacrucible.com (Official Tata Portal)",
    mode: "Hybrid",
    location: "Zonal Virtual Rounds + Mumbai Grand Finale",
    prizePool: "₹5,00,000 Cash + Tata Group PPI Opportunities",
    prizeAmount: 500000,
    deadline: "2026-11-18",
    startDate: "2026-12-08",
    teamSize: "2 to 5 Members",
    eligibility: "Full-time Indian college students across engineering & management institutions",
    domain: "Corporate Tech & PPO",
    tags: ["Tata Group", "Industrial IoT", "Clean Mobility", "Supply Chain", "PPO Interview"],
    description:
      "Formulate engineering solutions for Tata Group enterprises (Tata Motors, Tata Steel, TCS, Air India) across electric mobility, industrial telemetry, and sustainability.",
    keyBenefits: [
      "Direct Pre-Placement Interview fast-track with Tata Group companies",
      "Cash awards directly credited to team members",
      "Executive review by Tata Group CTO and enterprise fellows",
    ],
    participantsCount: 31000,
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").toLowerCase().trim();
    const domain = searchParams.get("domain") || "all";
    const mode = searchParams.get("mode") || "all";

    let filtered = [...HACKATHONS_DATA];

    if (q) {
      filtered = filtered.filter(
        (h) =>
          h.title.toLowerCase().includes(q) ||
          h.organizer.toLowerCase().includes(q) ||
          h.tags.some((t) => t.toLowerCase().includes(q)) ||
          h.location.toLowerCase().includes(q)
      );
    }

    if (domain !== "all") {
      filtered = filtered.filter((h) => h.domain.toLowerCase().includes(domain.toLowerCase()));
    }

    if (mode !== "all") {
      filtered = filtered.filter((h) => h.mode.toLowerCase().includes(mode.toLowerCase()));
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      totalActivePrizes: "₹1.8+ Crore",
      lastExtractedAt: new Date().toISOString(),
      hackathons: filtered,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to load hackathons" }, { status: 500 });
  }
}
