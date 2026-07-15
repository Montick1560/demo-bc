import type {
  AppServices,
  AuditRecord,
  BudgetLine,
  Capability,
  ChangeRequest,
  ChangeRequestInput,
  ChangeStatus,
  CloseoutItem,
  ClosureSummary,
  DocumentUpload,
  CostEstimate,
  CostEstimateInput,
  EstimateStatus,
  FieldReport,
  FieldReportInput,
  IncidentInput,
  IncidentRecord,
  Lesson,
  PerformancePeriod,
  PortfolioProject,
  ProjectDocument,
  ProjectSummary,
  QualityMetric,
  Risk,
  RiskInput,
  RiskStatus,
  Role,
  ServiceResult,
  ScheduleTask,
  ScheduleTaskInput,
  UserSession,
  WeeklyReport,
  WorkAction,
  WorkBreakdownItem,
} from '../shared/contracts'
import type { ExperienceMode } from '../shared/experience'

const capabilityMatrix: Record<Role, readonly Capability[]> = {
  Administrador: [
    'portfolio:read',
    'project:read',
    'planning:write',
    'costs:write',
    'risks:write',
    'field:update',
    'changes:review',
    'changes:decide',
    'admin:manage',
  ],
  'Project Manager': [
    'portfolio:read',
    'project:read',
    'planning:write',
    'costs:write',
    'risks:write',
    'changes:review',
    'changes:decide',
  ],
  Supervisor: ['portfolio:read', 'project:read', 'field:update', 'risks:write'],
}

export const createDemoSession = (role: Role): UserSession => ({
  userId: 'demo-valeria-soto',
  name: 'Valeria Soto',
  initials: 'VS',
  role,
  capabilities: capabilityMatrix[role],
  isDemo: true,
})

// Caso práctico cerrado: ejecutado del 15 ene al 29 sep 2026 y aceptado por el
// cliente el 09 oct 2026. Todos los registros narran ese ciclo completo.
const project: ProjectSummary = {
  id: 'project-014',
  code: 'BCY-PMO-2026-014',
  name: 'Interconexión El Encino - La Laguna',
  client: 'Sector Energético',
  manager: 'Valeria Soto',
  progress: 100,
  budget: 18_450_000,
  spent: 18_020_000,
  cpi: 1.02,
  spi: 1.0,
  status: 'completed',
  startDate: '2026-01-15',
  endDate: '2026-09-29',
  acceptedAt: '2026-10-09',
}

const naturalProject: ProjectSummary = {
  ...project,
  progress: 64,
  spent: 11_210_000,
  cpi: 1.04,
  spi: 0.96,
  status: 'active',
  acceptedAt: 'Pendiente',
}

const workBreakdown: readonly WorkBreakdownItem[] = [
  { id: '1.1', name: 'Preliminares', progress: 100 },
  { id: '1.2', name: 'Obra civil', progress: 100 },
  { id: '1.3', name: 'Instalaciones', progress: 100 },
  { id: '1.4', name: 'Puesta en marcha', progress: 100 },
]

const naturalWorkBreakdown: readonly WorkBreakdownItem[] = [
  { id: '1.1', name: 'Preliminares', progress: 100 },
  { id: '1.2', name: 'Obra civil', progress: 72 },
  { id: '1.3', name: 'Instalaciones', progress: 48 },
  { id: '1.4', name: 'Puesta en marcha', progress: 0 },
]

const portfolio: readonly PortfolioProject[] = [
  {
    id: 'project-014',
    code: 'BCY-PMO-2026-014',
    name: 'Interconexión El Encino - La Laguna',
    client: 'Sector Energético',
    location: 'Chihuahua / Coahuila',
    manager: 'Valeria Soto',
    progress: 100,
    status: 'completed',
    phase: 'Cerrado y entregado',
    eligible: true,
    updatedAt: '2026-10-09',
  },
  {
    id: 'project-009',
    code: 'BCY-EPC-2025-009',
    name: 'Terminal Logística del Bajío',
    client: 'Grupo Boreal',
    location: 'Guanajuato',
    manager: 'Ricardo Salas',
    progress: 100,
    status: 'completed',
    phase: 'Cierre contractual',
    eligible: false,
    updatedAt: '2026-06-28',
  },
  {
    id: 'project-021',
    code: 'BCY-AGUA-2026-021',
    name: 'Acueducto Sierra Norte',
    client: 'Organismo Estatal de Agua',
    location: 'Nuevo León',
    manager: 'Ana Cruz',
    progress: 38,
    status: 'active',
    phase: 'Procura',
    eligible: false,
    updatedAt: '2026-10-06',
  },
  {
    id: 'project-005',
    code: 'BCY-CIV-2025-005',
    name: 'Distribuidor Vial Aeropuerto',
    client: 'Municipio Metropolitano',
    location: 'Jalisco',
    manager: 'Marina Ortiz',
    progress: 47,
    status: 'cancelled',
    phase: 'Obra civil',
    eligible: false,
    updatedAt: '2026-05-19',
  },
  {
    id: 'project-027',
    code: 'BCY-IND-2026-027',
    name: 'Ampliación Planta de Tratamiento',
    client: 'Parque Industrial Norte',
    location: 'Querétaro',
    manager: 'Lucía Torres',
    progress: 12,
    status: 'on_hold',
    phase: 'Ingeniería de detalle',
    eligible: false,
    updatedAt: '2026-07-03',
  },
]

