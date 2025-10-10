import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import type { EncounterMonster, InitiativeGroup } from '@/stores/encounter'
import type { PartyConfiguration } from '@/utils/encounterBalance'
import { calculatePartyStrength } from '@/utils/encounterBalance'
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
import { getMonster } from '@/data/monsters.js'

export interface EncounterExportData {
  name: string
  description?: string
  monsters: EncounterMonster[]
  initiativeGroups: InitiativeGroup[]
  targetEV: number
  party: PartyConfiguration
  objectives?: string
  specialRules?: string
}

/**
 * Export encounter to PDF with complete stat blocks and initiative tracker
 */
export async function exportEncounterToPDF(encounter: EncounterExportData): Promise<void> {
  try {
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidthMm = pdf.internal.pageSize.getWidth()
    const pageHeightMm = pdf.internal.pageSize.getHeight()
    const marginMm = 10
    const footerMm = 6
    const contentWidthMm = pageWidthMm - marginMm * 2
    const contentHeightMm = pageHeightMm - marginMm * 2 - footerMm

    // CSS mm to px conversion at 96 DPI
    const cssPxPerMm = 96 / 25.4
    const contentWidthPx = Math.floor(contentWidthMm * cssPxPerMm)

    // Create temporary container
    const tempDiv = document.createElement('div')
    tempDiv.style.position = 'absolute'
    tempDiv.style.top = '-9999px'
    tempDiv.style.left = '-9999px'
    tempDiv.style.width = `${contentWidthPx}px`
    tempDiv.style.maxWidth = `${contentWidthPx}px`
    tempDiv.style.backgroundColor = 'white'
    tempDiv.style.padding = '8mm'
    tempDiv.style.boxSizing = 'border-box'
    tempDiv.style.fontFamily = 'Arial, sans-serif'
    tempDiv.style.fontSize = '11px'
    tempDiv.style.lineHeight = '1.3'

    // Generate encounter sheet HTML
    tempDiv.innerHTML = await generateEncounterHTML(encounter)

    // Add to DOM
    document.body.appendChild(tempDiv)

    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 300))

    // Capture as canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: 'white',
      width: tempDiv.scrollWidth,
      height: tempDiv.scrollHeight,
      windowWidth: tempDiv.scrollWidth,
      windowHeight: tempDiv.scrollHeight
    })

    // Remove from DOM
    document.body.removeChild(tempDiv)

    // Convert canvas to image dimensions
    const imgWidth = contentWidthMm
    const imgHeight = (canvas.height * contentWidthMm) / canvas.width

    // Add images to PDF (handle multi-page if needed)
    let offsetY = 0
    let pageIndex = 0

    while (offsetY < imgHeight) {
      if (pageIndex > 0) {
        pdf.addPage()
      }

      const currentSliceHeight = Math.min(contentHeightMm, imgHeight - offsetY)
      const sourceY = (offsetY / imgHeight) * canvas.height
      const sourceHeight = (currentSliceHeight / imgHeight) * canvas.height

      // Create a temporary canvas for this slice
      const sliceCanvas = document.createElement('canvas')
      sliceCanvas.width = canvas.width
      sliceCanvas.height = sourceHeight
      const sliceCtx = sliceCanvas.getContext('2d')!
      sliceCtx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight)

      const sliceImgData = sliceCanvas.toDataURL('image/png')
      pdf.addImage(sliceImgData, 'PNG', marginMm, marginMm, imgWidth, currentSliceHeight)

      // Add footer
      pdf.setFontSize(8)
      pdf.setTextColor(100)
      const footerText = 'Generated with Steel Cauldron'
      const textWidth = pdf.getTextWidth(footerText)
      pdf.text(footerText, (pageWidthMm - textWidth) / 2, pageHeightMm - 5)

      offsetY += currentSliceHeight
      pageIndex++
    }

    // Download
    const fileName = `${encounter.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'encounter'}_sheet.pdf`
    pdf.save(fileName)

  } catch (error) {
    console.error('Error generating encounter PDF:', error)
    throw new Error('Failed to generate encounter PDF. Please try again.')
  }
}

/**
 * Generate HTML for the complete encounter sheet
 */
