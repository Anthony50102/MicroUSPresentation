"""
Full 18-slide deck v4 — Gradient Noir
"The Next Layer for Digital Twins: From Simulation to Autonomous Action"

Incorporates all feedback from review round.
"""

from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE
import math
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

SLIDE_WIDTH = Inches(13.333)
SLIDE_HEIGHT = Inches(7.5)

# ── Gradient Noir Palette ──
BG1 = '#0F172A'
BG2 = '#1E1E2E'
WHITE = '#F5F5F0'
CREAM = '#E8E4D9'
DIM = '#6B7280'
DARKER_DIM = '#4B5563'
ACCENT = '#D4D0C8'
CARD_BG = '#151D30'
CARD_BG2 = '#1A2236'
FONT = 'Segoe UI'


def hex_to_rgb(h):
    h = h.lstrip('#')
    return RGBColor(int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def set_gradient_bg(slide):
    bg = slide.background
    fill = bg.fill
    fill.gradient()
    fill.gradient_stops[0].color.rgb = hex_to_rgb(BG1)
    fill.gradient_stops[0].position = 0.0
    fill.gradient_stops[1].color.rgb = hex_to_rgb(BG2)
    fill.gradient_stops[1].position = 1.0


def tb(slide, left, top, width, height, text, size, color,
       bold=False, align=PP_ALIGN.LEFT, italic=False, font=FONT):
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.name = font
    p.font.size = Pt(size)
    p.font.color.rgb = hex_to_rgb(color)
    p.font.bold = bold
    p.font.italic = italic
    p.alignment = align
    return txBox


def multi_para(slide, left, top, width, height, lines, font=FONT,
               align=PP_ALIGN.LEFT, spacing=6):
    """lines = [(text, size, color, bold), ...]"""
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    for i, (text, size, color, bold) in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = text
        p.font.name = font
        p.font.size = Pt(size)
        p.font.color.rgb = hex_to_rgb(color)
        p.font.bold = bold
        p.alignment = align
        p.space_before = Pt(spacing)
        p.space_after = Pt(spacing)
    return txBox


def rect(slide, left, top, width, height, fill=None, line=None, lw=Pt(1)):
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, height)
    if fill:
        shape.fill.solid()
        shape.fill.fore_color.rgb = hex_to_rgb(fill)
    else:
        shape.fill.background()
    if line:
        shape.line.color.rgb = hex_to_rgb(line)
        shape.line.width = lw
    else:
        shape.line.fill.background()
    return shape


def rrect(slide, left, top, width, height, fill=None, line=None, lw=Pt(1.5)):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE,
                                   left, top, width, height)
    if fill:
        shape.fill.solid()
        shape.fill.fore_color.rgb = hex_to_rgb(fill)
    else:
        shape.fill.background()
    if line:
        shape.line.color.rgb = hex_to_rgb(line)
        shape.line.width = lw
    else:
        shape.line.fill.background()
    return shape


def rrect_text(slide, left, top, width, height, text, size, color,
               fill=None, line=None, bold=True, align=PP_ALIGN.CENTER):
    shape = rrect(slide, left, top, width, height, fill, line)
    tf = shape.text_frame
    tf.word_wrap = True
    tf.auto_size = None
    p = tf.paragraphs[0]
    p.text = text
    p.font.name = FONT
    p.font.size = Pt(size)
    p.font.color.rgb = hex_to_rgb(color)
    p.font.bold = bold
    p.alignment = align
    return shape


def oval(slide, left, top, w, h, fill=None, line=None, lw=Pt(2)):
    shape = slide.shapes.add_shape(MSO_SHAPE.OVAL, left, top, w, h)
    if fill:
        shape.fill.solid()
        shape.fill.fore_color.rgb = hex_to_rgb(fill)
    else:
        shape.fill.background()
    if line:
        shape.line.color.rgb = hex_to_rgb(line)
        shape.line.width = lw
    else:
        shape.line.fill.background()
    return shape


