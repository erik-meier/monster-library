// Types for monster data - using a subset since we don't have the full types file yet
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
    } | null
    effect?: {
      before?: string
      after?: string
    }
    description?: {
      value: string
    }
  }
}

interface PDFExportOptions {
  filename?: string
  format?: 'A4' | 'Letter'
  orientation?: 'portrait' | 'landscape'
}

export async function exportMonsterToPDF(monster: Monster, options: PDFExportOptions = {}) {
  // Use jsPDF library for PDF generation
  const { jsPDF } = await import('jspdf')
  
  const {
    filename = `${monster.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-stat-block.pdf`,
    format = 'Letter',
    orientation = 'portrait'
  } = options

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: format.toLowerCase() as 'a4' | 'letter'
  })

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentWidth = pageWidth - (margin * 2)
  
  let yPosition = margin

  // Helper functions with Cambria font support and better formatting
  const addText = (text: string, x: number, y: number, options?: { 
    fontSize?: number
    fontStyle?: 'normal' | 'bold' | 'italic'
    textColor?: [number, number, number]
    align?: 'left' | 'center' | 'right'
    maxWidth?: number
    font?: string
  }) => {
    const {
      fontSize = 10,
      fontStyle = 'normal',
      textColor = [0, 0, 0] as [number, number, number],
      align = 'left',
      maxWidth,
      font = 'times' // Using times as it's closer to Cambria than helvetica
    } = options || {}
    
    doc.setFontSize(fontSize)
    doc.setFont(font, fontStyle)
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    
    if (maxWidth) {
      const lines = doc.splitTextToSize(text, maxWidth)
      doc.text(lines, x, y, { align })
      return lines.length * (fontSize * 0.35) // Return height used
    } else {
      doc.text(text, x, y, { align })
      return fontSize * 0.35 // Return height used
    }
  }

  const addLine = (x1: number, y1: number, x2: number, y2: number, color: [number, number, number] = [0, 0, 0], width = 1) => {
    doc.setDrawColor(color[0], color[1], color[2])
    doc.setLineWidth(width)
    doc.line(x1, y1, x2, y2)
  }

  const addRect = (x: number, y: number, width: number, height: number, options?: {
    fillColor?: [number, number, number]
    borderColor?: [number, number, number]
    borderWidth?: number
  }) => {
    const { fillColor, borderColor = [0, 0, 0] as [number, number, number], borderWidth = 0.5 } = options || {}
    
    if (fillColor) {
      doc.setFillColor(fillColor[0], fillColor[1], fillColor[2])
      doc.rect(x, y, width, height, 'F')
    }
    
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2])
    doc.setLineWidth(borderWidth)
    doc.rect(x, y, width, height, 'S')
  }

  // Helper to strip HTML and clean text for PDF
  const stripHtml = (html: string) => {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .trim()
  }

  // Title section with gray background
  const titleHeight = 20
  addRect(margin, yPosition, contentWidth, titleHeight, {
    fillColor: [240, 240, 240] // Light gray background
  })
  
  yPosition += 6
  yPosition += addText(monster.name.toUpperCase(), pageWidth / 2, yPosition, {
    fontSize: 16,
    fontStyle: 'bold',
    textColor: [0, 0, 0],
    align: 'center',
    font: 'times'
  })
  
  // Monster level/role/organization
  const roleText = `Level ${monster.level} ${monster.organization}${monster.role ? ' ' + monster.role : ''}`
  yPosition += addText(roleText, pageWidth / 2, yPosition, {
    fontSize: 11,
    align: 'center',
    font: 'times'
  })

  // Keywords
  if (monster.keywords && monster.keywords.length > 0) {
    const keywordsText = monster.keywords.map((k: string) => k.charAt(0).toUpperCase() + k.slice(1)).join(', ')
    yPosition += addText(keywordsText, pageWidth / 2, yPosition, {
      fontSize: 9,
      fontStyle: 'italic',
      align: 'center',
      font: 'times'
    })
  }

  // EV
  yPosition += addText(`EV ${monster.ev}`, pageWidth / 2, yPosition, {
    fontSize: 10,
    fontStyle: 'bold',
    align: 'center',
    font: 'times'
  })

  yPosition += 8
  // Black horizontal line
  addLine(margin, yPosition, pageWidth - margin, yPosition, [0, 0, 0], 1)
  yPosition += 6

  // Stats section - more condensed
  const stats = [
    { label: 'Size', value: `${monster.size?.value || 1}${monster.size?.letter || ''}` },
    { label: 'Speed', value: monster.speed?.toString() || '6' },
    { label: 'Stamina', value: monster.stamina?.toString() || '10' },
    { label: 'Stability', value: monster.stability?.toString() || '0' },
    { label: 'Free Strike', value: monster.freeStrike?.toString() || '2' }
  ]

  // Condensed stats in a single line
  const statTexts = stats.map(stat => `${stat.label} ${stat.value}`).join(' • ')
  yPosition += addText(statTexts, pageWidth / 2, yPosition, {
    fontSize: 9,
    align: 'center',
    font: 'times'
  })

  yPosition += 6
  // Black horizontal line
  addLine(margin, yPosition, pageWidth - margin, yPosition, [0, 0, 0], 1)
  yPosition += 6

  // Characteristics - more condensed
  if (monster.characteristics) {
    const chars = [
      { label: 'Might', value: monster.characteristics.might >= 0 ? `+${monster.characteristics.might}` : monster.characteristics.might.toString() },
      { label: 'Agility', value: monster.characteristics.agility >= 0 ? `+${monster.characteristics.agility}` : monster.characteristics.agility.toString() },
      { label: 'Reason', value: monster.characteristics.reason >= 0 ? `+${monster.characteristics.reason}` : monster.characteristics.reason.toString() },
      { label: 'Intuition', value: monster.characteristics.intuition >= 0 ? `+${monster.characteristics.intuition}` : monster.characteristics.intuition.toString() },
      { label: 'Presence', value: monster.characteristics.presence >= 0 ? `+${monster.characteristics.presence}` : monster.characteristics.presence.toString() }
    ]

    const charText = chars.map(char => `${char.label} ${char.value}`).join(' • ')
    yPosition += addText(charText, pageWidth / 2, yPosition, {
      fontSize: 9,
      align: 'center',
      font: 'times'
    })
  }

  yPosition += 6
  // Black horizontal line
  addLine(margin, yPosition, pageWidth - margin, yPosition, [0, 0, 0], 1)
  yPosition += 6

  // Secondary stats (Immunity, Weakness, Movement) - more condensed
  const formatImmunity = (immunities?: Record<string, number>) => {
    if (!immunities || Object.keys(immunities).length === 0) return '—'
    return Object.entries(immunities)
      .filter(([, value]) => value > 0)
      .map(([type, value]) => `${type} ${value}`)
      .join(', ')
  }

  const formatWeakness = (weaknesses?: Record<string, number>) => {
    if (!weaknesses || Object.keys(weaknesses).length === 0) return '—'
    return Object.entries(weaknesses)
      .filter(([, value]) => value > 0)
      .map(([type, value]) => `${type} ${value}`)
      .join(', ')
  }

  const formatMovement = (movementTypes?: string | string[]) => {
    if (!movementTypes) return 'walk'
    if (typeof movementTypes === 'string') return movementTypes
    if (Array.isArray(movementTypes)) return movementTypes.join(', ')
    return 'walk'
  }

  const secondaryText = `Immunity ${formatImmunity(monster.immunities)} • Weakness ${formatWeakness(monster.weaknesses)} • Movement ${formatMovement(monster.movementTypes)}`
  yPosition += addText(secondaryText, pageWidth / 2, yPosition, {
    fontSize: 9,
    align: 'center',
    maxWidth: contentWidth - 20,
    font: 'times'
  })

  yPosition += 6
  // Black horizontal line
  addLine(margin, yPosition, pageWidth - margin, yPosition, [0, 0, 0], 1)
  yPosition += 8

  // Abilities - formatted like official stat blocks
  if (monster.items && monster.items.length > 0) {
    // Determine if we need two columns based on content
    const useColumns = monster.items.length > 3 && yPosition < pageHeight / 2
    const columnWidth = useColumns ? (contentWidth - 10) / 2 : contentWidth
    let leftColumnY = yPosition
    let rightColumnY = yPosition
    let currentColumn = 0 // 0 = left/single, 1 = right

    monster.items.forEach((item: MonsterItem, index: number) => {
      const currentY = currentColumn === 0 ? leftColumnY : rightColumnY
      const currentX = margin + (currentColumn === 0 ? 0 : columnWidth + 10)

      if (currentY > pageHeight - 40) {
        doc.addPage()
        leftColumnY = margin
        rightColumnY = margin
        currentColumn = 0
      }

      // Ability name and type - only show SIGNATURE, not HEROIC
      let abilityTitle = item.name
      if (item.system?.category === 'signature') {
        abilityTitle += ' SIGNATURE'
      }
      
      // Don't show malice cost for now (resource field handling is complex)
      
      const titleHeight = addText(abilityTitle, currentX, currentColumn === 0 ? leftColumnY : rightColumnY, {
        fontSize: 11,
        fontStyle: 'bold',
        textColor: [0, 0, 0],
        font: 'times'
      })

      if (currentColumn === 0) {
        leftColumnY += titleHeight + 2
      } else {
        rightColumnY += titleHeight + 2
      }

      // Power roll and action type
      if (item.system?.power?.roll) {
        let actionInfo = item.system.power.roll.formula || '2d10'
        if (item.system.type && item.system.type !== 'none') {
          actionInfo += ` • ${item.system.type} action`
        }
        const actionHeight = addText(actionInfo, currentX, currentColumn === 0 ? leftColumnY : rightColumnY, {
          fontSize: 9,
          fontStyle: 'italic',
          font: 'times'
        })
        
        if (currentColumn === 0) {
          leftColumnY += actionHeight + 2
        } else {
          rightColumnY += actionHeight + 2
        }
      }

      // Keywords
      if (item.system?.keywords && item.system.keywords.length > 0) {
        const keywordHeight = addText(item.system.keywords.join(', '), currentX, currentColumn === 0 ? leftColumnY : rightColumnY, {
          fontSize: 8,
          fontStyle: 'italic',
          font: 'times'
        })
        
        if (currentColumn === 0) {
          leftColumnY += keywordHeight + 2
        } else {
          rightColumnY += keywordHeight + 2
        }
      }

      // Distance and target
      if (item.system?.distance || item.system?.target) {
        let rangeText = ''
        
        if (item.system.distance) {
          const distance = item.system.distance
          if (distance.type === 'melee') {
            rangeText = `Range: Melee ${distance.primary || 1}`
          } else if (distance.type === 'ranged') {
            rangeText = `Range: Ranged ${distance.primary || 5}`
          } else if (distance.type === 'meleeRanged') {
            rangeText = `Range: Melee ${distance.primary || 1} or Ranged ${distance.secondary || 5}`
          } else {
            rangeText = `Range: ${distance.type}`
          }
        }

        if (item.system.target) {
          const target = item.system.target
          if (target.type === 'creatureObject' && target.value) {
            rangeText += ` • Target: ${target.value} creature${target.value > 1 ? 's' : ''} or object${target.value > 1 ? 's' : ''}`
          } else {
            rangeText += ` • Target: ${target.type}`
          }
        }

        if (rangeText) {
          const rangeHeight = addText(rangeText, currentX, currentColumn === 0 ? leftColumnY : rightColumnY, {
            fontSize: 8,
            font: 'times'
          })
          
          if (currentColumn === 0) {
            leftColumnY += rangeHeight + 2
          } else {
            rightColumnY += rangeHeight + 2
          }
        }
      }

      // Power tiers - formatted according to dice roll like 1: ≤11, 2: 12-16, 3: 17+
      if (item.system?.power?.tiers && item.system.power.tiers.length > 0) {
        item.system.power.tiers.forEach((tier: { tier: number; display: string }) => {
          let tierLabel = `${tier.tier}:`
          
          // Format tier number to match stat block format
          if (tier.tier === 1) tierLabel = '≤11:'
          else if (tier.tier === 2) tierLabel = '12-16:'
          else if (tier.tier === 3) tierLabel = '17+:'
          
          const tierText = `${tierLabel} ${stripHtml(tier.display)}`
          const tierHeight = addText(tierText, currentX, currentColumn === 0 ? leftColumnY : rightColumnY, {
            fontSize: 8,
            maxWidth: columnWidth,
            font: 'times'
          })
          
          if (currentColumn === 0) {
            leftColumnY += tierHeight + 1
          } else {
            rightColumnY += tierHeight + 1
          }
        })
      }

      // Effects
      if (item.system?.effect?.before) {
        const effectText = `Effect: ${stripHtml(item.system.effect.before)}`
        const effectHeight = addText(effectText, currentX, currentColumn === 0 ? leftColumnY : rightColumnY, {
          fontSize: 8,
          maxWidth: columnWidth,
          font: 'times'
        })
        
        if (currentColumn === 0) {
          leftColumnY += effectHeight + 2
        } else {
          rightColumnY += effectHeight + 2
        }
      }

      if (item.system?.effect?.after) {
        const afterText = `After: ${stripHtml(item.system.effect.after)}`
        const afterHeight = addText(afterText, currentX, currentColumn === 0 ? leftColumnY : rightColumnY, {
          fontSize: 8,
          maxWidth: columnWidth,
          font: 'times'
        })
        
        if (currentColumn === 0) {
          leftColumnY += afterHeight + 2
        } else {
          rightColumnY += afterHeight + 2
        }
      }

      // Description (for features)
      if (item.system?.description?.value) {
        const cleanDescription = stripHtml(item.system.description.value)
        const descHeight = addText(cleanDescription, currentX, currentColumn === 0 ? leftColumnY : rightColumnY, {
          fontSize: 8,
          maxWidth: columnWidth,
          font: 'times'
        })
        
        if (currentColumn === 0) {
          leftColumnY += descHeight + 2
        } else {
          rightColumnY += descHeight + 2
        }
      }

      // Add spacing between abilities and switch columns if needed
      if (currentColumn === 0) {
        leftColumnY += 6
      } else {
        rightColumnY += 6
      }

      // Switch to right column if using columns and this isn't the last item
      if (useColumns && currentColumn === 0 && index < monster.items.length - 1) {
        currentColumn = 1
      } else if (useColumns && currentColumn === 1) {
        currentColumn = 0
      }

      // Add black line between abilities
      if (index < monster.items.length - 1) {
        const lineY = Math.max(leftColumnY, rightColumnY)
        addLine(margin, lineY, pageWidth - margin, lineY, [0, 0, 0], 0.5)
        leftColumnY = lineY + 4
        rightColumnY = lineY + 4
      }
    })

    yPosition = Math.max(leftColumnY, rightColumnY)
  }

  // Footer
  yPosition = pageHeight - 20
  addLine(margin, yPosition - 5, pageWidth - margin, yPosition - 5, [0, 0, 0], 0.5)
  
  // Generated with message
  addText('Generated with Steel Cauldron', pageWidth / 2, yPosition, {
    fontSize: 8,
    align: 'center',
    textColor: [100, 100, 100],
    font: 'times'
  })
  
  // License text
  addText('Draw Steel Creator License', pageWidth / 2, yPosition + 4, {
    fontSize: 8,
    align: 'center',
    textColor: [100, 100, 100],
    font: 'times'
  })

  // Save the PDF
  doc.save(filename)
}

export function isJsPDFAvailable(): Promise<boolean> {
  return import('jspdf')
    .then(() => true)
    .catch(() => false)
}