const naturalPortfolio: readonly PortfolioProject[] = portfolio.map((item) =>
  item.id === 'project-014'
    ? {
        ...item,
        progress: 64,
        status: 'active',
        phase: 'Ejecución y control',
        updatedAt: '2026-07-12',
      }
    : item.id === 'project-021'
      ? { ...item, progress: 31, status: 'on_hold', updatedAt: '2026-07-08' }
      : item,
)

const performance: readonly PerformancePeriod[] = [
  {
    period: 'ENE',
    planned: 8,
    actual: 7,
    cpi: 0.94,
    spi: 0.88,
    note: 'Arranque condicionado por liberación de derecho de vía.',
  },
  {
    period: 'FEB',
    planned: 18,
    actual: 16,
    cpi: 0.96,
    spi: 0.89,
    note: 'Movilización completa y primer frente de obra.',
  },
  {
    period: 'MAR',
    planned: 29,
    actual: 27,
    cpi: 0.98,
    spi: 0.93,
    note: 'Recuperación parcial con segundo frente de cimentación.',
  },
  {
    period: 'ABR',
    planned: 40,
    actual: 38,
    cpi: 1.01,
    spi: 0.95,
    note: 'Compras críticas cerradas dentro de presupuesto.',
  },
  {
    period: 'MAY',
    planned: 51,
    actual: 49,
    cpi: 1.03,
    spi: 0.96,
    note: 'Productividad estable en obra civil.',
  },
  {
    period: 'JUN',
    planned: 60,
    actual: 58,
    cpi: 1.05,
    spi: 0.97,
    note: 'Dos días recuperados mediante turno extendido.',
  },
  {
    period: 'JUL',
    planned: 68,
    actual: 66,
    cpi: 1.04,
    spi: 0.97,
    note: 'Permiso pluvial liberado y cimentación concluida.',
  },
  {
    period: 'AGO',
    planned: 84,
    actual: 83,
    cpi: 1.03,
    spi: 0.99,
    note: 'Estructura y MEP cerradas con doble turno de montaje.',
  },
  {
    period: 'SEP',
    planned: 100,
    actual: 100,
    cpi: 1.02,
    spi: 1.0,
    note: 'Puesta en marcha y entrega contractual el 29 de septiembre.',
  },
]

const naturalPerformance: readonly PerformancePeriod[] = [
  ...performance.slice(0, 6),
  {
    period: 'JUL',
    planned: 67,
    actual: 64,
    cpi: 1.04,
    spi: 0.96,
    note: 'Permiso pluvial y acero estructural presionan el plazo.',
  },
]

const timelineStart = Date.parse('2026-01-01T00:00:00Z')
const timelineDays = 273
const day = 86_400_000
const positionScheduleTask = <T extends ScheduleTaskInput>(task: T) => {
  const startOffset = Math.max(0, (Date.parse(`${task.start}T00:00:00Z`) - timelineStart) / day)
  const duration = Math.max(
    1,
    (Date.parse(`${task.end}T00:00:00Z`) - Date.parse(`${task.start}T00:00:00Z`)) / day + 1,
  )
  return {
    ...task,
    left: Math.min(98, (startOffset / timelineDays) * 100),
    width: Math.min(100, (duration / timelineDays) * 100),
  }
}

