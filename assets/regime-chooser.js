/* regime-chooser.js - the "which regime touches me?" chooser for learn-governance-101-with-phoebe.
 *
 * Answer four plain-English yes/no questions about who your data and AI touch; the chooser maps
 * you to the governance regimes that likely apply (Singapore PDPA, the DNC rules, the EU GDPR, and
 * the EU AI Act) and points you at the deeper course for each. It is a teaching map of who-reaches-
 * whom, not a legal determination.
 *
 * EDUCATIONAL, NOT LEGAL ADVICE. Whether a law applies depends on specific facts; read the primary
 * texts (PDPA, GDPR, EU AI Act) and get proper advice.
 *
 * Usage:  <div class="regimebox" data-caption="..."></div>
 * No dependencies. Reuses the .aiactbox / .ai-* styles from style.css.
 */
(function () {
  "use strict";
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  /* Each question flips one or more regimes on. */
  var QUESTIONS = [
    { id: "sgdata", q: "Do you collect or use personal data about people in Singapore? (customers, staff, leads)" },
    { id: "sgmkt",  q: "Do you send marketing messages - calls, texts, faxes - to Singapore phone numbers?" },
    { id: "eu",     q: "Do you offer goods or services to, or track the behaviour of, people in the EU/EEA?" },
    { id: "euai",   q: "Do you build or use an AI system whose results are used to make decisions about people in the EU?" }
  ];

  /* Regime cards. `applies(a)` reads the answer map; returns true/false/null (null = ask a question first). */
  var REGIMES = [
    { key: "pdpa", name: "Singapore PDPA",
      applies: function (a) { return a.sgdata; },
      yes: "You hold personal data about people in Singapore, so the PDPA's obligations apply - consent, purpose limitation, protection, access and correction, and breach notification.",
      no:  "If you never handle personal data of people in Singapore, the PDPA likely does not reach you. Most organisations do, though - staff data counts.",
      course: "https://phoebefu6.github.io/learn-pdpa-dnc-with-phoebe/", clabel: "Go deeper: PDPA + DNC" },
    { key: "dnc", name: "Do Not Call (DNC) rules",
      applies: function (a) { return a.sgmkt; },
      yes: "You send marketing to Singapore numbers, so the DNC rules apply on top of the PDPA - check the registers (or rely on a valid ongoing-relationship / consent exception) before you send.",
      no:  "No marketing to Singapore phone numbers means the DNC registers are not your immediate concern - but the moment you start, they are.",
      course: "https://phoebefu6.github.io/learn-pdpa-dnc-with-phoebe/", clabel: "Go deeper: PDPA + DNC" },
    { key: "gdpr", name: "EU GDPR",
      applies: function (a) { return a.eu; },
      yes: "You target or monitor people in the EU/EEA, so the GDPR reaches you even from Singapore (Article 3) - you need a lawful basis, must honour data-subject rights, and must report serious breaches within 72 hours.",
      no:  "If you do not offer to or monitor people in the EU/EEA, the GDPR probably does not apply - but it follows the person, not your office, so re-check if you expand.",
      course: "https://phoebefu6.github.io/learn-gdpr-with-phoebe/", clabel: "Go deeper: GDPR for a SG org" },
    { key: "aiact", name: "EU AI Act",
      applies: function (a) { return a.euai; },
      yes: "Your AI's output is used to make decisions about people in the EU, so the EU AI Act reaches you - your obligations depend on the system's risk tier, and high-risk uses (like hiring or credit) carry the heaviest duties.",
      no:  "No AI output affecting people in the EU means the EU AI Act likely does not bind you yet - but AI rules are arriving fast, so treat this as a watch item.",
      course: "https://phoebefu6.github.io/learn-ai-governance-with-phoebe/", clabel: "Go deeper: AI Governance" }
  ];

  function wire(box) {
    var caption = box.getAttribute("data-caption") || "";
    box.innerHTML = "";
    var answers = {};

    var bar = document.createElement("div"); bar.className = "ai-bar";
    bar.innerHTML = '<span class="ai-dot"></span><span class="ai-title">Which regime touches me?</span>' +
      '<span class="ai-tag">PDPA · DNC · GDPR · EU AI Act</span>';
    box.appendChild(bar);

    var grid = document.createElement("div"); grid.className = "ai-grid";
    QUESTIONS.forEach(function (item) {
      var wrap = document.createElement("label"); wrap.className = "ai-field";
      wrap.innerHTML = '<span class="ai-flabel">' + esc(item.q) + '</span>';
      var sel = document.createElement("select"); sel.className = "ai-select";
      [["", "Choose..."], ["yes", "Yes"], ["no", "No"]].forEach(function (pair) {
        var o = document.createElement("option"); o.value = pair[0]; o.textContent = pair[1]; sel.appendChild(o);
      });
      sel.addEventListener("change", function () {
        answers[item.id] = sel.value === "yes" ? true : (sel.value === "no" ? false : null);
        render();
      });
      wrap.appendChild(sel); grid.appendChild(wrap);
    });
    box.appendChild(grid);

    var out = document.createElement("div"); out.className = "ai-out"; box.appendChild(out);
    var note = document.createElement("div"); note.className = "ai-note";
    note.textContent = "Educational map of who-reaches-whom - not legal advice. Whether a law applies turns on specific facts; read the primary texts and get advice.";
    box.appendChild(note);
    if (caption) { var c = document.createElement("div"); c.className = "ai-cap"; c.textContent = caption; box.appendChild(c); }

    function render() {
      var answeredAny = QUESTIONS.some(function (item) { return typeof answers[item.id] === "boolean"; });
      if (!answeredAny) {
        out.innerHTML = '<div class="ai-verdict ai-minimal"><span class="ai-badge">Answer above ↑</span>' +
          '<div><p>Pick Yes or No for the questions that fit you, and the regimes that likely apply will light up here - each with the course that teaches it.</p></div></div>';
        return;
      }
      out.innerHTML = REGIMES.map(function (r) {
        var on = r.applies(answers) === true;
        var cls = on ? "ai-limited" : "ai-minimal";
        var badge = r.name + (on ? " · likely applies" : " · likely not");
        var line = on ? r.yes : r.no;
        var link = on
          ? '<p><a href="' + r.course + '" style="color:var(--indigo);font-weight:700;text-decoration:none">' + esc(r.clabel) + ' →</a></p>'
          : "";
        return '<div class="ai-verdict ' + cls + '" style="margin-bottom:.5rem">' +
          '<span class="ai-badge">' + esc(badge) + '</span>' +
          '<div><p>' + esc(line) + '</p>' + link + '</div></div>';
      }).join("");
    }
    render();
  }

  function init() { Array.prototype.slice.call(document.querySelectorAll(".regimebox")).forEach(wire); }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", init); } else { init(); }
})();
