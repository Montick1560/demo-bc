import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { AsyncState } from '../../shared/AsyncState'
import { FormModal } from '../../shared/FormModal'
import { useServices } from '../../shared/useServices'
import { useServiceResource } from '../../shared/useServiceResource'
import { Card } from '../../shared/ui'

export function GovernanceTab({ notify }: { notify: (message: string) => void }) {
  const { t } = useTranslation()
  const services = useServices()
  const {
    data: lessons,
    loading,
    error,
    reload,
  } = useServiceResource(() => services.governance.listLessons(), [services])
  const [lesson, setLesson] = useState('')
  const [lessonOpen, setLessonOpen] = useState(false)
  const [modalTrigger, setModalTrigger] = useState<HTMLElement | null>(null)
  const addLesson = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!lesson.trim()) return
    const result = await services.governance.addLesson(lesson.trim())
    if (result.ok) {
      setLesson('')
      setLessonOpen(false)
      notify(t('pmo.lessonAdded'))
      await reload()
    }
  }
  return (
    <>
      <div className="pmo-layout governance-layout">
        <Card className="raci-card wide">
          <header>
            <div>
              <h3>{t('pmo.governanceMatrix')}</h3>
              <p>{t('pmo.governanceCopy')}</p>
            </div>
          </header>
          <table>
            <thead>
              <tr>
                <th>Deliverable</th>
                <th>Valeria / PM</th>
                <th>Rafael / Site</th>
                <th>Marina / Costs</th>
                <th>Client</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Master plan', 'A', 'R', 'C', 'I'],
                ['Monthly estimate', 'A', 'C', 'R', 'I'],
                ['Acceptance record', 'R', 'C', 'I', 'A'],
              ].map((row) => (
                <tr key={row[0]}>
                  <td>
                    <b>{row[0]}</b>
                  </td>
                  {row.slice(1).map((value, index) => (
                    <td key={index}>
                      <i className={`raci ${value.toLowerCase()}`}>{value}</i>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card
          className="issue-card"
          title={t('pmo.issues')}
          action={<span>3 {t('pmo.open')}</span>}
        >
          {[
            ['I-032', 'Interference in electrical room', 'Rafael / Today', 'high'],
            ['I-029', 'Missing gates data sheet', 'Lucía / 13 Jul', 'medium'],
            ['I-025', 'Fire department access validation', 'Ana / 16 Jul', ''],
          ].map(([id, title, meta, tone]) => (
            <div key={id}>
              <i className={tone}>{id}</i>
              <span>
                <b>{title}</b>
                <small>{meta}</small>
              </span>
            </div>
          ))}
        </Card>
        <Card
          className="lessons-card"
          title={t('pmo.lessons')}
          action={
            <span>
              {lessons?.length ?? 0} {t('pmo.registered')}
            </span>
          }
        >
          <button
            className="primary lesson-modal-trigger"
            onClick={(event) => {
              setModalTrigger(event.currentTarget)
              setLessonOpen(true)
            }}
          >
            + {t('pmo.register')}
          </button>
          <AsyncState loading={loading} error={error?.message} />
          {lessons?.map((item) => (
            <div className="lesson" key={item.id}>
              <i>✓</i>
              <span>
                <b>{item.text}</b>
                <small>Applicable to planning and control</small>
              </span>
            </div>
          ))}
        </Card>
      </div>
      <FormModal
        open={lessonOpen}
        eyebrow="GOBIERNO Y APRENDIZAJE"
        title="Registrar lección aprendida"
        submitLabel={t('pmo.register')}
        returnFocus={modalTrigger}
        onClose={() => {
          setLessonOpen(false)
          setLesson('')
        }}
        onSubmit={(event) => void addLesson(event)}
      >
        <label className="modal-field">
          <span>Situación, causa y recomendación</span>
          <textarea
            autoFocus
            data-autofocus
            required
            value={lesson}
            onChange={(event) => setLesson(event.target.value)}
            placeholder={t('pmo.lessonPlaceholder')}
          />
        </label>
      </FormModal>
    </>
  )
}
