export type ICourseCreateData = {
  title: string;
  code: string;
  credits: number;
  preRequisiteCourses?: ICourseResponseData[];
};

export type ICourseResponseData = {
    courseId: string;
    isDeleted?: null
  }
