
# Backend

Esta práctica consiste en el desarrollo de una API REST para un entorno de coworking, con funciones de sesión y reserva de hasta 20 puestos para cualquier día.

## GET /status   
#### Indica que el servidor está OK 


## POST /signin 
#### Permite registrarse.
Request Se debe pasar como body el email y la contraseña.


## POST /login 
#### Permite iniciar sesión.
Request Se debe pasar como body el email y la contraseña.


## POST /logout
#### Permite cerrar sesión
Requiere estar loggeado (token metido por headers)


## GET /freeseats
#### Devuelve un JSON con un array de los puestos que haya libres en la fecha introducida
Requiere estar loggeado (token metido por headers). 
Request Se debe pasar como parámetros el day, month y year. 


## POST /book
#### Reserva un puesto en la fecha introducida.
Requiere estar loggeado (token metido por headers).
Request Se debe pasar como parámetro el day, month, year y el número del puesto


## POST /free 
#### Cancela una reserva
Requiere estar loggeado (token metido por headers). 
Request Se debe pasar como body el day, month y año. 


## GET /mybookings
#### Muestra todas las reservas pendientes de un usuario (cualquier fecha posterior a la actual). 
Requiere estar loggeado (token metido por headers). 
