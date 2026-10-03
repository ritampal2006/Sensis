/**
 * SENSIS - Multi-Party Communication Gap & Friction Detection Engine
 * Client-Side Application & Interactive Discourse Intelligence Engine
 */

// ================= PRESET DATASET SAMPLES =================
const SAMPLE_DATASETS = {
  1: `User_A: Hi, is anyone here familiar with the Ubuntu 22.04 LTS package repository issues?
User_B: Yes, what seems to be the exact problem?
User_A: What repository are you using again?
User_B: Could you repeat that? I asked what problem you are facing.
User_A: What package were we discussing?
User_B: This is getting frustrating, please describe your issue clearly so I can help!
User_A: Okay, apt-get update is throwing 404 on security repositories.
User_B: Check your /etc/apt/sources.list file and verify the distribution codename.`,

  2: `User_A: Can someone help me with iptables firewall forwarding?
User_B: Sure, check if ip_forward is set to 1 in sysctl.
User_C: Did you already open port 443 in ufw?
User_A: sysctl is configured properly.
User_B: Then check your NAT table POSTROUTING rule.
User_B: Here is the command: iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
User_A: Got it, that resolved the routing drop! Thanks so much.`,

  3: `User_A: Is there a way to restore corrupted GRUB2 bootloader on dual boot?
User_B: What error do you see upon startup?
User_C: Boot into live USB first.
User_A: It just drops directly to grub rescue prompt.
User_B: What error did it display before dropping?
User_A: What live USB tool should I make?
User_B: You didn't tell me what error it showed!`,

  incident: `Alex: Can anyone review PR 102 for the authentication service?
Jordan: I'm currently busy with production deployment.
Taylor: Same here, on-call alerts are firing for database latency.
Alex: Can someone at least sanity check the token expiration logic?
Jordan: What is PR 102 again?
Alex: What do you mean what is it? I shared the link in #eng-channel 2 hours ago!
Taylor: This is completely blocked until deployment stabilizes.
Jordan: Stop spamming the channel with urgent requests during Sev-1.`
};

// Realistic Multi-Turn Chat Logs
const HISTORICAL_SESSIONS = [
  {
    id: "THR-4821",
    title: "Ubuntu 22.04 apt-get 404 security repo",
    snippet: "apt-get update throwing 404 on release codename...",
    date: "Today, 11:24 AM",
    participants: ["marcus.ops", "dev_dan"],
    category: "#devops-infra",
    status: "loop",
    statusText: "Clarification Loop",
    turns: 8,
    health: "62.5%",
    sampleKey: 1
  },
  {
    id: "THR-4819",
    title: "iptables NAT packet forwarding drop",
    snippet: "iptables -t nat -A POSTROUTING resolved...",
    date: "Today, 10:12 AM",
    participants: ["sarah_net", "alex.k", "marcus.ops"],
    category: "#networking",
    status: "resolved",
    statusText: "Resolved",
    turns: 7,
    health: "98.0%",
    sampleKey: 2
  },
  {
    id: "THR-4812",
    title: "GRUB rescue dual-boot partition loss",
    snippet: "Drops directly to grub rescue without error code...",
    date: "Yesterday, 4:40 PM",
    participants: ["dev_dan", "linux_triage"],
    category: "#support-tier2",
    status: "ignored",
    statusText: "Ignored Question",
    turns: 7,
    health: "54.2%",
    sampleKey: 3
  },
  {
    id: "THR-4806",
    title: "Auth Service PR #102 token expiry",
    snippet: "On-call deployment blocker and urgent review requests...",
    date: "Yesterday, 2:15 PM",
    participants: ["alex.chen", "jordan_lead", "taylor.sre"],
    category: "#incident-sev1",
    status: "frustrated",
    statusText: "Negative Tone Shift",
    turns: 8,
    health: "41.0%",
    sampleKey: "incident"
  },
  {
    id: "THR-4798",
    title: "PgBouncer pool saturation on replica",
    snippet: "Adjusted max_client_conn and query wait timeout...",
    date: "Aug 22, 9:30 AM",
    participants: ["elena.dba", "sam_backend"],
    category: "#database-ops",
    status: "resolved",
    statusText: "Resolved",
    turns: 12,
    health: "96.0%",
    sampleKey: 2
  }
];

// ================= NATURAL LANGUAGE & DISCOURSE ENGINE =================

