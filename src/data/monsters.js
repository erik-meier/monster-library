// Simple wrapper around the generated bundle
import { 
  monsterIndex, 
  monsters, 
  getMonsterIndex as getBundledIndex,
  getAllMonsters as getBundledMonsters,
  getMonster as getBundledMonster 
} from './monsters-bundle.js'

export const monsterIndexData = monsterIndex
export const getMonsterIndex = getBundledIndex
export const getAllMonsters = getBundledMonsters  
export const getMonster = getBundledMonster

export default {
  monsterIndex,
  monsters,
  getMonsterIndex: getBundledIndex,
  getAllMonsters: getBundledMonsters,
  getMonster: getBundledMonster
}