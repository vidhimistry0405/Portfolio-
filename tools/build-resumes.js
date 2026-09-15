// Builds research-weighted and process-weighted resumes from resume-data.json.
// Bullets are SELECTED by tag + strength. Bullet text is never modified.

const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const {
  Document, Packer, Paragraph, TextRun, Tab, TabStopType,
  AlignmentType, BorderStyle, LevelFormat, convertInchesToTwip,
} = require("docx");

const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, "resume-data.json"), "utf8"));

const FONT = "Calibri";
const BODY = 18;      // 9pt (half-points)
const NAME = 32;      // 16pt
const RIGHT_TAB = 11088; // letter width 12240 - 2 x 720 margin

// ---------------------------------------------------------------- selection
const PROFILES = {
  research: {
    tags: ["research", "modeling", "lab-technique"],
    minStrength: 3,
    caps: { "uiuc-gra-shukla": 3, "uiuc-gra-ripe": 4, "gnfc-trainee": 3,
            "nirma-ccr": 4, "nirma-wastewater": 4, "chesa-iiche-board": 1,
            "membrane-ml": 4 },
    skills: {
      "Laboratory & Materials": ["Sol-gel catalyst deposition","Electrode fabrication and coating",
        "PVA binder overcoating","Photo-electrocatalytic hydrogen generation",
        "COD and BOD analysis","Coagulation-flocculation","Autoclave sterilization","Contamination control"],
      "Computational & Methods": ["Python","R","PyTorch","XGBoost","scikit-learn","RDKit","PyMOL",
        "Molecular dynamics simulation","AutoCAD","Leakage-controlled model validation",
        "Experimental design","SOP development","Six Sigma Green Belt (LinkedIn Learning)"],
    },
  },
  process: {
    tags: ["process", "safety", "quality"],
    minStrength: 3,
    caps: { "uiuc-gra-shukla": 2, "uiuc-gra-ripe": 3, "gnfc-trainee": 6,
            "nirma-ccr": 3, "nirma-wastewater": 4, "chesa-iiche-board": 1,
            "membrane-ml": 3 },
    skills: {
      "Process & Plant": ["Steam reforming and syngas production (plant exposure)",
        "Heat exchange and energy recovery (plant exposure)","Water electrolysis and photo-electrocatalysis",
        "Membrane gas separation (computational)","Coagulation-flocculation","Zero-liquid discharge"],
      "Operations & Safety": ["DCS monitoring (plant exposure)",
        "Lockout-tagout, isolation, depressurization and purging","PPE and hazard identification",
        "HAZOP and HAZID (coursework and internship exposure)","SOP development",
        "Six Sigma Green Belt (LinkedIn Learning)"],
      "Analysis & Software": ["COD and BOD analysis","Chemical dosing optimization","AutoCAD","ChemCAD (coursework)",
        "MATLAB (coursework)","PLC Programming (coursework)","Python","R","Excel"],
    },
  },
};

function selectBullets(entry, profile) {
  const cap = profile.caps[entry.id] ?? 3;
  const onTag = entry.bullets.filter(
    b => b.strength >= profile.minStrength && b.tags.some(t => profile.tags.includes(t))
  );
  const picked = [...onTag];
  const lead = entry.bullets[0];          // an entry is never described by secondary detail alone
  if (lead.strength >= 4 && !picked.includes(lead)) picked.unshift(lead);
  const floor = Math.min(cap, 3);
  if (picked.length < floor) {                 // backfill so no entry appears bare
    entry.bullets
      .filter(b => !picked.includes(b))
      .sort((a, b) => b.strength - a.strength)
      .slice(0, floor - picked.length)
      .forEach(b => picked.push(b));
  }
  const hasMetric = b => (b.metric ? 1 : 0);
  picked.sort((a, b) => b.strength - a.strength || hasMetric(b) - hasMetric(a)
              || entry.bullets.indexOf(a) - entry.bullets.indexOf(b));
  const li = picked.indexOf(lead);           // defining bullet leads the entry
  if (li > 0) picked.splice(0, 0, picked.splice(li, 1)[0]);
  return picked.slice(0, cap);
}

// ---------------------------------------------------------------- formatting
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmt = ym => { if (!ym) return "Present"; const [y, m] = ym.split("-"); return `${MONTHS[+m - 1]} ${y}`; };
const span = e => `${fmt(e.start)} \u2013 ${e.end ? fmt(e.end) : "Present"}`;

