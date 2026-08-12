# Choice Journey Control

Componente PCF universal para transformar un campo Dataverse de tipo Choice u OptionSet en una experiencia visual de recorrido, progreso y selección de estado.

El objetivo del control es ofrecer una forma más clara, accesible y visual de representar opciones de negocio como etapas de un journey, sin depender de nombres de tablas, columnas, valores o reglas específicas de un entorno.

> Importante: este componente representa visualmente el valor actual y su posición dentro de un conjunto de opciones. No representa historial de auditoría, duración de estados ni transiciones reales ejecutadas en Dataverse.

---

## Metadatos

- Documento: `README-PCF-CHOICE-JOURNEY-CONTROL-UNIVERSAL`
- Componente: `Choice Journey Control`
- Versión documentada: `1.0.0`
- Estado: Producción / Documentación técnica
- Namespace: `BizzAppsHub`
- Constructor: `Jonathan Manrique`
- Tipo de control: PCF virtual de campo
- Campo principal recomendado: Choice / OptionSet
- Plataforma objetivo: Power Platform / Dataverse / Model-Driven Apps

---

## Propósito del control

Choice Journey Control permite convertir un campo Choice de Dataverse en una experiencia visual tipo recorrido.

El componente ayuda a que el usuario comprenda rápidamente:

- Qué valor está seleccionado actualmente.
- Qué opciones existen alrededor del valor actual.
- Cómo se ordenan visualmente esas opciones.
- Qué etapas se consideran anteriores, actuales o futuras dentro del journey visual.
- Qué opciones están disponibles, deshabilitadas u ocultas por configuración.

El control está diseñado para ser completamente genérico. No contiene nombres de tablas, nombres de columnas, valores de OptionSet, etiquetas o reglas de negocio codificadas para una solución concreta.

Puede utilizarse en escenarios de estado, prioridad, severidad, fase, clasificación, madurez, progreso funcional o cualquier Choice donde sea útil representar visualmente una secuencia o escala.

---

## Advertencia importante sobre el journey visual

Este componente no representa historial real de Dataverse.

El concepto de etapa completada es únicamente visual y se calcula en función del orden visible de las opciones y del valor actualmente seleccionado.

El control no afirma ni calcula:

- Historial de cambios.
- Duración en cada estado.
- Fecha de transición.
- Auditoría de estados.
- Flujo real de negocio.
- Transiciones permitidas por reglas de negocio.

Si se requiere historial, auditoría o validación avanzada de transiciones, debe implementarse como una extensión independiente mediante Dataverse auditing, plugins, cloud flows, custom APIs o lógica de negocio específica.

---

## Características

- Visualización de opciones Choice como etapas de un recorrido.
- Compatibilidad con cualquier tabla Dataverse y cualquier campo Choice compatible.
- Descubrimiento dinámico de opciones desde los metadatos del campo enlazado.
- Uso del valor numérico de cada opción como identidad estable.
- Uso de etiquetas localizadas proporcionadas por la plataforma.
- Identificación visual de etapas completadas, actuales, futuras, deshabilitadas, ocultas y desconocidas.
- Orientación horizontal, vertical y automática según el ancho disponible.
- Modo compacto para formularios con espacio reducido.
- Desplazamiento horizontal cuando las etapas no caben en el contenedor.
- Uso opcional de colores definidos en los metadatos del Choice.
- Sobrescritura de colores mediante JSON.
- Paleta de respaldo determinista cuando no existan colores configurados.
- Configuración de orden visual mediante JSON.
- Configuración de opciones ocultas sin modificar el Choice de Dataverse.
- Configuración de opciones deshabilitadas sin eliminarlas visualmente.
- Descripciones opcionales por etapa.
- Iconos configurables mediante un catálogo interno seguro.
- Encabezado opcional con título, valor actual y progreso.
- Tooltips opcionales con etiqueta, descripción y estado de etapa.
- Confirmación opcional antes de cambiar el valor seleccionado.
- Limpieza opcional de selección para campos no obligatorios.
- Comportamiento correcto en modo editable, solo lectura, deshabilitado y campos obligatorios.
- Navegación completa mediante teclado.
- Semántica accesible basada en grupo de selección.
- Foco visible y compatible con alto contraste.
- Soporte para temas claro, oscuro y alto contraste.
- Animaciones y microinteracciones compatibles con `prefers-reduced-motion`.
- Validación segura de configuración JSON.
- Sin llamadas externas en tiempo de ejecución.
- Sin dependencias de servicios externos.
- Sin modificación de otros campos del formulario.
- Sin navegación automática ni apertura de registros como efecto de una selección.

---

## Diferencias frente a un selector Choice estándar

Un campo Choice estándar permite seleccionar un valor, pero no comunica claramente progresión, contexto ni posición dentro de un recorrido.

Choice Journey Control mejora esa experiencia porque:

- Convierte cada opción en una etapa visual.
- Permite entender el valor actual en menos de un segundo.
- Muestra avance visual basado en el orden visible de las opciones.
- Diferencia estados anteriores, actuales y futuros.
- Permite enriquecer cada etapa con color, icono y descripción.
- Mantiene accesibilidad mediante teclado y lector de pantalla.
- Conserva el comportamiento nativo del campo Dataverse enlazado.
- Respeta seguridad, obligatoriedad y modo solo lectura.
- Evita hardcoding de entidades, campos o valores de negocio.