const scheduleSeed: readonly (ScheduleTaskInput & {
  id: string
  baselineStart: string
  baselineEnd: string
})[] = [
  {
    id: 'SCH-01',
    name: 'Preliminares y movilización',
    owner: 'Rafael Méndez',
    start: '2026-01-15',
    end: '2026-02-10',
    progress: 100,
    critical: false,
    milestone: false,
    baselineStart: '2026-01-15',
    baselineEnd: '2026-02-07',
  },
  {
    id: 'SCH-02',
    name: 'Cimentación principal',
    owner: 'Rafael Méndez',
    start: '2026-02-05',
    end: '2026-07-16',
    progress: 100,
    critical: true,
    milestone: false,
    predecessor: 'SCH-01',
    baselineStart: '2026-02-03',
    baselineEnd: '2026-07-10',
    notes: 'Cerró seis días después de línea base; plazo recuperado con doble turno.',
  },
  {
    id: 'SCH-03',
    name: 'Estructura metálica',
    owner: 'Ana Cruz',
    start: '2026-06-20',
    end: '2026-08-08',
    progress: 100,
    critical: true,
    milestone: false,
    predecessor: 'SCH-02',
    baselineStart: '2026-06-12',
    baselineEnd: '2026-07-29',
    notes: 'Montaje concluido con entregas aseguradas del proveedor alterno.',
  },
  {
    id: 'SCH-04',
    name: 'Instalaciones MEP',
    owner: 'Lucía Torres',
    start: '2026-07-15',
    end: '2026-08-28',
    progress: 100,
    critical: true,
    milestone: false,
    predecessor: 'SCH-03',
    baselineStart: '2026-07-08',
    baselineEnd: '2026-08-20',
  },
  {
    id: 'SCH-07',
    name: 'Liberación del permiso pluvial',
    owner: 'Lucía Torres',
    start: '2026-06-16',
    end: '2026-07-14',
    progress: 100,
    critical: true,
    milestone: false,
    predecessor: 'SCH-01',
    baselineStart: '2026-06-10',
    baselineEnd: '2026-06-30',
    notes: 'Liberado el 14 de julio tras atender observaciones de la autoridad ambiental.',
  },
  {
    id: 'SCH-05',
    name: 'Liberación de cimentación',
    owner: 'Valeria Soto',
    start: '2026-07-16',
    end: '2026-07-16',
    progress: 100,
    critical: true,
    milestone: true,
    predecessor: 'SCH-02',
    baselineStart: '2026-07-10',
    baselineEnd: '2026-07-10',
  },
  {
    id: 'SCH-06',
    name: 'Puesta en marcha',
    owner: 'Valeria Soto',
    start: '2026-09-08',
    end: '2026-09-29',
    progress: 100,
    critical: true,
    milestone: false,
    predecessor: 'SCH-04',
    baselineStart: '2026-09-01',
    baselineEnd: '2026-09-22',
    notes: 'Pruebas de energización aprobadas y entrega el 29 de septiembre.',
  },
]

const initialSchedule: readonly ScheduleTask[] = scheduleSeed.map(positionScheduleTask)

const naturalScheduleSeed: readonly (ScheduleTaskInput & {
  id: string
  baselineStart: string
  baselineEnd: string
})[] = [
  { ...scheduleSeed[0], progress: 100 },
  {
    ...scheduleSeed[1],
    end: '2026-07-18',
    progress: 78,
    notes: 'Colados finales en ejecución; se trabaja con turno extendido.',
  },
  {
    ...scheduleSeed[2],
    end: '2026-08-06',
    progress: 44,
    notes: 'Proveedor alterno confirmado; montaje con seguimiento diario.',
  },
  {
    ...scheduleSeed[3],
    end: '2026-08-27',
    progress: 0,
    notes: 'Frente liberado para iniciar el 15 de julio.',
  },
  {
    ...scheduleSeed[4],
    end: '2026-07-14',
    progress: 65,
    notes: 'Observaciones ambientales en proceso de solventación.',
  },
  {
    ...scheduleSeed[5],
    start: '2026-07-18',
    end: '2026-07-18',
    progress: 0,
  },
  {
    ...scheduleSeed[6],
    start: '2026-09-10',
    progress: 0,
    notes: 'Pendiente de liberación de instalaciones MEP.',
  },
]

const naturalSchedule: readonly ScheduleTask[] = naturalScheduleSeed.map(positionScheduleTask)

