import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { runOverlapDetection } from "../src/lib/overlap-detector";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting CaseLens database seeding...");

  // Clear existing records to ensure clean state
  await prisma.caseRemark.deleteMany();
  await prisma.caseStatusHistory.deleteMany();
  await prisma.overlapSuggestion.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.institution.deleteMany();
  await prisma.user.deleteMany();
  await prisma.appSetting.deleteMany();

  console.log("🧹 Cleared existing data.");

  // 1. Seed demo officer & admin accounts
  const adminPasswordHash = await bcrypt.hash("Admin@CaseLens2026!", 10);
  const bureauPasswordHash = await bcrypt.hash("Bureau@CaseLens2026!", 10);
  const regionalPasswordHash = await bcrypt.hash("Regional@CaseLens2026!", 10);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@caselens.aicte.gov.in",
      name: "Dr. Alok Verma (Director General)",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      department: "Institutional Vigilance & Governance",
      region: "HQ",
      isActive: true,
    },
  });

  const bureauUser = await prisma.user.create({
    data: {
      email: "bureau.officer@caselens.aicte.gov.in",
      name: "Smt. Sunita Rao (Chief Vigilance Officer)",
      passwordHash: bureauPasswordHash,
      role: "BUREAU_OFFICER",
      department: "Approval Bureau",
      region: "HQ",
      isActive: true,
    },
  });

  const roNorthUser = await prisma.user.create({
    data: {
      email: "ro.north@caselens.aicte.gov.in",
      name: "Shri Rajesh Sharma (Regional Officer)",
      passwordHash: regionalPasswordHash,
      role: "REGIONAL_OFFICER",
      department: "North Regional Office",
      region: "North",
      isActive: true,
    },
  });

  const roSouthUser = await prisma.user.create({
    data: {
      email: "ro.south@caselens.aicte.gov.in",
      name: "Dr. K. S. Ramanathan (Regional Officer)",
      passwordHash: regionalPasswordHash,
      role: "REGIONAL_OFFICER",
      department: "South Regional Office",
      region: "South",
      isActive: true,
    },
  });

  console.log("👤 Created 4 demo officer accounts.");

  // 2. Seed 10 Fictional Institutions
  const institutionsData = [
    {
      name: "Apex Institute of Engineering & Technology",
      aictePid: "1-3512891910",
      region: "North",
      state: "Delhi NCR",
      city: "New Delhi",
      institutionType: "Engineering & Technology",
    },
    {
      name: "Bharati College of Engineering & Research",
      aictePid: "1-4829103811",
      region: "West",
      state: "Maharashtra",
      city: "Pune",
      institutionType: "Engineering & Technology",
    },
    {
      name: "Royal Polytechnic & Technological Institute",
      aictePid: "1-2910481722",
      region: "South",
      state: "Karnataka",
      city: "Bengaluru",
      institutionType: "Polytechnic",
    },
    {
      name: "Nalanda Institute of Management Studies",
      aictePid: "1-5910283744",
      region: "East",
      state: "Bihar",
      city: "Patna",
      institutionType: "Management",
    },
    {
      name: "Vindhya Technical Academy",
      aictePid: "1-6920194825",
      region: "Central",
      state: "Madhya Pradesh",
      city: "Bhopal",
      institutionType: "Engineering & Technology",
    },
    {
      name: "Aravalli College of Pharmacy",
      aictePid: "1-7482910346",
      region: "North-West",
      state: "Rajasthan",
      city: "Jaipur",
      institutionType: "Pharmacy",
    },
    {
      name: "Deccan Institute of Advanced Technology",
      aictePid: "1-8392019477",
      region: "South-West",
      state: "Telangana",
      city: "Hyderabad",
      institutionType: "Engineering & Technology",
    },
    {
      name: "Kolkata Engineering & Marine Academy",
      aictePid: "1-9201948288",
      region: "East",
      state: "West Bengal",
      city: "Kolkata",
      institutionType: "Engineering & Technology",
    },
    {
      name: "Gujarat Technological Poly-Campus",
      aictePid: "1-1029384759",
      region: "West",
      state: "Gujarat",
      city: "Ahmedabad",
      institutionType: "Polytechnic",
    },
    {
      name: "Himalayan Institute of Science & Technology",
      aictePid: "1-1192837460",
      region: "North",
      state: "Himachal Pradesh",
      city: "Shimla",
      institutionType: "Engineering & Technology",
    },
  ];

  const createdInstitutions = [];
  for (const inst of institutionsData) {
    const created = await prisma.institution.create({
      data: { ...inst, isDemo: true },
    });
    createdInstitutions.push(created);
  }

  console.log(`🏛️ Seeded ${createdInstitutions.length} fictional institutions.`);

  const instApex = createdInstitutions[0]; // Apex (North)
  const instBharati = createdInstitutions[1]; // Bharati (West)
  const instRoyal = createdInstitutions[2]; // Royal Poly (South)
  const instNalanda = createdInstitutions[3]; // Nalanda (East)
  const instVindhya = createdInstitutions[4]; // Vindhya (Central)
  const instAravalli = createdInstitutions[5]; // Aravalli (North-West)
  const instDeccan = createdInstitutions[6]; // Deccan (South-West)
  const instKolkata = createdInstitutions[7]; // Kolkata (East)
  const instGujarat = createdInstitutions[8]; // Gujarat (West)
  const instHimalayan = createdInstitutions[9]; // Himalayan (North)

  // 3. Seed 40 complaints with 3 intentionally overlapping groups
  const complaintsData = [
    // --- OVERLAP GROUP 1: Illegal Fee Demands & Threat to Bar Exams at Apex Institute ---
    {
      caseId: "AICTE-2026-FEE001",
      studentName: "Aditya Verma",
      studentEmail: "aditya.v.student@example.com",
      studentPhone: "+91 98765 43210",
      institutionId: instApex.id,
      aictePid: instApex.aictePid,
      category: "Excessive Fee / Capitation Fee",
      subject: "Demand for unauthorized Special Development Fee of Rs 65,000 before semester exams",
      description: "Apex Institute management has issued an unofficial notice demanding an immediate payment of Rs 65,000 under the pretext of 'Special Development and Lab Modernization Fee'. No formal AICTE approved fee breakdown or university clearance is shown. The accounts department is threatening to withhold exam hall tickets for 6th semester Computer Science students if not deposited within 3 days in cash or unverified trust account.",
      status: "UNDER_REVIEW",
      priority: "CRITICAL",
      department: "Finance & Regulatory Bureau",
      assignedOfficerId: bureauUser.id,
      createdAt: new Date("2026-10-15T10:00:00Z"),
    },
    {
      caseId: "AICTE-2026-FEE002",
      studentName: "Pooja Sharma",
      studentEmail: "pooja.sharma22@example.com",
      studentPhone: "+91 98765 11223",
      institutionId: instApex.id,
      aictePid: instApex.aictePid,
      category: "Excessive Fee / Capitation Fee",
      subject: "Extortionate lab development fee of Rs 65,000 without fee receipt at Apex Institute",
      description: "College authorities at Apex Institute of Engineering are forcing students to pay an extra Rs 65,000 lab equipment and development levy. When we requested GST receipts or official AICTE approval letters, the registrar refused and threatened cancellation of exam admit cards. Multiple students from 3rd year are being debarred from sitting for internal tests.",
      status: "IN_PROGRESS",
      priority: "CRITICAL",
      department: "Finance & Regulatory Bureau",
      assignedOfficerId: roNorthUser.id,
      createdAt: new Date("2026-10-18T14:30:00Z"),
    },
    {
      caseId: "AICTE-2026-FEE003",
      studentName: "Mohit Jindal",
      studentEmail: "mohit.jindal99@example.com",
      studentPhone: "+91 98111 22334",
      institutionId: instApex.id,
      aictePid: instApex.aictePid,
      category: "Excessive Fee / Capitation Fee",
      subject: "Coercive fee demand of sixty five thousand rupees under threat of exam debarment",
      description: "Notice was circulated in classrooms directing all B.Tech students to pay sixty-five thousand rupees as additional infrastructure and development charge. They are not providing any official AICTE sanctioned receipt and denying hall tickets to whoever objects. This is direct violation of AICTE Fee Regulatory Committee guidelines.",
      status: "SUBMITTED",
      priority: "HIGH",
      department: "Approval Bureau",
      createdAt: new Date("2026-10-21T09:15:00Z"),
    },

    // --- OVERLAP GROUP 2: Lab Infrastructure Deficiencies & Defunct Equipment at Bharati College ---
    {
      caseId: "AICTE-2026-INF001",
      studentName: "Sanket Deshmukh",
      studentEmail: "sanket.deshmukh@example.com",
      studentPhone: "+91 97654 32109",
      institutionId: instBharati.id,
      aictePid: instBharati.aictePid,
      category: "Infrastructure & Laboratory Deficiencies",
      subject: "Non-functional mechanical engineering lab equipment and non-existent CNC machines",
      description: "Bharati College of Engineering has claimed modern automated manufacturing and CNC laboratories during AICTE inspection, but none of the machines are functional. Out of 40 computers in the CAD/CAM lab, only 8 have working monitors and software licenses expired two years ago. Students are forced to complete practical records using simulated dummy data without hands-on lab experience.",
      status: "UNDER_REVIEW",
      priority: "HIGH",
      department: "Approval Bureau",
      assignedOfficerId: bureauUser.id,
      createdAt: new Date("2026-09-28T11:00:00Z"),
    },
    {
      caseId: "AICTE-2026-INF002",
      studentName: "Tanvi Kulkarni",
      studentEmail: "tanvi.kulkarni@example.com",
      studentPhone: "+91 98220 12345",
      institutionId: instBharati.id,
      aictePid: instBharati.aictePid,
      category: "Infrastructure & Laboratory Deficiencies",
      subject: "Severe deficiency in engineering labs, broken equipment and expired software licenses",
      description: "We are final year mechanical students at Bharati College. The CNC machine shown during AICTE accreditation is a non-working dummy model. Computers in the simulation lab do not have licensed software and faculty admits equipment is defunct. Despite charging full tuition and laboratory fees, students have zero practical access.",
      status: "ASSIGNED",
      priority: "HIGH",
      department: "Approval Bureau",
      assignedOfficerId: bureauUser.id,
      createdAt: new Date("2026-10-04T16:20:00Z"),
    },
    {
      caseId: "AICTE-2026-INF003",
      studentName: "Pranav Patil",
      studentEmail: "pranav.patil@example.com",
      studentPhone: "+91 98231 67890",
      institutionId: instBharati.id,
      aictePid: instBharati.aictePid,
      category: "Infrastructure & Laboratory Deficiencies",
      subject: "Bharati College labs lack basic equipment and safety measures mandated by AICTE",
      description: "The mechanical workshop and CAD/CAM laboratory at Bharati College Pune are completely dilapidated. Machines are unserviced for years, wiring is dangerously exposed, and CAD workstations fail to boot. AICTE inspection criteria are openly violated while management ignores student written representations.",
      status: "SUBMITTED",
      priority: "MEDIUM",
      department: "Approval Bureau",
      createdAt: new Date("2026-10-12T13:45:00Z"),
    },

    // --- OVERLAP GROUP 3: Withholding Original Certificates & Transcripts at Royal Polytechnic ---
    {
      caseId: "AICTE-2026-CRT001",
      studentName: "Kavitha Murthy",
      studentEmail: "kavitha.m@example.com",
      studentPhone: "+91 94480 12345",
      institutionId: instRoyal.id,
      aictePid: instRoyal.aictePid,
      category: "Withholding of Original Certificates / Degrees",
      subject: "Refusal to return original 10th marksheet and transfer certificate after diploma completion",
      description: "I graduated from Royal Polytechnic in July 2026. The administrative office is illegally withholding my original Class 10 marksheet, migration certificate, and diploma completion certificate. They are insisting on a compulsory Rs 25,000 'Alumni Building Fund' donation before handing over my documents, even though all semester dues are cleared.",
      status: "IN_PROGRESS",
      priority: "CRITICAL",
      department: "Student Welfare & Grievance Cell",
      assignedOfficerId: roSouthUser.id,
      createdAt: new Date("2026-10-02T10:10:00Z"),
    },
    {
      caseId: "AICTE-2026-CRT002",
      studentName: "Naveen Gowda",
      studentEmail: "naveen.gowda98@example.com",
      studentPhone: "+91 94490 54321",
      institutionId: instRoyal.id,
      aictePid: instRoyal.aictePid,
      category: "Withholding of Original Certificates / Degrees",
      subject: "Royal Polytechnic withholding original certificates demanding alumni corpus donation",
      description: "College administration refuses to release original school certificates and transfer certificate. They claim students must mandatorily deposit twenty-five thousand rupees into an alumni building trust. AICTE public notice clearly prohibits retaining original certificates of students. I need my certificates urgently for degree engineering lateral entry.",
      status: "UNDER_REVIEW",
      priority: "CRITICAL",
      department: "Student Welfare & Grievance Cell",
      assignedOfficerId: roSouthUser.id,
      createdAt: new Date("2026-10-06T15:00:00Z"),
    },
    {
      caseId: "AICTE-2026-CRT003",
      studentName: "Harish Kumar",
      studentEmail: "harish.k.poly@example.com",
      studentPhone: "+91 94801 88776",
      institutionId: instRoyal.id,
      aictePid: instRoyal.aictePid,
      category: "Withholding of Original Certificates / Degrees",
      subject: "Non-return of original documents and blackmailing for building fund at Royal Polytechnic",
      description: "Royal Polytechnic Bangalore principal office is not returning original 10th and 12th certificates. Despite obtaining no-dues clearance from library and labs, they demand twenty five thousand donation receipt. Lateral admission deadline at VTU is approaching and career is at severe risk.",
      status: "SUBMITTED",
      priority: "HIGH",
      department: "Student Welfare & Grievance Cell",
      createdAt: new Date("2026-10-14T11:25:00Z"),
    },

    // --- OTHER DIVERSE COMPLAINTS (Totaling 40 cases across various institutions) ---
    {
      caseId: "AICTE-2026-GEN004",
      studentName: "Rohan Mukherjee",
      studentEmail: "rohan.m@example.com",
      institutionId: instKolkata.id,
      aictePid: instKolkata.aictePid,
      category: "Faculty Shortage & Non-Payment of Salaries",
      subject: "Severe faculty deficit in Marine Engineering branch",
      description: "Key courses such as Marine Auxiliary Machinery and Naval Architecture have had zero qualified professors for two consecutive semesters. Guest lecturers take classes irregularly without covering the curriculum.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      department: "Policy & Academic Planning Bureau",
      assignedOfficerId: bureauUser.id,
      createdAt: new Date("2026-08-15T09:00:00Z"),
    },
    {
      caseId: "AICTE-2026-GEN005",
      studentName: "Ananya Sen",
      studentEmail: "ananya.sen@example.com",
      institutionId: instNalanda.id,
      aictePid: instNalanda.aictePid,
      category: "Admission Irregularities / Non-Refund of Fees",
      subject: "Non-refund of admission fee after timely cancellation within AICTE cutoff window",
      description: "Seat cancellation request was formally submitted 12 days prior to the AICTE last date. Institute deducted 100% of the tuition fee of Rs 1,40,000 citing internal institutional bylaws.",
      status: "RESOLVED",
      priority: "MEDIUM",
      department: "Finance & Regulatory Bureau",
      assignedOfficerId: adminUser.id,
      resolutionNotes: "Institution directed to refund Rs 1,39,000 (after Rs 1,000 processing fee deduction) under AICTE Admission Norms Annexure IV. Refund receipt verified on 24-Oct-2026.",
      createdAt: new Date("2026-07-20T10:30:00Z"),
    },
    {
      caseId: "AICTE-2026-GEN006",
      studentName: "Vikram Rathore",
      studentEmail: "vikram.rathore@example.com",
      institutionId: instAravalli.id,
      aictePid: instAravalli.aictePid,
      category: "Curriculum & Examination Irregularities",
      subject: "Out-of-syllabus questions and erratic grading in Pharmacology IV examination",
      description: "More than 40% of marks in the end-semester paper were on advanced clinical topics not included in PCI/AICTE standard syllabus. Re-evaluation requests were unilaterally rejected.",
      status: "UNDER_REVIEW",
      priority: "MEDIUM",
      department: "Policy & Academic Planning Bureau",
      assignedOfficerId: bureauUser.id,
      createdAt: new Date("2026-09-10T14:15:00Z"),
    },
    {
      caseId: "AICTE-2026-GEN007",
      studentName: "Sneha Reddy",
      studentEmail: "sneha.reddy@example.com",
      institutionId: instDeccan.id,
      aictePid: instDeccan.aictePid,
      category: "Ragging & Student Harassment",
      subject: "Inactive Anti-Ragging Committee and harassment in university hostel",
      description: "Hostel wardens failed to respond to written complaints regarding late-night harassment by senior students. The official Anti-Ragging toll-free number displayed on campus boards is disconnected.",
      status: "IN_PROGRESS",
      priority: "CRITICAL",
      department: "Student Welfare & Grievance Cell",
      assignedOfficerId: adminUser.id,
      createdAt: new Date("2026-10-11T19:00:00Z"),
    },
    {
      caseId: "AICTE-2026-GEN008",
      studentName: "Deepak Chouhan",
      studentEmail: "deepak.c@example.com",
      institutionId: instVindhya.id,
      aictePid: instVindhya.aictePid,
      category: "Hostel & Mess Sanitation / Safety Deficiencies",
      subject: "Unhygienic drinking water resulting in viral gastroenteritis outbreak",
      description: "Over 35 hostel inmates tested positive for waterborne bacterial infection due to non-functional RO plants and uncleaned overhead tanks. Administration has not provided medical assistance.",
      status: "RESOLVED",
      priority: "HIGH",
      department: "Student Welfare & Grievance Cell",
      resolutionNotes: "District Health Officer inspected campus. Water purification filters replaced and certified clean. Medical camp organized.",
      createdAt: new Date("2026-08-01T12:00:00Z"),
    },
    {
      caseId: "AICTE-2026-GEN009",
      studentName: "Bhavik Patel",
      studentEmail: "bhavik.p@example.com",
      institutionId: instGujarat.id,
      aictePid: instGujarat.aictePid,
      category: "Fake / Unapproved Courses & Misleading Advertisements",
      subject: "Misleading advertisement regarding AICTE approval for Diploma in AI & Robotics",
      description: "Institute prospectus claimed the new 3-year Diploma in Artificial Intelligence is AICTE approved. Upon verification on AICTE Approval Portal, no such intake was sanctioned.",
      status: "UNDER_REVIEW",
      priority: "HIGH",
      department: "Approval Bureau",
      assignedOfficerId: bureauUser.id,
      createdAt: new Date("2026-09-05T15:30:00Z"),
    },
    {
      caseId: "AICTE-2026-GEN010",
      studentName: "Meenakshi Sundaram",
      studentEmail: "meenakshi.s@example.com",
      institutionId: instDeccan.id,
      aictePid: instDeccan.aictePid,
      category: "Discriminatory Practices / Gender Bias",
      subject: "Discriminatory hostel curfews and restrictions on female research scholars",
      description: "Female PhD and PG scholars are barred from entering central computing laboratories after 6:30 PM, whereas male scholars have 24/7 access. Complaints to internal ICC cell have yielded no action.",
      status: "ASSIGNED",
      priority: "MEDIUM",
      department: "Student Welfare & Grievance Cell",
      assignedOfficerId: bureauUser.id,
      createdAt: new Date("2026-09-22T08:45:00Z"),
    },
    {
      caseId: "AICTE-2026-GEN011",
      studentName: "Rakesh Dogra",
      studentEmail: "rakesh.dogra@example.com",
      institutionId: instHimalayan.id,
      aictePid: instHimalayan.aictePid,
      category: "Infrastructure & Laboratory Deficiencies",
      subject: "Lack of winter heating and cracked structural pillars in civil engineering block",
      description: "Severe seismic cracks on the 2nd floor civil engineering wing have not been repaired. Classrooms lack basic insulation and temperatures drop below freezing during lectures.",
      status: "SUBMITTED",
      priority: "HIGH",
      department: "Approval Bureau",
      createdAt: new Date("2026-10-19T11:10:00Z"),
    },
    {
      caseId: "AICTE-2026-GEN012",
      studentName: "Kunal Bansal",
      studentEmail: "kunal.b@example.com",
      institutionId: instApex.id,
      aictePid: instApex.aictePid,
      category: "Faculty Shortage & Non-Payment of Salaries",
      subject: "Mass resignation of computer science faculty due to 6 months unpaid salaries",
      description: "Seven senior assistant professors resigned last month because Apex Institute management has withheld faculty compensation since April. Core subjects are now unsupervised.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      department: "Institutional Vigilance Cell",
      assignedOfficerId: roNorthUser.id,
      createdAt: new Date("2026-09-14T10:00:00Z"),
    },
    {
      caseId: "AICTE-2026-GEN013",
      studentName: "Priyanka Tiwari",
      studentEmail: "priyanka.t@example.com",
      institutionId: instVindhya.id,
      aictePid: instVindhya.aictePid,
      category: "Admission Irregularities / Non-Refund of Fees",
      subject: "Charging unauthorized donation for institutional quota seat",
      description: "College asked for cash donation of Rs 2,00,000 for granting admission in Electronics branch beyond the state centralized counseling fee.",
      status: "UNDER_REVIEW",
      priority: "CRITICAL",
      department: "Finance & Regulatory Bureau",
      assignedOfficerId: bureauUser.id,
      createdAt: new Date("2026-09-01T16:20:00Z"),
    },
    {
      caseId: "AICTE-2026-GEN014",
      studentName: "Arunachalam S.",
      studentEmail: "arun.s@example.com",
      institutionId: instRoyal.id,
      aictePid: instRoyal.aictePid,
      category: "Excessive Fee / Capitation Fee",
      subject: "Mandatory fee for private placement training company",
      description: "Polytechnic has tied up with an unauthorized private coaching center and added Rs 18,000 mandatory fee to the semester bill without approval from state DTE.",
      status: "RESOLVED",
      priority: "MEDIUM",
      department: "Finance & Regulatory Bureau",
      resolutionNotes: "Management directed to keep coaching optional. Excess fee adjusted towards subsequent semester tuition.",
      createdAt: new Date("2026-06-15T10:00:00Z"),
    },
    {
      caseId: "AICTE-2026-GEN015",
      studentName: "Manish Kumar",
      studentEmail: "manish.k@example.com",
      institutionId: instNalanda.id,
      aictePid: instNalanda.aictePid,
      category: "Curriculum & Examination Irregularities",
      subject: "Delay in declaring semester results exceeding 7 months",
      description: "MBA 3rd semester exam was held in January 2026, but results have still not been published as of August, jeopardizing placement offers and university registrations.",
      status: "CLOSED",
      priority: "LOW",
      department: "Policy & Academic Planning Bureau",
      resolutionNotes: "Results tabulated and released following controller of examinations review.",
      createdAt: new Date("2026-05-10T14:00:00Z"),
    },
    {
      caseId: "AICTE-2026-GEN016",
      studentName: "Shreya Joshi",
      studentEmail: "shreya.j@example.com",
      institutionId: instBharati.id,
      aictePid: instBharati.aictePid,
      category: "Ragging & Student Harassment",
      subject: "Cyberbullying and unauthorized photography in college campus",
      description: "Students circulated morphed photographs in college WhatsApp groups without consent. Grievance cell dismissed the matter without taking statements.",
      status: "ASSIGNED",
      priority: "HIGH",
      department: "Student Welfare & Grievance Cell",
      assignedOfficerId: bureauUser.id,
      createdAt: new Date("2026-09-18T17:15:00Z"),
    },
    {
      caseId: "AICTE-2026-GEN017",
      studentName: "Devendra Rawat",
      studentEmail: "devendra.r@example.com",
      institutionId: instHimalayan.id,
      aictePid: instHimalayan.aictePid,
      category: "Faculty Shortage & Non-Payment of Salaries",
      subject: "No faculty for Environmental Engineering subject",
      description: "Syllabus remains 80% incomplete due to absence of subject specialist professor.",
      status: "SUBMITTED",
      priority: "LOW",
      department: "Policy & Academic Planning Bureau",
      createdAt: new Date("2026-10-23T11:40:00Z"),
    },
    {
      caseId: "AICTE-2026-GEN018",
      studentName: "Hardik Trivedi",
      studentEmail: "hardik.t@example.com",
      institutionId: instGujarat.id,
      aictePid: instGujarat.aictePid,
      category: "Excessive Fee / Capitation Fee",
      subject: "Unwarranted penalty of Rs 500 per day for minor library return delays",
      description: "Polytechnic imposes Rs 500 daily fines on book delays, accumulating to tens of thousands of rupees before exams.",
      status: "RESOLVED",
      priority: "LOW",
      department: "Finance & Regulatory Bureau",
      resolutionNotes: "Library committee capped late fine at standard Rs 5 per day.",
      createdAt: new Date("2026-07-12T12:00:00Z"),
    },
    {
      caseId: "AICTE-2026-GEN019",
      studentName: "Geeta Kumari",
      studentEmail: "geeta.k@example.com",
      institutionId: instNalanda.id,
      aictePid: instNalanda.aictePid,
      category: "Discriminatory Practices / Gender Bias",
      subject: "Non-constitution of Internal Complaints Committee (ICC) as per AICTE Regulations",
      description: "Institution lacks a notified POSH / ICC committee. Complaints of harassment are referred to all-male administrative trustees.",
      status: "IN_PROGRESS",
      priority: "CRITICAL",
      department: "Institutional Vigilance Cell",
      assignedOfficerId: adminUser.id,
      createdAt: new Date("2026-09-25T13:30:00Z"),
    },
    {
      caseId: "AICTE-2026-GEN020",
      studentName: "Samarjit Roy",
      studentEmail: "samarjit.r@example.com",
      institutionId: instKolkata.id,
      aictePid: instKolkata.aictePid,
      category: "Infrastructure & Laboratory Deficiencies",
      subject: "Non-functional life-saving equipment in Marine training simulator",
      description: "The maritime bridge simulator software crashed 6 months ago. Fire safety breathing apparatus bottles in the safety drill room are empty.",
      status: "UNDER_REVIEW",
      priority: "CRITICAL",
      department: "Approval Bureau",
      assignedOfficerId: bureauUser.id,
      createdAt: new Date("2026-10-01T15:45:00Z"),
    },
    {
      caseId: "AICTE-2026-GEN021",
      studentName: "Rohit Nair",
      studentEmail: "rohit.nair@example.com",
      institutionId: instDeccan.id,
      aictePid: instDeccan.aictePid,
      category: "Withholding of Original Certificates / Degrees",
      subject: "Refusal to issue provisional degree certificate without placement clearance",
      description: "College insists that students who secured off-campus job offers must sign over 1 month salary or be denied their provisional certificate.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      department: "Student Welfare & Grievance Cell",
      assignedOfficerId: roSouthUser.id,
      createdAt: new Date("2026-10-08T16:00:00Z"),
    },
    {
      caseId: "AICTE-2026-GEN022",
      studentName: "Tarun Chawla",
      studentEmail: "tarun.c@example.com",
      institutionId: instApex.id,
      aictePid: instApex.aictePid,
      category: "Hostel & Mess Sanitation / Safety Deficiencies",
      subject: "Substandard mess food and hygiene violations in Apex boys hostel",
      description: "Insects discovered repeatedly in cooked food. Multiple students contracted severe typhoid fever in September.",
      status: "UNDER_REVIEW",
      priority: "HIGH",
      department: "Student Welfare & Grievance Cell",
      assignedOfficerId: roNorthUser.id,
      createdAt: new Date("2026-09-30T18:20:00Z"),
    },
    {
      caseId: "AICTE-2026-GEN023",
      studentName: "Ankit Meena",
      studentEmail: "ankit.meena@example.com",
      institutionId: instAravalli.id,
      aictePid: instAravalli.aictePid,
      category: "Admission Irregularities / Non-Refund of Fees",
      subject: "Unauthorized forfeiture of security caution money deposit",
      description: "Pharmacy college refused refund of Rs 20,000 refundable caution money upon course completion claiming library book wear-and-tear.",
      status: "RESOLVED",
      priority: "MEDIUM",
      department: "Finance & Regulatory Bureau",
      resolutionNotes: "Caution deposit audited and transferred to student bank account on 15-Oct-2026.",
      createdAt: new Date("2026-08-25T11:15:00Z"),
    },
    {
      caseId: "AICTE-2026-GEN024",
      studentName: "Megha Gupta",
      studentEmail: "megha.g@example.com",
      institutionId: instBharati.id,
      aictePid: instBharati.aictePid,
      category: "Faculty Shortage & Non-Payment of Salaries",
      subject: "No PhD guide allocated for Artificial Intelligence research scholars",
      description: "Scholars registered in 2024 have not been assigned any recognized research supervisor as promised during AICTE PhD admission scheme.",
      status: "ASSIGNED",
      priority: "MEDIUM",
      department: "Research & Faculty Development Bureau",
      assignedOfficerId: bureauUser.id,
      createdAt: new Date("2026-09-12T10:30:00Z"),
    },
    {
      caseId: "AICTE-2026-GEN025",
      studentName: "Saurabh Mishra",
      studentEmail: "saurabh.m@example.com",
      institutionId: instVindhya.id,
      aictePid: instVindhya.aictePid,
      category: "Curriculum & Examination Irregularities",
      subject: "Exam center changed to a location 95 km away on the morning of test",
      description: "Due to server failure at college, 200 students were told to report to a remote center without transport provision, causing 45 students to miss the examination.",
      status: "UNDER_REVIEW",
      priority: "HIGH",
      department: "Policy & Academic Planning Bureau",
      assignedOfficerId: bureauUser.id,
      createdAt: new Date("2026-10-16T08:00:00Z"),
    },
    {
      caseId: "AICTE-2026-GEN026",
      studentName: "Pallavi Ghosh",
      studentEmail: "pallavi.ghosh@example.com",
      institutionId: instKolkata.id,
      aictePid: instKolkata.aictePid,
      category: "Ragging & Student Harassment",
      subject: "Verbal humiliation and psychological harassment by department head",
      description: "HOD frequently uses abusive language and threatens to fail students in project evaluations if they report faculty absence.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      department: "Student Welfare & Grievance Cell",
      assignedOfficerId: adminUser.id,
      createdAt: new Date("2026-10-09T14:00:00Z"),
    },
    {
      caseId: "AICTE-2026-GEN027",
      studentName: "Dharmesh Soni",
      studentEmail: "dharmesh.s@example.com",
      institutionId: instGujarat.id,
      aictePid: instGujarat.aictePid,
      category: "Fake / Unapproved Courses & Misleading Advertisements",
      subject: "College issuing certificates with forged AICTE / NBA logos",
      description: "Graduation diploma certificates carry fake NBA accredited crests despite the polytechnic never receiving accreditation.",
      status: "UNDER_REVIEW",
      priority: "CRITICAL",
      department: "Institutional Vigilance Cell",
      assignedOfficerId: bureauUser.id,
      createdAt: new Date("2026-10-17T16:15:00Z"),
    },
    {
      caseId: "AICTE-2026-GEN028",
      studentName: "Ashish Thakur",
      studentEmail: "ashish.t@example.com",
      institutionId: instHimalayan.id,
      aictePid: instHimalayan.aictePid,
      category: "Excessive Fee / Capitation Fee",
      subject: "Charging Rs 15,000 mandatory bus fee even for students living in adjacent village",
      description: "College transport fee is compulsorily levied on all enrolled students regardless of residential proximity.",
      status: "SUBMITTED",
      priority: "LOW",
      department: "Finance & Regulatory Bureau",
      createdAt: new Date("2026-10-24T09:30:00Z"),
    },
    {
      caseId: "AICTE-2026-GEN029",
      studentName: "Gautam Nair",
      studentEmail: "gautam.nair@example.com",
      institutionId: instDeccan.id,
      aictePid: instDeccan.aictePid,
      category: "Faculty Shortage & Non-Payment of Salaries",
      subject: "VLSI Design laboratory supervised by non-technical lab assistants",
      description: "Due to lack of faculty in Electronics department, complex VLSI lab assignments are left to uncertified lab attendants.",
      status: "UNDER_REVIEW",
      priority: "MEDIUM",
      department: "Approval Bureau",
      assignedOfficerId: bureauUser.id,
      createdAt: new Date("2026-09-29T11:50:00Z"),
    },
    {
      caseId: "AICTE-2026-GEN030",
      studentName: "Nitin Saxena",
      studentEmail: "nitin.saxena@example.com",
      institutionId: instApex.id,
      aictePid: instApex.aictePid,
      category: "Admission Irregularities / Non-Refund of Fees",
      subject: "Non-refund of caution deposit for batch 2022-26 graduates",
      description: "Graduating batch of 120 students have submitted caution deposit refund forms 4 months ago; management has not disbursed refunds.",
      status: "UNDER_REVIEW",
      priority: "MEDIUM",
      department: "Finance & Regulatory Bureau",
      assignedOfficerId: roNorthUser.id,
      createdAt: new Date("2026-10-20T15:10:00Z"),
    },
    {
      caseId: "AICTE-2026-GEN031",
      studentName: "Swati Bhatt",
      studentEmail: "swati.bhatt@example.com",
      institutionId: instBharati.id,
      aictePid: instBharati.aictePid,
      category: "Hostel & Mess Sanitation / Safety Deficiencies",
      subject: "Lack of female security guards and CCTV blind spots in girls hostel",
      description: "Multiple external trespassers spotted near hostel ground floor windows. Requests for boundary lighting and night female guards ignored.",
      status: "IN_PROGRESS",
      priority: "CRITICAL",
      department: "Student Welfare & Grievance Cell",
      assignedOfficerId: adminUser.id,
      createdAt: new Date("2026-10-13T20:10:00Z"),
    },
  ];

  console.log(`📝 Seeding ${complaintsData.length} fictional complaints...`);

  const createdComplaints = [];
  for (const c of complaintsData) {
    const created = await prisma.complaint.create({
      data: {
        ...c,
        isDemo: true,
        dueDate: new Date(new Date(c.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    createdComplaints.push(created);

    // Add status history entry
    await prisma.caseStatusHistory.create({
      data: {
        caseId: created.id,
        previousStatus: "NONE",
        newStatus: created.status,
        reason: "Initial complaint logging & triage",
        createdAt: created.createdAt,
      },
    });

    // Add sample internal remark for active/under review cases
    if (created.status !== "SUBMITTED") {
      await prisma.caseRemark.create({
        data: {
          caseId: created.id,
          userId: created.assignedOfficerId || adminUser.id,
          remark: `Automated triage note: Initial scrutiny of documents initiated. Category assigned to ${created.department}.`,
          isInternal: true,
          createdAt: new Date(new Date(created.createdAt).getTime() + 2 * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log(`✅ Seeded ${createdComplaints.length} complaints with audit & remark records.`);

  // 4. Initial audit logs
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      userEmail: adminUser.email,
      userRole: adminUser.role,
      action: "SYSTEM_INITIALIZED",
      entityType: "System",
      details: "CaseLens database seeded with 10 institutions and 31 complaints including 3 overlap test clusters.",
      ipAddress: "127.0.0.1",
    },
  });

  // 5. Seed default AppSettings
  await prisma.appSetting.createMany({
    data: [
      { key: "SYSTEM_NAME", value: "CaseLens – AICTE Integrated Case Monitoring", description: "Application display name" },
      { key: "OVERLAP_THRESHOLD", value: "35", description: "Minimum percentage threshold for overlap suggestions" },
      { key: "SLA_DAYS", value: "30", description: "Default SLA target for complaint resolution in days" },
      { key: "DEMO_MODE", value: "true", description: "Fictional demonstration prototype mode active" },
    ],
  });

  // 6. Run overlap detection across all seeded complaints!
  console.log("🔍 Computing automated overlap detection scores for seeded cases...");
  const overlapScanResult = await runOverlapDetection();
  console.log(`🎯 Generated ${overlapScanResult.createdCount} overlap suggestions across cases.`);

  console.log("🎉 Seeding complete successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

