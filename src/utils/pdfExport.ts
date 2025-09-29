import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

// Types for monster data
interface Monster {
  name: string
  level?: number
  ev?: number
  role?: string
  organization?: string
  keywords?: string[]
  size?: {
    value?: number
    letter?: string
  }
  speed?: number
  stamina?: number
  stability?: number
  freeStrike?: number
  characteristics?: {
    might: number
    agility: number
    reason: number
    intuition: number
    presence: number
  }
  immunities?: Record<string, number>
  weaknesses?: Record<string, number>
  movementTypes?: string | string[]
  items?: MonsterItem[]
}

interface MonsterItem {
  name: string
  type?: string
  system?: {
    category?: string
    type?: string
    resource?: number | null
    keywords?: string[]
    distance?: {
      type: string
      primary?: number | string
      secondary?: number | string
    }
    target?: {
      type: string
      value?: number
    }
    power?: {
      roll?: {
        formula: string
        characteristics?: string[]
      }
      tiers?: Array<{
        tier: number
        display: string
      }>
    }
    effect?: {
      before?: string
      after?: string
    }
    spend?: {
      text?: string
      value?: number | null
    }
    description?: {
      value?: string
    }
  }
}

/**
 * Export monster stat block to PDF using HTML+CSS approach
 * This captures the existing styled stat block and converts it to PDF
 */
