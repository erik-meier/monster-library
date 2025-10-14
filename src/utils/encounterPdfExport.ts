import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import type { EncounterMonster, InitiativeGroup } from '@/stores/encounter'
import type { PartyConfiguration } from '@/utils/encounterBalance'
import { 
  calculateBudgetUsage, 
  getCurrentEncounterDifficulty 
} from '@/utils/encounterBalance'
import { getMonster } from '@/data/monsters.js'
// @ts-expect-error - Dynamic import for data bundle
import { getMaliceFeature } from '@/data/monsters-bundle.js'

export interface EncounterExportData {
  name: string
  description?: string
  monsters: EncounterMonster[]
  initiativeGroups: InitiativeGroup[]
  targetEV: number
  party: PartyConfiguration
  objectives?: string
  specialRules?: string
  maliceFeatures?: Array<{
    id: string
    name: string
    level: number
    flavor?: string
  }>
}

/**
 * Export encounter to PDF with template-based single-page layout
 */
export async function exportEncounterToPDF(encounter: EncounterExportData): Promise<void> {
  try {
    // Create PDF in landscape for better template layout
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidthMm = pdf.internal.pageSize.getWidth()
    const pageHeightMm = pdf.internal.pageSize.getHeight()
    const marginMm = 8
    const contentWidthMm = pageWidthMm - marginMm * 2
    const contentHeightMm = pageHeightMm - marginMm * 2

    // CSS mm to px conversion at 96 DPI
    const cssPxPerMm = 96 / 25.4
    const contentWidthPx = Math.floor(contentWidthMm * cssPxPerMm)
    const contentHeightPx = Math.floor(contentHeightMm * cssPxPerMm)

    // Create temporary container with fixed dimensions for single-page template
    const tempDiv = document.createElement('div')
    tempDiv.style.position = 'absolute'
    tempDiv.style.top = '-9999px'
    tempDiv.style.left = '-9999px'
    tempDiv.style.width = `${contentWidthPx}px`
    tempDiv.style.height = `${contentHeightPx}px`
    tempDiv.style.maxWidth = `${contentWidthPx}px`
    tempDiv.style.maxHeight = `${contentHeightPx}px`
    tempDiv.style.backgroundColor = 'white'
    tempDiv.style.padding = '6mm'
    tempDiv.style.boxSizing = 'border-box'
    tempDiv.style.fontFamily = 'Arial, sans-serif'
    tempDiv.style.fontSize = '9px'
    tempDiv.style.lineHeight = '1.2'
    tempDiv.style.overflow = 'hidden'

    // Generate encounter sheet HTML
    tempDiv.innerHTML = await generateEncounterHTML(encounter)

    // Add to DOM
    document.body.appendChild(tempDiv)

    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 500))

    // Capture as canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: 'white',
      width: tempDiv.offsetWidth,
      height: tempDiv.offsetHeight,
      windowWidth: tempDiv.offsetWidth,
      windowHeight: tempDiv.offsetHeight
    })

    // Remove from DOM
    document.body.removeChild(tempDiv)

    // Add single page to PDF
    const imgData = canvas.toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', marginMm, marginMm, contentWidthMm, contentHeightMm)

    // Add footer
    pdf.setFontSize(7)
    pdf.setTextColor(120)
    const footerText = 'Generated with Steel Cauldron'
    const textWidth = pdf.getTextWidth(footerText)
    pdf.text(footerText, (pageWidthMm - textWidth) / 2, pageHeightMm - 3)

    // Download
    const fileName = `${encounter.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'encounter'}_sheet.pdf`
    pdf.save(fileName)

  } catch (error) {
    console.error('Error generating encounter PDF:', error)
    throw new Error('Failed to generate encounter PDF. Please try again.')
  }
}

/**
 * Generate a stat box like in the official template
 */
function generateStatBox(label: string, value: string): string {
  return `
    <div style="
      border: 2px solid #000;
      padding: 4px;
      text-align: center;
      background: white;
    ">
      <div style="
        font-size: 8px;
        font-weight: bold;
        margin-bottom: 2px;
        text-transform: uppercase;
        color: #000;
      ">${label}</div>
      <div style="
        font-size: 20px;
        font-weight: bold;
        line-height: 1;
        color: #000;
      ">${value}</div>
    </div>
  `
}

/**
 * Get difficulty text based on EV vs party strength
 */
