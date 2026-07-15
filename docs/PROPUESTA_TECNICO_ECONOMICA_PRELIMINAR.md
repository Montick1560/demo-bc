# Propuesta técnico-económica preliminar

## Plataforma integral de gestión y control de proyectos BCySA

**Versión:** 0.1 — estimación presupuestaria previa al levantamiento  
**Fecha:** 12 de julio de 2026  
**Inversión estimada:** **$650,000 MXN más IVA**  
**Carácter:** preliminar y sujeto a validación de requerimientos con BCySA

---

## 1. Resumen ejecutivo

La propuesta contempla convertir la metodología de gestión de proyectos actualmente operada mediante archivos Excel en una plataforma web centralizada, trazable y reutilizable.

La plataforma permitirá que BCySA genere y controle la información desde su origen, en lugar de limitarse a conectar archivos existentes con Power BI. Los tableros ejecutivos serán la capa de presentación de una operación previamente estructurada dentro del sistema.

Los objetivos preliminares son:

- Fortalecer la capacidad tecnológica demostrable de BCySA en procesos de licitación.
- Centralizar portafolio, proyectos, planificación, cronograma, costos, riesgos, cambios, documentos y evidencia de campo.
- Reducir la dependencia de archivos Excel aislados.
- Generar información consistente para Power BI.
- Mantener trazabilidad de capturas, revisiones y aprobaciones.
- Permitir crecimiento gradual sin costos de licencia de SQL Server u Oracle.

> Esta estimación parte de la metodología PMI implementada en la demostración actual. El alcance definitivo deberá validarse mediante la revisión de procesos, formatos Excel, tableros Power BI, licitaciones y criterios de aceptación de BCySA.

---

## 2. Alcance funcional preliminar

### 2.1 Núcleo de plataforma

- Inicio de sesión y recuperación de acceso.
- Segundo factor básico mediante código por correo.
- Usuarios, roles y capacidades.
- Administración de sesiones.
- Portafolio de proyectos.
- Creación y configuración de proyectos.
- Separación de información por proyecto y cliente.
- Bitácora básica de acciones sensibles.

### 2.2 Gestión de proyectos

- Inicio y ficha general.
- Planificación y WBS.
- Cronograma, actividades, dependencias e hitos.
- Avance físico y línea base.
- Costos, presupuestos y estimaciones.
- Riesgos, incidencias y respuestas.
- Solicitudes de cambio y decisiones CCB.
- Documentos, revisiones y evidencia.
- Partes y seguimiento de campo.
- Cierre básico del proyecto.

### 2.3 Información ejecutiva y Power BI

- Esquema PostgreSQL de lectura para reportería.
- Vistas controladas para proyectos, avance, costos, riesgos y cambios.
- Usuario exclusivo de consulta.
- Diccionario inicial de datos.
- Preparación técnica para conexión con Power BI.
- Acompañamiento técnico para la primera conexión.

La construcción de tableros Power BI, modelos DAX avanzados y licencias Microsoft se consideran adicionales salvo que se incorporen expresamente al alcance definitivo.

### 2.4 Infraestructura

- Aplicación web React TSX.
- API ASP.NET Core .NET 10.
- PostgreSQL sin costo de licencia del motor.
- Despliegue inicial en Azure México Central, sujeto a disponibilidad de servicios y SKU.
- Blob Storage para archivos.
- Gestión segura de secretos.
- Monitoreo y registro de errores.
- Pipeline básico de despliegue.

La suscripción, infraestructura y servicios de terceros deberán quedar a nombre y cargo de BCySA.

---

## 3. Desglose económico

| Fase                          | Actividades principales                                                                             |          Importe |
| ----------------------------- | --------------------------------------------------------------------------------------------------- | ---------------: |
| 0. Descubrimiento y blueprint | Revisión de licitaciones, Excel, procesos, Power BI, prioridades, backlog y criterios de aceptación |          $55,000 |
| 1. Arquitectura y plataforma  | Arquitectura Azure, solución .NET, modelo PostgreSQL, seguridad, ambientes y CI/CD                  |          $70,000 |
| 2. Backend y núcleo           | Usuarios, autenticación, permisos, proyectos, repositorios, auditoría y API                         |         $150,000 |
| 3. Dominios PMI               | WBS, cronograma, costos, riesgos, cambios, documentos, campo y cierre básico                        |         $130,000 |
| 4. Frontend e integración     | Adaptación de la demo, integración con API, estados, validaciones, permisos y responsive            |          $80,000 |
| 5. Power BI y reportería      | Esquema de lectura, vistas, usuario de consulta, diccionario y conexión inicial                     |          $45,000 |
| 6. Calidad y seguridad base   | Pruebas unitarias, integración, E2E, revisión de permisos y optimización inicial                    |          $50,000 |
| 7. Despliegue y transferencia | Producción, documentación, capacitación, estabilización y garantía                                  |          $35,000 |
| 8. Dirección funcional        | Validación PMI, priorización, UAT, coordinación funcional y aceptación                              |          $35,000 |
| **Total**                     |                                                                                                     | **$650,000 MXN** |

