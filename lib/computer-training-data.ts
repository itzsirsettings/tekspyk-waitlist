// lib/computer-training-data.ts
// Single source of truth for the Professional Computer Training Skills Program.
// Derived from TekSpyk_Computer_Training_Curriculum.md

export interface CtWeek {
  id: string;
  title: string;
  topics: string[];
  practicals: string[];
  project?: string;
}

export interface CtMonth {
  id: string;
  title: string;
  weeks: CtWeek[];
}

export interface AssessmentRow {
  label: string;
  percentage: number;
}

export interface GradingRow {
  range: string;
  grade: string;
}

// ─── 3-MONTH PROGRAM ────────────────────────────────────────────────────────

export const CT_THREE_MONTH: CtMonth[] = [
  {
    id: "3m-month1",
    title: "Month 1 – Computer Fundamentals & Digital Literacy",
    weeks: [
      {
        id: "3m-w1",
        title: "Week 1: Introduction to Computers",
        topics: [
          "Meaning and uses of computers",
          "Types of computers",
          "Computer hardware and software",
          "Input, output, and storage devices",
          "CPU, monitor, keyboard, mouse, printer, scanner",
          "Proper computer handling",
          "Starting and shutting down a computer correctly",
        ],
        practicals: [
          "Identify computer components",
          "Connect basic peripherals",
          "Start and shut down a computer",
          "Practice mouse control",
        ],
      },
      {
        id: "3m-w2",
        title: "Week 2: Windows and File Management",
        topics: [
          "Introduction to Windows",
          "Desktop, icons, taskbar, Start menu",
          "Opening and closing applications",
          "Creating folders",
          "Creating, renaming, moving, copying, and deleting files",
          "Recycle Bin",
          "USB flash drives and external storage",
          "Installing and uninstalling basic applications",
          "Keyboard shortcuts",
        ],
        practicals: [
          "Create a personal folder structure",
          "Copy files between folders and USB drives",
          "Organize documents properly",
        ],
      },
      {
        id: "3m-w3",
        title: "Week 3: Keyboarding & Microsoft Word Basics",
        topics: [
          "Keyboard layout",
          "Correct typing posture",
          "Home-row keys",
          "Speed and accuracy exercises",
          "Microsoft Word interface",
          "Creating and saving documents",
          "Fonts and text formatting",
          "Paragraph alignment",
          "Line spacing",
          "Bullets and numbering",
        ],
        practicals: [
          "Type a formal letter",
          "Create a one-page school/business document",
          "Formatting exercise",
        ],
      },
      {
        id: "3m-w4",
        title: "Week 4: Microsoft Word Intermediate",
        topics: [
          "Page setup",
          "Margins and orientation",
          "Headers and footers",
          "Page numbers",
          "Tables",
          "Borders and shading",
          "Images and shapes",
          "Text boxes",
          "Columns",
          "Find and Replace",
          "Spell checking",
          "Printing documents",
        ],
        practicals: [],
        project: "Create a professionally formatted letter, CV, school notice, and business document.",
      },
    ],
  },
  {
    id: "3m-month2",
    title: "Month 2 – Microsoft Office, Internet & Digital Productivity",
    weeks: [
      {
        id: "3m-w5",
        title: "Week 5: Microsoft Excel Basics",
        topics: [
          "Introduction to spreadsheets",
          "Workbook and worksheet",
          "Rows, columns, and cells",
          "Data entry",
          "Formatting cells",
          "Basic arithmetic",
          "AutoFill",
          "Sorting data",
          "SUM, AVERAGE, MIN, MAX, COUNT functions",
        ],
        practicals: [
          "Create a student result sheet",
          "Create a simple expense record",
          "Create a sales record",
        ],
      },
      {
        id: "3m-w6",
        title: "Week 6: Microsoft Excel Intermediate",
        topics: [
          "Percentage calculations",
          "IF function",
          "COUNTIF",
          "SUMIF",
          "Conditional formatting",
          "Data validation",
          "Tables",
          "Charts",
          "Filtering and sorting",
          "Basic financial calculations",
        ],
        practicals: [],
        project: "Create a complete school fees tracker or small-business income and expense tracker.",
      },
      {
        id: "3m-w7",
        title: "Week 7: Microsoft PowerPoint",
        topics: [
          "Creating presentations",
          "Slide layouts",
          "Themes",
          "Text formatting",
          "Shapes and icons",
          "Adding pictures",
          "Charts and tables",
          "Transitions",
          "Animations",
          "Presenter view",
          "Slide show setup",
          "Presentation principles",
        ],
        practicals: [],
        project: "Create and present a professional 8–10 slide presentation.",
      },
      {
        id: "3m-w8",
        title: "Week 8: Internet & Digital Skills",
        topics: [
          "Internet fundamentals",
          "Web browsers",
          "Search engines",
          "Effective online research",
          "Downloads and uploads",
          "Email and sending attachments",
          "Cloud storage and Google Drive basics",
          "Online forms and video meetings",
          "Digital communication etiquette",
          "Strong passwords and two-factor authentication",
          "Phishing and malware awareness",
          "Scam detection and safe browsing",
          "Privacy and protecting personal information",
        ],
        practicals: [
          "Create and send a professional email",
          "Upload and share files",
          "Conduct online research",
          "Identify suspicious messages",
        ],
      },
    ],
  },
  {
    id: "3m-month3",
    title: "Month 3 – Graphic Design, Coding & Professional Skills",
    weeks: [
      {
        id: "3m-w9",
        title: "Week 9: Graphic Design Fundamentals",
        topics: [
          "Introduction to graphic design",
          "Design principles",
          "Colour theory",
          "Typography",
          "Alignment",
          "Contrast",
          "Hierarchy",
          "Balance",
          "White space",
          "Image resolution",
          "RGB and CMYK",
          "Common image and file formats",
        ],
        practicals: [
          "Create a social media post",
          "Create a simple flyer",
        ],
      },
      {
        id: "3m-w10",
        title: "Week 10: Intermediate Graphic Design",
        topics: [
          "Logo fundamentals",
          "Business cards",
          "Flyers",
          "Posters",
          "Social media graphics",
          "Background removal",
          "Image editing",
          "Working with layers",
          "Exporting designs",
          "Print preparation",
        ],
        practicals: [],
        project: "Develop a mini brand package containing a logo, business card, promotional flyer, and social media post.",
      },
      {
        id: "3m-w11",
        title: "Week 11: Introduction to Coding & Web Development",
        topics: [
          "Meaning of programming",
          "How websites work",
          "Introduction to HTML",
          "HTML document structure",
          "Headings, paragraphs, images, links, lists, tables, forms",
          "Introduction to CSS",
          "Colours, fonts, margins, padding, borders",
        ],
        practicals: ["Build a simple personal web page."],
      },
      {
        id: "3m-w12",
        title: "Week 12: Web Design Project & Final Assessment",
        topics: [
          "CSS layouts",
          "Responsive design basics",
          "Navigation menus",
          "Buttons and forms",
          "Introduction to JavaScript",
          "Variables, basic events, and simple interactions",
          "Website publishing concepts",
        ],
        practicals: [],
        project: "Build a responsive mini website with a home page, about section, services section, and contact section.",
      },
    ],
  },
];

