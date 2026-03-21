/**
 * plant-database.js
 * Comprehensive plant database with planting info, organized for lookup
 * by hardiness zone, month, soil type, and edibility.
 *
 * Each plant entry contains:
 *   - name, scientificName, commonNames[]
 *   - type: "edible" | "ornamental"
 *   - zones: [min, max]  (USDA hardiness zone range)
 *   - plantingMonths: [1..12]  months when planting is appropriate
 *   - soilTypes: [] which soils this plant does well in
 *   - watering: string description
 *   - seedDepth: string (for seed planting)
 *   - mistakes: string (common mistakes)
 *   - wikiTitle: Wikipedia article title for dynamic image lookup
 */

const PLANT_DB = [
  // ===== EDIBLE =====
  {
    name: "Tomato",
    scientificName: "Solanum lycopersicum",
    commonNames: ["Tomato", "Garden Tomato", "Love Apple"],
    type: "edible",
    zones: [3, 11],
    plantingMonths: [3, 4, 5, 6],
    soilTypes: ["loamy", "sandy"],
    watering: "1–2 inches per week; water at the base, not overhead. Keep soil consistently moist but not waterlogged.",
    seedDepth: "¼ inch deep. Start indoors 6–8 weeks before last frost, transplant when soil is warm (60°F+).",
    mistakes: "Planting too early in cold soil; overwatering which causes root rot; not staking or caging plants causing fruit to rot on the ground; pruning too aggressively.",
    wikiTitle: "Tomato"
  },
  {
    name: "Basil",
    scientificName: "Ocimum basilicum",
    commonNames: ["Sweet Basil", "Genovese Basil", "Common Basil"],
    type: "edible",
    zones: [2, 11],
    plantingMonths: [4, 5, 6, 7],
    soilTypes: ["loamy", "sandy"],
    watering: "1 inch per week. Water in the morning at the base. Likes moist but well-drained soil.",
    seedDepth: "¼ inch deep. Barely cover seeds — they need light to germinate. Soil temp should be 70°F+.",
    mistakes: "Letting it flower (pinch blooms to keep leaves coming); overwatering in cool weather; planting outdoors before last frost; not harvesting regularly.",
    wikiTitle: "Basil"
  },
  {
    name: "Lettuce",
    scientificName: "Lactuca sativa",
    commonNames: ["Garden Lettuce", "Leaf Lettuce", "Butterhead"],
    type: "edible",
    zones: [2, 11],
    plantingMonths: [2, 3, 4, 5, 8, 9, 10],
    soilTypes: ["loamy", "silty", "clay"],
    watering: "1–1.5 inches per week. Keep soil evenly moist. Mulch to retain moisture and cool roots.",
    seedDepth: "⅛ to ¼ inch deep. Seeds are tiny — press lightly into soil. They need some light to germinate.",
    mistakes: "Planting in full summer heat (bolts quickly); sowing too deep; not thinning seedlings; letting soil dry out completely between waterings.",
    wikiTitle: "Lettuce"
  },
  {
    name: "Carrot",
    scientificName: "Daucus carota subsp. sativus",
    commonNames: ["Carrot", "Garden Carrot", "Wild Carrot (ancestor)"],
    type: "edible",
    zones: [3, 10],
    plantingMonths: [3, 4, 5, 6, 7, 8],
    soilTypes: ["sandy", "loamy"],
    watering: "1 inch per week. Consistent moisture is key, especially during germination. Avoid overhead watering after seedlings emerge.",
    seedDepth: "¼ inch deep. Sow directly — carrots don't transplant well. Thin to 2–3 inches apart.",
    mistakes: "Rocky or compacted soil causing forked roots; not thinning seedlings; inconsistent watering causing cracking; sowing too deep.",
    wikiTitle: "Carrot"
  },
  {
    name: "Cucumber",
    scientificName: "Cucumis sativus",
    commonNames: ["Cucumber", "Cuke", "Garden Cucumber"],
    type: "edible",
    zones: [4, 11],
    plantingMonths: [4, 5, 6, 7],
    soilTypes: ["loamy", "sandy"],
    watering: "1–2 inches per week. Water deeply and consistently. Drip irrigation is ideal — avoid wetting leaves.",
    seedDepth: "1 inch deep. Direct sow when soil reaches 65°F+. Space 36–60 inches apart or trellis for vertical growing.",
    mistakes: "Planting in cold soil; irregular watering causing bitter fruit; not providing a trellis (leads to disease); ignoring powdery mildew.",
    wikiTitle: "Cucumber"
  },
  {
    name: "Bell Pepper",
    scientificName: "Capsicum annuum",
    commonNames: ["Sweet Pepper", "Bell Pepper", "Capsicum"],
    type: "edible",
    zones: [3, 11],
    plantingMonths: [3, 4, 5, 6],
    soilTypes: ["loamy", "sandy"],
    watering: "1–2 inches per week. Keep soil consistently moist. Water at the base and mulch to retain moisture.",
    seedDepth: "¼ inch deep. Start indoors 8–10 weeks before last frost. Transplant when soil is at least 65°F.",
    mistakes: "Transplanting too early into cold soil; overfertilizing with nitrogen (all leaves, no fruit); not hardening off seedlings; planting too close together.",
    wikiTitle: "Bell_pepper"
  },
  {
    name: "Zucchini",
    scientificName: "Cucurbita pepo",
    commonNames: ["Zucchini", "Courgette", "Summer Squash"],
    type: "edible",
    zones: [3, 11],
    plantingMonths: [4, 5, 6, 7],
    soilTypes: ["loamy", "sandy", "clay"],
    watering: "1–2 inches per week. Deep, infrequent watering is better than shallow daily watering. Water at the base.",
    seedDepth: "1 inch deep. Direct sow after last frost when soil is 60°F+. Space 3–4 feet apart — they get big!",
    mistakes: "Planting too many (one plant is very productive); not harvesting small (they turn into baseball bats fast); overwatering; ignoring squash vine borers.",
    wikiTitle: "Zucchini"
  },
  {
    name: "Snap Pea",
    scientificName: "Pisum sativum var. macrocarpon",
    commonNames: ["Sugar Snap Pea", "Snap Pea", "Garden Pea"],
    type: "edible",
    zones: [3, 11],
    plantingMonths: [2, 3, 4, 8, 9],
    soilTypes: ["loamy", "sandy", "silty"],
    watering: "1 inch per week. Keep soil evenly moist during flowering and pod development.",
    seedDepth: "1–1.5 inches deep. Direct sow 4–6 weeks before last frost. Can tolerate light frost.",
    mistakes: "Planting too late in spring (they dislike heat above 80°F); not providing a trellis; overwatering in cool weather; pulling plants instead of cutting at harvest.",
    wikiTitle: "Snap_pea"
  },
  {
    name: "Kale",
    scientificName: "Brassica oleracea var. sabellica",
    commonNames: ["Kale", "Curly Kale", "Leaf Cabbage", "Borecole"],
    type: "edible",
    zones: [2, 11],
    plantingMonths: [2, 3, 4, 5, 8, 9, 10],
    soilTypes: ["loamy", "clay", "silty"],
    watering: "1–1.5 inches per week. Consistent watering keeps leaves tender and sweet.",
    seedDepth: "¼ to ½ inch deep. Direct sow or start indoors 4–6 weeks before last frost. Frost actually improves flavor!",
    mistakes: "Not thinning seedlings; ignoring cabbage worms; harvesting the center bud (take outer leaves first); over-fertilizing which makes leaves tough.",
    wikiTitle: "Kale"
  },
  {
    name: "Radish",
    scientificName: "Raphanus sativus",
    commonNames: ["Radish", "Garden Radish", "Daikon (winter type)"],
    type: "edible",
    zones: [2, 10],
    plantingMonths: [3, 4, 5, 8, 9, 10],
    soilTypes: ["sandy", "loamy", "silty"],
    watering: "1 inch per week. Even moisture prevents cracking and pithy roots.",
    seedDepth: "½ inch deep. Direct sow — they mature fast (25–30 days). Sow every 2 weeks for continuous harvest.",
    mistakes: "Planting in summer heat (they bolt); not thinning to 1–2 inches apart; letting them stay in the ground too long (they get woody); compacted soil.",
    wikiTitle: "Radish"
  },
  {
    name: "Green Bean",
    scientificName: "Phaseolus vulgaris",
    commonNames: ["Green Bean", "Snap Bean", "String Bean", "French Bean"],
    type: "edible",
    zones: [3, 10],
    plantingMonths: [4, 5, 6, 7, 8],
    soilTypes: ["loamy", "sandy", "clay"],
    watering: "1–1.5 inches per week. Water at base. Increase during flowering and pod set.",
    seedDepth: "1–1.5 inches deep. Direct sow after last frost when soil is 60°F+. Do not start indoors — beans dislike transplanting.",
    mistakes: "Planting in cold soil; handling plants when wet (spreads disease); not harvesting regularly (reduces yield); over-fertilizing with nitrogen.",
    wikiTitle: "Green_bean"
  },
  {
    name: "Strawberry",
    scientificName: "Fragaria × ananassa",
    commonNames: ["Strawberry", "Garden Strawberry"],
    type: "edible",
    zones: [3, 10],
    plantingMonths: [3, 4, 5],
    soilTypes: ["loamy", "sandy"],
    watering: "1–1.5 inches per week. Drip irrigation preferred. Keep water off fruit to prevent rot.",
    seedDepth: "Plant crowns at soil level — the crown must not be buried. Space 12–18 inches apart in rows.",
    mistakes: "Burying the crown too deep; not removing runners the first year; watering from above causing mold; planting in soil where tomatoes/peppers grew (disease risk).",
    wikiTitle: "Strawberry"
  },
  {
    name: "Spinach",
    scientificName: "Spinacia oleracea",
    commonNames: ["Spinach", "Common Spinach"],
    type: "edible",
    zones: [2, 9],
    plantingMonths: [2, 3, 4, 9, 10, 11],
    soilTypes: ["loamy", "clay", "silty"],
    watering: "1–1.5 inches per week. Keep consistently moist. Mulch to keep roots cool.",
    seedDepth: "½ inch deep. Direct sow in cool weather. Can tolerate light frost. Soil temp ideally 45–65°F.",
    mistakes: "Planting in hot weather (bolts immediately); sowing too deep; not thinning to 4–6 inches; letting soil dry out.",
    wikiTitle: "Spinach"
  },
  {
    name: "Herb: Rosemary",
    scientificName: "Salvia rosmarinus",
    commonNames: ["Rosemary", "Anthos", "Dew of the Sea"],
    type: "edible",
    zones: [7, 11],
    plantingMonths: [3, 4, 5, 6, 9, 10],
    soilTypes: ["sandy", "loamy", "chalky"],
    watering: "Let soil dry between waterings. Roughly every 1–2 weeks. Very drought-tolerant once established.",
    seedDepth: "Press seeds onto surface — they need light. Germination is slow (2–3 weeks). Easier from cuttings.",
    mistakes: "Overwatering (the #1 killer); planting in heavy clay without drainage; pruning into old wood (it won't regrow); keeping indoors without enough light.",
    wikiTitle: "Rosemary"
  },
  {
    name: "Garlic",
    scientificName: "Allium sativum",
    commonNames: ["Garlic", "Stinking Rose", "Cultivated Garlic"],
    type: "edible",
    zones: [3, 8],
    plantingMonths: [9, 10, 11, 2, 3],
    soilTypes: ["loamy", "sandy"],
    watering: "½–1 inch per week during active growth. Stop watering 2 weeks before harvest to cure bulbs.",
    seedDepth: "2 inches deep, pointed end up. Space 4–6 inches apart. Plant individual cloves, not whole bulbs.",
    mistakes: "Planting grocery store garlic (often treated to not sprout); planting cloves upside down; watering during curing; harvesting too late (cloves burst open).",
    wikiTitle: "Garlic"
  },
  {
    name: "Sweet Potato",
    scientificName: "Ipomoea batatas",
    commonNames: ["Sweet Potato", "Yam (US colloquial)", "Kumara"],
    type: "edible",
    zones: [5, 11],
    plantingMonths: [4, 5, 6],
    soilTypes: ["sandy", "loamy"],
    watering: "1 inch per week. Reduce watering 3–4 weeks before harvest. They prefer slightly dry conditions.",
    seedDepth: "Plant slips (not seeds) 4 inches deep, 12–18 inches apart. Create mounded rows for drainage.",
    mistakes: "Using regular seed potatoes (sweet potatoes grow from slips); planting in cold soil; not curing after harvest; overwatering which causes cracking.",
    wikiTitle: "Sweet_potato"
  },
  {
    name: "Cilantro",
    scientificName: "Coriandrum sativum",
    commonNames: ["Cilantro", "Coriander", "Chinese Parsley", "Dhania"],
    type: "edible",
    zones: [2, 11],
    plantingMonths: [3, 4, 5, 9, 10],
    soilTypes: ["loamy", "sandy"],
    watering: "1 inch per week. Keep soil moist but not soggy. Mulch to keep roots cool.",
    seedDepth: "¼ inch deep. Crush seeds gently before sowing to improve germination. Direct sow — doesn't transplant well.",
    mistakes: "Planting in summer heat (bolts within days); not succession planting every 3 weeks; sowing seeds whole without cracking; transplanting mature plants.",
    wikiTitle: "Coriander"
  },

  // ===== ORNAMENTAL =====
  {
    name: "Marigold",
    scientificName: "Tagetes erecta",
    commonNames: ["African Marigold", "Aztec Marigold", "French Marigold"],
    type: "ornamental",
    zones: [2, 11],
    plantingMonths: [3, 4, 5, 6],
    soilTypes: ["loamy", "sandy", "clay"],
    watering: "1 inch per week. Water at the base. They're drought-tolerant once established.",
    seedDepth: "¼ inch deep. Start indoors 6–8 weeks before last frost, or direct sow after frost. Germinates in 5–7 days.",
    mistakes: "Overwatering (causes root rot); deadheading is optional but helps; planting in too much shade; spacing too close (leads to powdery mildew).",
    wikiTitle: "Marigold"
  },
  {
    name: "Sunflower",
    scientificName: "Helianthus annuus",
    commonNames: ["Common Sunflower", "Mirasol"],
    type: "ornamental",
    zones: [2, 11],
    plantingMonths: [4, 5, 6, 7],
    soilTypes: ["loamy", "sandy", "clay"],
    watering: "1–2 inches per week. Water deeply but infrequently. Extra water during budding and flowering.",
    seedDepth: "1–1.5 inches deep. Direct sow after last frost. Space 6–12 inches apart depending on variety.",
    mistakes: "Planting in shade (they need 6–8 hours of sun minimum); not staking tall varieties; planting too close together; birds eating seeds before germination.",
    wikiTitle: "Common_sunflower"
  },
  {
    name: "Lavender",
    scientificName: "Lavandula angustifolia",
    commonNames: ["English Lavender", "True Lavender", "Common Lavender"],
    type: "ornamental",
    zones: [5, 9],
    plantingMonths: [3, 4, 5, 9, 10],
    soilTypes: ["sandy", "loamy", "chalky"],
    watering: "Very drought-tolerant. Water every 1–2 weeks. Let soil dry completely between waterings. Less is more.",
    seedDepth: "Surface sow — seeds need light. Press gently onto soil. Very slow to germinate (14–21 days). Easier from cuttings.",
    mistakes: "Overwatering (the #1 cause of lavender death); planting in rich, heavy soil; not providing enough sun; heavy pruning into old wood.",
    wikiTitle: "Lavandula"
  },
  {
    name: "Zinnia",
    scientificName: "Zinnia elegans",
    commonNames: ["Common Zinnia", "Youth-and-age", "Elegant Zinnia"],
    type: "ornamental",
    zones: [3, 10],
    plantingMonths: [4, 5, 6],
    soilTypes: ["loamy", "sandy"],
    watering: "1 inch per week. Water at the base only — overhead watering causes powdery mildew. Drought-tolerant once established.",
    seedDepth: "¼ inch deep. Direct sow after last frost. One of the easiest flowers to grow from seed. Germinates in 5–7 days.",
    mistakes: "Overhead watering (powdery mildew magnet); not deadheading spent blooms; starting indoors (they prefer direct sowing); crowding plants.",
    wikiTitle: "Zinnia_elegans"
  },
  {
    name: "Black-Eyed Susan",
    scientificName: "Rudbeckia hirta",
    commonNames: ["Black-Eyed Susan", "Gloriosa Daisy", "Brown Betty"],
    type: "ornamental",
    zones: [3, 9],
    plantingMonths: [3, 4, 5, 9, 10],
    soilTypes: ["loamy", "clay", "sandy"],
    watering: "1 inch per week. Very drought-tolerant once established. Water regularly during first season.",
    seedDepth: "Surface sow — press onto soil, do not cover. Needs light to germinate. Start indoors 6–8 weeks early or direct sow after frost.",
    mistakes: "Burying seeds too deep; dividing too infrequently (clumps get overcrowded every 3–4 years); overwatering established plants; removing spent stems in fall (they self-seed!).",
    wikiTitle: "Rudbeckia_hirta"
  },
  {
    name: "Petunia",
    scientificName: "Petunia × atkinsiana",
    commonNames: ["Garden Petunia", "Petunia"],
    type: "ornamental",
    zones: [2, 11],
    plantingMonths: [3, 4, 5, 6],
    soilTypes: ["loamy", "sandy"],
    watering: "1–2 inches per week. Container petunias may need daily watering in hot weather. Don't let soil stay soggy.",
    seedDepth: "Surface sow — tiny seeds need light. Do not cover. Start indoors 10–12 weeks before last frost.",
    mistakes: "Not pinching back leggy stems; underwatering container plants; forgetting to fertilize every 2 weeks; not deadheading for continuous bloom.",
    wikiTitle: "Petunia"
  },
  {
    name: "Coneflower",
    scientificName: "Echinacea purpurea",
    commonNames: ["Purple Coneflower", "Echinacea", "Eastern Purple Coneflower"],
    type: "ornamental",
    zones: [3, 9],
    plantingMonths: [3, 4, 5, 9, 10],
    soilTypes: ["loamy", "sandy", "clay"],
    watering: "Very drought-tolerant. Water 1 inch per week during first year. After established, only water during extended drought.",
    seedDepth: "⅛ inch deep. Seeds need cold stratification — sow in fall or refrigerate seeds for 30 days before spring planting.",
    mistakes: "Skipping cold stratification; overwatering established plants; cutting back in fall (leave seed heads for birds and self-seeding); rich, wet soil.",
    wikiTitle: "Echinacea_purpurea"
  },
  {
    name: "Daylily",
    scientificName: "Hemerocallis spp.",
    commonNames: ["Daylily", "Day Lily"],
    type: "ornamental",
    zones: [3, 10],
    plantingMonths: [3, 4, 5, 9, 10],
    soilTypes: ["loamy", "clay", "sandy", "silty"],
    watering: "1 inch per week. They're adaptable but bloom best with consistent moisture. Mulch to retain moisture.",
    seedDepth: "Plant bare-root crowns 1 inch below soil surface. Space 18–24 inches apart. Division is easier than seed.",
    mistakes: "Planting too deep (crown should be just below surface); not dividing every 3–5 years; removing foliage before it yellows naturally; ignoring daylily rust.",
    wikiTitle: "Daylily"
  },
  {
    name: "Cosmos",
    scientificName: "Cosmos bipinnatus",
    commonNames: ["Garden Cosmos", "Mexican Aster"],
    type: "ornamental",
    zones: [2, 11],
    plantingMonths: [4, 5, 6],
    soilTypes: ["sandy", "loamy"],
    watering: "Minimal — every 1–2 weeks. Very drought-tolerant. Overwatering produces foliage at the expense of flowers.",
    seedDepth: "¼ inch deep. Direct sow after last frost. Barely cover. One of the easiest flowers from seed.",
    mistakes: "Over-fertilizing (lean soil = more flowers); overwatering; not deadheading; staking tall varieties too late (they flop).",
    wikiTitle: "Cosmos_bipinnatus"
  },
  {
    name: "Hosta",
    scientificName: "Hosta spp.",
    commonNames: ["Hosta", "Plantain Lily", "Funkia"],
    type: "ornamental",
    zones: [3, 9],
    plantingMonths: [3, 4, 5, 9],
    soilTypes: ["loamy", "silty", "clay"],
    watering: "1–1.5 inches per week. They love consistent moisture. Morning watering is best.",
    seedDepth: "Plant divisions with crown at soil level. Space 1–3 feet apart depending on mature size.",
    mistakes: "Planting in full sun (they're shade lovers); not protecting from slugs and snails; dividing too frequently; letting deer access (they love hostas).",
    wikiTitle: "Hosta"
  },
  {
    name: "Chrysanthemum",
    scientificName: "Chrysanthemum morifolium",
    commonNames: ["Garden Mum", "Chrysanthemum", "Hardy Mum"],
    type: "ornamental",
    zones: [5, 9],
    plantingMonths: [4, 5, 9],
    soilTypes: ["loamy", "sandy"],
    watering: "1 inch per week. Keep soil moist but not waterlogged. Water at base to prevent leaf diseases.",
    seedDepth: "¼ inch deep for seeds, but most gardeners plant from nursery starts or divisions. Plant at same depth as container.",
    mistakes: "Buying and planting in fall only (spring planting gives roots time to establish for winter); not pinching stems before July (creates bushier plants); wet feet in winter.",
    wikiTitle: "Chrysanthemum"
  },
  {
    name: "Pansy",
    scientificName: "Viola × wittrockiana",
    commonNames: ["Pansy", "Garden Pansy", "Ladies' Delight"],
    type: "ornamental",
    zones: [4, 8],
    plantingMonths: [2, 3, 4, 9, 10, 11],
    soilTypes: ["loamy", "silty"],
    watering: "1 inch per week. Keep soil moist. They wilt quickly when dry but recover fast with water.",
    seedDepth: "⅛ inch deep. Seeds need darkness to germinate — cover completely. Start indoors 8–10 weeks before planting out.",
    mistakes: "Planting too late in spring (they struggle in heat above 80°F); not deadheading; forgetting they're cool-season plants; planting in poorly draining soil.",
    wikiTitle: "Pansy"
  },
  {
    name: "Snapdragon",
    scientificName: "Antirrhinum majus",
    commonNames: ["Snapdragon", "Dragon Flower", "Dog Flower"],
    type: "ornamental",
    zones: [5, 10],
    plantingMonths: [2, 3, 4, 9, 10],
    soilTypes: ["loamy", "sandy"],
    watering: "1 inch per week. Water at the base — they're susceptible to rust disease on wet foliage.",
    seedDepth: "Surface sow — seeds need light. Press onto soil and do not cover. Start indoors 8–10 weeks before last frost.",
    mistakes: "Overhead watering causing rust; not pinching seedlings for bushier growth; ignoring aphids; planting in deep shade.",
    wikiTitle: "Antirrhinum"
  },

  // ===== MORE EDIBLE — Cool Season / Fall =====
  {
    name: "Broccoli",
    scientificName: "Brassica oleracea var. italica",
    commonNames: ["Broccoli", "Calabrese"],
    type: "edible",
    zones: [3, 10],
    plantingMonths: [2, 3, 4, 8, 9],
    soilTypes: ["loamy", "clay", "silty"],
    watering: "1–1.5 inches per week. Consistent moisture is critical for head development.",
    seedDepth: "¼ to ½ inch deep. Start indoors 6 weeks before last frost. Transplant seedlings 18 inches apart.",
    mistakes: "Planting in summer heat (causes bolting and bitter taste); not harvesting the main head promptly (smaller side shoots follow); skipping row covers for cabbage worms.",
    wikiTitle: "Broccoli"
  },
  {
    name: "Onion",
    scientificName: "Allium cepa",
    commonNames: ["Onion", "Bulb Onion", "Common Onion"],
    type: "edible",
    zones: [3, 9],
    plantingMonths: [2, 3, 4, 9, 10],
    soilTypes: ["loamy", "sandy"],
    watering: "1 inch per week. Keep consistently moist during bulb formation. Stop watering when tops begin to fall over.",
    seedDepth: "¼ inch deep for seeds, or plant sets 1 inch deep. Choose short-day varieties for southern zones, long-day for northern.",
    mistakes: "Choosing wrong day-length variety for your latitude; planting too deep; not stopping water before harvest; storing before curing.",
    wikiTitle: "Onion"
  },
  {
    name: "Pumpkin",
    scientificName: "Cucurbita maxima",
    commonNames: ["Pumpkin", "Winter Squash"],
    type: "edible",
    zones: [3, 9],
    plantingMonths: [5, 6, 7],
    soilTypes: ["loamy", "sandy"],
    watering: "1–2 inches per week. Deep watering. Avoid wetting leaves. Reduce watering as fruits mature.",
    seedDepth: "1 inch deep. Direct sow after last frost when soil is 65°F+. Space hills 4–8 feet apart.",
    mistakes: "Underestimating space needs; not hand-pollinating if bees are scarce; overwatering mature fruit; planting too late to mature before frost.",
    wikiTitle: "Pumpkin"
  },
  {
    name: "Mint",
    scientificName: "Mentha spp.",
    commonNames: ["Mint", "Spearmint", "Peppermint"],
    type: "edible",
    zones: [3, 11],
    plantingMonths: [3, 4, 5, 6, 9],
    soilTypes: ["loamy", "clay", "silty", "sandy"],
    watering: "1–2 inches per week. Likes moist soil. One of the few herbs that thrives in partial shade.",
    seedDepth: "Surface sow — tiny seeds need light. Easier from cuttings or divisions. Plant in containers to control spread!",
    mistakes: "Planting in the ground without containment (it spreads aggressively); not harvesting frequently enough; letting it flower; underestimating how invasive it is.",
    wikiTitle: "Mentha"
  },
  {
    name: "Thyme",
    scientificName: "Thymus vulgaris",
    commonNames: ["Common Thyme", "Garden Thyme", "German Thyme"],
    type: "edible",
    zones: [5, 9],
    plantingMonths: [3, 4, 5, 9, 10],
    soilTypes: ["sandy", "loamy", "chalky"],
    watering: "Very drought-tolerant. Water every 10–14 days. Allow soil to dry between waterings.",
    seedDepth: "Surface sow — barely cover with a dusting of soil. Very slow to germinate. Easier from cuttings or divisions.",
    mistakes: "Overwatering; planting in heavy, wet clay; not pruning after flowering (gets woody); bringing potted thyme indoors without enough light.",
    wikiTitle: "Thyme"
  },

  // ===== MORE ORNAMENTAL =====
  {
    name: "Dahlia",
    scientificName: "Dahlia pinnata",
    commonNames: ["Dahlia", "Garden Dahlia"],
    type: "ornamental",
    zones: [3, 10],
    plantingMonths: [4, 5, 6],
    soilTypes: ["loamy", "sandy"],
    watering: "1–2 inches per week once growing. Do not water tubers until sprouts appear. Deep, infrequent watering is best.",
    seedDepth: "Plant tubers 4–6 inches deep with the eye (growing point) facing up. Space 18–24 inches apart.",
    mistakes: "Watering tubers before they sprout (causes rot); not staking tall varieties; forgetting to dig up tubers before first hard frost in cold zones; planting too early in cold soil.",
    wikiTitle: "Dahlia"
  },
  {
    name: "Morning Glory",
    scientificName: "Ipomoea purpurea",
    commonNames: ["Morning Glory", "Common Morning Glory", "Tall Morning Glory"],
    type: "ornamental",
    zones: [2, 11],
    plantingMonths: [4, 5, 6],
    soilTypes: ["sandy", "loamy"],
    watering: "1 inch per week. They actually bloom better with less water and less fertile soil. Don't pamper them.",
    seedDepth: "½ inch deep. Nick or soak seeds overnight before planting for better germination. Direct sow after last frost.",
    mistakes: "Over-fertilizing (all vine, no flowers); not providing a trellis; not scarifying seeds before planting; planting in too much shade.",
    wikiTitle: "Ipomoea_purpurea"
  },
  {
    name: "Salvia",
    scientificName: "Salvia splendens",
    commonNames: ["Scarlet Sage", "Red Salvia", "Tropical Sage"],
    type: "ornamental",
    zones: [4, 11],
    plantingMonths: [3, 4, 5, 6],
    soilTypes: ["loamy", "sandy"],
    watering: "1 inch per week. Moderate water needs. Drought-tolerant once established.",
    seedDepth: "Surface sow — needs light. Start indoors 6–8 weeks before last frost. Transplant after danger of frost.",
    mistakes: "Overwatering; not deadheading spent flower spikes; planting too early in cold soil; confusing ornamental salvia with culinary sage.",
    wikiTitle: "Salvia_splendens"
  }
];