**IVA no incluido.**

Los importes representan entregables y responsabilidades del proyecto. No constituyen salarios individuales ni deben utilizarse como desglose de nómina ante el cliente.

---

## 4. Distribución interna referencial

Esta sección es para negociación entre los participantes y no necesariamente debe incluirse en la versión entregada a BCySA.

| Responsabilidad                                            |  Reserva sugerida |
| ---------------------------------------------------------- | ----------------: |
| Desarrollo, arquitectura e implementación técnica          | $445,000–$475,000 |
| Dirección funcional, metodología y relación con el cliente |  $90,000–$120,000 |
| Garantía, herramientas, contingencia y soporte de salida   |   $75,000–$95,000 |

La distribución definitiva depende de:

- Quién firmará el contrato.
- Quién facturará a BCySA.
- Quién administrará los pagos.
- Disponibilidad semanal del responsable funcional.
- Participación en levantamiento, UAT y capacitación.
- Existencia o no de comisión comercial.

No se recomienda mezclar una comisión comercial con honorarios funcionales completos sin definir claramente ambas responsabilidades.

---

## 5. Forma de pago propuesta

| Hito                                                     | Porcentaje |      Importe |
| -------------------------------------------------------- | ---------: | -----------: |
| Firma, anticipo y comienzo del levantamiento             |        30% |     $195,000 |
| Arquitectura, autenticación y núcleo funcional aceptados |        25% |     $162,500 |
| Beta integrada con módulos principales                   |        25% |     $162,500 |
| UAT y preparación productiva                             |        15% |      $97,500 |
| Producción y entrega documental                          |         5% |      $32,500 |
| **Total**                                                |   **100%** | **$650,000** |

Condiciones recomendadas:

- No iniciar sin contrato y anticipo.
- Aceptación de entregables en un máximo de cinco días hábiles.
- Solicitudes nuevas se evalúan mediante control de cambios.
- La entrega definitiva de código y documentación queda condicionada al pago total.
- Los retrasos de validación del cliente desplazan el calendario en la misma proporción.

---

## 6. Calendario preliminar

| Periodo                 | Resultado esperado                                                      |
| ----------------------- | ----------------------------------------------------------------------- |
| 15–31 julio             | Descubrimiento, análisis de Excel, licitaciones, arquitectura y alcance |
| 1–21 agosto             | PostgreSQL, autenticación, usuarios, proyectos y API base               |
| 22 agosto–12 septiembre | WBS, cronograma, costos, riesgos, cambios y documentos                  |
| 13–30 septiembre        | Campo, integración frontend, reportería y beta funcional                |
| 1–9 octubre             | UAT, correcciones, carga y capacitación                                 |
| 12 octubre              | Salida productiva objetivo                                              |
| 15 octubre              | Límite de contingencia                                                  |

El calendario requiere:

- Alcance priorizado y congelado después del descubrimiento.
- Respuestas funcionales en un máximo de 24–48 horas.
- Acceso oportuno a formatos Excel, Power BI y documentación.
- Responsable de UAT designado por BCySA.
- Ausencia de nuevas integraciones no contempladas.

---

## 7. Supuestos de la estimación

- La primera versión será exclusivamente web.
- Se reutilizará la experiencia frontend actualmente desarrollada.
- Se implementará una sola organización inicial: BCySA.
- PostgreSQL será el motor de base de datos.
- Los archivos se almacenarán fuera de PostgreSQL.
- Se consideran al menos 4 GB de archivos por proyecto.
- Se preparará la arquitectura para crecimiento y escalamiento.
- El compromiso de 500 usuarios simultáneos requiere pruebas formales adicionales.
- Power BI consumirá vistas de lectura, no tablas transaccionales sin control.
- Las aprobaciones serán internas y auditables, sin firma jurídica certificada.
- La retención y atención ARCO deberán validarse con el área jurídica.
- BCySA será propietaria y responsable del pago de la infraestructura.

---

## 8. Exclusiones iniciales

- Aplicación móvil nativa.
- Operación sin conexión.
- Firma electrónica certificada.
- Integración con ERP, SAP, Primavera u otros sistemas no identificados.
- Migración histórica masiva.
- Construcción ilimitada de tableros Power BI.
- Licencias Power BI, Fabric, Azure o terceros.
- WhatsApp como canal de autenticación.
- Pentest externo.
- Soporte 24/7.
- Alta disponibilidad multirregión.
- Certificaciones normativas del software.
- Personalizaciones no identificadas después del cierre de alcance.