def oval_text(slide, cx, cy, r, text, size, font_color,
              fill=None, line=None, bold=True):
    shape = oval(slide, cx - r, cy - r, r * 2, r * 2, fill, line)
    tf = shape.text_frame
    tf.word_wrap = True
    tf.auto_size = None
    p = tf.paragraphs[0]
    p.text = text
    p.font.name = FONT
    p.font.size = Pt(size)
    p.font.color.rgb = hex_to_rgb(font_color)
    p.font.bold = bold
    p.alignment = PP_ALIGN.CENTER
    return shape


def connector(slide, x1, y1, x2, y2, color, width=Pt(1.5)):
    c = slide.shapes.add_connector(1, x1, y1, x2, y2)
    c.line.color.rgb = hex_to_rgb(color)
    c.line.width = width
    return c


# ═══════════════════════════════════════
# BUILD THE DECK
# ═══════════════════════════════════════

prs = Presentation()
prs.slide_width = SLIDE_WIDTH
prs.slide_height = SLIDE_HEIGHT


# ───────────────────────────────────
# SLIDE 1 — Title
# ───────────────────────────────────
s = prs.slides.add_slide(prs.slide_layouts[6])
set_gradient_bg(s)
tb(s, Inches(1.5), Inches(2.2), Inches(10), Inches(2.0),
   'The Next Layer\nfor Digital Twins', 54, WHITE, bold=True)
tb(s, Inches(1.5), Inches(4.2), Inches(10), Inches(0.8),
   'From Simulation to Autonomous Action', 26, CREAM)
rect(s, Inches(1.5), Inches(5.4), Inches(3), Inches(0.012), fill=ACCENT)
tb(s, Inches(1.5), Inches(5.65), Inches(5), Inches(0.4),
   'Anthony Poole  ·  AI Engineer, Microsoft', 18, DIM)
tb(s, Inches(1.5), Inches(6.05), Inches(6), Inches(0.4),
   'Microelectronics US 2026  ·  Embedded Systems Stage  ·  April 22',
   14, DARKER_DIM)


# ───────────────────────────────────
# SLIDE 2 — What Is a Digital Twin? (bigger)
# ───────────────────────────────────
s = prs.slides.add_slide(prs.slide_layouts[6])
set_gradient_bg(s)
tb(s, Inches(1.2), Inches(0.5), Inches(5), Inches(0.5),
   'The Foundation', 14, DARKER_DIM)

# Large Physical System box (left)
rrect_text(s, Inches(0.8), Inches(1.8), Inches(4.8), Inches(4.0),
           'Physical\nSystem', 32, WHITE, fill=CARD_BG, line=ACCENT)

# Large arrows — arrow character on its own line, label below
tb(s, Inches(5.7), Inches(2.2), Inches(2.0), Inches(1.0),
   '→', 48, CREAM, align=PP_ALIGN.CENTER)
tb(s, Inches(5.7), Inches(3.0), Inches(2.0), Inches(0.5),
   'Sensors & Data', 16, DIM, align=PP_ALIGN.CENTER)
tb(s, Inches(5.7), Inches(4.0), Inches(2.0), Inches(1.0),
   '←', 48, CREAM, align=PP_ALIGN.CENTER)
tb(s, Inches(5.7), Inches(4.8), Inches(2.0), Inches(0.5),
   'Simulation', 16, DIM, align=PP_ALIGN.CENTER)

# Large Digital Twin box (right)
rrect_text(s, Inches(7.7), Inches(1.8), Inches(4.8), Inches(4.0),
           'Digital\nTwin', 32, WHITE, fill=CARD_BG, line=ACCENT)

tb(s, Inches(1.2), Inches(6.2), Inches(11), Inches(0.8),
   'A virtual model, continuously synced with a physical system.',
   20, DIM)


# ───────────────────────────────────
# SLIDE 4 — The Stakes (multi-industry)
# ───────────────────────────────────
s = prs.slides.add_slide(prs.slide_layouts[6])
set_gradient_bg(s)

