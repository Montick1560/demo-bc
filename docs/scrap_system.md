# SCRAP SYSTEM — Infraestructura local de bajo costo

## Presupuesto máximo de $85,000 MXN

**Proyecto:** Plataforma de gestión de proyectos BCySA  
**Modalidad:** On-premise, intranet y acceso remoto por VPN  
**Fecha de estimación:** 12 de julio de 2026  
**Presupuesto máximo:** **$85,000 MXN, IVA incluido**  
**Clasificación:** piloto productivo austero, sin alta disponibilidad

---

## 1. Objetivo

Implementar una infraestructura local mínima para ejecutar la plataforma web de BCySA utilizando dos equipos físicos:

- Un equipo para la aplicación, API y Power BI Gateway.
- Un equipo para PostgreSQL y almacenamiento documental productivo.
- Acceso remoto mediante OpenVPN Community Edition o ZeroTier.
- Dos discos USB externos para respaldos rotativos.

Este presupuesto corresponde únicamente a **equipos y licencias base de infraestructura**. No incluye el desarrollo de la plataforma, licencias de usuarios Power BI, instalación especializada, migración, soporte mensual ni garantía de 500 conexiones simultáneas.

---

## 2. Desglose económico

| Partida               | Contenido presupuestado                                                                              |  Importe máximo |
| --------------------- | ---------------------------------------------------------------------------------------------------- | --------------: |
| Equipo A — Aplicación | Torre ensamblada, procesador de 8 núcleos o superior, 64 GB RAM, dos SSD NVMe de 1 TB y red cableada |         $23,000 |
| Equipo B — Datos      | Torre ensamblada, procesador de 12 núcleos o superior, 128 GB RAM, dos SSD de 2 TB y red cableada    |         $34,000 |
| Respaldo removible    | Dos discos USB externos de 4 TB para rotación semanal                                                |          $5,000 |
| Protección eléctrica  | Dos UPS line-interactive de aproximadamente 1,500 VA                                                 |          $9,000 |
| Red local             | Switch Gigabit, cables y accesorios básicos                                                          |          $3,000 |
| Licencia Windows      | Windows Pro para Equipo A y Power BI Gateway                                                         |          $4,500 |
| VPN primer año        | Reserva para ZeroTier Essential; OpenVPN Community Edition tendría licencia $0                       |          $4,500 |
| Reserva de variación  | Diferencias de precio, envío o accesorios menores                                                    |          $2,000 |
| **Total máximo**      |                                                                                                      | **$85,000 MXN** |

Si se utiliza OpenVPN Community Edition y no se consume la reserva anual de ZeroTier, el desembolso estimado baja a **$80,500 MXN**. Si se utiliza ZeroTier Essential durante el primer año, el techo permanece en **$85,000 MXN** y deberá verificarse el tipo de cambio y los impuestos al contratarlo.

Los importes son bolsas máximas de compra y no cotizaciones de proveedor. Antes de adquirir los equipos deberán solicitarse al menos dos cotizaciones y ajustar componentes sin exceder el total autorizado.

---

## 3. Distribución técnica

### Equipo A — Aplicación y reportería

Responsabilidades:

- Frontend React TSX.
- API ASP.NET Core .NET 10.
- Proxy web y certificados internos.
- Procesos en segundo plano.
- Power BI On-premises Data Gateway.
- Registro y monitoreo básicos.

Configuración objetivo:

- Procesador moderno de al menos 8 núcleos.
- 64 GB de memoria RAM.
- Dos unidades NVMe de 1 TB configuradas en espejo.
- Windows Pro compatible y actualizado.
- Conexión Ethernet; no utilizar Wi-Fi para el servidor.