async function generateEncounterHTML(encounter: EncounterExportData): Promise<string> {
  const totalEV = encounter.monsters.reduce((sum, m) => sum + (m.ev * m.count), 0)
  const totalMonsters = encounter.monsters.reduce((sum, m) => sum + m.count, 0)
  
  // Calculate party strength for comparison
  const partyStrength = calculatePartyStrength(encounter.party)

  // Get full monster data for stat blocks
  const monsterDataPromises = encounter.monsters.map(async (encounterMonster) => {
    try {
      const fullMonster = await getMonster(encounterMonster.id)
      return { encounterMonster, fullMonster: fullMonster as unknown }
    } catch (error) {
      console.warn(`Could not load full data for monster ${encounterMonster.id}`, error)
      return { encounterMonster, fullMonster: null as unknown }
    }
  })

  const monstersWithData = await Promise.all(monsterDataPromises)

  return `
    <div style="font-family: Arial, sans-serif;">
      <!-- Header -->
      <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 3px solid #8b4513;">
        <h1 style="
          margin: 0 0 4px 0;
          font-size: 1.8rem;
          color: #2c1810;
          text-align: center;
        ">${encounter.name}</h1>
        ${encounter.description ? `
          <p style="
            margin: 0;
            font-size: 0.9rem;
            color: #666;
            text-align: center;
            font-style: italic;
          ">${encounter.description}</p>
        ` : ''}
      </div>

      <!-- Encounter Info -->
      <div style="
        display: flex;
        justify-content: space-around;
        margin-bottom: 12px;
        padding: 8px;
        background: #f8f8f8;
        border-radius: 4px;
        border: 1px solid #ddd;
      ">
        <div style="text-align: center;">
          <div style="font-weight: bold; color: #8b4513; font-size: 1.1rem;">${totalEV}</div>
          <div style="font-size: 0.75rem; color: #666;">Total EV</div>
        </div>
        ${encounter.targetEV > 0 ? `
          <div style="text-align: center;">
            <div style="font-weight: bold; color: #666; font-size: 1.1rem;">${encounter.targetEV}</div>
            <div style="font-size: 0.75rem; color: #666;">Target EV</div>
          </div>
        ` : ''}
        <div style="text-align: center;">
          <div style="font-weight: bold; color: #666; font-size: 1.1rem;">${partyStrength}</div>
          <div style="font-size: 0.75rem; color: #666;">Party Strength</div>
        </div>
        <div style="text-align: center;">
          <div style="font-weight: bold; color: #666; font-size: 1.1rem;">${totalMonsters}</div>
          <div style="font-size: 0.75rem; color: #666;">Monsters</div>
        </div>
        <div style="text-align: center;">
          <div style="font-weight: bold; color: #666; font-size: 1.1rem;">${encounter.initiativeGroups.length}</div>
          <div style="font-size: 0.75rem; color: #666;">Groups</div>
        </div>
      </div>

      ${encounter.objectives || encounter.specialRules ? `
        <div style="margin-bottom: 12px; padding: 8px; background: #fff3cd; border-left: 3px solid #ffc107; border-radius: 4px;">
          ${encounter.objectives ? `
            <div style="margin-bottom: 6px;">
              <strong style="color: #856404;">Objectives:</strong> ${encounter.objectives}
            </div>
          ` : ''}
          ${encounter.specialRules ? `
            <div>
              <strong style="color: #856404;">Special Rules:</strong> ${encounter.specialRules}
            </div>
          ` : ''}
        </div>
      ` : ''}

      <!-- Initiative Tracker -->
      <div style="margin-bottom: 12px;">
        <h2 style="
          margin: 0 0 8px 0;
          font-size: 1.2rem;
          color: #2c1810;
          border-bottom: 2px solid #8b4513;
          padding-bottom: 4px;
        ">Initiative Tracker</h2>

        ${generateInitiativeTrackerHTML(encounter, monstersWithData)}
      </div>

      <!-- Monster Stat Blocks -->
      <div style="page-break-before: auto;">
        <h2 style="
          margin: 16px 0 8px 0;
          font-size: 1.2rem;
          color: #2c1810;
          border-bottom: 2px solid #8b4513;
          padding-bottom: 4px;
        ">Monster Stat Blocks</h2>

        ${await generateMonsterStatBlocksHTML(monstersWithData)}
      </div>
    </div>
  `
}

/**
 * Generate initiative tracker section
 */
