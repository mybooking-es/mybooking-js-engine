# Mybooking JS Engine

Librería JS del motor de reservas mybooking. Está diseñada para ser utilizada en el
frontend de una página de reservas. 

Permite la creación de motores de reservas para:

- Alquiler de vehículos
- Alquiler de material deportivo (kayak, surf, paddle, ...)
- Actividades o tours.

Funcionalidades:

- Creación de una web de reservas.
- Creación de un calendario de disponibilidad para integrarlo en una página existente.

## Instalar

`$ npm install`

## Configuración

Crear un fichero config/env.json con el siguiente contenido para indicar la conexión
con el API

{
  "baseURL": "http://mbctransfer.test",
  "apiKey": "",
  "port": 8000
}

## Desarrollo

Crear una carpeta config con un archivo env.json con los siguientes atributos

```json
{
  "baseURL": "MY-BOOKING INSTANCE URL",
  "apiKey": "API-KEY",
  "port": 8000
}

```

Ejecutar

`$ npm run start`

Abrir el navegador

http://localhost:8000

## Construir

`$ npm run build`

En la carpeta dist/js se generan dos ficheros:

- mybooking-js-engine.js
- mybooking-js-engine-bundle.js

El **primero** contiene todas las librerías para hacer funcionar el motor de reservas.

El **segundo** está preparado para ser utilizado en plugin de WordPress.

## Usar

### Configuración de la librería motor de reservas

Para configurar la librería del motor de reservas se necesita definir el objeto `mybookingEngine` en el 
contexto window con la información que detallamos a continuación.

Podemos incluirlo antes del final de la etiqueta `</body>` de cada una de las páginas del proceso de reserva o también podemos externalizarlo en un fichero JS, que es lo que recomendamos.

```html
<script type="text/javascript">
    window.mybookingEngine = function(){
      var baseURL = 'BASE-URL';
      var chooseProductUrl = '/choose_product.html';
      var chooseExtrasUrl = '/choose_extras.html';
      var completeUrl = '/complete.html';
      var summaryUrl = '/summary.html';
      function getBaseURL() {
        return baseURL;
      }
      function getChooseProductUrl() {
        return chooseProductUrl;
      }
      function getChooseExtrasUrl() {
        return chooseExtrasUrl;
      }
      function getCompleteUrl() {
        return completeUrl;
      }
      function getSummaryUrl() {
        return summaryUrl;
      }
      return{
        baseURL: getBaseURL,
        chooseProductUrl: getChooseProductUrl,
        chooseExtrasUrl: getChooseExtrasUrl,
        completeUrl: getCompleteUrl,
        summaryUrl: getSummaryUrl
      }
    }();
</script>
<script src="/assets/js/mybooking-js-engine.js"></script>
```

### Creación de las páginas

El proceso de reserva se implementa en 4 páginas html independientes. Se han de crear en el sitio web y
han de seguir las siguientes convenciones:

- Una clase en la etiqueta `body` que permite identificar el paso del proceso en el que estamos.
- Una serie de contenedores que se utilizarán para presentar la información.
- Un conjunto de `micro templates` para personalizar la presentación.

1. Inicio

   ```html
   <body class="index"></body>
   ```

2. Choose product

   ```html
   <body class="choose_product"></body>
   ```

3. Complete

   ```html
   <body class="complete"></body>
   ```

4. Summary

   ```html
   <body class="summary"></body>
   ```
   
