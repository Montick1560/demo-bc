import { expect, test, type Page } from '@playwright/test'

const visibleTypographyViolations = (page: Page) =>
  page.locator('body').evaluate((body) => {
    const candidates = [...body.querySelectorAll<HTMLElement>('*')].filter((element) => {
      const styles = window.getComputedStyle(element)
      const hasText = [...element.childNodes].some(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
      )
      const isTextControl = ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(element.tagName)
      return (
        styles.display !== 'none' && styles.visibility !== 'hidden' && (hasText || isTextControl)
      )
    })
    return candidates
      .filter(
        (element) =>
          !element.closest('.welcome') &&
          Number.parseFloat(window.getComputedStyle(element).fontSize) < 12.5,
      )
      .map((element) => ({
        tag: element.tagName,
        className: element.className,
        size: window.getComputedStyle(element).fontSize,
      }))
  })

const openMobileMenuIfVisible = async (page: Page) => {
  const menu = page.locator('.mobile-menu')
  await menu.waitFor({ state: 'attached' })
  if (!(await menu.isVisible())) return
  if ((await menu.getAttribute('aria-expanded')) !== 'true') await menu.click()
  await expect(menu).toHaveAttribute('aria-expanded', 'true')
}

const openOperationalMenuIfVisible = async (page: Page) => {
  const menu = page.locator('.ops-menu-button')
  await menu.waitFor({ state: 'attached' })
  if (!(await menu.isVisible())) return
  if ((await menu.getAttribute('aria-expanded')) !== 'true') await menu.click()
  await expect(menu).toHaveAttribute('aria-expanded', 'true')
}

test('desktop flow keeps PMO hidden and supports project navigation and language', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Desktop-only flow')
  await page.goto('/')
  await page.getByRole('button', { name: /Ingresar/ }).click()
  await expect(page.getByRole('heading', { name: 'Proyectos del sistema' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Centro PMO/ })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Abrir caso práctico' })).toHaveCount(1)
  await page.getByRole('button', { name: 'Abrir caso práctico' }).click()
  await expect(page.getByRole('heading', { name: 'Vista general' })).toBeVisible()
  const sidebar = page.locator('#primary-sidebar')
  await page.getByRole('button', { name: 'Contraer navegación' }).click()
  await expect.poll(async () => (await sidebar.boundingBox())?.width ?? 0).toBeLessThan(80)
  const sidebarBox = (await sidebar.boundingBox())!
  const expandButton = sidebar.getByRole('button', { name: 'Abrir navegación' })
  const expandBox = (await expandButton.boundingBox())!
  const logoBox = (await sidebar.locator('.bcysa-brand img').boundingBox())!
  expect(expandBox.x + expandBox.width).toBeLessThanOrEqual(sidebarBox.x + sidebarBox.width + 1)
  expect(logoBox.x + logoBox.width).toBeLessThanOrEqual(sidebarBox.x + sidebarBox.width + 1)
  await expandButton.click()
  await page.getByRole('button', { name: 'Gestión de riesgos' }).click()
  await expect(page.getByRole('heading', { name: 'Registro de riesgos' })).toBeVisible()
  await page.getByRole('button', { name: 'EN', exact: true }).click()
  await expect(page.locator('h1')).toHaveText('Risk management')
})

test('guided use case walks the scenes and deep-links into the live modules', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Desktop-only flow')
  await page.goto('/')
  await page.getByRole('button', { name: /Ingresar/ }).click()
  await page.getByRole('button', { name: 'Ver recorrido' }).click()
  await expect(page.getByRole('heading', { name: /Así se vivió el proyecto/ })).toBeVisible()
  // First scene deep-links into the initiation module.
  await page.getByRole('button', { name: /Abrir ficha de inicio/ }).click()
  await expect(page.getByRole('heading', { name: 'Ficha de inicio' })).toBeVisible()
  // Return, jump to a later scene via the rail, then land in its module.
  await page.getByRole('button', { name: 'Caso de uso' }).click()
  await page.getByRole('button', { name: /Un cambio pasa por el comité/ }).click()
  await page.getByRole('button', { name: /Abrir monitoreo y control/ }).click()
  await expect(page.getByRole('heading', { level: 2, name: 'Monitoreo y control' })).toBeVisible()
})

