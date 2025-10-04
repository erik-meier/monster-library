import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEncounterStore } from '@/stores/encounter'

describe('Initiative Groups', () => {
  let store: ReturnType<typeof useEncounterStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useEncounterStore()
  })

  describe('Group Creation', () => {
    it('should create a new group with default name', () => {
      const groupId = store.createGroup()
      
      expect(groupId).toBe('group-1')
      expect(store.initiativeGroups).toHaveLength(1)
      expect(store.initiativeGroups[0]).toMatchObject({
        id: 'group-1',
        name: 'Group 1',
        monsterIds: [],
        order: 0
      })
    })

    it('should create a new group with custom name', () => {
      const groupId = store.createGroup('My Custom Group')
      
      expect(groupId).toBe('group-1')
      expect(store.initiativeGroups[0].name).toBe('My Custom Group')
    })

    it('should create multiple groups with incremented IDs', () => {
      const id1 = store.createGroup()
      const id2 = store.createGroup()
      const id3 = store.createGroup()
      
      expect(id1).toBe('group-1')
      expect(id2).toBe('group-2')
      expect(id3).toBe('group-3')
      expect(store.initiativeGroups).toHaveLength(3)
    })

    it('should assign sequential order to new groups', () => {
      store.createGroup()
      store.createGroup()
      store.createGroup()
      
      expect(store.initiativeGroups[0].order).toBe(0)
      expect(store.initiativeGroups[1].order).toBe(1)
      expect(store.initiativeGroups[2].order).toBe(2)
    })
  })

  describe('Group Deletion', () => {
    it('should delete a group', () => {
      const groupId = store.createGroup()
      expect(store.initiativeGroups).toHaveLength(1)
      
      store.deleteGroup(groupId)
      expect(store.initiativeGroups).toHaveLength(0)
    })

    it('should ungroup monsters when deleting a group', () => {
      const groupId = store.createGroup()
      store.addMonster({
        id: 'monster-1',
        name: 'Test Monster',
        level: 1,
        ev: 2,
        role: 'Brute',
        organization: 'Solo'
      })
      store.moveMonsterToGroup('monster-1', groupId)
      
      expect(store.monsters[0].groupId).toBe(groupId)
      
      store.deleteGroup(groupId)
      expect(store.monsters[0].groupId).toBeNull()
    })

    it('should reorder remaining groups after deletion', () => {
      store.createGroup('Group 1')
      const group2Id = store.createGroup('Group 2')
      store.createGroup('Group 3')
      
      expect(store.initiativeGroups).toHaveLength(3)
      expect(store.initiativeGroups[1].order).toBe(1)
      
      store.deleteGroup(group2Id)
      
      expect(store.initiativeGroups).toHaveLength(2)
      expect(store.initiativeGroups[0].order).toBe(0)
      expect(store.initiativeGroups[1].order).toBe(1)
    })
  })

  describe('Group Updates', () => {
    it('should update group name', () => {
      const groupId = store.createGroup('Old Name')
      expect(store.initiativeGroups[0].name).toBe('Old Name')
      
      store.updateGroupName(groupId, 'New Name')
      expect(store.initiativeGroups[0].name).toBe('New Name')
    })
  })

  describe('Monster to Group Management', () => {
    beforeEach(() => {
      // Add some test monsters
      store.addMonster({
        id: 'monster-1',
        name: 'Goblin',
        level: 1,
        ev: 1,
        role: 'Brute',
        organization: 'Minion'
      })
      store.addMonster({
        id: 'monster-2',
        name: 'Orc',
        level: 2,
        ev: 4,
        role: 'Defender',
        organization: 'Solo'
      })
    })

    it('should move monster to group', () => {
      const groupId = store.createGroup()
      
      store.moveMonsterToGroup('monster-1', groupId)
      
      expect(store.monsters[0].groupId).toBe(groupId)
      expect(store.initiativeGroups[0].monsterIds).toContain('monster-1')
    })

    it('should move monster from one group to another', () => {
      const group1Id = store.createGroup('Group 1')
      const group2Id = store.createGroup('Group 2')
      
      store.moveMonsterToGroup('monster-1', group1Id)
      expect(store.monsters[0].groupId).toBe(group1Id)
      expect(store.initiativeGroups[0].monsterIds).toContain('monster-1')
      
      store.moveMonsterToGroup('monster-1', group2Id)
      expect(store.monsters[0].groupId).toBe(group2Id)
      expect(store.initiativeGroups[0].monsterIds).not.toContain('monster-1')
      expect(store.initiativeGroups[1].monsterIds).toContain('monster-1')
    })

    it('should move monster out of group (ungroup)', () => {
      const groupId = store.createGroup()
      store.moveMonsterToGroup('monster-1', groupId)
      
      expect(store.monsters[0].groupId).toBe(groupId)
      
      store.moveMonsterToGroup('monster-1', null)
      expect(store.monsters[0].groupId).toBeNull()
      expect(store.initiativeGroups[0].monsterIds).not.toContain('monster-1')
    })
  })

  describe('Group Getters', () => {
    beforeEach(() => {
      // Setup test data
      store.addMonster({
        id: 'monster-1',
        name: 'Goblin',
        level: 1,
        ev: 1,
        role: 'Brute',
        organization: 'Minion'
      })
      store.addMonster({
        id: 'monster-2',
        name: 'Orc',
        level: 2,
        ev: 4,
        role: 'Defender',
        organization: 'Solo'
      })
    })

    it('should get sorted groups', () => {
      const group1 = store.createGroup('Group 1')
      const group2 = store.createGroup('Group 2')
      const group3 = store.createGroup('Group 3')
      
      // Manually change order
      store.initiativeGroups[0].order = 2
      store.initiativeGroups[1].order = 0
      store.initiativeGroups[2].order = 1
      
      const sorted = store.sortedGroups
      expect(sorted[0].id).toBe(group2)
      expect(sorted[1].id).toBe(group3)
      expect(sorted[2].id).toBe(group1)
    })

    it('should get monsters in a specific group', () => {
      const groupId = store.createGroup()
      store.moveMonsterToGroup('monster-1', groupId)
      store.moveMonsterToGroup('monster-2', groupId)
      
      const monstersInGroup = store.getMonstersInGroup(groupId)
      expect(monstersInGroup).toHaveLength(2)
      expect(monstersInGroup.map(m => m.id)).toContain('monster-1')
      expect(monstersInGroup.map(m => m.id)).toContain('monster-2')
    })

    it('should get ungrouped monsters', () => {
      const groupId = store.createGroup()
      store.moveMonsterToGroup('monster-1', groupId)
      
      const ungrouped = store.ungroupedMonsters
      expect(ungrouped).toHaveLength(1)
      expect(ungrouped[0].id).toBe('monster-2')
    })

    it('should calculate group total EV', () => {
      const groupId = store.createGroup()
      store.moveMonsterToGroup('monster-1', groupId)
      store.moveMonsterToGroup('monster-2', groupId)
      
      const totalEV = store.getGroupTotalEV(groupId)
      expect(totalEV).toBe(5) // 1 + 4
    })

    it('should calculate group monster count', () => {
      const groupId = store.createGroup()
      store.moveMonsterToGroup('monster-1', groupId)
      store.moveMonsterToGroup('monster-2', groupId)
      
      // Add more of the same monsters
      store.updateMonsterCount('monster-1', 3)
      store.updateMonsterCount('monster-2', 2)
      
      const count = store.getGroupMonsterCount(groupId)
      expect(count).toBe(5) // 3 + 2
    })

    it('should get group by ID', () => {
      const groupId = store.createGroup('Test Group')
      
      const group = store.getGroupById(groupId)
      expect(group).toBeDefined()
      expect(group?.name).toBe('Test Group')
    })
  })

  describe('Group Reordering', () => {
    it('should reorder groups', () => {
      const group1 = store.createGroup('Group 1')
      const group2 = store.createGroup('Group 2')
      const group3 = store.createGroup('Group 3')
      
      expect(store.sortedGroups[0].id).toBe(group1)
      expect(store.sortedGroups[1].id).toBe(group2)
      expect(store.sortedGroups[2].id).toBe(group3)
      
      // Reorder: group3, group1, group2
      store.reorderGroups([group3, group1, group2])
      
      expect(store.sortedGroups[0].id).toBe(group3)
      expect(store.sortedGroups[1].id).toBe(group1)
      expect(store.sortedGroups[2].id).toBe(group2)
    })
  })

  describe('Clear Encounter', () => {
    it('should clear all groups and monsters', () => {
      store.createGroup('Group 1')
      store.createGroup('Group 2')
      store.addMonster({
        id: 'monster-1',
        name: 'Goblin',
        level: 1,
        ev: 1,
        role: 'Brute',
        organization: 'Minion'
      })
      
      expect(store.initiativeGroups).toHaveLength(2)
      expect(store.monsters).toHaveLength(1)
      
      store.clearEncounter()
      
      expect(store.initiativeGroups).toHaveLength(0)
      expect(store.monsters).toHaveLength(0)
      expect(store.nextGroupId).toBe(1)
    })
  })

  describe('New Monster Integration', () => {
    it('should add new monsters without group assignment', () => {
      store.addMonster({
        id: 'monster-1',
        name: 'Goblin',
        level: 1,
        ev: 1,
        role: 'Brute',
        organization: 'Minion'
      })
      
      expect(store.monsters[0].groupId).toBeNull()
    })
  })
})
