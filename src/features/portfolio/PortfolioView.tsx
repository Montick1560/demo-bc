import { useState } from 'react'
import { AsyncState } from '../../shared/AsyncState'
import { DetailModal } from '../../shared/DetailModal'
import type { PortfolioProject, ProjectStatus } from '../../shared/contracts'
import type { View } from '../../shared/project'
import { useServices } from '../../shared/useServices'
import { useServiceResource } from '../../shared/useServiceResource'
import { Status } from '../../shared/ui'

const statusLabel: Record<ProjectStatus, string> = {
  active: 'Activo',
  completed: 'Finalizado',
  cancelled: 'Cancelado',
  on_hold: 'En espera',
}

export function PortfolioView({ onNavigate }: { onNavigate: (view: View) => void }) {
  const services = useServices()
  const {
    data: projects,
    loading,
    error,
  } = useServiceResource(() => services.project.listPortfolio(), [services])
  const count = (status: ProjectStatus) =>
    projects?.filter((project) => project.status === status).length ?? 0
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null)
  const [previewTrigger, setPreviewTrigger] = useState<HTMLElement | null>(null)

  return (
    <>
      <div className="page-head portfolio-head">
        <div>
          <span className="eyebrow">PORTAFOLIO / CASO PRÁCTICO</span>
          <h2>Proyectos del sistema</h2>
          <p>
            Estado operativo del portafolio. Solo el proyecto marcado como demostración puede abrir
            todos los módulos.
          </p>
        </div>
      </div>
      <section className="portfolio-summary">
        <article>
          <span>Total</span>
          <b>{projects?.length ?? 0}</b>
        </article>
        <article>
          <span>Activos</span>
          <b>{count('active')}</b>
        </article>
        <article>
          <span>Finalizados</span>
          <b>{count('completed')}</b>
        </article>
        <article>
          <span>En espera</span>
          <b>{count('on_hold')}</b>
        </article>
        <article>
          <span>Cancelados</span>
          <b>{count('cancelled')}</b>
        </article>
      </section>
      <AsyncState loading={loading} error={error?.message} />
      <div className="portfolio-grid">
        {projects?.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onOpen={() => onNavigate('dashboard')}
            onTour={() => onNavigate('recorrido')}
            onPreview={(event) => {
              setPreviewTrigger(event.currentTarget)
              setSelectedProject(project)
            }}
          />
        ))}
      </div>
      <DetailModal
        open={Boolean(selectedProject)}
        eyebrow="PORTAFOLIO / VISTA PREVIA"
        title={selectedProject?.name ?? ''}
        returnFocus={previewTrigger}
        onClose={() => setSelectedProject(null)}
      >
        {selectedProject && (
          <div className="project-preview">
            <div className="risk-detail-tags">
              <Status
                tone={
                  selectedProject.status === 'cancelled'
                    ? 'red'
                    : selectedProject.status === 'on_hold'
                      ? 'amber'
                      : 'green'
                }
              >
                {statusLabel[selectedProject.status]}
              </Status>
              <span>{selectedProject.code}</span>
            </div>
            <dl className="details">
              <div>
                <dt>Cliente</dt>
                <dd>{selectedProject.client}</dd>
              </div>
              <div>
                <dt>Ubicación</dt>
                <dd>{selectedProject.location}</dd>
              </div>
              <div>
                <dt>Responsable</dt>
                <dd>{selectedProject.manager}</dd>
              </div>
              <div>
                <dt>Fase</dt>
                <dd>{selectedProject.phase}</dd>
              </div>
              <div>
                <dt>Avance</dt>
                <dd>{selectedProject.progress}%</dd>
              </div>
              <div>
                <dt>Actualización</dt>
                <dd>{selectedProject.updatedAt}</dd>
              </div>
            </dl>
            <p className="doc-statement">
              {selectedProject.eligible
                ? 'Este es el único proyecto habilitado para operar todos los módulos de la demo.'
                : 'Proyecto disponible únicamente para consulta dentro de esta demostración.'}
            </p>
          </div>
        )}
      </DetailModal>
    </>
  )
}

function ProjectCard({
  project,
  onOpen,
  onTour,
  onPreview,
}: {
  project: PortfolioProject
  onOpen: () => void
  onTour: () => void
  onPreview: (event: React.MouseEvent<HTMLButtonElement>) => void
}) {
  return (
    <article className={`portfolio-project ${project.eligible ? 'is-eligible' : ''}`}>
      <header>
        <div>
          <span>{project.code}</span>
          <h3>{project.name}</h3>
        </div>
        <em className={`portfolio-status ${project.status}`}>{statusLabel[project.status]}</em>
      </header>
      <dl>
        <div>
          <dt>Cliente</dt>
          <dd>{project.client}</dd>
        </div>
        <div>
          <dt>Ubicación</dt>
          <dd>{project.location}</dd>
        </div>
        <div>
          <dt>Project Manager</dt>
          <dd>{project.manager}</dd>
        </div>
        <div>
          <dt>Fase</dt>
          <dd>{project.phase}</dd>
        </div>
      </dl>
      <div className="portfolio-progress">
        <span>
          Avance físico <b>{project.progress}%</b>
        </span>
        <div className="progress">
          <i style={{ width: `${project.progress}%` }} />
        </div>
      </div>
      <footer>
        <small>Actualizado {project.updatedAt}</small>
        <div className="portfolio-actions">
          <button className="secondary" onClick={onPreview}>
            Vista previa
          </button>
          {project.eligible && (
            <button className="secondary" onClick={onTour}>
              Ver recorrido
            </button>
          )}
          <button
            className={project.eligible ? 'primary' : 'secondary'}
            disabled={!project.eligible}
            onClick={onOpen}
          >
            {project.eligible ? 'Abrir caso práctico' : 'Solo consulta'}
          </button>
        </div>
      </footer>
      {project.eligible && <div className="demo-ribbon">PROYECTO ELEGIBLE PARA LA DEMO</div>}
    </article>
  )
}