function getDifficultyText(encounter: EncounterExportData): string {
  // Convert EncounterMonster[] to MonsterInEncounter[] format
  const monsters = encounter.monsters.map(monster => ({
    id: monster.id,
    name: monster.name,
    level: monster.level,
    ev: monster.ev,
    organization: monster.organization,
    role: monster.role,
    count: monster.count
  }))
  
  // Calculate total encounter strength (EV)
  const encounterStrength = calculateBudgetUsage(monsters)
  
  // Get difficulty based on party vs encounter strength
  return getCurrentEncounterDifficulty(encounter.party, encounterStrength)
}

/**
 * Get malice features for the encounter with full details
 */
function getMaliceFeatures(encounter: EncounterExportData): string {
  // Use actual malice features from encounter data
  if (!encounter.maliceFeatures || encounter.maliceFeatures.length === 0) {
    return '<span style="color: #666; font-style: italic;">No malice features selected</span>'
  }

  // Calculate total text content length to determine font sizing
  let totalContentLength = 0
  const fullContentHTML: string[] = []
  
  // First pass: generate HTML and calculate total content length
  encounter.maliceFeatures.forEach(feature => {
    try {
      // Get full malice feature data
      const maliceData = getMaliceFeature(feature.id) as {
        name: string
        level?: number
        flavor?: string
        features?: Array<{
          name: string
          cost?: string
          effects?: Array<{
            effect?: string
            tier1?: string
            tier2?: string
            tier3?: string
          }>
        }>
      }
      
      if (!maliceData) {
        const fallbackHTML = `<div style="margin-bottom: 8px;"><strong>${feature.name} (Level ${feature.level})</strong><br/>Feature data not found</div>`
        fullContentHTML.push(fallbackHTML)
        totalContentLength += (feature.name + feature.level).toString().length
        return
      }

      // Calculate text content for this feature
      let featureTextLength = maliceData.name.length
      if (maliceData.flavor) featureTextLength += maliceData.flavor.length
      
      if (maliceData.features) {
        maliceData.features.forEach(subFeature => {
          featureTextLength += subFeature.name.length
          if (subFeature.effects) {
            subFeature.effects.forEach(effect => {
              if (effect.effect) featureTextLength += effect.effect.length
              if (effect.tier1) featureTextLength += effect.tier1.length
              if (effect.tier2) featureTextLength += effect.tier2.length
              if (effect.tier3) featureTextLength += effect.tier3.length
            })
          }
        })
      }
      
      totalContentLength += featureTextLength

      let html = `<div style="margin-bottom: 12px; padding-left: 4px;">
        <div style="font-weight: bold; color: #000; margin-bottom: 4px;">${maliceData.name}</div>`
      
      if (maliceData.level) {
        html += `<div style="color: #666; margin-bottom: 4px;">Level ${maliceData.level}</div>`
      }
      
      if (maliceData.flavor) {
        html += `<div style="color: #333; font-style: italic; margin-bottom: 6px;">${maliceData.flavor}</div>`
      }

      // Add features if they exist
      if (maliceData.features && maliceData.features.length > 0) {
        maliceData.features.forEach((subFeature) => {
          html += `<div style="margin-bottom: 6px;">
            <div style="font-weight: bold; color: #000;">
              ${subFeature.name}${subFeature.cost ? ` (${subFeature.cost})` : ''}
            </div>`
          
          if (subFeature.effects && subFeature.effects.length > 0) {
            subFeature.effects.forEach((effect) => {
              if (effect.effect) {
                html += `<div style="color: #333; margin: 2px 0;">${effect.effect}</div>`
              }
              
              // Add tier effects if they exist
              if (effect.tier1 || effect.tier2 || effect.tier3) {
                html += `<div style="margin: 4px 0;">`
                if (effect.tier1) {
                  html += `<div style="margin: 1px 0;"><strong style="font-family: 'DS Open Glyphs', sans-serif;">{</strong> ${effect.tier1}</div>`
                }
                if (effect.tier2) {
                  html += `<div style="margin: 1px 0;"><strong style="font-family: 'DS Open Glyphs', sans-serif;">_</strong> ${effect.tier2}</div>`
                }
                if (effect.tier3) {
                  html += `<div style="margin: 1px 0;"><strong style="font-family: 'DS Open Glyphs', sans-serif;">}</strong> ${effect.tier3}</div>`
                }
                html += `</div>`
              }
            })
          }
          html += `</div>`
        })
      }
      
      html += `</div>`
      fullContentHTML.push(html)
    } catch (error) {
      console.warn('Error loading malice feature data:', feature.id, error)
      const fallbackHTML = `<div style="margin-bottom: 8px;"><strong>${feature.name} (Level ${feature.level})</strong><br/>${feature.flavor || 'Feature details unavailable'}</div>`
      fullContentHTML.push(fallbackHTML)
      totalContentLength += (feature.name + (feature.flavor || 'Feature details unavailable')).length
    }
  })

  // Determine font sizes based on total content length
  let titleFontSize = '11px'
  let contentFontSize = '9px'
  let featureFontSize = '10px'
  
  if (totalContentLength > 2000) {
    // Very long content - make everything smaller
    titleFontSize = '9px'
    contentFontSize = '7px'
    featureFontSize = '8px'
  } else if (totalContentLength > 1000) {
    // Long content - make moderately smaller
    titleFontSize = '10px'
    contentFontSize = '8px'
    featureFontSize = '9px'
  }

  // Apply dynamic font sizing to the generated HTML
  const styledHTML = fullContentHTML.map(html => {
    return html
      .replace(/font-size:\s*11px/g, `font-size: ${titleFontSize}`)
      .replace(/font-size:\s*10px/g, `font-size: ${featureFontSize}`)
      .replace(/font-size:\s*9px/g, `font-size: ${contentFontSize}`)
  }).join('')

  return styledHTML
}