// Intent Classification Keywords & Heuristics (Mirroring BART-MNLI Zero-Shot Label Set)
const INTENT_RULES = [
  {
    type: "Clarification Request",
    patterns: [
      /what do you mean/i,
      /could you repeat/i,
      /can you clarify/i,
      /what is .* again/i,
      /what package were we/i,
      /what repository are you/i,
      /repeat that/i,
      /what do you mean by/i,
      /what did you mean/i,
      /didn't catch that/i,
      /come again/i
    ]
  },
  {
    type: "Question",
    patterns: [
      /\?$/,
      /^(can|could|is|are|how|what|why|where|when|who|which|do|does|did|will|would|should|anyone|someone)\b/i,
      /\bhelp me with\b/i,
      /\bis there a way\b/i
    ]
  },
  {
    type: "Acknowledgment",
    patterns: [
      /^(got it|thanks|thank you|ok|okay|sounds good|understood|same here|yep|yeah|cool|perfect|noted)\b/i,
      /\bthanks so much\b/i,
      /\bappreciate it\b/i
    ]
  },
  {
    type: "Answer",
    patterns: [
      /\b(here is|you should|check your|run this|configure|iptables|apt-get|use this|solution is|try to|it is|it just)\b/i,
      /\b(configured properly|already did|set to|resolved)\b/i
    ]
  }
];

// Lexicon for VADER-style Affective Scoring
const SENTIMENT_LEXICON = {
  // Frustration & Negatives
  "frustrating": -0.85,
  "frustrated": -0.80,
  "annoying": -0.75,
  "blocked": -0.55,
  "spamming": -0.75,
  "urgent": -0.45,
  "fail": -0.50,
  "failed": -0.55,
  "error": -0.40,
  "corrupted": -0.50,
  "broken": -0.55,
  "bad": -0.40,
  "terrible": -0.75,
  "awful": -0.80,
  "stop": -0.45,
  "problem": -0.30,
  "issues": -0.30,
  "issue": -0.30,
  "latency": -0.35,
  "drop": -0.30,
  "404": -0.40,
  "not": -0.20,
  "no": -0.20,
  "don't": -0.25,
  "didn't": -0.25,

  // Positive & Resolution
  "thanks": 0.60,
  "thank": 0.55,
  "great": 0.70,
  "resolved": 0.75,
  "perfect": 0.80,
  "good": 0.50,
  "helpful": 0.60,
  "properly": 0.45,
  "smooth": 0.60,
  "excellent": 0.85,
  "appreciated": 0.65,
  "sure": 0.35,
  "okay": 0.20,
  "got it": 0.40
};

/**
 * Calculates VADER compound sentiment polarity (-1.00 to +1.00)
 */
function computeSentiment(text) {
  const words = text.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, "").split(/\s+/);
  let totalScore = 0;
  let wordCount = 0;

  // Check multi-word keys first
  const lowerText = text.toLowerCase();
  for (const [phrase, score] of Object.entries(SENTIMENT_LEXICON)) {
    if (phrase.includes(" ") && lowerText.includes(phrase)) {
      totalScore += score * 1.5;
      wordCount++;
    }
  }

  // Check single words
  words.forEach(w => {
    if (SENTIMENT_LEXICON[w]) {
      totalScore += SENTIMENT_LEXICON[w];
      wordCount++;
    }
  });

  // Check exclamation marks for emotional amplification
  if (text.includes("!")) {
    if (totalScore < 0) totalScore -= 0.15;
    else if (totalScore > 0) totalScore += 0.15;
  }

  // Normalize into standard VADER compound score formula
  const alpha = 15;
  const compound = totalScore === 0 ? 0.0 : totalScore / Math.sqrt(totalScore * totalScore + alpha);
  return Math.max(-1.0, Math.min(1.0, parseFloat(compound.toFixed(2))));
}

/**
 * Classifies Dialogue Intent / Act
 */
function classifyIntent(text) {
  for (const rule of INTENT_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(text)) {
        return rule.type;
      }
    }
  }
  return "Statement";
}

/**
 * Parses input string (either __eot__ format or Speaker: Text lines)
 */
