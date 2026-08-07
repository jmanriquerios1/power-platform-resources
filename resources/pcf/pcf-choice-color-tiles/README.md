# Choice Color Tiles

Componente PCF genérico para representar opciones mediante tarjetas de color, sin dependencias de nombres de campos o esquemas de entorno.

## Características

- Visualización de opciones con indicadores de color.
- Configuración por tipos de campo (Opción, Texto, Número).
- Experiencia de selección más clara para usuarios finales.

## Tecnologías utilizadas

- Power Platform
- Dataverse
- TypeScript
- React
- Fluent UI

## Requisitos

- Power Platform CLI
- Node.js
- Visual Studio Code
- Entorno de Dataverse

## Configuración del componente

- Namespace: `BizzAppsHub`
- Constructor: `Jonathan Manrique`
- Tipos de campo recomendados:
  - Campo principal: Opción (Choice)
  - Etiqueta auxiliar: Texto
  - Orden visual: Número

## Instalación

1. Clona el repositorio.
2. Accede a la carpeta del componente.
3. Instala dependencias con `npm install`.
4. Compila con `npm run build`.
5. Despliega en Dataverse con Power Platform CLI (`pac pcf push`) o mediante solución.

## Uso

1. Asocia el componente a una columna de tipo Opción.
2. Configura estilo y parámetros del control.
3. Publica cambios y valida la experiencia de selección.
4. Ajusta colores y orden visual según necesidad funcional.

## Capturas

![Vista previa](assets/ChoiceColorTilesControlImagen1.png)
![Vista previa](assets/ChoiceColorTilesControlImagen2.png)
![Vista previa](assets/ChoiceColorTilesControl.gif)

## Descarga

Descarga la última versión desde GitHub Releases.

## Limitaciones

- Requiere que los valores de opción estén correctamente definidos.
- La accesibilidad visual depende del contraste configurado.

## Licencia

MIT License.

## Autor

Jonathan Manrique
