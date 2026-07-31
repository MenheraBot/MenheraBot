# Fazendinha (Farm) — Complete Feature Reference

> Context document for the current state of the Fazendinha module. It captures every command, every option a player has, every mechanic, and every tunable number, so future development starts from a single source of truth.
>
> **Source locations**
> - Command entry point: [`packages/events/src/commands/fazendinha/FazendinhaCommand.ts`](packages/events/src/commands/fazendinha/FazendinhaCommand.ts)
> - Module logic: [`packages/events/src/modules/fazendinha/`](packages/events/src/modules/fazendinha/)
> - Farmer data schema: [`packages/events/src/types/database.ts`](packages/events/src/types/database.ts)

---

## 1. High-Level Overview

Fazendinha is a farming mini-game inside MenheraBot. A player (a "farmer") plants seeds into fields, waits for them to grow, harvests them into a **silo**, and then uses the harvested plants to:

- **Sell** them for `estrelinhas` (the bot's currency) via the shop.
- **Fulfill daily deliveries** for rewards.
- **Sell / buy** at the neighborhood **fair**.
- **Trade** via fair orders (trade requests).
- **Compost** them into fertilizer.
- **Unlock new fields** and **upgrade the silo**.

The economy revolves around **plant quality**, **seasons**, **weight (kg)**, and **fertilizer**.

The whole UI is built with Discord **Components V2** (containers, sections, text displays, buttons, select menus, modals), not classic embeds.

---

## 2. The `/fazendinha` (`/farm`) Command

All localizations exist in `pt-BR` (default) and `en-US`. The command is registered under the category `fazendinha`.

### Subcommands & Subcommand Groups

| Invocation                                      | Type             | Purpose                                                  |
| ----------------------------------------------- | ---------------- | -------------------------------------------------------- |
| `/fazendinha tutorial`                          | SubCommand       | Interactive step-by-step tutorial                        |
| `/fazendinha plantações` (`plantations`)        | SubCommand       | Manage fields: plant, harvest, collect                   |
| `/fazendinha silo`                              | SubCommand       | View a farm silo (own or another's)                      |
| `/fazendinha composteira` (`composter`)         | SubCommand       | Turn organic matter into fertilizer                      |
| `/fazendinha entregas` (`deliveries`)           | SubCommand       | View/complete daily deliveries                           |
| `/fazendinha administrar` (`manage`)            | SubCommand       | Manage the whole farm (silo upgrade, fields, fertilizer) |
| `/fazendinha feira anunciar` (`fair advertise`) | Group→SubCommand | Advertise a product for sale at the fair                 |
| `/fazendinha feira trocas` (`fair trades`)      | Group→SubCommand | View/create trade orders                                 |
| `/fazendinha feira comprar` (`fair buy`)        | Group→SubCommand | Buy items from the fair                                  |
| `/fazendinha feira administrar` (`fair manage`) | Group→SubCommand | Manage your own fair listings                            |

### Options per Subcommand

**`silo`**
- `fazendeiro` (`farmer`) — User, optional. Whose silo to view (defaults to self).

**`entregas`**
- `user` — User, optional. Whose deliveries to view (read-only for other users).

**`feira anunciar`**
- `produto` (`product`) — Integer, **required**, autocomplete. The plant to sell.
- `quantidade` (`amount`) — Number, **required**, min 1, max 10. Weight (kg) to sell.
- `qualidade` (`quality`) — Integer, **required**. Choices: `Planta Prêmium 🔹` = 2 (Best), `Planta` = 1 (Normal), `Planta Precária 🔻` = 0 (Worst).
- `preço` (`price`) — Integer, **required**, autocomplete. Asking price in estrelinhas.

**`feira trocas`**
- `vizinho` (`neighbor`) — User, optional. Whose trade orders to view.
- `página` (`page`) — Integer, optional, min 1, max 100. Page of orders.

**`feira comprar`**
- `item` — String, optional, autocomplete. Specific item to buy directly.
- `vizinho` (`neighbor`) — User, optional. View a specific neighbor's listings.

**`feira administrar`** — no options.

### Author data used
The command loads `selectedColor` (used everywhere as the accent color for containers).

---

## 3. Farmer Data Model (`DatabaseFarmerSchema`)

```ts
{
  id: string;                 // Discord user id
  plantations: Plantation[];  // The fields (1–5). Each is EmptyField or PlantedField.
  seeds: QuantitativeSeed[];  // { plant, amount, quality? } — seeds owned
  silo: QuantitativePlant[];  // { plant, weight, quality? } — harvested plants (in kg)
  items: QuantitativeItem[];  // { id, amount } — currently only Fertilizer
  siloUpgrades: number;       // # of silo upgrades bought (0–23)
  experience: number;         // farm XP (gained via deliveries)
  lastPlantedSeed: AvailablePlants; // remembered for convenience
  dailies: DeliveryMission[]; // today's 6 delivery missions
  dailyDayId: number;         // day-of-month the dailies were generated for
  composter: number;          // composter fill value (0–500)
}
```

**Field types**
- `EmptyField`: `{ isPlanted: false, upgrades? }`
- `PlantedField`: `{ isPlanted: true, harvestAt, plantedSeason, plantType, weight?, upgrades? }`
- `FieldUpgrade` (currently only Fertilizer): `{ id, expiresAt }`

**Season data (global, shared across all farmers)**: `{ currentSeason, endsAt }`.

---

## 4. Plants

There are **25 plants** (`AvailablePlants` enum, ids 0–24). Each plant has: minutes to harvest, minutes to rot, emoji, sell value, buy value (seed price), best season, worst season, and a category.

> In **dev environment**, `minutesToHarvest`/`minutesToRot` for Mate & Mushroom rot are replaced by `0.1` to make testing fast (`replaceDevTime`). Values below are the **production** values.

| id  | Plant       | Emoji | Harvest (min) | Rot (min) | Sell | Seed Buy   | Best Season | Worst Season | Category    |
| --- | ----------- | ----- | ------------- | --------- | ---- | ---------- | ----------- | ------------ | ----------- |
| 0   | Mate        | 🌿     | 15            | 60        | 110  | 0 (∞ free) | Winter      | Spring       | Special     |
| 1   | Rice        | 🌾     | 30            | 60        | 133  | 42         | Summer      | Autumn       | Grain       |
| 2   | Corn        | 🌽     | 30            | 80        | 150  | 50         | Summer      | Winter       | Grain       |
| 3   | Potato      | 🥔     | 45            | 40        | 193  | 70         | Autumn      | Summer       | Root        |
| 4   | Garlic      | 🧄     | 45            | 30        | 231  | 90         | Winter      | Spring       | Root        |
| 5   | Carrot      | 🥕     | 45            | 30        | 271  | 100        | Spring      | Summer       | Root        |
| 6   | Beans       | 🫘     | 60            | 45        | 357  | 110        | Spring      | Winter       | Grain       |
| 7   | Cucumber    | 🥒     | 60            | 45        | 385  | 120        | Summer      | Winter       | Vegetable   |
| 8   | Broccoli    | 🥦     | 75            | 45        | 442  | 130        | Winter      | Summer       | Vegetable   |
| 9   | Sunflower   | 🌻     | 75            | 70        | 421  | 140        | Spring      | Autumn       | Special     |
| 10  | Mint        | 🍃     | 80            | 30        | 558  | 150        | Spring      | Autumn       | Special     |
| 11  | Lemon       | 🍋     | 100           | 30        | 714  | 170        | Summer      | Winter       | CommonFruit |
| 12  | Strawberry  | 🍓     | 110           | 30        | 2714 | 1206       | Spring      | Autumn       | CommonFruit |
| 13  | HotPepper   | 🌶     | 100           | 50        | 1071 | 264        | Spring      | Winter       | Vegetable   |
| 14  | Eggplant    | 🍆     | 80            | 60        | 1571 | 485        | Summer      | Spring       | Vegetable   |
| 15  | Avocado     | 🥑     | 85            | 20        | 1791 | 604        | Summer      | Winter       | CommonFruit |
| 16  | Mango       | 🥭     | 90            | 50        | 2000 | 942        | Autumn      | Winter       | NobleFruit  |
| 17  | Apple       | 🍎     | 100           | 40        | 885  | 190        | Autumn      | Spring       | CommonFruit |
| 18  | Blueberries | 🫐     | 130           | 10        | 3000 | 1616       | Spring      | Winter       | NobleFruit  |
| 19  | Cabbage     | 🥬     | 150           | 60        | 3285 | 1851       | Winter      | Spring       | Vegetable   |
| 20  | Onion       | 🧅     | 160           | 70        | 3714 | 2318       | Summer      | Autumn       | Root        |
| 21  | Pineapple   | 🍍     | 170           | 30        | 4714 | 2604       | Summer      | Spring       | NobleFruit  |
| 22  | Peach       | 🍑     | 180           | 45        | 5571 | 3108       | Summer      | Autumn       | CommonFruit |
| 23  | Cherry      | 🍒     | 200           | 45        | 6428 | 3318       | Autumn      | Winter       | NobleFruit  |
| 24  | Mushroom    | 🍄     | 220           | 2         | 8175 | 3689       | Winter      | Summer       | Special     |

> ⚠️ Note the enum ordering (id) does **not** match the price ordering exactly — e.g. Strawberry (12) is much more valuable than HotPepper/Eggplant/etc. that come after it. Delivery reward & composter formulas use the raw `id`, so this ordering matters for balance.

**Categories** (`PlantCategories`): Grain, Root, Vegetable, CommonFruit, NobleFruit, Special. Each category has a representative emoji (Rice/Potato/Broccoli/Strawberry/Pineapple/Mushroom). Categories are used in the shop seed-buying flow (tutorial references it).

**Mate** is the special "free" starter plant: seed buy value 0, shows with ∞ amount, cannot be sold at the fair, cannot be composted/discarded as a seed, and is always available to plant.

---

## 5. Seasons

Seasons (`Seasons`): Summer ☀️, Winter ❄️, Autumn 🍁, Spring 🍃 (emoji in plantations screen uses 🍃 for Spring, ❄️ Winter, 🍁 Autumn, ☀️ Summer).

- The current season is **global** and rotates in a fixed cycle: `Autumn → Winter → Spring → Summer → Autumn`.
- Each season lasts a **random 3–8 days** (`MIN_DAYS=3`, `MAX_DAYS=8`).
- When the season expires, the next one is computed and stored (`getSeasonalInfo`). Default fallback season is Summer.
- The plantations screen shows the current season and when it ends (`endsAt`).

### Seasonal effects

**Harvest time** (`getHarvestTime`):
- Best season: harvest time reduced by **25%** (`SEASONAL_HARVEST_BUFF`).
- Worst season: harvest time increased by **35%** (`SEASONAL_HARVEST_DEBUFF`).
- (Fertilizer also reduces harvest time by 15% — see §7.)

**Rot time** (`getPlantationState`): if the plant was **planted in its worst season**, its rot window is shortened by **50%** (`SEASONAL_ROT_DEBUFF`) — it rots twice as fast.

**Weight** (`getFieldWeight`, see §6): best season raises max weight, worst season lowers min weight.

**Quality** (`getCalculatedFieldQuality`, see §6): planting/harvesting in good vs. bad season shifts the quality score.

---

## 6. Plantations — `/fazendinha plantações`

The core loop. Displays each field as a section with a state, a timer, and an action button, plus a seed selector and "plant all / harvest all" controls.

### Field States (`PlantationState`)

| State   | Icon        | Button label | Button style     | Meaning                                              |
| ------- | ----------- | ------------ | ---------------- | ---------------------------------------------------- |
| Empty   | 🟫           | Plant        | Primary (blue)   | Nothing planted                                      |
| Growing | 🌱           | Discard      | Danger (red)     | Still maturing (`now < harvestAt`)                   |
| Mature  | plant emoji | Harvest      | Success (green)  | Ready to harvest                                     |
| Rotten  | 🍂           | Collect      | Secondary (grey) | Past rot window; yields no plant but feeds composter |

Each field tile shows the field index, any active upgrade emojis in the title, the state text, and a relative + absolute timestamp for the next transition.

### Seed selection
- A select menu lists all seeds the player owns with `amount > 0` (Mate always present with ∞), each showing amount and a season hint (`season-boost-true/false`) if the current season is that plant's best/worst.
- Changing the selection re-renders (`changeSelectedSeed`).
- The default selected seed on open is the `lastPlantedSeed` (if still in stock), else Mate.

### Actions

**Plant** (empty field): consumes 1 seed of the selected type (Mate is free/infinite). Computes `harvestAt`, random `weight`, `plantedSeason`, and carries over field upgrades. Persists via `executePlant`.

**Harvest** (mature field): adds the plant (weight + quality) to the silo, records a transaction, triggers harvest dailies. Respects silo limits (see below).

**Collect** (rotten field): yields **no** plant into the silo but adds to the **composter** (`composterEquivalentForField` with `Rotten` bonus). Field becomes empty.

**Discard** (growing field): destroying an immature plant. Requires a confirmation — clicking the button first shows an ephemeral "immature warning"; a second confirmed press (`force = 'Y'`) actually clears the field with no yield.

**Plant All** — plants the selected seed into every empty field (as many as seeds allow).

**Harvest All** — harvests/collects every mature or rotten field, respecting silo limit; batches transactions and dailies. Shows a summary of harvested kg by quality.

### Weight generation (`getFieldWeight`)
Base range `[0.7, 1.3]` kg (`BASE_MIN_VALUE`, `BASE_MAX_VALUE`), then:
- Best season: max **+0.3** (`BEST_SEASON_BUFF`).
- Worst season: min **−0.2** (`WORST_SEASON_DEBUFF`).
- Fertilizer: max **+0.4** (`FERTILIZER_MAX_BUFF`), min **+0.2** (`FERTILIZER_MIN_BUFF`).

Final weight = random within `[min, max]`, 1 decimal. (Throws if min goes negative — safety check.)

### Quality calculation (`getCalculatedFieldQuality`)
Quality (`PlantQuality`: Worst=0, Normal=1, Best=2) is computed at **harvest** time from a score:

| Factor                                                              | Score |
| ------------------------------------------------------------------- | ----- |
| Planted in **good** (best) season                                   | +20   |
| Planted in **bad** (worst) season                                   | −25   |
| **Current** season is good                                          | +5    |
| **Current** season is bad                                           | −8    |
| Field has fertilizer                                                | +15   |
| **Fast harvested** (within first 20% of the mature window)          | +17   |
| **Almost rotted** (within last 40% of the mature window before rot) | −22   |
| Random jitter                                                       | ±6    |

Score clamped to `[-100, 100]`. Then: `>= 35 → Best`, `>= 5 → Normal`, else `Worst`.

### Silo-full handling
When harvesting would exceed the silo limit, the harvest is **partially trimmed** to fit (`field.weight` reduced to remaining space). If there's zero space, an error ("silo is full") is shown and the plant stays. Harvest-all skips fields that don't fit.

---

## 7. Fertilizer & Items

The only item currently is **Fertilizer** (`AvailableItems.Fertilizer`, emoji custom). Duration: **6 hours** (`hoursToMillis(6)`).

**Effects when applied to a field** (buff active while `expiresAt > now`):
- **−15%** harvest time (`FERTILIZER_HARVERST_BUFF`).
- **+0.4 max / +0.2 min** weight.
- **+15** to the quality score.

**Applying fertilizer** (via `/fazendinha administrar`, see §11):
- Applied per-field or to all fields at once.
- Re-applying refreshes `expiresAt`.
- A field's "use item" button is disabled if the current fertilizer was applied less than 1 hour ago (i.e., still fresh — prevents wasteful reapply within the first hour).

**Getting fertilizer**: from the **composter**, from **fair trade orders** as awards, or (hinted) via voting for the bot (help panel links to top.gg vote).

---

## 8. Silo — `/fazendinha silo`

The silo holds harvested plants (by weight/quality), seeds, and items. It's the shared storage whose capacity is the main progression bottleneck.

### Capacity (`getSiloLimits`)
- **Used** = sum of all silo plant weights + all seed amounts + all item amounts (things with `> 0`).
- **Limit** = `INITIAL_LIMIT_FOR_SILO (35) + SILO_LIMIT_INCREASE_BY_LEVEL (5) × siloUpgrades`.
- Max upgrades: **23** → max limit = `35 + 5×23 = 150`.

### Display
- Shows plants grouped by type, each quality with its weight in kg and a quality emoji.
- Shows seeds (with amounts) and items.
- Footer shows `used / limit`.
- Viewing **your own** silo: buttons to **Sell plants** (opens sell flow), **Discard seeds**, **Use items** are enabled.
- Viewing **someone else's** silo (`fazendeiro` option): read-only — sell/discard/use disabled.

### Selling plants (`buildSellPlantsMessage` / `handleButtonAction`)
Selling routes into the shop's `sellPlants` module. Flow:
1. Choose a **quality** filter (select menu of available qualities).
2. Choose which plant(s) to sell (up to 5) or "Sell all plants of this quality".
3. A **modal** asks for the kg amount per selected plant (max = owned weight).
4. Or **Sell all** (whole silo) with a confirmation step.
- Sell price is per `getPlantPrice` (see §12).

### Discarding seeds (`manageSilo.ts`)
- Select up to 5 seed types to discard (Mate excluded).
- A modal collects the amount per seed (validated: must be a positive number ≤ owned).
- **Discard all** removes every seed (with a confirm step).
- Removing seeds frees silo space.

---

## 9. Composter — `/fazendinha composteira`

Turns plants (and rotten harvests) into fertilizer.

### Constants
- `COMPOSTER_MULTIPLIER = 100` → 100 composter points = 1 fertilizer.
- `MAX_COMPOSTER_VALUE = 500` → composter caps at 500 points (max 5 fertilizer stored as potential).

### Filling the composter
- **Collecting rotten fields** automatically adds composter value (with a rot bonus).
- **Manually adding plants** from the silo via the composter UI.

**Value formula (`composterEquivalentForField`)**:
- Growing state → 0.
- `value = 2 + plant_id + quality`, `baseAmount = value × weight`.
- Mature/manual add → `floor(baseAmount)`.
- Rotten → `floor(baseAmount + 15 + (quality+1) × 7)` (rot bonus).

> Because `plant_id` is part of the value, higher-id plants give more composter — again, id ordering matters.

### UI
- Progress bar (23-char) showing fill % toward the next fertilizer (capped display at `COMPOSTER_MULTIPLIER`).
- **Add plants** button: opens a quality→plant→modal(weight) flow to feed the composter. Disabled if no plants or composter already ≥ 100.
- **Get fertilizer** button: converts composter points into fertilizer items. Disabled if composter < 100 **or** silo has no room. Yield = `min(availableSiloSpace, floor(composter / 100))`; deducts the spent points.

---

## 10. Daily Deliveries — `/fazendinha entregas`

Daily missions that consume silo plants for `estrelinhas` + XP.

### Constants
- `DELIVERIES_AMOUNT = 6` missions per day.
- `MAX_DELIVERY_WEIGHT = 9`, `MIN_DELIVERY_WEIGHT = 5` (each mission needs 5–9 kg of a plant).
- `FINISH_ALL_DELIVERIES_BONUS = 30_000` estrelinhas for completing all 6.

### Generation (`calculateUserDailyDeliveries`)
For each of the 6 missions:
- Random plant (id 0–24), random needed weight (5–9 kg).
- Random quality: rolled 1–10 → `>=4` Normal, `>=2` Best, else Worst. (So ~70% Normal, ~20% Best, ~10% Worst.)
- `maxAward = (plant_id+1) × weight × 30 + 10 × plant.sellValue`; actual award random in `[0.7×max, max]`.
- `experience = floor((plant_id+1) × 10 + weight × 50)`.
- Duplicate (same plant + same quality) missions are re-rolled.
- Regenerated when `dailyDayId` no longer matches today's date.

### Completion (`executeButtonPressed`)
- Delivery is **quality-agnostic** for *matching* what you have (`ignorePlantQuality`) — any quality of the right plant counts toward the need.
- But the **actual quality delivered** determines a bonus: if all delivered plants share one quality → Best **+20%**, Normal **+10%**, Worst **+0%**. Mixed qualities → no bonus.
- Removes plants from silo (prefers highest quality/weight first, `removePlantsIgnoringQuality`), pays stars + XP, marks mission finished.
- Completing **all 6** grants the extra 30,000 bonus.
- Viewing another user's deliveries is read-only (no deliver buttons).

---

## 11. Farm Administration — `/fazendinha administrar`

Two containers: **Silo management** and **Fields management**. Also links to fair management.

### Silo upgrade
- Cost = `50_000 + siloUpgrades × 15_000` estrelinhas.
- Each upgrade adds +5 to silo limit. Max 23 upgrades.
- Errors if at max level or not enough stars.

### Fields management
- **Use item / Apply fertilizer**: per field or "apply to all" (needs enough items for every field). "Apply to all" has a confirm step if a field already has the buff.
- Each field shows its current upgrades and expiry (or "no upgrades").
- **Buy/unlock next field** (see §13).
- **Help** button explains items; if the player's vote cooldown is up, offers a top.gg vote link + shortcut to composter.

### Navigation
- Buttons to jump to **fair management** (`ADMIN_FAIR`) and back to **fields** (`ADMIN_FIELDS`).

---

## 12. The Fair (Feira)

The fair is the player-to-player marketplace. It has two distinct systems: **Announcements** (fixed-price sales) and **Orders / Trade Requests** (wanted-ads with custom rewards).

### Fair constants
| Constant                              | Value         | Meaning                                 |
| ------------------------------------- | ------------- | --------------------------------------- |
| `MAX_ITEMS_IN_FAIR_PER_USER`          | 6             | Max simultaneous announcements per user |
| `MAX_ITEMS_PER_FAIR_PAGE`             | 20            | Announcements shown per fair page       |
| `MAXIMUM_PRICE_TO_SELL_IN_FAIR`       | 1.5           | Max price = 150% of base value          |
| `MINIMUM_PRICE_TO_SELL_IN_FAIR`       | 0.65          | Min price = 65% of base value           |
| `MAX_TRADE_REQUESTS_IN_FAIR_PER_USER` | 3             | Max active orders per user              |
| `MAX_FAIR_ORDERS_PER_PAGE`            | 15 (1 in dev) | Orders per page                         |
| `MAX_STARS_AWARD_IN_FAIR_ORDER`       | 99,999        | Max star reward in an order             |
| `MAX_ITEMS_AWARD_IN_FAIR_ORDER`       | 9             | Max fertilizer reward in an order       |
| `MAX_WEIGHT_IN_FAIR_ORDER`            | 9.9           | Max plant weight requested in an order  |

### Plant price & quality multiplier (`getPlantPrice`)
- `QUALITY_PRICE_MULTIPLIER = 30%`. Best = **+30%**, Normal = base, Worst = **−30%** of `sellValue`.
- `price = floor(sellValue + sellValue × qualityBonus)`.

### 12a. Announcements — `/fazendinha feira anunciar` (advertise)
Sell a specific plant at a fixed price.
- Player picks product, amount (1–10 kg), quality, and price.
- Price must be within `[base×0.65, base×1.5]` where `base = getPlantPrice(plant,quality) × amount`. The `preço` autocomplete suggests the max, base, and min prices.
- Cannot announce **Mate**.
- Must actually own the plants (`checkNeededPlants`).
- Cannot announce a duplicate (same plant + quality already listed).
- Max 6 announcements.
- On success: plant is removed from silo, listing is created with localized names (`[username] {qualityEmoji} {kg} Kg {plant} {price}⭐`), triggers `announceProduct` daily.

### 12b. Buying — `/fazendinha feira comprar` (buy)
Browse & buy announcements.
- With no args → paginated fair (20/page), each entry shows kg, quality emoji, plant, price, and seller.
- `item` option (autocomplete) → buy directly by id.
- `vizinho` option → view a specific neighbor's listings (no pagination).
- Buy validation: item exists, not your own, silo has room for the weight, enough stars.
- On buy: stars transfer seller↔buyer, listing deleted, plant added to buyer's silo, seller gets a **notification**.

### 12c. Fair Management — `/fazendinha feira administrar` (manage)
Manage your own listings (`executeAdministrateFair`).
- Toggle between **Edit** and **Remove** modes.
- **Edit**: opens a modal to change the price (revalidated against the min/max range; regenerates localized names).
- **Remove**: deletes the announcement. (Note: the plant is **not** returned to the silo on delete — deleting simply removes the listing.)
- Navigation button back to field management.

### 12d. Trade Orders / Requests — `/fazendinha feira trocas` (trades)
"Wanted ads": a player requests a plant and offers a reward (stars, fertilizer, and/or plants).

**Order schema (`DatabaseFeirinhaOrderSchema`)**: `{ userId, plant, quality, weight, awards, createdAt, completed, trollAward? }`.
**Awards (`OrderAward`)**: any of `{ estrelinhas?, fertilizers?, plants? }`.

**Creating an order (`createFairOrder.ts`)**:
- Requires the user to have either stars or fertilizer to offer.
- Step 1 — define the **request** (modal): plant (select), quality (select), weight (text, max 9.9 kg).
- Step 2 — define the **awards** (modal): estrelinhas (up to `min(99999, ownedStars)`) and/or fertilizers (up to 9). Plant awards also supported in the schema.
- Step 3 — **Place order**. Re-validates: has all required fields, at least one award, enough stars/fertilizer/plants to cover the offer. Deducts the offered stars/items/plants up front and stores the order.
- Max 3 active orders per user.
- Placing an order triggers the `tradeRequest` daily.

**Troll detection (`isTradeTroll`)**: an order is flagged `trollAward` if its rewards are unreasonably low relative to the request. Specifically, it's a troll if the estrelinhas reward is below `getPlantPrice(plant,quality) × weight` **and** at least two of {low stars, low fertilizer (≤2), low plant} conditions hold. Public order listing has a **"hide/show troll"** toggle (`ignoreTroll`) to filter these out.

**Fulfilling an order (`handleTakeOrder`)**: another player who has the requested plants selects the order; their plants are removed and transferred to the order owner, and they receive the awards (stars added, fertilizer added to items — needs silo room). Order is marked `completed`; the owner gets a **notification**.

**Order owner side (`displayFairOrders`)**:
- Sees own orders with **Delete** (with confirm) — deleting refunds the offered estrelinhas.
- A **completed** order shows a **Claim** button — claiming adds the received plants to the owner's silo (needs room).
- Public orders view supports **plant filtering** (multi-select up to 10 plants), pagination, and the troll toggle.

---

## 13. Unlocking Fields

Players start with fields and can unlock up to `MAX_FIELDS_AVAILABLE = 5` total. Each unlock costs estrelinhas **and** specific plants from the silo.

| Field # | Cost (⭐) | Required plants                                                                      |
| ------- | -------- | ------------------------------------------------------------------------------------ |
| 1       | 50,000   | 5kg Mate, 3kg Sunflower, 2kg Beans, 10kg Garlic                                      |
| 2       | 100,000  | 10kg Mate, 5kg Potato, 3kg Apple, 4kg Mango, 6kg Pineapple                           |
| 3       | 250,000  | 5kg Broccoli (Normal), 4kg Blueberries (Best), 10kg Beans (Best), 6kg Onion (Normal) |
| 4       | 500,000  | 6kg each Mate/Mushroom/Mint/Sunflower — all **Best** quality                         |

- `checkNeededPlants` verifies the silo has the required plants (respecting quality where specified).
- On unlock: stars + plants are consumed, the new field is added.

---

## 14. Tutorial — `/fazendinha tutorial`

A scripted 15-step walkthrough (`FarmTutorialStep` enum) that mocks each screen with fake data (no real state is changed until the end). Steps:

0. **Start** – intro + start button.
1. **FirstPlantation** – plant your first (Mate) seed.
2. **RottedPlants** – learn about rotting.
3. **Composter** – learn composting → get fertilizer.
4. **BuySeed** – buy seeds (routes through shop's `buySeeds`, category select). Warns if the chosen seed's best season ≠ tutorial season (Spring). Default tutorial plant: Blueberries.
5. **DisplaySilo** – view the silo.
6. **AdminFarm** – upgrade silo + apply fertilizer (tracks `siloUpgraded`/`itemApplied`).
7. **PlantUpgraded** – plant a fertilized field.
8. **HarvestQuality** – harvest & learn quality.
9. **CheckDeliveries** – view deliveries.
10. **TradePlants** – view fair trade orders.
11. **BuyProduct** – buy from the fair.
12. **FinishDelivery** – complete a delivery.
13. **SellPlants** – sell plants (routes through shop's `sellPlants`).
14. **End** – completion.

**Reward**: finishing grants a **title** (`TUTORIAL_TITLE_ID` = 33 prod / 2 dev) if not already owned, plus a notification ("lux gave title"). The end screen offers **Restart** and **Close**.

Tutorial season is fixed to **Spring**. Every step uses `customId` handler group `12` with a `STEP` action; category/seed selection uses `CHANGE_CATEGORY` / `BUY_SEED` / `JUMP` actions.

---

## 15. Component Interaction Handlers (customId routing)

The command registers these `commandRelatedExecutions`. Each uses a numeric handler group id (first arg of `createCustomId`):

| Group id | Handler                          | Feature                                                                                            |
| -------- | -------------------------------- | -------------------------------------------------------------------------------------------------- |
| 0        | `executeFieldAction`             | Plant/harvest/collect/discard a field, plant-all, harvest-all                                      |
| 1        | `changeSelectedSeed`             | Change selected seed (plantations select menu)                                                     |
| 3        | `handleAdministrativeComponents` | Use item, apply-to-all, unlock field, show help, admin                                             |
| 4        | `executeButtonPressed`           | Complete a daily delivery                                                                          |
| 5        | `handleManageFarm`               | Navigate admin (fields/fair), upgrade silo                                                         |
| 6        | `handleDissmissShop`             | Edit/delete own fair announcements + price modal                                                   |
| 7        | `executeButtonAction`            | Fair buy / pagination                                                                              |
| 8        | `handleButtonAction`             | Silo sell-plants flow (display, set quality, modal, sell all, sell)                                |
| 9        | `handleFairOrderButton`          | All fair-order actions (filter, public, delete, claim, request, award, place, page, agreed, modal) |
| 10       | `handleComposterInteractions`    | Composter add-plants / get-fertilizer / quality / modal                                            |
| 11       | `handleDiscardSeeds`             | Discard seeds flow                                                                                 |
| 12       | `handleTutorialComponents`       | Tutorial step navigation                                                                           |

Autocomplete handlers (not in the list above but part of the command): `announceAutocomplete` (produto/preço), `listItemAutocomplete` (buy item).

---

## 16. Currency, Transactions & External Effects

- **Currency**: `estrelinhas` (stars), managed via `starsRepository`.
- Every economic action posts a **statistics transaction** (`postTransaction` / `postMultipleTransactions`) with an `ApiTransactionReason`: `HARVEST_FARM`, `DAILY_FARM`, `FAIR`, `UPGRADE_FARM`, `FARM_COMPOSTER`.
- Plant currency types are encoded as `plant-{plantId}-{quality}` for the stats API.
- **Dailies system** (`executeDailies`): farm actions feed the broader daily-quest system — `harvestDailies`, `finishDelivery`, `announceProduct`, `tradeRequest`.
- **Notifications** (`notificationRepository`): sent to sellers when items are bought, to order owners when trades are accepted, and to the user when the tutorial grants a title.

---

## 17. Repositories Used

- `farmerRepository` — the farm state (plant, harvest, silo, deliveries, upgrades, seasons, composter).
- `userRepository` — user data (`estrelinhas`, `selectedColor`, `voteCooldown`, `titles`).
- `starsRepository` — add/remove stars.
- `fairRepository` — fair announcements (create, price update, delete, list, names, counts).
- `fairOrderRepository` — trade orders (place, get, list public/user, count, complete, delete).
- `cacheRepository` — resolve Discord users for display.
- `giveRepository` / `notificationRepository` — tutorial title reward + notifications.
- `commandRepository` — resolve command mention ids for the tutorial.

---

## 18. Key Balancing Numbers (Quick Reference)

- Silo: start **35 kg**, +5/upgrade, 23 upgrades max → **150 kg** cap. Upgrade cost `50k + 15k×level`.
- Fields: up to **5**; unlock costs 50k / 100k / 250k / 500k stars + plants.
- Fertilizer: **6h** duration; harvest −15%, weight +0.2/+0.4, quality +15.
- Seasons: **3–8 days** each; harvest −25%/+35%, rot −50% (worst), weight ±season buffs.
- Quality thresholds: score `≥35` Best, `≥5` Normal, else Worst.
- Base weight per harvest: **0.7–1.3 kg** (before buffs).
- Deliveries: **6/day**, 5–9 kg each, all-complete bonus **30,000**; quality bonus +20%/+10%/0%.
- Composter: **100 points = 1 fertilizer**, cap **500**; value `2 + plantId + quality` per kg (+rot bonus).
- Fair announcements: **6 max**, price **65%–150%** of base.
- Fair orders: **3 max**, weight ≤ **9.9 kg**, stars ≤ **99,999**, fertilizer ≤ **9**.
- Quality price multiplier: **±30%**.

---

## 19. Known Quirks / Notes for Future Work

- **Plant id ordering ≠ value ordering** (Strawberry id 12 is worth far more than several higher-id plants). Delivery reward, composter value, and troll-detection formulas all key off raw `id`, so inserting/reordering plants changes balance in non-obvious ways.
- Deleting a fair **announcement** does not refund the plant to the silo (whereas deleting a **trade order** refunds offered stars).
- `Rice.minutesToRot` is hardcoded `60` (not wrapped in `replaceDevTime`), unlike other rot times — minor inconsistency.
- There's a leftover `console.log` in `handleFairOrderButton` ([`fairOrders.ts:277`](packages/events/src/modules/fazendinha/fairOrders.ts#L277)).
- A `TODO(ysnoopyDogy)` in [`administrateFarm.ts`](packages/events/src/modules/fazendinha/administrateFarm.ts) notes the upgrade-display list will need rework when new upgrade types are added.
- Everything is **Components V2** — new UI must follow the `createContainer/createSection/...` helpers and `makeLayoutMessage`.
- Dev environment shortcuts times (`replaceDevTime` → 0.1 min) and reduces page sizes (`MAX_FAIR_ORDERS_PER_PAGE = 1`).