---

## Tecnologías utilizadas

- Power Platform
- Dataverse
- Power Apps Component Framework
- TypeScript
- React
- Fluent UI
- CSS Tokens
- RESX Resources
- Jest
- Testing Library
- Power Platform CLI

---

## Requisitos

- Power Platform CLI.
- Node.js.
- Visual Studio Code.
- Entorno de Dataverse.
- Tabla con columna Choice u OptionSet.
- Permisos de lectura y edición sobre el campo configurado.
- Solución de Power Platform para empaquetado y despliegue.
- Model-Driven App donde configurar el control.

---

## Configuración del componente

- Namespace: `BizzAppsHub`
- Constructor: `Jonathan Manrique`
- Tipo de control: PCF virtual de campo
- Campo principal recomendado: Choice / OptionSet
- Uso recomendado: Model-Driven Apps
- Nombre recomendado de carpeta: `ChoiceJourneyControl`
- Propiedad principal: `selectedChoice`

---

## Alcance incluido

Incluye:

- PCF virtual de tipo campo para Choice u OptionSet.
- Compatibilidad con cualquier tabla Dataverse.
- Descubrimiento dinámico de opciones y etiquetas.
- Selección y actualización del valor enlazado.
- Visualización horizontal, vertical y compacta.
- Estados completado, actual, futuro, deshabilitado y no disponible.
- Colores desde metadatos, configuración JSON o paleta de respaldo.
- Iconos configurables mediante identificadores seguros.
- Descripciones opcionales por etapa.
- Diseño responsive para formularios de Model-Driven Apps.
- Temas claro, oscuro y alto contraste.
- Navegación completa mediante teclado.
- Transiciones y microinteracciones respetando `prefers-reduced-motion`.
- Soporte correcto de campos obligatorios, opcionales y de solo lectura.
- Pruebas unitarias y documentación técnica.

---

## Fuera de alcance

No incluye:

- Persistencia de historial de cambios de estado.
- Lectura automática de Audit History.
- Ejecución de workflows, cloud flows o Custom APIs.
- Validación de transiciones mediante reglas específicas de una tabla.
- Cambio de otros campos del formulario.
- Modificación de metadatos de Choices.
- Dependencias de servicios externos.
- Llamadas Web API para obtener las opciones del campo principal.

Estas capacidades pueden abordarse posteriormente como extensiones independientes, pero no forman parte de la primera versión.

---

## Arquitectura y flujo de datos

```text
Dataverse Choice / OptionSet Field
                |
                v
      PCF Field Lifecycle Adapter
                |
                |-- Bound value
                |-- Field metadata
                |-- Security state
                |-- Control configuration
                |
                v
        Choice Metadata Adapter
                |
                |-- Option values
                |-- Localised labels
                |-- Metadata colours
                |-- JSON configuration
                |-- Fallback palette
                |
                v
          Journey State Engine
                |
                |-- Completed stages
                |-- Current stage
                |-- Future stages
                |-- Disabled stages
                |-- Read-only presentation
                |
                v
        Choice Journey Experience
                |
                |-- Journey header
                |-- Progress connector
                |-- Stage nodes
                |-- Stage details
                |-- Selection feedback
                |-- Accessible interaction
```

---

## Principios de diseño

1. **Universalidad:** ninguna entidad o valor Choice debe estar codificado en el control.
2. **Claridad:** el estado actual debe entenderse en menos de un segundo.
3. **Progresión visual:** el journey debe transmitir orden y avance sin afirmar que existe un proceso de negocio cuando solo existe un Choice.
4. **Accesibilidad:** toda la experiencia debe poder utilizarse sin ratón y sin depender exclusivamente del color.
5. **Configuración segura:** las personalizaciones JSON deben validarse y degradar de forma controlada.
6. **Rendimiento:** la selección debe sentirse inmediata y no provocar renderizados innecesarios.
7. **Calidad premium:** el acabado debe ser comparable a experiencias modernas de Microsoft, Linear y Azure DevOps, sin copiar identidades visuales externas.
8. **Compatibilidad con plataforma:** debe respetar el ciclo de vida PCF, el estado del campo y la seguridad de Dataverse.

---

## Propiedades configurables