/**
 * Generate round tracker boxes (horizontal layout)
 */
function generateRoundBoxes(): string {
  return `
    <div style="
      display: flex;
      align-items: center;
      gap: 4px;
    ">
      <span style="font-size: 12px; font-weight: bold; margin-right: 8px; color: #000;">Round</span>
      ${Array.from({ length: 5 }, (_, i) => `
        <div style="
          border: 2px solid #000;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: bold;
          background: white;
          color: #000;
        ">${i + 1}</div>
      `).join('')}
    </div>
  `
}

/**
 * Generate stamina tracker for a monster
 */
function generateStaminaTracker(monster: EncounterMonster, stamina?: number): string {
  if (!stamina) {
    return '□'.repeat(monster.count)
  }
  
  // For minions (stamina <= 5), show progressive totals like 3/6/9/12
  if (stamina <= 5 && monster.count > 1) {
    return Array.from({ length: monster.count }, (_, i) => 
      (stamina * (i + 1)).toString()
    ).join('/')
  }
  
  // For regular monsters, show individual stamina values
  return Array.from({ length: monster.count }, () => stamina.toString()).join('/')
}

/**
 * Generate encounter roster table
 */
async function generateEncounterRosterTable(encounter: EncounterExportData): Promise<string> {
  const sortedGroups = [...encounter.initiativeGroups].sort((a, b) => a.order - b.order)
  const ungroupedMonsters = encounter.monsters.filter(m => !m.groupId)
  
  // Fetch monster data to get stamina values
  const monsterDataMap = new Map<string, { stamina?: number }>()
  for (const monster of encounter.monsters) {
    if (!monsterDataMap.has(monster.id)) {
      try {
        // Extract base monster ID by removing timestamp suffix (everything after underscore)
        const baseId = monster.id.split('_')[0]
        const fullMonster = await getMonster(baseId) as { stamina?: number }
        if (fullMonster && typeof fullMonster.stamina === 'number') {
          monsterDataMap.set(monster.id, { stamina: fullMonster.stamina })
        } else {
          console.warn(`Monster ${baseId} (${monster.name}) has no stamina data or invalid stamina:`, fullMonster?.stamina)
          monsterDataMap.set(monster.id, {})
        }
      } catch (error) {
        console.warn(`Could not load full data for monster ${monster.id.split('_')[0]}`, error)
        monsterDataMap.set(monster.id, {})
      }
    }
  }
  
  // Combine grouped and ungrouped monsters for the table
  const allMonsterEntries: Array<{
    groupNumber: string
    name: string
    creatures: string
    totalEV: number
    staminaTracker: string
    status: string
  }> = []

  // Add grouped monsters
  for (let i = 0; i < sortedGroups.length; i++) {
    const group = sortedGroups[i]
    const groupMonsters = encounter.monsters.filter(m => m.groupId === group.id)
    
    // Add individual monsters in group with group number
    for (const monster of groupMonsters) {
      const monsterData = monsterDataMap.get(monster.id)
      const captainIndicator = monster.isCaptain ? ' ★' : ''
      allMonsterEntries.push({
        groupNumber: (i + 1).toString(),
        name: monster.name + captainIndicator,
        creatures: `${monster.count}×`,
        totalEV: monster.ev * monster.count,
        staminaTracker: generateStaminaTracker(monster, monsterData?.stamina),
        status: ''
      })
    }
  }

  // Add ungrouped monsters
  for (const monster of ungroupedMonsters) {
    const monsterData = monsterDataMap.get(monster.id)
    const captainIndicator = monster.isCaptain ? ' ★' : ''
    allMonsterEntries.push({
      groupNumber: '-',
      name: monster.name + captainIndicator,
      creatures: `${monster.count}×`,
      totalEV: monster.ev * monster.count,
      staminaTracker: generateStaminaTracker(monster, monsterData?.stamina),
      status: ''
    })
  }

  // Calculate dynamic row heights based on number of entries
  // Available space: roughly 300px, minus header (36px) = 264px
  const availableHeight = 264
  const headerHeight = 36
  const minRowHeight = 24
  const maxRowHeight = 40
  
  const numRows = allMonsterEntries.length
  const dynamicRowHeight = Math.max(minRowHeight, Math.min(maxRowHeight, (availableHeight - headerHeight) / numRows))
  
  // Adjust font sizes based on row height
  let cellFontSize = '12px'
  let headerFontSize = '12px'
  
  if (dynamicRowHeight < 30) {
    cellFontSize = '10px'
    headerFontSize = '11px'
  }
  if (dynamicRowHeight < 26) {
    cellFontSize = '9px'
    headerFontSize = '10px'
  }

  return `
    <table style="
      width: 100%;
      border-collapse: collapse;
      font-size: ${cellFontSize};
      color: #000;
    ">
      <thead>
        <tr style="border-bottom: 2px solid #000; height: ${headerHeight}px;">
          <th style="
            padding: 4px 3px;
            text-align: center;
            font-weight: bold;
            font-size: ${headerFontSize};
            width: 8%;
            color: #000;
            vertical-align: middle;
          ">Group</th>
          <th style="
            padding: 4px 3px;
            text-align: left;
            font-weight: bold;
            font-size: ${headerFontSize};
            width: 22%;
            color: #000;
            vertical-align: middle;
          ">Name ★=Captain</th>
          <th style="
            padding: 4px 3px;
            text-align: center;
            font-weight: bold;
            font-size: ${headerFontSize};
            width: 10%;
            color: #000;
            vertical-align: middle;
          ">Count</th>
          <th style="
            padding: 4px 3px;
            text-align: center;
            font-weight: bold;
            font-size: ${headerFontSize};
            width: 8%;
            color: #000;
            vertical-align: middle;
          ">EV</th>
          <th style="
            padding: 4px 3px;
            text-align: center;
            font-weight: bold;
            font-size: ${headerFontSize};
            width: 18%;
            color: #000;
            vertical-align: middle;
          ">Stamina Tracker</th>
          <th style="
            padding: 4px 3px;
            text-align: left;
            font-weight: bold;
            font-size: ${headerFontSize};
            width: 34%;
            color: #000;
            vertical-align: middle;
          ">Notes/Effects</th>
        </tr>
      </thead>
      <tbody>
        ${allMonsterEntries.map((entry, index) => `
          <tr style="${index % 2 === 0 ? 'background: #f8f8f8;' : ''} border-bottom: 1px solid #ccc; height: ${dynamicRowHeight}px;">
            <td style="
              padding: 4px 3px;
              font-size: ${cellFontSize};
              text-align: center;
              color: #000;
              font-weight: bold;
              vertical-align: middle;
            ">${entry.groupNumber}</td>
            <td style="
              padding: 4px 3px;
              font-size: ${cellFontSize};
              color: #000;
              vertical-align: middle;
            ">${entry.name}</td>
            <td style="padding: 4px 3px; font-size: ${cellFontSize}; text-align: center; color: #000; vertical-align: middle;">${entry.creatures}</td>
            <td style="padding: 4px 3px; text-align: center; font-size: ${cellFontSize}; font-weight: bold; color: #000; vertical-align: middle;">${entry.totalEV || ''}</td>
            <td style="
              padding: 4px 3px;
              text-align: center;
              font-size: ${parseInt(cellFontSize) - 1}px;
              font-family: monospace;
              letter-spacing: 1px;
              color: #000;
              font-weight: bold;
              vertical-align: middle;
            ">${entry.staminaTracker}</td>
            <td style="
              padding: 4px 3px;
              font-size: ${parseInt(cellFontSize) - 1}px;
              border-left: 1px solid #ddd;
              min-height: ${dynamicRowHeight}px;
              color: #000;
              vertical-align: middle;
            ">${entry.status}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `
}

