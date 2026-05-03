# AETKDEM - Copa Estado de Mexico

Sitio web estatico para la Asociacion Estatal de Taekwondo del Estado de Mexico A.C. y la Copa Estado de Mexico.

## Estructura principal

- `index.html`: pagina publica principal.
- `convocatoria-copa-estado-mexico.html`: convocatoria del evento.
- `atletas-registrados-copa-estado-mexico.html`: entrada para consultar atletas por rama.
- `atletas-femenil-copa-estado-mexico.html`: divisiones femeniles.
- `atletas-varonil-copa-estado-mexico.html`: divisiones varoniles.
- `atletas-division-copa-estado-mexico.html`: listado filtrado por rama, categoria y division.
- `admin.html`: acceso administrativo.
- `assets/app.js`: contenido publico de noticias, comunicados, eventos y media.
- `assets/athletes.js`: importacion y consulta de atletas desde Excel o CSV.
- `assets/firebase-app.js`: funciones de Firebase Auth y Firestore.
- `assets/firebase-config.js`: configuracion publica del proyecto Firebase.

## Publicacion con Vercel

El proyecto esta conectado a Vercel desde la rama `main`. Cada cambio confirmado en GitHub debe crear un deployment nuevo automaticamente.

## Publicacion con GitHub Pages

1. Entra al repositorio en GitHub.
2. Abre `Settings`.
3. Ve a `Pages`.
4. En `Build and deployment`, selecciona `Deploy from a branch`.
5. Elige rama `main` y carpeta `/root`.
6. Guarda los cambios.

GitHub generara una URL publica del sitio.

## Formato sugerido para cargar atletas

El archivo puede ser `.xlsx`, `.xls` o `.csv`. La primera hoja debe tener encabezados similares a estos:

| rama | categoria | division | nombre | escuela | entrenador | grado |
| --- | --- | --- | --- | --- | --- | --- |
| femenil | cadetes | -41 | Nombre de atleta | Escuela | Entrenador | Cinta negra |
| varonil | junior | -55 | Nombre de atleta | Escuela | Entrenador | Cinta roja |

Tambien se reconoce el formato de la hoja `CONCENTRADO G3` con columnas `INSTITUCION`, `NOMBRE DEL COMPETIDOR`, `CATEGORIA`, `RAMA` y `DIVISION`.

Alias aceptados:

- `rama`: rama, genero, sexo
- `categoria`: categoria, categoría
- `division`: division, división, peso
- `nombre`: nombre, atleta, competidor, competidora, nombre del competidor
- `escuela`: escuela, academia, club, institucion, institución
- `entrenador`: entrenador, coach, profesor
- `grado`: grado, cinta, cinturon, cinturón

## Administracion

El panel usa Firebase Authentication y valida administradores buscando un documento en Firestore:

```text
admins/{UID_DEL_USUARIO}
```

Para habilitar una cuenta:

1. Crea el usuario en Firebase Authentication.
2. Copia su UID.
3. En Firestore crea el documento `admins/UID`.
4. Inicia sesion desde `admin.html`.

## Notas de seguridad

La configuracion web de Firebase puede estar en el frontend, pero las reglas de Firestore deben impedir escritura publica. Revisa que solo usuarios administradores puedan escribir colecciones como `athletes`, `events` y `admins`.
