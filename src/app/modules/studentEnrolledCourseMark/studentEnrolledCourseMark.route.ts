import express from 'express';
import { StudentEnrolledCourseMarkConroller } from './studentEnrolledCourseMark.controller';

const router = express.Router();

router.patch(
  '/update-marks',
  StudentEnrolledCourseMarkConroller.updateStudentMarks
);
router.patch(
  '/update-final-marks',
  StudentEnrolledCourseMarkConroller.updateFinalMarks
);

export const StudentEnrolledCourseMarkRoutes = {
  router,
};
