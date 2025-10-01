import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('Deployment Configuration', () => {
  it('should have _redirects file for SPA routing', () => {
    const redirectsPath = path.join(__dirname, '../public/_redirects')
    expect(fs.existsSync(redirectsPath)).toBe(true)
    
    const content = fs.readFileSync(redirectsPath, 'utf-8')
    expect(content).toContain('/*')
    expect(content).toContain('/index.html')
    expect(content).toContain('200')
  })

  it('should have valid _redirects syntax', () => {
    const redirectsPath = path.join(__dirname, '../public/_redirects')
    const content = fs.readFileSync(redirectsPath, 'utf-8')
    
    // Check for the basic redirect rule pattern
    const lines = content.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'))
    expect(lines.length).toBeGreaterThan(0)
    
    // Verify the catch-all redirect exists
    const catchAllRedirect = lines.some(line => 
      line.includes('/*') && line.includes('/index.html') && line.includes('200')
    )
    expect(catchAllRedirect).toBe(true)
  })
})
