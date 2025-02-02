export interface userInterface {

    "Name": string,
    "Lastname": string,
    "email": string,
    "cellphone": string,
    "personalDescription": string,
    "personalSite": string
}

export interface userAuth {

    "username": string,
    "password": string
}

export interface tokenRequest {

    "access": string,
    "refresh": string 
}