const initialDocuments: readonly ProjectDocument[] = [
  {
    id: 'DOC-007',
    name: 'Evaluación post-proyecto.pdf',
    type: 'application/pdf',
    size: 1_380_000,
    uploadedAt: '2026-10-09',
    owner: 'Ana Cruz',
  },
  {
    id: 'DOC-006',
    name: 'Acta de aceptación del cliente.pdf',
    type: 'application/pdf',
    size: 940_000,
    uploadedAt: '2026-10-09',
    owner: 'Valeria Soto',
  },
  {
    id: 'DOC-005',
    name: 'Dossier de calidad y pruebas.pdf',
    type: 'application/pdf',
    size: 6_240_000,
    uploadedAt: '2026-09-26',
    owner: 'Lucía Torres',
  },
  {
    id: 'DOC-004',
    name: 'Manual de operación y mantenimiento.pdf',
    type: 'application/pdf',
    size: 5_480_000,
    uploadedAt: '2026-09-24',
    owner: 'Rafael Méndez',
  },
  {
    id: 'DOC-003',
    name: 'Programa maestro Rev. 07 conforme a obra.pdf',
    type: 'application/pdf',
    size: 4_120_000,
    uploadedAt: '2026-09-30',
    owner: 'Rafael Méndez',
  },
  {
    id: 'DOC-002',
    name: 'WBS contractual.xlsx',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 860_000,
    uploadedAt: '2026-06-30',
    owner: 'Marina Ortiz',
  },
  {
    id: 'DOC-001',
    name: 'Acta de constitución Rev. 02.pdf',
    type: 'application/pdf',
    size: 2_480_000,
    uploadedAt: '2026-01-15',
    owner: 'Valeria Soto',
  },
]

const budget: readonly BudgetLine[] = [
  { id: 'B-01', category: 'materials', planned: 8_100_000, actual: 7_940_000 },
  { id: 'B-02', category: 'labor', planned: 5_400_000, actual: 5_510_000 },
  { id: 'B-03', category: 'machinery', planned: 2_950_000, actual: 2_830_000 },
  { id: 'B-04', category: 'indirect', planned: 2_000_000, actual: 1_740_000 },
]

const quality: readonly QualityMetric[] = [
  {
    id: 'Q-01',
    name: 'Soldaduras aprobadas en primera inspección',
    target: '≥ 95%',
    result: '98.2%',
    met: true,
  },
  {
    id: 'Q-02',
    name: 'Compactación de terracerías (Proctor)',
    target: '≥ 95%',
    result: '97.0%',
    met: true,
  },
  {
    id: 'Q-03',
    name: 'No conformidades cerradas',
    target: '100%',
    result: '14 / 14',
    met: true,
  },
  {
    id: 'Q-04',
    name: 'Incidentes incapacitantes',
    target: '0',
    result: '0 en 612,400 h-h',
    met: true,
  },
]

const weeklyReports: readonly WeeklyReport[] = [
  {
    id: 'REP-39',
    week: 39,
    range: '21–27 septiembre',
    author: 'Rafael Méndez',
    summary:
      'Pruebas de energización aprobadas sin observaciones. Se emitió el certificado de terminación mecánica y quedó lista la entrega contractual del 29 de septiembre.',
    progress: 100,
  },
  {
    id: 'REP-36',
    week: 36,
    range: '31 agosto – 6 septiembre',
    author: 'Lucía Torres',
    summary:
      'Pre-comisionamiento de instalaciones MEP concluido; lista de pendientes menores cerrada al 98%.',
    progress: 94,
  },
  {
    id: 'REP-30',
    week: 30,
    range: '20–26 julio',
    author: 'Rafael Méndez',
    summary:
      'Cimentación liberada y arranque pleno de estructura metálica con doble turno de montaje.',
    progress: 72,
  },
  {
    id: 'REP-27',
    week: 27,
    range: '4–10 julio',
    author: 'Rafael Méndez',
    summary:
      'La cimentación alcanzó 78%. Se recuperaron dos días con un segundo turno y se mantuvo la proyección de costo.',
    progress: 64,
  },
]

const audits: readonly AuditRecord[] = [
  {
    id: 'AUD-03',
    name: 'Cierre documental y calidad',
    date: '2026-09-18',
    score: 96,
    findings: 'Sin hallazgos abiertos',
    status: 'closed',
  },
  {
    id: 'AUD-02',
    name: 'Seguridad industrial y HSE',
    date: '2026-07-21',
    score: 94,
    findings: '2 hallazgos menores, cerrados en agosto',
    status: 'closed',
  },
  {
    id: 'AUD-01',
    name: 'Arranque, procura y contratos',
    date: '2026-03-20',
    score: 92,
    findings: '3 hallazgos documentales, cerrados en abril',
    status: 'closed',
  },
]

