import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import type { MonsterFormData, MonsterItem } from '@/types/monster-forms'
import {
  formatKeywords,
  formatMonsterRole,
  formatMonsterEV,
  formatImmunity,
  formatWeakness,
  formatMovement,
  formatCharacteristic,
  formatActionDistance,
  formatActionTargets,
  stripHTML,
  extractDescription
} from './formatters'

/**
 * Helper function to create glyph icon HTML with proper font styling
 */
function createGlyphIcon(glyphClass: string, title?: string, scale = 1): string {
  return `<span class="glyph-icon ${glyphClass}" style="
    font-family: 'DS Open Glyphs', sans-serif;
    font-style: normal;
    font-weight: normal;
    line-height: 1;
    text-rendering: auto;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    ${scale !== 1 ? `font-size: ${scale}em;` : ''}
  " ${title ? `title="${title}"` : ''}></span>`
}

/**
 * Get the appropriate tier glyph for a given tier number
 */
function getTierGlyph(tierNumber: number): string {
  switch (tierNumber) {
    case 1: return createGlyphIcon('glyph-tier-1', 'Tier 1', 1.5)
    case 2: return createGlyphIcon('glyph-tier-2', 'Tier 2', 1.5) 
    case 3: return createGlyphIcon('glyph-tier-3', 'Tier 3', 1.5)
    default: return tierNumber.toString()
  }
}

// Type alias for the PDF export function to match the expected monster data structure
type Monster = MonsterFormData

/**
 * Export monster stat block to PDF using HTML+CSS approach
 * This captures the existing styled stat block and converts it to PDF
 */
export async function exportMonsterToPDF(monster: Monster): Promise<void> {
  try {
    // Create PDF early to get page dimensions (in mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidthMm = pdf.internal.pageSize.getWidth()
    const pageHeightMm = pdf.internal.pageSize.getHeight()
    const marginMm = 10
    const footerMm = 6 // reserve space for footer branding
    const contentWidthMm = pageWidthMm - marginMm * 2
    const contentHeightMm = pageHeightMm - marginMm * 2 - footerMm

    // CSS mm to px conversion at 96 DPI: 1in = 25.4mm, 1in = 96px
    const cssPxPerMm = 96 / 25.4
    const contentWidthPx = Math.floor(contentWidthMm * cssPxPerMm)

    // Create a temporary div with the stat block HTML
    const tempDiv = document.createElement('div')
    tempDiv.style.position = 'absolute'
    tempDiv.style.top = '-9999px'
    tempDiv.style.left = '-9999px'
    // Render at the exact content width that will be placed into the PDF
    tempDiv.style.width = `${contentWidthPx}px`
    tempDiv.style.maxWidth = `${contentWidthPx}px`
    tempDiv.style.backgroundColor = 'white'
    tempDiv.style.padding = '10mm'
    tempDiv.style.boxSizing = 'border-box'
    tempDiv.style.fontFamily = 'Arial, sans-serif'
    tempDiv.style.fontSize = '12px'
    tempDiv.style.lineHeight = '1.4'
    
    // Generate the stat block HTML
    tempDiv.innerHTML = generateStatBlockHTML(monster)
    
    // Add to DOM temporarily
    document.body.appendChild(tempDiv)
    
    // Wait a moment for rendering and fonts to load
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Capture the element as canvas with proper settings
    const canvas = await html2canvas(tempDiv, {
      scale: 2, // Higher scale for sharper text
      useCORS: true,
      allowTaint: true,
      backgroundColor: 'white',
      width: tempDiv.scrollWidth,
      height: tempDiv.scrollHeight,
      windowWidth: tempDiv.scrollWidth,
      windowHeight: tempDiv.scrollHeight
    })
    
    // Remove temporary element
    document.body.removeChild(tempDiv)
    
    // Compute slice height in pixels so that when drawn at max width it fills the available content height
    const sliceHeightPx = Math.max(
      1,
      Math.floor(canvas.width * (contentHeightMm / contentWidthMm))
    )

    // Paginate by slicing the canvas vertically
    let offsetY = 0
    let pageIndex = 0
    while (offsetY < canvas.height) {
      const remaining = canvas.height - offsetY
      const currentSliceHeight = Math.min(sliceHeightPx, remaining)

      // Create a slice canvas
      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = canvas.width
      pageCanvas.height = currentSliceHeight
      const ctx = pageCanvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(
          canvas,
          0,
          offsetY,
          canvas.width,
          currentSliceHeight,
          0,
          0,
          canvas.width,
          currentSliceHeight
        )
      }

      const sliceImg = pageCanvas.toDataURL('image/png')

      // Draw slice on PDF page
      const drawWidthMm = contentWidthMm
      const drawHeightMm = (currentSliceHeight / canvas.width) * contentWidthMm
      const xMm = marginMm
      const yMm = marginMm

      if (pageIndex > 0) pdf.addPage()
      pdf.addImage(sliceImg, 'PNG', xMm, yMm, drawWidthMm, drawHeightMm, undefined, 'FAST')

      // Footer per page
      pdf.setFontSize(8)
      pdf.setTextColor(128, 128, 128)
      const footerText = 'Generated with Steel Cauldron'
      const textWidth = pdf.getTextWidth(footerText)
      pdf.text(footerText, (pageWidthMm - textWidth) / 2, pageHeightMm - 5)

      // Advance
      offsetY += currentSliceHeight
      pageIndex += 1
    }
    
    // Download the PDF
    const fileName = `${monster.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'monster'}_stat_block.pdf`
    pdf.save(fileName)
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF. Please try again.')
  }
}

