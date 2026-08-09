export interface Institution {
  id: string;
  officialName: string;
  shortName?: string;
  aliases: string[];
  type: 
    | "IIT"
    | "NIT"
    | "IIIT"
    | "IISc"
    | "IISER"
    | "AIIMS"
    | "IIM"
    | "University"
    | "Deemed University"
    | "Central University"
    | "State University"
    | "Private University"
    | "Engineering College"
    | "Medical College"
    | "Management Institute"
    | "Autonomous College"
    | "Polytechnic"
    | "Junior College"
    | "School"
    | "Other";
  city: string;
  state: string;
}

export const INSTITUTIONS_DATABASE: Institution[] = [
  // IITs
  { id: "iit-m", officialName: "Indian Institute of Technology Madras", shortName: "IITM", aliases: ["IIT Madras", "IITM"], type: "IIT", city: "Chennai", state: "Tamil Nadu" },
  { id: "iit-b", officialName: "Indian Institute of Technology Bombay", shortName: "IITB", aliases: ["IIT Bombay", "IITB"], type: "IIT", city: "Mumbai", state: "Maharashtra" },
  { id: "iit-d", officialName: "Indian Institute of Technology Delhi", shortName: "IITD", aliases: ["IIT Delhi", "IITD"], type: "IIT", city: "New Delhi", state: "Delhi" },
  { id: "iit-kgp", officialName: "Indian Institute of Technology Kharagpur", shortName: "IITKGP", aliases: ["IIT Kharagpur", "IIT KGP"], type: "IIT", city: "Kharagpur", state: "West Bengal" },
  { id: "iit-k", officialName: "Indian Institute of Technology Kanpur", shortName: "IITK", aliases: ["IIT Kanpur", "IITK"], type: "IIT", city: "Kanpur", state: "Uttar Pradesh" },
  { id: "iit-r", officialName: "Indian Institute of Technology Roorkee", shortName: "IITR", aliases: ["IIT Roorkee", "IITR"], type: "IIT", city: "Roorkee", state: "Uttarakhand" },
  { id: "iit-g", officialName: "Indian Institute of Technology Guwahati", shortName: "IITG", aliases: ["IIT Guwahati", "IITG"], type: "IIT", city: "Guwahati", state: "Assam" },
  { id: "iit-h", officialName: "Indian Institute of Technology Hyderabad", shortName: "IITH", aliases: ["IIT Hyderabad", "IITH"], type: "IIT", city: "Sangareddy", state: "Telangana" },
  { id: "iit-bhu", officialName: "Indian Institute of Technology (BHU) Varanasi", shortName: "IIT-BHU", aliases: ["IIT BHU", "IIT Varanasi"], type: "IIT", city: "Varanasi", state: "Uttar Pradesh" },
  { id: "iit-indore", officialName: "Indian Institute of Technology Indore", shortName: "IITI", aliases: ["IIT Indore"], type: "IIT", city: "Indore", state: "Madhya Pradesh" },
  { id: "iit-gn", officialName: "Indian Institute of Technology Gandhinagar", shortName: "IITGN", aliases: ["IIT Gandhinagar"], type: "IIT", city: "Gandhinagar", state: "Gujarat" },
  { id: "iit-ropar", officialName: "Indian Institute of Technology Ropar", shortName: "IIT Ropar", aliases: ["IIT Ropar"], type: "IIT", city: "Rupnagar", state: "Punjab" },
  { id: "iit-patna", officialName: "Indian Institute of Technology Patna", shortName: "IITP", aliases: ["IIT Patna"], type: "IIT", city: "Patna", state: "Bihar" },
  { id: "iit-bbs", officialName: "Indian Institute of Technology Bhubaneswar", shortName: "IITBBS", aliases: ["IIT Bhubaneswar"], type: "IIT", city: "Bhubaneswar", state: "Odisha" },
  { id: "iit-tirupati", officialName: "Indian Institute of Technology Tirupati", shortName: "IITTP", aliases: ["IIT Tirupati"], type: "IIT", city: "Tirupati", state: "Andhra Pradesh" },
  { id: "iit-pkd", officialName: "Indian Institute of Technology Palakkad", shortName: "IITPKD", aliases: ["IIT Palakkad"], type: "IIT", city: "Palakkad", state: "Kerala" },
  { id: "iit-mandi", officialName: "Indian Institute of Technology Mandi", shortName: "IIT Mandi", aliases: ["IIT Mandi"], type: "IIT", city: "Mandi", state: "Himachal Pradesh" },
  { id: "iit-jod", officialName: "Indian Institute of Technology Jodhpur", shortName: "IITJ", aliases: ["IIT Jodhpur"], type: "IIT", city: "Jodhpur", state: "Rajasthan" },

  // NITs
  { id: "nit-trichy", officialName: "National Institute of Technology Tiruchirappalli", shortName: "NITT", aliases: ["NIT Trichy", "NIT Tiruchirappalli"], type: "NIT", city: "Tiruchirappalli", state: "Tamil Nadu" },
  { id: "nit-surathkal", officialName: "National Institute of Technology Karnataka, Surathkal", shortName: "NITK", aliases: ["NIT Surathkal", "NITK"], type: "NIT", city: "Mangaluru", state: "Karnataka" },
  { id: "nit-rourkela", officialName: "National Institute of Technology Rourkela", shortName: "NITR", aliases: ["NIT Rourkela", "NITRKL"], type: "NIT", city: "Rourkela", state: "Odisha" },
  { id: "nit-warangal", officialName: "National Institute of Technology Warangal", shortName: "NITW", aliases: ["NIT Warangal", "NITW"], type: "NIT", city: "Warangal", state: "Telangana" },
  { id: "nit-calicut", officialName: "National Institute of Technology Calicut", shortName: "NITC", aliases: ["NIT Calicut"], type: "NIT", city: "Kozhikode", state: "Kerala" },
  { id: "vnit-nagpur", officialName: "Visvesvaraya National Institute of Technology Nagpur", shortName: "VNIT", aliases: ["VNIT Nagpur", "NIT Nagpur"], type: "NIT", city: "Nagpur", state: "Maharashtra" },
  { id: "mnit-jaipur", officialName: "Malaviya National Institute of Technology Jaipur", shortName: "MNIT", aliases: ["MNIT Jaipur", "NIT Jaipur"], type: "NIT", city: "Jaipur", state: "Rajasthan" },
  { id: "mnnit-allahabad", officialName: "Motilal Nehru National Institute of Technology Allahabad", shortName: "MNNIT", aliases: ["MNNIT Allahabad", "NIT Prayagraj"], type: "NIT", city: "Prayagraj", state: "Uttar Pradesh" },
  { id: "nit-kurukshetra", officialName: "National Institute of Technology Kurukshetra", shortName: "NITKKR", aliases: ["NIT Kurukshetra"], type: "NIT", city: "Kurukshetra", state: "Haryana" },
  { id: "nit-ap", officialName: "National Institute of Technology Andhra Pradesh", shortName: "NITAP", aliases: ["NIT Andhra Pradesh", "NIT AP"], type: "NIT", city: "Tadepalligudem", state: "Andhra Pradesh" },

  // IIITs & IISc
  { id: "iisc", officialName: "Indian Institute of Science Bangalore", shortName: "IISc", aliases: ["IISc Bangalore", "IISc"], type: "IISc", city: "Bengaluru", state: "Karnataka" },
  { id: "iiit-h", officialName: "International Institute of Information Technology Hyderabad", shortName: "IIITH", aliases: ["IIIT Hyderabad", "IIITH"], type: "IIIT", city: "Hyderabad", state: "Telangana" },
  { id: "iiit-b", officialName: "International Institute of Information Technology Bangalore", shortName: "IIITB", aliases: ["IIIT Bangalore", "IIITB"], type: "IIIT", city: "Bengaluru", state: "Karnataka" },
  { id: "iiit-a", officialName: "Indian Institute of Information Technology Allahabad", shortName: "IIITA", aliases: ["IIIT Allahabad", "IIITA"], type: "IIIT", city: "Prayagraj", state: "Uttar Pradesh" },
  { id: "iiit-d", officialName: "Indraprastha Institute of Information Technology Delhi", shortName: "IIITD", aliases: ["IIIT Delhi", "IIITD"], type: "IIIT", city: "New Delhi", state: "Delhi" },
  { id: "iiit-sricity", officialName: "Indian Institute of Information Technology Sri City", shortName: "IIITS", aliases: ["IIIT Sri City"], type: "IIIT", city: "Sri City", state: "Andhra Pradesh" },

  // Major JNTU Universities (High Priority for AP/Telangana)
  { id: "jntuk", officialName: "Jawaharlal Nehru Technological University, Kakinada", shortName: "JNTUK", aliases: ["JNTU Kakinada", "JNTU-K", "JNTU K"], type: "State University", city: "Kakinada", state: "Andhra Pradesh" },
  { id: "jntuh", officialName: "Jawaharlal Nehru Technological University, Hyderabad", shortName: "JNTUH", aliases: ["JNTU Hyderabad", "JNTU-H", "JNTU H"], type: "State University", city: "Hyderabad", state: "Telangana" },
  { id: "jntua", officialName: "Jawaharlal Nehru Technological University Anantapur", shortName: "JNTUA", aliases: ["JNTU Anantapur", "JNTU-A", "JNTU A"], type: "State University", city: "Ananthapuramu", state: "Andhra Pradesh" },

  // Major Universities & Engineering Colleges
  { id: "anna-univ", officialName: "Anna University, Chennai", shortName: "AU", aliases: ["Anna University", "CEG Guindy"], type: "State University", city: "Chennai", state: "Tamil Nadu" },
  { id: "vtu", officialName: "Visvesvaraya Technological University, Belagavi", shortName: "VTU", aliases: ["VTU Belgaum", "VTU Belagavi"], type: "State University", city: "Belagavi", state: "Karnataka" },
  { id: "osmania-univ", officialName: "Osmania University, Hyderabad", shortName: "OU", aliases: ["Osmania University"], type: "State University", city: "Hyderabad", state: "Telangana" },
  { id: "andhra-univ", officialName: "Andhra University, Visakhapatnam", shortName: "AU", aliases: ["Andhra University", "AU Vizag"], type: "State University", city: "Visakhapatnam", state: "Andhra Pradesh" },
  { id: "sppu", officialName: "Savitribai Phule Pune University", shortName: "SPPU", aliases: ["Pune University", "UNIPUNE"], type: "State University", city: "Pune", state: "Maharashtra" },
  { id: "mu", officialName: "University of Mumbai", shortName: "MU", aliases: ["Mumbai University"], type: "State University", city: "Mumbai", state: "Maharashtra" },
  { id: "du", officialName: "University of Delhi", shortName: "DU", aliases: ["Delhi University"], type: "Central University", city: "New Delhi", state: "Delhi" },
  { id: "dtu", officialName: "Delhi Technological University", shortName: "DTU", aliases: ["DCE", "Delhi College of Engineering"], type: "State University", city: "New Delhi", state: "Delhi" },
  { id: "nsut", officialName: "Netaji Subhas University of Technology", shortName: "NSUT", aliases: ["NSIT Delhi"], type: "State University", city: "New Delhi", state: "Delhi" },
  { id: "bits-pilani", officialName: "Birla Institute of Technology and Science, Pilani", shortName: "BITS", aliases: ["BITS Pilani", "BITS Hyd", "BITS Goa"], type: "Deemed University", city: "Pilani", state: "Rajasthan" },
  { id: "vit-vellore", officialName: "Vellore Institute of Technology, Vellore", shortName: "VIT", aliases: ["VIT Vellore", "VIT Chennai"], type: "Deemed University", city: "Vellore", state: "Tamil Nadu" },
  { id: "srm", officialName: "SRM Institute of Science and Technology", shortName: "SRM", aliases: ["SRM University", "SRM KTR"], type: "Deemed University", city: "Kanchipuram", state: "Tamil Nadu" },
  { id: "manipal", officialName: "Manipal Academy of Higher Education", shortName: "MAHE", aliases: ["MIT Manipal", "Manipal University"], type: "Deemed University", city: "Manipal", state: "Karnataka" },
  { id: "coep", officialName: "College of Engineering Pune", shortName: "COEP", aliases: ["COEP Pune"], type: "Autonomous College", city: "Pune", state: "Maharashtra" },
  { id: "rvce", officialName: "RV College of Engineering, Bengaluru", shortName: "RVCE", aliases: ["RVCE Bangalore", "RV College"], type: "Autonomous College", city: "Bengaluru", state: "Karnataka" },
  { id: "bmsce", officialName: "BMS College of Engineering, Bengaluru", shortName: "BMSCE", aliases: ["BMSCE"], type: "Autonomous College", city: "Bengaluru", state: "Karnataka" },
  { id: "msrit", officialName: "Ramaiah Institute of Technology", shortName: "MSRIT", aliases: ["MS Ramaiah"], type: "Autonomous College", city: "Bengaluru", state: "Karnataka" },

  // IIMs & B-Schools
  { id: "iim-a", officialName: "Indian Institute of Management Ahmedabad", shortName: "IIMA", aliases: ["IIM Ahmedabad", "IIMA"], type: "IIM", city: "Ahmedabad", state: "Gujarat" },
  { id: "iim-b", officialName: "Indian Institute of Management Bangalore", shortName: "IIMB", aliases: ["IIM Bangalore", "IIMB"], type: "IIM", city: "Bengaluru", state: "Karnataka" },
  { id: "iim-c", officialName: "Indian Institute of Management Calcutta", shortName: "IIMC", aliases: ["IIM Calcutta", "IIMC"], type: "IIM", city: "Kolkata", state: "West Bengal" },
  { id: "isb", officialName: "Indian School of Business", shortName: "ISB", aliases: ["ISB Hyderabad", "ISB Mohali"], type: "Management Institute", city: "Hyderabad", state: "Telangana" },

  // AIIMS & Medical
  { id: "aiims-d", officialName: "All India Institute of Medical Sciences, New Delhi", shortName: "AIIMS", aliases: ["AIIMS New Delhi", "AIIMS Delhi"], type: "AIIMS", city: "New Delhi", state: "Delhi" },
  { id: "aiims-m", officialName: "All India Institute of Medical Sciences, Mangalagiri", shortName: "AIIMS Mangalagiri", aliases: ["AIIMS AP"], type: "AIIMS", city: "Mangalagiri", state: "Andhra Pradesh" },

  // Junior Colleges & Schools (AP, TS & National)
  { id: "sri-chaitanya", officialName: "Sri Chaitanya Junior College", shortName: "Sri Chaitanya", aliases: ["Sri Chaitanya Inter", "Sri Chaitanya College"], type: "Junior College", city: "Hyderabad", state: "Telangana" },
  { id: "narayana-jr", officialName: "Narayana Junior College", shortName: "Narayana", aliases: ["Narayana Inter", "Narayana College"], type: "Junior College", city: "Hyderabad", state: "Telangana" },
  { id: "pace-jr", officialName: "Pace Junior College", shortName: "Pace", aliases: ["Pace College"], type: "Junior College", city: "Hyderabad", state: "Telangana" },
  { id: "fiitjee-jr", officialName: "FIITJEE Junior College", shortName: "FIITJEE", aliases: ["FIITJEE Inter"], type: "Junior College", city: "Hyderabad", state: "Telangana" },
  { id: "dps-d", officialName: "Delhi Public School", shortName: "DPS", aliases: ["DPS School", "Delhi Public School R.K. Puram"], type: "School", city: "New Delhi", state: "Delhi" },
  { id: "kv", officialName: "Kendriya Vidyalaya", shortName: "KV", aliases: ["KVS", "Central School"], type: "School", city: "Various", state: "India" },
  { id: "jnv", officialName: "Jawahar Navodaya Vidyalaya", shortName: "JNV", aliases: ["Navodaya School"], type: "School", city: "Various", state: "India" },
  { id: "dav", officialName: "DAV Public School", shortName: "DAV", aliases: ["DAV School"], type: "School", city: "Various", state: "India" },
];

