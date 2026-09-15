// Rebuilds the site from resume-data.json.
//
//   node tools/build-site.js
//
// The master file is stripped of everything internal — the _meta block, the
// verified flags, the strength scores — and what remains is written into
// index.html between the DATA markers, so the page carries its own content.
//
// Everything in SITE below is presentation copy. Edit it here, not in index.html.

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

// Order of the entries shown in full under "Selected work".
const FEATURED = ["tegra-capstone", "uiuc-gra-shukla", "nirma-ccr", "membrane-ml", "nirma-wastewater"];

const SITE = {
  status: "Open to research and process engineering roles",

  // Short bio for the hero.
  bio: "Chemical engineer finishing a Master of Engineering at the University of Illinois "
     + "Urbana-Champaign. I work between the bench and the data \u2014 designing and running "
     + "experiments, then using what they show to make process and material decisions.",

  // Longer bio, as written on LinkedIn.
  about: [
    "I am a Master\u2019s student in Chemical Engineering Leadership at the University of Illinois "
    + "Urbana-Champaign, with a strong focus on process engineering, R&D, and process optimization "
    + "in chemical systems.",
    "My experience spans industrial and research settings, including working with large-scale syngas "
    + "production units, green hydrogen development, and wastewater treatment processes. I have "
    + "evaluated process performance in plant environments, monitored operating parameters using "
    + "Distributed Control Systems (DCS), and optimized experimental systems to improve efficiency "
    + "and output.",
    "I am particularly interested in applying engineering fundamentals and data-driven analysis to "
    + "solve real-world process challenges, improve system performance, and support safe and scalable "
    + "chemical operations.",
  ],

  facts: [
    { label: "Studying at", value: "UIUC \u2014 MEng Chemical Engineering Leadership" },
    { label: "Graduating", value: "December 2026" },
    { label: "Relocation", value: "Open, anywhere in the U.S." },
    { label: "Work authorization", value: "STEM-OPT eligible" },
  ],

  portrait: { src: "assets/vidhi.jpg", alt: "Portrait of Vidhi Mistry" },

  // Display titles for entries whose real title is a job title, not a project name.
  titles: { "uiuc-gra-shukla": "PFAS alternatives \u2014 molecular machine learning and simulation" },

  scene: { caption: "CO\u2082 and CH\u2084 meeting a polymer membrane." },

  // Plain-language reading of each project, for people outside the field.
  insights: {
    "tegra-capstone": "A pickling bath thrown out after every use is money and hazardous waste leaving "
      + "the building on a guess. The deliverable is a test that tells an operator whether the bath still "
      + "cleans, so it gets replaced when it stops working rather than on a schedule.",
    "uiuc-gra-shukla": "PFAS are being restricted faster than safer replacements can be found, and testing "
      + "a candidate molecule in the lab is slow. Predicting toxicity from structure narrows thousands of "
      + "candidates down to the few worth making.",
    "nirma-ccr": "Commercial electrolysers need 1.6\u20132.2 V to split water. Adding sunlight-driven "
      + "photocatalysis ran this cell at 1.3 V, and roughly 15% above electrolysis alone \u2014 less "
      + "electricity for the same hydrogen, using a catalyst made from industrial waste instead of a "
      + "purchased one.",
    "membrane-ml": "An R\u00b2 of 0.828 on polymers the model had never seen means it can rank a new "
      + "membrane material before anyone synthesises it \u2014 turning months of making and testing into "
      + "a screening step.",
    "nirma-wastewater": "Dye-intermediate effluent arrives at pH 2\u20133 with a chemical oxygen demand in "
      + "the tens of thousands of mg/L. The work was finding which coagulant and flocculant combination "
      + "brings that down far enough to discharge, and at what dose.",
  },

  // Figures built from the project data. Values here must match the bullets.
  charts: {
    "nirma-ccr": {
      type: "range", title: "Applied potential", min: 0, max: 2.6, unit: "V",
      band: [1.6, 2.2], bandLabel: "Commercial electrolysers", value: 1.3,
      alt: "Scale from 0 to 2.6 volts. Commercial electrolysers operate between 1.6 and 2.2 volts; this cell ran at 1.3 volts.",
      caption: "Below the band where PEM and alkaline electrolysers operate \u2014 less electricity per unit of hydrogen.",
    },
    "membrane-ml": {
      type: "dots", title: "Model performance", values: [0.72, 0.55, 0.69, 0.63, 0.74],
      mean: 0.665, sd: 0.157, highlight: 0.828,
      leftLabel: "5 CV folds", rightLabel: "unseen test set",
      alt: "Five cross-validation R-squared values between 0.55 and 0.74 around a mean of 0.665, and a held-out test value of 0.828.",
      caption: "Grey dots are the five cross-validation folds, the shaded band one standard deviation. Mint is the unseen test set.",
    },
    "tegra-capstone": {
      type: "tiers", title: "The deliverable",
      items: [
        { l: "Green \u2014 bath still cleans to spec", c: "#4ADE80" },
        { l: "Amber \u2014 monitor, plan replacement", c: "#FBBF24" },
        { l: "Red \u2014 past threshold, replace", c: "#F87171" },
      ],
      alt: "A three-tier monitoring protocol: green, amber and red.",
      caption: "A tiered protocol an operator can read off, replacing a fixed discard schedule.",
    },
    "uiuc-gra-shukla": {
      type: "flow", title: "Screening pipeline",
      steps: ["Molecular structure (SMILES)", "Learned representation", "Predicted toxicity",
              "Shortlist worth synthesising"],
      alt: "Four-step pipeline from molecular structure to a shortlist of candidates worth making.",
      caption: "Each step removes candidates, so lab time goes only to molecules that survive the screen.",
    },
    "nirma-wastewater": {
      type: "stats", title: "What arrived at the bench",
      items: [
        { v: "32,000", u: "mg/L", l: "chemical oxygen demand, untreated" },
        { v: "2\u20133", u: "pH", l: "strongly acidic as received" },
        { v: "15+", u: "runs", l: "coagulant and flocculant combinations" },
      ],
      alt: "Untreated effluent at 32,000 milligrams per litre COD and pH 2 to 3, screened across 15 or more runs.",
      caption: "Dye-intermediate effluent is among the harder industrial streams to bring to discharge.",
    },
  },

  figures: {
    "membrane-ml": [
      { src: "assets/membrane-model.png",
        alt: "Modelling pipeline and performance: SMILES input, Morgan fingerprints, physics-guided descriptors, leakage-free split, parity plots and cross-validation",
        caption: "The project poster. XGBoost R\u00b2 0.828, RMSE 0.285, five-fold cross-validation across polymer groups." },
      { src: "assets/presenting.jpg",
        alt: "Vidhi Mistry presenting the membrane modelling results at a departmental talk",
        caption: "Presenting the feature importance results, spring 2026." },
    ],
    "nirma-ccr": [
      { src: "assets/h2-reactor.jpg",
        alt: "Transparent acrylic photo-electrocatalytic reactor housing with gas vents and electrode ports",
        caption: "The reactor housing, designed in AutoCAD and externally fabricated." },
      { src: "assets/h2-setup.jpg",
        alt: "The photo-electrocatalytic cell running on the bench with tubing and electrical connections",
        caption: "The cell running on the bench; hydrogen collected at the cathode." },
    ],
    "nirma-wastewater": [
      { src: "assets/wastewater-samples.jpg",
        alt: "Beakers showing dye-intermediate effluent from dark brown raw wastewater through progressively clearer treated fractions",
        caption: "Dye-intermediate effluent, raw through treated." },
    ],
  },

  documents: [
    { name: "Green hydrogen project poster",
      note: "Studies on the Production of Green Hydrogen \u2014 Nirma University, Department of Chemical "
          + "Engineering. Co-authored with Harvin Patel, guided by Dr. Leena Bora.",
      url: "assets/green-hydrogen-poster.pdf", label: "Open the poster (PDF)" },
  ],

  // Real quotes from real people only. Empty array hides the section.
  recommendations: [],

  credentials: [
    { name: "Business Strategy", issuer: "University of Illinois Urbana-Champaign, via Coursera",
      date: "Mar 2026", note: "Completed with honors" },
    { name: "Leading Teams: Developing as a Leader", issuer: "University of Illinois Urbana-Champaign, via Coursera",
      date: "Oct 2025", note: "Credential ID FP9BNOMTH592" },
    { name: "Leading Teams: Building Effective Team Cultures", issuer: "University of Illinois Urbana-Champaign, via Coursera",
      date: "Oct 2025", note: "Credential ID KAMGJQ33D2Y1" },
  ],
};

