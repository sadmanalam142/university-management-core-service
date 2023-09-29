import express from 'express';
import { AcademicSemesterRoutes } from '../modules/academicSemester/academicSemester.route';
import { CourseRoutes } from '../modules/course/course.route';

const router = express.Router();

const moduleRoutes = [
  {
    path: "/academic-semester",
    route: AcademicSemesterRoutes.router
  },
  {
    path: "/course",
    route: CourseRoutes.router
  }
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
