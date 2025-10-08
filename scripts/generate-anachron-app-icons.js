/**
 * Generate ANACHRON-style app icons for tools page
 * Ancient symbology + Futuristic technology fusion
 * Using brand colors: Lapis Blue, Terracotta, Verdigris, Muted Gold
 */

import Replicate from 'replicate';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const replicate = new Replicate({
  auth: process.env.VITE_REPLICATE_API_TOKEN,
});

const OUTPUT_DIR = path.join(__dirname, '../public/images/resource-icons');

// ANACHRON brand color palette
const BRAND_COLORS = {
  lapis: '#2C6BAA',      // Technology, automation, data
  terracotta: '#C96F4C', // Communication, media, social
  verdigris: '#3C7A6A',  // Growth, environment, discovery
  gold: '#C9A53B'        // Premium, strategy, leadership
};

// Ancient + Futuristic icon mappings
const ANACHRON_APP_ICONS = [
  {
    name: 'ai-content-writer',
    title: 'AI Content Writer',
    category: 'Content Creation',
    concept: 'Ancient stylus meets holographic papyrus',
    materials: 'Bronze stylus with verdigris patina, marble scroll with glowing inscriptions',
    symbology: 'Egyptian hieroglyph for "scribe" transforming into circuit traces',
    primaryColor: BRAND_COLORS.lapis,
    accentColor: BRAND_COLORS.gold,
    prompt: `Professional app icon, 1024x1024px square, centered composition.

ANACHRON style: Ancient Greco-Roman aesthetic fused with diegetic future technology.

Subject: An ancient bronze stylus with verdigris patina (#3C7A6A) hovering above a marble scroll that glows with soft blue holographic inscriptions. Egyptian hieroglyph symbols for "scribe" carved into the marble base, transitioning into golden circuit traces (#C9A53B).

Materials: Weathered bronze with authentic verdigris oxidation, warm beige marble with natural veining and chips, gold leaf detailing on circuit patterns.

Lighting: Soft golden hour side light creating warm shadows, subtle cyan glow (#2C6BAA) emanating from holographic text, tech glow interacting with marble surface.

Color palette: Lapis blue #2C6BAA for holographic elements, bronze with verdigris #3C7A6A, warm marble beige, muted gold accents #C9A53B.

Finish: Academic oil painting aesthetic with subtle craquelure, painterly brushwork, neoclassical composition. Diegetic technology using ancient materials.

Centered with padding, 1:1 aspect ratio, professional app store quality.`
  },
  {
    name: 'ai-image-generator',
    title: 'AI Image Generator',
    category: 'AI Tools',
    concept: 'Ancient painter\'s palette with mosaic pixel array',
    materials: 'Terracotta palette, gold leaf paint swatches, mosaic tesserae as pixels',
    symbology: 'Greek muse symbol with flowing digital paint streams',
    primaryColor: BRAND_COLORS.terracotta,
    accentColor: BRAND_COLORS.gold,
    prompt: `Professional app icon, 1024x1024px square, centered composition.

ANACHRON style: Ancient artisan tools merged with holographic technology.

Subject: An ancient terracotta painter's palette (#C96F4C) with gold leaf paint swatches transforming into glowing mosaic tesserae that float and arrange themselves into abstract pixel art. Greek symbol for "creation" carved into the palette edge.

Materials: Fired terracotta with authentic clay texture and firing marks, gold leaf (#C9A53B) on paint swatches, small marble mosaic tiles with subtle glow.

Lighting: Warm Mediterranean light from top-left, soft cyan-gold glow (#2C6BAA + #C9A53B) from floating mosaic pixels, light reflecting off gold leaf.

Color palette: Terracotta red #C96F4C base, lapis blue #2C6BAA holographic glow, verdigris green #3C7A6A accent tiles, muted gold #C9A53B details.

Finish: Painterly fresco aesthetic with flaking pigment texture, weathered edges, academic composition. Tech elements feel crafted from ancient materials.

Centered with padding, 1:1 aspect ratio, professional app quality.`
  },
  {
    name: 'analytics-dashboard',
    title: 'Analytics Dashboard',
    category: 'Analytics & Insights',
    concept: 'Ancient astronomical instrument with holographic data streams',
    materials: 'Bronze astrolabe with verdigris, rock crystal data display',
    symbology: 'Constellation map transforming into bar charts and metrics',
    primaryColor: BRAND_COLORS.lapis,
    accentColor: BRAND_COLORS.verdigris,
    prompt: `Professional app icon, 1024x1024px square, centered composition.

ANACHRON style: Ancient navigation tools with modern data visualization.

Subject: An ornate bronze astrolabe with verdigris patina (#3C7A6A), its rotating rings displaying holographic bar charts and flowing data streams in lapis blue (#2C6BAA). Rock crystal lens in center showing constellation map that morphs into analytics graphs.

Materials: Weathered bronze with authentic oxidation, polished rock crystal viewport, gold leaf (#C9A53B) measurement markings, carved marble base.

Lighting: Dappled Mediterranean light, strong cyan holographic glow from data streams, golden rim light on bronze edges, crystal refracting light.

Color palette: Lapis blue #2C6BAA for data holograms, bronze verdigris #3C7A6A, muted gold #C9A53B markings, warm marble base.

Finish: Academic painting with craquelure, precise brushwork on metal details, soft glow integration with ancient surfaces.

Centered with padding, 1:1 aspect ratio, professional quality.`
  },
  {
    name: 'audience-intelligence',
    title: 'Audience Intelligence',
    category: 'Analytics & Insights',
    concept: 'Ancient oracle mask with neural network patterns',
    materials: 'Marble theater mask, bronze neural circuitry, gold leaf',
    symbology: 'Greek theater masks with glowing thought patterns',
    primaryColor: BRAND_COLORS.verdigris,
    accentColor: BRAND_COLORS.gold,
    prompt: `Professional app icon, 1024x1024px square, centered composition.

ANACHRON style: Ancient oracle wisdom meets AI intelligence.

Subject: A classical marble theater mask (Greek tragedy/comedy fusion) with bronze neural network patterns (#3C7A6A) inlaid across the forehead. Gold leaf (#C9A53B) circuit traces flow like thoughts, connecting to small floating profile silhouettes in lapis blue holographic glow (#2C6BAA).

Materials: Weathered Parian marble with natural chips and veining, bronze inlay with verdigris oxidation, delicate gold leaf tracery, holographic projection glow.

Lighting: Soft overcast diffuse light, cyan-teal glow from neural patterns, golden highlights on raised marble features.

Color palette: Verdigris green #3C7A6A neural circuits, lapis blue #2C6BAA audience holograms, muted gold #C9A53B thought traces, ivory marble.

Finish: Neoclassical sculpture aesthetic with tool marks, painterly rendering of marble texture, subtle tech glow integration.

Centered with padding, 1:1 aspect ratio, professional app quality.`
  },
  {
    name: 'brand-asset-library',
    title: 'Brand Asset Library',
    category: 'Content Creation',
    concept: 'Ancient library scroll cabinet with mosaic preview tiles',
    materials: 'Marble scroll compartments, mosaic tile thumbnails, bronze frames',
    symbology: 'Library of Alexandria architecture with glowing asset grid',
    primaryColor: BRAND_COLORS.terracotta,
    accentColor: BRAND_COLORS.gold,
    prompt: `Professional app icon, 1024x1024px square, centered composition.

ANACHRON style: Library of Alexandria meets modern asset management.

Subject: A classical marble scroll cabinet with organized compartments, each containing glowing mosaic tile "thumbnails" showing brand assets (colors, fonts, images). Bronze frame (#3C7A6A) with verdigris around the cabinet, gold leaf (#C9A53B) labels on compartments.

Materials: Warm beige marble with natural veining, small mosaic tesserae in brand colors (lapis, terracotta, verdigris, gold), weathered bronze frame, gold leaf accents.

Lighting: Warm side light through columns, soft multi-color glow from mosaic tiles, golden highlights on bronze frame.

Color palette: Terracotta #C96F4C marble tones, lapis blue #2C6BAA mosaic glow, verdigris #3C7A6A bronze frame, muted gold #C9A53B labels.

Finish: Academic oil painting with architectural precision, mosaic detail work, subtle craquelure, cohesive light on all surfaces.

Centered with padding, 1:1 aspect ratio, professional quality.`
  },
  {
    name: 'chatbot-builder',
    title: 'AI Chatbot Builder',
    category: 'AI Tools',
    concept: 'Ancient amphora with dialogue speech waves',
    materials: 'Terracotta amphora, gold leaf speech patterns, mosaic decoration',
    symbology: 'Oracle of Delphi vessel with flowing conversation streams',
    primaryColor: BRAND_COLORS.lapis,
    accentColor: BRAND_COLORS.gold,
    prompt: `Professional app icon, 1024x1024px square, centered composition.

ANACHRON style: Oracle communication vessel with AI conversation flow.

Subject: An elegant terracotta amphora (#C96F4C) with black-figure decoration showing figures in conversation. Golden speech wave patterns (#C9A53B) emanate from the vessel's mouth, transforming into holographic dialogue bubbles in lapis blue (#2C6BAA). Small mosaic meander pattern (Greek key) forming circuit-like conversation paths.

Materials: Fired terracotta with authentic ancient pottery finish, black figure glaze decoration, gold leaf speech patterns, holographic glow projection.

Lighting: Soft studio light from top-left, warm glow from vessel, cyan holographic bubble glow, golden rim highlights.

Color palette: Terracotta red #C96F4C vessel, lapis blue #2C6BAA holographic dialogue, muted gold #C9A53B speech waves, black figure decoration.

Finish: Painterly rendering of pottery texture, academic style, subtle craquelure, tech glow integrating naturally with ceramic surface.

Centered with padding, 1:1 aspect ratio, professional app quality.`
  },
  {
    name: 'content-calendar',
    title: 'Content Calendar',
    category: 'Automation & Workflow',
    concept: 'Ancient sundial with holographic event markers',
    materials: 'Marble sundial, bronze gnomon, gold leaf date markers',
    symbology: 'Roman calendar stone with glowing scheduled content',
    primaryColor: BRAND_COLORS.verdigris,
    accentColor: BRAND_COLORS.gold,
    prompt: `Professional app icon, 1024x1024px square, centered composition.

ANACHRON style: Ancient time-keeping meets modern scheduling.

Subject: A circular marble sundial with carved date markings and Roman numerals. Bronze gnomon with verdigris patina (#3C7A6A) casts both shadow and holographic light. Gold leaf (#C9A53B) dots mark scheduled content, with small lapis blue (#2C6BAA) holographic cards floating above key dates.

Materials: Warm marble with natural weathering and chips, bronze with authentic verdigris oxidation, gold leaf date markers, holographic calendar projections.

Lighting: Golden hour side light creating dramatic sundial shadow, cyan-teal glow from schedule holograms, golden highlights on raised numerals.

Color palette: Verdigris green #3C7A6A bronze element, lapis blue #2C6BAA holographic schedule cards, muted gold #C9A53B date markers, ivory marble base.

Finish: Academic oil painting of carved stone, precise shadow rendering, painterly metal textures, cohesive light interaction.

Centered with padding, 1:1 aspect ratio, professional quality.`
  },
  {
    name: 'conversion-tracker',
    title: 'Conversion Tracker',
    category: 'Analytics & Insights',
    concept: 'Ancient target with holographic impact analysis',
    materials: 'Bronze target rings, marble center, gold leaf scoring',
    symbology: 'Archery target with glowing conversion paths',
    primaryColor: BRAND_COLORS.terracotta,
    accentColor: BRAND_COLORS.gold,
    prompt: `Professional app icon, 1024x1024px square, centered composition.

ANACHRON style: Ancient archery precision meets conversion tracking.

Subject: A classical bronze target with concentric rings showing verdigris patina (#3C7A6A). Marble center with carved goal symbol, surrounded by gold leaf (#C9A53B) scoring markers. Holographic terracotta (#C96F4C) and lapis blue (#2C6BAA) paths showing conversion journeys converging on center.

Materials: Weathered bronze with authentic oxidation, polished marble bullseye with chips, gold leaf accents, holographic path projections.

Lighting: Dramatic side light, warm glow from center, cyan-terracotta holographic paths, golden highlights on scoring rings.

Color palette: Terracotta #C96F4C holographic paths, lapis blue #2C6BAA data streams, verdigris #3C7A6A bronze rings, muted gold #C9A53B scoring.

Finish: Academic painting style, metallic patina detail, marble texture, cohesive glow integration with ancient materials.

Centered with padding, 1:1 aspect ratio, professional app quality.`
  },
  {
    name: 'email-campaign-builder',
    title: 'Email Campaign Builder',
    category: 'Marketing & Growth',
    concept: 'Ancient wax tablet with glowing message seal',
    materials: 'Wood frame, beeswax writing surface, bronze stylus, gold seal',
    symbology: 'Epistolary scroll with holographic delivery tracking',
    primaryColor: BRAND_COLORS.lapis,
    accentColor: BRAND_COLORS.gold,
    prompt: `Professional app icon, 1024x1024px square, centered composition.

ANACHRON style: Ancient correspondence meets modern email campaigns.

Subject: An elegant wax tablet (diptych) with wooden frame and beeswax surface showing carved text. Bronze stylus with verdigris (#3C7A6A) resting beside it. Golden seal (#C9A53B) on tablet glowing with holographic lapis blue (#2C6BAA) message streams flowing outward like sent emails.

Materials: Aged olive wood frame with natural grain, authentic beeswax surface (warm honey tone), bronze stylus with oxidation, gold leaf seal, holographic projections.

Lighting: Warm Mediterranean light, soft cyan glow from holographic messages, golden seal highlight, natural wood grain shadows.

Color palette: Lapis blue #2C6BAA holographic email streams, warm wood and beeswax tones, verdigris #3C7A6A stylus, muted gold #C9A53B seal.

Finish: Painterly rendering of wood grain and wax texture, academic style, subtle material wear, tech glow naturally integrated.

Centered with padding, 1:1 aspect ratio, professional quality.`
  },
  {
    name: 'growth-audit-tool',
    title: 'Growth Audit Tool',
    category: 'Analytics & Insights',
    concept: 'Ancient surveyor tools with holographic metrics',
    materials: 'Bronze compass and ruler, marble measuring stone, gold markers',
    symbology: 'Surveying instruments with glowing growth trajectories',
    primaryColor: BRAND_COLORS.verdigris,
    accentColor: BRAND_COLORS.gold,
    prompt: `Professional app icon, 1024x1024px square, centered composition.

ANACHRON style: Ancient land surveying meets modern growth analysis.

Subject: Classical bronze compass and straight edge with verdigris patina (#3C7A6A), arranged on marble measuring stone. Gold leaf (#C9A53B) measurement marks transforming into holographic upward growth arrows and audit checkmarks in lapis blue (#2C6BAA). Small terracotta (#C96F4C) growth chart glowing beside tools.

Materials: Weathered bronze with authentic oxidation, carved marble base with measuring increments, gold leaf markers, holographic data projections.

Lighting: Golden hour side light, cyan-teal audit glow, golden measurement highlights, warm marble shadows.

Color palette: Verdigris green #3C7A6A bronze tools, lapis blue #2C6BAA holographic metrics, terracotta #C96F4C chart, muted gold #C9A53B markers.

Finish: Academic oil painting of precision instruments, metallic patina detail, marble carving, cohesive light on all elements.

Centered with padding, 1:1 aspect ratio, professional app quality.`
  },
  {
    name: 'integration-hub',
    title: 'Integration Hub',
    category: 'Automation & Workflow',
    concept: 'Ancient mosaic mandala with connection nodes',
    materials: 'Mosaic tesserae, marble base, bronze connectors, gold traces',
    symbology: 'Roman road network map with glowing integration paths',
    primaryColor: BRAND_COLORS.lapis,
    accentColor: BRAND_COLORS.gold,
    prompt: `Professional app icon, 1024x1024px square, centered composition.

ANACHRON style: Roman road network meets API integration hub.

Subject: A circular mosaic mandala pattern with central bronze hub and radiating paths made of small marble and terracotta tesserae. Bronze connection points with verdigris (#3C7A6A) at path intersections. Gold leaf (#C9A53B) traces connecting nodes, with lapis blue (#2C6BAA) holographic data flowing between connection points.

Materials: Small mosaic tiles in brand colors, marble base with carved border, bronze connectors with authentic patina, gold leaf circuit traces, holographic flow.

Lighting: Overhead soft light, multi-color glow from connection points, golden trace highlights, mosaic shadow depth.

Color palette: Lapis blue #2C6BAA holographic data, verdigris #3C7A6A bronze nodes, terracotta #C96F4C mosaic tiles, muted gold #C9A53B traces.

Finish: Detailed mosaic tesserae rendering, academic composition, subtle grout texture, tech glow integrated with ancient tilework.

Centered with padding, 1:1 aspect ratio, professional quality.`
  },
  {
    name: 'lead-scoring-engine',
    title: 'Lead Scoring Engine',
    category: 'Automation & Workflow',
    concept: 'Ancient weighing scale with holographic scoring metrics',
    materials: 'Bronze balance scale, marble weights, gold leaf numbers',
    symbology: 'Justice scales with glowing lead quality indicators',
    primaryColor: BRAND_COLORS.gold,
    accentColor: BRAND_COLORS.lapis,
    prompt: `Professional app icon, 1024x1024px square, centered composition.

ANACHRON style: Ancient scales of justice meets lead qualification.

Subject: An elegant bronze balance scale with verdigris patina (#3C7A6A), marble weights on each side marked with gold leaf (#C9A53B) scoring numbers. Holographic lapis blue (#2C6BAA) quality indicators and star ratings floating above the balanced pans. Small terracotta (#C96F4C) lead tokens being weighed.

Materials: Weathered bronze with authentic oxidation, carved marble weights with natural veining, gold leaf numerals, terracotta tokens, holographic metrics.

Lighting: Warm side light, cyan scoring glow from holograms, golden number highlights, balance beam casting shadow.

Color palette: Muted gold #C9A53B base color and scoring, lapis blue #2C6BAA holographic metrics, verdigris #3C7A6A bronze scale, terracotta #C96F4C tokens.

Finish: Academic painting of metal and marble, precise balance mechanism rendering, painterly textures, cohesive glow integration.

Centered with padding, 1:1 aspect ratio, professional app quality.`
  },
  {
    name: 'performance-monitor',
    title: 'Performance Monitor',
    category: 'Analytics & Insights',
    concept: 'Ancient water clock with holographic performance gauges',
    materials: 'Bronze clepsydra, marble reservoir, gold measurement marks',
    symbology: 'Water clock with flowing data streams and metrics',
    primaryColor: BRAND_COLORS.lapis,
    accentColor: BRAND_COLORS.verdigris,
    prompt: `Professional app icon, 1024x1024px square, centered composition.

ANACHRON style: Ancient time measurement meets performance tracking.

Subject: A classical bronze water clock (clepsydra) with verdigris patina (#3C7A6A), water transformed into glowing lapis blue (#2C6BAA) holographic data streams. Marble reservoir with gold leaf (#C9A53B) measurement marks showing performance levels. Floating holographic gauges and speedometer elements above vessel.

Materials: Weathered bronze with authentic oxidation, carved marble with veining, gold leaf markers, holographic water/data streams with cyan glow.

Lighting: Soft Mediterranean light, strong cyan glow from flowing data, golden measurement highlights, bronze rim light.

Color palette: Lapis blue #2C6BAA holographic data flow, verdigris green #3C7A6A bronze vessel, muted gold #C9A53B metrics, ivory marble.

Finish: Academic oil painting, metallic patina detail, flowing water rendering as holographic data, cohesive light interaction.

Centered with padding, 1:1 aspect ratio, professional quality.`
  },
  {
    name: 'podcast-studio',
    title: 'Podcast Studio',
    category: 'Content Creation',
    concept: 'Ancient amphitheater with holographic sound waves',
    materials: 'Marble theater acoustics, bronze speaking trumpet, gold sound patterns',
    symbology: 'Greek theater mask with emanating audio visualization',
    primaryColor: BRAND_COLORS.terracotta,
    accentColor: BRAND_COLORS.gold,
    prompt: `Professional app icon, 1024x1024px square, centered composition.

ANACHRON style: Ancient acoustic design meets modern podcasting.

Subject: A miniature marble amphitheater or theater mask with perfect acoustic geometry. Bronze speaking trumpet with verdigris (#3C7A6A) positioned at center. Gold leaf (#C9A53B) sound wave patterns carved into marble radiating outward. Holographic terracotta (#C96F4C) and lapis blue (#2C6BAA) audio waveforms flowing from the trumpet.

Materials: Carved marble with classical theater geometry, bronze trumpet with authentic patina, gold leaf acoustic patterns, holographic sound visualization.

Lighting: Warm stage lighting from below, multi-color audio glow, golden wave pattern highlights, marble shadow depth.

Color palette: Terracotta #C96F4C holographic audio, lapis blue #2C6BAA waveforms, verdigris #3C7A6A bronze trumpet, muted gold #C9A53B patterns.

Finish: Neoclassical architectural rendering, acoustic detail precision, painterly marble texture, tech glow as natural emanation.

Centered with padding, 1:1 aspect ratio, professional app quality.`
  },
  {
    name: 'report-generator',
    title: 'Report Generator',
    category: 'Content Creation',
    concept: 'Ancient papyrus scroll with holographic data visualization',
    materials: 'Aged papyrus, bronze scroll rods, gold ink, mosaic charts',
    symbology: 'Scholarly scroll with flowing metrics and insights',
    primaryColor: BRAND_COLORS.verdigris,
    accentColor: BRAND_COLORS.gold,
    prompt: `Professional app icon, 1024x1024px square, centered composition.

ANACHRON style: Ancient scholarly scrolls meet modern data reporting.

Subject: A partially unrolled papyrus scroll with bronze rods showing verdigris patina (#3C7A6A). Written in gold ink (#C9A53B), text transforms into holographic bar charts, pie charts, and data visualizations in lapis blue (#2C6BAA) and terracotta (#C96F4C). Small mosaic "pixel" chart embedded in scroll.

Materials: Authentic aged papyrus texture with natural fiber, weathered bronze scroll rods, gold ink/leaf, mosaic data elements, holographic projections.

Lighting: Warm scholar's light from side, multi-color chart glow, golden ink highlights, papyrus fiber shadows.

Color palette: Verdigris green #3C7A6A bronze rods, lapis blue #2C6BAA data visualizations, terracotta #C96F4C chart accents, muted gold #C9A53B ink.

Finish: Academic painting of ancient documents, papyrus fiber detail, precise data visualization rendering, cohesive glow integration.

Centered with padding, 1:1 aspect ratio, professional quality.`
  },
  {
    name: 'seo-optimizer',
    title: 'SEO Optimizer',
    category: 'Marketing & Growth',
    concept: 'Ancient magnifying lens with holographic search rankings',
    materials: 'Rock crystal lens, bronze frame, marble keyword stone, gold rankings',
    symbology: 'Observatory lens revealing search visibility patterns',
    primaryColor: BRAND_COLORS.verdigris,
    accentColor: BRAND_COLORS.gold,
    prompt: `Professional app icon, 1024x1024px square, centered composition.

ANACHRON style: Ancient optical instruments meet search optimization.

Subject: A large polished rock crystal magnifying lens in ornate bronze frame with verdigris (#3C7A6A). Lens reveals holographic search ranking graphs trending upward in verdigris and lapis blue (#2C6BAA). Marble base inscribed with "keyword" in ancient script, gold leaf (#C9A53B) ranking positions (1, 2, 3) floating around lens.

Materials: Clear rock crystal with natural inclusions, weathered bronze frame with authentic patina, carved marble base, gold leaf rankings, holographic search data.

Lighting: Soft diffuse light through crystal, cyan-green glow from holographic rankings, golden number highlights, bronze rim light.

Color palette: Verdigris green #3C7A6A primary color and bronze, lapis blue #2C6BAA holographic data, muted gold #C9A53B rankings, ivory marble.

Finish: Academic oil painting, crystal refraction rendering, metallic detail, marble carving, tech glow naturally emanating through lens.

Centered with padding, 1:1 aspect ratio, professional quality.`
  },
  {
    name: 'social-media-manager',
    title: 'Social Media Manager',
    category: 'Marketing & Growth',
    concept: 'Ancient agora marketplace with holographic network nodes',
    materials: 'Marble columns, bronze connection points, terracotta network tiles',
    symbology: 'Forum gathering with glowing conversation threads',
    primaryColor: BRAND_COLORS.terracotta,
    accentColor: BRAND_COLORS.gold,
    prompt: `Professional app icon, 1024x1024px square, centered composition.

ANACHRON style: Roman forum meets modern social networking.

Subject: Miniature marble columns arranged in circular agora pattern, connected by bronze chains with verdigris (#3C7A6A). Center has terracotta (#C96F4C) mosaic showing connected figures. Gold leaf (#C9A53B) connection lines radiating between columns, holographic lapis blue (#2C6BAA) conversation bubbles floating above network nodes.

Materials: Carved marble columns with classical capitals, bronze chains with authentic patina, terracotta mosaic center, gold leaf connections, holographic social streams.

Lighting: Mediterranean marketplace light, multi-color node glow, golden connection highlights, column shadow patterns.

Color palette: Terracotta #C96F4C primary and mosaic, lapis blue #2C6BAA holographic social streams, verdigris #3C7A6A bronze connections, muted gold #C9A53B network lines.

Finish: Architectural precision rendering, mosaic detail work, painterly column texture, tech glow as marketplace energy.

Centered with padding, 1:1 aspect ratio, professional app quality.`
  },
  {
    name: 'video-generator',
    title: 'AI Video Generator',
    category: 'AI Tools',
    concept: 'Ancient shadow theater with holographic projection',
    materials: 'Marble screen, bronze puppeteer frame, gold light source',
    symbology: 'Shadow play with glowing cinematic frames',
    primaryColor: BRAND_COLORS.lapis,
    accentColor: BRAND_COLORS.gold,
    prompt: `Professional app icon, 1024x1024px square, centered composition.

ANACHRON style: Ancient shadow theater meets AI video generation.

Subject: A miniature marble theater screen with bronze frame showing verdigris (#3C7A6A). Behind screen, golden light source (#C9A53B) projects both classical shadow puppets and holographic lapis blue (#2C6BAA) cinematic frames. Film strip border carved in marble with terracotta (#C96F4C) play button centerpiece.

Materials: Translucent marble screen with natural veining, weathered bronze frame, gold leaf light rays, terracotta play symbol, holographic video frames.

Lighting: Dramatic backlight from golden source, cyan holographic projection glow, bronze rim highlights, shadow depth on marble.

Color palette: Lapis blue #2C6BAA holographic video, verdigris #3C7A6A bronze frame, muted gold #C9A53B light source, terracotta #C96F4C play button.

Finish: Academic painting with theatrical lighting, translucent marble rendering, shadow play precision, cohesive projection glow.

Centered with padding, 1:1 aspect ratio, professional quality.`
  },
  {
    name: 'workflow-automation',
    title: 'Workflow Automation',
    category: 'Automation & Workflow',
    concept: 'Ancient aqueduct with holographic flow automation',
    materials: 'Marble arches, bronze flow gates, gold timing mechanisms',
    symbology: 'Roman engineering with glowing process pathways',
    primaryColor: BRAND_COLORS.lapis,
    accentColor: BRAND_COLORS.gold,
    prompt: `Professional app icon, 1024x1024px square, centered composition.

ANACHRON style: Roman aqueduct engineering meets workflow automation.

Subject: Miniature marble aqueduct arches in classical Roman style, with bronze flow gates showing verdigris (#3C7A6A). Holographic lapis blue (#2C6BAA) water/data flowing through channels in automated sequence. Gold leaf (#C9A53B) timing gears and mechanisms visible in archway keystones. Small terracotta (#C96F4C) automation nodes at flow decision points.

Materials: Carved marble arches with authentic stone texture, bronze gates with oxidation, gold leaf mechanical details, holographic flow visualization.

Lighting: Soft architectural light from top, cyan flow glow through channels, golden mechanism highlights, arch shadow depth.

Color palette: Lapis blue #2C6BAA holographic data flow, verdigris #3C7A6A bronze gates, muted gold #C9A53B gears, terracotta #C96F4C nodes, ivory marble.

Finish: Architectural rendering precision, engineering detail, painterly stone texture, tech flow as natural water element.

Centered with padding, 1:1 aspect ratio, professional app quality.`
  }
];

