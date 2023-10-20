import express from 'express';
import { AcademicSemesterRoutes } from '../modules/academicSemester/academicSemester.route';
import { CourseRoutes } from '../modules/course/course.route';
import { FacultyRoutes } from '../modules/faculty/faculty.route';
import { AcademicFacultyRoutes } from '../modules/academicFaculty/academicFaculty.route';
import { StudentRoutes } from '../modules/student/student.route';
import { AcademicDepartmentRoutes } from '../modules/academicDepartment/academicDepartment.route';
import { BuildingRoutes } from '../modules/building/building.route';
import { RoomRoutes } from '../modules/room/room.route';
import { SemesterRagistrationRoutes } from '../modules/semesterRegistration/semesterRegistration.route';
import { OfferedCourseRoutes } from '../modules/offeredCourse/offeredCourse.route';
import { OfferedCourseSectionRoutes } from '../modules/offeredCourseSection/offeredCourseSection.route';
import { OfferedCourseClassScheduleRoutes } from '../modules/offeredCourseClassSchedule/offeredCourseClassSchedule.route';
import { StudentEnrolledCourseMarkRoutes } from '../modules/studentEnrolledCourseMark/studentEnrolledCourseMark.route';
import { StudentSemesterPaymentRoutes } from '../modules/studentSemesterPayment/studentSemesterPayment.route';
import { StudentEnrolledCourseRoutes } from '../modules/studentEnrolledCourse/studentEnrolledCourse.route';

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
  {
    path: '/semester-registration',
    route: SemesterRagistrationRoutes.router,
  },
  {
    path: '/offered-course',
    route: OfferedCourseRoutes.router,
  },
  {
    path: '/offered-course-section',
    route: OfferedCourseSectionRoutes.router,
  },
  {
    path: '/offered-course-class-schedule',
    route: OfferedCourseClassScheduleRoutes.router,
  },
  {
    path: '/student-enrolled-course',
    route: StudentEnrolledCourseRoutes.router,
  },
  {
    path: '/student-mark',
    route: StudentEnrolledCourseMarkRoutes.router,
  },
  {
    path: '/student-semester-payment',
    route: StudentSemesterPaymentRoutes.router,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
