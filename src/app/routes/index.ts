import express from 'express';
import { AcademicSemesterRoutes } from '../modules/academicSemester/academicSemester.route';
import { CourseRoutes } from '../modules/course/course.route';
import { FacultyRoutes } from '../modules/faculty/faculty.route';
import { AcademicFacultyRoutes } from '../modules/academicFaculty/academicFaculty.route';
import { StudentRoutes } from '../modules/student/student.route';
import { AcademicDepartmentRoutes } from '../modules/academicDepartment/academicDepartment.route';
import { BuildingRoutes } from '../modules/building/building.route';
import { RoomRoutes } from '../modules/room/room.route';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/academic-semester',
    route: AcademicSemesterRoutes.router,
  },
  {
    path: '/academic-faculty',
    route: AcademicFacultyRoutes.router,
  },
  {
    path: '/academic-department',
    route: AcademicDepartmentRoutes.router,
  },
  {
    path: '/student',
    route: StudentRoutes.router,
  },
  {
    path: '/faculty',
    route: FacultyRoutes.router,
  },
  {
    path: '/building',
    route: BuildingRoutes.router,
  },
  {
    path: '/room',
    route: RoomRoutes.router,
  },
  {
    path: '/course',
    route: CourseRoutes.router,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
