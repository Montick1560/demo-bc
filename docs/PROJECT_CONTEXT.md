# LAB04 - Contexto y reglas del proyecto

Última actualización: 12 de julio de 2026 (experiencias Presentación y Estado natural).

## 1. Contexto general

LAB04 es un prototipo de CRM y plataforma de gestión de proyectos para BCySA. La solución debe sentirse como una herramienta interna que ha evolucionado junto con la empresa durante años, pero con una experiencia visual contemporánea, empresarial y propia de 2026.

La plataforma toma como base el documento `Estapas de proyecto PMI Rev. 00 (10-07-26).pdf` y la forma de trabajo publicada por BCySA para administrar proyectos de infraestructura mediante principios y técnicas del Project Management Institute (PMI).

No existe backend para esta fase. Los datos son demostrativos y permanecen únicamente durante la sesión.

## 2. Empresa objetivo: BCySA

BCySA desarrolla, administra, supervisa y construye proyectos de infraestructura. Sus áreas relevantes para LAB04 incluyen:

- Ingeniería, Procura y Construcción (EPC).
- Infraestructura para energía, hidrocarburos y agua.
- Infraestructura civil, carretera, industrial y de transporte.
- Administración de proyectos y control de obra.
- Consultoría ambiental, impacto social y derechos inmobiliarios.
- Ingeniería, diseño, factibilidad, comisionamiento y puesta en marcha.
- Control integral de costos, recursos, calidad y cumplimiento normativo.

La experiencia debe reforzar los pilares que BCySA comunica públicamente:

- Calidad.
- Medio ambiente.
- Seguridad y salud en el trabajo.
- Integridad del personal.
- Cumplimiento legal y normativo.
- Mejora continua.
- Innovación en ingeniería.

## 3. Metodología PMI del prototipo

### Inicio

- Nombre y objetivo general del proyecto.
- Interesados principales.
- Criterios de éxito en tiempo, costo, calidad y seguridad.
- Autorización formal del proyecto.

### Planificación

- Alcance y estructura de desglose del trabajo (WBS).
- Cronograma, duración, responsables y porcentaje de avance.
- Presupuesto estimado y costo real.
- Criterios y métricas de calidad.
- Recursos humanos, materiales y maquinaria.
- Plan de comunicaciones.
- Registro y respuesta de riesgos.
- Adquisiciones, contratos y proveedores.
- Mapa de poder e interés de los interesados.

### Cronograma y presupuesto

- Gantt e hitos clave.
- Línea base y pronóstico vigente.
- Ruta crítica y holgura.
- Desglose por materiales, mano de obra, maquinaria e indirectos.
- Indicadores CPI, SPI y avance físico.
- Earned Value Management (EVM).

### Gestión de riesgos

- Riesgos técnicos, ambientales, financieros y normativos.
- Probabilidad, impacto y exposición.
- Responsable del riesgo.
- Mitigación y contingencia.
- Seguimiento de riesgos residuales y secundarios.

### Monitoreo y control

- Reportes semanales de avance.
- Control integrado de cambios.
- Comité de Control de Cambios (CCB).
- Evaluación de impacto en alcance, costo, plazo y riesgo.
- Indicadores EVM.
- Auditorías internas.
- Registro de incidencias y decisiones.

### Cierre

- Expediente y documentación final.
- Acta de aceptación del cliente.
- Entrega y puesta en operación.
- Lecciones aprendidas.
- Evaluación post-proyecto.

## 4. Funcionalidades actuales

### Narrativa del caso práctico

El caso práctico `Interconexión El Encino - La Laguna` (BCY-PMO-2026-014) narra un proyecto **iniciado y terminado dentro del CRM**, cubriendo las seis etapas PMI del PDF de referencia:

- Autorización formal el 12 de enero de 2026 (Acta de constitución Rev. 02, Comité de Inversión BCySA).
- Ejecución del 15 de enero al 29 de septiembre de 2026, con entrega en fecha contractual.
- Resultado final: avance 100%, BAC $18,450,000, costo final $18,020,000, CPI 1.02, SPI 1.00, VAC +$430,000.
- Riesgos del registro cerrados sin impacto residual; cambios resueltos por el CCB (2 aprobados, 1 rechazado).
- Acta de aceptación ACTA-BCY-014-2026 firmada el 9 de octubre de 2026 y evaluación post-proyecto de 4.6/5.

