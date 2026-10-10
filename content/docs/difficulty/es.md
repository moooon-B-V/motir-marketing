---
source: 46869c4914a3
---

Una tarea, subtarea o error puede llevar una **dificultad**: cuánto razonamiento exige el trabajo, no cuánto trabajo hay. Los puntos de historia y las estimaciones miden el tamaño. La dificultad dice lo difícil que es hacerlo bien, de modo que un cambio de una sola línea en el orden de los bloqueos puede ser `high`, mientras que un renombrado grande y mecánico es `trivial`.

Motir indica la dificultad de un elemento de trabajo en el prompt que entrega a tu agente. Motir no elige el modelo por ti: usa los niveles de abajo para decidir con qué modelo ejecutar cada elemento de trabajo. Las épicas y las historias no llevan dificultad.

## Los cuatro niveles {#the-four-levels}

- **`trivial`** — Trabajo mecánico con una especificación inequívoca y sin decisiones de criterio. El elemento de trabajo describe el cambio por completo. Por ejemplo: un renombrado, un cambio de texto, activar o desactivar una configuración, subir una versión.
- **`low`** — Trabajo rutinario que sigue un patrón que el código ya tiene. Hace falta leer algo, pero la respuesta correcta es clara una vez encontrada. Por ejemplo: un campo nuevo a través de un formulario existente, un endpoint con la forma de sus vecinos, un error acotado con una reproducción clara.
- **`medium`** — Trabajo con decisiones de diseño reales: varios archivos o servicios, compromisos que sopesar o una especificación que deja margen a la interpretación. Por ejemplo: una función que abarca la API y la interfaz, una refactorización con llamadores que migrar, un error cuya causa aún no se conoce.
- **`high`** — Trabajo en el que un error sutil sale caro: concurrencia, seguridad, migraciones de datos, autenticación o un diseño sin precedentes que seguir. Por ejemplo: el orden de los bloqueos, un cambio en el modelo de permisos, una migración de esquema sobre datos en producción, un subsistema nuevo.

Cuando no se ha fijado ninguna dificultad, trata el elemento de trabajo como `medium`. Un nivel sin fijar significa que nadie lo ha valorado todavía, y eso no es motivo para enviarlo al modelo más barato.

## Modelos sugeridos para cada nivel {#models}

Cada nivel enumera sus candidatos por orden. Toma el primero que tu proyecto tenga permitido usar. La tabla muestra el precio de cada modelo por millón de tokens (entrada / salida), su puntuación en dos pruebas de rendimiento de programación y lo que costó una tarea en SWE-rebench. Esa prueba usa tareas nuevas con las que un modelo no puede haberse entrenado, así que su costo por tarea es la cifra pública más cercana a lo que costará una de tus subtareas.

### `trivial` · unos {{value:costRangeTrivial}} por tarea {#level-trivial}

{{slot:trivial}}

### `low` · unos {{value:costRangeLow}} por tarea {#level-low}

{{slot:low}}

### `medium` · unos {{value:costRangeMedium}} por tarea {#level-medium}

{{slot:medium}}

### `high` · unos {{value:costRangeHigh}} o más por tarea {#level-high}

{{slot:high}}

Un costo marcado con ≈ no se ha medido. Se toma un modelo medido de la misma familia y se escala según la diferencia de precio por token. Un guion significa que todavía no existe puntuación ni costo públicos.

## Cómo leer las cifras {#reading-the-numbers}

- **Las dos pruebas no coinciden, así que ninguna decide por sí sola.** SWE-bench Pro abarca más modelos, pero se sabe que alrededor del 30 % de sus tareas públicas están rotas. SWE-rebench es más difícil de manipular, y es la razón por la que DeepSeek V4 Pro y GPT-5.6 Luna están en `trivial`: ambos puntúan de 15 a 19 puntos menos en sus tareas nuevas.
- **Compara el costo por tarea terminada, no el precio por token.** Un modelo más barato que falla y hay que volver a ejecutar cuesta más que uno más potente que acierta a la primera. GPT-5.6 Sol y Claude Sonnet 5 cuestan lo mismo por token, pero Sol terminó más tareas con un costo por tarea menor.
- **Sube un nivel cuando falle una ejecución.** Si fallan las comprobaciones de un elemento de trabajo o se rechaza su revisión, vuelve a ejecutarlo en el nivel siguiente en lugar de en el mismo modelo.
- **Comprueba adónde pueden ir tus datos.** No todos los proveedores se pueden usar en todos los proyectos. Consulta [Proveedores de modelos](/legal/model-providers) para ver cómo trata cada uno el contenido que recibe.

## Cuán actualizado está {#how-current-this-is}

Los precios y las puntuaciones de esta página se leyeron el {{value:asOf}}. Los precios por token proceden del gateway de modelos de Motir, que los actualiza desde OpenRouter; Claude Opus 5.5 se añadió directamente desde OpenRouter porque salió después de la última actualización del gateway. Los modelos cambian cada pocos meses, así que trata los candidatos como un punto de partida y quédate con los que terminen tus propios elementos de trabajo.

- [Clasificación de SWE-bench Pro (BenchLM, 22 de septiembre de 2026)](https://benchlm.ai/benchmarks/swe-bench-pro)
- [Clasificación de SWE-rebench (tareas del 15 de mayo al 1 de julio de 2026)](https://swe-rebench.com/)