const sectionHeading = text => new Paragraph({
  spacing: { before: 90, after: 30 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 1 } },
  children: [new TextRun({ text: text.toUpperCase(), bold: true, size: BODY, font: FONT, characterSpacing: 20 })],
});

const twoCol = (left, right, opts = {}) => new Paragraph({
  tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
  spacing: { before: opts.before ?? 50, after: 0 },
  children: [
    new TextRun({ text: left, bold: !!opts.boldLeft, italics: !!opts.italLeft, size: BODY, font: FONT }),
    new TextRun({ children: [new Tab()] }),
    new TextRun({ text: right, bold: !!opts.boldRight, italics: !!opts.italRight, size: BODY, font: FONT }),
  ],
});

const bullet = text => new Paragraph({
  numbering: { reference: "rbullets", level: 0 },
  spacing: { before: 0, after: 0, line: 212 },
  children: [new TextRun({ text, size: BODY, font: FONT })],
});

const plain = (label, items) => new Paragraph({
  spacing: { before: 20, after: 0, line: 212 },
  children: [
    new TextRun({ text: `${label}: `, bold: true, size: BODY, font: FONT }),
    new TextRun({ text: items.join(", "), size: BODY, font: FONT }),
  ],
});

// ---------------------------------------------------------------- assembly
function buildDoc(key) {
  const p = PROFILES[key];
  const id = DATA.identity;
  const kids = [];

  kids.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 20 },
    children: [new TextRun({ text: id.name, bold: true, size: NAME, font: FONT })],
  }));
  kids.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 40 },
    children: [new TextRun({
      text: `${id.email}  |  ${id.phone}  |  ${id.linkedin.replace("https://www.", "")}  |  ${id.location}`,
      size: BODY, font: FONT })],
  }));

  // Education
  kids.push(sectionHeading("Education"));
  DATA.education.forEach(e => {
    kids.push(twoCol(e.institution, e.location, { boldLeft: true }));
    kids.push(twoCol(`${e.degree}  |  GPA: ${e.gpa}`,
      `${fmt(e.start)} \u2013 ${e.end_display}`, { italLeft: true, before: 0 }));
  });

  // Experience — reverse chronological, UIUC first
  kids.push(sectionHeading("Experience"));
  const order = ["uiuc-gra-shukla", "uiuc-gra-ripe", "gnfc-trainee", "nirma-ccr", "nirma-wastewater"];
  order.map(rid => DATA.roles.find(r => r.id === rid)).forEach(r => {
    kids.push(twoCol(r.org, r.location, { boldLeft: true }));
    kids.push(twoCol(r.title, span(r), { italLeft: true, before: 0 }));
    if (r.context.startsWith("Project:")) {
      kids.push(new Paragraph({ spacing: { before: 0, after: 0, line: 212 },
        children: [new TextRun({ text: r.context.replace("Project: ", ""), italics: true, size: BODY, font: FONT })] }));
    }
    selectBullets(r, p).forEach(b => kids.push(bullet(b.text)));
  });

  // Research / Projects
  kids.push(sectionHeading("Research & Projects"));
  DATA.projects.forEach(pr => {
    kids.push(twoCol(pr.org, pr.location, { boldLeft: true }));
    kids.push(twoCol(pr.title, span(pr), { italLeft: true, before: 0 }));
    kids.push(new Paragraph({ spacing: { before: 0, after: 0, line: 212 },
      children: [new TextRun({ text: `"${pr.name}"`, italics: true, size: BODY, font: FONT })] }));
    selectBullets(pr, p).forEach(b => kids.push(bullet(b.text)));
  });
  // Technical Skills
  kids.push(sectionHeading("Technical Skills"));
  Object.entries(p.skills).forEach(([label, items]) => kids.push(plain(label, items)));



  return new Document({
    numbering: { config: [{ reference: "rbullets", levels: [{
      level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 216, hanging: 144 } } } }] }] },
    styles: { default: { document: { run: { font: FONT, size: BODY } } } },
    sections: [{
      properties: { page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 576, bottom: 576, left: 576, right: 576 } } },
      children: kids,
    }],
  });
}

(async () => {
  for (const key of ["research", "process"]) {
    const buf = await Packer.toBuffer(buildDoc(key));
    const out = path.join(ROOT, "tools", `Vidhi_Mistry_Resume_${key === "research" ? "Research" : "Process"}.docx`);
    fs.writeFileSync(out, buf);
    console.log("wrote", out);
  }
})();