const pubBullet = b => ({ id: b.id, text: b.text, metric: b.metric, method: b.method });
const pubEntry = e => ({
  id: e.id, org: e.org, title: e.title, name: e.name || null, location: e.location,
  start: e.start, end: e.end, context: e.context, bullets: e.bullets.map(pubBullet),
});
const dropSixSigma = list => list.filter(x => !/six sigma/i.test(x));

const out = {
  identity: d.identity,
  site: SITE,
  featured: FEATURED,
  recommendations: SITE.recommendations,
  roles: d.roles.map(pubEntry),
  projects: d.projects.map(pubEntry),
  education: d.education.map(e => ({
    institution: e.institution, degree: e.degree, location: e.location,
    start: e.start, end_display: e.end_display, gpa: e.gpa, coursework: e.coursework,
  })),
  publications: d.publications.map(p => ({
    type: p.type, status: p.status, title: p.title, venue: p.venue, date: p.date,
  })),
  skills: Object.fromEntries(Object.entries(d.skills).map(([k, v]) => [k, dropSixSigma(v)])),
};

const json = JSON.stringify(out).replace(/</g, "\\u003c");
const block = '<!--DATA:START-->\n<script type="application/json" id="portfolio-data">'
            + json + '</scr' + 'ipt>\n<!--DATA:END-->';

let page = fs.readFileSync(PAGE, "utf8");
if (!/<!--DATA:START-->[\s\S]*?<!--DATA:END-->/.test(page)) {
  console.error("DATA markers missing from index.html — cannot inject content.");
  process.exit(1);
}
fs.writeFileSync(PAGE, page.replace(/<!--DATA:START-->[\s\S]*?<!--DATA:END-->/, block));

console.log(`index.html updated — ${out.roles.length} roles, ${out.projects.length} projects, `
          + `${JSON.stringify(d).length - json.length} bytes of internal notes withheld`);