| Propiedad | Tipo | Descripción |
| --- | --- | --- |
| `selectedChoice` | OptionSet, bound | Valor Choice enlazado al control. |
| `title` | SingleLine.Text | Título opcional del journey. |
| `orientation` | Enum/String | Define `auto`, `horizontal` o `vertical`. |
| `compactMode` | TwoOptions | Reduce espaciados, nodos y descripciones. |
| `showHeader` | TwoOptions | Muestra u oculta el encabezado. |
| `showDescriptions` | TwoOptions | Muestra descripciones breves por etapa. |
| `showIcons` | TwoOptions | Muestra iconos visuales por etapa. |
| `showProgress` | TwoOptions | Muestra barra o indicador de progreso. |
| `showTooltips` | TwoOptions | Activa tooltips accesibles. |
| `useChoiceColors` | TwoOptions | Prioriza colores definidos en los metadatos del Choice. |
| `colorMappingJson` | Multiple | Permite mapear colores personalizados por valor o etiqueta. |
| `journeyConfigJson` | Multiple | Permite configurar orden, visibilidad, estado, descripción e icono por opción. |
| `fallbackPalette` | SingleLine.Text | Paleta de respaldo: `Blue`, `Green`, `Purple`, `Amber` o `Neutral`. |
| `allowClear` | TwoOptions | Permite limpiar la selección cuando el campo no es obligatorio. |
| `requireConfirmation` | TwoOptions | Solicita confirmación antes de aplicar un cambio. |
| `showOnlySelectedWhenReadOnly` | TwoOptions | En solo lectura, muestra únicamente la etapa seleccionada. |
| `enableAnimations` | TwoOptions | Activa animaciones cuando el usuario no solicita movimiento reducido. |
| `selectionStyle` | SingleLine.Text | Define el estilo visual: `filled`, `outlined` o `glow`. |
| `connectorStyle` | SingleLine.Text | Define el conector: `solid`, `gradient` o `subtle`. |
| `locale` | SingleLine.Text | Cultura opcional para textos internos. |
| `debugMode` | TwoOptions | Habilita diagnósticos seguros para desarrollo. |

---

## Estructura del proyecto

```text
ChoiceJourneyControl/
|
|-- index.ts
|-- ControlManifest.Input.xml
|
|-- components/
|   |-- ChoiceJourney.tsx
|   |-- JourneyHeader.tsx
|   |-- JourneyTrack.tsx
|   |-- JourneyStage.tsx
|   |-- StageNode.tsx
|   |-- StageContent.tsx
|   |-- JourneyProgress.tsx
|   |-- TransitionConfirmation.tsx
|   |-- ClearSelectionAction.tsx
|   |-- ConfigurationState.tsx
|   |-- EmptyState.tsx
|   |-- ErrorBoundary.tsx
|
|-- hooks/
|   |-- useChoiceMetadata.ts
|   |-- useJourneyModel.ts
|   |-- useRovingTabIndex.ts
|   |-- useResponsiveOrientation.ts
|
|-- services/
|   |-- choiceMetadataAdapter.ts
|   |-- journeyConfigService.ts
|   |-- colorResolver.ts
|
|-- utils/
|   |-- journeyEngine.ts
|   |-- keyboardUtils.ts
|   |-- accessibilityUtils.ts
|   |-- colorUtils.ts
|   |-- validationUtils.ts
|
|-- models/
|   |-- ChoiceOptionModel.ts
|   |-- JourneyConfig.ts
|   |-- JourneyStageModel.ts
|   |-- ChoiceJourneyProps.ts
|
|-- icons/
|   |-- iconRegistry.tsx
|
|-- css/
|   |-- ChoiceJourneyControl.css
|
|-- strings/
|   |-- ChoiceJourneyControl.1033.resx
|   |-- ChoiceJourneyControl.3082.resx
|
|-- tests/
|   |-- choiceMetadataAdapter.test.ts
|   |-- journeyConfigService.test.ts
|   |-- journeyEngine.test.ts
|   |-- colorResolver.test.ts
|   |-- keyboardUtils.test.ts
|   |-- ChoiceJourney.test.tsx
|
|-- README.md
```

---

## Instalación

1. Clona el repositorio.

```bash
git clone https://github.com/jmanriquerios1/power-platform-resources.git
```

2. Accede a la carpeta del componente.

```bash
cd power-platform-resources/pcf/ChoiceJourneyControl
```

3. Instala las dependencias.

```bash
npm install
```

4. Compila el componente.

```bash
npm run build
```

5. Ejecuta validaciones de calidad.

```bash
npm run lint
npm test
```

6. Despliega el componente en Dataverse usando Power Platform CLI.

```bash
pac pcf push
```

También puedes incluir el componente dentro de una solución y desplegarlo mediante un paquete administrado o no administrado.

---

## Uso en Model-Driven Apps

1. Abre la tabla donde existe el campo Choice.
2. Accede al formulario principal.
3. Selecciona la columna Choice que deseas mejorar visualmente.
4. Agrega el componente `Choice Journey Control`.
5. Enlaza la propiedad principal `selectedChoice` con el campo Choice.
6. Configura orientación, colores, encabezado, progreso y comportamiento visual.
7. Publica el formulario.
8. Valida el comportamiento en modo edición, solo lectura y campo obligatorio.

---

## Configuración básica recomendada

- `selectedChoice`: campo Choice enlazado.
- `orientation`: `auto`.
- `compactMode`: `false`.
- `showHeader`: `true`.
- `showDescriptions`: `true`.
- `showIcons`: `true`.
- `showProgress`: `true`.
- `showTooltips`: `true`.
- `useChoiceColors`: `true`.
- `fallbackPalette`: `Blue`.
- `allowClear`: según obligatoriedad del campo.
- `requireConfirmation`: `false` para selección directa, `true` cuando el cambio requiera revisión.
- `selectionStyle`: `filled`.
- `connectorStyle`: `gradient`.
- `enableAnimations`: `true`.
- `debugMode`: `false`.

---

## Ejemplo de `journeyConfigJson`

