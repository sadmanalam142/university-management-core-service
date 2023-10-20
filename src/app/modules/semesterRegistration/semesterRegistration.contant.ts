export const semesterRegistrationFilterableFields = [
  'searchTerm',
  'id',
  'academicSemesterId',
];

export const semesterRegistrationSearchableFields = [];

export const semesterRegistrationRelationalFields: string[] = ['academicSemesterId'];
export const semesterRegistrationRelationalFieldsMapper: { [key: string]: string } = {
    academicSemesterId: 'academicSemester'
};