### Doble experiencia de la demo

El mismo proyecto se puede observar en dos momentos mediante un conmutador siempre visible:

- **Presentación:** recorrido guiado y lectura ejecutiva del ciclo concluido en octubre de 2026.
- **Estado natural:** aplicación operativa independiente al corte del 12 de julio de 2026, con 64% de avance frente a 67% planeado, CPI 1.04, SPI 0.96, riesgos abiertos, cambios por decidir y actividades pendientes.

No son dos proyectos ni dos productos separados. La raíz cambia el adaptador y el shell, conservando contratos, branding e identidad visual. Cada modo mantiene su propia instancia durante la sesión para evitar que una edición demostrativa altere el otro momento. Cambiar el rol demostrativo no reconstruye esas instancias: conserva los registros capturados y recalcula capacidades, acciones disponibles y explicaciones de solo consulta. El Estado natural tiene navegación por áreas de trabajo y vistas creadas desde cero para planificación/WBS, cronograma, costos y estimaciones, riesgos, cambios y aprobaciones, documentos y control de campo.

### Caso de uso guiado

Además de las seis etapas como mapa metodológico, el módulo **Caso de uso** (`recorrido`) narra cómo se **ocupó realmente** el CRM: un recorrido de siete escenas (autorización → planeación → riesgo del permiso → recuperación de cronograma → control de cambios → seguimiento ejecutivo → cierre), cada una con disparador, acciones concretas en LAB04, resultado y un botón que abre el módulo real donde ocurrió. Es la respuesta a "cómo sería usar el proyecto", no solo qué contiene. Accesible desde la barra lateral y desde el botón "Ver recorrido" del portafolio; bilingüe y responsive (rail horizontal en móvil).

### Capacidades

- Login demostrativo con selección de rol.
- Portafolio demostrativo con proyectos activos, finalizados, cancelados y en espera; el caso elegible ofrece "Abrir caso práctico" y "Ver recorrido".
- Caso práctico único y elegible: `Interconexión El Encino - La Laguna`.
- Roles de Administrador, Project Manager y Supervisor.
- Navegación por las seis etapas PMI y por el caso de uso guiado con deep-links a cada módulo.
- Dashboard ejecutivo con avance, CPI, SPI y presupuesto.
- Histórico mensual de rendimiento del caso práctico con avance, CPI, SPI y narrativa operativa.
- Indicadores SGI/HSE de seguridad, cumplimiento y permisos.
- Planeación con control de versión/escenario, alta demostrativa de WBS y documentos.
- WBS, recursos, comunicaciones y adquisiciones.
- Gantt de dos paneles al estilo MS Project/Primavera P6: grid de actividades (nombre, responsable y duración) a la izquierda y lienzo de timeline a la derecha, con búsqueda, filtros, alta y edición de actividades, actualización de avance y EVM.
- Flechas de dependencia entre barras (fin→inicio, con retorno en traslapes), línea base bajo la barra vigente, hitos en rombo y línea de corte (data date) al 29 sep 2026.
- Escala conmutable Meses/Trimestres y hover sincronizado entre el grid de actividades y las barras.
- Desviación contra línea base por actividad (días) en el detalle del cronograma y en tooltips del Gantt.
- Columnas de duración y holgura libre (calculada desde las sucesoras) en la tabla de detalle.
- Tarjeta de carga por responsable con días calendario y número de actividades por persona.
- Curva S del proyecto (planeado vs. real) y tendencia mensual CPI/SPI en SVG nativo.
- KPIs ejecutivos del cronograma: actividades, terminadas, hitos cumplidos, desviación de línea base, críticas abiertas y fecha de entrega.
- Exportación del cronograma a CSV desde la barra de herramientas.
- Vista de cronograma totalmente bilingüe (namespace `schedule` en el catálogo i18n).
- Glosario consultable de abreviaturas PMI/EVM y conceptos relevantes de gobierno, cronograma, construcción, riesgos y calidad.
- Formularios de alta y edición presentados en modales accesibles con foco controlado, Escape, fondo inerte y restauración del foco (patrón `FormModal`).
- Modales de detalle de solo lectura (`DetailModal`, mismo patrón accesible sin formulario) para revisar documentos y registros: acta de constitución (Inicio), detalle de riesgo con mitigación/contingencia/seguimiento (Riesgos), reporte semanal completo (Control) y acta de aceptación con líneas de firma (Cierre).
- Ficha de inicio con autorización formal del proyecto (acta, patrocinador, fecha y ventana de ejecución).
- Tarjeta de calidad en Planificación con criterios, metas y resultados medidos.
- Presupuesto por partida (materiales, mano de obra, maquinaria e indirectos) servido por el repositorio, con variación calculada.
- EVM de cierre con PV, EV, AC y VAC.
- Registro de riesgos con mitigación, contingencia y estado (abierto/mitigado/cerrado), incluida la categoría normativa.
- Historial de reportes semanales de avance servido por el repositorio.
- Auditorías internas con calificación, hallazgos y estado.
- Cierre con acta de aceptación del cliente (folio, firmante y fechas) y evaluación post-proyecto puntuada.
- Centro PMO con acciones, decisiones y aprobaciones.
- Flujo demostrativo para aprobar o rechazar cambios.
- Matriz RACI.
- Registro de incidencias.
- Registro de lecciones aprendidas.
- Cierre documental con checklist.
- Búsqueda global mediante `Ctrl/Command + K`.
- Centro de notificaciones.
- Formularios contextuales para nuevas entradas.
- Formularios contextuales específicos por módulo, vistas previas de proyectos y documentos, opciones de perfiles, comparativos de línea base y confirmaciones para acciones destructivas.
- Descarga de reporte ejecutivo en CSV.
- Localización Español/Inglés mediante `i18next` y `react-i18next`.