/**
 * Generate HTML for the stat block matching the current MonsterStatBlock.vue structure
 * Uses the same layout and styling approach as the Vue component
 */
function generateStatBlockHTML(monster: Monster): string {
  
  return `
    <style>
      /* DS Open Glyphs Font for PDF Export */
      @font-face {
        font-family: 'DS Open Glyphs';
        src: url('/assets/ds-open-glyphs-1.6.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
      
      /* Glyph Icon Base Style */
      .glyph-icon {
        font-family: 'DS Open Glyphs', sans-serif;
        font-style: normal;
        font-weight: normal;
        line-height: 1;
        text-rendering: auto;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      /* Tier Glyphs */
      .glyph-tier-1::before { content: "{"; }
      .glyph-tier-2::before { content: "_"; }
      .glyph-tier-3::before { content: "}"; }
      
      /* Action Type Glyphs */
      .glyph-distance::before { content: "D"; }
      .glyph-target::before { content: "T"; }
      .glyph-feature::before { content: "*"; }
      .glyph-melee::before { content: "<"; }
      .glyph-ranged::before { content: ">"; }
      .glyph-melee-or-ranged::before { content: "="; }
      .glyph-self::before { content: "S"; }
      .glyph-burst::before { content: "B"; }
      .glyph-unique-distance::before { content: "U"; }
      .glyph-cube-line-wall::before { content: "C"; }
      .glyph-villain-action::before { content: "V"; }
      .glyph-triggered-action::before { content: "!"; }
    </style>
    
    <div class="stat-block" style="
      background: #fdf8f6;
      border: 2px solid #8b4513;
      border-radius: 8px;
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      max-width: 100%;
      line-height: 1.4;
    ">
      <!-- Header matching MonsterStatBlock.vue -->
      <div class="header" style="text-align: center; margin-bottom: 16px;">
        <h1 class="monster-name" style="
          font-size: 1.75rem;
          font-weight: bold;
          color: #8b4513;
          margin: 0 0 8px 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        ">${monster.name}</h1>
        
        <div class="monster-meta-container" style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          font-size: 0.9rem;
          margin-bottom: 4px;
        ">
          <div class="monster-meta-left" style="
            font-weight: 600;
            color: #525252;
          ">${formatMonsterRole(monster)}</div>
          
          <div class="monster-meta-center" style="
            font-style: italic;
            color: #525252;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
          ">${formatKeywords(monster.keywords || [])}</div>
          
          <div class="monster-meta-right" style="
            font-weight: bold;
            color: #8b4513;
          ">${formatMonsterEV(monster)}</div>
        </div>
      </div>

      <div class="divider" style="
        height: 2px;
        background: linear-gradient(to right, transparent, #8b4513, transparent);
        margin: 16px 0;
      "></div>

      <!-- Core Stats Grid matching current layout -->
      <div class="core-stats-grid" style="margin-bottom: 16px;">
        <div class="stat-values" style="
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        ">
          <div style="flex: 1; text-align: center; font-weight: 600; color: #262626;">${monster.size}</div>
          <div style="flex: 1; text-align: center; font-weight: 600; color: #262626;">${monster.speed}</div>
          <div style="flex: 1; text-align: center; font-weight: 600; color: #262626;">${monster.stamina}</div>
          <div style="flex: 1; text-align: center; font-weight: 600; color: #262626;">${monster.stability}</div>
          <div style="flex: 1; text-align: center; font-weight: 600; color: #262626;">${monster.freeStrike}</div>
        </div>
        <div class="stat-labels" style="
          display: flex;
          justify-content: space-between;
        ">
          <div style="flex: 1; text-align: center; font-weight: bold; color: #8b4513; font-size: 0.875rem;">Size</div>
          <div style="flex: 1; text-align: center; font-weight: bold; color: #8b4513; font-size: 0.875rem;">Speed</div>
          <div style="flex: 1; text-align: center; font-weight: bold; color: #8b4513; font-size: 0.875rem;">Stamina</div>
          <div style="flex: 1; text-align: center; font-weight: bold; color: #8b4513; font-size: 0.875rem;">Stability</div>
          <div style="flex: 1; text-align: center; font-weight: bold; color: #8b4513; font-size: 0.875rem;">Free Strike</div>
        </div>
      </div>

      <div class="divider" style="
        height: 2px;
        background: linear-gradient(to right, transparent, #8b4513, transparent);
        margin: 16px 0;
      "></div>

      <!-- Characteristics matching CharacteristicScores.vue -->
      <div class="characteristic-scores" style="
        display: flex;
        justify-content: space-between;
        margin-bottom: 16px;
      ">
        <div class="characteristic-score" style="
          text-align: center;
          flex: 1;
        ">
          <div class="characteristic-name" style="
            font-size: 0.75rem;
            font-weight: bold;
            color: #8b4513;
            margin-bottom: 4px;
            text-transform: uppercase;
          ">Might</div>
          <div class="characteristic-value" style="
            font-size: 1.125rem;
            font-weight: bold;
            color: #262626;
          ">${formatCharacteristic(monster.characteristics?.might || 0)}</div>
        </div>
        <div class="characteristic-score" style="
          text-align: center;
          flex: 1;
        ">
          <div class="characteristic-name" style="
            font-size: 0.75rem;
            font-weight: bold;
            color: #8b4513;
            margin-bottom: 4px;
            text-transform: uppercase;
          ">Agility</div>
          <div class="characteristic-value" style="
            font-size: 1.125rem;
            font-weight: bold;
            color: #262626;
          ">${formatCharacteristic(monster.characteristics?.agility || 0)}</div>
        </div>
        <div class="characteristic-score" style="
          text-align: center;
          flex: 1;
        ">
          <div class="characteristic-name" style="
            font-size: 0.75rem;
            font-weight: bold;
            color: #8b4513;
            margin-bottom: 4px;
            text-transform: uppercase;
          ">Reason</div>
          <div class="characteristic-value" style="
            font-size: 1.125rem;
            font-weight: bold;
            color: #262626;
          ">${formatCharacteristic(monster.characteristics?.reason || 0)}</div>
        </div>
        <div class="characteristic-score" style="
          text-align: center;
          flex: 1;
        ">
          <div class="characteristic-name" style="
            font-size: 0.75rem;
            font-weight: bold;
            color: #8b4513;
            margin-bottom: 4px;
            text-transform: uppercase;
          ">Intuition</div>
          <div class="characteristic-value" style="
            font-size: 1.125rem;
            font-weight: bold;
            color: #262626;
          ">${formatCharacteristic(monster.characteristics?.intuition || 0)}</div>
        </div>
        <div class="characteristic-score" style="
          text-align: center;
          flex: 1;
        ">
          <div class="characteristic-name" style="
            font-size: 0.75rem;
            font-weight: bold;
            color: #8b4513;
            margin-bottom: 4px;
            text-transform: uppercase;
          ">Presence</div>
          <div class="characteristic-value" style="
            font-size: 1.125rem;
            font-weight: bold;
            color: #262626;
          ">${formatCharacteristic(monster.characteristics?.presence || 0)}</div>
        </div>
      </div>

      <div class="divider" style="
        height: 2px;
        background: linear-gradient(to right, transparent, #8b4513, transparent);
        margin: 16px 0;
      "></div>

      <!-- Secondary Stats matching current layout -->
      <div class="secondary-stats" style="
        font-size: 0.875rem;
        color: #525252;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
        line-height: 1.6;
        margin-bottom: 16px;
      ">
        <span class="stat-item" style="white-space: nowrap;">
          <strong style="color: #8b4513; font-weight: bold;">Immunity</strong> ${formatImmunity(monster.immunities)}
        </span>
        <span style="color: #8b4513; font-weight: bold; margin: 0 4px;">•</span>
        <span class="stat-item" style="white-space: nowrap;">
          <strong style="color: #8b4513; font-weight: bold;">Weakness</strong> ${formatWeakness(monster.weaknesses)}
        </span>
        <span style="color: #8b4513; font-weight: bold; margin: 0 4px;">•</span>
        <span class="stat-item" style="white-space: nowrap;">
          <strong style="color: #8b4513; font-weight: bold;">Movement</strong> ${formatMovement(new Set(monster.movementTypes || []))}
        </span>
        ${monster.withCaptain ? `
        <span style="color: #8b4513; font-weight: bold; margin: 0 4px;">•</span>
        <div class="with-captain-ability" style="display: inline-flex; align-items: center; flex-wrap: wrap;">
          <span class="with-captain-label" style="color: #8b4513; font-weight: bold;">With Captain:</span>
          <span class="with-captain-text" style="margin-left: 4px;">${stripHTML(monster.withCaptain)}</span>
        </div>
        ` : ''}
      </div>

      <div class="divider" style="
        height: 2px;
        background: #8b4513;
        margin: 16px 0;
      "></div>

      <!-- Abilities -->
      <div class="abilities-columns" style="
        column-count: 2;
        column-gap: 16px;
        column-fill: balance;
      ">
        ${generateAbilitiesHTML(monster.items || [], monster.organization)}
      </div>

      <div class="divider" style="
        height: 1px;
        background: #737373;
        margin: 16px 0;
      "></div>

      <!-- Footer -->
      <div style="
        text-align: center;
        font-size: 0.8rem;
        color: #737373;
        font-style: italic;
      ">
        Monsters, page 211 • Draw Steel Creator License
      </div>
    </div>
  `
}