// ===== SOIL TYPE METADATA =====
const SOIL_TYPES = {
  clay:   { name: "Clay Soil",   icon: "🧱", desc: "Dense, nutrient-rich, slow-draining" },
  sandy:  { name: "Sandy Soil",  icon: "🏖️", desc: "Fast-draining, warms quickly, low nutrients" },
  loamy:  { name: "Loam Soil",   icon: "🌿", desc: "Ideal mix — well-draining, nutrient-rich" },
  silty:  { name: "Silty Soil",  icon: "💧", desc: "Smooth, moisture-retentive, fertile" },
  peaty:  { name: "Peaty Soil",  icon: "🟤", desc: "Acidic, high organic matter, retains moisture" },
  chalky: { name: "Chalky Soil", icon: "⬜", desc: "Alkaline, free-draining, stony" }
};

/**
 * Get plants suitable for a given zone, month, and optional filter.
 * Returns plants grouped by soil type.
 */
function getPlantsForConditions(zone, month, filter) {
  const matching = PLANT_DB.filter(p => {
    const inZone  = zone >= p.zones[0] && zone <= p.zones[1];
    const inMonth = p.plantingMonths.includes(month);
    const inFilter = filter === 'all' || p.type === filter;
    return inZone && inMonth && inFilter;
  });

  // Group by soil type
  const grouped = {};
  for (const soil of Object.keys(SOIL_TYPES)) {
    const plants = matching.filter(p => p.soilTypes.includes(soil));
    if (plants.length > 0) {
      grouped[soil] = plants;
    }
  }
  return grouped;
}

/**
 * Score and rank plants for "Top Picks".
 * Higher score = better fit for the user's conditions.
 */
function getTopPicks(zone, month, type, count) {
  const matching = PLANT_DB.filter(p => {
    const inZone  = zone >= p.zones[0] && zone <= p.zones[1];
    const inMonth = p.plantingMonths.includes(month);
    const inType  = p.type === type;
    return inZone && inMonth && inType;
  });

  // Score each plant
  const scored = matching.map(p => {
    let score = 0;
    // Zone centrality: closer to the middle of the plant's zone range = better
    const zoneMid = (p.zones[0] + p.zones[1]) / 2;
    const zoneSpan = p.zones[1] - p.zones[0];
    score += 10 - Math.abs(zone - zoneMid); // up to ~10 pts

    // Month centrality: how well does this month fit the planting window
    const monthIdx = p.plantingMonths.indexOf(month);
    const monthMid = Math.floor(p.plantingMonths.length / 2);
    score += 5 - Math.abs(monthIdx - monthMid); // mid-window = best

    // Soil versatility bonus
    score += p.soilTypes.length * 0.5;

    // More planting months = more forgiving plant
    score += p.plantingMonths.length * 0.3;

    return { plant: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map(s => s.plant);
}
