const express = require("express");
const bodyParser = require("body-parser");
const { app: firebaseApp, db, realtimeDb } = require("./firebaseConfig");
const {
  getFirestore,
  collection,
  getDoc,
  setDoc,
  where,
  addDoc,
  doc,
} = require("firebase/firestore");
const {
  getDatabase,
  ref,
  orderByChild,
  child,
  runTransaction,
  push,
  get,
  set,
  query,
  equalTo,
} = require("firebase/database");
const app = express();
const port = 3000;
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.get("/", (req, res) => {
  const errorMessage = req.query.error
    ? "Credenciales incorrectas. Por favor, inténtelo de nuevo."
    : "";
  res.send(`
    <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" type="text/css" href="/css/styles.css">

    <title>Iniciar Sesión</title>
</head>
<body>
    <div class="background-gradient">
        <div class="login-container">
            <h1>El Banco</h1>
            <div id="error-message"></div>
            <form action="/login" method="post">
                <label for="dni">DNI:</label>
                <input type="text" id="dni" name="dni" required>
                <br>
                <label for="password">Contraseña:</label>
                <input type="password" id="password" name="password" required>
                <br>
                <input type="submit" value="Iniciar Sesión">
            </form>
            <div class="register-link">
                ¿No tienes una cuenta? <a href="/register">Regístrate aquí</a>
            </div>
        </div>
    </div>

    <script>
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('error')) {
            const errorMessage = "Credenciales incorrectas. Por favor, inténtelo de nuevo.";
            document.getElementById("error-message").textContent = errorMessage;
        }
    </script>
</body>
</html>

    `);
});

app.post("/login", async (req, res) => {
  try {
    const { dni, password } = req.body;

    const usuariosRef = ref(realtimeDb, "usuarios");
    const queryRef = query(usuariosRef, orderByChild("dni"), equalTo(dni));
    const snapshot = await get(queryRef);

    if (snapshot.exists()) {
      const firstKey = Object.keys(snapshot.val())[0];
      const userData = snapshot.val()[firstKey];

      if (userData.password === password) {
        res.cookie("dniUsuario", dni);
        res.cookie("saldoCuentaAhorros", userData.dinero);
        res.redirect("/select-account");
      } else {
        console.error("Credenciales incorrectas. Contraseña incorrecta.");
        res.redirect("/?error=true");
      }
    } else {
      console.error("Credenciales incorrectas. Usuario no encontrado.");
      res.redirect("/?error=true");
    }
  } catch (error) {
    console.error("Error al consultar la base de datos:", error);
    res.redirect("/?error=true");
  }
});

app.listen(port, () => {
  console.log(`Servidor en ejecución en http://localhost:${port}`);
});

app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/register.html");
});

//Seleccion de cuenta
app.get("/select-account", (req, res) => {
  res.sendFile(__dirname + "/select_account.html");
});

//Ultimos MOvimientos
app.get("/last_Movements.html", (req, res) => {
  res.sendFile(__dirname + "/last_Movements.html");
});

//Generación de Estado de Cuenta
app.get("/generate-statement", (req, res) => {
  res.sendFile(__dirname + "/generate_statement.html");
});

app.get("/transferencia", (req, res) => {
  res.sendFile(__dirname + "/transferencia.html");
});

app.get("/interbancaria", (req, res) => {
  res.sendFile(__dirname + "/interbancaria.html");
});

app.get("/interbancaria2", (req, res) => {
  res.sendFile(__dirname + "/interbancaria2.html");
});

app.get("/interbancaria3", (req, res) => {
  res.sendFile(__dirname + "/interbancaria3.html");
});

app.get("/transferenciaExitosa", (req, res) => {
  res.sendFile(__dirname + "/transferenciaExitosa.html");
});

app.get("/transferenciaExitosa2", (req, res) => {
  res.sendFile(__dirname + "/transferenciaExitosa2.html");
});

app.post("/generate-statement", (req, res) => {
  const selectedDate = req.body.date;
  const selectedFormat = req.body.format;

  const statement = generateStatement(selectedFormat);

  res.setHeader(
    "Content-disposition",
    `attachment; filename=estado_de_cuenta.${selectedFormat}`
  );
  res.setHeader("Content-type", `text/${selectedFormat}`);
  res.charset = "UTF-8";
  res.write(statement);
  res.end();
});

function generateStatement(format) {
  const tableContent = obtenerContenidoDeTabla();

  if (format === "csv") {
    return generarCSV(tableContent);
  } else if (format === "pdf") {
    return generarPDF(tableContent);
  } else if (format === "json") {
    return generarJSON(tableContent);
  } else {
    return "Formato no soportado";
  }
}