async function generateIcon(iconConfig) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Generating: ${iconConfig.title}`);
  console.log(`Concept: ${iconConfig.concept}`);
  console.log(`Materials: ${iconConfig.materials}`);
  console.log(`Primary: ${iconConfig.primaryColor} | Accent: ${iconConfig.accentColor}`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    const output = await replicate.run(
      "black-forest-labs/flux-1.1-pro",
      {
        input: {
          prompt: iconConfig.prompt,
          aspect_ratio: "1:1",
          output_format: "png",
          output_quality: 100,
          safety_tolerance: 2,
          prompt_upsampling: true
        }
      }
    );

    // Download the image
    const imageUrl = output;
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save image
    const imagePath = path.join(OUTPUT_DIR, `${iconConfig.name}.png`);
    await fs.writeFile(imagePath, buffer);
    console.log(`✅ Saved: ${imagePath}`);

    // Save metadata
    const metadata = {
      title: iconConfig.title,
      name: iconConfig.name,
      category: iconConfig.category,
      style: 'ANACHRON',
      concept: iconConfig.concept,
      materials: iconConfig.materials,
      symbology: iconConfig.symbology,
      primaryColor: iconConfig.primaryColor,
      accentColor: iconConfig.accentColor,
      prompt: iconConfig.prompt,
      model: 'black-forest-labs/flux-1.1-pro',
      timestamp: new Date().toISOString(),
      filepath: `/images/resource-icons/${iconConfig.name}.png`
    };

    const metadataPath = path.join(OUTPUT_DIR, `${iconConfig.name}-metadata.json`);
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`✅ Metadata: ${metadataPath}`);

    return { success: true, icon: iconConfig.name };
  } catch (error) {
    console.error(`❌ Failed to generate ${iconConfig.name}:`, error.message);
    return { success: false, icon: iconConfig.name, error: error.message };
  }
}

async function generateAllIcons() {
  console.log('\n🏛️  ANACHRON APP ICON GENERATOR 🏛️');
  console.log('Ancient Symbology + Futuristic Technology Fusion\n');
  console.log(`Total icons to generate: ${ANACHRON_APP_ICONS.length}\n`);

  const results = [];

  for (const iconConfig of ANACHRON_APP_ICONS) {
    const result = await generateIcon(iconConfig);
    results.push(result);

    // Add delay between generations to avoid rate limits
    if (iconConfig !== ANACHRON_APP_ICONS[ANACHRON_APP_ICONS.length - 1]) {
      console.log('\n⏳ Waiting 3 seconds before next generation...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('GENERATION COMPLETE');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`\n✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed icons:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.icon}: ${r.error}`);
    });
  }

  // Save generation report
  const reportPath = path.join(OUTPUT_DIR, 'anachron-generation-report.json');
  await fs.writeFile(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    total: ANACHRON_APP_ICONS.length,
    successful,
    failed,
    results,
    brandColors: BRAND_COLORS,
    style: 'ANACHRON - Ancient Symbology + Futuristic Technology'
  }, null, 2));

  console.log(`\n📊 Report saved: ${reportPath}\n`);
}

// Run generation
generateAllIcons().catch(console.error);