function parseDialogueText(rawText) {
  const turns = [];
  if (!rawText || !rawText.trim()) return turns;

  if (rawText.includes("__eot__")) {
    const rawTurns = rawText.split("__eot__");
    rawTurns.forEach((turn, idx) => {
      const clean = turn.replace(/__eou__/g, "").trim();
      if (clean) {
        turns.push({
          turn_id: idx + 1,
          speaker: `User_${idx % 2 === 0 ? 'A' : 'B'}`,
          text: clean
        });
      }
    });
  } else {
    const lines = rawText.trim().split("\n");
    let currentIdx = 1;
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed) {
        let speaker = `User_${currentIdx % 2 === 1 ? 'A' : 'B'}`;
        let text = trimmed;
        if (trimmed.includes(":")) {
          const parts = trimmed.split(":");
          speaker = parts[0].trim();
          text = parts.slice(1).join(":").trim();
        }
        turns.push({
          turn_id: currentIdx++,
          speaker: speaker,
          text: text
        });
      }
    });
  }
  return turns;
}

/**
 * Executes the Discourse State Machine (Identical to Python code logic)
 */
function analyzeCommunicationGaps(dialogueTurns) {
  const processedTurns = [];
  const gapsDetected = [];

  // Step A: Utterance-Level Analysis
  dialogueTurns.forEach(turn => {
    const intent = classifyIntent(turn.text);
    const sentiment = computeSentiment(turn.text);
    processedTurns.push({
      turn_id: turn.turn_id,
      speaker: turn.speaker,
      text: turn.text,
      intent: intent,
      compound_sentiment: sentiment
    });
  });

  // Step B: Windowed State Machine Execution
  let pendingQuestions = [];
  let clarificationChain = [];

  processedTurns.forEach((turn, idx) => {
    const t_id = turn.turn_id;
    const speaker = turn.speaker;
    const text = turn.text;
    const intent = turn.intent;
    const sent = turn.compound_sentiment;

    // Rule 1: Clarification / Confusion Loop Detection
    if (intent === "Clarification Request") {
      clarificationChain.push(turn);
      if (clarificationChain.length >= 2) {
        gapsDetected.push({
          gap_type: "Confusion Loop (Repeated Clarification)",
          type_class: "type-confusion",
          at_turn: t_id,
          trigger_speaker: speaker,
          evidence_text: text,
          tone_score: sent,
          details: `Consecutive clarification requests without resolution across turns [${clarificationChain.map(t => t.turn_id).join(", ")}]`
        });
      }
    } else {
      clarificationChain = [];
    }

    // Rule 2: Question & Asynchronous Answer Tracking
    if (intent === "Question") {
      pendingQuestions.push(turn);
    } else if (intent === "Answer" && pendingQuestions.length > 0) {
      // Most recent active question answered
      pendingQuestions.shift();
    }

    // Check for Question Expiration (Ignored after 3 or more turns)
    const remainingQuestions = [];
    pendingQuestions.forEach(q => {
      const turnsElapsed = t_id - q.turn_id;
      if (turnsElapsed >= 3) {
        gapsDetected.push({
          gap_type: "Unanswered Question / Ignored Response",
          type_class: "type-unanswered",
          at_turn: q.turn_id,
          trigger_speaker: q.speaker,
          evidence_text: q.text,
          following_turn_text: `Ignored for ${turnsElapsed} turns. Dialogue continued without answer: "${text}"`,
          tone_score: q.compound_sentiment
        });
      } else {
        remainingQuestions.push(q);
      }
    });
    pendingQuestions = remainingQuestions;

    // Rule 3: Affective Frustration / Negative Tone Shift Marker (threshold <= -0.40)
    if (sent <= -0.40) {
      gapsDetected.push({
        gap_type: "Frustration / Negative Tone Shift",
        type_class: "type-frustration",
        at_turn: t_id,
        trigger_speaker: speaker,
        evidence_text: text,
        tone_score: sent,
        details: `Affective marker fell to ${sent} (exceeding friction tolerance threshold <= -0.40)`
      });
    }
  });

  // Rule 4: Sweep any questions left dangling at conversation end
  pendingQuestions.forEach(q => {
    gapsDetected.push({
      gap_type: "Unresolved Question at Close",
      type_class: "type-unresolved",
      at_turn: q.turn_id,
      trigger_speaker: q.speaker,
      evidence_text: q.text,
      following_turn_text: "Conversation terminated without an answer.",
      tone_score: q.compound_sentiment
    });
  });

  return { processedTurns, gapsDetected };
}

// ================= UI CONTROLLER & RENDERING =================

