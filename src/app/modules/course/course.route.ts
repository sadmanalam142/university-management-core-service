import express from 'express';
import { CourseController } from './course.controller';

const router = express.Router();
router.post(
  '/create-course',
  CourseController.createCourse
);
router.patch(
  '/:id',
  CourseController.updateCourse
);

export const CourseRoutes = {
  router,
};
