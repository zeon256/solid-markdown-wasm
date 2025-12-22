# Simlimprice.com: A Price Comparison Platform for Singapore Computer Parts 🇸🇬

It's currently challenging to find a centralized price comparison tool for computer parts specifically within Singapore's Sim Lim Square. Many individuals resort to downloading PDF price lists or visiting stores in person to inquire about prices. 😩

This initiative proposes the development of a price comparison tool designed to parse price lists (potentially utilizing Deepseek OCR or classic PDF parsing techniques) and offer a single platform for users to search and identify the best prices available. 🚀

This is a novel concept, as there isn't a readily available solution addressing this need, especially considering Singapore's tech-savvy population and abundance of computer science graduates. 💡

## Technical Approach 💻 

Our plan is to maintain a **super simple** architecture:

*   **Database:** We will utilize **LibSQL** as our database.
*   **Data Ingestion:** Prices will be downloaded and parsed nightly, then inserted into the database.
*   **Local-First Architecture:** Initially, we aim for a local-first approach, potentially using **WASM Turso**. This allows direct connection to a remote read-only replica.
    *   *SEO Consideration:* The impact on SEO with this architecture is being considered. Server-side rendering (SSR) might be necessary, but this is a secondary concern for now. 🤔

## Monetization Strategy 💰

Our proposed monetization strategies include:

*   **Affiliate Marketing:** Partnering with retailers and earning commissions on sales generated through our platform.
*   **Google Ads:** Displaying targeted advertisements on the website.
*   **Shareable Part Lists:** Implementing a "share" button allowing users to create and share their custom computer part lists. This can also contribute to SEO efforts by generating user-created content. 📝

## Additional Revenue Streams & Considerations 📈

We are exploring other avenues for revenue generation:

*   **Price Alerts:** While a valuable feature, implementing real-time alerts would necessitate a departure from our current local-first architecture, potentially requiring a more robust backend infrastructure. This is a trade-off to consider carefully. 🔔

# Technical Details

## Prompt 

## Stage 0: Partition

Partition using classic PDF techniques and export each one.

## Stage 1: Routing 

Use the following prompt to decide the section.

```markdown
You are an expert PC hardware category classifier for Singapore/Malaysia PC shops (Sim Lim Square style).

## YOUR JOB:
Given a **single extracted PDF section/box**, classify it into **EXACTLY ONE** PC hardware category.

## Input Format:
You will receive text from ONE PDF section/box containing:
- Product name(s)
- Price(s) 
- Specifications
- Possibly brand names

## Available Categories (CHOOSE EXACTLY ONE):

CPU - Intel/AMD processors (i3/i5/i7/i9, Ryzen 3/5/7/9)
GPU - Graphics cards (RTX 30/40, RX 6000/7000, GTX)
Motherboard - Motherboards (B550, Z790, X670, etc.)
RAM - Memory modules (DDR4/DDR5, 16GB/32GB, 3200/6000MHz)
SSD - Solid State Drives (NVMe M.2, SATA, 512GB/1TB/2TB)
HDD - Hard Disk Drives (1TB/2TB/4TB, 7200RPM)
PSU - Power Supplies (650W/850W, 80+ Gold/Bronze)
Cooler - CPU Coolers (Air coolers, AIO liquid, 240mm/360mm)
Case - PC Cases (ATX/Mini-ITX, tempered glass)
Monitor - Computer Monitors (24"/27"/32", 144Hz/165Hz, IPS/VA)
Keyboard - Keyboards (mechanical, wireless, RGB)
Mouse - Computer Mice (gaming, wireless, 16000 DPI)
KeyboardMouseCombo - Keyboard + Mouse bundles
CPUMotherboardCombo - CPU + Motherboard bundle deals

## Classification Rules:

1. **MATCH THE PRIMARY PRODUCT** in the section
2. **LOOK FOR KEYWORDS** (examples below)
3. **PRIORITIZE SPECIFIC CATEGORIES** over generic ones
4. **Output ONLY ONE category** - no "multiple" or "unclear"

## Keyword Detection Guide:

| Category | Key Detection Words |
|----------|-------------------|
| **CPU** | Intel i3/i5/i7/i9, AMD Ryzen, Core i5, R5 5600X, LGA1700 |
| **GPU** | RTX 3060/4070/4080, RX 6700/7800, GeForce, Radeon |
| **Motherboard** | B550, Z790, X670, ATX, mATX, DDR4/DDR5 |
| **RAM** | DDR4, DDR5, 3200MHz, 6000MHz, 16GB, 32GB, CL16 |
| **SSD** | NVMe, M.2, PCIe 4.0, 1TB SSD, Samsung 990 |
| **HDD** | 7200RPM, 2TB HDD, 3.5", Seagate Barracuda |
| **PSU** | 650W, 80+ Gold, Modular, Corsair RM850x |
| **Cooler** | AIO, 240mm, 360mm, Air Cooler, Noctua NH |
| **Case** | ATX Case, Tempered Glass, NZXT H510 |
| **Monitor** | 27" IPS, 144Hz, 4K, LG UltraGear |
| **Keyboard** | Mechanical, RGB Keyboard, Keychron |
| **Mouse** | Gaming Mouse, Logitech G, 16000 DPI |
| **CPUMotherboardCombo** | i5+B660, Ryzen 5+B550, CPU+MB Bundle |

## Output Format:
**Output ONLY this exact JSON structure:**

```json
{
  "category": "EXACT_CATEGORY_NAME",
  "reasoning": "Brief explanation (1 sentence)"
}
```


```markdown
You are an expert PC hardware price extractor for Singapore PC shops (Sim Lim Square style).

## IMPORTANT: CATEGORY-SPECIFIC EXTRACTION MODE