// Navigation Handler
function navigateTo(screenId) {
  document.querySelectorAll('.screen-view').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-pill').forEach(p => p.classList.remove('active'));

  const targetScreen = document.getElementById(`screen-${screenId}`);
  const targetTab = document.getElementById(`tab-${screenId}`);

  if (targetScreen) targetScreen.classList.add('active');
  if (targetTab) targetTab.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Render Segmented Radial Arc Gauge matching Pinterest screenshot
function renderSegmentedGauge(activePercentage = 70.8) {
  const container = document.getElementById('arc-segments-group');
  if (!container) return;

  const isDarkMode = document.body.classList.contains('dark-mode');
  const totalSegments = 14;
  const radius = 95;
  const centerX = 130;
  const centerY = 145;
  const activeSegmentsCount = Math.round((activePercentage / 100) * totalSegments);

  let svgHtml = '';

  for (let i = 0; i < totalSegments; i++) {
    // Semi-circle arc from 180 deg (left) to 0 deg (right)
    const angleStart = 180 - (i * (180 / totalSegments)) - 2;
    const angleEnd = 180 - ((i + 1) * (180 / totalSegments)) + 2;

    const radStart = (angleStart * Math.PI) / 180;
    const radEnd = (angleEnd * Math.PI) / 180;

    const innerR = 72;
    const outerR = 98;

    const x1 = centerX + outerR * Math.cos(radStart);
    const y1 = centerY - outerR * Math.sin(radStart);
    const x2 = centerX + outerR * Math.cos(radEnd);
    const y2 = centerY - outerR * Math.sin(radEnd);

    const x3 = centerX + innerR * Math.cos(radEnd);
    const y3 = centerY - innerR * Math.sin(radEnd);
    const x4 = centerX + innerR * Math.cos(radStart);
    const y4 = centerY - innerR * Math.sin(radStart);

    const pathData = `M ${x1} ${y1} A ${outerR} ${outerR} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 0 0 ${x4} ${y4} Z`;

    let fillColor = isDarkMode ? '#1e293b' : '#e2e8f0'; // Inactive segment color
    if (i < activeSegmentsCount) {
      // Color interpolation from deep blue to bright cyan
      if (i < 5) fillColor = '#2563eb';
      else if (i < 8) fillColor = '#3b82f6';
      else fillColor = '#60a5fa';
    }

    svgHtml += `<path d="${pathData}" fill="${fillColor}" rx="4" style="transition: fill 0.3s ease;"/>`;
  }

  container.innerHTML = svgHtml;
}

// Render Recent Sessions Table
function renderRecentSessions(sessions = HISTORICAL_SESSIONS) {
  const tbody = document.getElementById('sessions-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  sessions.forEach(sess => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="checkbox" class="session-checkbox"></td>
      <td>
        <div class="session-info-cell">
          <div class="session-avatar">${sess.participants[0].charAt(0)}</div>
          <div>
            <div class="session-title">${sess.title}</div>
            <div class="session-snippet">${sess.snippet}</div>
          </div>
        </div>
      </td>
      <td><strong>${sess.id}</strong></td>
      <td style="color: #64748b;">${sess.date}</td>
      <td>
        <span style="font-size: 0.8rem; font-weight: 600; color: #475569;">${sess.participants.join(', ')}</span>
      </td>
      <td><span style="font-size: 0.82rem; font-weight: 600;">${sess.category}</span></td>
      <td>
        <span class="status-badge ${sess.status}">
          <span class="badge-dot" style="position: static; width: 6px; height: 6px; background: currentColor; border: none;"></span>
          ${sess.statusText}
        </span>
      </td>
      <td><strong>${sess.turns}</strong></td>
      <td style="font-weight: 700; color: ${sess.health.startsWith('9') ? '#059669' : '#ea580c'};">${sess.health}</td>
      <td>
        <button class="btn-inspect" onclick="inspectSession('${sess.sampleKey}')">Inspect</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Filter Sessions Table in Dashboard
function filterSessionsTable() {
  const query = document.getElementById('session-search-input').value.toLowerCase();
  const filtered = HISTORICAL_SESSIONS.filter(s =>
    s.title.toLowerCase().includes(query) ||
    s.snippet.toLowerCase().includes(query) ||
    s.category.toLowerCase().includes(query) ||
    s.participants.some(p => p.toLowerCase().includes(query))
  );
  renderRecentSessions(filtered);
}

// Load Sample and Run Analysis
function loadSampleAndAnalyze(sampleKey) {
  navigateTo('analyzer');
  const sampleText = SAMPLE_DATASETS[sampleKey] || SAMPLE_DATASETS[1];
  const inputEl = document.getElementById('dialogue-input');
  if (inputEl) {
    inputEl.value = sampleText;
  }

  // Update sample pill states
  document.querySelectorAll('.btn-sample-pill').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.includes(sampleKey.toString()));
  });

  runAnalysis();
}