// ─── 6-MONTH PROGRAM ────────────────────────────────────────────────────────

export const CT_SIX_MONTH: CtMonth[] = [
  {
    id: "6m-month1",
    title: "Month 1 – Computer Fundamentals",
    weeks: [
      {
        id: "6m-w1",
        title: "Week 1: Introduction to ICT",
        topics: [
          "Introduction to ICT",
          "History and generations of computers",
          "Types of computers",
          "Applications of computers",
        ],
        practicals: [],
      },
      {
        id: "6m-w2",
        title: "Week 2: Computer Hardware",
        topics: [
          "Computer hardware components",
          "Internal and external components",
          "Input, output, and storage devices",
          "Basic troubleshooting",
        ],
        practicals: [],
      },
      {
        id: "6m-w3",
        title: "Week 3: Operating Systems",
        topics: [
          "Operating systems overview",
          "Windows environment",
          "Desktop customization",
          "Application management",
        ],
        practicals: [],
      },
      {
        id: "6m-w4",
        title: "Week 4: File Management & Keyboarding",
        topics: [
          "File management",
          "Storage systems",
          "USB drives and compression",
          "Backup principles",
          "Keyboarding and shortcuts",
        ],
        practicals: [],
        project: "Organize a complete digital filing system and complete typing proficiency exercises.",
      },
    ],
  },
  {
    id: "6m-month2",
    title: "Month 2 – Microsoft Office Professional Skills",
    weeks: [
      {
        id: "6m-w5",
        title: "Week 5: Microsoft Word Basics",
        topics: [
          "Creating documents",
          "Formatting text",
          "Paragraphs and lists",
          "Page setup",
        ],
        practicals: [],
      },
      {
        id: "6m-w6",
        title: "Week 6: Microsoft Word Advanced",
        topics: [
          "Tables and images",
          "Headers, footers, and sections",
          "Styles and table of contents",
          "Mail merge and templates",
        ],
        practicals: [],
        project: "Create a professional CV, business letter, report, and certificate.",
      },
      {
        id: "6m-w7",
        title: "Week 7: Microsoft Excel Fundamentals",
        topics: [
          "Worksheets and formatting",
          "Formulas: SUM, AVERAGE, COUNT, MIN, MAX",
        ],
        practicals: [],
      },
      {
        id: "6m-w8",
        title: "Week 8: Excel Intermediate",
        topics: [
          "IF, SUMIF, COUNTIF functions",
          "Percentage and conditional formatting",
          "Data validation, sorting, filtering",
          "Charts",
        ],
        practicals: [],
        project: "Create a school or business financial workbook.",
      },
    ],
  },
  {
    id: "6m-month3",
    title: "Month 3 – Advanced Office & Internet Productivity",
    weeks: [
      {
        id: "6m-w9",
        title: "Week 9: Advanced Excel",
        topics: [
          "Multiple worksheets",
          "Absolute and relative references",
          "Logical functions and lookup concepts",
          "Data cleaning",
          "PivotTable fundamentals",
          "Charts and reporting dashboards",
        ],
        practicals: [],
      },
      {
        id: "6m-w10",
        title: "Week 10: PowerPoint",
        topics: [
          "Professional presentation design",
          "Layout, images, icons, and charts",
          "Animation, transitions, and delivery",
        ],
        practicals: [],
      },
      {
        id: "6m-w11",
        title: "Week 11: Internet & Cloud Productivity",
        topics: [
          "Search techniques and email",
          "Google Drive and online collaboration",
          "Google Docs, Sheets, and Forms",
          "File sharing and video conferencing",
        ],
        practicals: [],
      },
      {
        id: "6m-w12",
        title: "Week 12: Cybersecurity & Digital Citizenship",
        topics: [
          "Password security and MFA",
          "Phishing, malware, and social engineering",
          "Online scams and data privacy",
          "Device security and safe social networking",
          "Digital footprint",
        ],
        practicals: [],
        project: "Create a complete digital office workflow using documents, spreadsheets, email, and cloud storage.",
      },
    ],
  },
  {
    id: "6m-month4",
    title: "Month 4 – Graphic Design",
    weeks: [
      {
        id: "6m-w13",
        title: "Week 13: Design Fundamentals",
        topics: [
          "Elements and principles of design",
          "Colour theory and typography",
          "Layout, composition, and branding basics",
        ],
        practicals: [],
      },
      {
        id: "6m-w14",
        title: "Week 14: Graphic Design Tools",
        topics: [
          "Interface navigation",
          "Shapes, text, and images",
          "Layers, alignment, and background removal",
          "Image enhancement",
        ],
        practicals: [],
      },
      {
        id: "6m-w15",
        title: "Week 15: Marketing Designs",
        topics: [
          "Creating flyers, posters, and banners",
          "Social media graphics",
          "Invitations and certificates",
        ],
        practicals: [],
      },
      {
        id: "6m-w16",
        title: "Week 16: Branding",
        topics: [
          "Logo principles and brand colours",
          "Typography systems",
          "Business cards and letterheads",
          "Brand identity consistency",
        ],
        practicals: [],
        project: "Develop a professional brand identity for a fictional or real business.",
      },
    ],
  },
  {
    id: "6m-month5",
    title: "Month 5 – Web Development & Coding",
    weeks: [
      {
        id: "6m-w17",
        title: "Week 17: Programming Fundamentals",
        topics: [
          "What programming is",
          "Algorithms and problem solving",
          "Programming logic",
          "Variables, data types, conditions, loops, functions",
        ],
        practicals: [],
      },
      {
        id: "6m-w18",
        title: "Week 18: HTML",
        topics: [
          "Document structure and semantic HTML",
          "Links, images, lists, tables, forms",
        ],
        practicals: [],
      },
      {
        id: "6m-w19",
        title: "Week 19: CSS",
        topics: [
          "Colours and typography",
          "Box model, Flexbox, and Grid",
          "Responsive layouts",
          "Navigation, buttons, cards, and mobile responsiveness",
        ],
        practicals: [],
      },
      {
        id: "6m-w20",
        title: "Week 20: JavaScript Introduction",
        topics: [
          "Variables, operators, and functions",
          "Conditions, arrays, and events",
          "DOM basics and form interaction",
        ],
        practicals: [],
        project: "Build a responsive business website.",
      },
    ],
  },
  {
    id: "6m-month6",
    title: "Month 6 – Advanced Digital Skills & Capstone Project",
    weeks: [
      {
        id: "6m-w21",
        title: "Week 21: Advanced Web Development",
        topics: [
          "Responsive and mobile-first design",
          "Multi-page websites",
          "Forms, optimization, and accessibility fundamentals",
          "Browser testing",
        ],
        practicals: [],
      },
      {
        id: "6m-w22",
        title: "Week 22: AI & Modern Productivity",
        topics: [
          "Introduction to Artificial Intelligence",
          "Generative AI concepts and responsible usage",
          "Prompt writing",
          "Using AI for research, writing, data organization, design, coding, and productivity",
          "Verifying AI-generated information",
          "Privacy when using AI tools",
        ],
        practicals: [],
      },
      {
        id: "6m-w23",
        title: "Week 23: Workplace & Freelancing Skills",
        topics: [
          "Professional email and CV preparation",
          "Portfolio creation and customer communication",
          "Freelancing fundamentals",
          "Receiving project briefs and pricing concepts",
          "File delivery, time management, and professional ethics",
        ],
        practicals: [],
      },
      {
        id: "6m-w24",
        title: "Week 24: Final Capstone & Examination",
        topics: [],
        practicals: [],
        project: "Each student completes a professional portfolio containing Microsoft Word documents, Excel financial tracker, PowerPoint presentation, graphic design package, responsive website, digital skills demonstration, and a final presentation.",
      },
    ],
  },
];