function obtenerContenidoDeTabla() {
  const table = document.getElementById("movementsTable");
  const rows = table.getElementsByTagName("tr");
  const tableContent = [];

  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName("td");
    const rowData = [];
    for (let j = 0; j < cells.length; j++) {
      rowData.push(cells[j].textContent);
    }
    tableContent.push(rowData);
  }

  return tableContent;
}

function generarCSV(movements) {
  let csvContent =
    "Fecha,Hora,Importe,Tipo de Operación,Número de Operación,Nombre de Beneficiario,Entidad Destino\n";

  movements.forEach((movement) => {
    csvContent += movement.join(",") + "\n";
  });

  return csvContent;
}

app.get("/validation.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.sendFile(__dirname + "/validation.js");
});

app.get("/registerValidation.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.sendFile(__dirname + "/registerValidation.js");
});

app.get("/select.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.sendFile(__dirname + "/select.js");
});

app.post("/register", async (req, res) => {
  const { dni, correo, password } = req.body;

  const alumnosCollection = collection(
    getFirestore(firebaseApp),
    "AlumnosLaSalle"
  );
  const alumnosDoc = doc(alumnosCollection, "Correo");

  try {
    const alumnosSnapshot = await getDoc(alumnosDoc);

    if (alumnosSnapshot.exists()) {
      const camposDocumento = alumnosSnapshot.data();
      const correosEnDocumento = Object.values(camposDocumento);

      if (correosEnDocumento.includes(correo)) {
        const realtimeDb = getDatabase(firebaseApp);
        const usuariosRef = ref(realtimeDb, "usuarios");

        const dniSnapshot = await get(child(usuariosRef, dni));

        if (dniSnapshot.exists()) {
          res.send(`
                        <script>
                            alert('El DNI ya está registrado.');
                            window.location.href = '/register';
                        </script>
                    `);
        } else {
          set(child(usuariosRef, dni), {
            dni,
            correo,
            password,
            dinero: 1000,
          });

          res.send(`
                        <script>
                            alert('Registro exitoso. ¡Bienvenido!');
                            window.location.href = '/login';
                        </script>
                    `);
        }
      } else {
        // Si el correo no está registrado, muestra una alerta
        res.send(`
                    <script>
                        alert('El correo no es válido');
                        window.location.href = '/register';
                    </script>
                `);
      }
    } else {
      // Si hay un error al consultar la colección de AlumnosLaSalle, muestra una alerta
      res.send(`
                <script>
                    alert('Error al consultar la colección de AlumnosLaSalle.');
                    window.location.href = '/register';
                </script>
            `);
    }
  } catch (error) {
    console.error("Error al consultar la colección de AlumnosLaSalle:", error);

    // Si hay un error, muestra una alerta
    res.send(`
            <script>
                alert('Error al procesar el registro. Por favor, inténtalo de nuevo.');
                window.location.href = '/register';
            </script>
        `);
  }
});

app.post("/CCIexistente", async (req, res) => {
  try {
    const { CCI } = req.body;

    const bancoFueraRef = ref(realtimeDb, "bancoFuera");
    const bancoFueraSnapshot = await get(bancoFueraRef);
    const bancoFueraData = bancoFueraSnapshot.val();

    if (CCI == bancoFueraData.CCI) {
      const successScript = `
                <script>
                    alert('CCI válido. Puedes proceder con la transferencia.');
                    window.location.href = '/interbancaria2';
                </script>
            `;
      console.error(CCI, bancoFueraData.moneda, bancoFueraData.nombre);
      res.cookie("moneda", bancoFueraData.moneda);
      res.cookie("cci", CCI);
      res.cookie("banco", bancoFueraData.nombre);
      console.error(CCI, bancoFueraData.moneda, bancoFueraData.nombre);

      res.send(successScript);
    } else {
      const errorScript = `
                <script>
                    alert('El CCI proporcionado no es válido. Por favor, verifica el CCI.');
                    window.location.href = '/interbancaria';  // Redirige a la página de transferencia
                </script>
            `;
      res.status(400).send(errorScript);
    }
  } catch (error) {
    const errorScript = `
            <script>
                alert('Error al procesar la solicitud de verificación del CCI. Por favor, inténtalo de nuevo.');
                window.location.href = '/interbancaria';  // Redirige a la página de transferencia
            </script>
        `;
    res.status(500).send(errorScript);
  }
});

