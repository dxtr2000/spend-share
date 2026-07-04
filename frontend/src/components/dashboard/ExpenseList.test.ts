import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import ExpenseList from './ExpenseList.vue'
import type { Expense, GroupMember } from '@spend-share/types'

const members: GroupMember[] = [
  { id: 'm1', eventId: 'g', displayName: 'A', color: '#6C5CE7' }
]
const expenses: Expense[] = []

function mountList() {
  return mount(ExpenseList, {
    props: { currency: 'USD', expenses, members, youId: 'm1' }
  })
}

describe('ExpenseList', () => {
  it('emits addExpense when the Add button is clicked', async () => {
    const wrapper = mountList()
    const buttons = wrapper.findAll('button')
    const addBtn = buttons.find((b) => b.text().includes('Hozzáadás'))
    expect(addBtn, 'Add button should exist').toBeTruthy()
    await addBtn!.trigger('click')
    expect(wrapper.emitted('addExpense')).toBeTruthy()
    expect(wrapper.emitted('addExpense')!.length).toBe(1)
  })
})
