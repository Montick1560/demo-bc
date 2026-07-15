export type Role = 'Administrador' | 'Project Manager' | 'Supervisor'

export type Capability =
  | 'portfolio:read'
  | 'project:read'
  | 'planning:write'
  | 'costs:write'
  | 'risks:write'
  | 'field:update'
  | 'changes:review'
  | 'changes:decide'
  | 'admin:manage'

export interface UserSession {
  readonly userId: string
  readonly name: string
  readonly initials: string
  readonly role: Role
  readonly capabilities: readonly Capability[]
  readonly isDemo: boolean
}

export type ProjectStatus = 'active' | 'completed' | 'cancelled' | 'on_hold'

export interface ProjectSummary {
  readonly id: string
  readonly code: string
  readonly name: string
  readonly client: string
  readonly manager: string
  readonly progress: number
  readonly budget: number
  readonly spent: number
  readonly cpi: number
  readonly spi: number
  readonly status: ProjectStatus
  readonly startDate: string
  readonly endDate: string
  readonly acceptedAt: string
}

export interface PortfolioProject {
  readonly id: string
  readonly code: string
  readonly name: string
  readonly client: string
  readonly location: string
  readonly manager: string
  readonly progress: number
  readonly status: ProjectStatus
  readonly phase: string
  readonly eligible: boolean
  readonly updatedAt: string
}

export interface PerformancePeriod {
  readonly period: string
  readonly planned: number
  readonly actual: number
  readonly cpi: number
  readonly spi: number
  readonly note: string
}

export interface ScheduleTask {
  readonly id: string
  readonly name: string
  readonly owner: string
  readonly start: string
  readonly end: string
  readonly progress: number
  readonly left: number
  readonly width: number
  readonly critical: boolean
  readonly milestone: boolean
  readonly predecessor?: string
  readonly baselineStart?: string
  readonly baselineEnd?: string
  readonly notes?: string
}

export interface ScheduleTaskInput {
  readonly name: string
  readonly owner: string
  readonly start: string
  readonly end: string
  readonly progress: number
  readonly critical: boolean
  readonly milestone: boolean
  readonly predecessor?: string
  readonly notes?: string
}

export type ScheduleTaskUpdate = Partial<ScheduleTaskInput>

export interface ProjectDocument {
  readonly id: string
  readonly name: string
  readonly type: string
  readonly size: number
  readonly uploadedAt: string
  readonly owner: string
}

export interface DocumentUpload {
  readonly name: string
  readonly type: string
  readonly size: number
}

export interface WorkBreakdownItem {
  readonly id: string
  readonly name: string
  readonly progress: number
}

export type BudgetCategory = 'materials' | 'labor' | 'machinery' | 'indirect'

export interface BudgetLine {
  readonly id: string
  readonly category: BudgetCategory
  readonly planned: number
  readonly actual: number
}

export type EstimateStatus = 'draft' | 'pending' | 'approved' | 'rejected'

export interface CostEstimate {
  readonly id: string
  readonly period: string
  readonly contractor: string
  readonly amount: number
  readonly physicalProgress: number
  readonly submittedAt: string
  readonly status: EstimateStatus
}

export type CostEstimateInput = Omit<CostEstimate, 'id' | 'submittedAt' | 'status'>

export interface QualityMetric {
  readonly id: string
  readonly name: string
  readonly target: string
  readonly result: string
  readonly met: boolean
}

export interface WeeklyReport {
  readonly id: string
  readonly week: number
  readonly range: string
  readonly author: string
  readonly summary: string
  readonly progress: number
}

export interface FieldReport {
  readonly id: string
  readonly date: string
  readonly front: string
  readonly supervisor: string
  readonly crew: number
  readonly progress: number
  readonly weather: 'clear' | 'rain' | 'wind'
  readonly note: string
  readonly status: 'draft' | 'submitted'
}

export type FieldReportInput = Omit<FieldReport, 'id' | 'status'>

export interface IncidentRecord {
  readonly id: string
  readonly title: string
  readonly type: 'safety' | 'quality' | 'technical' | 'environmental'
  readonly severity: 'low' | 'medium' | 'high'
  readonly owner: string
  readonly openedAt: string
  readonly status: 'open' | 'contained' | 'closed'
}

export type IncidentInput = Omit<IncidentRecord, 'id' | 'status'>

export interface AuditRecord {
  readonly id: string
  readonly name: string
  readonly date: string
  readonly score: number
  readonly findings: string
  readonly status: 'closed' | 'open'
}

export interface ClosureSummary {
  readonly actNumber: string
  readonly acceptedBy: string
  readonly acceptedAt: string
  readonly deliveredAt: string
  readonly evaluationScore: number
  readonly finalCpi: number
  readonly finalSpi: number
  readonly costSaving: number
}

export type RiskStatus = 'open' | 'mitigated' | 'closed'

export interface Risk {
  readonly id: string
  readonly name: string
  readonly note?: string
  readonly category: 'technical' | 'environmental' | 'financial' | 'regulatory'
  readonly probability: 'high' | 'medium'
  readonly impact: 'critical' | 'high' | 'medium'
  readonly owner: string
  readonly mitigation: string
  readonly contingency: string
  readonly status: RiskStatus
}

