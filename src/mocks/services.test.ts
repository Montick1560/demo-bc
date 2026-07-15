import { describe, expect, it } from 'vitest'
import { hasCapability } from '../shared/contracts'
import { createDemoSession, createMockServices } from './services'

describe('demo services', () => {
  it('derives capabilities from the selected demo role', () => {
    expect(hasCapability(createDemoSession('Administrador'), 'admin:manage')).toBe(true)
    expect(hasCapability(createDemoSession('Project Manager'), 'changes:decide')).toBe(true)
    expect(hasCapability(createDemoSession('Supervisor'), 'changes:decide')).toBe(false)
  })

  it('keeps decisions in memory for the current session', async () => {
    const services = createMockServices(createDemoSession('Project Manager'))
    const result = await services.changes.decide('CR-018', 'approved')
    expect(result).toEqual(expect.objectContaining({ ok: true }))
    const changes = await services.changes.list()
    expect(changes.ok && changes.data.find((change) => change.id === 'CR-018')?.status).toBe(
      'approved',
    )
  })

  it('updates the session port without rebuilding operational data', async () => {
    let currentSession = createDemoSession('Project Manager')
    const services = createMockServices(() => currentSession, 'natural')
    await services.risks.add({
      name: 'Riesgo conservado entre roles',
      category: 'technical',
      probability: 'medium',
      impact: 'medium',
      owner: 'Valeria Soto',
      mitigation: 'Revisar en comité',
      contingency: 'Aplicar reserva',
    })

    currentSession = createDemoSession('Supervisor')

    const session = await services.session.get()
    const risks = await services.risks.list()
    expect(session.ok && session.data.role).toBe('Supervisor')
    expect(
      risks.ok && risks.data.some((risk) => risk.name === 'Riesgo conservado entre roles'),
    ).toBe(true)
  })

  it('stores a lesson only in the mock session', async () => {
    const services = createMockServices(createDemoSession('Administrador'))
    await services.governance.addLesson('Confirmar interfaces antes de construir.')
    const lessons = await services.governance.listLessons()
    expect(lessons.ok && lessons.data[0]?.text).toBe('Confirmar interfaces antes de construir.')
  })

  it('exposes one eligible portfolio project and updates practical-case data in memory', async () => {
    const services = createMockServices(createDemoSession('Project Manager'))
    const portfolio = await services.project.listPortfolio()
    expect(portfolio.ok && portfolio.data.filter((project) => project.eligible)).toHaveLength(1)
    const schedule = await services.project.updateScheduleProgress('SCH-02', 83)
    expect(schedule.ok && schedule.data.progress).toBe(83)
    const document = await services.project.addDocument({
      name: 'evidencia.pdf',
      type: 'application/pdf',
      size: 1200,
    })
    expect(document.ok && document.data.name).toBe('evidencia.pdf')
    const wbs = await services.project.addWorkBreakdown('Pruebas de energización')
    expect(wbs.ok && wbs.data.progress).toBe(0)
  })

  it('serves the finished practical case with consistent closure data', async () => {
    const services = createMockServices(createDemoSession('Project Manager'))
    const summary = await services.project.getSummary()
    expect(summary.ok && summary.data.progress).toBe(100)
    expect(summary.ok && summary.data.status).toBe('completed')
    const budget = await services.project.listBudget()
    expect(budget.ok && budget.data.reduce((total, line) => total + line.actual, 0)).toBe(
      18_020_000,
    )
    const schedule = await services.project.listSchedule()
    expect(schedule.ok && schedule.data.every((task) => task.progress === 100)).toBe(true)
    const risks = await services.risks.list()
    expect(risks.ok && risks.data.every((risk) => risk.status === 'closed')).toBe(true)
    const closeout = await services.project.listCloseoutItems()
    expect(closeout.ok && closeout.data.every((item) => item.status === 'done')).toBe(true)
    const closure = await services.project.getClosureSummary()
    expect(closure.ok && closure.data.actNumber).toBe('ACTA-BCY-014-2026')
    const quality = await services.project.listQuality()
    expect(quality.ok && quality.data.every((metric) => metric.met)).toBe(true)
    const reports = await services.project.listWeeklyReports()
    expect(reports.ok && reports.data[0]?.week).toBe(39)
    const audits = await services.project.listAudits()
    expect(audits.ok && audits.data.every((audit) => audit.status === 'closed')).toBe(true)
  })

  it('creates, edits and protects dependent schedule activities', async () => {
    const services = createMockServices(createDemoSession('Project Manager'))
    const created = await services.project.addScheduleTask({
      name: 'Pruebas funcionales',
      owner: 'Ana Cruz',
      start: '2026-08-28',
      end: '2026-09-04',
      progress: 0,
      critical: true,
      milestone: false,
      predecessor: 'SCH-04',
    })
    expect(created.ok && created.data.id).toBe('SCH-08')
    const updated = await services.project.updateScheduleTask('SCH-08', { progress: 35 })
    expect(updated.ok && updated.data.progress).toBe(35)
    const protectedResult = await services.project.deleteScheduleTask('SCH-04')
    expect(protectedResult.ok).toBe(false)
    const removed = await services.project.deleteScheduleTask('SCH-08')
    expect(removed.ok).toBe(true)
  })

  it('exposes a coherent active snapshot for the natural system mode', async () => {
    const services = createMockServices(createDemoSession('Project Manager'), 'natural')
    const summary = await services.project.getSummary()
    const periods = await services.project.listPerformance()
    const schedule = await services.project.listSchedule()
    const risks = await services.risks.list()
    const changes = await services.changes.list()
    const portfolio = await services.project.listPortfolio()
    expect(summary.ok && summary.data.status).toBe('active')
    expect(summary.ok && summary.data.progress).toBe(64)
    expect(summary.ok && summary.data.cpi).toBe(1.04)
    expect(summary.ok && summary.data.spi).toBe(0.96)
    expect(periods.ok && periods.data.at(-1)).toEqual(
      expect.objectContaining({ period: 'JUL', planned: 67, actual: 64 }),
    )
    expect(schedule.ok && schedule.data.some((task) => task.progress < 100)).toBe(true)
    expect(risks.ok && risks.data.some((risk) => risk.status === 'open')).toBe(true)
    expect(changes.ok && changes.data.every((change) => change.status === 'pending')).toBe(true)
    expect(portfolio.ok && portfolio.data.find((project) => project.eligible)?.status).toBe(
      'active',
    )
  })

  it('keeps presentation and natural-state mutations isolated', async () => {
    const session = createDemoSession('Project Manager')
    const presentation = createMockServices(session, 'presentation')
    const natural = createMockServices(session, 'natural')

    await natural.project.updateScheduleProgress('SCH-02', 81)

    const naturalSchedule = await natural.project.listSchedule()
    const presentationSchedule = await presentation.project.listSchedule()
    expect(
      naturalSchedule.ok && naturalSchedule.data.find((task) => task.id === 'SCH-02')?.progress,
    ).toBe(81)
    expect(
      presentationSchedule.ok &&
        presentationSchedule.data.find((task) => task.id === 'SCH-02')?.progress,
    ).toBe(100)
  })

  it('persists operational demo records through typed repositories', async () => {
    const services = createMockServices(createDemoSession('Administrador'), 'natural')

    const risk = await services.risks.add({
      name: 'Interferencia en charola de control',
      category: 'technical',
      probability: 'medium',
      impact: 'high',
      owner: 'Ana Cruz',
      mitigation: 'Revisar modelo coordinado',
      contingency: 'Desviar el tramo afectado',
    })
    expect(risk.ok && risk.data.status).toBe('open')
    if (risk.ok) {
      const mitigated = await services.risks.updateStatus(risk.data.id, 'mitigated')
      expect(mitigated.ok && mitigated.data.status).toBe('mitigated')
    }

    const change = await services.changes.add({
      title: 'Ajuste de soportería MEP',
      owner: 'Valeria Soto',
      cost: 85_000,
      days: 1,
      risk: 'medium',
    })
    expect(change.ok && change.data.status).toBe('pending')

    const estimate = await services.costs.addEstimate({
      period: '01–15 Jul 2026',
      contractor: 'Contratista demo',
      amount: 320_000,
      physicalProgress: 64,
    })
    expect(estimate.ok && estimate.data.status).toBe('pending')

    const report = await services.field.addReport({
      date: '2026-07-12',
      front: 'Patio norte',
      supervisor: 'Rafael Méndez',
      crew: 12,
      progress: 46,
      weather: 'clear',
      note: 'Avance capturado desde campo.',
    })
    expect(report.ok && report.data.status).toBe('submitted')

    const incident = await services.field.addIncident({
      title: 'Desviación geométrica menor',
      type: 'quality',
      severity: 'low',
      owner: 'Ana Cruz',
      openedAt: '2026-07-12',
    })
    expect(incident.ok && incident.data.status).toBe('open')
  })
})