app.post("/interbank-transfer", async (req, res) => {
  try {
    const CCI = req.cookies.cci;
    console.error(CCI);
    const { monto, token } = req.body;
    const dniUsuario = req.cookies.dniUsuario;

    const montoNumerico = parseFloat(monto);
    const tokenNumerico = parseFloat(token);

    if (isNaN(montoNumerico) || montoNumerico <= 0) {
      const errorScript = `
                <script>
                    alert('Monto no válido. Por favor, verifica el monto.');
                    window.location.href = '/interbancaria';  // Redirige a la página de transferencia
                </script>
            `;
      res.status(400).send(errorScript);
      return;
    }

    const tokenRef = ref(realtimeDb, "token");
    const tokenSnapshot = await get(tokenRef);
    const tokenData = tokenSnapshot.val();
    console.error(tokenNumerico, tokenData.codigo);
    if (tokenNumerico !== tokenData.codigo) {
      const errorScript = `
                <script>
                    alert('El token no es correcto');
                    window.location.href = '/select-account';  // Redirige a la página de transferencia
                </script>
            `;
      res.status(400).send(errorScript);
      return;
    }

    const bancoFueraRef = ref(realtimeDb, "bancoFuera");
    const bancoFueraSnapshot = await get(bancoFueraRef);

    if (bancoFueraSnapshot.exists()) {
      const bancoFueraData = bancoFueraSnapshot.val();

      const usuariosRef = ref(realtimeDb, "usuarios");
      const queryRef = query(
        usuariosRef,
        orderByChild("dni"),
        equalTo(dniUsuario)
      );
      const usuarioSnapshot = await get(queryRef);

      if (usuarioSnapshot.exists()) {
        const usuarioData =
          usuarioSnapshot.val()[Object.keys(usuarioSnapshot.val())[0]];

        if (CCI !== bancoFueraData.CCI) {
          const errorScript = `
                        <script>
                            alert('El CCI proporcionado no es válido. Por favor, verifica el CCI.');
                            window.location.href = '/interbancaria1';  // Redirige a la página de transferencia
                        </script>
                    `;
          res.status(400).send(errorScript);
          return;
        }

        if (usuarioData.dinero >= montoNumerico) {
          const nuevoDineroUsuario = usuarioData.dinero - montoNumerico;
          const nuevoDineroBancoFuera = bancoFueraData.dinero + montoNumerico;
          const nuevoUsuarioData = {
            ...usuarioData,
            dinero: nuevoDineroUsuario,
          };
          await set(
            ref(realtimeDb, `usuarios/${dniUsuario}`),
            nuevoUsuarioData
          );

          const nuevoBancoFueraData = {
            ...bancoFueraData,
            dinero: nuevoDineroBancoFuera,
          };
          await set(bancoFueraRef, nuevoBancoFueraData);

          res.cookie("saldoCuentaAhorros", nuevoDineroUsuario);
          res.cookie("monto", montoNumerico);
          res.cookie("nombreBanco", bancoFueraData.nombre);
          res.cookie("tipooperacion", bancoFueraData.Tipo);
          res.cookie("cuenta", bancoFueraData.cuenta);
          res.cookie("entidad", bancoFueraData.entidad);

          const successScript = `
                        <script>
                            alert('Transferencia exitosa.');
                            window.location.href = '/transferenciaExitosa';  // Redirige a la página principal u otra de tu elección
                        </script>
                    `;
          res.send(successScript);
        } else {
          const errorScript = `
                        <script>
                            alert('Fondos insuficientes para realizar la transferencia. Por favor, verifica el monto.');
                            window.location.href = '/interbancaria3';  // Redirige a la página de transferencia
                        </script>
                    `;
          res.status(400).send(errorScript);
        }
      } else {
        const errorScript = `
                    <script>
                        alert('Usuario no encontrado. Por favor, inicia sesión nuevamente.');
                        window.location.href = '/login';  // Redirige a la página de inicio de sesión
                    </script>
                `;
        res.status(404).send(errorScript);
      }
    } else {
      const errorScript = `
                <script>
                    alert('Cuenta del bancoFuera no encontrada. Por favor, contacta al soporte.');
                    window.location.href = '/interbancaria';  // Redirige a la página principal u otra de tu elección
                </script>
            `;
      res.status(404).send(errorScript);
    }
  } catch (error) {
    const errorScript = `
            <script>
                alert('Error al procesar la transferencia. Por favor, inténtalo de nuevo.');
                window.location.href = '/interbancaria';  // Redirige a la página de transferencia
            </script>
        `;
    res.status(500).send(errorScript);
  }
});

