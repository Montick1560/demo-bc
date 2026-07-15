import { useMemo, useState } from 'react'
import { PageHead } from '../../shared/ui'

type GlossaryCategory =
  'PMI y gobierno' | 'Valor ganado' | 'Cronograma' | 'Construcción' | 'Riesgos y calidad'

interface GlossaryEntry {
  term: string
  name: string
  category: GlossaryCategory
  definition: string
  interpretation?: string
}

const entries: readonly GlossaryEntry[] = [
  {
    term: 'PMI',
    name: 'Project Management Institute',
    category: 'PMI y gobierno',
    definition:
      'Organización internacional que desarrolla estándares y buenas prácticas para la dirección de proyectos.',
  },
  {
    term: 'PMO',
    name: 'Project Management Office',
    category: 'PMI y gobierno',
    definition:
      'Oficina que estandariza métodos, consolida información y apoya la gobernanza del portafolio.',
  },
  {
    term: 'CCB',
    name: 'Change Control Board',
    category: 'PMI y gobierno',
    definition:
      'Comité que revisa y decide solicitudes de cambio considerando alcance, costo, plazo y riesgo.',
  },
  {
    term: 'RACI',
    name: 'Responsible, Accountable, Consulted, Informed',
    category: 'PMI y gobierno',
    definition:
      'Matriz que aclara quién ejecuta, aprueba, es consultado y debe ser informado para cada entregable.',
  },
  {
    term: 'WBS / EDT',
    name: 'Work Breakdown Structure / Estructura de Desglose del Trabajo',
    category: 'PMI y gobierno',
    definition:
      'Descomposición jerárquica del alcance en paquetes de trabajo administrables y medibles.',
  },
  {
    term: 'Entregable',
    name: 'Resultado verificable',
    category: 'PMI y gobierno',
    definition:
      'Producto, documento o resultado que debe producir el proyecto y puede ser aceptado formalmente.',
  },
  {
    term: 'Interesado',
    name: 'Stakeholder',
    category: 'PMI y gobierno',
    definition:
      'Persona u organización que afecta al proyecto, es afectada por él o percibe que puede serlo.',
  },
  {
    term: 'Línea base',
    name: 'Baseline',
    category: 'PMI y gobierno',
    definition:
      'Versión aprobada de alcance, cronograma o costo contra la que se mide el desempeño.',
  },
  {
    term: 'EVM',
    name: 'Earned Value Management',
    category: 'Valor ganado',
    definition:
      'Método que integra alcance, tiempo y costo para medir objetivamente el rendimiento del proyecto.',
  },
  {
    term: 'PV',
    name: 'Planned Value / Valor planeado',
    category: 'Valor ganado',
    definition: 'Valor presupuestado del trabajo que debía estar terminado a la fecha de corte.',
  },
  {
    term: 'EV',
    name: 'Earned Value / Valor ganado',
    category: 'Valor ganado',
    definition: 'Valor presupuestado del trabajo que realmente se ha completado.',
  },
  {
    term: 'AC',
    name: 'Actual Cost / Costo real',
    category: 'Valor ganado',
    definition: 'Costo efectivamente incurrido por el trabajo ejecutado hasta la fecha.',
  },
  {
    term: 'CPI',
    name: 'Cost Performance Index',
    category: 'Valor ganado',
    definition: 'Eficiencia del costo calculada como EV ÷ AC.',
    interpretation: 'Mayor que 1 es favorable; menor que 1 indica sobrecosto.',
  },
  {
    term: 'SPI',
    name: 'Schedule Performance Index',
    category: 'Valor ganado',
    definition: 'Eficiencia del cronograma calculada como EV ÷ PV.',
    interpretation:
      'Mayor o igual que 1 implica avance conforme o adelantado; menor que 1 indica atraso.',
  },
  {
    term: 'CV',
    name: 'Cost Variance / Variación de costo',
    category: 'Valor ganado',
    definition:
      'Diferencia EV − AC que muestra si el trabajo ejecutado costó más o menos de lo previsto.',
  },
  {
    term: 'SV',
    name: 'Schedule Variance / Variación de cronograma',
    category: 'Valor ganado',
    definition: 'Diferencia EV − PV que expresa la desviación del avance en unidades monetarias.',
  },
  {
    term: 'BAC',
    name: 'Budget at Completion',
    category: 'Valor ganado',
    definition: 'Presupuesto total aprobado para completar todo el trabajo del proyecto.',
  },
  {
    term: 'EAC',
    name: 'Estimate at Completion',
    category: 'Valor ganado',
    definition: 'Pronóstico actualizado del costo total al finalizar el proyecto.',
  },
  {
    term: 'ETC',
    name: 'Estimate to Complete',
    category: 'Valor ganado',
    definition: 'Costo estimado del trabajo que falta por ejecutar.',
  },
  {
    term: 'VAC',
    name: 'Variance at Completion',
    category: 'Valor ganado',
    definition: 'Diferencia BAC − EAC; anticipa el ahorro o sobrecosto final.',
  },
  {
    term: 'Ruta crítica',
    name: 'Critical Path',
    category: 'Cronograma',
    definition:
      'Secuencia de actividades que determina la duración mínima del proyecto; un atraso en ella mueve la fecha final.',
  },
  {
    term: 'Holgura',
    name: 'Float',
    category: 'Cronograma',
    definition:
      'Tiempo que una actividad puede desplazarse sin afectar un hito o la terminación del proyecto.',
  },
  {
    term: 'Hito',
    name: 'Milestone',
    category: 'Cronograma',
    definition:
      'Evento relevante de duración cero usado para señalar una aprobación, entrega o punto de control.',
  },
  {
    term: 'Predecesora',
    name: 'Predecessor',
    category: 'Cronograma',
    definition:
      'Actividad cuya condición o terminación controla cuándo puede iniciar otra actividad.',
  },
  {
    term: 'Pronóstico',
    name: 'Forecast',
    category: 'Cronograma',
    definition:
      'Estimación vigente de fechas y costos basada en el desempeño y condiciones actuales.',
  },
  {
    term: 'Fecha de corte',
    name: 'Data date',
    category: 'Cronograma',
    definition:
      'Momento de referencia hasta el cual se registran avances reales y desde el cual se proyecta el trabajo restante.',
  },
  {
    term: 'EPC',
    name: 'Engineering, Procurement and Construction',
    category: 'Construcción',
    definition:
      'Modalidad que integra ingeniería, procura y construcción bajo una responsabilidad coordinada.',
  },
  {
    term: 'MEP',
    name: 'Mechanical, Electrical and Plumbing',
    category: 'Construcción',
    definition: 'Conjunto de instalaciones mecánicas, eléctricas e hidrosanitarias de una obra.',
  },
  {
    term: 'HVAC',
    name: 'Heating, Ventilation and Air Conditioning',
    category: 'Construcción',
    definition: 'Sistemas de calefacción, ventilación y aire acondicionado.',
  },
  {
    term: 'Procura',
    name: 'Procurement',
    category: 'Construcción',
    definition:
      'Proceso de compra, contratación, fabricación, inspección y entrega de bienes o servicios.',
  },
  {
    term: 'Puesta en marcha',
    name: 'Commissioning',
    category: 'Construcción',
    definition:
      'Verificación y pruebas para confirmar que sistemas y equipos operan conforme al diseño.',
  },
  {
    term: 'HSE',
    name: 'Health, Safety and Environment',
    category: 'Riesgos y calidad',
    definition: 'Gestión integrada de salud, seguridad ocupacional y medio ambiente.',
  },
  {
    term: 'SGI',
    name: 'Sistema de Gestión Integrado',
    category: 'Riesgos y calidad',
    definition:
      'Marco que coordina calidad, ambiente, seguridad, salud y cumplimiento dentro de la organización.',
  },
  {
    term: 'KPI',
    name: 'Key Performance Indicator',
    category: 'Riesgos y calidad',
    definition: 'Indicador clave utilizado para evaluar desempeño frente a una meta concreta.',
  },
  {
    term: 'Exposición al riesgo',
    name: 'Probabilidad × impacto',
    category: 'Riesgos y calidad',
    definition:
      'Medida para priorizar amenazas u oportunidades según su posibilidad de ocurrencia y consecuencia.',
  },
  {
    term: 'Riesgo residual',
    name: 'Residual risk',
    category: 'Riesgos y calidad',
    definition: 'Riesgo que permanece después de aplicar una respuesta o medida de control.',
  },
  {
    term: 'Contingencia',
    name: 'Contingency',
    category: 'Riesgos y calidad',
    definition:
      'Reserva o respuesta prevista para riesgos identificados que podrían materializarse.',
  },
  {
    term: 'Incidencia',
    name: 'Issue',
    category: 'Riesgos y calidad',
    definition: 'Situación que ya ocurrió y requiere acción, responsable y fecha de resolución.',
  },
]

