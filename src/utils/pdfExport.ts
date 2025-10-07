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
  formatTierNumber,
  stripHTML,
  actionHasPowerRoll
} from './formatters.ts'

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
 * Generate HTML for the stat block using the same structure as MonsterStatBlock.vue
 */
function generateStatBlockHTML(monster: Monster): string {
  
  return `
    <div class="stat-block" style="
      background: #fdf8f6;
      border: 2px solid #8b4513;
      border-radius: 8px;
      padding: 24px;
      font-family: 'Libre Baskerville', 'Book Antiqua', Georgia, serif;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      max-width: 100%;
      line-height: 1.4;
    ">
      <!-- Header -->
      <div class="header" style="text-align: center; margin-bottom: 12px;">
        <h1 class="monster-name" style="
          font-size: 1.6rem;
          font-weight: bold;
          color: #8b4513;
          margin: 0 0 6px 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        ">${monster.name}</h1>
        
        <div class="monster-meta-line" style="
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          font-size: 0.85rem;
          color: #737373;
          flex-wrap: wrap;
        ">
          <span style="font-style: italic;">${formatMonsterRole(monster)}</span>
          ${monster.keywords && monster.keywords.length > 0 ? `<span>•</span><span>${formatKeywords(monster.keywords)}</span>` : ''}
          <span>•</span>
          <span style="color: #8b4513; font-weight: bold;">${formatMonsterEV(monster)}</span>
        </div>
      </div>

      <div class="divider" style="
        height: 2px;
        background: #8b4513;
        margin: 16px 0;
      "></div>

      <!-- Combat Stats -->
      <div class="combat-stats" style="margin-bottom: 12px;">
        <div class="stat-headers" style="
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 6px;
          margin-bottom: 6px;
          font-weight: bold;
          text-align: center;
          color: #8b4513;
          font-size: 0.8rem;
        ">
          <div>Size</div>
          <div>Speed</div>
          <div>Stamina</div>
          <div>Stability</div>
          <div>Free Strike</div>
        </div>
        <div class="stat-values" style="
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 6px;
          text-align: center;
          font-weight: bold;
          font-size: 0.9rem;
          color: #262626;
        ">
          <div>${monster.size}</div>
          <div>${monster.speed}</div>
          <div>${monster.stamina}</div>
          <div>${monster.stability}</div>
          <div>${monster.freeStrike}</div>
        </div>
      </div>

      <div class="divider" style="
        height: 2px;
        background: #8b4513;
        margin: 16px 0;
      "></div>

      <!-- Characteristics -->
      <div class="characteristics" style="margin-bottom: 12px;">
        <div class="characteristics-grid" style="
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          text-align: center;
        ">
          <div class="characteristic">
            <div style="
              font-weight: bold;
              color: #8b4513;
              font-size: 0.8rem;
              margin-bottom: 3px;
            ">Might</div>
            <div style="
              font-weight: bold;
              font-size: 1rem;
              color: #262626;
            ">${formatCharacteristic(monster.characteristics?.might || 0)}</div>
          </div>
          <div class="characteristic">
            <div style="
              font-weight: bold;
              color: #8b4513;
              font-size: 0.8rem;
              margin-bottom: 3px;
            ">Agility</div>
            <div style="
              font-weight: bold;
              font-size: 1rem;
              color: #262626;
            ">${formatCharacteristic(monster.characteristics?.agility || 0)}</div>
          </div>
          <div class="characteristic">
            <div style="
              font-weight: bold;
              color: #8b4513;
              font-size: 0.8rem;
              margin-bottom: 3px;
            ">Reason</div>
            <div style="
              font-weight: bold;
              font-size: 1rem;
              color: #262626;
            ">${formatCharacteristic(monster.characteristics?.reason || 0)}</div>
          </div>
          <div class="characteristic">
            <div style="
              font-weight: bold;
              color: #8b4513;
              font-size: 0.8rem;
              margin-bottom: 3px;
            ">Intuition</div>
            <div style="
              font-weight: bold;
              font-size: 1rem;
              color: #262626;
            ">${formatCharacteristic(monster.characteristics?.intuition || 0)}</div>
          </div>
          <div class="characteristic">
            <div style="
              font-weight: bold;
              color: #8b4513;
              font-size: 0.8rem;
              margin-bottom: 3px;
            ">Presence</div>
            <div style="
              font-weight: bold;
              font-size: 1rem;
              color: #262626;
            ">${formatCharacteristic(monster.characteristics?.presence || 0)}</div>
          </div>
        </div>
      </div>

      <div class="divider" style="
        height: 2px;
        background: #8b4513;
        margin: 16px 0;
      "></div>

      <!-- Secondary Stats -->
      <div class="secondary-stats" style="
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 16px;
        font-size: 0.9rem;
        color: #404040;
      ">
        <span><strong>Immunity</strong> ${formatImmunity(monster.immunities)}</span>
        <span style="color: #737373;">•</span>
        <span><strong>Weakness</strong> ${formatWeakness(monster.weaknesses)}</span>
        <span style="color: #737373;">•</span>
        <span><strong>Movement</strong> ${formatMovement(monster.movementTypes)}</span>
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

/**
 * Generate HTML for abilities section
 */
function generateAbilitiesHTML(items: MonsterItem[], organization?: string): string {
  if (!items || items.length === 0) return ''
  
  return items.map(item => {
    const isFeature = item.type === 'feature'
    const isSignature = item.system?.category === 'signature'
    const hasPowerRoll = actionHasPowerRoll(item)
    
    return `
      <div class="ability" style="margin-bottom: 16px; break-inside: avoid; -webkit-column-break-inside: avoid; page-break-inside: avoid;">
        <!-- Ability Header -->
        <div class="ability-header" style="margin-bottom: 8px;">
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
          ">
            <h4 style="
              margin: 0;
              color: #8b4513;
              font-size: 1.1rem;
              font-weight: bold;
            ">
              ${item.name}
              ${isFeature ? ' <span style="color: #f59e0b;">★</span>' : ''}
              ${isSignatureAbility(item) ? ' <span style="background: #8b4513; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; margin-left: 4px;">SIGNATURE</span>' : ''}
              ${getResourceCost(item) ? ` <span style="color: #ef4444; font-weight: bold; margin-left: 4px;">${getResourceCost(item)}</span>` : ''}
            </h4>
            <div style="
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 0.9rem;
              color: #737373;
            ">
              ${getPowerRoll(item) ? `<span style="font-weight: bold;">${getPowerRoll(item)}</span>` : ''}
              ${getActionType(item) ? `<span>${getActionType(item)}</span>` : ''}
            </div>
          </div>
          
          ${getKeywords(item).length > 0 ? `
            <div style="
              font-size: 0.8rem;
              color: #737373;
              font-style: italic;
              margin-bottom: 4px;
            ">${getKeywords(item).join(', ')}</div>
          ` : ''}
          
          <div style="
            display: flex;
            gap: 16px;
            font-size: 0.8rem;
            color: #737373;
            margin-bottom: 8px;
          ">
            ${getDistance(item) ? `<span><strong>Range:</strong> ${getDistance(item)}</span>` : ''}
            ${getTarget(item, organization) ? `<span><strong>Target:</strong> ${getTarget(item, organization)}</span>` : ''}
          </div>
        </div>

        <!-- Power Roll Tiers -->
        ${hasPowerRoll ? `
          <div class="power-roll" style="
            background: #fafafa;
            border: 1px solid #e5e5e5;
            border-radius: 6px;
            padding: 12px;
            margin: 8px 0;
          ">
            ${getTiers(item).map(tier => `
              <div style="
                display: flex;
                align-items: flex-start;
                margin-bottom: 6px;
                font-size: 0.9rem;
              ">
                <span style="
                  font-weight: bold;
                  color: #404040;
                  min-width: 40px;
                  margin-right: 8px;
                ">${formatTierNumber(tier.tier)}</span>
                <span style="color: #404040;">${stripHTML(tier.display)}</span>
              </div>
            `).join('') || ''}
            
            ${item.system?.effect?.text ? `
              <div style="
                margin-top: 8px;
                font-size: 0.9rem;
                color: #404040;
              ">
                <strong>Effect:</strong> ${stripHTML(item.system.effect.text)}
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Description (for abilities without power rolls) -->
        ${!hasPowerRoll && item.system?.description?.value ? `
          <div style="font-size: 0.9rem; margin: 8px 0; color: #404040;">
            ${stripHTML(item.system.description.value)}
          </div>
        ` : ''}

        <!-- Description (for abilities without power rolls but with effect text) -->
        ${!hasPowerRoll && !item.system?.description?.value && item.system?.effect?.text ? `
          <div style="font-size: 0.9rem; margin: 8px 0; color: #404040;">
            <strong>Effect:</strong> ${stripHTML(item.system.effect.text)}
          </div>
        ` : ''}

        <!-- Spend Effects -->
        ${item.system?.spend?.text ? `
          <div style="
            margin-top: 8px;
            font-size: 0.9rem;
            font-style: italic;
            color: #737373;
          ">
            <strong>Spend:</strong> ${stripHTML(item.system.spend.text)}
          </div>
        ` : ''}
      </div>
    `
  }).join('')
}