/**
 * High Priority Search Algorithm for Educational Institutions
 */
export function searchInstitutions(query: string, maxResults = 12): Institution[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return INSTITUTIONS_DATABASE.slice(0, maxResults);

  const scoreMap = new Map<Institution, number>();

  for (const inst of INSTITUTIONS_DATABASE) {
    let score = 0;
    const nameLower = inst.officialName.toLowerCase();
    const shortLower = (inst.shortName || "").toLowerCase();
    const aliasesLower = inst.aliases.map((a) => a.toLowerCase());
    const cityLower = inst.city.toLowerCase();
    const stateLower = inst.state.toLowerCase();

    // Priority 1: Exact shortname or alias match
    if (shortLower === trimmed || aliasesLower.includes(trimmed)) {
      score += 1000;
    }
    // Priority 2: Shortname or alias starts with query
    else if (shortLower.startsWith(trimmed) || aliasesLower.some((a) => a.startsWith(trimmed))) {
      score += 500;
    }
    // Priority 3: Official name starts with query
    else if (nameLower.startsWith(trimmed)) {
      score += 300;
    }
    // Priority 4: Official name or aliases contain query
    else if (nameLower.includes(trimmed) || aliasesLower.some((a) => a.includes(trimmed))) {
      score += 100;
    }
    // Priority 5: City or state match
    else if (cityLower.includes(trimmed) || stateLower.includes(trimmed)) {
      score += 50;
    }

    if (score > 0) {
      scoreMap.set(inst, score);
    }
  }

  const sorted = Array.from(scoreMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map((entry) => entry[0]);

  return sorted.slice(0, maxResults);
}