// ─── ASSESSMENT & GRADING ────────────────────────────────────────────────────

export const CT_ASSESSMENT: AssessmentRow[] = [
  { label: "Weekly Practical Exercises", percentage: 20 },
  { label: "Assignments", percentage: 10 },
  { label: "Monthly Projects", percentage: 20 },
  { label: "Final Practical Examination", percentage: 30 },
  { label: "Final Capstone Project", percentage: 20 },
];

export const CT_GRADING: GradingRow[] = [
  { range: "80–100%", grade: "Distinction" },
  { range: "70–79%", grade: "Excellent" },
  { range: "60–69%", grade: "Very Good" },
  { range: "50–59%", grade: "Good" },
  { range: "Below 50%", grade: "Requires Improvement" },
];

// ─── OUTCOMES ────────────────────────────────────────────────────────────────

export const CT_OUTCOMES_3M: string[] = [
  "Operate a computer confidently",
  "Manage files and folders",
  "Type and format professional documents",
  "Work with Microsoft Word",
  "Perform common calculations in Excel",
  "Create PowerPoint presentations",
  "Use email and internet services safely",
  "Create basic graphic designs",
  "Build a basic website with HTML/CSS",
  "Understand fundamental cybersecurity practices",
];

export const CT_OUTCOMES_6M: string[] = [
  "Use Microsoft Office confidently for professional work",
  "Create structured Excel reports and dashboards",
  "Produce professional graphic designs",
  "Develop basic brand identities",
  "Build responsive websites",
  "Use HTML, CSS, and introductory JavaScript",
  "Apply basic programming logic",
  "Use AI productivity tools responsibly",
  "Protect devices and accounts from common cybersecurity threats",
  "Work with cloud collaboration tools",
  "Prepare a professional CV and portfolio",
  "Handle simple real-world client projects",
  "Present and defend completed projects professionally",
];
