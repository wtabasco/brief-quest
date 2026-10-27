# Guardado en la nube con Supabase

Con esto, cada persona entra al juego con su mail (le llega un link, sin contraseña) y su partida se guarda en la nube: sigue donde la dejó en la compu o en el celular. Nadie ve la partida de otro.

1. **Publicá el juego** (por ejemplo en Netlify: arrastrás la carpeta `brief-quest` a app.netlify.com/drop) y anotá el link que te da.
2. **Creá el proyecto en Supabase** (supabase.com, plan gratis): New project, elegí un nombre y una contraseña de base de datos.
3. **Creá la tabla:** en el proyecto, SQL Editor > New query, pegá todo `supabase.sql` y tocá Run.
4. **Decile a Supabase dónde está el juego:** Authentication > URL Configuration. En "Site URL" poné el link del paso 1, y agregalo también en "Redirect URLs".
5. **Copiá los datos:** Settings > API. Copiá la "Project URL" y la clave "anon public" en `js/config.js`.
6. **Volvé a publicar** la carpeta con el `config.js` completo.

La clave "anon public" puede estar en la web: la seguridad la dan las reglas de la tabla (cada uno ve solo lo suyo). La que nunca va en el juego es la "service_role".