test('switches between the finished presentation and the operational natural state', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Ingresar/ }).click()

  await page.getByRole('button', { name: 'Ir al estado natural' }).click()
  await expect(page.locator('.ops-shell')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Control del día' })).toBeVisible()
  await expect(page.locator('.op-page-heading p')).toContainText(
    'Interconexión El Encino - La Laguna',
  )
  await expect(page.getByText('64%', { exact: true }).first()).toBeVisible()
  await expect(page.locator('.op-page-heading p')).toContainText('12 de julio de 2026')
  await expect(page.getByRole('button', { name: 'Caso de uso' })).toHaveCount(0)

  await openOperationalMenuIfVisible(page)
  await page.getByRole('button', { name: 'Planificación y WBS', exact: true }).click()
  await expect(page.locator('.op-planning')).toBeVisible()
  await expect(page.getByText('LB-05 / Contractual', { exact: true })).toBeVisible()

  await page.locator('.ops-return').click()
  await expect(page.locator('.workspace')).toHaveAttribute('data-experience-mode', 'presentation')
  await expect(page.getByRole('heading', { name: 'Proyectos del sistema' })).toBeVisible()
})

test('mobile menu closes after navigation and the search dialog closes with Escape', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile-only flow')
  await page.goto('/')
  await page.getByRole('button', { name: /Ingresar/ }).click()
  const menu = page.locator('.mobile-menu')
  const sidebar = page.locator('#primary-sidebar')
  await expect(sidebar).toHaveAttribute('inert', '')
  await menu.click()
  await expect(menu).toHaveAttribute('aria-expanded', 'true')
  await expect(sidebar).not.toHaveAttribute('inert', '')
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')
  await page.getByRole('button', { name: /Gestión de riesgos/ }).click()
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  await expect(sidebar).toHaveAttribute('inert', '')
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
  await page.keyboard.press('ControlOrMeta+K')
  await expect(page.getByRole('dialog', { name: /Búsqueda global/ })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: /Búsqueda global/ })).toBeHidden()
})

test('visible typography respects the minimum size and viewport width', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Ingresar/ }).click()
  expect(await visibleTypographyViolations(page)).toEqual([])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )

  await page.getByRole('button', { name: 'Ir al estado natural' }).click()
  await expect(page.locator('.ops-shell')).toBeVisible()
  expect(await visibleTypographyViolations(page)).toEqual([])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )

  await openOperationalMenuIfVisible(page)
  await page.getByRole('button', { name: 'Cronograma', exact: true }).click()
  await expect(page.locator('.ops-schedule')).toBeVisible()
  expect(await visibleTypographyViolations(page)).toEqual([])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
})

test('operational workspace persists real demo mutations', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Desktop-only mutation flow')
  await page.goto('/')
  await page.getByRole('button', { name: /Ingresar/ }).click()
  await page.getByRole('button', { name: 'Ir al estado natural' }).click()
  await expect(page.getByRole('heading', { name: 'Control del día' })).toBeVisible()

  await page.getByRole('button', { name: 'Costos y estimaciones', exact: true }).click()
  await page.getByRole('button', { name: /Registrar estimación/ }).click()
  const estimate = page.getByRole('dialog', { name: 'Nueva estimación' })
  await estimate.getByLabel('Contratista').fill('Contratista de prueba')
  await estimate.getByLabel('Importe').fill('275000')
  await estimate.getByRole('button', { name: 'Enviar a revisión' }).click()
  await expect(page.getByText('Contratista de prueba', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Cambios y aprobaciones', exact: true }).click()
  await page.getByRole('button', { name: /Nueva solicitud/ }).click()
  const change = page.getByRole('dialog', { name: 'Registrar solicitud de cambio' })
  await change.getByLabel('Solicitud').fill('Reubicar tablero de control')
  await change.getByLabel('Impacto costo').fill('95000')
  await change.getByLabel('Impacto plazo').fill('1')
  await change.getByRole('button', { name: 'Enviar al CCB' }).click()
  await expect(page.getByText('Reubicar tablero de control', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Inicio operativo', exact: true }).click()
  await expect(page.locator('.op-metric.is-warning strong')).toHaveText('4')

  await page.getByLabel('Modo demostrativo: Rol de trabajo').selectOption('Supervisor')
  await page.getByRole('button', { name: 'Costos y estimaciones', exact: true }).click()
  await expect(page.getByText('Contratista de prueba', { exact: true })).toBeVisible()
})

test('operational role guide explains capabilities for every demo role', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Ingresar/ }).click()
  await page.getByRole('button', { name: 'Ir al estado natural' }).click()

  const roleSelector = page.getByLabel('Modo demostrativo: Rol de trabajo')
  const roleGuide = page.getByRole('button', { name: 'Ver alcance del rol' })
  await roleGuide.click()
  let dialog = page.getByRole('dialog', { name: /Permisos del rol: Project Manager/ })
  await expect(dialog.getByRole('row', { name: /Planificación y WBS Puede operar/ })).toBeVisible()
  await expect(dialog.getByRole('row', { name: /Control de campo Solo consulta/ })).toBeVisible()
  await page.keyboard.press('Escape')

  await roleSelector.selectOption('Supervisor')
  await roleGuide.click()
  dialog = page.getByRole('dialog', { name: /Permisos del rol: Supervisor/ })
  await expect(dialog.getByRole('row', { name: /Planificación y WBS Solo consulta/ })).toBeVisible()
  await expect(
    dialog.getByRole('row', { name: /Riesgos e incidencias Puede operar/ }),
  ).toBeVisible()
  await expect(dialog.getByRole('row', { name: /Control de campo Puede operar/ })).toBeVisible()
  await page.keyboard.press('Escape')

  await roleSelector.selectOption('Administrador')
  await roleGuide.click()
  dialog = page.getByRole('dialog', { name: /Permisos del rol: Administrador/ })
  await expect(dialog.getByText('Puede operar', { exact: true })).toHaveCount(8)
})