// Helper functions to handle both old and new data structures
function getPowerRoll(item: MonsterItem): string {
  // Check for new format: effects array with roll field
  if (item.effects) {
    const rollEffect = item.effects.find(effect => effect.roll);
    if (rollEffect) return rollEffect.roll || '';
  }
  // Check for old format
  return item.system?.power?.roll?.formula || '';
}

function getResourceCost(item: MonsterItem): string {
  // Check for new format: effects with cost field
  if (item.effects) {
    const costEffect = item.effects.find(effect => effect.cost);
    if (costEffect) return costEffect.cost || '';
  }
  // Check for old format
  return item.system?.resource ? `${item.system.resource} Malice` : '';
}

function getActionType(item: MonsterItem): string {
  // Check for new format
  if (item.usage) return item.usage;
  if (item.ability_type?.includes('Villain Action')) return item.ability_type;
  // Check for old format
  if (item.system?.type && item.system.type !== 'none') {
    return item.system.type.replace(/([A-Z])/g, ' $1').toLowerCase();
  }
  return '';
}

function getKeywords(item: MonsterItem): string[] {
  return item.keywords || item.system?.keywords || [];
}

function getDistance(item: MonsterItem): string {
  if (item.distance) return item.distance;
  return formatActionDistance(item.system?.distance) || '';
}