Microsoft establece que Power BI Gateway requiere Windows de 64 bits y recomienda al menos 8 núcleos, 8 GB RAM y almacenamiento SSD. El gateway no debe instalarse en un controlador de dominio. La compatibilidad exacta del sistema operativo deberá validarse antes de la compra: [requisitos de Power BI Gateway](https://learn.microsoft.com/en-us/data-integration/gateway/service-gateway-install).

### Equipo B — Datos

Responsabilidades:

- PostgreSQL.
- Archivos productivos del sistema.
- Vistas y usuario de solo lectura para Power BI.
- Registro de transacciones para recuperación.

Configuración objetivo:

- Procesador moderno de al menos 12 núcleos.
- 128 GB de memoria RAM.
- Dos unidades SSD de 2 TB configuradas en espejo.
- Ubuntu Server LTS.
- PostgreSQL sin costo de licencia.
- Sin exposición directa a Internet.

La capacidad útil aproximada será menor a 2 TB después del espejo, sistema operativo y reservas. El número real de proyectos dependerá del volumen documental, por lo que deberá monitorearse desde el inicio.

### Respaldo removible

- Dos discos USB externos de 4 TB identificados como respaldo A y respaldo B.
- Sólo un disco permanecerá conectado durante la ejecución del respaldo.
- Los discos se rotarán semanalmente para reducir el riesgo de que una falla o ataque afecte ambas copias.
- Se realizará respaldo diario de PostgreSQL y documentos.
- Un responsable de BCySA custodiará el disco desconectado en una ubicación distinta.
- Se realizará una prueba trimestral de restauración.

Esta medida es más manual y menos robusta que un NAS. Si BCySA no asigna un responsable para conectar, rotar y custodiar los discos, no existirá un respaldo confiable.

---

## 4. Acceso remoto e intranet

No se comprará un router o firewall dedicado. Los equipos utilizarán la red y el módem/router que BCySA ya tenga instalados. Esta reducción supone que el equipo existente permite controlar accesos y que su configuración queda bajo responsabilidad de BCySA.

### Opción A — OpenVPN Community Edition

- Licencia de software: $0.
- Se instalará en el Equipo A o en una máquina existente de BCySA.
- Requiere IP pública accesible o una redirección de puerto en el módem/router existente.
- Cada persona utilizará credenciales o certificado individual.
- La administración, actualizaciones, revocaciones y respaldos de configuración serán manuales.

OpenVPN Community Edition es la alternativa de menor costo recurrente. No debe confundirse con OpenVPN Access Server, producto administrable que utiliza un esquema comercial diferente: [edición comunitaria oficial](https://openvpn.net/community/).

### Opción B — ZeroTier Essential

- No requiere publicar directamente el servidor ni contratar inicialmente una IP pública fija.
- Se instalará ZeroTier One en el Equipo A y en cada dispositivo remoto autorizado.
- El plan empresarial Essential parte de USD 18 mensuales e incluye 10 dispositivos; los adicionales se cobran por dispositivo.
- Se reserva un máximo de $4,500 MXN para el primer año básico. El precio final dependerá del tipo de cambio y del número de dispositivos.

ZeroTier indica expresamente que su plan gratuito es personal y permite 10 dispositivos; para una empresa corresponde utilizar Essential o un contrato superior: [precios oficiales](https://www.zerotier.com/pricing/).

### Selección recomendada

1. Utilizar **OpenVPN Community Edition** si BCySA tiene IP pública, control del módem/router y una persona que administre certificados.
2. Utilizar **ZeroTier Essential** para la demostración o un grupo inicial de hasta 10 dispositivos cuando no exista IP pública disponible.
3. No instalar ZeroTier en las 500 cuentas sin revisar costos: su cobro es por dispositivo autorizado.

El segundo factor de la aplicación continuará realizándose por correo. MFA en la capa VPN, inicio de sesión corporativo y administración centralizada quedan fuera de este presupuesto.

---

## 5. Power BI

- Power BI se conectará mediante el gateway instalado en el Equipo A.
- PostgreSQL no se publicará directamente en Internet.
- Se utilizará un usuario de base de datos de solo lectura.
- Se recomienda importación programada y no DirectQuery continuo.
- El gateway sólo necesita realizar conexiones salientes hacia los servicios Microsoft; no requiere abrir PostgreSQL al exterior.

El gateway funciona como puente entre la red local y Power BI: [arquitectura oficial del gateway](https://learn.microsoft.com/en-us/data-integration/gateway/service-gateway-onprem-indepth).

No están incluidas en los $85,000 las licencias Power BI Pro, Premium, Fabric o Microsoft 365. Primero deberá confirmarse qué licenciamiento posee actualmente BCySA.

---

## 6. Capacidad y expectativas

Esta configuración puede servir como infraestructura inicial para una aplicación departamental y hasta 500 cuentas registradas, siempre que la concurrencia real sea moderada.

No permite comprometer contractualmente:

- 500 usuarios conectados simultáneamente.
- Alta disponibilidad.
- Operación 24/7.
- Recuperación inmediata ante falla física.
- Crecimiento documental ilimitado.
- DirectQuery intensivo desde Power BI.
- Garantía empresarial en piezas ensambladas.
- Protección perimetral equivalente a un firewall empresarial dedicado.

Antes de liberar producción se ejecutarán pruebas sobre los flujos críticos. Si la carga supera la capacidad disponible, deberá aumentarse memoria, almacenamiento o migrarse a equipos de clase servidor.

---

## 7. Recuperación esperada

- Respaldo completo diario en el disco USB conectado.
- Respaldos incrementales o archivado de transacciones durante el día.
- Rotación manual semanal de los dos discos de respaldo.
- Pérdida potencial máxima objetivo: hasta 4 horas de información.
- Recuperación por falla de software: hasta un día hábil.
- Recuperación por falla física: sujeta a diagnóstico, refacciones y disponibilidad del proveedor.

Este nivel corresponde a un presupuesto austero. No debe ofrecerse como un SLA empresarial.

---

## 8. Condiciones necesarias de BCySA

BCySA deberá proporcionar:

1. Espacio físico cerrado, ventilado y con acceso controlado.
2. Conexión a Internet empresarial estable.
3. Para OpenVPN, IP pública o capacidad de configurar redirección de puertos; para ZeroTier, salida estable a Internet.
4. Responsables autorizados para altas y bajas de accesos.
5. Cuenta Microsoft organizacional para registrar Power BI Gateway.
6. Licencias Power BI requeridas para autores y consumidores.
7. Atención al reemplazo de piezas y garantías de los equipos.
8. Aceptación expresa de que esta arquitectura no tiene redundancia completa.
9. Responsable de rotar y custodiar los discos de respaldo.
10. Autorización para instalar el cliente ZeroTier u OpenVPN en cada dispositivo remoto.

---

## 9. Mejoras posteriores

Cuando exista presupuesto adicional, el orden recomendado es:

1. Firewall/router empresarial dedicado.
2. NAS y copia cifrada fuera de las instalaciones.
3. UPS en línea y apagado automático controlado.
4. Discos empresariales con mayor resistencia y garantía.
5. Segundo gateway de Power BI.
6. Servidores con memoria ECC, fuentes redundantes y soporte en sitio.
7. MFA centralizado para VPN.
8. Servidor de contingencia o réplica PostgreSQL.
9. Monitoreo y soporte administrado.

---

## 10. Conclusión

El presupuesto máximo de **$85,000 MXN** permite construir una base local todavía más austera. La prioridad será conservar los dos equipos separados, discos productivos en espejo, respaldos USB rotativos y acceso remoto mediante OpenVPN o ZeroTier.

Esta alternativa permite iniciar la operación y realizar una demostración productiva sin comprar firewall o NAS. A cambio, BCySA deberá aceptar mayor dependencia de su red existente, administración manual de la VPN y respaldo manual. No sustituye una plataforma empresarial de alta disponibilidad y deberá crecer conforme se conozcan la concurrencia, el volumen de proyectos y la criticidad real del sistema.
