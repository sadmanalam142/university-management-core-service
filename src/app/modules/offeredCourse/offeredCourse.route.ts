import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { OfferedCourseController } from './offeredCourse.controller';
import validateRequest from '../../middlewares/validateRequest';
import { OfferedCourseValidation } from './offeredCourse.validation';

const router = express.Router();
router.post(
  '/create-course',
  validateRequest(OfferedCourseValidation.createOfferedCourseZodValidation),
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  OfferedCourseController.createOfferedCourse
);
router.get('/', OfferedCourseController.getAllOfferedCourses);
router.get('/:id', OfferedCourseController.getSinglOfferedCourse);

router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  validateRequest(OfferedCourseValidation.updateOfferedCourseZodValidation),
  OfferedCourseController.updatOfferedCourse
);
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  OfferedCourseController.deleteOfferedCourse
);

export const OfferedCourseRoutes = {
  router,
};