export async function exportMonsterToPDF(monster: Monster): Promise<void> {
  try {
    // Create a temporary div with the stat block HTML
    const tempDiv = document.createElement('div')
    tempDiv.style.position = 'absolute'
    tempDiv.style.top = '-9999px'
    tempDiv.style.left = '-9999px'
    tempDiv.style.width = '210mm' // A4 width
    tempDiv.style.maxWidth = '210mm'
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
      scale: 1.5, // Good balance of quality and file size
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
    
    // Create PDF
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    // Calculate dimensions to fit page properly
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 10
    const maxWidth = pageWidth - (margin * 2)
    const maxHeight = pageHeight - (margin * 2)
    
    // Calculate image dimensions maintaining aspect ratio
    const imgAspectRatio = canvas.width / canvas.height
    let imgWidth = maxWidth
    let imgHeight = imgWidth / imgAspectRatio
    
    // If image is too tall, fit by height instead
    if (imgHeight > maxHeight) {
      imgHeight = maxHeight
      imgWidth = imgHeight * imgAspectRatio
    }
    
    // Center the image on the page
    const xOffset = (pageWidth - imgWidth) / 2
    const yOffset = margin
    
    // Add the image to PDF
    pdf.addImage(
      imgData, 
      'PNG', 
      xOffset,
      yOffset,  
      imgWidth,
      imgHeight,
      undefined,
      'FAST'
    )
    
    // Add footer with branding
    pdf.setFontSize(8)
    pdf.setTextColor(128, 128, 128)
    
    // Center bottom: "Generated with Steel Cauldron"
    const footerText = 'Generated with Steel Cauldron'
    const textWidth = pdf.getTextWidth(footerText)
    pdf.text(footerText, (pageWidth - textWidth) / 2, pageHeight - 5)
    
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
  const formatKeywords = (keywords: string[] = []) => {
    return keywords.map(keyword => 
      keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase()
    ).join(', ')
  }
  
  const formatMonsterRole = (monster: Monster) => {
    return `Level ${monster.level} ${monster.organization}${monster.role ? ' ' + monster.role : ''}`
  }
  
  const formatImmunity = (immunity?: Record<string, number>) => {
    if (!immunity || Object.keys(immunity).length === 0) return '—'
    return Object.entries(immunity)
      .filter(([, value]) => value > 0)
      .map(([type, value]) => `${type} ${value}`)
      .join(', ')
  }
  
  const formatWeakness = (weakness?: Record<string, number>) => {
    if (!weakness || Object.keys(weakness).length === 0) return '—'
    return Object.entries(weakness)
      .filter(([, value]) => value > 0)
      .map(([type, value]) => `${type} ${value}`)
      .join(', ')
  }
  
  const formatMovement = (movement?: string | string[]) => {
    if (!movement) return '—'
    if (typeof movement === 'string') return movement
    if (Array.isArray(movement)) return movement.join(', ')
    return movement
  }
  
  const formatCharacteristic = (value: number) => {
    return value >= 0 ? `+${value}` : `${value}`
  }
  
  return `
    <div class="stat-block" style="
      background: #fdf6e3;
      border: 2px solid #8b4513;
      border-radius: 8px;
      padding: 24px;
      font-family: 'Libre Baskerville', 'Book Antiqua', Georgia, serif;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      max-width: 100%;
      line-height: 1.4;
    ">
      <!-- Header -->
      <div class="header" style="text-align: center; margin-bottom: 16px;">
        <h1 class="monster-name" style="
          font-size: 1.8rem;
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
          margin-bottom: 8px;
        ">
          <div class="monster-role" style="
            color: #6c757d;
            font-style: italic;
            font-size: 1rem;
          ">${formatMonsterRole(monster)}</div>
        </div>
        
        ${monster.keywords && monster.keywords.length > 0 ? `
          <div class="monster-keywords" style="
            color: #6c757d;
            font-size: 0.9rem;
            margin-bottom: 8px;
          ">${formatKeywords(monster.keywords)}</div>
        ` : ''}
        
        <div class="monster-ev" style="
          color: #8b4513;
          font-weight: bold;
          font-size: 1rem;
        ">EV ${monster.ev}</div>
      </div>

      <div class="divider" style="
        height: 2px;
        background: #8b4513;
        margin: 16px 0;
      "></div>

      <!-- Combat Stats -->
      <div class="combat-stats" style="margin-bottom: 16px;">
        <div class="stat-headers" style="
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          margin-bottom: 8px;
          font-weight: bold;
          text-align: center;
          color: #8b4513;
          font-size: 0.9rem;
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
          gap: 8px;
          text-align: center;
          font-weight: bold;
          font-size: 1rem;
        ">
          <div>${monster.size?.value}${monster.size?.letter}</div>
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
      <div class="characteristics" style="margin-bottom: 16px;">
        <div class="characteristics-grid" style="
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
          text-align: center;
        ">
          <div class="characteristic">
            <div style="
              font-weight: bold;
              color: #8b4513;
              font-size: 0.9rem;
              margin-bottom: 4px;
            ">Might</div>
            <div style="
              font-weight: bold;
              font-size: 1.1rem;
            ">${formatCharacteristic(monster.characteristics?.might || 0)}</div>
          </div>
          <div class="characteristic">
            <div style="
              font-weight: bold;
              color: #8b4513;
              font-size: 0.9rem;
              margin-bottom: 4px;
            ">Agility</div>
            <div style="
              font-weight: bold;
              font-size: 1.1rem;
            ">${formatCharacteristic(monster.characteristics?.agility || 0)}</div>
          </div>
          <div class="characteristic">
            <div style="
              font-weight: bold;
              color: #8b4513;
              font-size: 0.9rem;
              margin-bottom: 4px;
            ">Reason</div>
            <div style="
              font-weight: bold;
              font-size: 1.1rem;
            ">${formatCharacteristic(monster.characteristics?.reason || 0)}</div>
          </div>
          <div class="characteristic">
            <div style="
              font-weight: bold;
              color: #8b4513;
              font-size: 0.9rem;
              margin-bottom: 4px;
            ">Intuition</div>
            <div style="
              font-weight: bold;
              font-size: 1.1rem;
            ">${formatCharacteristic(monster.characteristics?.intuition || 0)}</div>
          </div>
          <div class="characteristic">
            <div style="
              font-weight: bold;
              color: #8b4513;
              font-size: 0.9rem;
              margin-bottom: 4px;
            ">Presence</div>
            <div style="
              font-weight: bold;
              font-size: 1.1rem;
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
      ">
        <span><strong>Immunity</strong> ${formatImmunity(monster.immunities)}</span>
        <span style="color: #6c757d;">•</span>
        <span><strong>Weakness</strong> ${formatWeakness(monster.weaknesses)}</span>
        <span style="color: #6c757d;">•</span>
        <span><strong>Movement</strong> ${formatMovement(monster.movementTypes)}</span>
      </div>

      <div class="divider" style="
        height: 2px;
        background: #8b4513;
        margin: 16px 0;
      "></div>

      <!-- Abilities -->
      ${generateAbilitiesHTML(monster.items || [])}

      <div class="divider" style="
        height: 1px;
        background: #6c757d;
        margin: 16px 0;
      "></div>

      <!-- Footer -->
      <div style="
        text-align: center;
        font-size: 0.8rem;
        color: #6c757d;
        font-style: italic;
      ">
        Monsters, page 211 • Draw Steel Creator License
      </div>
    </div>
  `
}

/**
 * Generate HTML for abilities section
 */
function generateAbilitiesHTML(items: MonsterItem[]): string {
  if (!items || items.length === 0) return ''
  
  const formatTierNumber = (tier: number) => {
    const tierMap: Record<number, string> = { 1: '≤11', 2: '12-16', 3: '17+' }
    return tierMap[tier] || tier.toString()
  }
  
  const formatActionDistance = (distance?: { type: string; primary?: number | string; secondary?: number | string }) => {
    if (!distance) return ''
    if (distance.type === 'melee' || distance.type === 'ranged') {
      return `${distance.type.charAt(0).toUpperCase() + distance.type.slice(1)} ${distance.primary}`
    }
    if (distance.type === 'meleeRanged') {
      return `Melee ${distance.primary} or ranged ${distance.secondary}`
    }
    return distance.type.charAt(0).toUpperCase() + distance.type.slice(1)
  }
  
  const formatActionTargets = (target?: { type: string; value?: number }) => {
    if (!target) return ''
    const targetValue = target.value ? ` ${target.value}` : ''
    const targetMap: Record<string, string> = {
      'creature': 'creature',
      'creatureObject': 'creature or object',
      'enemy': 'enemy',
      'ally': 'ally',
      'selfAlly': 'self and ally',
      'special': 'special'
    }
    return `${targetValue} ${targetMap[target.type] || target.type}`.trim()
  }

  const stripHTML = (text: string) => {
    return text.replace(/<[^>]*>/g, '').trim()
  }
  
  return items.map(item => {
    const isFeature = item.type === 'feature'
    const isSignature = item.system?.category === 'signature'
    const hasPowerRoll = item.system?.power?.tiers && item.system.power.tiers.length > 0
    
    return `
      <div class="ability" style="margin-bottom: 16px;">
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
              ${isFeature ? ' <span style="color: #ffc107;">★</span>' : ''}
              ${isSignature ? ' <span style="background: #8b4513; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; margin-left: 4px;">SIGNATURE</span>' : ''}
              ${item.system?.resource ? ` <span style="color: #dc3545; font-weight: bold; margin-left: 4px;">${item.system.resource} Malice</span>` : ''}
            </h4>
            <div style="
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 0.9rem;
              color: #6c757d;
            ">
              ${item.system?.power?.roll?.formula ? `<span style="font-weight: bold;">${item.system.power.roll.formula}</span>` : ''}
              ${item.system?.type && item.system.type !== 'none' ? `<span>${item.system.type.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>` : ''}
            </div>
          </div>
          
          ${item.system?.keywords && item.system.keywords.length > 0 ? `
            <div style="
              font-size: 0.8rem;
              color: #6c757d;
              font-style: italic;
              margin-bottom: 4px;
            ">${item.system.keywords.join(', ')}</div>
          ` : ''}
          
          <div style="
            display: flex;
            gap: 16px;
            font-size: 0.8rem;
            color: #6c757d;
            margin-bottom: 8px;
          ">
            ${formatActionDistance(item.system?.distance) ? `<span><strong>Range:</strong> ${formatActionDistance(item.system?.distance)}</span>` : ''}
            ${formatActionTargets(item.system?.target) ? `<span><strong>Target:</strong> ${formatActionTargets(item.system?.target)}</span>` : ''}
          </div>
        </div>

        <!-- Before Effect -->
        ${item.system?.effect?.before ? `
          <div style="
            margin-bottom: 8px;
            font-size: 0.9rem;
          ">
            <strong>Effect:</strong> ${stripHTML(item.system.effect.before)}
          </div>
        ` : ''}

        <!-- Power Roll Tiers -->
        ${hasPowerRoll ? `
          <div class="power-roll" style="
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px;
            margin: 8px 0;
          ">
            ${item.system?.power?.tiers?.map(tier => `
              <div style="
                display: flex;
                align-items: flex-start;
                margin-bottom: 6px;
                font-size: 0.9rem;
              ">
                <span style="
                  font-weight: bold;
                  color: #4a5568;
                  min-width: 40px;
                  margin-right: 8px;
                ">${formatTierNumber(tier.tier)}</span>
                <span>${stripHTML(tier.display)}</span>
              </div>
            `).join('') || ''}
            
            ${item.system?.effect?.after ? `
              <div style="
                margin-top: 8px;
                font-size: 0.9rem;
              ">
                <strong>Effect:</strong> ${stripHTML(item.system.effect.after)}
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Description (for abilities without power rolls) -->
        ${!hasPowerRoll && item.system?.description?.value ? `
          <div style="font-size: 0.9rem; margin: 8px 0;">
            ${stripHTML(item.system.description.value)}
          </div>
        ` : ''}

        <!-- Description (for abilities without power rolls but with before effect) -->
        ${!hasPowerRoll && !item.system?.description?.value && item.system?.effect?.before ? `
          <div style="font-size: 0.9rem; margin: 8px 0;">
            ${stripHTML(item.system.effect.before)}
          </div>
        ` : ''}

        <!-- Spend Effects -->
        ${item.system?.spend?.text ? `
          <div style="
            margin-top: 8px;
            font-size: 0.9rem;
            font-style: italic;
            color: #6c757d;
          ">
            <strong>Spend:</strong> ${stripHTML(item.system.spend.text)}
          </div>
        ` : ''}
      </div>
    `
  }).join('')
}