## 5. Branding y dirección visual

El producto mantiene el nombre clave `LAB04` y utiliza el descriptor `Project Control`.

La identidad debe convivir con BCySA sin copiar literalmente su sitio institucional:

- Logotipo oficial de BCySA.
- Azul institucional: `#164863`.
- Ámbar institucional: `#f8b123`.
- Fondos claros, técnicos y de alta legibilidad.
- Contraste oscuro para superficies de control y datos críticos.
- Tipografía nativa de sistema; no depender de fuentes remotas.
- Jerarquía editorial y composición asimétrica controlada.
- Acentos de color reservados para estados, decisiones, alertas e indicadores.
- Microinteracciones funcionales que comuniquen estado.

Evitar:

- Apariencia genérica de dashboard de plantilla.
- Exceso de tarjetas redondeadas y sombras decorativas.
- Glassmorphism indiscriminado.
- Gradientes sin función.
- Iconografía inconsistente.
- Texto excesivamente pequeño.
- Elementos decorativos asociados con "AI slop".
- Copiar diseños de Dribbble, Figma o Canva; únicamente deben usarse como investigación.

## 6. Roles de colaboración

### Responsable Backend

El usuario es especialista Backend y liderará:

- Contratos de API.
- Persistencia y modelo de datos.
- Autenticación y autorización reales.
- Reglas de negocio del servidor.
- Integraciones e infraestructura.

### Frontend Senior

Codex actuará como Frontend Senior con más de quince años de experiencia y será responsable de:

- Arquitectura Frontend.
- Diseño de producto y sistema visual.
- Accesibilidad.
- Rendimiento.
- Experiencia responsive.
- Internacionalización.
- Selección responsable de dependencias.
- Contratos tipados para integrar el backend.
- Calidad, pruebas y mantenibilidad del cliente.

El usuario no necesita conocer Frontend para solicitar cambios. Las decisiones técnicas deben explicarse en términos claros cuando afecten al backend, al contrato de datos o a la operación del producto.

Codex debe anticipar y plantear preguntas críticas sobre producto, accesibilidad, integración, permisos, rendimiento y operación, explicándolas en términos claros para un especialista Backend.