// Inspect Session from Dashboard
function inspectSession(sampleKey) {
  loadSampleAndAnalyze(sampleKey);
  showToast("Loaded dialogue session into inspector");
}

// Clear Textarea
function clearInput() {
  const inputEl = document.getElementById('dialogue-input');
  if (inputEl) inputEl.value = '';
}

// Load Random Scenario
function loadRandomSample() {
  const keys = Object.keys(SAMPLE_DATASETS);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  loadSampleAndAnalyze(randomKey);
}

// Trace View Switcher (Table vs Chat Bubbles)
function switchTraceView(viewType) {
  document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.trace-view-container').forEach(v => v.classList.remove('active'));

  if (viewType === 'table') {
    document.getElementById('btn-view-table').classList.add('active');
    document.getElementById('trace-table-view').classList.add('active');
  } else {
    document.getElementById('btn-view-chat').classList.add('active');
    document.getElementById('trace-chat-view').classList.add('active');
  }
}

// Toast Popup Notification
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.style.display = 'flex';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 2600);
}

// Export Summary Report
function exportReport() {
  showToast("Exporting discourse metrics report as CSV / JSON...");
}

function toggleFilterDrawer() {
  showToast("Filter parameters applied: All Channels & Corpus");
}

// ================= MAIN RUN ANALYSIS PIPELINE =================
function runAnalysis() {
  const inputEl = document.getElementById('dialogue-input');
  const rawText = inputEl ? inputEl.value : '';

  if (!rawText.trim()) {
    showToast("Please enter or load a transcript first.");
    return;
  }

  // 1. Parse dialogue
  const dialogueTurns = parseDialogueText(rawText);
  if (dialogueTurns.length === 0) {
    showToast("No dialogue turns found.");
    return;
  }

  // 2. Run Engine
  const { processedTurns, gapsDetected } = analyzeCommunicationGaps(dialogueTurns);

  // 3. Update High-Level Metric Boxes
  const totalTurns = processedTurns.length;
  const questionsCount = processedTurns.filter(t => t.intent === 'Question').length;
  const totalGaps = gapsDetected.length;

  document.getElementById('res-total-turns').textContent = totalTurns;
  document.getElementById('res-total-questions').textContent = questionsCount;
  document.getElementById('res-total-gaps').textContent = totalGaps;

  const frictionBox = document.getElementById('res-friction-box');
  if (frictionBox) {
    frictionBox.className = `sum-box ${totalGaps > 0 ? 'sum-red' : 'sum-green'}`;
  }

  // 4. Render Detected Gaps Cards
  const gapsContainer = document.getElementById('gaps-cards-container');
  if (gapsContainer) {
    if (gapsDetected.length === 0) {
      gapsContainer.innerHTML = `
        <div class="no-gaps-badge">
          &#10003; <strong>Zero Communication Gaps Detected:</strong> Conversation flow resolved smoothly with all obligations satisfied and positive tone stability.
        </div>
      `;
    } else {
      let cardsHtml = '';
      gapsDetected.forEach(g => {
        const toneHtml = g.tone_score !== undefined
          ? `<span class="gap-tone-chip" style="color: ${g.tone_score < 0 ? '#ef4444' : '#10b981'};">Tone Score: ${g.tone_score > 0 ? '+' : ''}${g.tone_score}</span>`
          : '';

        const contextHtml = g.following_turn_text
          ? `<div class="gap-context"><strong>Context / Trace:</strong> ${g.following_turn_text}</div>`
          : g.details
            ? `<div class="gap-context"><strong>Details:</strong> ${g.details}</div>`
            : '';

        cardsHtml += `
          <div class="gap-card ${g.type_class}">
            <div class="gap-card-header">
              <span class="gap-badge">${g.gap_type}</span>
              <span class="gap-location">Turn #${g.at_turn} (${g.trigger_speaker})</span>
            </div>
            <div class="gap-evidence">"${g.evidence_text}"</div>
            ${contextHtml}
            ${toneHtml}
          </div>
        `;
      });
      gapsContainer.innerHTML = cardsHtml;
    }
  }

  // 5. Render Trace Table
  const traceTbody = document.getElementById('trace-tbody');
  if (traceTbody) {
    let rowsHtml = '';
    processedTurns.forEach(t => {
      const isSpeakerA = t.speaker.toLowerCase().includes('a') || t.speaker.toLowerCase().includes('alex') || t.speaker.toLowerCase().includes('lead');
      const speakerClass = isSpeakerA ? 'speaker-a' : 'speaker-b';

      const sent = t.compound_sentiment;
      const sentPercent = Math.round(((sent + 1) / 2) * 100);
      const sentColor = sent <= -0.40 ? '#ef4444' : sent < 0 ? '#f97316' : sent > 0.3 ? '#10b981' : '#64748b';

      rowsHtml += `
        <tr>
          <td><strong>#${t.turn_id}</strong></td>
          <td>
            <div class="speaker-pill ${speakerClass}">
              <span class="speaker-dot"></span>
              ${t.speaker}
            </div>
          </td>
          <td>
            <span class="intent-tag intent-${t.intent.replace(/\s+/g, '')}">${t.intent}</span>
          </td>
          <td>
            <div class="sentiment-bar-wrap">
              <div class="sentiment-bar">
                <div class="sentiment-fill" style="width: ${sentPercent}%; background: ${sentColor};"></div>
              </div>
              <span class="sentiment-val" style="color: ${sentColor};">${sent > 0 ? '+' : ''}${sent}</span>
            </div>
          </td>
          <td class="utterance-text">${t.text}</td>
        </tr>
      `;
    });
    traceTbody.innerHTML = rowsHtml;
  }

  // 6. Render Chat Bubbles Stream
  const chatContainer = document.getElementById('chat-stream-container');
  if (chatContainer) {
    let bubblesHtml = '';
    processedTurns.forEach(t => {
      const isSpeakerA = t.speaker.toLowerCase().includes('a') || t.speaker.toLowerCase().includes('alex');
      const speakerClass = isSpeakerA ? 'speaker-a' : 'speaker-b';
      const initial = t.speaker.charAt(0).toUpperCase();

      bubblesHtml += `
        <div class="chat-bubble-row ${speakerClass}">
          <div class="chat-avatar">${initial}</div>
          <div class="bubble-content">
            <div class="bubble-meta">
              <span class="bubble-speaker">${t.speaker} (Turn #${t.turn_id})</span>
              <span class="intent-tag intent-${t.intent.replace(/\s+/g, '')}">${t.intent}</span>
            </div>
            <div class="bubble-text">${t.text}</div>
          </div>
        </div>
      `;
    });
    chatContainer.innerHTML = bubblesHtml;
  }

  showToast(`Analyzed ${totalTurns} turns. ${totalGaps} friction markers detected.`);
}