const risks: readonly Risk[] = [
  {
    id: 'R-021',
    name: 'Permiso de descarga pluvial',
    note: 'Cerrado: liberado el 14 de julio de 2026',
    category: 'environmental',
    probability: 'high',
    impact: 'critical',
    owner: 'Lucía Torres',
    mitigation: 'Mesa técnica semanal con la autoridad ambiental',
    contingency: 'Rediseño del drenaje provisional',
    status: 'closed',
  },
  {
    id: 'R-018',
    name: 'Retraso en acero estructural',
    note: 'Cerrado: entregas completadas el 3 de agosto',
    category: 'technical',
    probability: 'medium',
    impact: 'high',
    owner: 'Rafael Méndez',
    mitigation: 'Compra contingente con proveedor alterno',
    contingency: 'Doble turno de montaje para absorber demoras',
    status: 'closed',
  },
  {
    id: 'R-014',
    name: 'Incremento de precio de cobre',
    note: 'Cerrado sin materializarse',
    category: 'financial',
    probability: 'medium',
    impact: 'medium',
    owner: 'Marina Ortiz',
    mitigation: 'Precio fijo pactado en contrato marco',
    contingency: 'Reserva de contingencia etiquetada',
    status: 'closed',
  },
  {
    id: 'R-009',
    name: 'Cambio en normativa de interconexión',
    note: 'Cerrado: sin impacto en la recepción',
    category: 'regulatory',
    probability: 'medium',
    impact: 'high',
    owner: 'Valeria Soto',
    mitigation: 'Monitoreo regulatorio quincenal con jurídico',
    contingency: 'Gestión anticipada de prórroga contractual',
    status: 'closed',
  },
]

const closeoutItems: readonly CloseoutItem[] = [
  { id: 'close-1', name: 'Expediente técnico final', type: 'Documentación', status: 'done' },
  {
    id: 'close-2',
    name: 'Manual de operación y mantenimiento',
    type: 'Documentación',
    status: 'done',
  },
  { id: 'close-3', name: 'Acta de aceptación del cliente', type: 'Aprobación', status: 'done' },
  {
    id: 'close-4',
    name: 'Registro de lecciones aprendidas',
    type: 'Conocimiento',
    status: 'done',
  },
  { id: 'close-5', name: 'Entrega y puesta en operación', type: 'Operación', status: 'done' },
  {
    id: 'close-6',
    name: 'Finiquito de contratos y proveedores',
    type: 'Contratos',
    status: 'done',
  },
  { id: 'close-7', name: 'Evaluación post-proyecto', type: 'Evaluación', status: 'done' },
]

const closureSummary: ClosureSummary = {
  actNumber: 'ACTA-BCY-014-2026',
  acceptedBy: 'Dirección de Transmisión del cliente',
  acceptedAt: '2026-10-09',
  deliveredAt: '2026-09-29',
  evaluationScore: 4.6,
  finalCpi: 1.02,
  finalSpi: 1.0,
  costSaving: 430_000,
}

const naturalDocuments = initialDocuments.filter((document) => document.uploadedAt <= '2026-07-12')

const naturalBudget: readonly BudgetLine[] = [
  { id: 'B-01', category: 'materials', planned: 8_100_000, actual: 4_920_000 },
  { id: 'B-02', category: 'labor', planned: 5_400_000, actual: 3_510_000 },
  { id: 'B-03', category: 'machinery', planned: 2_950_000, actual: 1_860_000 },
  { id: 'B-04', category: 'indirect', planned: 2_000_000, actual: 920_000 },
]

const naturalQuality: readonly QualityMetric[] = [
  { ...quality[0], result: '96.8%', met: true },
  { ...quality[1], result: '96.2%', met: true },
  { ...quality[2], result: '8 / 11', met: false },
  { ...quality[3], result: '0 en 388,200 h-h', met: true },
]

const naturalWeeklyReports = weeklyReports.filter((report) => report.week <= 27)
const naturalAudits = audits.filter((audit) => audit.date <= '2026-07-12')

const naturalRisks: readonly Risk[] = [
  {
    ...risks[0],
    note: 'Vencimiento próximo; resolución esperada el 14 de julio',
    status: 'open',
  },
  {
    ...risks[1],
    note: 'Proveedor alterno evaluado y compra contingente preparada',
    status: 'mitigated',
  },
  {
    ...risks[2],
    note: 'Precio fijo acordado; exposición residual bajo vigilancia',
    status: 'mitigated',
  },
  {
    ...risks[3],
    note: 'Monitoreo normativo activo, sin impacto confirmado',
    status: 'open',
  },
]

const naturalCloseoutItems: readonly CloseoutItem[] = closeoutItems.map((item, index) => ({
  ...item,
  status: index === 0 ? 'active' : 'pending',
}))

const naturalClosureSummary: ClosureSummary = {
  ...closureSummary,
  actNumber: 'Pendiente de emisión',
  acceptedBy: 'Pendiente',
  acceptedAt: 'Pendiente',
  deliveredAt: '2026-09-29 (planeado)',
  evaluationScore: 0,
  finalCpi: naturalProject.cpi,
  finalSpi: naturalProject.spi,
  costSaving: 0,
}

const ok = <T>(data: T): ServiceResult<T> => ({ ok: true, data })

