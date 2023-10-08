import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { OfferedCourseSectionValidation } from './offeredCourseSection.validation';
import { OfferedCourseSectionController } from './offeredCourseSection.controller';

const router = express.Router();
router.post(
  '/create-section',
  validateRequest(OfferedCourseSectionValidation.createOfferedCourseSectionZodValidation),
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  OfferedCourseSectionController.createOfferedCourseSection
);
router.get('/', OfferedCourseSectionController.getAllOfferedCourseSections);
router.get('/:id', OfferedCourseSectionController.getSinglOfferedCourseSection);

router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  validateRequest(OfferedCourseSectionValidation.updateOfferedCourseSectionZodValidation),
  OfferedCourseSectionController.updatOfferedCourseSection
);
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  OfferedCourseSectionController.deleteOfferedCourseSection
);

export const OfferedCourseSectionRoutes = {
  router,
};
