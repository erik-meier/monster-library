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
    trigger?: string
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

  // Title: Monster Name
  addText(monster.name.toUpperCase(), margin, yPosition, {
    fontSize: 20,
    fontStyle: 'bold',
    font: 'times'
  })

  // Level and EV on the right
  const levelText = `Level ${monster.level} ${monster.organization || ''}${monster.role ? ` ${monster.role}` : ''}`.trim()
  addText(levelText, pageWidth - margin, yPosition, {
    fontSize: 12,
    align: 'right',
    font: 'times'
  })

  const evText = `EV ${monster.ev}`
  addText(evText, pageWidth - margin, yPosition + 5, {
    fontSize: 12,
    align: 'right',
    font: 'times'
  })

  yPosition += 8

  // Keywords below name
  if (monster.keywords && monster.keywords.length > 0) {
    const keywordsText = monster.keywords.map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(', ')
    addText(keywordsText, margin, yPosition, {
      fontSize: 10,
      fontStyle: 'italic',
      font: 'times'
    })
  }

  yPosition += 10
  // Black horizontal line
  addLine(margin, yPosition, pageWidth - margin, yPosition, [0, 0, 0], 0.5)
  yPosition += 6

  // Stats section - more condensed
  const stats = [
    { label: 'Size', value: `${monster.size?.value || 1}${monster.size?.letter || ''}` },
    { label: 'Speed', value: monster.speed?.toString() || '6' },
    { label: 'Stamina', value: monster.stamina?.toString() || '10' },
    { label: 'Stability', value: monster.stability?.toString() || '0' },
    { label: 'Free Strike', value: monster.freeStrike?.toString() || '2' }
  ]

  // Stats section - boxed layout
  const statBoxWidth = (contentWidth - (4 * 2)) / 5 // 5 boxes with 2mm gap
  const statBoxHeight = 15
  let currentX = margin

  stats.forEach(stat => {
    addRect(currentX, yPosition, statBoxWidth, statBoxHeight)
    addText(stat.value, currentX + statBoxWidth / 2, yPosition + 7, {
      fontSize: 12,
      fontStyle: 'bold',
      align: 'center',
      font: 'times'
    })
    addText(stat.label, currentX + statBoxWidth / 2, yPosition + 12, {
      fontSize: 8,
      align: 'center',
      font: 'times'
    })
    currentX += statBoxWidth + 2
  })

  yPosition += statBoxHeight + 4

  // Black horizontal line
  addLine(margin, yPosition, pageWidth - margin, yPosition, [0, 0, 0], 1)
  yPosition += 6

  // Characteristics - boxed layout
  if (monster.characteristics) {
    const chars = [
      { label: 'Might', value: monster.characteristics.might >= 0 ? `+${monster.characteristics.might}` : monster.characteristics.might.toString() },
      { label: 'Agility', value: monster.characteristics.agility >= 0 ? `+${monster.characteristics.agility}` : monster.characteristics.agility.toString() },
      { label: 'Reason', value: monster.characteristics.reason >= 0 ? `+${monster.characteristics.reason}` : monster.characteristics.reason.toString() },
      { label: 'Intuition', value: monster.characteristics.intuition >= 0 ? `+${monster.characteristics.intuition}` : monster.characteristics.intuition.toString() },
      { label: 'Presence', value: monster.characteristics.presence >= 0 ? `+${monster.characteristics.presence}` : monster.characteristics.presence.toString() }
    ]

    const charBoxWidth = (contentWidth - (4 * 2)) / 5
    const charBoxHeight = 8
    currentX = margin

    chars.forEach(char => {
      addRect(currentX, yPosition, charBoxWidth, charBoxHeight)
      addText(`${char.label} ${char.value}`, currentX + charBoxWidth / 2, yPosition + 5, {
        fontSize: 9,
        align: 'center',
        font: 'times'
      })
      currentX += charBoxWidth + 2
    })
    yPosition += charBoxHeight
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
    const features = monster.items.filter(item => item.type === 'feature')
    const abilities = monster.items.filter(item => item.type === 'ability')

    const pageHeight = doc.internal.pageSize.getHeight()
    const footerHeight = 20
    const usablePageHeight = pageHeight - footerHeight

    const renderItem = (item: MonsterItem, x: number, y: number, width: number): number => {
      let itemY = y
      const icon = item.type === 'feature' ? '★' : '❖'
      addText(icon, x, itemY, { fontSize: 12, font: 'times' })

      const titleX = x + 5
      const titleWidth = width - 5
      
      let title = item.name.toUpperCase()
      if (item.system?.category === 'signature') {
        title += ' (SIGNATURE ABILITY)'
      }
      itemY += addText(title, titleX, itemY, { fontSize: 9, fontStyle: 'bold', maxWidth: titleWidth, font: 'times' })

      let details = []
      if (item.system?.type && item.system.type !== 'none') {
        details.push(item.system.type.charAt(0).toUpperCase() + item.system.type.slice(1))
      }
      if (item.system?.keywords?.length) {
        details.push(item.system.keywords.join(', '))
      }
      if (details.length > 0) {
        itemY += addText(details.join(' • '), titleX, itemY, { fontSize: 8, fontStyle: 'italic', maxWidth: titleWidth, font: 'times' })
      }

      if (item.system?.trigger) {
        itemY += addText(`Trigger: ${stripHtml(item.system.trigger)}`, titleX, itemY, { fontSize: 8, maxWidth: titleWidth, font: 'times' })
      }

      if (item.system?.description?.value) {
        itemY += addText(stripHtml(item.system.description.value), titleX, itemY, { fontSize: 8, maxWidth: titleWidth, font: 'times' })
      }

      if (item.system?.power?.tiers) {
        item.system.power.tiers.forEach(tier => {
          const tierText = `Tier ${tier.tier}: ${stripHtml(tier.display)}`
          itemY += addText(tierText, titleX, itemY, { fontSize: 8, maxWidth: titleWidth, font: 'times' })
        })
      }
      
      if (item.system?.effect?.before) {
        itemY += addText(`Effect: ${stripHtml(item.system.effect.before)}`, titleX, itemY, { fontSize: 8, maxWidth: titleWidth, font: 'times' })
      }
      if (item.system?.effect?.after) {
        itemY += addText(stripHtml(item.system.effect.after), titleX, itemY, { fontSize: 8, maxWidth: titleWidth, font: 'times' })
      }

      return itemY - y + 4 // return height used + padding
    }

    const columnWidth = (contentWidth - 10) / 2
    let leftY = yPosition
    let rightY = yPosition

    const checkPageBreak = (columnY: number, itemHeight: number) => {
      if (columnY + itemHeight > usablePageHeight) {
        return true
      }
      return false
    }

    const addPage = () => {
      doc.addPage()
      leftY = margin
      rightY = margin
    }

    // Render features in the right column first
    features.forEach(item => {
      const itemHeight = renderItem(item, 0, 0, columnWidth) // Dry run to get height
      if (checkPageBreak(rightY, itemHeight)) {
        addPage()
      }
      rightY += renderItem(item, margin + columnWidth + 10, rightY, columnWidth)
      addLine(margin + columnWidth + 10, rightY - 2, pageWidth - margin, rightY - 2, [200, 200, 200], 0.5)
    })

    // Render abilities, filling left then right column
    abilities.forEach(item => {
      const itemHeight = renderItem(item, 0, 0, columnWidth) // Dry run
      if (leftY <= rightY) {
        if (checkPageBreak(leftY, itemHeight)) {
          addPage()
        }
        leftY += renderItem(item, margin, leftY, columnWidth)
        addLine(margin, leftY - 2, margin + columnWidth, leftY - 2, [200, 200, 200], 0.5)
      } else {
        if (checkPageBreak(rightY, itemHeight)) {
          addPage()
        }
        rightY += renderItem(item, margin + columnWidth + 10, rightY, columnWidth)
        addLine(margin + columnWidth + 10, rightY - 2, pageWidth - margin, rightY - 2, [200, 200, 200], 0.5)
      }
    })

    yPosition = Math.max(leftY, rightY)
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