test('operational records expose menus, previews and confirmations', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'Desktop interaction audit')
  await page.goto('/')
  await page.getByRole('button', { name: /Ingresar/ }).click()
  await page.getByRole('button', { name: 'Ir al estado natural' }).click()

  await page.getByRole('button', { name: 'Cronograma', exact: true }).click()
  await page
    .getByRole('button', { name: /Abrir opciones de la actividad/ })
    .first()
    .click()
  await page.getByRole('menuitem', { name: 'Editar', exact: true }).click()
  await expect(page.getByRole('dialog', { name: /Editar actividad/ })).toBeVisible()
  await page.keyboard.press('Escape')

  await page.getByRole('button', { name: 'Costos y estimaciones', exact: true }).click()
  const estimateRow = page.getByRole('row').filter({ hasText: 'EST-007' })
  await estimateRow.locator('summary').click()
  await estimateRow.getByRole('menuitem', { name: 'Autorizar', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Confirmar decisión de estimación' })).toBeVisible()
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click()

  await page.getByRole('button', { name: 'Documentos', exact: true }).click()
  const preview = page.getByRole('button', { name: 'Vista previa', exact: true }).first()
  await preview.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(preview).toBeFocused()
  const history = page.getByRole('button', { name: 'Historial', exact: true }).first()
  await history.click()
  await expect(page.getByText('Rev. 02', { exact: true })).toBeVisible()
  await page.keyboard.press('Escape')

  await page.getByLabel('Modo demostrativo: Rol de trabajo').selectOption('Supervisor')
  await page.getByRole('button', { name: 'Control de campo', exact: true }).click()
  const issue = page.getByRole('article').filter({ hasText: 'INC-002' })
  await issue.getByRole('button', { name: 'Contener', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Confirmar cambio de estado' })).toBeVisible()
})

test('operational mobile drawer is inert, scroll-locked and closes on navigation', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile-only operational drawer flow')
  await page.goto('/')
  await page.getByRole('button', { name: /Ingresar/ }).click()
  await page.getByRole('button', { name: 'Ir al estado natural' }).click()
  await expect(page.getByRole('heading', { name: 'Control del día' })).toBeVisible()
  const menu = page.locator('.ops-menu-button')
  const sidebar = page.locator('.ops-sidebar')
  await expect(sidebar).toHaveJSProperty('inert', true)
  await menu.click()
  await expect(menu).toHaveAttribute('aria-expanded', 'true')
  await expect(sidebar).toHaveJSProperty('inert', false)
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')
  await page.getByRole('button', { name: 'Riesgos e incidencias', exact: true }).click()
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  await expect(sidebar).toHaveJSProperty('inert', true)
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
  await expect(page.getByRole('heading', { name: 'Registro de riesgos' })).toBeVisible()
})

test('schedule filters and glossary search are operational', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Ingresar/ }).click()
  await openMobileMenuIfVisible(page)
  await page
    .getByRole('button', { name: /Cronograma y costos/ })
    .evaluate((button: HTMLButtonElement) => button.click())
  await expect(page.getByRole('heading', { name: 'Cronograma y presupuesto' })).toBeVisible()
  const newActivity = page.getByRole('button', { name: '+ Nueva actividad', exact: true })
  await newActivity.click()
  const activityDialog = page.getByRole('dialog', { name: 'Nueva actividad' })
  await expect(activityDialog).toBeVisible()
  await expect(activityDialog.getByLabel('Actividad')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(activityDialog).toBeHidden()
  await expect(newActivity).toBeFocused()
  await page.getByRole('button', { name: 'Terminadas', exact: true }).click()
  await expect(page.getByRole('cell', { name: 'Terminada', exact: true }).first()).toBeVisible()
  await openMobileMenuIfVisible(page)
  await page
    .getByRole('button', { name: /Glosario/ })
    .evaluate((button: HTMLButtonElement) => button.click())
  await page.getByPlaceholder(/CPI, ruta crítica/).fill('CPI')
  await expect(page.getByText('Cost Performance Index', { exact: true })).toBeVisible()
  await expect(page.getByText('Schedule Performance Index', { exact: true })).toHaveCount(0)
})

