import { Db } from "mongodb";
import { connectDB } from "./mongo";
import express from "express";
import { book, free, freeSeats, status, signin, logout, login, mybookings } from "./resolvers";

const run = async () => {
  const db: Db = await connectDB();
  const app = express();
  app.use(express.urlencoded({extended: true}));
    app.use(express.json())


  var pruebasesion = {
    logout: "/logout",
    freeseats: "/freeseats",
    book: "/book", //reservar con correo
    free: "/free",
    mybookings: "/mybookings",
  };

  var abresesion = {
    signin: "/signin",
    login: "/login",
  }; //luego

  app.set("db", db);

  app.use([pruebasesion.book, pruebasesion.free, pruebasesion.freeseats, pruebasesion.logout, pruebasesion.mybookings], async (req, res, next) => {

    const db: Db = req.app.get("db");
    const token = req.headers.token;
    if (!req.headers) return res.status(500).send("Falta token de sesion");
      
    const user = await db.collection("usuarios").findOne({ token }); //preestablecer
      
      if (user) {
        console.log("Acceso permitido.");
        next();
      } else { //en teoria deveria ser siempre valido
        console.log("Acceso no permitido.");
        //res.send("Error");
        return res.status(500).send("Token de sesion invalido");
      }
  });


  app.use([abresesion.signin, abresesion.login], async (req, res, next) => {

    const db: Db = req.app.get("db");
    const collection = db.collection("usuarios");
    if (!req.body) {                       //cambiar a body
      return res.status(500).send("No hay parametros en el body");
    }
  
    const { email, password } = req.body as {
      email: string;
      password: string;
    };
  
    if (!email || !password ) {
      return res.status(500).send("Faltan el usuario o la contraseña"); 
    } else {
      next();
    }
  });


  app.use((req, res, next) => {//meter algo
    next();
  });

  app.get("/status", status);
  app.get("/freeSeats", freeSeats);
  app.post("/book", book);
  app.post("/free", free);
  app.post("/signin", signin);
  app.post("/logout", logout);
  app.post("/login", login);
  app.get("/mybookings", mybookings);

  await app.listen(3000);
};

try {
  run();
} catch (e) {
  console.error(e);
}