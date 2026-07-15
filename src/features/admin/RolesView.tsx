import { useState, type FormEvent } from 'react'
import { DetailModal } from '../../shared/DetailModal'
import { FormModal } from '../../shared/FormModal'
import type { Role } from '../../shared/project'
import { Card, PageHead, Status } from '../../shared/ui'

interface TeamMember {
  avatar: string
  name: string
  title: string
  status: string
  email: string
}

const team: readonly TeamMember[] = [
  {
    avatar: 'VS',
    name: 'Valeria Soto',
    title: 'Project Manager',
    status: 'En línea',
    email: 'valeria.soto@bcysa.com.mx',
  },
  {
    avatar: 'RM',
    name: 'Rafael Méndez',
    title: 'Supervisor de obra',
    status: 'Hace 12 min',
    email: 'rafael.mendez@bcysa.com.mx',
  },
  {
    avatar: 'MO',
    name: 'Marina Ortiz',
    title: 'Control de costos',
    status: 'Hace 1 h',
    email: 'marina.ortiz@bcysa.com.mx',
  },
  {
    avatar: 'LT',
    name: 'Lucía Torres',
    title: 'Gestión ambiental',
    status: 'Ayer',
    email: 'lucia.torres@bcysa.com.mx',
  },
]

export function RolesView({
  role,
  onAdd,
  notify,
}: {
  role: Role
  onAdd?: () => void
  notify: (message: string) => void
}) {
  const [selected, setSelected] = useState<TeamMember | null>(null)
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [modalTrigger, setModalTrigger] = useState<HTMLElement | null>(null)
  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    notify(`Perfil de ${editing?.name} actualizado en la demo`)
    setEditing(null)
  }

  return (
    <>
      <PageHead
        page="roles"
        eyebrow="ADMINISTRACIÓN"
        title="Equipo y roles"
        copy={`Permisos y responsabilidades. Estás explorando como ${role}.`}
        onAdd={onAdd}
      />
      <Card title="Matriz de acceso">
        <table className="roles-table">
          <thead>
            <tr>
              <th>Rol</th>
              <th>Portafolio</th>
              <th>Planificación</th>
              <th>Costos</th>
              <th>Riesgos</th>
              <th>Administración</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <b>Administrador</b>
                <small>Control total</small>
              </td>
              <td>Editar</td>
              <td>Editar</td>
              <td>Editar</td>
              <td>Editar</td>
              <td>
                <Status>Completo</Status>
              </td>
            </tr>
            <tr>
              <td>
                <b>Project Manager</b>
                <small>Dirección de proyecto</small>
              </td>
              <td>Ver</td>
              <td>Editar</td>
              <td>Editar</td>
              <td>Editar</td>
              <td>Sin acceso</td>
            </tr>
            <tr>
              <td>
                <b>Supervisor</b>
                <small>Seguimiento de campo</small>
              </td>
              <td>Ver</td>
              <td>Actualizar</td>
              <td>Ver</td>
              <td>Reportar</td>
              <td>Sin acceso</td>
            </tr>
          </tbody>
        </table>
      </Card>
      <div className="team-grid">
        {team.map((member) => (
          <Card key={member.name}>
            <div className="team-member">
              <i>{member.avatar}</i>
              <div>
                <b>{member.name}</b>
                <span>{member.title}</span>
                <small>{member.status}</small>
              </div>
              <button
                aria-label={`Opciones de ${member.name}`}
                onClick={(event) => {
                  setModalTrigger(event.currentTarget)
                  setSelected(member)
                }}
              >
                ···
              </button>
            </div>
          </Card>
        ))}
      </div>
      <DetailModal
        open={Boolean(selected)}
        eyebrow="ADMINISTRACIÓN / PERFIL"
        title={selected?.name ?? ''}
        returnFocus={modalTrigger}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <div className="profile-preview">
            <div className="profile-identity">
              <i>{selected.avatar}</i>
              <span>
                <b>{selected.title}</b>
                <small>{selected.email}</small>
              </span>
            </div>
            <dl className="details">
              <div>
                <dt>Última actividad</dt>
                <dd>{selected.status}</dd>
              </div>
              <div>
                <dt>Acceso</dt>
                <dd>
                  <Status>Habilitado</Status>
                </dd>
              </div>
            </dl>
            <div className="modal-options">
              <button
                className="primary"
                type="button"
                onClick={() => {
                  setEditing(selected)
                  setSelected(null)
                }}
              >
                Editar perfil
              </button>
              <button
                className="secondary"
                type="button"
                onClick={() => {
                  notify(`Restablecimiento enviado a ${selected.email}`)
                  setSelected(null)
                }}
              >
                Restablecer acceso
              </button>
            </div>
          </div>
        )}
      </DetailModal>
      <FormModal
        open={Boolean(editing)}
        eyebrow="ADMINISTRACIÓN / EQUIPO"
        title={`Editar ${editing?.name ?? ''}`}
        submitLabel="Guardar cambios"
        returnFocus={modalTrigger}
        onClose={() => setEditing(null)}
        onSubmit={saveProfile}
      >
        {editing && (
          <div className="profile-form">
            <label className="modal-field">
              <span>Nombre</span>
              <input data-autofocus required defaultValue={editing.name} />
            </label>
            <label className="modal-field">
              <span>Correo corporativo</span>
              <input type="email" required defaultValue={editing.email} />
            </label>
            <label className="modal-field">
              <span>Rol operativo</span>
              <select defaultValue={editing.title}>
                <option>Project Manager</option>
                <option>Supervisor de obra</option>
                <option>Control de costos</option>
                <option>Gestión ambiental</option>
              </select>
            </label>
            <label className="modal-field">
              <span>Estado de acceso</span>
              <select defaultValue="enabled">
                <option value="enabled">Habilitado</option>
                <option value="suspended">Suspendido</option>
              </select>
            </label>
          </div>
        )}
      </FormModal>
    </>
  )
}