const categories = ['Todas', ...new Set(entries.map((entry) => entry.category))]

export function GlossaryView() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todas')
  const visibleEntries = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return entries.filter(
      (entry) =>
        (category === 'Todas' || entry.category === category) &&
        (!normalized ||
          `${entry.term} ${entry.name} ${entry.definition}`.toLowerCase().includes(normalized)),
    )
  }, [category, query])

  return (
    <>
      <PageHead
        eyebrow="AYUDA / LENGUAJE DEL PROYECTO"
        title="Glosario de gestión y obra"
        copy="Definiciones prácticas para interpretar el cronograma, los indicadores y la gobernanza de LAB04."
      />
      <section className="glossary-tools" aria-label="Herramientas del glosario">
        <label>
          <span>Buscar abreviatura o concepto</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ej. CPI, ruta crítica, contingencia…"
          />
        </label>
        <div className="glossary-categories" aria-label="Categorías">
          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? 'active' : ''}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>
      <div className="glossary-count">
        <b>{visibleEntries.length}</b> conceptos disponibles
      </div>
      <section className="glossary-grid" aria-live="polite">
        {visibleEntries.map((entry) => (
          <article className="glossary-entry" key={entry.term}>
            <div>
              <strong>{entry.term}</strong>
              <span>{entry.category}</span>
            </div>
            <h3>{entry.name}</h3>
            <p>{entry.definition}</p>
            {entry.interpretation && <small>{entry.interpretation}</small>}
          </article>
        ))}
        {!visibleEntries.length && (
          <p className="glossary-empty">No encontramos un concepto con esos criterios.</p>
        )}
      </section>
    </>
  )
}