# Multiple industry metrics across the top
metrics = [
    ('$22K / min', 'Automotive\ndowntime'),
    ('$X / hour', 'Semiconductor\nfab downtime'),
    ('$X / event', 'Energy grid\noutage cost'),
]
for i, (val, label) in enumerate(metrics):
    x = Inches(1.2 + i * 4.0)
    tb(s, x, Inches(1.3), Inches(3.5), Inches(1.0),
       val, 48, WHITE, bold=True)
    tb(s, x, Inches(2.4), Inches(3.5), Inches(1.0),
       label, 16, DIM)

rect(s, Inches(1.2), Inches(4.0), Inches(2), Inches(0.015), fill=ACCENT)

tb(s, Inches(1.2), Inches(4.4), Inches(10.5), Inches(2.0),
   'Your systems generate more data every hour\nthan your teams can act on in a week.',
   30, CREAM, bold=True)


# ───────────────────────────────────
# SLIDE 5 — The Evolution
# ───────────────────────────────────
s = prs.slides.add_slide(prs.slide_layouts[6])
set_gradient_bg(s)
tb(s, Inches(1.2), Inches(0.5), Inches(5), Inches(0.5),
   'The Evolution', 14, DARKER_DIM)

gens = [
    ('Gen 1', 'Static', '"Here\'s what\nit looks like"'),
    ('Gen 2', 'Reactive', '"Something\nwent wrong"'),
    ('Gen 3', 'Predictive', '"Something\nwill go wrong"'),
    ('Gen 4', '?', ''),
]
card_w = Inches(2.7)
total_w = 4 * card_w.inches + 3 * 0.3
margin = (13.333 - total_w) / 2
for i, (label, name, desc) in enumerate(gens):
    x = Inches(margin + i * (card_w.inches + 0.3))
    fill = CARD_BG if i < 3 else None
    line_c = DARKER_DIM if i < 3 else ACCENT
    rrect_text(s, x, Inches(1.8), Inches(2.7), Inches(1.3),
              f'{label}: {name}', 20, WHITE if i < 3 else CREAM,
              fill=fill, line=line_c, bold=True)
    if desc:
        tb(s, x, Inches(3.3), Inches(2.7), Inches(1.2),
           desc, 15, DIM, align=PP_ALIGN.CENTER)
    if i < 3:
        arrow_x = x + card_w
        tb(s, arrow_x, Inches(2.1), Inches(0.3), Inches(1.0),
           '→', 24, DARKER_DIM, align=PP_ALIGN.CENTER)

tb(s, Inches(1.0), Inches(5.2), Inches(11), Inches(1.5),
   'Each generation gets smarter about what\'s happening.\nBut the human is still the one who decides what to do about it.',
   22, CREAM)


# ───────────────────────────────────
# SLIDE 5 — The Confession
# ───────────────────────────────────
s = prs.slides.add_slide(prs.slide_layouts[6])
set_gradient_bg(s)
tb(s, Inches(1.5), Inches(2.5), Inches(10), Inches(3.0),
   'Digital twins can see everything.\nThey can\'t do anything\nabout what they see.',
   42, CREAM, bold=True)


# ───────────────────────────────────
# SLIDE 6 — The 2 AM Story (minimal, speaker carries it)
# ───────────────────────────────────
s = prs.slides.add_slide(prs.slide_layouts[6])
set_gradient_bg(s)

tb(s, Inches(1.5), Inches(2.2), Inches(10), Inches(1.5),
   '2:14 AM', 72, WHITE, bold=True)
tb(s, Inches(1.5), Inches(4.0), Inches(10), Inches(0.8),
   'Etch chamber 3.', 24, DIM)


# ───────────────────────────────────
# SLIDE 7 — "Agents"
# ───────────────────────────────────
s = prs.slides.add_slide(prs.slide_layouts[6])
set_gradient_bg(s)
tb(s, Inches(1.5), Inches(2.5), Inches(10), Inches(1.5),
   'Agents', 72, WHITE, bold=True)
tb(s, Inches(1.5), Inches(4.0), Inches(8), Inches(0.8),
   'Autonomous AI systems that can reason, plan, and act.', 24, CREAM)