function getTarget(item: MonsterItem, organization?: string): string {
  if (item.target) return item.target;
  return formatActionTargets(item.system?.target, organization) || '';
}

function isSignatureAbility(item: MonsterItem): boolean {
  return item.ability_type?.includes('Signature') || item.system?.category === 'signature';
}

function getTiers(item: MonsterItem): Array<{tier: number, display: string}> {
  // Check for new format: effects with tier fields
  if (item.effects) {
    const rollEffect = item.effects.find(effect => effect.tier1 || effect.tier2 || effect.tier3);
    if (rollEffect) {
      const tiers = [];
      if (rollEffect.tier1) tiers.push({ tier: 1, display: rollEffect.tier1 });
      if (rollEffect.tier2) tiers.push({ tier: 2, display: rollEffect.tier2 });
      if (rollEffect.tier3) tiers.push({ tier: 3, display: rollEffect.tier3 });
      return tiers;
    }
  }
  // Check for old format
  return item.system?.power?.tiers || [];
}

function getTrigger(item: MonsterItem): string {
  // Check for new structure: top-level trigger field  
  if (item.trigger) {
    return item.trigger;
  }
  // Check for old structure
  if (item.system?.type === 'triggered' || item.system?.type === 'freeTriggered') {
    return item.system.trigger || '';
  }
  return '';
}

