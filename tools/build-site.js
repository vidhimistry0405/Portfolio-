// Rebuilds the site from resume-data.json.
//
//   node tools/build-site.js
//
// Two things happen. The master file is stripped of everything internal - the
// _meta block (open questions, excluded content, conflict history), the verified
// flags, the strength scores - and what remains is written straight into
// index.html between the DATA markers. The page then carries its own content,
// so it opens correctly from a phone, a USB stick, or a web server alike.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MASTER = path.join(ROOT, "resume-data.json");
const PAGE = path.join(ROOT, "index.html");

if (!fs.existsSync(MASTER)) {
  console.error("resume-data.json not found next to index.html. Put it there and run again.");
  process.exit(1);
}
const d = JSON.parse(fs.readFileSync(MASTER, "utf8"));

// Entries shown in full under "Selected work", in this order.
const FEATURED = ["nirma-ccr", "membrane-ml", "nirma-wastewater", "uiuc-gra-shukla"];

// The four measured quantities in the hero. Each points at the bullet it came from.
const HIGHLIGHTS = [
  { bullet: "ccr-b3", value: "1.3 V", caption: "applied potential for hydrogen production, below the 1.6-2.2 V practical range of commercial electrolyzers" },
  { bullet: "ccr-b1", value: "~15%", caption: "higher hydrogen generation efficiency than electrolysis alone" },
  { bullet: "mem-b4", value: "0.828", caption: "R\u00b2 predicting membrane selectivity on polymers the model had never seen" },
  { bullet: "ww-b4", value: "100 mg/L", caption: "chemical oxygen demand after treatment, down from the thousands" },
];

const pubBullet = b => ({ id: b.id, text: b.text, metric: b.metric, method: b.method });
const pubEntry = e => ({
  id: e.id, org: e.org, title: e.title, name: e.name || null, location: e.location,
  start: e.start, end: e.end, context: e.context, bullets: e.bullets.map(pubBullet),
});

// Presentation content that has no home in the r\u00e9sum\u00e9 data.
const SITE = {
  tagline: "Chemical engineer working on green hydrogen, industrial water treatment and membrane separations.",
  bio: "Master of Engineering candidate at the University of Illinois Urbana-Champaign. I work between the bench and the model \u2014 building and testing physical systems, then using data to decide what to build next. Patent application filed on a hydrogen production method using industrial waste.",
  scene: {
    caption: "CO\u2082 and CH\u2084 meeting a polymer membrane. The smaller, more soluble CO\u2082 passes; CH\u2084 is largely retained. Predicting that separation is what the modelling work below does. Drag to rotate.",
  },
  figures: {
    "membrane-ml": [
      { src: "assets/membrane-model.png",
        alt: "Modelling pipeline and performance: SMILES input, Morgan fingerprints, physics-guided descriptors, leakage-free split, parity plots and five-fold cross-validation",
        caption: "The full project poster. Random Forest baseline R\u00b2 0.820, XGBoost R\u00b2 0.828, both at RMSE 0.285, with five-fold GroupKFold cross-validation across polymer groups." },
      { src: "assets/presenting.jpg",
        alt: "Vidhi Mistry presenting the membrane modelling results at a departmental talk",
        caption: "Presenting the feature importance results, spring 2026." },
    ],
    "nirma-ccr": [
      { src: "assets/h2-reactor.jpg",
        alt: "Transparent acrylic photo-electrocatalytic reactor housing with gas vents and electrode ports",
        caption: "The reactor housing, designed in AutoCAD and externally fabricated \u2014 two gas vents and dedicated ports for the electrode connections." },
      { src: "assets/h2-setup.jpg",
        alt: "The photo-electrocatalytic cell running on the bench with tubing and electrical connections",
        caption: "The cell running on the bench. Hydrogen was collected at the cathode and quantified by water displacement." },
    ],
    "nirma-wastewater": [
      { src: "assets/wastewater-samples.jpg",
        alt: "Four beakers showing dye-intermediate effluent from dark brown raw wastewater through progressively clearer treated fractions",
        caption: "Dye-intermediate effluent, raw through treated. The untreated wastewater entered at pH 2\u20133 and a chemical oxygen demand of 32,000 mg/L." },
    ],
  },
  // Downloadable source material, shown in the Evidence section.
  documents: [
    { name: "Green hydrogen project poster",
      note: "Studies on the Production of Green Hydrogen \u2014 Nirma University, Department of Chemical Engineering. Co-authored with Harvin Patel, guided by Dr. Leena Bora.",
      url: "assets/green-hydrogen-poster.pdf", label: "Open the poster (PDF)" },
  ],
  // Recommendations are quotes from real people. Add them here only as written and
  // with permission. Leave the array empty and the section does not render.
  recommendations: [],
  credentials: [
    { name: "Leading Teams: Developing as a Leader", issuer: "University of Illinois Urbana-Champaign, via Coursera",
      date: "Oct 2025", note: "Credential ID FP9BNOMTH592" },
    { name: "Leading Teams: Building Effective Team Cultures", issuer: "University of Illinois Urbana-Champaign, via Coursera",
      date: "Oct 2025", note: "Credential ID KAMGJQ33D2Y1" },
    { name: "Business Strategy", issuer: "University of Illinois Urbana-Champaign, via Coursera",
      date: "Mar 2026", note: "Completed with honors" },
    { name: "Six Sigma Green Belt", issuer: "LinkedIn Learning", date: "Dec 2025", note: "" },
  ],
};

const out = {
  identity: d.identity,
  site: SITE,
  recommendations: SITE.recommendations,
  featured: FEATURED,
  highlights: HIGHLIGHTS,
  roles: d.roles.map(pubEntry),
  projects: d.projects.map(pubEntry),
  education: d.education.map(e => ({
    institution: e.institution, degree: e.degree, location: e.location,
    start: e.start, end_display: e.end_display, gpa: e.gpa, coursework: e.coursework,
  })),
  publications: d.publications.map(p => ({
    type: p.type, status: p.status, title: p.title, venue: p.venue, date: p.date,
  })),
  certifications: d.certifications.map(c => ({ name: c.name, issuer: c.issuer, date: c.date })),
  skills: d.skills,
};

// escaped so the JSON can never end the script element early
const json = JSON.stringify(out).replace(/</g, "\\u003c");

const block =
  '<!--DATA:START-->\n<script type="application/json" id="portfolio-data">' +
  json + '</scr' + 'ipt>\n<!--DATA:END-->';

let page = fs.readFileSync(PAGE, "utf8");
if (!/<!--DATA:START-->[\s\S]*?<!--DATA:END-->/.test(page)) {
  console.error("DATA markers missing from index.html - cannot inject content.");
  process.exit(1);
}
page = page.replace(/<!--DATA:START-->[\s\S]*?<!--DATA:END-->/, block);
fs.writeFileSync(PAGE, page);

const withheld = JSON.stringify(d).length - json.length;
console.log(`index.html updated - ${out.roles.length} roles, ${out.projects.length} projects, ` +
            `${withheld} bytes of internal notes withheld`);