## 7. Stack autorizado

- React 19.
- TypeScript 7.0.2.
- Bun.
- Vite.
- CSS nativo.
- Oxlint.
- `i18next` y `react-i18next` para internacionalización.

No utilizar frameworks CSS, kits de componentes o librerías de iconos sin una justificación explícita.

## 8. Reglas de arquitectura

- Organizar el código por dominio de negocio.
- Mantener un componente por responsabilidad principal.
- Evitar componentes monolíticos.
- Separar composición, lógica, datos demostrativos y estilos.
- Los módulos de negocio pueden importar desde `shared`, pero no deben depender de detalles internos de otro módulo.
- Mantener las etapas PMI en módulos independientes.
- El shell de la aplicación solo debe coordinar navegación, overlays y estado transversal.
- Los servicios futuros de API deben vivir dentro del dominio correspondiente.
- Los componentes de UI no llamarán directamente a clientes HTTP.
- Utilizar contratos TypeScript para los límites con el backend.
- Evitar abstracciones anticipadas sin un caso real.
- Mantener CSS dividido por responsabilidad: tokens, base, login, shell, dashboard, módulos y PMO.
- Conservar accesibilidad de teclado, foco visible y reducción de movimiento.
- Todo cambio importante debe funcionar en escritorio y móvil.

## 9. Política de dependencias

React es la única dependencia base de UI. Una nueva dependencia requiere:

- Necesidad funcional concreta.
- Proyecto activamente mantenido.
- Licencia compatible.
- Historial razonable de seguridad.
- Compatibilidad con TypeScript, React y Bun.
- Ventaja medible sobre APIs nativas o código local sencillo.
- Impacto aceptable en el tamaño del bundle.
- Plan claro para sustituirla si deja de mantenerse.

No se aceptarán dependencias desconocidas, abandonadas, innecesarias o con riesgo de comprometer la continuidad del proyecto.

## 10. Internacionalización

- Idiomas iniciales: Español e Inglés.
- Español es el idioma predeterminado.
- La preferencia se conserva localmente en el dispositivo.
- Todo texto nuevo visible para el usuario debe agregarse al catálogo de traducciones.
- Evitar concatenar fragmentos que impidan una traducción natural.
- Fechas, monedas y números deben formatearse según la configuración regional.
- Los nombres propios, códigos de proyecto y acrónimos técnicos no se traducen.

## 11. Integración futura con Backend

Cuando exista API, priorizar los siguientes contratos:

1. Sesión, usuario, roles y permisos.
2. Portafolio y proyectos.
3. WBS, actividades, dependencias e hitos.
4. Presupuesto, partidas, estimaciones y EVM.
5. Riesgos, incidencias y acciones.
6. Solicitudes de cambio y aprobaciones CCB.
7. Interesados, comunicaciones y RACI.
8. Documentos, entregables y cierre.
9. Auditoría, historial y notificaciones.

El frontend debe tratar el servidor como fuente de verdad. La autorización siempre se validará en backend; ocultar controles en UI no sustituye la seguridad del servidor.

## 12. Reglas de entrega

- Ejecutar lint y build antes de considerar terminado un cambio.
- Verificar visualmente los cambios que afecten diseño o responsive.
- No romper flujos existentes al agregar funcionalidades.
- No introducir persistencia simulada que pueda confundirse con almacenamiento real.
- Mantener datos de muestra realistas para proyectos EPC e infraestructura.
- Documentar decisiones que afecten arquitectura o contratos.
- Priorizar claridad operativa sobre decoración.
- Mantener LAB04 local mientras no se solicite explícitamente publicación o despliegue.

## 13. Fuentes de referencia

- PDF interno: `C:\Users\torso\Downloads\Estapas de proyecto PMI Rev. 00 (10-07-26).pdf`.
- Sitio corporativo: <https://bcysa.mx/>.
- Administración de proyectos BCySA: <https://bcysa.mx/administracion-de-proyectos-y-control-de-obra/>.
- Project Management Institute: <https://www.pmi.org/>.
- Documentación i18next: <https://www.i18next.com/>.
- Documentación react-i18next: <https://react.i18next.com/>.
