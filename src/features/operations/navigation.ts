export type OperationalView =
  'overview' | 'planning' | 'schedule' | 'costs' | 'risks' | 'changes' | 'documents' | 'field'

export type OperationalNavGroup = 'management' | 'assurance' | 'execution'

export interface OperationalNavItem {
  readonly id: OperationalView
  readonly icon: OperationalView
  readonly group: OperationalNavGroup
}

export const operationalNavigation: readonly OperationalNavItem[] = [
  { id: 'overview', icon: 'overview', group: 'management' },
  { id: 'planning', icon: 'planning', group: 'management' },
  { id: 'schedule', icon: 'schedule', group: 'management' },
  { id: 'costs', icon: 'costs', group: 'management' },
  { id: 'risks', icon: 'risks', group: 'assurance' },
  { id: 'changes', icon: 'changes', group: 'assurance' },
  { id: 'documents', icon: 'documents', group: 'execution' },
  { id: 'field', icon: 'field', group: 'execution' },
] as const

export const operationalNavGroups: readonly OperationalNavGroup[] = [
  'management',
  'assurance',
  'execution',
]

export const operationalCopy = {
  es: {
    groups: {
      management: 'Gestión del proyecto',
      assurance: 'Control y decisiones',
      execution: 'Ejecución y evidencia',
    },
    views: {
      overview: 'Inicio operativo',
      planning: 'Planificación y WBS',
      schedule: 'Cronograma',
      costs: 'Costos y estimaciones',
      risks: 'Riesgos e incidencias',
      changes: 'Cambios y aprobaciones',
      documents: 'Documentos',
      field: 'Control de campo',
    },
    viewDescriptions: {
      overview: 'Prioridades, alertas y trabajo pendiente al corte',
      planning: 'Estructura WBS, línea base, entregables y calidad',
      schedule: 'Secuencia CPM, avance, dependencias y ruta crítica',
      costs: 'Presupuesto, costo real y estimaciones por autorizar',
      risks: 'Exposición, respuesta y seguimiento de riesgos',
      changes: 'Solicitudes, impactos y decisiones del CCB',
      documents: 'Expediente, revisiones y evidencia del proyecto',
      field: 'Partes diarios, cuadrillas e incidencias de obra',
    },
    shell: {
      environment: 'Entorno operativo',
      project: 'Proyecto en ejecución',
      projectName: 'Interconexión El Encino - La Laguna',
      projectCode: 'BCY-PMO-2026-014',
      active: 'Activo',
      progress: '64% avance',
      cutoff: 'Corte de control',
      cutoffDate: '12 JUL 2026',
      demoMode: 'Modo demostrativo',
      role: 'Rol de trabajo',
      language: 'Cambiar idioma a inglés',
      languageShort: 'EN',
      return: 'Volver a presentación',
      logout: 'Cerrar sesión',
      openMenu: 'Abrir áreas de trabajo',
      closeMenu: 'Cerrar áreas de trabajo',
      navigation: 'Áreas de trabajo del proyecto',
      userMenu: 'Contexto de sesión',
      currentWorkspace: 'Área actual',
      roleGuide: 'Ver alcance del rol',
      roleGuideEyebrow: 'Modo demostrativo',
      roleGuideTitle: 'Permisos del rol',
      roleGuideCopy:
        'La navegación permanece disponible para demostrar el sistema; las operaciones cambian según las capacidades del rol seleccionado.',
      editAccess: 'Puede operar',
      readAccess: 'Solo consulta',
      capability: 'Área de trabajo',
      access: 'Nivel de acceso',
    },
    roleDescriptions: {
      'Project Manager': 'Gestiona planificación, costos, riesgos y decisiones de cambio.',
      Supervisor: 'Reporta campo y riesgos; consulta el resto del proyecto.',
      Administrador: 'Opera todas las áreas y capacidades de la demostración.',
    },
    roles: {
      'Project Manager': 'Project Manager',
      Supervisor: 'Supervisor',
      Administrador: 'Administrador',
    },
  },
  en: {
    groups: {
      management: 'Project management',
      assurance: 'Control and decisions',
      execution: 'Execution and evidence',
    },
    views: {
      overview: 'Operational home',
      planning: 'Planning and WBS',
      schedule: 'Schedule',
      costs: 'Costs and estimates',
      risks: 'Risks and issues',
      changes: 'Changes and approvals',
      documents: 'Documents',
      field: 'Field control',
    },
    viewDescriptions: {
      overview: 'Priorities, alerts and pending work at the control date',
      planning: 'WBS, baseline, deliverables and quality controls',
      schedule: 'CPM sequence, progress, dependencies and critical path',
      costs: 'Budget, actual cost and estimates pending approval',
      risks: 'Risk exposure, response and follow-up',
      changes: 'Requests, impacts and CCB decisions',
      documents: 'Project file, revisions and supporting evidence',
      field: 'Daily reports, crews and site issues',
    },
    shell: {
      environment: 'Operational workspace',
      project: 'Project in progress',
      projectName: 'Interconexión El Encino - La Laguna',
      projectCode: 'BCY-PMO-2026-014',
      active: 'Active',
      progress: '64% complete',
      cutoff: 'Control date',
      cutoffDate: 'JUL 12 2026',
      demoMode: 'Demo mode',
      role: 'Working role',
      language: 'Change language to Spanish',
      languageShort: 'ES',
      return: 'Return to presentation',
      logout: 'Sign out',
      openMenu: 'Open work areas',
      closeMenu: 'Close work areas',
      navigation: 'Project work areas',
      userMenu: 'Session context',
      currentWorkspace: 'Current workspace',
      roleGuide: 'View role scope',
      roleGuideEyebrow: 'Demo mode',
      roleGuideTitle: 'Role permissions',
      roleGuideCopy:
        'Navigation remains available to demonstrate the system; operations change according to the selected role capabilities.',
      editAccess: 'Can operate',
      readAccess: 'Read only',
      capability: 'Work area',
      access: 'Access level',
    },
    roleDescriptions: {
      'Project Manager': 'Manages planning, costs, risks and change decisions.',
      Supervisor: 'Reports field activity and risks; reads the rest of the project.',
      Administrador: 'Operates every area and capability in the demonstration.',
    },
    roles: {
      'Project Manager': 'Project Manager',
      Supervisor: 'Supervisor',
      Administrador: 'Administrator',
    },
  },
} as const

export type OperationalLanguage = keyof typeof operationalCopy

export function getOperationalLanguage(language?: string): OperationalLanguage {
  return language?.toLowerCase().startsWith('en') ? 'en' : 'es'
}
