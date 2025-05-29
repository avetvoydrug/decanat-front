import api from './axios';

export interface FileResponse {
    status: string;
}

export interface CourseResponse {
    name: string;
}

export const uploadFile = async (data: FormData): Promise<FileResponse> => {
    // const response = await api.post('/upload', data, {
    //     headers: {
    //       'Content-Type': 'multipart/form-data'
    //     }
    //   });
    // return response.data
    await new Promise(resolve => setTimeout(resolve, 5000));
    return {status: "success"}
};

export const getCourses = async (): Promise<CourseResponse[]> => {
    // const response = await api.get('/courses')
    // return response.data
    return [{name: "wtf"}, {name: "pizdec"}, {name: "something"}]
}