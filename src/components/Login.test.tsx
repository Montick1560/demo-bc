import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import '../i18n'
import { Login } from './Login'

describe('Login', () => {
  it('lets the user select a demo role and sign in', async () => {
    const onLogin = vi.fn()
    const user = userEvent.setup()
    render(<Login onLogin={onLogin} />)
    await user.click(screen.getByRole('button', { name: 'Supervisor' }))
    await user.click(screen.getByRole('button', { name: /Ingresar/ }))
    await new Promise((resolve) => window.setTimeout(resolve, 600))
    expect(onLogin).toHaveBeenCalledWith('Supervisor')
  })
})
