import { Request, Response } from "express";
import { Db } from "mongodb";
import { v4 as uuid } from "uuid";

const checkDateValidity = (
  day: string,
  month: string,
  year: string
): boolean => {
  const date = new Date(`${month} ${day}, ${year}`);
  return date.toString() !== "Invalid Date"; 
};

const checkDateFuture = ( //filtro para comparar fechas futuras
  day: string,
  month: string,
  year: string
): boolean => {
  const date = new Date();
  const actual_day = date.getDate();
  const actual_month = date.getMonth() + 1;
  const actual_year = date.getFullYear();
  
  //return (parseInt(day) >= actual_day && parseInt(month) >= actual_month && parseInt(year) >= actual_year );
  if( parseInt(year) > actual_year ) return true;
  
  if( parseInt(year) == actual_year ){
    if( parseInt(month) > actual_month ) return true;
    else if( parseInt(month) == actual_month )
      return ( parseInt(day) > actual_day );
    }
  return false;
};

export const status = async (req: Request, res: Response) => {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  res.status(200).send(`${day}-${month}-${year}`);
};




export const freeSeats = async (req: Request, res: Response) => {
  const db: Db = req.app.get("db");//nombre de mi base
  const collection = db.collection("reservas");

  if (!req.query) {
    return res.status(500).send("No hay parametros");
  }

  const { day, month, year } = req.query as {
    day: string;
    month: string;
    year: string;
  }; //tipo: 20 12 2021

  if (!day || !month || !year) {
    return res.status(500).send("Falta day, month o year");
  }

  if (!checkDateValidity(day, month, year)) {
    return res.status(500).send("Day, month o year invalidos");
  }

  const seats = await collection.find({ day, month, year }).toArray();

  const freeSeats = [];
  for (let i = 1; i <= 20; i++) {
    if (!seats.find((seat) => parseInt(seat.number) === i)) {
      freeSeats.push(i); // cuando no encuentre resultados para un puesto reservado, 
    }                    // añade el puesto al array
  }
  return res.status(200).json({ free: freeSeats }); //array con los puestos libres
};







export const book = async (req: Request, res: Response) => {
  const db: Db = req.app.get("db");
  const collection = db.collection("reservas");
  if (!req.query) {
    return res.status(500).send("No hay parametros");
  }

  const { day, month, year, number } = req.query as {
    day: string;
    month: string;
    year: string;
    number: string;
  };

  if (!day || !month || !year || !number) {
    return res.status(500).send("Falta day, month o year");
  }

  if (!checkDateValidity(day, month, year)) {
    return res.status(500).send("Day, month o year invalidos");
  }

  
  const notFree = await collection.findOne({ day, month, year, number });
  if (notFree) { //si encuentra - esta reservado
    return res.status(404).send("Este puesto ya esta reservado.");
  }
  
  const token_usu = req.headers.token;
  const user = await db.collection("usuarios").findOne({ token: token_usu });
  if(!user){}
  const email = user!.email;

  const token = uuid(); //token de la reserva
  await collection.insertOne({ day, month, year, number, token, email});

  return res.status(200).json({ asiento:number, fecha:`${day}-${month}-${year}` });
    //res.status(200).send(`${day}-${month}-${year}`); => estilo: "19-11-2021"
};




export const free = async (req: Request, res: Response) => {
  const db: Db = req.app.get("db");
  const collection = db.collection("reservas");
  if (!req.body) { 
    return res.status(500).send("No hay parametros");
  }

  const { day, month, year } = req.body as {
    day: string;
    month: string;
    year: string;
  };

  const token = req.headers.token;

  const user = await db.collection("usuarios").findOne({ token }); //sabemos que existe por el middleware

  const email = user!.email;

  if (!day || !month || !year || !token) {
    return res
      .status(500).send("Falta day, month o year");
  }

  if (!checkDateValidity(day, month, year)) {
    return res.status(500).send("Day, month o year invalidos");
  }

  const booked = await collection.findOne({ day, month, year, email });
  if (booked) {
    await collection.deleteOne({ day, month, year, email });
    return res.status(200).send("Reserva cancelada");
  }

  return res.status(500).send("No existe ninguna reserva este dia");
};






export const signin = async (req: Request, res: Response) => {
    const db: Db = req.app.get("db");
    const collection = db.collection("usuarios");
    
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    const existe = await collection.findOne({ email });
    
    if (existe) { 
        return res.status(409).send("Ya existe un usuario con este email.");
    }
  
    const token = uuid();
    await collection.insertOne({ email, password, token });
  
    console.log(`Bienvenido usuario, tu token de sesion es: ${token}`);
    return res.status(200).json({ token }); 
  };



  export const logout = async (req: Request, res: Response) => {
      const db: Db = req.app.get("db");
      const collection = db.collection("usuarios");
      const token = req.headers.token;
    
      
      await collection.updateOne({token}, {$set: { token: undefined } });
      res.status(200).send("Sesion cerrada.");
    };
 
  //   db.collection.updateOne(
  //     <query>,
  //     { $set: { status: "D" }, $inc: { quantity: 2 } },
  //     ...
  //  )

  

  export const login = async (req: Request, res: Response) => {
    const db: Db = req.app.get("db");
    const collection = db.collection("usuarios");

    const { email, password } = req.body as {
      email: string;
      password: string;
    };
  
   
  
    const token = uuid();
    const existe = await collection.findOne({ email, password });
    
    if (existe) { 
      await collection.updateOne({ email, password }, {$set: { token: token } });
      console.log(`Bienvenido usuario, tu token de sesion es: ${token}`);
     return res.status(200).json({ token });
    }

    return res.status(401).send("No exixte un usuario con esta contraseña");
  };


  export const mybookings = async (req: Request, res: Response) => {
    const db: Db = req.app.get("db");//nombre de mi base
    const collection = db.collection("reservas");
    const token = req.headers.token;
    
    const user = await db.collection("usuarios").findOne({ token }); //sabemos que existe por el middleware

    const email = user!.email;


  
    const seats = await collection.find({ email }).toArray();
  
    //const reserved = seats.filter(seat => checkDateFuture(seat!.day, seat!.month, seat!.year) );
    //si quisieramos mostrar todos los datos de la reserva, usariamos solo el primer filtro.


    const reserved = seats.filter(seat => checkDateFuture(seat!.day, seat!.month, seat!.year) )
    .map(seat =>{ 
      return {date:`${seat.day}-${seat.month}-${seat.year}` ,number: seat.number}
  });

    if(reserved.length === 0) return res.status(404).send("No tienes ninguna reserva.");
    return res.status(200).json({ reserved }); //array con los puestos libres
  };

    
  