function getActionDescription(item: MonsterItem): string {
  // For features, check effects first, then system description
  if (item.type === 'feature') {
    if (item.effects) {
      const effectText = item.effects.find(effect => effect.effect);
      if (effectText) return effectText.effect || '';
    }
    return item.system?.description?.value || '';
  }

  // For abilities without power rolls, check system description
  if (item.system?.description?.value) return item.system.description.value;

  // Use extractDescription as fallback
  return extractDescription(item);
}

function getActionEffect(item: MonsterItem): string {
  // Check for effects with just "effect" field (new structure)
  if (item.effects) {
    const effectText = item.effects.find(effect => effect.effect && !effect.tier1 && !effect.tier2 && !effect.tier3);
    if (effectText) return effectText.effect || '';
  }
  // Check for old structure
  return item.system?.effect?.text || '';
}

function getSpendEffect(item: MonsterItem): string {
  // Check for effects with costs in new structure
  if (item.effects) {
    const costEffects = item.effects.filter(effect => effect.cost);
    if (costEffects.length > 0) {
      return costEffects.map(effect => `
        <span style="color: #8b4513; font-weight: bold;">${effect.cost}:</span>
        <span>${effect.effect || ''}</span>
      `).join('<br>');
    }
  }

  // Check for old structure
  if (item.system?.spend?.text) {
    return `<strong>Spend:</strong> ${item.system.spend.text}`;
  }

  return '';
}

/**
 * Generate HTML for abilities section
 */
