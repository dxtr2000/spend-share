import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import ExpenseDialog from './ExpenseDialog.vue'
import type { GroupMember } from '@spend-share/types'

const members: GroupMember[] = [
  { id: 'm1', eventId: 'g', displayName: 'A', color: '#6C5CE7' },
  { id: 'm2', eventId: 'g', displayName: 'B', color: '#E85D04' }
]

function mountDialog(open = false) {
  return mount(ExpenseDialog, {
    props: { open, currency: 'USD', members },
    attachTo: document.body
  })
}

function visibleInputs() {
  return Array.from(document.querySelectorAll('input'))
}
function visibleButtons() {
  return Array.from(document.querySelectorAll('button'))
}

describe('ExpenseDialog', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('renders its submit button when open', async () => {
    const wrapper = mountDialog(true)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    const submit = visibleButtons().find((b) => /^Költés hozzáadása$/.test(b.textContent ?? ''))
    expect(submit, 'submit button should render in the portal').toBeTruthy()
  })

  it('emits submit with a valid payload after clicking Add expense', async () => {
    const wrapper = mountDialog(true)
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const inputs = visibleInputs()
    const titleInput = inputs.find((i) => i.id === 'expense-title')
    const amountInput = inputs.find((i) => i.id === 'expense-amount')
    expect(titleInput, 'title input').toBeTruthy()
    expect(amountInput, 'amount input').toBeTruthy()

    const nativeTitle = titleInput! as HTMLInputElement
    nativeTitle.value = 'Dinner'
    nativeTitle.dispatchEvent(new Event('input', { bubbles: true }))
    const nativeAmount = amountInput! as HTMLInputElement
    nativeAmount.value = '12.00'
    nativeAmount.dispatchEvent(new Event('input', { bubbles: true }))
    await wrapper.vm.$nextTick()

    const submit = visibleButtons().find((b) => /^Költés hozzáadása$/.test(b.textContent ?? ''))!
    submit.click()
    await wrapper.vm.$nextTick()

    const emitted = wrapper.emitted('submit')
    expect(emitted, 'submit event should fire').toBeTruthy()
    const payload = emitted![0][0] as { title: string; amountMinor: number; paidByMemberId: string }
    expect(payload.title).toBe('Dinner')
    expect(payload.amountMinor).toBe(1200)
    expect(payload.paidByMemberId).toBe('m1')
  })
})
