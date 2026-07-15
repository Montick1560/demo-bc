import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '../../shared/format'
import { Card } from '../../shared/ui'

const rows = [
  ['Cimentación', '15 Jul', '18 Jul', '+3 días', '0 días', true],
  ['Estructura metálica', '02 Ago', '06 Ago', '+4 días', '0 días', true],
  ['Instalaciones MEP', '24 Ago', '27 Ago', '+3 días', '2 días', true],
  ['Acabados', '12 Sep', '12 Sep', 'Sin cambio', '6 días', false],
  ['Puesta en marcha', '27 Sep', '29 Sep', '+2 días', '0 días', true],
] as const

export function BaselineTab() {
  const { i18n } = useTranslation()
  const [baseline, setBaseline] = useState('Contractual / 15 Ene 2026')
  return (
    <div className="pmo-layout baseline-layout">
      <Card className="baseline-card wide">
        <header>
          <div>
            <h3>Comparativo de línea base</h3>
            <p>Fechas comprometidas frente al pronóstico vigente.</p>
          </div>
          <select value={baseline} onChange={(event) => setBaseline(event.target.value)}>
            <option>Contractual / 15 Ene 2026</option>
            <option>Replanificación 01 / 18 Mar 2026</option>
            <option>Replanificación 02 / 22 May 2026</option>
          </select>
        </header>
        <table>
          <thead>
            <tr>
              <th>Actividad</th>
              <th>Fin línea base</th>
              <th>Fin actual</th>
              <th>Variación</th>
              <th>Holgura total</th>
              <th>Condición</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]}>
                <td>
                  <b>{row[0]}</b>
                </td>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
                <td className={row[3].startsWith('+') ? 'negative' : ''}>{row[3]}</td>
                <td>{row[4]}</td>
                <td>
                  <span className={row[5] ? 'critical-tag' : 'float-tag'}>
                    {row[5] ? 'Ruta crítica' : 'Con holgura'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card className="forecast-card" title="Pronóstico al término">
        <div className="forecast-ring">
          <strong>29</strong>
          <span>
            SEP<b>2 días después de línea base</b>
          </span>
        </div>
        <dl>
          <div>
            <dt>Estimado al término / EAC</dt>
            <dd>{formatCurrency(18_190_000, i18n.resolvedLanguage)}</dd>
          </div>
          <div>
            <dt>Variación al término / VAC</dt>
            <dd className="positive">+{formatCurrency(260_000, i18n.resolvedLanguage)}</dd>
          </div>
          <div>
            <dt>TCPI requerido</dt>
            <dd>0.97</dd>
          </div>
        </dl>
      </Card>
      <Card className="critical-card" title="Ruta crítica" action={<span>5 actividades</span>}>
        {rows
          .filter((row) => row[5])
          .map((row, index) => (
            <div key={row[0]}>
              <i>{index + 1}</i>
              <span>
                <b>{row[0]}</b>
                <small>
                  Holgura {row[4]} / Fin {row[2]}
                </small>
              </span>
              <em>{index < 3 ? 'En curso' : 'Pendiente'}</em>
            </div>
          ))}
      </Card>
    </div>
  )
}