---

## 9. Opcionales

| Adicional                                |                                   Estimación |
| ---------------------------------------- | -------------------------------------------: |
| Integración OTP mediante WhatsApp        |                  $45,000–$75,000 más consumo |
| Tres tableros Power BI                   |               $75,000–$130,000 más licencias |
| Prueba formal de 500 usuarios virtuales  | $35,000–$60,000 más infraestructura temporal |
| Firma electrónica especializada          |               $50,000–$120,000 más proveedor |
| Seguridad y alta disponibilidad ampliada |         $60,000–$150,000 más infraestructura |
| Migración de datos históricos            |                              Por dimensionar |
| Soporte mensual posterior a garantía     |                    $15,000–$35,000 mensuales |

---

## 10. Infraestructura mensual estimada

| Escenario                                                  |   Estimación mensual |
| ---------------------------------------------------------- | -------------------: |
| Desarrollo y QA                                            |   $4,000–$10,000 MXN |
| Producción inicial                                         |   $8,000–$18,000 MXN |
| Producción escalada, réplica analítica y mayor resiliencia | $18,000–$40,000+ MXN |

Los importes dependen de concurrencia real, volumen de documentos, respaldos, telemetría, región, Power BI/Fabric y nivel de disponibilidad contratado.

---

## 11. Qué puede entregarse por $25,000–$30,000 MXN

Un presupuesto de $25,000–$30,000 puede cubrir únicamente una etapa acotada, por ejemplo:

- Levantamiento inicial.
- Revisión de algunos archivos Excel.
- Documento de requerimientos preliminar.
- Ajustes menores a la demostración existente.
- Presentación conceptual.
- Arquitectura de alto nivel.
- Estimación posterior de implementación.

No permite cubrir responsablemente:

- Backend productivo.
- Base de datos y migraciones.
- Autenticación y permisos.
- Integración completa con Power BI.
- Gestión documental.
- Despliegue productivo.
- Pruebas de carga.
- Garantía y soporte.
- Responsabilidad por una entrega empresarial en octubre.

Si se acuerda trabajar inicialmente por ese importe, debe nombrarse **Fase de descubrimiento y definición**, no “desarrollo de la plataforma”.

---

## 12. Puntos por confirmar en la reunión con BCySA

1. Requisito tecnológico exacto de las licitaciones perdidas.
2. Alcance mínimo necesario para futuras licitaciones.
3. Formatos Excel y archivos Power BI existentes.
4. Usuarios registrados y concurrencia real.
5. Proyectos nuevos por año.
6. Roles internos, contratistas y clientes externos.
7. Tableros Power BI requeridos.
8. Licencias Microsoft actuales.
9. Flujo de aprobaciones y necesidad de firma.
10. Migración histórica.
11. Residencia y política de retención de datos.
12. Disponibilidad, recuperación y soporte esperado.
13. Criterios de aceptación para octubre.
14. Responsable funcional y responsable de UAT.
15. Presupuesto disponible y proceso de contratación.

---

## 13. Vigencia y ajuste

Esta propuesta tiene carácter presupuestario y una vigencia recomendada de 15 días naturales.

El importe definitivo deberá emitirse después de la reunión de descubrimiento y de la revisión de los materiales proporcionados por BCySA. Una variación material en usuarios, integraciones, migración, Power BI, firma, disponibilidad o seguridad podrá modificar costo y calendario.

---

## Anexo A — Tier on-premise de disponibilidad básica

### A.1 Objetivo

Este tier permite operar la plataforma principalmente dentro de las instalaciones de BCySA, mediante intranet. El acceso desde otras ubicaciones se realizará exclusivamente a través de una VPN corporativa.

Su propósito es disminuir el gasto recurrente de nube y mantener los datos primarios bajo custodia física de BCySA. No constituye una solución de alta disponibilidad: la falla de cualquiera de los dos servidores, del firewall, de Internet o de la energía puede interrumpir el servicio.

### A.2 Arquitectura propuesta

| Componente | Responsabilidad principal |
| --- | --- |
| Firewall corporativo | Terminación de VPN, reglas de acceso, segmentación y registro de conexiones |
| Servidor físico A — Aplicación | Frontend React, API .NET 10, tareas en segundo plano, monitoreo y proxy inverso |
| Servidor físico B — Datos | PostgreSQL, almacenamiento documental productivo y vistas de lectura para Power BI |
| Destino independiente de respaldo | Copias cifradas, historial de recuperación y respaldo fuera de los discos productivos |
| Power BI Gateway | Puente controlado entre PostgreSQL local y Power BI; requiere un entorno Windows compatible |