La propiedad `journeyConfigJson` permite personalizar el recorrido sin modificar los metadatos del Choice en Dataverse.

Permite configurar:

- Orden visual de las opciones.
- Descripción por etapa.
- Icono por etapa.
- Color por etapa.
- Opciones ocultas.
- Opciones deshabilitadas.

```json
{
  "options": {
    "100000000": {
      "order": 1,
      "description": "Initial stage",
      "icon": "spark",
      "color": "#2563EB",
      "hidden": false,
      "disabled": false
    },
    "100000001": {
      "order": 2,
      "description": "Work in progress",
      "icon": "progress",
      "color": "#7C3AED",
      "hidden": false,
      "disabled": false
    },
    "100000002": {
      "order": 3,
      "description": "Completed stage",
      "icon": "check",
      "color": "#16A34A",
      "hidden": false,
      "disabled": false
    }
  }
}
```

---

## Reglas de `journeyConfigJson`

- Las claves deben coincidir preferiblemente con el valor numérico del OptionSet serializado como texto.
- Como alternativa, `colorMappingJson` puede resolver colores por etiqueta localizada.
- Los valores desconocidos se ignoran sin romper el renderizado.
- Los iconos se resuelven únicamente contra un catálogo interno permitido.
- No se acepta HTML, JavaScript ni SVG arbitrario desde la configuración.
- Los colores deben ser valores hexadecimales válidos.
- Las opciones ocultas no se renderizan ni participan en el cálculo de progreso.
- Las opciones deshabilitadas se muestran, pero no pueden seleccionarse.
- Los órdenes duplicados se resuelven de forma estable usando el orden original de los metadatos.
- Una configuración inválida muestra un aviso y utiliza valores de respaldo seguros.
- El JSON no puede alterar nombres de propiedades, ejecutar código ni acceder al DOM.

---

## Ejemplo de `colorMappingJson` por valor

```json
{
  "100000000": "#2563EB",
  "100000001": "#F59E0B",
  "100000002": "#16A34A"
}
```

---

## Ejemplo de `colorMappingJson` por etiqueta

```json
{
  "New": "#2563EB",
  "In Progress": "#F59E0B",
  "Completed": "#16A34A"
}
```

---

## Prioridad de resolución de colores

El control resuelve colores en el siguiente orden:

1. Color definido en `journeyConfigJson`.
2. Color definido en `colorMappingJson`.
3. Color de metadatos del Choice, si `useChoiceColors` está activo.
4. Paleta de respaldo configurada en `fallbackPalette`.
5. Paleta neutral por defecto.

Todos los colores se validan antes de aplicarse. Si un color no es válido, se ignora y se utiliza el siguiente valor disponible en la cadena de resolución.

---

## Estados visuales de las etapas

| Estado | Comportamiento visual |
| --- | --- |
| Completed | Nodo sólido, conector previo completado e indicador no dependiente solo del color. |
| Current | Nodo destacado, etiqueta enfatizada y anillo de selección. |
| Future | Nodo neutral, conector pendiente y contraste reducido pero legible. |
| Disabled | Apariencia atenuada, icono de bloqueo opcional y ausencia de interacción. |
| Hidden | No se renderiza y no ocupa espacio. |
| Unknown | Estado informativo cuando el valor enlazado no coincide con opciones disponibles. |
| Read-only | Mantiene claridad visual sin cursor ni affordance de edición. |
| Pending | Feedback temporal entre selección y reconciliación con el valor de plataforma. |
| Focused | Anillo de foco de alto contraste y posición activa para teclado. |
| Hovered | Elevación y realce sutil sin desplazar el layout. |

---

## Reglas del motor de journey

- Las etapas visibles se ordenan por `order` configurado y después por orden de metadatos.
- La posición actual se calcula buscando el valor enlazado dentro de las etapas visibles.
- Las etapas anteriores a la actual se marcan como completadas visualmente.
- La etapa actual no se marca simultáneamente como completada.
- Las etapas posteriores se marcan como futuras.
- Las opciones ocultas se excluyen del cálculo de progreso.
- Las opciones deshabilitadas conservan su posición en el journey.
- Si el valor actual corresponde a una opción oculta, se muestra un estado informativo y no se falsifica una etapa actual diferente.
- El porcentaje de progreso se calcula como `currentVisibleIndex / (visibleCount - 1)` cuando existan al menos dos etapas.
- Con una sola etapa visible, el progreso es 100% si está seleccionada y 0% si no lo está.
- El motor no infiere transiciones permitidas si no están configuradas.
- La versión 1 no afirma duración, historial ni fecha de transición.

---

## Comportamiento de campos obligatorios y opcionales

### Campo obligatorio

- No permite limpiar la selección.
- Mantiene siempre un valor válido cuando la plataforma lo requiere.
- Respeta la obligatoriedad definida en Dataverse.
- Ignora `allowClear` cuando la columna es obligatoria.

### Campo opcional

- Puede permitir limpiar la selección si `allowClear` está habilitado.
- La limpieza invoca `notifyOutputChanged`.
- `getOutputs` devuelve el nuevo valor pendiente.
- La limpieza no actualiza otros campos del formulario.

---

## Comportamiento editable, deshabilitado y solo lectura

### Editable