# ───────────────────────────────────
# SLIDE 8 — Four Capabilities (no footnote)
# ───────────────────────────────────
s = prs.slides.add_slide(prs.slide_layouts[6])
set_gradient_bg(s)
tb(s, Inches(1.2), Inches(0.5), Inches(5), Inches(0.5),
   'What Makes an Agent', 14, DARKER_DIM)

caps = [
    ('Autonomy', 'Acts within defined\nboundaries without\nprompting'),
    ('Planning', 'Breaks complex problems\ninto multi-step\nworkflows'),
    ('Tool Use', 'Connects to real\nsystems, APIs,\nand databases'),
    ('Reflection', 'Evaluates its own\nactions and adjusts\nstrategy'),
]
card_w = Inches(2.7)
total_w = 4 * card_w.inches + 3 * 0.3  # 3 gaps of 0.3"
margin = (13.333 - total_w) / 2
for i, (title, desc) in enumerate(caps):
    x = Inches(margin + i * (card_w.inches + 0.3))
    rrect_text(s, x, Inches(2.0), card_w, Inches(1.2),
              title, 22, WHITE, fill=CARD_BG, line=ACCENT, bold=True)
    tb(s, x + Inches(0.15), Inches(3.5), Inches(2.5), Inches(1.8),
       desc, 15, DIM, align=PP_ALIGN.CENTER)


# ───────────────────────────────────
# SLIDE 9 — The Convergence (fixed Venn)
# ───────────────────────────────────
s = prs.slides.add_slide(prs.slide_layouts[6])
set_gradient_bg(s)

# Two circles — outline only (no fill) so intersection outlines are both visible
# Left circle: DT
oval(s, Inches(1.8), Inches(1.2), Inches(5.5), Inches(5.5),
     fill=None, line=ACCENT, lw=Pt(1.5))
tb(s, Inches(2.3), Inches(3.2), Inches(3.5), Inches(1.0),
   'Digital\nTwins', 30, WHITE, bold=True)
tb(s, Inches(2.3), Inches(4.5), Inches(3.2), Inches(1.0),
   'The data.\nThe models.\nThe simulation.', 16, DIM)

# Right circle: Agentic AI
oval(s, Inches(6.0), Inches(1.2), Inches(5.5), Inches(5.5),
     fill=None, line=ACCENT, lw=Pt(1.5))
tb(s, Inches(7.8), Inches(3.2), Inches(3.5), Inches(1.0),
   'Agentic\nAI', 30, WHITE, bold=True)
tb(s, Inches(7.8), Inches(4.5), Inches(3.2), Inches(1.0),
   'The reasoning.\nThe planning.\nThe action.', 16, DIM)

# Clear ? in the visible intersection zone
tb(s, Inches(5.5), Inches(3.3), Inches(2.3), Inches(1.5),
   '?', 56, CREAM, bold=True, align=PP_ALIGN.CENTER)


# ───────────────────────────────────
# SLIDE 10 — The Reveal (transition)
# ───────────────────────────────────
s = prs.slides.add_slide(prs.slide_layouts[6])
set_gradient_bg(s)

tb(s, Inches(0), Inches(2.5), Inches(13.333), Inches(2.5),
   'The twin that thinks.', 56, WHITE, bold=True, align=PP_ALIGN.CENTER)


# ───────────────────────────────────
# SLIDE 11 — The Loop (control-loop style)
# ───────────────────────────────────
s = prs.slides.add_slide(prs.slide_layouts[6])
set_gradient_bg(s)
tb(s, Inches(1.2), Inches(0.5), Inches(5), Inches(0.5),
   'The Agentic Control Loop', 14, DARKER_DIM)

# Horizontal control loop — more familiar to engineers
# Perceive → Reason → Plan → Act → Reflect (with feedback arrow back)
steps = ['Perceive', 'Reason', 'Plan', 'Act', 'Reflect']
box_w = Inches(2.0)
box_h = Inches(1.2)
start_x = Inches(0.8)
y_main = Inches(3.0)
gap = Inches(0.5)