El destino de respaldo puede ser un NAS, discos externos rotados o almacenamiento cifrado fuera del sitio. No se considera un tercer servidor de aplicaciones, pero sí es obligatorio para considerar el ambiente productivo.

### A.3 Dimensionamiento preliminar

El dimensionamiento definitivo dependerá de concurrencia real, número de proyectos, volumen documental y frecuencia de actualización de Power BI.

| Equipo | Configuración inicial sugerida |
| --- | --- |
| Servidor A | 12–16 núcleos, 64 GB RAM ECC, dos SSD empresariales de 1.92 TB en RAID 1, red de 1/10 GbE |
| Servidor B | 16 núcleos, 128 GB RAM ECC, cuatro SSD empresariales de 1.92 TB en RAID 10, red de 10 GbE |
| Respaldo | NAS de cuatro bahías con discos empresariales, snapshots y una copia cifrada fuera del sitio |
| Perímetro | Firewall con VPN y MFA, UPS para servidores, NAS y comunicaciones |

Esta configuración es un punto de partida para hasta 500 usuarios registrados. No representa una garantía de 500 usuarios simultáneos; esa capacidad deberá validarse mediante pruebas de carga y mediciones sobre los flujos definitivos.

### A.4 Power BI

- Power BI utilizará un usuario PostgreSQL de solo lectura y vistas específicas de reportería.
- Para este tier se recomienda modo de importación con actualizaciones programadas, evitando cargar la base transaccional mediante DirectQuery continuo.
- El gateway no deberá instalarse en un controlador de dominio ni exponerse directamente a Internet.
- Las licencias Power BI, Windows Server y cualquier servicio Microsoft no están incluidas.
- Debe validarse con BCySA la residencia del tenant y el tratamiento de los datos enviados al servicio Power BI, ya que la aplicación y PostgreSQL sean locales no implica que los modelos publicados permanezcan únicamente en las instalaciones.

### A.5 Recuperación y límites de servicio

- Objetivo preliminar de pérdida máxima de datos (RPO): hasta una hora.
- Objetivo preliminar de restauración por falla de software (RTO): hasta ocho horas hábiles.
- Una falla física puede exceder el RTO y dependerá de refacciones, garantía y disponibilidad del proveedor.
- Respaldo completo diario, archivado frecuente del registro de transacciones y prueba de restauración trimestral.
- Soporte base en horario hábil; no incluye operación 24/7.

Estos objetivos sólo son válidos si BCySA proporciona energía protegida, conectividad estable, acceso técnico, medios de respaldo y mantenimiento de hardware.

### A.6 Inversión estimada del tier

| Concepto | Estimación preliminar |
| --- | ---: |
| Descubrimiento y alcance cerrado | $30,000 MXN |
| MVP operativo on-premise | $290,000–$350,000 MXN |
| Infraestructura física y licencias | $250,000–$500,000 MXN |
| Soporte posterior opcional | $12,000–$25,000 MXN mensuales |

**IVA no incluido.** La infraestructura debe comprarse y quedar a nombre de BCySA. Si la empresa ya dispone de servidores compatibles, firewall, UPS, respaldo, Windows Server y personal de TI, el costo de infraestructura puede reducirse después de una revisión técnica.

El MVP operativo contempla autenticación por correo, usuarios y capacidades, portafolio, proyectos, WBS, cronograma, riesgos, cambios básicos, documentos, bitácora, vistas de reportería, instalación local y capacitación inicial. No contempla alta disponibilidad, 500 conexiones simultáneas garantizadas, WhatsApp, firma certificada, migración histórica masiva ni construcción avanzada de tableros Power BI.

### A.7 Condiciones críticas para cotizarlo

Antes de fijar precio, BCySA deberá confirmar:

1. Si ya cuenta con los dos servidores y sus especificaciones exactas.
2. Si dispone de firewall con VPN, MFA, IP pública fija y ancho de banda suficiente.
3. Si cuenta con rack, UPS, climatización, garantía y personal de TI.
4. Si existe un NAS o mecanismo de respaldo fuera del sitio.
5. Cuántos usuarios estarán conectados simultáneamente dentro y fuera de la oficina.
6. Qué licencias Power BI y Windows Server posee actualmente.
7. Si Power BI operará mediante importación programada o requiere DirectQuery.
8. Qué horario de soporte y tiempo máximo de interrupción acepta el negocio.

Este tier reduce alcance y gasto recurrente, pero no reduce de forma proporcional el esfuerzo de desarrollo. El precio final deberá derivarse del proceso y de los entregables aceptados, no solamente del lugar donde se hospede la plataforma.