- Permite seleccionar una nueva etapa.
- Muestra feedback visual inmediato.
- Invoca `notifyOutputChanged` al cambiar el valor.
- Mantiene el valor pendiente hasta que Dataverse reconcilia la actualización.
- Actualiza únicamente el campo Choice enlazado.

### Deshabilitado

- No permite interacción mediante ratón.
- No permite selección mediante teclado.
- Mantiene presentación visual clara del estado actual.
- Respeta `context.mode.isControlDisabled`.

### Solo lectura

- No permite cambiar el valor.
- Puede mostrar todo el journey o únicamente la etapa seleccionada.
- No muestra affordance de edición.
- Respeta la seguridad real del campo en Dataverse.

---

## Confirmación de cambio

Cuando `requireConfirmation` está activo, el control solicita confirmación antes de aplicar una nueva selección.

El diálogo debe mostrar:

- Valor actual.
- Valor de destino.
- Acción Confirmar.
- Acción Cancelar.

Cancelar no modifica el valor enlazado. Confirmar actualiza únicamente el campo Choice configurado.

La confirmación no debe afirmar que ejecutará automatizaciones externas.

---

## Navegación mediante teclado

El componente implementa navegación accesible mediante patrón de selección.

| Tecla | Acción |
| --- | --- |
| `ArrowRight` | Mueve el foco a la siguiente etapa habilitada. |
| `ArrowDown` | Mueve el foco a la siguiente etapa habilitada. |
| `ArrowLeft` | Mueve el foco a la etapa habilitada anterior. |
| `ArrowUp` | Mueve el foco a la etapa habilitada anterior. |
| `Home` | Mueve el foco a la primera etapa habilitada. |
| `End` | Mueve el foco a la última etapa habilitada. |
| `Enter` | Selecciona la etapa enfocada. |
| `Space` | Selecciona la etapa enfocada. |
| `Escape` | Cierra confirmaciones, tooltips persistentes o paneles auxiliares. |

---

## Accesibilidad

El control está diseñado para ser utilizado sin depender exclusivamente del ratón ni del color.

Incluye:

- Semántica accesible equivalente a grupo de selección.
- Etapas seleccionables con comportamiento equivalente a radio.
- Uso de `aria-checked` para comunicar el valor actual.
- Uso de `aria-disabled` en etapas no seleccionables.
- Patrón roving tabindex.
- Un único punto de tabulación activo.
- Foco visible en tema claro, oscuro y alto contraste.
- Contraste compatible con WCAG AA.
- Contraste mínimo de componentes visuales de al menos 3:1.
- Indicadores visuales complementarios al color.
- Mensajes de error y confirmación mediante regiones live.
- Soporte de `prefers-reduced-motion`.
- Tooltips no indispensables para la comprensión del estado.
- Navegación completa sin ratón.

---

## Estados del sistema

| Estado | Descripción |
| --- | --- |
| Inicializando control | El componente está preparando datos, metadatos y configuración. |
| Opciones disponibles y valor válido | El control puede representar el valor actual correctamente. |
| Campo sin selección | No existe valor seleccionado actualmente. |
| Campo en modo de solo lectura | El campo no permite cambios. |
| Campo deshabilitado por el formulario | El formulario deshabilitó la interacción. |
| Campo no editable por seguridad | La seguridad de Dataverse no permite edición. |
| Sin opciones disponibles en metadatos | El Choice no expone opciones válidas. |
| Valor enlazado desconocido | El valor actual no coincide con las opciones disponibles. |
| Configuración JSON inválida | La configuración no puede aplicarse completamente. |
| Selección pendiente de reconciliación | El usuario seleccionó un valor y se espera confirmación de plataforma. |
| Confirmación de cambio abierta | Existe un diálogo o callout de confirmación activo. |
| Sin etapas visibles | Todas las opciones quedaron ocultas por configuración. |
| Error inesperado de renderizado | El error boundary debe mostrar un mensaje seguro. |
| Vista previa no disponible en diseñador | Contexto limitado del diseñador o harness. |

---

## Diseño visual

El control debe sentirse como un componente de proceso nativo de nivel enterprise, no como una sucesión de botones coloreados.

Principios visuales:

- Contenedor al 100% del ancho disponible.
- Uso de `box-sizing: border-box`.
- Padding base de `16px`.
- Superficie opcional con `border-radius: 12px`.
- Uso de tokens del tema, sin colores fijos dispersos.
- Altura estable y predecible en cada orientación.
- Tipografía basada en `'Segoe UI', system-ui, -apple-system, sans-serif`.
- Sin destello de contenido sin estilo.
- Nodos con área interactiva mínima de `40 x 40px`.
- Indicador visual base de `28 x 28px` en modo normal.
- Indicador visual base de `24 x 24px` en modo compacto.
- Nodo actual destacado sin desplazar otros elementos.
- Conectores visuales detrás de los nodos.
- Animaciones controladas mediante `transform` y `opacity`.
- Scroll horizontal cuando no haya espacio suficiente.
- Etiquetas legibles, sin rotación.
- Descripciones opcionales con máximo dos líneas en modo horizontal.
- Transiciones desactivadas cuando el usuario solicita movimiento reducido.
- Integración visual consistente con formularios estándar de Dynamics 365.

