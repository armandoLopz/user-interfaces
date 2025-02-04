export interface userInterface {

    first_name: string,
    last_name: string,
    email: string,
    cellphone: string,
    personal_description: string,
    personal_site: string,
    password: string,
    username:string,
    //photo: string
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

export interface skillsOrCompetenciesInterface {
    id?:                number;
    name:        string;
    proficiency: number;
    user?:              number[];
}

export interface educationInterface {
    id?:                 number;
    name_institution:   string;
    degree_studied:     string;
    start_studied_date: Date;
    end_studied_date:   Date;
    currently_studying: boolean;
    degree_level_other: string;
    degree_level:       string;
    user?:               number[];
}

export interface WorkExperienceInterface {
    id?:                     number;
    name_company:           string;
    description_of_the_job: string;
    start_work_date:        Date;
    end_work_date:          Date;
    currently_working:      boolean;
    job_title:              string;
    user?:                   number[];
}

export interface tokenRequest {

    access: string,
    refresh: string 
}