// ================= THEME TOGGLE (LIGHT / DARK MODE) =================
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('sensis_theme', isDark ? 'dark' : 'light');
  updateThemeIcons(isDark);
  renderSegmentedGauge(70.8);
  showToast(`Switched to ${isDark ? 'Dark' : 'Light'} Mode`);
}

function updateThemeIcons(isDark) {
  const sunIcon = document.querySelector('.sun-icon');
  const moonIcon = document.querySelector('.moon-icon');
  if (sunIcon && moonIcon) {
    if (isDark) {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    } else {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    }
  }
}

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', () => {
  // Check and apply stored theme preference
  const savedTheme = localStorage.getItem('sensis_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.body.classList.add('dark-mode');
    updateThemeIcons(true);
  } else {
    document.body.classList.remove('dark-mode');
    updateThemeIcons(false);
  }

  // Initialize Segmented Arc Gauge with Pinterest value (70.8%)
  renderSegmentedGauge(70.8);

  // Initialize Recent Sessions Table
  renderRecentSessions();

  // Load default sample 1 into analyzer
  const inputEl = document.getElementById('dialogue-input');
  if (inputEl) {
    inputEl.value = SAMPLE_DATASETS[1];
  }

  // Run initial analysis so the analyzer view is pre-populated
  runAnalysis();
});