---

## Contenedor general

- El componente debe ocupar el 100% del ancho disponible.
- Debe utilizar `box-sizing: border-box`.
- El contenedor principal debe emplear padding configurable con base de `16px`.
- Debe utilizar `border-radius: 12px` para la superficie principal cuando se active `showSurface`.
- La superficie debe utilizar tokens del tema.
- El componente no debe provocar salto de layout durante la selección.
- La altura debe ser estable y predecible en cada orientación.
- La tipografía debe usar `'Segoe UI', system-ui, -apple-system, sans-serif`.
- El control debe evitar cualquier destello de contenido sin estilo.

---

## Encabezado premium

- El encabezado debe incluir título, valor actual y progreso opcional.
- El título debe usar `font-size: 14px` y `font-weight: 600`.
- El valor actual debe mostrarse con una pill discreta asociada al color de la etapa.
- El progreso textual debe mostrarse como `Etapa X de Y`, localizado mediante RESX.
- La barra de progreso debe tener altura de `4px`, radio completo y relleno animado.
- El encabezado debe adaptarse a dos líneas sin solapamientos en anchuras reducidas.

---

## Nodo de etapa

- Cada nodo debe tener un área interactiva mínima de `40 x 40px`.
- El indicador visual base debe medir `28 x 28px` en modo normal y `24 x 24px` en compacto.
- El nodo actual debe escalar a `32 x 32px` sin desplazar otros elementos.
- Los nodos deben usar borde de `2px` y transición controlada de color, sombra y escala.
- Las etapas completadas deben mostrar un check SVG interno.
- La etapa actual debe mostrar icono configurado o un punto central de alto contraste.
- Las etapas futuras deben mantener apariencia neutral y legible.
- Las etapas deshabilitadas deben mostrar un icono de bloqueo cuando `showIcons` esté activo.
- El hover debe aplicar `transform: translateY(-2px) scale(1.04)` en orientación horizontal.
- El hover vertical debe aplicar `transform: translateX(2px) scale(1.02)`.
- La selección debe generar un anillo doble basado en el acento de la etapa.
- El foco de teclado debe diferenciarse claramente del estado seleccionado.

---

## Conectores y progreso

- Los nodos deben conectarse mediante una línea continua centrada.
- El conector debe quedar detrás de los nodos usando una capa visual inferior.
- La parte completada debe utilizar el acento activo o un gradiente entre etapas.
- La parte futura debe utilizar el token de borde neutral.
- El grosor base debe ser `3px` y `2px` en modo compacto.
- El avance del conector debe animarse de la etapa anterior a la nueva en `320ms`.
- La animación debe originarse desde la posición actual y no desde el inicio completo del journey.
- Con `prefers-reduced-motion`, el conector debe cambiar instantáneamente.
- El conector no debe atravesar etiquetas ni áreas interactivas.

---

## Etiquetas y descripciones

- La etiqueta de etapa debe usar `font-size: 12px` y `font-weight: 600`.
- La etapa actual debe usar `font-weight: 700`.
- La descripción debe usar `font-size: 11px`, color secundario y máximo dos líneas.
- Los textos largos deben truncarse con ellipsis y exponer el valor completo mediante tooltip.
- Las etiquetas no deben rotarse.
- En modo compacto pueden ocultarse descripciones, pero no etiquetas.
- En anchuras extremas debe activarse desplazamiento, no superposición de textos.

---

## Orientación horizontal

- El journey horizontal debe distribuir etapas en columnas equivalentes cuando exista espacio.
- La dirección temporal debe fluir de izquierda a derecha en idiomas LTR.
- Debe soportar dirección RTL sin romper conectores ni navegación.
- Cuando no quepan todas las etapas debe habilitar desplazamiento horizontal suave.
- Debe desplazar automáticamente la etapa seleccionada al área visible.
- Las barras de desplazamiento deben ser discretas y visibles al interactuar.

---

## Orientación vertical

- El journey vertical debe alinear nodos en una columna y contenido en una segunda columna.
- La línea debe extenderse verticalmente entre centros de nodos.
- Cada etapa debe disponer de altura mínima de `56px`.
- Las descripciones deben poder mostrarse sin limitarse a una sola línea.
- La orientación vertical debe ser la alternativa preferida en contenedores menores a `480px` cuando `orientation=auto`.

---

## Confirmación de transición

- La confirmación debe aparecer como callout o diálogo ligero anclado a la etapa de destino.
- Debe mostrar claramente etiqueta actual, etiqueta de destino y acciones Confirmar y Cancelar.
- Confirmar debe utilizar estilo principal y Cancelar estilo secundario.
- El foco debe quedar contenido dentro del diálogo mientras esté abierto.
- Al cerrar, el foco debe regresar a la etapa que originó la acción.
- El diálogo debe cerrarse con Escape.
- La confirmación no debe afirmar que ejecutará automatizaciones externas.

---

## Estados de interacción y transición