app.get("/transferencia-exitosa", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "transferenciaExitosa.html"));
});

app.post("/transfer", async (req, res) => {
  try {
    console.log("Body antes de la desestructuración:", req.body);
    const { destinatarioCorreo, monto } = req.body;
    const remitenteDniUsuario = req.cookies.dniUsuario;
    console.log("Body después de la desestructuración:", {
      destinatarioCorreo,
      monto,
    });

    const montoNumerico = parseFloat(monto);

    if (isNaN(montoNumerico) || montoNumerico <= 0) {
      const errorScript = `
                <script>
                    alert('Monto no válido. Por favor, verifica el monto.');
                    window.location.href = '/transferencia';  // Redirige a la página de transferencia
                </script>
            `;
      res.status(400).send(errorScript);
      return;
    }

    const usuariosRef = ref(realtimeDb, "usuarios");

    // Obtener información del remitente
    const remitenteQueryRef = query(
      usuariosRef,
      orderByChild("dni"),
      equalTo(remitenteDniUsuario)
    );
    const remitenteSnapshot = await get(remitenteQueryRef);

    if (remitenteSnapshot.exists()) {
      const remitenteData =
        remitenteSnapshot.val()[Object.keys(remitenteSnapshot.val())[0]];

      console.log("Información del remitente:", remitenteData);

      // Validar fondos suficientes para realizar la transferencia
      if (remitenteData.dinero >= montoNumerico) {
        // Obtener información del destinatario
        const destinatarioQueryRef = query(
          usuariosRef,
          orderByChild("correo"),
          equalTo(destinatarioCorreo)
        );
        const destinatarioSnapshot = await get(destinatarioQueryRef);

        if (destinatarioSnapshot.exists()) {
          const destinatarioData =
            destinatarioSnapshot.val()[
              Object.keys(destinatarioSnapshot.val())[0]
            ];

          console.log("Información del destinatario:", destinatarioData);

          if (remitenteData.correo == destinatarioData.correo) {
            const errorScript = `
                            <script>
                                alert('No puedes transferir dinero a la misma cuenta.');
                                window.location.href = '/transferencia';  // Redirige a la página de transferencia
                            </script>
                        `;
            res.status(400).send(errorScript);
            return;
          }

          const nuevoDineroRemitente = remitenteData.dinero - montoNumerico;
          const nuevoDineroDestinatario =
            destinatarioData.dinero + montoNumerico;

          const nuevoUsuarioData = {
            ...remitenteData,
            dinero: nuevoDineroRemitente,
          };
          await set(
            ref(realtimeDb, `usuarios/${remitenteData.dni}`),
            nuevoUsuarioData
          );

          const nuevoDestinatarioData = {
            ...destinatarioData,
            dinero: nuevoDineroDestinatario,
          };
          await set(
            ref(realtimeDb, `usuarios/${destinatarioData.dni}`),
            nuevoDestinatarioData
          );

          res.cookie("monto", montoNumerico);
          res.cookie("correo", destinatarioData.correo);

          const successScript = `
                        <script>
                            alert('Transferencia exitosa.');
                            window.location.href = '/transferenciaExitosa2';  // Redirige a la página principal u otra de tu elección
                        </script>
                    `;
          res.send(successScript);
        } else {
          const errorScript = `
                        <script>
                            alert('Destinatario no encontrado. Por favor, verifica el correo electrónico.');
                            window.location.href = '/transferencia';  // Redirige a la página de transferencia
                        </script>
                    `;
          res.status(404).send(errorScript);
        }
      } else {
        const errorScript = `
                    <script>
                        alert('Fondos insuficientes para realizar la transferencia. Por favor, verifica el monto.');
                        window.location.href = '/transferencia';  // Redirige a la página de transferencia
                    </script>
                `;
        res.status(400).send(errorScript);
      }
    } else {
      const errorScript = `
                <script>
                    alert('Usuario no encontrado. Por favor, inicia sesión nuevamente.');
                    window.location.href = '/login';  // Redirige a la página de inicio de sesión
                </script>
            `;
      res.status(404).send(errorScript);
    }
  } catch (error) {
    console.error("Error al procesar la transferencia:", error);
    const errorScript = `
            <script>
                alert('Error al procesar la transferencia. Por favor, inténtalo de nuevo.');
                window.location.href = '/transferencia';  // Redirige a la página de transferencia
            </script>
        `;
    res.status(500).send(errorScript);
  }
});
