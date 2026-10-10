---
source: b6adcdeabaad
---

Un proyecto público es accesible en una dirección que tú eliges. Cada espacio de trabajo puede reclamar una dirección propia, y un proyecto puede responder además en un dominio que ya tengas.

## Tu dirección de Motir {#your-motir-address}

Un espacio de trabajo reclama un único subdominio, y todos los proyectos públicos que contiene responden por debajo de él: así, `acme` te da `acme.motir.site/ROADMAP` para un proyecto con la clave `ROADMAP`. Lo reclama un propietario o administrador del espacio de trabajo, en la configuración del proyecto, en _Dirección pública_.

Una etiqueta son letras minúsculas, dígitos y guiones, de tres a sesenta y tres caracteres. Se reserva un pequeño conjunto de nombres para los propios hosts de Motir y para nombres que un lector podría confundir con uno de ellos.

Puedes renombrarla un número limitado de veces, y el panel muestra cuántos cambios de nombre te quedan. **La dirección antigua sigue funcionando después y nunca se libera.** Redirige a la nueva de forma permanente y nadie más puede reclamarla, ni siquiera tú más adelante. Es deliberado: un enlace que alguien ya ha compartido no debe llevar un día a un sitio que tú no elegiste.

## Conecta tu propio dominio {#connecting-your-own-domain}

Conectar un dominio propio está disponible en los planes de pago; consulta [nuestros planes](/). El subdominio de tu espacio de trabajo se incluye en todos los planes y sigue funcionando en cualquier caso.

Un dominio conectado sirve _un_ proyecto, en su raíz: `roadmap.acme.com/` es la página de ese proyecto y `roadmap.acme.com/changelog` su registro de cambios. El tablero en vivo, los elementos de trabajo y la hoja de ruta están en la aplicación de Motir, y sus enlaces allí llevan hasta ellos.

Creas dos tipos de registro en tu registrador. **Añade primero el dominio**, en la configuración del proyecto, en _Dirección pública_: el panel enumera entonces todos los registros que necesita ese dominio, con su valor exacto y un botón de copiar en cada uno. Las formas de abajo son lo que cabe esperar: léelas para comprobar que tu registrador puede crearlas y toma los valores del panel.

### 1 · Apunta el dominio hacia nosotros {#point-the-domain-at-us}

Para un **subdominio** como `roadmap.acme.com`, un `CNAME`:

| Tipo    | Nombre    | Valor                  |
| ------- | --------- | ---------------------- |
| `CNAME` | `roadmap` | se muestra en el panel |

Para un **dominio raíz** como `acme.com`, un `A` y un `AAAA` en su lugar: un dominio raíz no admite un `CNAME`, porque ya lleva los registros `MX` y `TXT` de los que dependen tu correo y tus otros servicios:

| Tipo   | Nombre | Valor                  |
| ------ | ------ | ---------------------- |
| `A`    | `@`    | se muestra en el panel |
| `AAAA` | `@`    | se muestra en el panel |

Copia cada valor del panel y de ningún otro sitio. Estas son las direcciones en las que se sirve Motir, leídas de la plataforma en la que funcionamos, y pueden cambiar: el panel cambia con ellas y una página como esta no.

> Si tu proveedor de DNS ofrece un interruptor de “proxy” o “nube” en el registro, desactívalo: un proxy delante del registro oculta tu dominio a la comprobación y no se puede emitir el certificado.

### 2 · Demuestra que el dominio es tuyo {#prove-the-domain-is-yours}

Junto al registro de apuntado, el panel enumera un registro `TXT` con un token dentro, con esta forma:

| Tipo  | Nombre                  | Valor            |
| ----- | ----------------------- | ---------------- |
| `TXT` | `_motir-verify.roadmap` | `motir-verify=…` |

Copia el valor del panel y no de aquí: el token es solo tuyo. Luego elige _Verificar_. En cuanto podamos ver el registro, solicitamos un certificado, lo que suele completarse en uno o dos minutos. Puedes cerrar la página; el estado sigue avanzando por sí solo, y los registros siguen disponibles en _Mostrar registros DNS_.

## Qué significa cada estado {#what-each-status-means}

[//]: # "Translator: the Status column names states the product itself shows. Use the label the app's own messages file for your locale gives each state, not a fresh translation, so this table matches the screen."

| Estado        | Qué significa                                                                                                                               | Qué hacer                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Sin verificar | Todavía no hemos visto tu registro de propiedad. No se ha solicitado nada a la autoridad de certificación.                                  | Crea el registro TXT de abajo y luego elige Volver a comprobar.          |
| Comprobando…  | Ahora estamos buscando el registro de propiedad. Los cambios de DNS pueden tardar unos minutos en propagarse.                               | Espera un momento. Avanza por sí solo.                                   |
| Emitiendo…    | La propiedad está demostrada y se ha solicitado el certificado. Suele tardar uno o dos minutos.                                             | Nada. Motir hace el resto.                                               |
| Activo        | El certificado está emitido y tu dominio sirve el proyecto. Se renueva solo.                                                                | Puedes convertir esta dirección en la principal.                         |
| Error         | No se pudo emitir el certificado. El motivo se muestra junto al estado; lo más habitual es un registro que falta o que apunta a otro sitio. | Compara tus registros con los de abajo y luego elige Volver a comprobar. |
| Caducado      | El certificado caducó y la renovación no tuvo éxito, casi siempre porque cambió un registro DNS. El dominio no está sirviendo.              | Deja los registros como estaban y luego elige Volver a comprobar.        |
| Revocado      | Se retiró el certificado. El dominio no está sirviendo.                                                                                     | Elige Volver a solicitar para empezar un certificado nuevo.              |

## Cuál es la dirección real {#which-address-is-the-real-one}

Un proyecto puede responder en varias direcciones, y exactamente una de ellas es la _principal_: aquella de la que se informa a los buscadores y a las vistas previas de redes sociales. Cuando el certificado de un dominio conectado esté activo, puedes convertirlo en el principal; hasta entonces lo es la dirección de Motir.

**Todas las demás direcciones redirigen a la principal.** Eso incluye tu dirección de `motir.co` una vez que hayas promovido un dominio propio. Los visitantes siempre llegan a un sitio que funciona, y un buscador ve una sola página en lugar de tres copias que compiten entre sí.

## Quitar un dominio {#removing-a-domain}

Quitar un dominio conectado retira su certificado y la dirección deja de responder: quien la use recibirá un error, y los enlaces ya compartidos hacia ella dejan de funcionar. Tu proyecto sigue siendo público en sus otras direcciones, así que quitar un dominio nunca hace privado un proyecto.

## Si algo no funciona {#if-something-is-not-working}

Tres errores explican casi todos los fallos, y cada uno se ve de forma distinta en el panel.

- **Un CNAME en un dominio raíz.** La mayoría de los registradores lo aceptan y no funciona. El síntoma es un dominio que se queda en Sin verificar (`Not verified`) o llega a Error (`Failed`). Usa en su lugar los registros `A` y `AAAA` de arriba.
- **Un proveedor de DNS con proxy delante del registro.** Si tu proveedor ofrece actuar de proxy o acelerar el tráfico, eso nos oculta el registro real. El síntoma es un Comprobando… (`Checking…`) que nunca se resuelve. Desactiva el proxy para estos registros.
- **Un registro de propiedad obsoleto.** Si quitaste un dominio y lo volviste a añadir, el token cambió. El síntoma es Sin verificar (`Not verified`) mientras hay un registro `TXT` claramente presente. Sustituye su valor por el que muestra ahora el panel.