function generateInitiativeTrackerHTML(
  encounter: EncounterExportData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  monstersWithData: Array<{ encounterMonster: EncounterMonster; fullMonster: unknown }>
): string {
  const sortedGroups = [...encounter.initiativeGroups].sort((a, b) => a.order - b.order)
  const ungroupedMonsters = encounter.monsters.filter(m => !m.groupId)

  let html = ''

  // Generate grouped monsters
  for (const group of sortedGroups) {
    const groupMonsters = encounter.monsters.filter(m => m.groupId === group.id)
    const groupEV = groupMonsters.reduce((sum, m) => sum + (m.ev * m.count), 0)
    const groupCount = groupMonsters.reduce((sum, m) => sum + m.count, 0)

    html += `
      <div style="
        margin-bottom: 10px;
        padding: 8px;
        border: 2px solid #8b4513;
        border-radius: 4px;
        background: white;
        page-break-inside: avoid;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <div style="flex: 1;">
            <strong style="font-size: 1rem; color: #2c1810;">${group.name}</strong>
            <span style="margin-left: 8px; color: #666; font-size: 0.85rem;">
              ${groupCount} monster${groupCount !== 1 ? 's' : ''} • EV ${groupEV}
            </span>
          </div>
          <div style="
            border: 2px solid #666;
            border-radius: 4px;
            padding: 4px 8px;
            min-width: 50px;
            text-align: center;
            background: white;
          ">
            <div style="font-size: 0.65rem; color: #666; margin-bottom: 2px;">INIT</div>
            <div style="height: 18px;"></div>
          </div>
        </div>

        ${groupMonsters.map(m => `
          <div style="
            display: flex;
            justify-content: space-between;
            padding: 4px 6px;
            margin: 4px 0;
            background: #f8f8f8;
            border-radius: 3px;
            font-size: 0.85rem;
          ">
            <div style="flex: 1;">
              <strong>${m.name}</strong> (${m.count}×)
              <span style="color: #666; margin-left: 6px;">
                Lvl ${m.level} ${m.organization} ${m.role} • EV ${m.ev}
              </span>
            </div>
          </div>
        `).join('')}

        <!-- Notes section for group -->
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #ddd;">
          <div style="font-size: 0.75rem; color: #666; margin-bottom: 4px;"><strong>Notes:</strong></div>
          <div style="
            border: 1px solid #ccc;
            border-radius: 3px;
            padding: 6px;
            min-height: 30px;
            background: white;
          "></div>
        </div>
      </div>
    `
  }

  // Generate ungrouped monsters
  if (ungroupedMonsters.length > 0) {
    html += `
      <div style="
        margin-bottom: 10px;
        padding: 8px;
        border: 2px dashed #999;
        border-radius: 4px;
        background: #fafafa;
        page-break-inside: avoid;
      ">
        <div style="margin-bottom: 6px;">
          <strong style="font-size: 1rem; color: #666;">Ungrouped Monsters</strong>
        </div>

        ${ungroupedMonsters.map(m => `
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px;
            margin: 4px 0;
            background: white;
            border: 1px solid #ddd;
            border-radius: 3px;
            font-size: 0.85rem;
          ">
            <div style="flex: 1;">
              <strong>${m.name}</strong> (${m.count}×)
              <span style="color: #666; margin-left: 6px;">
                Lvl ${m.level} ${m.organization} ${m.role} • EV ${m.ev}
              </span>
            </div>
            <div style="
              border: 2px solid #999;
              border-radius: 4px;
              padding: 4px 8px;
              min-width: 50px;
              text-align: center;
              background: white;
            ">
              <div style="font-size: 0.65rem; color: #666; margin-bottom: 2px;">INIT</div>
              <div style="height: 18px;"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `
  }

  return html
}

/**
 * Generate monster stat blocks section
 */
async function generateMonsterStatBlocksHTML(
  monstersWithData: Array<{ encounterMonster: EncounterMonster; fullMonster: unknown }>
): Promise<string> {
  const uniqueMonsters = new Map<string, { encounterMonster: EncounterMonster; fullMonster: unknown }>()
  
  // Get unique monsters (avoid duplicates)
  for (const monsterData of monstersWithData) {
    if (!uniqueMonsters.has(monsterData.encounterMonster.id)) {
      uniqueMonsters.set(monsterData.encounterMonster.id, monsterData)
    }
  }

  let html = ''

  for (const { encounterMonster, fullMonster } of uniqueMonsters.values()) {
    if (!fullMonster) {
      html += `
        <div style="
          margin-bottom: 12px;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: #f8f8f8;
          page-break-inside: avoid;
        ">
          <h3 style="margin: 0 0 4px 0; color: #8b4513;">${encounterMonster.name}</h3>
          <p style="margin: 0; color: #666; font-size: 0.85rem;">
            Level ${encounterMonster.level} ${encounterMonster.organization} ${encounterMonster.role} • EV ${encounterMonster.ev}
          </p>
          <p style="margin: 4px 0 0 0; color: #999; font-style: italic; font-size: 0.85rem;">
            Full stat block not available
          </p>
        </div>
      `
      continue
    }

    // Generate compact stat block
    html += generateCompactStatBlock(fullMonster as Record<string, unknown>, encounterMonster.count)
  }

  return html
}

/**
 * Generate a compact stat block for a monster
 */
function generateCompactStatBlock(monster: Record<string, unknown>, count: number): string {
  const characteristics = (monster.characteristics as Record<string, number> | undefined) || {}
  const immunities = (monster.immunities as Record<string, number> | undefined) || {}
  const weaknesses = (monster.weaknesses as Record<string, number> | undefined) || {}
  const items = (monster.items as Array<Record<string, unknown>> | undefined) || []
  const size = monster.size as { value?: number; letter?: string } | undefined
  const keywords = monster.keywords as string[] | undefined
  const movementTypes = monster.movementTypes as string[] | undefined

  return `
    <div style="
      margin-bottom: 12px;
      padding: 10px;
      border: 2px solid #8b4513;
      border-radius: 4px;
      background: white;
      page-break-inside: avoid;
    ">
      <!-- Monster Header -->
      <div style="margin-bottom: 6px;">
        <h3 style="
          margin: 0 0 2px 0;
          font-size: 1.2rem;
          color: #8b4513;
        ">${monster.name} ${count > 1 ? `(${count}×)` : ''}</h3>
        <div style="
          font-size: 0.85rem;
          color: #737373;
        ">
          ${formatMonsterRole(monster)} • ${formatKeywords(keywords || [])} • ${formatMonsterEV(monster)}
        </div>
      </div>

      <div style="height: 1px; background: #8b4513; margin: 6px 0;"></div>

      <!-- Core Stats -->
      <div style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        gap: 6px;
        margin-bottom: 6px;
        font-size: 0.85rem;
      ">
        <div><strong>Size:</strong> ${size?.value || ''}${size?.letter || ''}</div>
        <div><strong>Speed:</strong> ${monster.speed || 0}</div>
        <div><strong>Stamina:</strong> 
          <span style="
            display: inline-block;
            border: 2px solid #000;
            border-radius: 3px;
            padding: 2px 12px;
            min-width: 40px;
            text-align: center;
            background: white;
            font-size: 1.1em;
            font-weight: bold;
          ">${monster.stamina || 0}</span>
        </div>
        <div><strong>Stability:</strong> ${monster.stability || 0}</div>
        <div><strong>Free Strike:</strong> ${formatCharacteristic((monster.freeStrike as number) || 0)}</div>
      </div>

      <!-- Characteristics -->
      <div style="
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 6px;
        margin-bottom: 6px;
        font-size: 0.8rem;
        padding: 6px;
        background: #f8f8f8;
        border-radius: 3px;
      ">
        <div style="text-align: center;">
          <div style="font-size: 0.7rem; color: #666;">MIGHT</div>
          <div style="font-weight: bold;">${formatCharacteristic(characteristics.might || 0)}</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 0.7rem; color: #666;">AGILITY</div>
          <div style="font-weight: bold;">${formatCharacteristic(characteristics.agility || 0)}</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 0.7rem; color: #666;">REASON</div>
          <div style="font-weight: bold;">${formatCharacteristic(characteristics.reason || 0)}</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 0.7rem; color: #666;">INTUITION</div>
          <div style="font-weight: bold;">${formatCharacteristic(characteristics.intuition || 0)}</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 0.7rem; color: #666;">PRESENCE</div>
          <div style="font-weight: bold;">${formatCharacteristic(characteristics.presence || 0)}</div>
        </div>
      </div>

      <!-- Defense & Movement -->
      <div style="
        font-size: 0.8rem;
        color: #404040;
        margin-bottom: 6px;
      ">
        <strong>Immunity</strong> ${formatImmunity(immunities)} • 
        <strong>Weakness</strong> ${formatWeakness(weaknesses)} • 
        <strong>Movement</strong> ${formatMovement(movementTypes ? new Set(movementTypes) : undefined)}
      </div>

      <div style="height: 1px; background: #8b4513; margin: 6px 0;"></div>

      <!-- Abilities (compact) -->
      ${generateCompactAbilitiesHTML(items, monster.organization as string | undefined)}

      <!-- Tracking Section -->
      <div style="
        margin-top: 8px;
        padding: 6px;
        background: #f8f8f8;
        border-radius: 3px;
        border: 1px solid #ddd;
      ">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.8rem;">
          <div>
            <strong style="font-size: 0.75rem; color: #666;">Malice Tracker:</strong>
            <div style="
              border: 2px solid #000;
              border-radius: 3px;
              padding: 8px;
              min-height: 25px;
              background: white;
              margin-top: 3px;
            "></div>
          </div>
          <div>
            <strong style="font-size: 0.75rem; color: #666;">Status/Conditions:</strong>
            <div style="
              border: 1px solid #999;
              border-radius: 3px;
              padding: 8px;
              min-height: 25px;
              background: white;
              margin-top: 3px;
            "></div>
          </div>
        </div>
      </div>
    </div>
  `
}

/**
 * Generate compact abilities HTML
 */
function generateCompactAbilitiesHTML(items: Array<Record<string, unknown>>, organization?: string): string {
  if (!items || items.length === 0) return '<div style="font-size: 0.85rem; color: #999; font-style: italic;">No abilities</div>'

  return items.map(item => {
    const system = item.system as Record<string, unknown> | undefined
    const isSignature = system?.category === 'signature'
    const hasPowerRoll = actionHasPowerRoll(item as never)
    const distance = system?.distance as Record<string, unknown> | undefined
    const target = system?.target as Record<string, unknown> | undefined
    const trigger = system?.trigger as string | undefined
    const power = system?.power as Record<string, unknown> | undefined
    const effect = system?.effect as Record<string, string> | undefined
    const description = system?.description as Record<string, string> | undefined
    const keywords = system?.keywords as string[] | undefined

    return `
      <div style="margin-bottom: 8px; font-size: 0.8rem; page-break-inside: avoid;">
        <div style="margin-bottom: 3px;">
          <strong style="color: #8b4513; font-size: 0.9rem;">${item.name}</strong>
          ${isSignature ? '<span style="color: #ff6b6b; font-size: 0.75rem; margin-left: 4px;">[SIGNATURE]</span>' : ''}
          ${system?.type && system.type !== 'none' ? 
            `<span style="color: #666; font-size: 0.75rem; margin-left: 4px;">(${system.type})</span>` : ''}
        </div>

        ${distance ? `
          <div style="color: #666; font-size: 0.75rem; margin-bottom: 2px;">
            ${formatActionDistance(distance as never)} • ${formatActionTargets(target as never, organization)}
          </div>
        ` : ''}

        ${trigger ? `
          <div style="
            background: #fff3cd;
            padding: 3px 5px;
            border-radius: 2px;
            font-size: 0.75rem;
            margin-bottom: 3px;
          ">
            <strong>Trigger:</strong> ${stripHTML(trigger)}
          </div>
        ` : ''}

        ${hasPowerRoll && power?.tiers ? `
          <div style="margin: 3px 0; font-size: 0.75rem;">
            ${(power.tiers as Array<Record<string, unknown>>).map((tier: Record<string, unknown>) => `
              <div><strong>${formatTierNumber(tier.tier as number)}:</strong> ${stripHTML(tier.display as string)}</div>
            `).join('')}
          </div>
        ` : ''}

        ${effect?.text || description?.value ? `
          <div style="color: #555; font-size: 0.75rem; line-height: 1.3;">
            ${stripHTML(effect?.text || description?.value || '')}
          </div>
        ` : ''}

        ${keywords && keywords.length > 0 ? `
          <div style="
            font-size: 0.7rem;
            color: #999;
            font-style: italic;
            margin-top: 2px;
            padding-top: 2px;
            border-top: 1px solid #eee;
          ">
            ${formatKeywords(keywords)}
          </div>
        ` : ''}
      </div>
    `
  }).join('')
}