- El montaje inicial debe utilizar `fadeIn` y `translateY(4px -> 0)` durante `240ms`.
- La etapa seleccionada debe ejecutar una transición de escala breve de `180ms`.
- El check de etapa completada debe aparecer mediante trazo progresivo o crossfade.
- El conector completado debe avanzar visualmente hacia el destino.
- La etiqueta actual debe realizar crossfade sin saltos de ancho.
- Las transiciones deben utilizar preferentemente `transform` y `opacity`.
- No deben animarse propiedades que provoquen reflow continuo.
- No debe utilizarse movimiento elástico, rebotes excesivos ni animaciones decorativas persistentes.
- Todas las animaciones deben quedar desactivadas en movimiento reducido.

---

## Tema claro

- Fondo primario basado en `#ffffff`.
- Superficie secundaria basada en `#f6f8fa`.
- Borde base basado en `#d0d7de`.
- Texto primario basado en `#1f2328`.
- Texto secundario basado en `#656d76`.
- Sombras suaves, con opacidad máxima recomendada de `0.14`.
- Los nodos futuros deben mantener contraste suficiente sobre fondo blanco.

---

## Tema oscuro

- Fondo principal basado en `#0d1117`.
- Superficie secundaria basada en `#161b22`.
- Borde base basado en `#30363d`.
- Texto primario basado en `#e6edf3`.
- Texto secundario basado en `#8b949e`.
- Sombras mínimas usando negro con transparencia.
- Los colores configurados deben ajustarse cuando sea necesario para mantener contraste.

---

## Modo compacto

- Debe reducir padding, tamaño de nodo, separación y descripción sin eliminar la etiqueta.
- La altura mínima del control compacto no debe superar innecesariamente la altura de una sección estándar.
- El modo compacto debe conservar selección, foco, tooltip y confirmación.
- En horizontal compacto, las etiquetas pueden limitarse a una línea.

---

## Tokens CSS

```css
/* Superficies */
--cjc-bg-primary
--cjc-bg-secondary
--cjc-bg-hover
--cjc-bg-selected

/* Texto */
--cjc-text-primary
--cjc-text-secondary
--cjc-text-tertiary
--cjc-text-on-accent

/* Bordes y foco */
--cjc-border-default
--cjc-border-strong
--cjc-focus-ring

/* Journey */
--cjc-stage-accent
--cjc-stage-accent-subtle
--cjc-stage-completed
--cjc-stage-current
--cjc-stage-future
--cjc-stage-disabled
--cjc-connector-completed
--cjc-connector-future

/* Semánticos */
--cjc-success
--cjc-warning
--cjc-danger
--cjc-neutral

/* Dimensiones */
--cjc-node-size
--cjc-node-size-current
--cjc-connector-size
--cjc-stage-gap
--cjc-radius-sm
--cjc-radius-md
--cjc-radius-lg

/* Tipografía */
--cjc-font-family
--cjc-font-size-xs
--cjc-font-size-sm
--cjc-font-size-md
--cjc-font-size-lg

/* Movimiento */
--cjc-motion-fast
--cjc-motion-normal
--cjc-motion-slow
--cjc-motion-easing
```

---

## Calidad visual premium

- No deben utilizarse emojis en cadenas visibles.
- Los iconos deben ser SVG internos o componentes Fluent UI autorizados.
- Ningún icono debe cargarse desde una URL externa.
- El control debe mantener consistencia visual entre harness y Model-Driven App.
- La selección no debe modificar la altura ni anchura total del journey.
- Las etiquetas no deben vibrar o recolocarse durante una transición.
- El acabado debe superar claramente el patrón de tiles básicos del control anterior.
- El diseño debe seguir siendo legible con dos, cinco, diez o más opciones.
- Con muchas opciones, debe priorizar navegación y legibilidad sobre intentar encajar todo sin scroll.
- El control debe verse integrado en formularios estándar de Dynamics 365.
- No debe introducir bordes, gradientes o sombras decorativas que compitan con el contenido.
- Cada microinteracción debe reforzar selección, progreso, foco o feedback.

---

## Localización

El componente utiliza archivos RESX para cadenas internas.

Archivos incluidos:

```text
strings/
|-- ChoiceJourneyControl.1033.resx
|-- ChoiceJourneyControl.3082.resx
```

Textos localizables recomendados:

- Etapa actual.
- Etapa completada.
- Etapa futura.
- Etapa deshabilitada.
- Sin opciones disponibles.
- Valor desconocido.
- Configuración inválida.
- Confirmar cambio.
- Cancelar.
- Limpiar selección.
- Etapa X de Y.

---

## Rendimiento

- La extracción y normalización de opciones debe ejecutarse solo cuando cambien los metadatos relevantes.
- El parseo JSON debe memorizarse según el valor raw de la propiedad.
- El modelo visual del journey debe calcularse en una sola pasada después del ordenamiento.
- Las etapas deben utilizar claves React basadas en el valor numérico.
- Los manejadores no deben recrearse innecesariamente.
- La interacción de selección debe dar feedback en el mismo ciclo de renderizado local.
- El control debe evitar mediciones DOM repetidas.
- El resize debe procesarse mediante el tamaño asignado por PCF y no mediante listeners globales redundantes.
- El número de componentes y wrappers debe mantenerse razonable para Choices extensos.
- Las animaciones únicamente deben utilizar propiedades aceleradas cuando sea posible.

---

## Seguridad y robustez