export type RiskInput = Omit<Risk, 'id' | 'status' | 'note'>

export type ChangeStatus = 'pending' | 'approved' | 'rejected'

export interface ChangeRequest {
  readonly id: string
  readonly title: string
  readonly owner: string
  readonly cost: number
  readonly days: number
  readonly risk: 'high' | 'medium' | 'low'
  readonly status: ChangeStatus
}

export type ChangeRequestInput = Omit<ChangeRequest, 'id' | 'status'>

export interface WorkAction {
  readonly id: string
  readonly title: string
  readonly area: string
  readonly owner: string
  readonly due: string
  readonly priority: 'high' | 'medium' | 'low'
  readonly complete: boolean
}

export interface Lesson {
  readonly id: string
  readonly text: string
}

export interface CloseoutItem {
  readonly id: string
  readonly name: string
  readonly type: string
  readonly status: 'done' | 'active' | 'pending'
}

export interface ServiceError {
  readonly code: 'unauthorized' | 'not_found' | 'validation' | 'unavailable'
  readonly message: string
}

export type ServiceResult<T> =
  { readonly ok: true; readonly data: T } | { readonly ok: false; readonly error: ServiceError }

export interface ProjectRepository {
  getSummary(): Promise<ServiceResult<ProjectSummary>>
  listPortfolio(): Promise<ServiceResult<readonly PortfolioProject[]>>
  listPerformance(): Promise<ServiceResult<readonly PerformancePeriod[]>>
  listWorkBreakdown(): Promise<ServiceResult<readonly WorkBreakdownItem[]>>
  addWorkBreakdown(name: string): Promise<ServiceResult<WorkBreakdownItem>>
  listSchedule(): Promise<ServiceResult<readonly ScheduleTask[]>>
  addScheduleTask(task: ScheduleTaskInput): Promise<ServiceResult<ScheduleTask>>
  updateScheduleTask(id: string, changes: ScheduleTaskUpdate): Promise<ServiceResult<ScheduleTask>>
  updateScheduleProgress(id: string, progress: number): Promise<ServiceResult<ScheduleTask>>
  deleteScheduleTask(id: string): Promise<ServiceResult<ScheduleTask>>
  listDocuments(): Promise<ServiceResult<readonly ProjectDocument[]>>
  addDocument(document: DocumentUpload): Promise<ServiceResult<ProjectDocument>>
  listBudget(): Promise<ServiceResult<readonly BudgetLine[]>>
  listQuality(): Promise<ServiceResult<readonly QualityMetric[]>>
  listWeeklyReports(): Promise<ServiceResult<readonly WeeklyReport[]>>
  listAudits(): Promise<ServiceResult<readonly AuditRecord[]>>
  listCloseoutItems(): Promise<ServiceResult<readonly CloseoutItem[]>>
  getClosureSummary(): Promise<ServiceResult<ClosureSummary>>
}

export interface RiskRepository {
  list(): Promise<ServiceResult<readonly Risk[]>>
  add(input: RiskInput): Promise<ServiceResult<Risk>>
  updateStatus(id: string, status: RiskStatus): Promise<ServiceResult<Risk>>
}

export interface ChangeRepository {
  list(): Promise<ServiceResult<readonly ChangeRequest[]>>
  add(input: ChangeRequestInput): Promise<ServiceResult<ChangeRequest>>
  decide(
    id: string,
    status: Exclude<ChangeStatus, 'pending'>,
  ): Promise<ServiceResult<ChangeRequest>>
}

export interface CostRepository {
  listEstimates(): Promise<ServiceResult<readonly CostEstimate[]>>
  addEstimate(input: CostEstimateInput): Promise<ServiceResult<CostEstimate>>
  decideEstimate(
    id: string,
    status: Extract<EstimateStatus, 'approved' | 'rejected'>,
  ): Promise<ServiceResult<CostEstimate>>
}

export interface FieldRepository {
  listReports(): Promise<ServiceResult<readonly FieldReport[]>>
  addReport(input: FieldReportInput): Promise<ServiceResult<FieldReport>>
  listIncidents(): Promise<ServiceResult<readonly IncidentRecord[]>>
  addIncident(input: IncidentInput): Promise<ServiceResult<IncidentRecord>>
  updateIncidentStatus(
    id: string,
    status: IncidentRecord['status'],
  ): Promise<ServiceResult<IncidentRecord>>
}

export interface GovernanceRepository {
  listActions(): Promise<ServiceResult<readonly WorkAction[]>>
  setActionComplete(id: string, complete: boolean): Promise<ServiceResult<WorkAction>>
  listLessons(): Promise<ServiceResult<readonly Lesson[]>>
  addLesson(text: string): Promise<ServiceResult<Lesson>>
}

export interface SessionRepository {
  get(): Promise<ServiceResult<UserSession>>
}

export interface AppServices {
  readonly session: SessionRepository
  readonly project: ProjectRepository
  readonly risks: RiskRepository
  readonly changes: ChangeRepository
  readonly costs: CostRepository
  readonly field: FieldRepository
  readonly governance: GovernanceRepository
}

export const hasCapability = (session: UserSession, capability: Capability) =>
  session.capabilities.includes(capability)
