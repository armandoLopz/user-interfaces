export interface UserDetailsInterface {
    result: ResultInterface;
}

export interface ResultInterface {
    id:                   number;
    username:             string;
    email:                string;
    first_name:           string;
    last_name:            string;
    cellphone:            number;
    personal_description: string;
    personal_site:        string;
    addresses:            addressInterface[];
    work_experiences:     WorkExperienceInterface[];
    educations:           educationInterface[];
    languages:            LanguageInterface[];
    skills:               skillsOrCompetenciesInterface[];
    competencies:         skillsOrCompetenciesInterface[];
}

export interface UserDetailsInterface {
    
    user: userInterface;
    addresses:            addressInterface[];
    work_experiences:     WorkExperienceInterface[];
    educations:           educationInterface[];
    languages:            LanguageInterface[];
    skills:               skillsOrCompetenciesInterface[];
    competencies:         skillsOrCompetenciesInterface[];
}

export interface userInterface {

    id?: number,
    first_name: string,
    last_name: string,
    email: string,
    cellphone: string,
    personal_description?: string,
    personal_site?: string,
    password: string,
    username: string,
    //photo: string
}

export interface addressInterface {
    id?: number;
    country: string;
    city: string;
    street: string;
    user?: number[];
}

export interface LanguageInterface {
    id?: number;
    name: string;
    language_level: string;
    user?: number[];
}

export interface ImageInterface {
    id?:    number;
    title: string;
    image: string;
}

export interface VideoInterface {
    
    id?:               number;
    title:            string;
    description:      string;
    video_file:       string;
    subtitle_english: string;
    subtitle_spanish: string;
}

export interface userAuth {

    username: string,
    password: string
}

export interface skillsOrCompetenciesInterface {
    id?: number;
    name: string;
    proficiency: number;
    user?: number[];
}

export interface educationInterface {
    id?: number;
    name_institution: string;
    degree_studied: string;
    start_studied_date: number;
    end_studied_date: number;
    currently_studying: boolean;
    degree_level_other: string;
    degree_level: string;
    user?: number[];
}

export interface WorkExperienceInterface {
    id?: number;
    name_company: string;
    description_of_the_job: string;
    start_work_date: number;
    end_work_date: number;
    currently_working: boolean;
    job_title: string;
    user?: number[];
}

export interface tokenRequest {

    access: string,
    refresh: string
}