function generateAbilitiesHTML(items: MonsterItem[], organization?: string): string {
  if (!items || items.length === 0) return ''
  
  // Sort abilities like ActionsList.vue does
  const sortedItems = [...items].sort((a, b) => {
    // Check for signature status in both structures  
    const aIsSignature = a.ability_type?.includes('Signature') || a.system?.category === 'signature'
    const bIsSignature = b.ability_type?.includes('Signature') || b.system?.category === 'signature'
    
    if (aIsSignature && !bIsSignature) return -1
    if (!aIsSignature && bIsSignature) return 1
    
    // Sort features before abilities
    if (a.type === 'feature' && b.type !== 'feature') return -1
    if (a.type !== 'feature' && b.type === 'feature') return 1
    
    return 0
  })
  
  return sortedItems.map(action => {
    const isFeature = action.type === 'feature'
    const powerRoll = getPowerRoll(action)
    const resourceCost = getResourceCost(action)
    const actionType = getActionType(action)
    const keywords = getKeywords(action)
    const distance = getDistance(action)
    const target = getTarget(action, organization)
    const isSignature = isSignatureAbility(action)
    const trigger = getTrigger(action)
    
    // Get action description/effect
    const description = getActionDescription(action)
    const effect = getActionEffect(action)
    
    // Get spend effects  
    const spendEffect = getSpendEffect(action)
    
    // Get tiers for power rolls
    const tiers = getTiers(action)
    
    return `
      <div class="action" style="margin-bottom: 12px; break-inside: avoid;">
        <!-- Action Header -->
        <div class="action-header" style="margin-bottom: 12px;">
          <div class="action-title-row" style="
            margin-bottom: 8px;
          ">
            <h4 class="action-name" style="
              font-weight: bold;
              color: #8b4513;
              font-size: 1.125rem;
              margin: 0 0 8px 0;
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              ${isFeature ? '<span class="feature-badge" style="color: #f59e0b; font-size: 1.25rem;">★</span>' : ''}
              ${action.name}
              ${isSignature ? '<span class="signature-badge" style="background: #dc2626; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; letter-spacing: 0.5px; margin-left: 4px;">SIGNATURE</span>' : ''}
            </h4>
            
            ${(resourceCost || powerRoll || actionType) ? `
              <div class="action-power-info" style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                ${resourceCost && resourceCost !== '-' && resourceCost !== '—' ? `<span class="malice-cost" style="background: #7a3a0f; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.875rem;">${resourceCost}</span>` : ''}
                ${powerRoll && powerRoll !== '-' && powerRoll !== '—' ? `<span class="action-power-roll" style="font-weight: bold; color: #404040; background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-size: 0.875rem;">${powerRoll}</span>` : ''}
                ${actionType && actionType !== '-' && actionType !== '—' ? `<span class="action-type-badge" style="background: #525252; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.875rem; text-transform: capitalize;">${actionType}</span>` : ''}
              </div>
            ` : ''}
          </div>

          <div class="action-details" style="display: flex; flex-direction: column; gap: 8px;">
            ${keywords.length > 0 && !keywords.includes('-') && !keywords.includes('—') ? `
              <div class="action-keywords" style="
                font-style: italic;
                color: #525252;
                font-size: 0.875rem;
              ">${keywords.filter(k => k !== '-' && k !== '—').map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(', ')}</div>
            ` : ''}

            <div class="action-mechanics" style="display: flex; gap: 16px; flex-wrap: wrap;">
              ${distance ? `
                <div class="action-distance" style="
                  display: flex;
                  align-items: center;
                  gap: 4px;
                  background: #fafafa;
                  border: 1px solid #e5e5e5;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 0.875rem;
                  color: #404040;
                ">
                  ${createGlyphIcon('glyph-distance', 'Distance')}
                  ${distance}
                </div>
              ` : ''}
              ${target ? `
                <div class="action-target" style="
                  display: flex;
                  align-items: center;
                  gap: 4px;
                  background: #fafafa;
                  border: 1px solid #e5e5e5;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 0.875rem;
                  color: #404040;
                ">
                  ${createGlyphIcon('glyph-target', 'Target')}
                  ${target}
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        ${trigger ? `
          <div class="action-trigger" style="
            margin-bottom: 8px;
            padding: 12px;
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
            font-size: 0.875rem;
            border-radius: 4px;
            color: #171717;
            line-height: 1.6;
          ">
            <strong>Trigger:</strong> ${stripHTML(trigger)}
          </div>
        ` : ''}

        <!-- Power Roll Tiers or Effect -->
        ${tiers.length > 0 ? `
          <div class="action-tiers" style="margin: 8px 0;">
            ${tiers.map(tier => `
              <div style="
                font-size: 0.9rem;
                margin-bottom: 4px;
                line-height: 1.5;
                color: #262626;
                display: flex;
                align-items: center;
                gap: 4px;
              ">
                <strong style="color: #8b4513; display: flex; align-items: center; gap: 2px;">
                  ${getTierGlyph(tier.tier)}:
                </strong> 
                <span>${tier.display}</span>
              </div>
            `).join('')}
          </div>
        ` : (effect ? `
          <div class="action-effect-text" style="
            margin: 8px 0;
            padding: 8px;
            border-radius: 4px;
            color: #171717;
            line-height: 1.6;
            font-size: 0.9rem;
          ">${effect}</div>
        ` : '')}

        ${description && !tiers.length && !effect ? `
          <div class="action-description" style="
            margin: 0;
            color: #262626;
            line-height: 1.6;
            font-size: 0.9rem;
          ">${description}</div>
        ` : ''}

        ${spendEffect ? `
          <div class="action-spend" style="
            margin: 12px 0;
            padding: 12px;
            background: #fdf8f6;
            border-left: 4px solid #8b4513;
            font-size: 0.875rem;
            border-radius: 4px;
            color: #171717;
            line-height: 1.6;
          ">${spendEffect}</div>
        ` : ''}
      </div>
    `
  }).join('')
}