export interface userInterface {

    Name: string,
    Lastname: string,
    email: string,
    cellphone: string,
    personalDescription: string,
    personalSite: string,
    username:string
}

export interface addressInterface {
    id?:      number;
    country: string;
    city:    string;
    street:  string;
    user?:    number[];
}

export interface LanguageInterface {
    id?:             number;
    name:           string;
    language_level: string;
    user?:           number[];
}

export interface userAuth {

    username: string,
    password: string
}

export interface tokenRequest {

    access: string,
    refresh: string 
}