- No debe habilitarse `external-service-usage`.
- No debe ejecutarse contenido procedente de propiedades JSON.
- No debe aceptarse SVG arbitrario desde configuración.
- No debe usar `dangerouslySetInnerHTML`.
- Los textos de etiquetas y descripciones deben renderizarse como texto.
- Los logs no deben incluir datos sensibles del registro.
- El control debe respetar el estado de seguridad editable del campo.
- Un estado visual de habilitado no debe sobreponerse a la seguridad real de Dataverse.
- Los errores de configuración deben degradar a valores seguros.
- El artefacto de producción no debe utilizar `eval`.
- No debe cargar CDNs.
- No debe cargar imágenes externas.
- No debe exponer stack traces al usuario final.

---

## Comandos útiles

Instalar dependencias:

```bash
npm install
```

Compilar:

```bash
npm run build
```

Ejecutar lint:

```bash
npm run lint
```

Ejecutar pruebas:

```bash
npm test
```

Validar build de producción:

```bash
npm run build -- --buildMode production
```

Desplegar con Power Platform CLI:

```bash
pac pcf push
```

---

## Ejemplos de uso

### Estado de solicitud

Puede utilizarse para representar estados como:

- New
- In Review
- In Progress
- Completed
- Cancelled

### Prioridad

Puede representar una clasificación visual como:

- Low
- Normal
- High
- Critical

En este escenario, el journey no implica progreso temporal, sino una escala ordenada de clasificación.

### Fase de proyecto

Puede utilizarse para fases como:

- Discovery
- Design
- Build
- Test
- Release

### Severidad

Puede representar niveles como:

- Informational
- Minor
- Major
- Critical

### Clasificación

Puede utilizarse para clasificaciones genéricas como:

- Draft
- Internal
- Reviewed
- Approved
- Archived

---

## Capturas

```text
assets/ChoiceJourneyControlLight.png
assets/ChoiceJourneyControlDark.png
assets/ChoiceJourneyControlCompact.png
assets/ChoiceJourneyControlVertical.png
assets/ChoiceJourneyControlReadOnly.png
assets/ChoiceJourneyControl.gif
```

---

## Descarga

Descarga la última versión desde GitHub Releases.

---

## Solution

https://github.com/jmanriquerios1/power-platform-resources/releases/tag/pcf-choice-journey-control-v1.0.0

---

## Limitaciones

- No guarda historial de cambios de estado.
- No consulta Audit History de Dataverse.
- No ejecuta workflows, cloud flows ni Custom APIs.
- No valida transiciones específicas de negocio.
- No modifica otros campos del formulario.
- No modifica metadatos del Choice.
- No realiza llamadas Web API para obtener las opciones del campo principal.
- No usa servicios externos ni recursos remotos.
- El progreso visual se basa en el orden visible de las opciones, no en auditoría ni fechas reales.
- La configuración incorrecta de nombres, valores o JSON puede afectar la visualización, pero no debe romper el control.
- El rendimiento puede variar con Choices muy extensos si se muestran descripciones, iconos y tooltips para muchas opciones.
- El control no debe afirmar duración, historial ni fecha de transición.

---

## Solución de problemas

### El control no muestra opciones

Verifica que:

- La propiedad `selectedChoice` esté enlazada a una columna Choice válida.
- El campo tenga opciones definidas en Dataverse.
- El formulario esté publicado.
- El usuario tenga permisos para leer el campo.
- La configuración JSON no esté ocultando todas las opciones.

### El valor actual aparece como desconocido

Puede ocurrir cuando:

- El valor almacenado ya no existe en los metadatos del Choice.
- La opción fue ocultada mediante `journeyConfigJson`.
- Existe una configuración JSON incorrecta.
- El formulario tiene datos antiguos o no sincronizados.

### Los colores no se aplican

Verifica que:

- `useChoiceColors` esté habilitado si quieres usar colores de metadatos.
- `colorMappingJson` tenga formato JSON válido.
- Los colores estén en formato hexadecimal válido.
- El valor configurado coincida con el valor numérico o etiqueta esperada.
- El color no haya sido rechazado por validación.

### Una opción no se puede seleccionar

Puede ocurrir cuando:

- La opción está marcada como `disabled`.
- El campo está en modo solo lectura.
- El formulario deshabilitó el control.
- La seguridad de Dataverse no permite editar el campo.
- El control está esperando confirmación de cambio.

### El control no permite limpiar el valor

Verifica que:

- `allowClear` esté habilitado.
- El campo no sea obligatorio.
- El formulario permita editar el campo.
- La seguridad permita actualización.

### Las animaciones no aparecen

Puede ocurrir cuando:

- `enableAnimations` está deshabilitado.
- El sistema operativo tiene activado movimiento reducido.
- El navegador aplica preferencias de accesibilidad.
- El control se renderiza en un contexto de diseñador limitado.

### El JSON genera advertencia de configuración

Verifica que:

- El JSON sea válido.
- Las claves coincidan con valores numéricos serializados del Choice.
- Los colores estén en formato hexadecimal.
- Los iconos existan en el catálogo interno permitido.
- No se esté intentando usar HTML, SVG arbitrario o JavaScript.

---

## Licencia

MIT License.

---

## Autor

Jonathan Manrique
