/* ==========================================================================
   AgriVision – Smart Farming & Crop Guide
   Shared JavaScript (static website, no frameworks)
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ======================================================================
     CROP DATABASE (static data — add more crops by appending objects here)
     ====================================================================== */
  var CROPS = [
    {
      id: 'rice', name: 'Rice', sci: 'Oryza sativa', category: 'Cereals',
      season: 'Kharif (also irrigated summer in some regions)', soil: 'Clayey and loamy soils that retain water',
      water: 'High', duration: '110–150 days', temp: '20–35 °C', seed: '40–60 kg per hectare (transplanted)',
      desc: 'The staple food crop for more than half of India, grown in flooded or well-irrigated fields.',
      c1: '#e8b23a', c2: '#2ea35a',
      climate: 'Warm and humid climate with abundant sunshine and water availability.',
      sowingSeason: 'Kharif: June–July with the monsoon; irrigated/Rabi rice: November–February depending on region.',
      harvestSeason: 'Kharif: October–November; irrigated crops: March–May (varies by region).',
      landPrep: 'Plough 2–3 times, puddle the field with standing water, level the land and repair bunds to hold water.',
      sowing: 'Nursery raising followed by transplanting 20–30 day old seedlings; direct seeding (drum or broadcast) is also used.',
      irrigation: 'Maintain 2–5 cm standing water during active growth; drain before harvest. Alternate wetting and drying saves water.',
      fertilizer: 'Balanced NPK based on soil test; apply nitrogen in splits, with phosphorus and potash at basal. Zinc is commonly needed.',
      weed: 'Puddling and standing water suppress weeds; use recommended pre-emergence herbicide or 2–3 hand weedings.',
      pest: 'Stem borer, leaf folder, brown planthopper and gall midge. Monitor regularly and follow IPM.',
      disease: 'Blast, bacterial leaf blight and sheath blight. Use resistant varieties, clean seed and balanced nitrogen.',
      harvest: 'Harvest when 80–85% of grains turn golden and grain moisture is about 20–22%.',
      storage: 'Dry to 12–14% moisture; store in clean, dry, aerated bags or bins protected from rodents and moisture.',
      uses: 'Food grain, rice products (flour, flakes, bran oil), animal feed from bran, husk for fuel and industrial uses.'
    },
    {
      id: 'wheat', name: 'Wheat', sci: 'Triticum aestivum', category: 'Cereals',
      season: 'Rabi', soil: 'Well-drained loamy to clay-loam soils',
      water: 'Moderate (4–6 irrigations)', duration: '110–130 days', temp: '15–25 °C growing season', seed: '100–125 kg per hectare',
      desc: 'The premier winter cereal of India, the base for flour, bread, biscuits and many food products.',
      c1: '#d9a441', c2: '#c98b2e',
      climate: 'Cool growing season with bright sunshine; needs cool weather at tillering and mild warmth at grain filling.',
      sowingSeason: 'Late October to December (timely sowing in November gives best yields).',
      harvestSeason: 'March–April (varies by region).',
      landPrep: 'One deep ploughing followed by 2–3 harrowings; fine, level seedbed with good moisture.',
      sowing: 'Line sowing with seed drill at 20–22.5 cm row spacing, 4–5 cm deep.',
      irrigation: 'Critical stages: crown root initiation (20–25 days), tillering, flowering and grain filling.',
      fertilizer: 'Soil-test based NPK; half nitrogen and full P & K at sowing, remaining nitrogen at first irrigation.',
      weed: 'Hand weeding or recommended herbicide (e.g., for Phalaris minor) at 30–35 days as per label guidance.',
      pest: 'Aphids, termites in light soils, and armyworm occasionally.',
      disease: 'Rusts (yellow, brown, black), loose smut, karnal bunt. Grow resistant varieties and use certified seed treatment.',
      harvest: 'Harvest when grains are hard and straw turns golden; avoid delays to prevent shattering.',
      storage: 'Dry to 12% moisture; store in clean, dry, pest-proof bins or bags.',
      uses: 'Flour for chapati, bread, biscuits, pasta and other food products; straw as fodder.'
    },
    {
      id: 'maize', name: 'Maize', sci: 'Zea mays', category: 'Cereals',
      season: 'Kharif, Rabi and spring (region based)', soil: 'Fertile, well-drained loamy soils',
      water: 'Moderate (sensitive to waterlogging)', duration: '90–120 days', temp: '21–30 °C', seed: '20–25 kg per hectare (hybrids)',
      desc: 'A versatile cereal used for food, animal feed, starch and many industrial products.',
      c1: '#f2c93c', c2: '#e0952c',
      climate: 'Warm season crop; needs bright sunshine and does not tolerate frost or waterlogging.',
      sowingSeason: 'Kharif: June–July; Rabi: October–November; spring: January–February (region based).',
      harvestSeason: 'Kharif: September–October; Rabi: February–March.',
      landPrep: 'Deep summer ploughing, 2–3 harrowings; ensure good drainage and a fine tilth.',
      sowing: 'Ridge or flat bed sowing at 60 × 20 cm spacing; single seed per hill at 4–5 cm depth.',
      irrigation: 'Ensure moisture at knee-high stage, tasseling, silking and grain filling; drain excess water quickly.',
      fertilizer: 'Heavy feeder — soil-test based NPK, nitrogen in 2–3 splits; zinc and sulphur where deficient.',
      weed: 'First 40 days critical: two hoeings or recommended pre-emergence herbicide as per label.',
      pest: 'Fall armyworm, stem borer, shoot fly. Scout fields regularly and use IPM including pheromone traps.',
      disease: 'Turcicum leaf blight, downy mildew. Resistant hybrids and seed treatment are effective.',
      harvest: 'Harvest cobs when husk turns brown and kernels are hard; dry cobs thoroughly before shelling.',
      storage: 'Shell and dry grain to 12% moisture; store in airtight or treated structures.',
      uses: 'Human food, poultry and cattle feed, starch, corn oil, ethanol and other industrial products.'
    },
    {
      id: 'cotton', name: 'Cotton', sci: 'Gossypium spp.', category: 'Commercial Crops',
      season: 'Kharif', soil: 'Black cotton soils and other deep, well-drained soils',
      water: 'Moderate (region dependent)', duration: '150–180 days', temp: '21–32 °C', seed: 'As per hybrid (Bt cotton packet rates)',
      desc: 'India’s principal fibre crop — “white gold” — the backbone of the textile industry.',
      c1: '#f4f1e8', c2: '#a9c4b1',
      climate: 'Warm climate with plenty of sunshine; dry weather needed during boll opening and picking.',
      sowingSeason: 'April–May (irrigated), June–July with monsoon (rainfed).',
      harvestSeason: 'October onwards in 2–3 pickings.',
      landPrep: 'Deep ploughing once in 3 years, harrowing; ridges and furrows help drainage in black soils.',
      sowing: 'Dibbling or drill sowing at recommended spacing (commonly 90–120 × 45–60 cm for Bt hybrids).',
      irrigation: 'Critical stages: flowering and boll development. Avoid moisture stress and waterlogging.',
      fertilizer: 'Soil-test based NPK; nitrogen in splits; foliar micronutrients (Mg, B, Zn) where deficient.',
      weed: 'Keep weed-free for first 60–90 days by hoeing or recommended herbicides as per label.',
      pest: 'Pink bollworm, American bollworm, whitefly, jassids, aphids. Follow IPM: pheromone traps, refuge crop, ETL-based sprays.',
      disease: 'Cotton leaf curl virus (vector: whitefly), bacterial blight, root rot. Manage vectors and use tolerant varieties.',
      harvest: 'Pick fully opened fluffy bolls in morning hours; avoid trash and stained cotton.',
      storage: 'Dry kapas well and store in clean, dry, ventilated godowns away from fire risk.',
      uses: 'Textile fibre, cottonseed oil, oil cake as cattle feed, linters for industrial use.'
    },
    {
      id: 'sugarcane', name: 'Sugarcane', sci: 'Saccharum officinarum', category: 'Commercial Crops',
      season: 'Planted in multiple seasons (spring/autumn) by region', soil: 'Fertile, deep, well-drained loamy soils',
      water: 'High', duration: '10–18 months', temp: '20–35 °C', seed: '40,000–75,000 three-budded setts per hectare',
      desc: 'A long-duration commercial crop for sugar, jaggery, ethanol and energy.',
      c1: '#7fb45a', c2: '#3f7d32',
      climate: 'Warm, humid growing period followed by a cool, dry ripening period for good sugar accumulation.',
      sowingSeason: 'Spring: February–March; autumn: September–October; also adsali planting in parts of the south.',
      harvestSeason: 'Generally 10–12 months after planting (varies by region and season).',
      landPrep: 'Deep ploughing, harrowing and levelling; open furrows or trenches at 75–120 cm spacing.',
      sowing: 'Plant healthy three-budded setts end-to-end in furrows and cover lightly with soil.',
      irrigation: 'Frequent irrigation in formative phase (tillering to grand growth); reduce before harvest.',
      fertilizer: 'Heavy feeder — soil-test based NPK in splits; trash mulching and pressmud improve soil organic matter.',
      weed: '2–3 hoeings in the first 3 months; trash mulching suppresses weeds and conserves moisture.',
      pest: 'Early shoot borer, internode borer, top borer and white grub. Use trash mulching, light traps and IPM measures.',
      disease: 'Red rot, smut, wilt. Plant disease-free setts of resistant varieties; sett treatment recommended.',
      harvest: 'Harvest at maturity (high brix) close to the ground; deliver to mill within 24 hours.',
      storage: 'Cane deteriorates after cutting — crush promptly. Ratoon the field for the next crop where suitable.',
      uses: 'Sugar, jaggery (gur), khandsari, ethanol, molasses, bagasse for power and paper.'
    },
    {
      id: 'groundnut', name: 'Groundnut', sci: 'Arachis hypogaea', category: 'Oilseeds',
      season: 'Kharif and summer (irrigated)', soil: 'Light, well-drained sandy-loam soils rich in calcium',
      water: 'Low to moderate', duration: '100–130 days', temp: '25–30 °C', seed: '100–120 kg per hectare (kernels)',
      desc: 'An important oilseed and food legume that also enriches soil by fixing nitrogen.',
      c1: '#c98d4e', c2: '#8a5a2b',
      climate: 'Warm semi-arid climate; needs dry weather for flowering-to-maturity and harvesting.',
      sowingSeason: 'Kharif: June–July; summer: January–February under irrigation.',
      harvestSeason: 'Kharif: October–November; summer: April–May.',
      landPrep: 'Fine seedbed with 2–3 ploughings; light soils allow easy peg penetration and pod development.',
      sowing: 'Seed drill or dibbling at 30 × 10–15 cm; treat seed with Rhizobium culture where recommended.',
      irrigation: 'Critical stages: flowering, pegging and pod development. Avoid waterlogging.',
      fertilizer: 'Modest nitrogen, good phosphorus and gypsum (calcium) at flowering; potash per soil test.',
      weed: 'Earthing-up at weeding helps pegging; keep crop weed-free for first 45 days.',
      pest: 'Leaf miner, aphids, jassids, white grub, termites in sandy soils. Follow IPM and seed treatment.',
      disease: 'Tikka leaf spot, rust, collar rot, stem rot. Resistant varieties and rotation help.',
      harvest: 'Harvest when leaves yellow and pods show mature kernel colour and shell veining.',
      storage: 'Dry pods to 8–9% moisture; store as pods (unshelled) for better keeping quality.',
      uses: 'Edible oil, roasted snacks, peanut butter, confectionery; oil cake as cattle feed.'
    },
    {
      id: 'soybean', name: 'Soybean', sci: 'Glycine max', category: 'Oilseeds',
      season: 'Kharif', soil: 'Well-drained medium black to loamy soils',
      water: 'Moderate (drainage is critical)', duration: '95–125 days', temp: '22–32 °C', seed: '70–80 kg per hectare',
      desc: 'A high-protein oilseed and pulse used for oil, soya foods and animal feed.',
      c1: '#e3c85c', c2: '#6f9d3a',
      climate: 'Warm growing season with well-distributed rainfall; highly sensitive to waterlogging.',
      sowingSeason: 'Mid-June to early July with the onset of monsoon.',
      harvestSeason: 'September–October when leaves drop and pods rattle.',
      landPrep: 'Broad-bed-and-furrow or ridge sowing on well-levelled land with good drainage.',
      sowing: 'Line sowing at 45 × 5–10 cm, 3–5 cm deep; inoculate seed with Bradyrhizobium culture.',
      irrigation: 'Protect from water stress at flowering and pod filling; drain excess monsoon water.',
      fertilizer: 'Starter nitrogen only; phosphorus and potash per soil test; sulphur and zinc where deficient.',
      weed: 'First 30–45 days critical — one-two hoeings or recommended herbicide as per label.',
      pest: 'Girdle beetle, stem fly, defoliators (semi-looper, Spodoptera), whitefly. Scout and use IPM.',
      disease: 'Yellow mosaic virus (vector: whitefly), rust, root rot. Manage vectors; use tolerant varieties.',
      harvest: 'Harvest at full maturity with combine or manually; thresh promptly to avoid seed damage.',
      storage: 'Dry seed to 10–12% moisture; store in cool, dry, pest-proof conditions.',
      uses: 'Edible oil, soya flour, soya milk and paneer, protein products; de-oiled cake for feed and food industry.'
    },
    {
      id: 'tomato', name: 'Tomato', sci: 'Solanum lycopersicum', category: 'Vegetables',
      season: 'Grown year-round in many regions (Kharif, Rabi, summer under irrigation)',
      soil: 'Well-drained fertile loam, pH 6.0–7.0', water: 'Moderate, regular and uniform',
      duration: '100–140 days (from nursery to final picking)', temp: '18–27 °C', seed: '250–400 g per hectare (nursery raised)',
      desc: 'The most widely grown vegetable crop, used fresh and in sauces, purees and juices.',
      c1: '#e05141', c2: '#b03a2e',
      climate: 'Mild warm climate; sensitive to frost, very high temperature and waterlogging.',
      sowingSeason: 'Nursery sowing varies by region and season; transplant 25–30 day old seedlings.',
      harvestSeason: 'First picking about 55–70 days after transplanting; continues for several weeks.',
      landPrep: 'Deep ploughing, raised beds with well-decomposed compost; good drainage is essential.',
      sowing: 'Grow seedlings in a healthy nursery/protrays, then transplant on beds at 60 × 45–50 cm.',
      irrigation: 'Uniform moisture is essential; drip irrigation with mulching gives best results and reduces fruit cracking.',
      fertilizer: 'Soil-test based NPK in splits with ample organic manure; calcium reduces blossom-end rot.',
      weed: 'Mulching (plastic or straw) plus 1–2 hoeings keeps beds weed-free.',
      pest: 'Fruit borer, whitefly, aphids, leaf miner and mites. Use pheromone traps, nets in nursery and IPM.',
      disease: 'Early and late blight, leaf curl and mosaic viruses, bacterial wilt, damping-off in nursery. Use tolerant varieties and clean nursery practices.',
      harvest: 'Pick at breaker to red-ripe stage depending on market distance; harvest in cool hours.',
      storage: 'Store in shade, single layer ventilated crates; avoid refrigeration injury below 10 °C.',
      uses: 'Fresh salads and cooking, ketchup, sauce, puree, juice and processing industry.'
    },
    {
      id: 'chilli', name: 'Chilli', sci: 'Capsicum annuum', category: 'Vegetables',
      season: 'Kharif and Rabi (transplanted)', soil: 'Well-drained fertile loamy soils',
      water: 'Moderate, sensitive to waterlogging', duration: '150–180 days', temp: '20–30 °C', seed: '1–1.5 kg per hectare (nursery raised)',
      desc: 'A high-value spice and vegetable crop grown for green chillies and dry red spice.',
      c1: '#67b843', c2: '#c0392b',
      climate: 'Warm humid growing phase and dry phase for ripening and drying of red fruits.',
      sowingSeason: 'Nursery in May–June (Kharif) or October (Rabi); transplant 30–40 day seedlings.',
      harvestSeason: 'Green picking from about 60 days after transplanting; red ripe for dry chilli later.',
      landPrep: 'Fine tilth with FYM; transplant on ridges/beds with good drainage.',
      sowing: 'Nursery sowing followed by transplanting at 45–60 × 30–45 cm spacing.',
      irrigation: 'Light frequent irrigation; do not allow moisture stress at flowering and fruit set.',
      fertilizer: 'FYM plus soil-test based NPK in splits; potash improves colour and quality.',
      weed: '2–3 hoeings; mulching controls weeds and conserves moisture.',
      pest: 'Thrips, mites, aphids and fruit borer. Monitoring and IPM are essential for quality.',
      disease: 'Leaf curl (vector-transmitted), anthracnose (fruit rot), die-back and wilt. Manage vectors; use tolerant varieties.',
      harvest: 'Pick green chillies at full size; for dry chilli pick fully ripe red fruits and dry on clean surfaces.',
      storage: 'Dry pods to below 10% moisture; store in moisture-proof, pest-proof bags in cool dry place.',
      uses: 'Green vegetable, dry spice powder, oleoresin, pickles and food processing.'
    },
    {
      id: 'potato', name: 'Potato', sci: 'Solanum tuberosum', category: 'Vegetables',
      season: 'Rabi (main), Kharif in hills', soil: 'Loose, well-drained sandy-loam rich in organic matter',
      water: 'Moderate, frequent light irrigation', duration: '90–110 days', temp: '15–22 °C (cool tuberisation)', seed: '25–35 quintals of seed tubers per hectare',
      desc: 'The world’s most important non-cereal food crop, grown for table use and processing.',
      c1: '#d9b380', c2: '#a4713f',
      climate: 'Cool climate with bright days; tuber formation needs cool nights below about 20 °C.',
      sowingSeason: 'Plains: October–November; hills (summer crop): March–April.',
      harvestSeason: 'Plains: January–March; hills: June–July.',
      landPrep: 'Deep tilth, ridges 50–60 cm apart; well-rotted FYM improves tuber size and soil structure.',
      sowing: 'Plant healthy, sprouted, whole or cut seed tubers (with treatment) 5–8 cm deep on ridges at 20 cm spacing.',
      irrigation: 'First irrigation light after emergence; maintain uniform moisture at tuber initiation and bulking.',
      fertilizer: 'Ample FYM plus soil-test based NPK; potash is critical for tuber yield and quality.',
      weed: 'Earthing-up at 25–30 days controls weeds and covers tubers to prevent greening.',
      pest: 'Cutworms, aphids (virus vectors), potato tuber moth in stores. Use clean seed and IPM.',
      disease: 'Late blight, early blight, black scurf, viral diseases (leaf roll, mosaic). Certified seed and rotation are key.',
      harvest: 'Dehaulm (cut tops) 10–15 days before harvest to harden skins; dig carefully to avoid cuts.',
      storage: 'Cure tubers, then store in cool (2–4 °C for seed/table per purpose), dark, ventilated stores.',
      uses: 'Table vegetable, chips, French fries, flakes, starch and seed production.'
    },
    {
      id: 'onion', name: 'Onion', sci: 'Allium cepa', category: 'Vegetables',
      season: 'Kharif, late Kharif and Rabi', soil: 'Well-drained fertile loam, pH 6.0–7.5',
      water: 'Moderate, light frequent irrigation', duration: '120–150 days (incl. nursery)', temp: '13–25 °C growing, warm for curing', seed: '8–10 kg per hectare (nursery raised)',
      desc: 'An essential kitchen bulb crop, valued for flavour and good storage life.',
      c1: '#c97fae', c2: '#8e4a74',
      climate: 'Mild cool season for growth, then warm dry conditions for bulb development and curing.',
      sowingSeason: 'Kharif nursery: May–June; Rabi nursery: October–November; transplant 6–8 week seedlings.',
      harvestSeason: 'Kharif: September–October; Rabi: April–May (main storage crop).',
      landPrep: 'Fine levelled beds with FYM; avoid fresh heavy manure that causes forked, soft bulbs.',
      sowing: 'Raise nursery and transplant at 15 × 10 cm; do not bury seedlings too deep.',
      irrigation: 'Light frequent irrigation; stop irrigation 10–15 days before harvest for curing.',
      fertilizer: 'Soil-test based NPK; sulphur improves pungency and bulb quality.',
      weed: 'Onion is a weak competitor — keep weed-free with 2–3 hoeings or mulch.',
      pest: 'Thrips are the main pest; also onion maggot. Monitor and use IPM including coloured sticky traps.',
      disease: 'Purple blotch, stemphylium blight, basal rot, storage rots. Field sanitation and proper curing help.',
      harvest: 'Harvest when tops fall over (about 50–75%) and necks soften; cure bulbs in shade for a week.',
      storage: 'Store well-cured bulbs in ventilated bamboo or racked onion storage structures; avoid damp heaps.',
      uses: 'Daily cooking, salads, pickles, dehydration (flakes and powder) and export.'
    },
    {
      id: 'turmeric', name: 'Turmeric', sci: 'Curcuma longa', category: 'Commercial Crops',
      season: 'Kharif (planted with pre-monsoon/monsoon)', soil: 'Well-drained loamy soil rich in organic matter',
      water: 'Moderate to high, with perfect drainage', duration: '8–9 months', temp: '20–30 °C with good humidity', seed: '2,000–2,500 kg rhizomes per hectare',
      desc: 'The golden spice of India — a high-value rhizome crop for spice and industry.',
      c1: '#f0a92c', c2: '#c97b1e',
      climate: 'Warm humid tropical climate; grows under rainfed or irrigated conditions with shade tolerance.',
      sowingSeason: 'April–July depending on region and rainfall.',
      harvestSeason: 'December–March when leaves yellow and dry (8–9 months after planting).',
      landPrep: 'Deep ploughing, raised beds or ridges with heavy FYM/compost application; ensure drainage.',
      sowing: 'Plant healthy whole or mother rhizomes with buds at 30 × 20–25 cm, 5 cm deep, and mulch immediately.',
      irrigation: 'Regular irrigation at 7–10 day intervals in dry spells; mulch heavily to conserve moisture.',
      fertilizer: 'Heavy organic feeding; soil-test based NPK; zinc where deficient; split nitrogen and potash at earthing-up.',
      weed: 'Mulching (paddy straw/green leaves) after planting plus 2–3 weedings and earthing-up.',
      pest: 'Rhizome fly, shoot borer and scale insects. Mulching and IPM keep populations low.',
      disease: 'Rhizome rot and leaf spot — use disease-free seed rhizomes, field drainage and rotation.',
      harvest: 'Dig carefully when foliage dries; separate mother and finger rhizomes, then boil/cure and polish for dry turmeric.',
      storage: 'Store cured dry rhizomes in cool, dry, ventilated go-downs on platforms.',
      uses: 'Spice powder, culinary use, colouring, traditional medicine and value-added products.'
    },
    {
      id: 'pulses', name: 'Pulses', sci: 'Various (Cajanus, Vigna, Cicer etc.)', category: 'Pulses',
      season: 'Kharif (pigeonpea, green gram, black gram), Rabi (chickpea, lentil)',
      soil: 'Well-drained loamy soils; chickpea does well in light-to-medium soils',
      water: 'Low to moderate; many are rainfed', duration: '65–180 days by type',
      temp: '20–30 °C (Kharif), cool season for Rabi types', seed: 'Varies: 5–20 kg/ha (small types), 60–100 kg/ha (chickpea, pigeonpea)',
      desc: 'Protein-rich legumes — pigeonpea, chickpea, green gram, black gram and lentil — that fix nitrogen and improve soil fertility.',
      c1: '#7fa83c', c2: '#4f7a28',
      climate: 'Diverse: warm monsoon climate for Kharif pulses; cool dry season for Rabi pulses. Most tolerate drought reasonably well.',
      sowingSeason: 'Kharif: June–July (pigeonpea, moong, urad); Rabi: October–November (chickpea, lentil).',
      harvestSeason: 'Kharif: September–December (by type); Rabi: February–April.',
      landPrep: 'Normal tilth with good drainage; pulses dislike waterlogging more than drought.',
      sowing: 'Line sowing at type-specific spacing (pigeonpea wide at 60–90 cm; chickpea 30 × 10 cm); inoculate with Rhizobium culture.',
      irrigation: 'Usually 1–2 protective irrigations at branching/flowering and pod filling where possible.',
      fertilizer: 'Small starter nitrogen, good phosphorus; avoid excess nitrogen which reduces nodulation.',
      weed: 'First 30–40 days critical — 1–2 hoeings or recommended herbicide as per label.',
      pest: 'Pod borer complex (pigeonpea/chickpea), yellow mosaic vector whitefly, aphids. Use pheromone traps, resistant varieties, ETL-based IPM.',
      disease: 'Wilt (chickpea, pigeonpea), yellow mosaic virus, root rot. Rotation, resistant varieties and seed treatment help.',
      harvest: 'Harvest at maturity when pods dry; moong/urad need 2–3 pickings.',
      storage: 'Dry thoroughly, treat and store in airtight or treated bags/bins to prevent storage bruchids.',
      uses: 'Dal (split pulse) for daily protein, whole sprouted grains, besan (gram flour) and fodder.'
    },
    {
      id: 'millets', name: 'Millets', sci: 'Sorghum, Pennisetum, Eleusine, Setaria etc.', category: 'Cereals',
      season: 'Kharif (main), summer as irrigated fodder using less water',
      soil: 'Light, well-drained soils; thrive even on marginal, low-fertility land',
      water: 'Very low (climate-resilient, drought tolerant)', duration: '65–120 days by type',
      temp: '25–35 °C; hardy in hot, dry conditions', seed: '8–12 kg per hectare (most types)',
      desc: 'Climate-smart nutri-cereals — sorghum (jowar), pearl millet (bajra), finger millet (ragi), foxtail, little and other small millets.',
      c1: '#d6b25e', c2: '#8f7a33',
      climate: 'Hot, semi-arid conditions; excellent drought and heat tolerance makes them ideal for dryland farming.',
      sowingSeason: 'Kharif: June–July; summer irrigated: February–March (folder/dual purpose).',
      harvestSeason: 'Kharif: September–October; rabi sorghum: January–February.',
      landPrep: 'Moderate tilth; moisture conservation practices (tied ridges, mulching) greatly help in drylands.',
      sowing: 'Line sowing at 30–45 cm spacing at shallow depth; thinning to maintain optimum plant stand.',
      irrigation: 'Largely rainfed; 1–2 protective irrigations at flowering/grain filling if available.',
      fertilizer: 'Modest NPK per soil test; respond well to farmyard manure in drylands.',
      weed: 'First 25–30 days: thin, hoe or use inter-cultivation implements.',
      pest: 'Shoot fly, stem borer and grain midge in sorghum; downy mildew in bajra spreads via seed — use resistant varieties and seed treatment.',
      disease: 'Downy mildew, ergot (bajra), grain smuts (sorghum). Clean seed and rotation are effective.',
      harvest: 'Harvest earheads at maturity; dry thoroughly before threshing.',
      storage: 'Very good shelf life when dried to 10–12% moisture and stored in dry bins.',
      uses: 'Nutritious rotis and porridges, health foods rich in fibre, iron and calcium, fodder, and growing health-food industry demand.'
    },
    {
      id: 'mango', name: 'Mango', sci: 'Mangifera indica', category: 'Fruits',
      season: 'Perennial orchard crop; flowering winter, harvest summer',
      soil: 'Deep, well-drained alluvial to lateritic soils',
      water: 'Low once established; irrigation helps young plants', duration: 'Bears fruit from 4–6 years (grafted)',
      temp: '24–30 °C; dry weather at flowering essential', seed: 'Grafted plants; spacing 8–10 m (variety dependent)',
      desc: 'The “king of fruits” — India’s most loved orchard crop with major export value.',
      c1: '#f27f2c', c2: '#d9a03c',
      climate: 'Tropical to subtropical; distinct dry cool period at flowering gives best fruit set. Avoid waterlogged sites.',
      sowingSeason: 'Plant grafts at the start of monsoon (June–August) or in February–March under irrigation.',
      harvestSeason: 'March to July depending on variety and region.',
      landPrep: 'Pits of 1 m³ filled with topsoil, FYM and bonemeal before the planting season.',
      sowing: 'Plant grafted saplings of chosen varieties at 8–10 m spacing; stake and water young plants.',
      irrigation: 'Regular watering for first 2–3 years; irrigate at fruit development; avoid irrigation at flowering and just before harvest.',
      fertilizer: 'Annual FYM plus increasing NPK with tree age, applied in monsoon with basin preparation.',
      weed: 'Keep tree basins clean; mulching conserves moisture; intercrop in young orchards.',
      pest: 'Mango hopper, fruit fly, stem borer and mealybug. Orchard hygiene, pheromone/food-bait traps and IPM are recommended.',
      disease: 'Anthracnose (flower blight), powdery mildew, sooty mould (follows hopper honeydew). Timely IPM during flowering is critical.',
      harvest: 'Pick mature fruits with stalk (sap dries) at the right maturity stage for the market distance.',
      storage: 'Store in single layers in cool ventilated rooms; process or market promptly.',
      uses: 'Fresh fruit, pulp, juice, pickles (raw mango), jams and a large processing and export industry.'
    }
  ];

  var CATEGORIES = ['All', 'Cereals', 'Commercial Crops', 'Vegetables', 'Fruits', 'Pulses', 'Oilseeds'];
  window.AGRIVISION_CROPS = CROPS;
  window.AGRIVISION_CATEGORIES = CATEGORIES;

  /* ---------- Category SVG art (professional, replaces photo dependency) ---------- */
  function cropSVG(c) {
    var stroke = 'stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"';
    var fill = 'fill="#ffffff"';
    switch (c) {
      case 'Cereals':
        return '<svg viewBox="0 0 96 96" aria-hidden="true"><g '+stroke+'><path d="M48 84 V40"/><path d="M48 52 C48 40 40 34 30 34 C34 46 40 52 48 52 Z" '+fill+' opacity=".92"/><path d="M48 62 C48 50 56 44 66 44 C62 56 56 62 48 62 Z" '+fill+' opacity=".92"/><path d="M48 44 C48 32 42 26 34 24 C37 36 42 42 48 44 Z" '+fill+' opacity=".75"/><path d="M48 44 C48 32 54 26 62 24 C59 36 54 42 48 44 Z" '+fill+' opacity=".75"/><path d="M48 34 V18"/><ellipse cx="48" cy="14" rx="4" ry="6" '+fill+'/></g></svg>';
      case 'Commercial Crops':
        return '<svg viewBox="0 0 96 96" aria-hidden="true"><g '+stroke+'><path d="M48 86 V46"/><path d="M48 60 C48 50 40 46 32 46 C35 56 41 60 48 60 Z" '+fill+' opacity=".8"/><path d="M48 70 C48 60 56 56 64 56 C61 66 55 70 48 70 Z" '+fill+' opacity=".8"/><circle cx="48" cy="34" r="16" '+stroke+'/><path d="M38 30 Q48 20 58 30" /><path d="M38 38 Q48 48 58 38" /></g></svg>';
      case 'Vegetables':
        return '<svg viewBox="0 0 96 96" aria-hidden="true"><g '+stroke+'><path d="M40 30 C40 22 46 16 54 16 C54 24 48 30 40 30 Z" '+fill+' opacity=".85"/><path d="M56 24 C62 18 70 18 74 22 C70 28 62 30 56 24 Z" '+fill+' opacity=".7"/><path d="M30 40 C46 34 66 40 68 56 C70 72 54 82 40 80 C26 78 18 64 24 52 C26 46 28 42 30 40 Z" '+fill+' opacity=".92"/></g></svg>';
      case 'Fruits':
        return '<svg viewBox="0 0 96 96" aria-hidden="true"><g '+stroke+'><path d="M48 30 C58 22 74 26 78 42 C82 60 68 78 50 78 C32 78 20 62 24 46 C28 30 40 26 48 30 Z" '+fill+' opacity=".92"/><path d="M48 30 C48 22 52 16 60 14" /><path d="M60 14 C68 12 74 16 76 22 C68 24 62 20 60 14 Z" '+fill+' opacity=".8"/></g></svg>';
      case 'Pulses':
        return '<svg viewBox="0 0 96 96" aria-hidden="true"><g '+stroke+'><path d="M30 20 C58 24 74 44 70 74 C46 72 30 54 30 20 Z" '+fill+' opacity=".28"/><circle cx="42" cy="36" r="6" '+fill+'/><circle cx="54" cy="46" r="6" '+fill+' opacity=".9"/><circle cx="62" cy="60" r="6" '+fill+' opacity=".8"/><path d="M30 20 C24 14 18 12 12 12"/></g></svg>';
      case 'Oilseeds':
        return '<svg viewBox="0 0 96 96" aria-hidden="true"><g '+stroke+'><path d="M48 88 V44"/><path d="M48 56 C48 46 40 42 32 44 C36 54 42 58 48 56 Z" '+fill+' opacity=".8"/><path d="M48 66 C48 56 56 52 64 54 C60 64 54 68 48 66 Z" '+fill+' opacity=".8"/><circle cx="48" cy="32" r="14" '+fill+' opacity=".9"/><circle cx="48" cy="32" r="5" fill="#3d6b2f" stroke="none"/></g></svg>';
      default:
        return '<svg viewBox="0 0 96 96" aria-hidden="true"><path d="M48 84 V36 M48 50 C48 38 38 32 28 32 C32 46 40 52 48 50 Z M48 62 C48 50 58 44 68 44 C64 58 56 64 48 62 Z" '+stroke+'</svg>';
    }
  }
  function cropGradient(crop) {
    return 'linear-gradient(135deg,' + crop.c1 + ' 0%,' + crop.c2 + ' 100%)';
  }
  window.AGRIVISION = { cropSVG: cropSVG, cropGradient: cropGradient };

  /* ---------- Shared small icons ---------- */
  var ICON_ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
  var ICON_SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg>';

  /* ======================================================================
     HEADER: sticky glass/solid, active link, mobile menu
     ====================================================================== */
  function initHeader() {
    var header = $('#siteHeader');
    if (!header) return;
    var path = location.pathname.split('/').pop() || 'index.html';

    function setState() {
      var scrolled = window.scrollY > 40;
      var heroish = document.body.classList.contains('has-hero');
      header.classList.toggle('solid', scrolled || !heroish);
      header.classList.toggle('glass', !header.classList.contains('solid'));
    }
    setState();
    window.addEventListener('scroll', setState, { passive: true });

    $$('.nav-links a').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === path || (path === 'crop-details.html' && href === 'crops.html')) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
    });

    var burger = $('#hamburger'), nav = $('#navLinks');
    if (burger && nav) {
      burger.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        burger.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.classList.toggle('nav-open', open);
      });
      $$('a', nav).forEach(function (a) {
        a.addEventListener('click', function () {
          nav.classList.remove('open'); burger.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('nav-open');
        });
      });
    }
  }

  /* ======================================================================
     SCROLL REVEAL (IntersectionObserver)
     ====================================================================== */
  function initReveal() {
    var els = $$('.reveal,.reveal-scale,.reveal-left,.reveal-3d');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ======================================================================
     ANIMATED COUNTERS
     ====================================================================== */
  function initCounters() {
    var nums = $$('[data-count]');
    if (!nums.length) return;
    function animate(el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var dur = 1600, t0 = null;
      function step(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.firstChild.nodeValue = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!('IntersectionObserver' in window)) { nums.forEach(animate); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animate(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* ======================================================================
     DASHBOARD: meters + chart + bars animate into view
     ====================================================================== */
  function initDashboard() {
    var dash = $('#insightsDashboard');
    if (!dash) return;
    function activate() {
      $$('.meter-fill', dash).forEach(function (f) {
        f.style.width = f.getAttribute('data-value') + '%';
      });
      var chart = $('.chart-card', dash);
      if (chart) chart.classList.add('in-view');
    }
    if (!('IntersectionObserver' in window)) { activate(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { activate(); io.unobserve(en.target); } });
    }, { threshold: 0.3 });
    io.observe(dash);
  }

  /* ======================================================================
     CROP CARD RENDERING (crops.html & homepage featured grid)
     ====================================================================== */
  function cropCard(c, delay) {
    return '' +
      '<article class="crop-card reveal d' + ((delay % 6) + 1) + '" data-id="' + c.id + '" data-category="' + c.category + '" data-name="' + c.name.toLowerCase() + '">' +
        '<div class="crop-visual" style="background:' + cropGradient(c) + '">' +
          cropSVG(c.category) +
          '<span class="crop-cat">' + c.category + '</span>' +
        '</div>' +
        '<div class="crop-body">' +
          '<h3>' + c.name + '</h3>' +
          '<div class="crop-sci">' + c.sci + '</div>' +
          '<p class="crop-desc">' + c.desc + '</p>' +
          '<div class="crop-meta">' +
            '<span>Season<b>' + c.season.split('(')[0].trim() + '</b></span>' +
            '<span>Duration<b>' + c.duration + '</b></span>' +
            '<span>Soil<b>' + c.soil.split('(')[0].split(';')[0].trim() + '</b></span>' +
            '<span>Water<b>' + c.water.split('(')[0].trim() + '</b></span>' +
          '</div>' +
          '<a class="crop-link" href="crop-details.html?crop=' + c.id + '">View Details ' + ICON_ARROW + '</a>' +
        '</div>' +
      '</article>';
  }

  function initCropGrid() {
    var grid = $('#cropGrid');
    if (!grid) return;
    var search = $('#cropSearch');
    var chipsWrap = $('#filterChips');
    var count = $('#resultsCount');
    var noRes = $('#noResults');
    var activeCat = 'All';

    grid.innerHTML = CROPS.map(function (c, i) { return cropCard(c, i); }).join('');

    if (chipsWrap) {
      chipsWrap.innerHTML = CATEGORIES.map(function (cat, i) {
        return '<button type="button" class="chip' + (i === 0 ? ' active' : '') + '" data-cat="' + cat + '">' + cat + '</button>';
      }).join('');
      chipsWrap.addEventListener('click', function (e) {
        var btn = e.target.closest('.chip');
        if (!btn) return;
        $$('.chip', chipsWrap).forEach(function (x) { x.classList.remove('active'); });
        btn.classList.add('active');
        activeCat = btn.getAttribute('data-cat');
        applyFilter();
      });
    }

    // Pre-fill search from ?q= (linked from homepage)
    var q = new URLSearchParams(location.search).get('q');
    if (q && search) search.value = q;

    function applyFilter() {
      var term = search ? search.value.trim().toLowerCase() : '';
      var shown = 0;
      $$('.crop-card', grid).forEach(function (card) {
        var name = card.getAttribute('data-name');
        var cat = card.getAttribute('data-category');
        var ok = (activeCat === 'All' || cat === activeCat) && (term === '' || name.indexOf(term) !== -1);
        card.style.display = ok ? '' : 'none';
        if (ok) shown++;
      });
      if (count) count.textContent = shown + (shown === 1 ? ' crop found' : ' crops found');
      if (noRes) noRes.style.display = shown === 0 ? 'block' : 'none';
    }

    if (search) search.addEventListener('input', applyFilter);
    applyFilter();
    initReveal();
  }

  function initFeatured() {
    var feat = $('#featuredCrops');
    if (!feat) return;
    var picks = ['rice', 'wheat', 'maize', 'cotton', 'tomato', 'mango'];
    feat.innerHTML = picks.map(function (id, i) {
      var c = CROPS.filter(function (x) { return x.id === id; })[0];
      return cropCard(c, i);
    }).join('');
  }

  /* ======================================================================
     CROP DETAILS PAGE
     ====================================================================== */
  function initCropDetails() {
    var host = $('#cropDetail');
    if (!host) return;
    var id = new URLSearchParams(location.search).get('crop');
    var crop = CROPS.filter(function (c) { return c.id === id; })[0];

    if (!crop) {
      document.title = 'Crop Not Found – AgriVision';
      host.innerHTML =
        '<div class="container section"><div class="no-results"><h3>Crop not found</h3>' +
        '<p>The crop you are looking for does not exist in the guide. Please choose one from the crop list.</p><br>' +
        '<a class="btn btn-primary" href="crops.html">Browse All Crops ' + ICON_ARROW + '</a></div></div>';
      return;
    }

    document.title = crop.name + ' Cultivation Guide – AgriVision';
    var crumbs = $('#detailCrumbs');
    if (crumbs) crumbs.innerHTML = '<a href="index.html">Home</a><span>/</span><a href="crops.html">Crops</a><span>/</span>' + crop.name;

    var idx = CROPS.indexOf(crop);
    var prev = CROPS[(idx - 1 + CROPS.length) % CROPS.length];
    var next = CROPS[(idx + 1) % CROPS.length];

    function facts() {
      var F = [
        ['Crop Name', crop.name], ['Scientific Name', crop.sci], ['Crop Type', crop.category],
        ['Suitable Climate', crop.climate], ['Suitable Soil', crop.soil], ['Temperature', crop.temp],
        ['Water Requirement', crop.water], ['Sowing Season', crop.sowingSeason],
        ['Harvesting Season', crop.harvestSeason], ['Growing Duration', crop.duration],
        ['Seed Requirement', crop.seed]
      ];
      return '<div class="fact-grid">' + F.map(function (f) {
        return '<div class="fact"><b>' + f[0] + '</b><span>' + f[1] + '</span></div>';
      }).join('') + '</div>';
    }
    function sec(id, title, text) {
      return '<section class="detail-section reveal" id="' + id + '"><h3><span class="dot"></span>' + title + '</h3><p>' + text + '</p></section>';
    }

    host.innerHTML =
      '<div class="container">' +
        '<div class="detail-hero reveal in">' +
          '<div class="detail-visual" style="background:' + cropGradient(crop) + '">' + cropSVG(crop.category) + '</div>' +
          '<div style="flex:1;min-width:240px">' +
            '<h2>' + crop.name + '</h2>' +
            '<div class="crop-sci">' + crop.sci + '</div>' +
            '<div class="tag-row">' +
              '<span class="pill pill-green">' + crop.category + '</span>' +
              '<span class="pill pill-sky">Water: ' + crop.water.split('(')[0].trim() + '</span>' +
              '<span class="pill pill-sand">' + crop.duration + '</span>' +
            '</div>' +
          '</div>' +
          '<a class="btn btn-ghost" href="crops.html">All Crops</a>' +
        '</div>' +
        facts() +
        '<div class="detail-layout">' +
          '<nav class="detail-toc" aria-label="On this page"><b>On this page</b>' +
            '<a href="#s-land">Land Preparation</a><a href="#s-sowing">Sowing Method</a>' +
            '<a href="#s-irrigation">Irrigation</a><a href="#s-fert">Fertilizer Management</a>' +
            '<a href="#s-weed">Weed Management</a><a href="#s-pest">Pest Management</a>' +
            '<a href="#s-disease">Disease Management</a><a href="#s-harvest">Harvesting</a>' +
            '<a href="#s-storage">Storage</a><a href="#s-uses">Common Uses</a>' +
          '</nav>' +
          '<div>' +
            sec('s-land', 'Land Preparation', crop.landPrep) +
            sec('s-sowing', 'Sowing Method', crop.sowing) +
            sec('s-irrigation', 'Irrigation', crop.irrigation) +
            sec('s-fert', 'Fertilizer Management', crop.fertilizer) +
            sec('s-weed', 'Weed Management', crop.weed) +
            sec('s-pest', 'Pest Management', crop.pest) +
            sec('s-disease', 'Disease Management', crop.disease) +
            sec('s-harvest', 'Harvesting', crop.harvest) +
            sec('s-storage', 'Storage', crop.storage) +
            sec('s-uses', 'Common Uses', crop.uses) +
            '<div class="note warn reveal"><b>Local guidance matters</b>' +
              'These are general guidelines. Sowing periods, varieties, doses and practices vary by location, soil and weather. ' +
              'Please confirm with your local agricultural department or Krishi Vigyan Kendra before field decisions.</div>' +
            '<div class="detail-nav">' +
              '<a class="btn btn-ghost" href="crop-details.html?crop=' + prev.id + '">&larr; ' + prev.name + '</a>' +
              '<a class="btn btn-primary" href="crop-details.html?crop=' + next.id + '">' + next.name + ' &rarr;</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    initReveal();
  }

  /* ======================================================================
     HOMEPAGE SEARCH FORM → crops.html?q=
     ====================================================================== */
  function initHomeSearch() {
    var form = $('#homeSearchForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = $('#homeSearchInput').value.trim();
      location.href = 'crops.html' + (q ? '?q=' + encodeURIComponent(q) : '');
    });
  }

  /* ======================================================================
     CONTACT FORM (validated in the browser, submitted to Supabase)
     ====================================================================== */
  function getSupabaseClient() {
    if (typeof window.supabase === 'undefined' || !window.SUPABASE_URL || !window.SUPABASE_ANON_KEY
        || window.SUPABASE_URL.indexOf('YOUR-PROJECT-REF') !== -1) {
      return null;
    }
    if (!window.__agrivisionSupabase) {
      window.__agrivisionSupabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    }
    return window.__agrivisionSupabase;
  }

  function initContact() {
    var form = $('#contactForm');
    if (!form) return;
    var submitBtn = $('button[type="submit"]', form);
    var submitBtnDefaultHTML = submitBtn ? submitBtn.innerHTML : '';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      function check(id, fn, msg) {
        var input = $('#' + id), field = input.closest('.field'), err = $('.err', field);
        var valid = fn(input.value.trim());
        field.classList.toggle('invalid', !valid);
        if (!valid) { err.textContent = msg; ok = false; }
      }
      check('cName', function (v) { return v.length >= 2; }, 'Please enter your full name (at least 2 characters).');
      check('cEmail', function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }, 'Please enter a valid email address.');
      check('cPhone', function (v) { return v === '' || /^[+\d][\d\s-]{7,14}$/.test(v); }, 'Please enter a valid phone number (or leave it blank).');
      check('cSubject', function (v) { return v !== ''; }, 'Please select a subject.');
      check('cMessage', function (v) { return v.length >= 10; }, 'Please write a message of at least 10 characters.');

      var success = $('#formSuccess');
      var successText = $('#formSuccessText');
      if (!ok) {
        success.classList.remove('show', 'is-error');
        return;
      }

      var client = getSupabaseClient();
      if (!client) {
        success.classList.remove('is-error');
        successText.textContent = 'Configuration error: this site is not yet connected to a database. Please contact the site administrator.';
        success.classList.add('show', 'is-error');
        success.setAttribute('tabindex', '-1');
        success.focus({ preventScroll: false });
        return;
      }

      var payload = {
        name: $('#cName').value.trim(),
        email: $('#cEmail').value.trim(),
        phone: $('#cPhone').value.trim() || null,
        subject: $('#cSubject').value,
        message: $('#cMessage').value.trim()
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending&hellip;';
      }
      success.classList.remove('show', 'is-error');

      client.from('contact_submissions').insert([payload]).then(function (result) {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = submitBtnDefaultHTML;
        }
        if (result.error) {
          successText.textContent = 'Sorry, something went wrong sending your message. Please try again in a moment.';
          success.classList.add('show', 'is-error');
        } else {
          form.reset();
          $$('.field', form).forEach(function (f) { f.classList.remove('invalid'); });
          successText.textContent = 'Thank you. Your message has been sent.';
          success.classList.remove('is-error');
          success.classList.add('show');
        }
        success.setAttribute('tabindex', '-1');
        success.focus({ preventScroll: false });
      });
    });
    $$('#contactForm input,#contactForm textarea,#contactForm select').forEach(function (el) {
      el.addEventListener('input', function () { el.closest('.field').classList.remove('invalid'); });
    });
  }

  /* ======================================================================
     THREE.JS 3D HERO SCENE (with graceful WebGL fallback)
     ====================================================================== */
  function supportsWebGL() {
    try {
      var canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) { return false; }
  }

  function initHero3D() {
    var holder = $('#farm3d');
    if (!holder) return;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !window.THREE || !supportsWebGL()) {
      holder.style.display = 'none';
      return; // CSS .hero-fallback stays visible
    }

    try {
      var THREE = window.THREE;
      var W = holder.clientWidth, H = holder.clientHeight;
      var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(W, H);
      holder.appendChild(renderer.domElement);
      renderer.domElement.setAttribute('aria-hidden', 'true');

      // 3D scene active — hide the CSS fallback art so the two never overlap
      var fb = $('.hero-fallback');
      if (fb) fb.style.display = 'none';

      var scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0xffe9c4, 40, 140);

      var camera = new THREE.PerspectiveCamera(52, W / H, 0.1, 300);
      camera.position.set(0, 7, 30);

      /* Lights — sunrise mood */
      scene.add(new THREE.AmbientLight(0xfff2e0, 0.75));
      var sunLight = new THREE.DirectionalLight(0xffcc88, 1.15);
      sunLight.position.set(-40, 26, -60);
      scene.add(sunLight);
      scene.add(new THREE.HemisphereLight(0xbfe3ff, 0x7a9a55, 0.5));

      /* Sun disc + warm glow */
      var sun = new THREE.Mesh(
        new THREE.SphereGeometry(7, 24, 24),
        new THREE.MeshBasicMaterial({ color: 0xffd278 })
      );
      sun.position.set(-38, 16, -95);
      scene.add(sun);
      var sunGlow = new THREE.Mesh(
        new THREE.SphereGeometry(10.5, 24, 24),
        new THREE.MeshBasicMaterial({ color: 0xffbf66, transparent: true, opacity: 0.28 })
      );
      sunGlow.position.copy(sun.position);
      scene.add(sunGlow);

      /* Ground (land / grass) */
      var ground = new THREE.Mesh(
        new THREE.PlaneGeometry(400, 240),
        new THREE.MeshLambertMaterial({ color: 0x3f9243 })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.26;
      scene.add(ground);

      /* Tilled soil foreground strip */
      var soil = new THREE.Mesh(
        new THREE.PlaneGeometry(400, 46),
        new THREE.MeshLambertMaterial({ color: 0x7a5230 })
      );
      soil.rotation.x = -Math.PI / 2;
      soil.position.set(0, -0.24, 30);
      scene.add(soil);
      // furrow lines
      var furrowMat = new THREE.MeshLambertMaterial({ color: 0x64411f });
      for (var f = 0; f < 14; f++) {
        var furrow = new THREE.Mesh(new THREE.BoxGeometry(400, 0.35, 0.7), furrowMat);
        furrow.position.set(0, -0.05, 12 + f * 2.6);
        scene.add(furrow);
      }

      /* Crop rows (instanced cones swaying gently) */
      var plantGeo = new THREE.ConeGeometry(0.55, 1.9, 5);
      var plantMat = new THREE.MeshLambertMaterial({ color: 0x50c05e });
      var PLANTS = 180;
      var plants = new THREE.InstancedMesh(plantGeo, plantMat, PLANTS);
      var dummy = new THREE.Object3D();
      var seeds = [];
      for (var p = 0; p < PLANTS; p++) {
        var row = Math.floor(p / 18);
        var col = p % 18;
        seeds.push({
          x: -34 + col * 4 + (row % 2) * 1.4,
          z: -26 + row * 4.4,
          s: 0.8 + (p * 13 % 10) / 28,
          ph: (p * 37 % 100) / 100 * Math.PI * 2
        });
      }
      scene.add(plants);

      /* Mountains */
      var mtnCols = [0x6b8f71, 0x5d8464, 0x4f7758];
      [[-70, -110, 46, 30], [0, -120, 60, 38], [70, -112, 50, 32], [-30, -118, 40, 26]].forEach(function (m, i) {
        var mtn = new THREE.Mesh(
          new THREE.ConeGeometry(m[2], m[3], 4),
          new THREE.MeshLambertMaterial({ color: mtnCols[i % 3], flatShading: true })
        );
        mtn.position.set(m[0], m[3] / 2 - 2, m[1]);
        mtn.rotation.y = Math.PI / 4;
        scene.add(mtn);
      });

      /* ---------- Realistic tractor (detailed geometry build) ---------- */
      var TCOL = {
        green: new THREE.MeshLambertMaterial({ color: 0x2e7d32 }),
        greenDark: new THREE.MeshLambertMaterial({ color: 0x1f5c25 }),
        tire: new THREE.MeshLambertMaterial({ color: 0x1d1d1d }),
        rim: new THREE.MeshLambertMaterial({ color: 0xf2c531 }),
        steel: new THREE.MeshLambertMaterial({ color: 0x9aa4ab }),
        glass: new THREE.MeshLambertMaterial({ color: 0xcfeaf5, transparent: true, opacity: 0.4 })
      };
      function buildTractor() {
        var g = new THREE.Group();
        function bx(w, h, d, m, x, y, z) {
          var o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
          o.position.set(x, y, z); g.add(o); return o;
        }
        // chassis + engine hood
        bx(5.6, 0.55, 1.9, TCOL.tire, 0, 1.55, 0);
        bx(2.5, 1.3, 1.65, TCOL.green, 1.75, 2.4, 0);
        bx(2.4, 0.22, 1.5, TCOL.greenDark, 1.75, 3.16, 0);      // hood top
        bx(0.2, 1.15, 1.4, TCOL.tire, 3.05, 2.35, 0);           // front grille
        bx(1.3, 0.5, 0.9, TCOL.steel, 1.0, 1.9, 0);             // gearbox
        // headlights
        [-0.58, 0.58].forEach(function (z) {
          var hl = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), new THREE.MeshBasicMaterial({ color: 0xfff6d0 }));
          hl.position.set(3.12, 2.85, z); g.add(hl);
        });
        // exhaust pipe + cap
        var ex = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.1, 8), TCOL.tire);
        ex.position.set(2.45, 3.7, 0.5); g.add(ex);
        var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.12, 8), TCOL.steel);
        cap.position.set(2.45, 4.3, 0.5); g.add(cap);
        // cabin: floor, 4 pillars, glass shell, roof
        bx(2.0, 0.14, 1.75, TCOL.green, -0.85, 2.15, 0);
        [-1.75, 0.05].forEach(function (x) {
          [-0.82, 0.82].forEach(function (z) { bx(0.12, 1.8, 0.12, TCOL.greenDark, x, 3.0, z); });
        });
        bx(1.78, 1.55, 1.7, TCOL.glass, -0.85, 3.0, 0);
        bx(2.2, 0.14, 1.95, TCOL.green, -0.85, 3.95, 0);        // roof
        // seat + steering column + wheel
        bx(0.7, 0.55, 0.8, TCOL.tire, -1.3, 2.5, 0);
        var col = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.85, 6), TCOL.steel);
        col.position.set(-0.35, 2.65, 0); col.rotation.z = -0.55; g.add(col);
        var sw = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.05, 8, 16), TCOL.tire);
        sw.position.set(-0.1, 2.95, 0); sw.rotation.y = Math.PI / 2; sw.rotation.x = -0.5; g.add(sw);
        // wheels with tire, treads, yellow rim
        function wheel(R, x, z) {
          var wg = new THREE.Group();
          wg.add(new THREE.Mesh(new THREE.TorusGeometry(R - 0.3, 0.32, 10, 22), TCOL.tire));
          for (var i = 0; i < 10; i++) {
            var a = (i / 10) * Math.PI * 2;
            var tb = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 0.55), TCOL.tire);
            tb.position.set(Math.cos(a) * (R - 0.02), Math.sin(a) * (R - 0.02), 0);
            tb.rotation.z = a; wg.add(tb);
          }
          var rim = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.52, R * 0.52, 0.26, 18), TCOL.rim);
          rim.rotation.x = Math.PI / 2; wg.add(rim);
          var hub = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.34, 10), TCOL.tire);
          hub.rotation.x = Math.PI / 2; wg.add(hub);
          wg.position.set(x, R, z); g.add(wg);
          return { g: wg, r: R };
        }
        // mudguards over rear wheels
        [-1.3, 1.3].forEach(function (z) {
          var f = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.2, 8, 14, Math.PI), TCOL.green);
          f.position.set(-1.55, 1.72, z); g.add(f);
        });
        g.userData.wheels = [
          wheel(1.7, -1.55, 1.3), wheel(1.7, -1.55, -1.3),
          wheel(1.05, 1.95, 1.25), wheel(1.05, 1.95, -1.25)
        ];
        return g;
      }
      var tractor = buildTractor();
      tractor.position.set(-20, 0, 22);
      scene.add(tractor);
      var wheels = tractor.userData.wheels;

      /* ---------- Realistic farmer (detailed geometry build) ---------- */
      var FCOL = {
        skin: new THREE.MeshLambertMaterial({ color: 0xc98d5f }),
        shirt: new THREE.MeshLambertMaterial({ color: 0xf1ece0 }),
        pants: new THREE.MeshLambertMaterial({ color: 0x3f5a35 }),
        straw: new THREE.MeshLambertMaterial({ color: 0xd9b36a }),
        boot: new THREE.MeshLambertMaterial({ color: 0x2c2418 }),
        wood: new THREE.MeshLambertMaterial({ color: 0x8a6239 })
      };
      function buildFarmer() {
        var g = new THREE.Group();
        // legs + boots
        [-0.22, 0.22].forEach(function (x) {
          var leg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 1.45, 8), FCOL.pants);
          leg.position.set(x, 0.78, 0); g.add(leg);
          var bt = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.44), FCOL.boot);
          bt.position.set(x, 0.1, 0.07); g.add(bt);
        });
        // torso (kurta) + shoulders
        var torso = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 1.55, 10), FCOL.shirt);
        torso.position.y = 2.1; g.add(torso);
        var sh = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 10), FCOL.shirt);
        sh.position.y = 2.82; sh.scale.set(1.18, 0.72, 0.85); g.add(sh);
        // arms (sleeve + forearm + hand), right arm forward holding the hoe
        function arm(side, forward) {
          var a = new THREE.Group();
          var up = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.115, 0.72, 8), FCOL.shirt);
          up.position.y = -0.36; a.add(up);
          var fore = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.095, 0.58, 8), FCOL.skin);
          fore.position.y = -1.0; a.add(fore);
          var hand = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), FCOL.skin);
          hand.position.y = -1.34; a.add(hand);
          a.position.set(0.55 * side, 2.78, 0);
          a.rotation.z = -0.16 * side;
          if (forward) a.rotation.x = -0.85;
          g.add(a); return a;
        }
        arm(1, false);      // left arm relaxed
        arm(-1, true);      // right arm forward, gripping tool
        // neck + head + straw hat (brim + crown)
        var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.3, 8), FCOL.skin);
        neck.position.y = 3.0; g.add(neck);
        var head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 12), FCOL.skin);
        head.position.y = 3.35; g.add(head);
        var brim = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.64, 0.05, 16), FCOL.straw);
        brim.position.y = 3.6; g.add(brim);
        var crown = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 0.42, 12), FCOL.straw);
        crown.position.y = 3.82; g.add(crown);
        // hoe: wooden handle + metal blade, leaning forward into the ground
        var hoe = new THREE.Group();
        var stick = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.5, 8), FCOL.wood);
        hoe.add(stick);
        var blade = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 0.3), TCOL.steel);
        blade.position.set(0, -1.3, 0.1); blade.rotation.x = 0.5; hoe.add(blade);
        hoe.position.set(-0.85, 1.85, -0.7);
        hoe.rotation.x = 0.55;
        g.add(hoe);
        return g;
      }
      var farmer = buildFarmer();
      farmer.scale.setScalar(0.92);
      farmer.position.set(7, 0, 14);
      farmer.rotation.y = 0.45;
      scene.add(farmer);

      /* Clouds */
      var clouds = [];
      var cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.92 });
      for (var ci = 0; ci < 5; ci++) {
        var cloud = new THREE.Group();
        var parts = 4 + (ci % 3);
        for (var cp = 0; cp < parts; cp++) {
          var s = 2.2 + ((ci * 7 + cp * 3) % 5) * 0.55;
          var puff = new THREE.Mesh(new THREE.SphereGeometry(s, 12, 12), cloudMat);
          puff.position.set(cp * 2.6 - parts * 1.3, ((cp * 5) % 3) * 0.9, ((cp * 3) % 2) * 1.2);
          cloud.add(puff);
        }
        cloud.position.set(-90 + ci * 42, 26 + (ci % 3) * 7, -70 - (ci % 2) * 22);
        clouds.push(cloud); scene.add(cloud);
      }

      /* Floating dust / pollen particles */
      var P = 220, pos = new Float32Array(P * 3);
      for (var pi = 0; pi < P; pi++) {
        pos[pi * 3] = (Math.random() - 0.5) * 110;
        pos[pi * 3 + 1] = Math.random() * 16 + 0.5;
        pos[pi * 3 + 2] = (Math.random() - 0.5) * 70 + 5;
      }
      var pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      var particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xfff3c4, size: 0.42, transparent: true, opacity: 0.75 }));
      scene.add(particles);

      /* Animation loop */
      var mouseX = 0, t = 0, running = true;
      holder.parentElement.addEventListener('mousemove', function (e) {
        var r = holder.getBoundingClientRect();
        mouseX = ((e.clientX - r.left) / r.width - 0.5) * 2;
      });
      document.addEventListener('visibilitychange', function () {
        running = !document.hidden;
        if (running) tick();
      });

      function tick() {
        if (!running) return;
        requestAnimationFrame(tick);
        t += 0.008;

        // Plant sway
        for (var i = 0; i < PLANTS; i++) {
          var s = seeds[i];
          dummy.position.set(s.x, s.s * 0.95 - 0.2, s.z);
          dummy.rotation.z = Math.sin(t * 2 + s.ph) * 0.13;
          dummy.scale.setScalar(s.s);
          dummy.updateMatrix();
          plants.setMatrixAt(i, dummy.matrix);
        }
        plants.instanceMatrix.needsUpdate = true;

        // Clouds drift
        clouds.forEach(function (c, i) {
          c.position.x += 0.016 + i * 0.003;
          if (c.position.x > 110) c.position.x = -110;
        });

        // Tractor slow drive
        tractor.position.x += 0.035;
        if (tractor.position.x > 55) tractor.position.x = -60;
        wheels.forEach(function (w) { w.g.rotation.z -= 0.05 / w.r; });

        // Farmer gentle working sway
        farmer.position.y = Math.sin(t * 1.6) * 0.06;
        farmer.rotation.y = 0.45 + Math.sin(t * 0.8) * 0.08;

        // Particles rise
        var arr = pGeo.attributes.position.array;
        for (var j = 0; j < P; j++) {
          arr[j * 3 + 1] += 0.012;
          if (arr[j * 3 + 1] > 17) arr[j * 3 + 1] = 0.4;
        }
        pGeo.attributes.position.needsUpdate = true;

        // Sun pulse
        sunGlow.scale.setScalar(1 + Math.sin(t * 1.2) * 0.05);

        // Slow cinematic camera drift + mouse parallax
        camera.position.x = Math.sin(t * 0.22) * 5 + mouseX * 2.4;
        camera.position.y = 7 + Math.sin(t * 0.15) * 0.7;
        camera.lookAt(0, 4, 0);

        renderer.render(scene, camera);
      }
      tick();

      window.addEventListener('resize', function () {
        W = holder.clientWidth; H = holder.clientHeight;
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
        renderer.setSize(W, H);
      });
    } catch (e) {
      // Any failure: hide canvas, CSS fallback hero remains visible — no broken UI
      holder.style.display = 'none';
    }
  }

  /* ---------- Boot ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initHero3D();
    initFeatured();
    initCropGrid();
    initCropDetails();
    initHomeSearch();
    initContact();
    initCounters();
    initDashboard();
    initReveal();
  });
})();