test('planning data-entry forms open as accessible dialogs', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Ingresar/ }).click()
  await openMobileMenuIfVisible(page)
  await page
    .getByRole('button', { name: /Planificación/ })
    .evaluate((button: HTMLButtonElement) => button.click())
  await page.getByRole('button', { name: /Agregar paquete WBS/ }).click()
  await expect(page.getByRole('dialog', { name: 'Agregar paquete WBS' })).toBeVisible()
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Subir archivos' }).click()
  await expect(page.getByRole('dialog', { name: 'Subir documentos' })).toBeVisible()
  await expect(page.locator('[data-app-background]')).toHaveAttribute('inert', '')
})

test('detail modals open as read-only dialogs and restore focus on close', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Ingresar/ }).click()
  await openMobileMenuIfVisible(page)
  await page
    .getByRole('button', { name: /Gestión de riesgos/ })
    .evaluate((button: HTMLButtonElement) => button.click())
  const openDetail = page.getByRole('button', { name: 'Ver', exact: true }).first()
  await openDetail.click()
  const dialog = page.getByRole('dialog', { name: /R-021/ })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('button', { name: /Enviar|Guardar|Incorporar/ })).toHaveCount(0)
  await expect(page.locator('[data-app-background]')).toHaveAttribute('inert', '')
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(openDetail).toBeFocused()
})

test('portfolio previews and module-specific entry forms expose real actions', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Ingresar/ }).click()
  const preview = page.getByRole('button', { name: 'Vista previa' }).first()
  await preview.click()
  await expect(page.getByRole('dialog', { name: /Interconexión El Encino/ })).toBeVisible()
  await page.keyboard.press('Escape')
  await openMobileMenuIfVisible(page)
  await page
    .getByRole('button', { name: /Gestión de riesgos/ })
    .evaluate((button: HTMLButtonElement) => button.click())
  await page.getByRole('button', { name: /Nueva entrada/ }).click()
  const entry = page.getByRole('dialog', { name: /Nueva entrada/ })
  await expect(entry.getByRole('heading', { name: 'Registrar riesgo' })).toBeVisible()
  await expect(entry.getByLabel('Categoría')).toBeVisible()
  await expect(entry.getByLabel('Respuesta y contingencia')).toBeVisible()
})

test('planning comparison and document options use preview dialogs', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Ingresar/ }).click()
  await openMobileMenuIfVisible(page)
  await page
    .getByRole('button', { name: /Planificación/ })
    .evaluate((button: HTMLButtonElement) => button.click())
  await page.getByRole('button', { name: 'Comparar con línea base' }).click()
  await expect(page.getByRole('dialog', { name: 'Comparación contra línea base' })).toBeVisible()
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: /^Ver / }).first().click()
  const documentDialog = page.getByRole('dialog', { name: /\.(pdf|xlsx|docx)$/i })
  await expect(documentDialog).toBeVisible()
  await expect(documentDialog.getByRole('button', { name: 'Ver historial' })).toBeVisible()
})