for i, step in enumerate(steps):
    x = start_x + i * (box_w + gap)
    rrect_text(s, x, y_main, box_w, box_h,
              step, 20, WHITE, fill=CARD_BG, line=ACCENT)
    # Arrow to next (except last) — vertically centered on box
    if i < 4:
        ax = x + box_w + Inches(0.05)
        arrow_h = Inches(0.6)
        arrow_y = y_main + (box_h - arrow_h) / 2
        tb(s, ax, arrow_y, gap - Inches(0.1), arrow_h,
           '→', 22, ACCENT, align=PP_ALIGN.CENTER)

# Feedback arrow: Reflect back to Perceive (drawn below the boxes)
fb_y = y_main + box_h + Inches(0.3)
last_x = start_x + 4 * (box_w + gap) + box_w / 2
first_x = start_x + box_w / 2

# Bottom feedback line
rect(s, first_x, fb_y, last_x - first_x, Inches(0.015), fill=ACCENT)
# Right vertical (down from Reflect)
rect(s, last_x - Inches(0.008), y_main + box_h, Inches(0.015),
     fb_y - y_main - box_h + Inches(0.015), fill=ACCENT)
# Left vertical (up to Perceive)
rect(s, first_x - Inches(0.008), y_main + box_h, Inches(0.015),
     fb_y - y_main - box_h + Inches(0.015), fill=ACCENT)
# Arrowhead pointing up at Perceive box
tb(s, first_x - Inches(0.25), y_main + box_h - Inches(0.15), Inches(0.5), Inches(0.4),
   '▲', 14, ACCENT, align=PP_ALIGN.CENTER)

# Label on feedback
tb(s, Inches(4.5), fb_y + Inches(0.1), Inches(4.5), Inches(0.5),
   'Continuous feedback', 14, DIM, align=PP_ALIGN.CENTER)

# Subtitle
tb(s, Inches(1.2), Inches(5.5), Inches(11), Inches(1.0),
   'Perceive the environment. Reason about causes. Plan a response.\nAct through connected systems. Reflect on outcomes.',
   18, CREAM)


# ───────────────────────────────────
# SLIDE 12 — Architecture (simplified three layers)
# ───────────────────────────────────
s = prs.slides.add_slide(prs.slide_layouts[6])
set_gradient_bg(s)

layers = [
    ('The Mind',       'Cognitive Layer',  ACCENT,     CREAM),
    ('The Mirror',     'Digital Twin',     DARKER_DIM, WHITE),
    ('The Real Thing', 'Physical System',  DARKER_DIM, WHITE),
]

for i, (label, name, line_c, text_c) in enumerate(layers):
    y = Inches(1.3 + i * 1.7)
    h = Inches(1.3)
    rrect_text(s, Inches(3.2), y, Inches(8.5), h,
              name, 28, text_c, fill=CARD_BG, line=line_c)
    tb(s, Inches(0.6), y + Inches(0.3), Inches(2.4), Inches(0.7),
       label, 22, CREAM if i == 0 else DIM, bold=i == 0,
       align=PP_ALIGN.RIGHT)


# ───────────────────────────────────
# SLIDE 13 — The Evidence
# ───────────────────────────────────
s = prs.slides.add_slide(prs.slide_layouts[6])
set_gradient_bg(s)
tb(s, Inches(1.2), Inches(0.5), Inches(5), Inches(0.5),
   'The Evidence', 14, DARKER_DIM)

evidence = [
    ('IBM — AAAI 2025',
     'First major academic paper on agentic digital twins.\n'
     'LLM agents for shipping fleet management —\n'
     'autonomously plan, execute, reflect.'),
    ('XMPro MAGS',
     'Production multi-agent system for manufacturing.\n'
     '30–40% reduction in unplanned downtime.\n'
     'Open source.'),
    ('Nature Computational Science',
     'Published a formal evolutionary framework.\n'
     'This field has its own taxonomy now.'),
]
for i, (title, desc) in enumerate(evidence):
    y = Inches(1.4 + i * 1.9)
    rect(s, Inches(1.5), y, Inches(0.08), Inches(1.4), fill=ACCENT)
    tb(s, Inches(2.0), y, Inches(9), Inches(0.5), title, 22, WHITE, bold=True)
    tb(s, Inches(2.0), y + Inches(0.5), Inches(9), Inches(1.0), desc, 16, DIM)


