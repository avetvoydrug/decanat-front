import api from './axios';

export interface CourseResponse {
    name: string;
}

export interface ProgramResponse {
    name: string
}

export interface StatusResponse {
    status: string;
}

export interface CourseData {
    name: string;
}

export interface StudentResponse {
    name: string
}

export interface HostelResponse {
    name: string;
    address: string;
    room: string;
    floor: string;
    commander_name: string;
}

export const uploadFile = async (data: FormData): Promise<StatusResponse> => {
    // const response = await api.post('/education-progress', data, {
    //     headers: {
    //       'Content-Type': 'multipart/form-data'
    //     }
    //   });
    // return response.data
    await new Promise(resolve => setTimeout(resolve, 5000));
    return {status: "success"}
};

export const getProgramms = async (): Promise<ProgramResponse[]> => {
    // const response = await api.get('/education-progress')
    // return response.data
    return [{name: "prog-1"}, {name: "prog-2"}, {name: "prog-3"}]
}


export const getCourses = async (): Promise<CourseResponse[]> => {
    // const response = await api.get('/courses')
    // return response.data
    return [{name: "wtf"}, {name: "pizdec"}, {name: "something"}]
}

export const addCourse = async (data: CourseData): Promise<StatusResponse> => {
    // const response = await api.post('/courses', data)
    // return response.data
    return {status: "success"}
}

export const getPayingStudents = async (): Promise<StudentResponse[]> => {
    // const response = await api.get('/paiying/students')
    // return response.data
    return [{name: "Petr"}, {name: "vanya"}, {name: "pidor"}]
}


export const getHostelInfo = async (): Promise<HostelResponse> => {
    // const response = await api.get('/paiying/students')
    // return response.data
    return {name: "obshaga", address: "Moscow 1234", room: "412", floor: "23", commander_name: "Alice"}
}