/**
 * Generate HTML for the template-based encounter sheet
 */
async function generateEncounterHTML(encounter: EncounterExportData): Promise<string> {
  const totalMonsters = encounter.monsters.reduce((sum, m) => sum + m.count, 0)
  const avgLevel = Math.round(encounter.monsters.reduce((sum, m) => 
    sum + (m.level * m.count), 0) / Math.max(totalMonsters, 1))

  // Get party size and victories from party configuration
  const partySize = encounter.party.heroes.length
  const totalVictories = (encounter.party.heroes.reduce((sum, hero) => sum + hero.victories, 0)/partySize || 0).toFixed(0)

  return `
    <div style="
      font-family: Arial, sans-serif;
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-rows: auto 1fr auto;
      gap: 10px;
      font-size: 12px;
      color: #000;
    ">
      <!-- Header with encounter title -->
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px 0;
        border-bottom: 3px solid #000;
        border-top: 1px solid #000;
        position: relative;
      ">
        <!-- Draw Steel branding in top left -->
        <div style="
          position: absolute;
          left: 8px;
          top: 8px;
          font-size: 10px;
          font-weight: bold;
          color: #666;
          letter-spacing: 1px;
        ">DRAW STEEL</div>
        
        <div style="
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 1px;
          background: #000;
        "></div>
        <h1 style="
          margin: 0;
          font-size: 18px;
          font-weight: bold;
          letter-spacing: 2px;
          text-align: center;
          color: #000;
        ">${encounter.name}</h1>
        <div style="
          position: absolute;
          left: 0;
          right: 0;
          bottom: -1px;
          height: 1px;
          background: #000;
        "></div>
      </div>

      <!-- Main content area -->
      <div style="
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 15px;
        height: 100%;
      ">
        <!-- Left side: Encounter details and roster -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${encounter.description ? `
            <!-- Encounter description -->
            <div style="text-align: center; padding: 6px;">
              <p style="
                margin: 0;
                font-size: 11px;
                color: #333;
                font-style: italic;
              ">${encounter.description}</p>
            </div>
          ` : ''}

          <!-- Condition boxes -->
          <div style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin: 8px 0;
          ">
            <div style="
              border: 2px solid #000;
              padding: 8px;
              text-align: left;
              background: white;
            ">
              <div style="
                font-size: 10px;
                font-weight: bold;
                margin-bottom: 4px;
                text-transform: uppercase;
                color: #000;
              ">SUCCESS CONDITION</div>
              <div style="
                min-height: 30px;
                border-bottom: 1px solid #ccc;
                margin: 4px 0;
              "></div>
            </div>
            <div style="
              border: 2px solid #000;
              padding: 8px;
              text-align: left;
              background: white;
            ">
              <div style="
                font-size: 10px;
                font-weight: bold;
                margin-bottom: 4px;
                text-transform: uppercase;
                color: #000;
              ">FAILURE CONDITION</div>
              <div style="
                min-height: 30px;
                border-bottom: 1px solid #ccc;
                margin: 4px 0;
              "></div>
            </div>
          </div>

          <!-- Stats boxes -->
          <div style="
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin: 8px 0;
          ">
            ${generateStatBox('NUMBER OF HEROES', partySize.toString())}
            ${generateStatBox('AVERAGE LEVEL', avgLevel.toString())}
            ${generateStatBox('HEROES\' VICTORIES', totalVictories.toString())}
            ${generateStatBox('DIFFICULTY', getDifficultyText(encounter))}
          </div>

          <!-- Encounter roster (moved up and expanded) -->
          <div style="
            border: 2px solid #000;
            padding: 8px;
            flex: 1;
          ">
            <h3 style="
              margin: 0 0 8px 0;
              font-size: 14px;
              font-weight: bold;
              text-align: center;
              text-decoration: underline;
              color: #000;
            ">ENCOUNTER ROSTER</h3>
            
            ${await generateEncounterRosterTable(encounter)}
          </div>
        </div>

        <!-- Right side: Malice and round trackers -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <!-- Round tracker (horizontal) -->
          <div style="
            border: 2px solid #000;
            padding: 10px;
          ">
            ${generateRoundBoxes()}
          </div>

          <!-- Malice tracker -->
          <div style="
            border: 2px solid #000;
            padding: 10px;
            text-align: center;
          ">
            <h3 style="
              margin: 0 0 8px 0;
              font-size: 14px;
              font-weight: bold;
              text-decoration: underline;
              color: #000;
            ">Malice</h3>
            <div style="
              border: 2px solid #000;
              height: 80px;
              background: white;
            "></div>
          </div>
          
          <!-- Malice features -->
          <div style="
            border: 2px solid #000;
            padding: 10px;
            flex: 1;
          ">
            <h4 style="
              margin: 0 0 8px 0;
              font-size: 12px;
              font-weight: bold;
              text-align: center;
              text-decoration: underline;
              color: #000;
            ">MALICE FEATURES</h4>
            <div style="font-size: 10px; line-height: 1.3; color: #000;">
              ${getMaliceFeatures(encounter)}
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}