# ───────────────────────────────────
# SLIDE 14 — Multi-Agent (simplified)
# ───────────────────────────────────
s = prs.slides.add_slide(prs.slide_layouts[6])
set_gradient_bg(s)
tb(s, Inches(1.2), Inches(0.5), Inches(8), Inches(0.5),
   'Multi-Agent Systems', 14, DARKER_DIM)

# Three agents — simpler, just cards with role name
agents = [
    ('Monitor', 'Detects anomalies'),
    ('Analyst', 'Finds root causes'),
    ('Planner', 'Schedules responses'),
]
card_w = Inches(3.5)
total_w = 3 * card_w.inches + 2 * 0.4  # 2 gaps of 0.4"
margin = (13.333 - total_w) / 2
for i, (name, desc) in enumerate(agents):
    x = Inches(margin + i * (card_w.inches + 0.4))
    rrect_text(s, x, Inches(2.2), card_w, Inches(2.0),
              name, 28, WHITE, fill=CARD_BG, line=ACCENT)
    tb(s, x, Inches(4.4), card_w, Inches(0.6),
       desc, 17, DIM, align=PP_ALIGN.CENTER)
    if i < 2:
        arrow_h = Inches(0.8)
        arrow_y = Inches(2.2) + (Inches(2.0) - arrow_h) / 2
        tb(s, x + card_w, arrow_y, Inches(0.4), arrow_h,
           '→', 28, ACCENT, align=PP_ALIGN.CENTER)

tb(s, Inches(1.2), Inches(5.6), Inches(11), Inches(1.0),
   'Specialized agents. Collaborate and check each other\'s work.\n'
   'The agent that proposes is never the one that approves.',
   18, CREAM)


# ───────────────────────────────────
# SLIDE 15 — Three Worlds, One Pattern
# ───────────────────────────────────
s = prs.slides.add_slide(prs.slide_layouts[6])
set_gradient_bg(s)
tb(s, Inches(1.2), Inches(0.5), Inches(8), Inches(0.5),
   'One Pattern, Three Worlds', 14, DARKER_DIM)

domains = [
    ('Edge AI Device', 'Model drift\n→ Diagnose\n→ Retrain'),
    ('Robotic Arm', 'Bearing wear\n→ Predict\n→ Schedule'),
    ('ADAS Sensor Suite', 'Sensor fusion\n→ Safety\n→ Adapt'),
]
card_w = Inches(3.6)
total_w = 3 * card_w.inches + 2 * 0.35
margin = (13.333 - total_w) / 2
for i, (name, flow) in enumerate(domains):
    x = Inches(margin + i * (card_w.inches + 0.35))
    rrect_text(s, x, Inches(1.8), card_w, Inches(1.3),
              name, 24, WHITE, fill=CARD_BG, line=ACCENT)
    tb(s, x + Inches(0.3), Inches(3.4), Inches(3.0), Inches(2.0),
       flow, 18, DIM, align=PP_ALIGN.LEFT)

tb(s, Inches(1.0), Inches(5.8), Inches(11), Inches(1.0),
   'Same loop. Same architecture. Different worlds.\nThe pattern is universal.',
   22, CREAM, bold=True)


# ───────────────────────────────────
# SLIDE 16 — Challenges (fixed overlap)
# ───────────────────────────────────
s = prs.slides.add_slide(prs.slide_layouts[6])
set_gradient_bg(s)
tb(s, Inches(1.2), Inches(0.5), Inches(5), Inches(0.5),
   'Let\'s Be Honest', 14, DARKER_DIM)

