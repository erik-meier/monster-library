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

  // Helper functions
  const addText = (text: string, x: number, y: number, options?: { 
    fontSize?: number
    fontStyle?: 'normal' | 'bold' | 'italic'
    textColor?: [number, number, number]
    align?: 'left' | 'center' | 'right'
    maxWidth?: number
  }) => {
    const {
      fontSize = 10,
      fontStyle = 'normal',
      textColor = [0, 0, 0] as [number, number, number],
      align = 'left',
      maxWidth
    } = options || {}
    
    doc.setFontSize(fontSize)
    doc.setFont('helvetica', fontStyle)
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

  const addLine = (x1: number, y1: number, x2: number, y2: number, color: [number, number, number] = [0, 0, 0], width = 0.5) => {
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

  // Title and main info
  yPosition += addText(monster.name.toUpperCase(), pageWidth / 2, yPosition, {
    fontSize: 18,
    fontStyle: 'bold',
    textColor: [139, 69, 19], // Brown color for Draw Steel theme
    align: 'center'
  })

  yPosition += 5
  
  // Monster level/role/organization
  const roleText = `Level ${monster.level} ${monster.organization}${monster.role ? ' ' + monster.role : ''}`
  yPosition += addText(roleText, pageWidth / 2, yPosition, {
    fontSize: 12,
    fontStyle: 'italic',
    align: 'center'
  })

  // Keywords
  if (monster.keywords && monster.keywords.length > 0) {
    yPosition += 3
    const keywordsText = monster.keywords.map((k: string) => k.charAt(0).toUpperCase() + k.slice(1)).join(', ')
    yPosition += addText(keywordsText, pageWidth / 2, yPosition, {
      fontSize: 10,
      fontStyle: 'italic',
      align: 'center'
    })
  }

  // EV
  yPosition += 3
  yPosition += addText(`EV ${monster.ev}`, pageWidth / 2, yPosition, {
    fontSize: 11,
    fontStyle: 'bold',
    align: 'center'
  })

  yPosition += 8
  addLine(margin, yPosition, pageWidth - margin, yPosition, [139, 69, 19], 1)
  yPosition += 6

  // Stats section
  const stats = [
    { label: 'Size', value: `${monster.size?.value || 1}${monster.size?.letter || ''}` },
    { label: 'Speed', value: monster.speed?.toString() || '6' },
    { label: 'Stamina', value: monster.stamina?.toString() || '10' },
    { label: 'Stability', value: monster.stability?.toString() || '0' },
    { label: 'Free Strike', value: monster.freeStrike?.toString() || '2' }
  ]

  // Stats header
  const statWidth = contentWidth / 5
  let xPos = margin
  
  stats.forEach(stat => {
    addText(stat.label, xPos + (statWidth / 2), yPosition, {
      fontSize: 9,
      fontStyle: 'bold',
      align: 'center'
    })
    xPos += statWidth
  })

  yPosition += 5
  
  // Stats values
  xPos = margin
  stats.forEach(stat => {
    addText(stat.value, xPos + (statWidth / 2), yPosition, {
      fontSize: 11,
      align: 'center'
    })
    xPos += statWidth
  })

  yPosition += 10
  addLine(margin, yPosition, pageWidth - margin, yPosition, [139, 69, 19], 1)
  yPosition += 6

  // Characteristics
  if (monster.characteristics) {
    const chars = [
      { label: 'Might', value: monster.characteristics.might >= 0 ? `+${monster.characteristics.might}` : monster.characteristics.might.toString() },
      { label: 'Agility', value: monster.characteristics.agility >= 0 ? `+${monster.characteristics.agility}` : monster.characteristics.agility.toString() },
      { label: 'Reason', value: monster.characteristics.reason >= 0 ? `+${monster.characteristics.reason}` : monster.characteristics.reason.toString() },
      { label: 'Intuition', value: monster.characteristics.intuition >= 0 ? `+${monster.characteristics.intuition}` : monster.characteristics.intuition.toString() },
      { label: 'Presence', value: monster.characteristics.presence >= 0 ? `+${monster.characteristics.presence}` : monster.characteristics.presence.toString() }
    ]

    const charWidth = contentWidth / 5
    xPos = margin

    chars.forEach(char => {
      // Label
      addText(char.label, xPos + (charWidth / 2), yPosition, {
        fontSize: 9,
        fontStyle: 'bold',
        align: 'center'
      })
      
      // Value
      addText(char.value, xPos + (charWidth / 2), yPosition + 4, {
        fontSize: 11,
        align: 'center'
      })
      
      xPos += charWidth
    })

    yPosition += 15
  }

  addLine(margin, yPosition, pageWidth - margin, yPosition, [139, 69, 19], 1)
  yPosition += 6

  // Secondary stats (Immunity, Weakness, Movement)
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

  const secondaryStats = [
    { label: 'Immunity', value: formatImmunity(monster.immunities) },
    { label: 'Weakness', value: formatWeakness(monster.weaknesses) },
    { label: 'Movement', value: formatMovement(monster.movementTypes) }
  ]

  secondaryStats.forEach(stat => {
    const text = `${stat.label} ${stat.value}`
    yPosition += addText(text, pageWidth / 2, yPosition, {
      fontSize: 10,
      align: 'center',
      maxWidth: contentWidth - 20
    })
    yPosition += 2
  })

  yPosition += 5
  addLine(margin, yPosition, pageWidth - margin, yPosition, [139, 69, 19], 1)
  yPosition += 8

  // Abilities
  if (monster.items && monster.items.length > 0) {
    monster.items.forEach((item: MonsterItem, index: number) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage()
        yPosition = margin
      }

      // Ability name and type
      let abilityTitle = item.name
      if (item.system?.category === 'signature') {
        abilityTitle += ' SIGNATURE'
      } else if (item.system?.category === 'heroic') {
        abilityTitle += ' HEROIC'
      }

      if (item.system?.resource && item.system.resource > 0) {
        abilityTitle += ` ${item.system.resource} Malice`
      }

      yPosition += addText(abilityTitle, margin, yPosition, {
        fontSize: 12,
        fontStyle: 'bold',
        textColor: [139, 69, 19]
      })

      // Power roll and action type
      if (item.system?.power?.roll) {
        yPosition += 2
        let actionInfo = item.system.power.roll.formula || '2d10'
        if (item.system.type && item.system.type !== 'none') {
          actionInfo += ` • ${item.system.type} action`
        }
        yPosition += addText(actionInfo, margin, yPosition, {
          fontSize: 10,
          fontStyle: 'italic'
        })
      }

      // Keywords
      if (item.system?.keywords && item.system.keywords.length > 0) {
        yPosition += 2
        yPosition += addText(item.system.keywords.join(', '), margin, yPosition, {
          fontSize: 9,
          fontStyle: 'italic'
        })
      }

      // Distance and target
      if (item.system?.distance || item.system?.target) {
        yPosition += 3
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
          yPosition += addText(rangeText, margin + 5, yPosition, {
            fontSize: 9
          })
        }
      }

      // Power tiers
      if (item.system?.power?.tiers && item.system.power.tiers.length > 0) {
        yPosition += 4
        item.system.power.tiers.forEach((tier: { tier: number; display: string }) => {
          yPosition += addText(`${tier.tier}: ${tier.display}`, margin + 5, yPosition, {
            fontSize: 9,
            maxWidth: contentWidth - 10
          })
          yPosition += 1
        })
      }

      // Effects
      if (item.system?.effect?.before) {
        yPosition += 3
        yPosition += addText(`Effect: ${item.system.effect.before}`, margin + 5, yPosition, {
          fontSize: 9,
          maxWidth: contentWidth - 10
        })
      }

      if (item.system?.effect?.after) {
        yPosition += 3
        yPosition += addText(`After: ${item.system.effect.after}`, margin + 5, yPosition, {
          fontSize: 9,
          maxWidth: contentWidth - 10
        })
      }

      // Description (for features)
      if (item.system?.description?.value) {
        yPosition += 3
        // Strip HTML tags and decode entities for PDF
        const cleanDescription = item.system.description.value
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
        
        yPosition += addText(cleanDescription, margin + 5, yPosition, {
          fontSize: 9,
          maxWidth: contentWidth - 10
        })
      }

      yPosition += 8
    })
  }

  // Footer
  yPosition = pageHeight - 20
  addLine(margin, yPosition - 5, pageWidth - margin, yPosition - 5, [139, 69, 19], 0.5)
  
  // Generated with message
  addText('Generated with Steel Cauldron', pageWidth / 2, yPosition, {
    fontSize: 8,
    align: 'center',
    textColor: [100, 100, 100]
  })
  
  // License text
  addText('Draw Steel Creator License', pageWidth / 2, yPosition + 4, {
    fontSize: 8,
    align: 'center',
    textColor: [100, 100, 100]
  })

  // Save the PDF
  doc.save(filename)
}

export function isJsPDFAvailable(): Promise<boolean> {
  return import('jspdf')
    .then(() => true)
    .catch(() => false)
}