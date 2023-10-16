import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { OfferedCourseClassScheduleController } from './offeredCourseClassSchedule.controller';
import { OfferedCourseClassScheduleValidation } from './offeredCourseClassSchedule.validation';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();
router.post(
  '/create-schedule',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  validateRequest(OfferedCourseClassScheduleValidation.createOfferedCourseClassScheduleZodValidation),
  OfferedCourseClassScheduleController.createOfferedCourseClassSchedule
);
router.get('/', OfferedCourseClassScheduleController.getAllOfferedCourseClassSchedules);
router.get('/:id', OfferedCourseClassScheduleController.getSinglOfferedCourseClassSchedule);

router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  validateRequest(OfferedCourseClassScheduleValidation.updateOfferedCourseClassScheduleZodValidation),
  OfferedCourseClassScheduleController.updatOfferedCourseClassSchedule
);
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  OfferedCourseClassScheduleController.deleteOfferedCourseClassSchedule
);

export const OfferedCourseClassScheduleRoutes = {
  router,
};