challenges = [
    ('Accountability', 'When the agent decides wrong, who owns it?'),
    ('Explainability', 'Can you trace why it made that call?'),
    ('Security', 'New attack surfaces we haven\'t fully mapped.'),
    ('Governance', 'Our frameworks weren\'t built for autonomous agents.'),
]
for i, (title, desc) in enumerate(challenges):
    y = Inches(1.4 + i * 1.3)
    rect(s, Inches(1.5), y + Inches(0.05), Inches(0.08), Inches(0.8), fill=ACCENT)
    tb(s, Inches(2.0), y, Inches(4), Inches(0.5), title, 22, WHITE, bold=True)
    tb(s, Inches(2.0), y + Inches(0.45), Inches(9), Inches(0.5), desc, 17, DIM)


# ───────────────────────────────────
# SLIDE 17 — Demo CTA
# ───────────────────────────────────
s = prs.slides.add_slide(prs.slide_layouts[6])
set_gradient_bg(s)

tb(s, Inches(1.5), Inches(1.2), Inches(10), Inches(1.0),
   'Talk to an agentic digital twin yourself.', 36, WHITE, bold=True)

# QR code — demo
qr_demo = os.path.join(SCRIPT_DIR, 'qr-demo.png')
if os.path.exists(qr_demo):
    s.shapes.add_picture(qr_demo, Inches(4.7), Inches(2.5), Inches(3.9), Inches(3.5))
else:
    rrect_text(s, Inches(4.5), Inches(2.5), Inches(4.3), Inches(3.5),
              '[ QR Code ]', 24, DIM, fill=CARD_BG, line=ACCENT, bold=False)

# Three domain labels
for i, name in enumerate(['Edge AI', 'Robotic Arm', 'ADAS']):
    x = Inches(2.5 + i * 3.2)
    rrect_text(s, x, Inches(6.3), Inches(2.5), Inches(0.6),
              name, 14, CREAM, fill=CARD_BG, line=DARKER_DIM, bold=False)

tb(s, Inches(0), Inches(6.95), Inches(13.333), Inches(0.4),
   'tonypdemo.it.com', 14, DIM, align=PP_ALIGN.CENTER)


# ───────────────────────────────────
# SLIDE 18 — Close (with takeaway folded in)
# ───────────────────────────────────
s = prs.slides.add_slide(prs.slide_layouts[6])
set_gradient_bg(s)

tb(s, Inches(1.5), Inches(1.5), Inches(10), Inches(1.5),
   'Digital twins already have the data.\nAgentic AI gives them the ability to act on it.',
   28, CREAM, italic=True)

rect(s, Inches(1.5), Inches(3.5), Inches(2.5), Inches(0.012), fill=ACCENT)

tb(s, Inches(1.5), Inches(4.0), Inches(6), Inches(1.0),
   'Anthony Poole', 44, WHITE, bold=True)
tb(s, Inches(1.5), Inches(4.9), Inches(6), Inches(0.6),
   'AI Engineer, Microsoft', 24, CREAM)
tb(s, Inches(1.5), Inches(5.7), Inches(6), Inches(0.5),
   'anthony50102.github.io  ·  linkedin.com/in/anthony-poole-079548206', 18, DIM)
tb(s, Inches(1.5), Inches(6.5), Inches(6), Inches(0.5),
   'Thank you.', 20, CREAM)

# Personal site QR code (right side)
qr_personal = os.path.join(SCRIPT_DIR, 'qr-personal.png')
if os.path.exists(qr_personal):
    s.shapes.add_picture(qr_personal, Inches(9.7), Inches(4.0), Inches(2.4), Inches(2.4))
    tb(s, Inches(9.5), Inches(6.45), Inches(2.8), Inches(0.4),
       'anthony50102.github.io', 12, DIM, align=PP_ALIGN.CENTER)
else:
    rrect_text(s, Inches(9.5), Inches(4.0), Inches(2.8), Inches(2.5),
              '[ QR Code ]\nanthonypoole.dev', 14, DIM, fill=CARD_BG, line=DARKER_DIM, bold=False)


# ═══════════════════════════════════════
# SAVE
# ═══════════════════════════════════════
out = '/Users/anthonypoole/Repositories/MicroUSPresentation/presentation/presentation-v4-gradient-noir.pptx'
prs.save(out)
print(f'Saved: {out}')
print(f'Total slides: {len(prs.slides)}')