export function createMockServices(
  sessionSource: UserSession | (() => UserSession),
  mode: ExperienceMode = 'presentation',
): AppServices {
  const getSession = typeof sessionSource === 'function' ? sessionSource : () => sessionSource
  const isNatural = mode === 'natural'
  const projectSnapshot = isNatural ? naturalProject : project
  const portfolioSnapshot = isNatural ? naturalPortfolio : portfolio
  const performanceSnapshot = isNatural ? naturalPerformance : performance
  let workBreakdownItems = [...(isNatural ? naturalWorkBreakdown : workBreakdown)]
  let schedule = [...(isNatural ? naturalSchedule : initialSchedule)]
  let documents = [...(isNatural ? naturalDocuments : initialDocuments)]
  let riskItems = [...(isNatural ? naturalRisks : risks)]
  let estimates: CostEstimate[] = isNatural
    ? [
        {
          id: 'EST-007',
          period: '01–15 Jul 2026',
          contractor: 'Consorcio Electromecánico del Norte',
          amount: 1_420_000,
          physicalProgress: 64,
          submittedAt: '2026-07-12',
          status: 'pending',
        },
        {
          id: 'EST-006',
          period: '16–30 Jun 2026',
          contractor: 'Infraestructura Laguna',
          amount: 1_185_000,
          physicalProgress: 58,
          submittedAt: '2026-06-30',
          status: 'approved',
        },
      ]
    : [
        {
          id: 'EST-012',
          period: '16–29 Sep 2026',
          contractor: 'Consorcio Electromecánico del Norte',
          amount: 980_000,
          physicalProgress: 100,
          submittedAt: '2026-09-29',
          status: 'approved',
        },
      ]
  let fieldReports: FieldReport[] = [
    {
      id: 'REP-CAM-027',
      date: '2026-07-12',
      front: 'Cimentación / eje C-4',
      supervisor: 'Rafael Méndez',
      crew: 24,
      progress: 78,
      weather: 'clear',
      note: 'Colado de pedestales concluido; curado y liberación topográfica en proceso.',
      status: 'submitted',
    },
    {
      id: 'REP-CAM-026',
      date: '2026-07-11',
      front: 'Estructura metálica / patio norte',
      supervisor: 'Ana Cruz',
      crew: 18,
      progress: 44,
      weather: 'wind',
      note: 'Montaje suspendido 90 minutos por ráfagas; sin incidente.',
      status: 'submitted',
    },
  ]
  let incidents: IncidentRecord[] = [
    {
      id: 'INC-003',
      title: 'Desalineación en placa base E-17',
      type: 'quality',
      severity: 'medium',
      owner: 'Ana Cruz',
      openedAt: '2026-07-11',
      status: 'contained',
    },
    {
      id: 'INC-002',
      title: 'Interferencia de ducto con charola MEP',
      type: 'technical',
      severity: 'high',
      owner: 'Lucía Torres',
      openedAt: '2026-07-10',
      status: 'open',
    },
  ]
  let changes: ChangeRequest[] = [
    {
      id: 'CR-018',
      title: 'Ajuste al sistema contra incendio',
      owner: 'Ana Cruz',
      cost: 180_000,
      days: 2,
      risk: 'medium',
      status: isNatural ? 'pending' : 'approved',
    },
    {
      id: 'CR-019',
      title: 'Refuerzo de losa en estación de medición',
      owner: 'Rafael Méndez',
      cost: 420_000,
      days: 0,
      risk: 'high',
      status: isNatural ? 'pending' : 'approved',
    },
    {
      id: 'CR-020',
      title: 'Cambio de especificación HVAC',
      owner: 'Lucía Torres',
      cost: -85_000,
      days: -1,
      risk: 'low',
      status: isNatural ? 'pending' : 'rejected',
    },
  ]
  let actions: WorkAction[] = [
    {
      id: 'A-121',
      title: 'Archivar expediente final del proyecto',
      area: 'Cierre',
      owner: 'Valeria Soto',
      due: '09 Oct',
      priority: 'high',
      complete: !isNatural,
    },
    {
      id: 'A-118',
      title: 'Firmar acta de aceptación con el cliente',
      area: 'Cierre',
      owner: 'Valeria Soto',
      due: '09 Oct',
      priority: 'high',
      complete: !isNatural,
    },
    {
      id: 'A-104',
      title: 'Resolver observación del permiso pluvial',
      area: 'Riesgos',
      owner: 'Valeria Soto',
      due: '14 Jul',
      priority: 'high',
      complete: !isNatural,
    },
    {
      id: 'A-099',
      title: 'Actualizar avance de instalaciones',
      area: 'Cronograma',
      owner: 'Rafael Méndez',
      due: '12 Jul',
      priority: 'medium',
      complete: !isNatural,
    },
  ]
  if (isNatural)
    actions = [
      {
        id: 'A-104',
        title: 'Resolver observación del permiso pluvial',
        area: 'Riesgos',
        owner: 'Valeria Soto',
        due: '12 Jul',
        priority: 'high',
        complete: false,
      },
      {
        id: 'A-103',
        title: 'Aprobar estimación del contratista #07',
        area: 'Costos',
        owner: 'Valeria Soto',
        due: '12 Jul',
        priority: 'high',
        complete: false,
      },
      {
        id: 'A-099',
        title: 'Actualizar avance de instalaciones',
        area: 'Cronograma',
        owner: 'Rafael Méndez',
        due: '12 Jul',
        priority: 'medium',
        complete: false,
      },
      {
        id: 'A-097',
        title: 'Validar matriz de interesados',
        area: 'Planificación',
        owner: 'Ana Cruz',
        due: '14 Jul',
        priority: 'low',
        complete: false,
      },
    ]
  let lessons: Lesson[] = [
    {
      id: 'lesson-5',
      text: 'La evaluación post-proyecto conviene agendarse dentro de los diez días posteriores a la entrega.',
    },
    {
      id: 'lesson-4',
      text: 'La mesa técnica semanal con la autoridad ambiental redujo el ciclo de observaciones de 20 a 8 días.',
    },
    {
      id: 'lesson-3',
      text: 'El doble turno en cimentación recuperó seis días sin sobrecosto relevante.',
    },
    { id: 'lesson-2', text: 'Incluir holgura contractual en suministros importados.' },
    { id: 'lesson-1', text: 'Validar permisos ambientales antes de liberar compras críticas.' },
  ]
  if (isNatural)
    lessons = lessons.filter((lesson) => lesson.id === 'lesson-1' || lesson.id === 'lesson-2')

  return {
    session: { get: async () => ok(getSession()) },
    project: {
      getSummary: async () => ok(projectSnapshot),
      listPortfolio: async () => ok(portfolioSnapshot),
      listPerformance: async () => ok(performanceSnapshot),
      listWorkBreakdown: async () => ok(workBreakdownItems),
      addWorkBreakdown: async (name) => {
        const item = { id: `1.${workBreakdownItems.length + 1}`, name, progress: 0 }
        workBreakdownItems = [...workBreakdownItems, item]
        return ok(item)
      },
      listSchedule: async () => ok(schedule),
      addScheduleTask: async (input) => {
        if (!input.name.trim() || input.end < input.start)
          return {
            ok: false,
            error: { code: 'validation', message: 'Revisa el nombre y el rango de fechas.' },
          }
        const task: ScheduleTask = {
          ...positionScheduleTask(input),
          id: `SCH-${String(schedule.length + 1).padStart(2, '0')}`,
          baselineStart: input.start,
          baselineEnd: input.end,
        }
        schedule = [...schedule, task]
        return ok(task)
      },
      updateScheduleTask: async (id, changes) => {
        const current = schedule.find((task) => task.id === id)
        if (!current)
          return { ok: false, error: { code: 'not_found', message: 'Schedule task not found' } }
        const candidate = { ...current, ...changes }
        if (!candidate.name.trim() || candidate.end < candidate.start)
          return {
            ok: false,
            error: { code: 'validation', message: 'Revisa el nombre y el rango de fechas.' },
          }
        const updated = { ...candidate, ...positionScheduleTask(candidate) }
        schedule = schedule.map((task) => (task.id === id ? updated : task))
        return ok(updated)
      },
      updateScheduleProgress: async (id, progress) => {
        const current = schedule.find((task) => task.id === id)
        if (!current)
          return { ok: false, error: { code: 'not_found', message: 'Schedule task not found' } }
        const updated = { ...current, progress: Math.max(0, Math.min(100, progress)) }
        schedule = schedule.map((task) => (task.id === id ? updated : task))
        return ok(updated)
      },
      deleteScheduleTask: async (id) => {
        const current = schedule.find((task) => task.id === id)
        if (!current)
          return { ok: false, error: { code: 'not_found', message: 'Schedule task not found' } }
        if (schedule.some((task) => task.predecessor === id))
          return {
            ok: false,
            error: { code: 'validation', message: 'La actividad tiene sucesoras vinculadas.' },
          }
        schedule = schedule.filter((task) => task.id !== id)
        return ok(current)
      },
      listDocuments: async () => ok(documents),
      addDocument: async (upload: DocumentUpload) => {
        const document: ProjectDocument = {
          id: `DOC-${String(documents.length + 1).padStart(3, '0')}`,
          ...upload,
          uploadedAt: new Date().toISOString().slice(0, 10),
          owner: getSession().name,
        }
        documents = [document, ...documents]
        return ok(document)
      },
      listBudget: async () => ok(isNatural ? naturalBudget : budget),
      listQuality: async () => ok(isNatural ? naturalQuality : quality),
      listWeeklyReports: async () => ok(isNatural ? naturalWeeklyReports : weeklyReports),
      listAudits: async () => ok(isNatural ? naturalAudits : audits),
      listCloseoutItems: async () => ok(isNatural ? naturalCloseoutItems : closeoutItems),
      getClosureSummary: async () => ok(isNatural ? naturalClosureSummary : closureSummary),
    },
    risks: {
      list: async () => ok(riskItems),
      add: async (input: RiskInput) => {
        const risk: Risk = {
          ...input,
          id: `R-${String(18 + riskItems.length).padStart(3, '0')}`,
          status: 'open',
          note: 'Registrado en el corte operativo del 12 de julio',
        }
        riskItems = [risk, ...riskItems]
        return ok(risk)
      },
      updateStatus: async (id, status: RiskStatus) => {
        const current = riskItems.find((risk) => risk.id === id)
        if (!current) return { ok: false, error: { code: 'not_found', message: 'Risk not found' } }
        const updated = { ...current, status }
        riskItems = riskItems.map((risk) => (risk.id === id ? updated : risk))
        return ok(updated)
      },
    },
    changes: {
      list: async () => ok(changes),
      add: async (input: ChangeRequestInput) => {
        const change: ChangeRequest = {
          ...input,
          id: `CR-${String(18 + changes.length).padStart(3, '0')}`,
          status: 'pending',
        }
        changes = [change, ...changes]
        return ok(change)
      },
      decide: async (id, status: Exclude<ChangeStatus, 'pending'>) => {
        const current = changes.find((change) => change.id === id)
        if (!current)
          return { ok: false, error: { code: 'not_found', message: 'Change request not found' } }
        const updated = { ...current, status }
        changes = changes.map((change) => (change.id === id ? updated : change))
        return ok(updated)
      },
    },
    costs: {
      listEstimates: async () => ok(estimates),
      addEstimate: async (input: CostEstimateInput) => {
        const estimate: CostEstimate = {
          ...input,
          id: `EST-${String(estimates.length + 6).padStart(3, '0')}`,
          submittedAt: '2026-07-12',
          status: 'pending',
        }
        estimates = [estimate, ...estimates]
        return ok(estimate)
      },
      decideEstimate: async (id, status: Extract<EstimateStatus, 'approved' | 'rejected'>) => {
        const current = estimates.find((estimate) => estimate.id === id)
        if (!current)
          return { ok: false, error: { code: 'not_found', message: 'Estimate not found' } }
        const updated = { ...current, status }
        estimates = estimates.map((estimate) => (estimate.id === id ? updated : estimate))
        return ok(updated)
      },
    },
    field: {
      listReports: async () => ok(fieldReports),
      addReport: async (input: FieldReportInput) => {
        const report: FieldReport = {
          ...input,
          id: `REP-CAM-${String(fieldReports.length + 26).padStart(3, '0')}`,
          status: 'submitted',
        }
        fieldReports = [report, ...fieldReports]
        return ok(report)
      },
      listIncidents: async () => ok(incidents),
      addIncident: async (input: IncidentInput) => {
        const incident: IncidentRecord = {
          ...input,
          id: `INC-${String(incidents.length + 2).padStart(3, '0')}`,
          status: 'open',
        }
        incidents = [incident, ...incidents]
        return ok(incident)
      },
      updateIncidentStatus: async (id, status: IncidentRecord['status']) => {
        const current = incidents.find((incident) => incident.id === id)
        if (!current)
          return { ok: false, error: { code: 'not_found', message: 'Incident not found' } }
        const updated = { ...current, status }
        incidents = incidents.map((incident) => (incident.id === id ? updated : incident))
        return ok(updated)
      },
    },
    governance: {
      listActions: async () => ok(actions),
      setActionComplete: async (id, complete) => {
        const current = actions.find((action) => action.id === id)
        if (!current)
          return { ok: false, error: { code: 'not_found', message: 'Action not found' } }
        const updated = { ...current, complete }
        actions = actions.map((action) => (action.id === id ? updated : action))
        return ok(updated)
      },
      listLessons: async () => ok(lessons),
      addLesson: async (text) => {
        const lesson = { id: `lesson-${lessons.length + 1}`, text }
        lessons = [lesson, ...lessons]
        return ok(lesson)
      },
    },
  }
}