**This prompt is for extracting ONLY ONE SPECIFIC CATEGORY at a time.** 
You will receive instructions specifying **exactly which category** to extract in each pass.

## Your Job:
Extract **ALL** individually sold PC components from **ONLY THE SPECIFIED CATEGORY** below, plus CPU+Motherboard combos when instructed.

## Categories Available for Single-Pass Extraction:

**Use ONLY the category specified in your instructions:**

## Available Categories (extract ONE at a time):
- CPU (Intel/AMD CPUs only)
- GPU (NVIDIA/AMD graphics cards only) 
- Motherboard (Motherboards only)
- RAM (DDR4/DDR5 RAM modules/kits only)
- SSD (NVMe/SATA SSDs only)
- HDD (Hard drives only)
- PSU (Power supplies only)
- Cooler (CPU coolers - Air/AIO only)
- Case (PC cases only)
- Monitor (Monitors only)
- Keyboard (Keyboards only)
- Mouse (Mice only)
- KeyboardMouseCombo (Keyboard+Mouse combos only)
- CPUMotherboardCombo (CPU + Motherboard bundles only)

## Extraction Rules:

1. **Ignore everything except the specified category**
2. **Ignore**: laptops, mini-PCs, system bundles, promotional text, shop info, warranties
3. **For CPUMotherboardCombo only**: Extract CPU+Motherboard bundles as single items
4. **Do NOT extract** other categories even if they're present in the document
5. **Ignore prices that are - or NA and don't append to the list** 

## Current Extraction Task:
**[INSTRUCTIONS: Specify the exact category here, e.g., "Extract ONLY RAM" or "Extract ONLY SSD"]**

## Output Format:

**Output ONLY a valid JSON array** matching the **EXACT** TypeScript interface for the specified category:

```typescript
// Example for RAM extraction only:
[
  {
    "name": "Corsair Vengeance RGB 32GB (2x16GB)",
    "brand": "Corsair",
    "model": "Vengeance RGB",
    "price": 499,
    "currency": "SGD"
    "category": "RAM",
    "metadata": {
      "type": "Desktop",
      "ddr": "DDR5",
      "speed_mhz": 6000,
      "capacity_mb": 32768,
      "kit": "Dual",
      "rgb": true
    }
  }
]
```

## Data format

```typescript
type Category =
  | "CPU" | "GPU" | "Motherboard" | "RAM" | "SSD" | "HDD"
  | "PSU" | "Cooler" | "Case" | "Monitor"
  | "Keyboard" | "Mouse" | "KeyboardMouseCombo"
  | "CPUMotherboardCombo";

interface BaseItem {
  name: string;
  brand: string;
  model: string;
  price: number;
  currency: "SGD" | "MYR"
  category: Category;
}

type PCItem =
  | (BaseItem & { category: "CPU"; metadata: { coreCount: number; baseClock?: number; boostClock?: number; socket: string; generation?: number; integratedGraphics?: boolean } })
  | (BaseItem & { category: "GPU"; metadata: { series: string; vram_gb: number; length_mm?: number; tdp_w?: number } })
  | (BaseItem & { category: "Motherboard"; metadata: { chipset: string; formFactor: string; socket: string; memoryType: "DDR4" | "DDR5"; memorySlots: number } })
  | (BaseItem & { category: "RAM"; metadata: { type: "Desktop" | "Laptop"; ddr: "DDR4" | "DDR5"; speed_mhz: number; capacity_mb: number; kit?: "Single" | "Dual" | "Quad"; rgb?: boolean; cl?: number; } })
  | (BaseItem & { category: "SSD"; metadata: { interface: "NVMe" | "SATA"; formFactor: string; capacity_gb: number; readSpeed_mb_s?: number; writeSpeed_mb_s?: number; gen?: "Gen3" | "Gen4" | "Gen5" } })
  | (BaseItem & { category: "HDD"; metadata: { rpm: number; cache_mb?: number; capacity_gb: number; formFactor: "2.5\"" | "3.5\"" } })
  | (BaseItem & { category: "PSU"; metadata: { wattage: number; efficiency: string; modular: "Full" | "Semi" | "Non" } })
  | (BaseItem & { category: "Cooler"; metadata: { type: "Air" | "AIO"; size_mm?: number; radiatorSize_mm?: number; socketSupport?: string; rgb?: boolean } })
  | (BaseItem & { category: "Case"; metadata: { formFactor: string; sidePanel?: "Tempered Glass" | "Solid"; rgbFansIncluded?: number } })
  | (BaseItem & { category: "Monitor"; metadata: { size_inches: number; resolution_width: number; resolution_height: number; refreshRate_hz: number; panel: "IPS" | "VA" | "TN" | "OLED"; curved?: boolean; adaptiveSync?: string } })
  | (BaseItem & { category: "Keyboard"; metadata: { switchType?: string; layout: string; connection: "Wired" | "Wireless"; rgb?: boolean; size?: "60%" | "65%" | "75%" | "TKL" | "Full" } })
  | (BaseItem & { category: "Mouse"; metadata: { dpi?: number; connection: "Wired" | "Wireless"; sensor?: string; rgb?: boolean } })
  | (BaseItem & { category: "KeyboardMouseCombo"; metadata: { connection: "Wired" | "Wireless"; rgb?: boolean } })
  | (BaseItem & { 
      category: "CPUMotherboardCombo"; 
      metadata: { 
        cpu: { brand: "Intel" | "AMD"; model: string; socket: string; generation?: number };
        motherboard: { brand: string; model: string; chipset: string; formFactor: string; memoryType: "DDR4" | "DDR5" };
        comboSaving?: number;
      }
    });
```
