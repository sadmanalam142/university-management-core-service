import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { SemesterRagistrationController } from './semesterRegistration.controller';
import validateRequest from '../../middlewares/validateRequest';
import { SemesterRegistrationValidation } from './semesterRegistration.validation';

const router = express.Router();
router.post(
  '/create-registration',
  validateRequest(SemesterRegistrationValidation.createAcademicSemesterZodSchema),
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  SemesterRagistrationController.createSemesterRegistration
);
router.post(
  '/start-registration',
  auth(ENUM_USER_ROLE.STUDENT),
  SemesterRagistrationController.createStartRegistration
);
router.post(
  '/enroll-into-course',
  validateRequest(SemesterRegistrationValidation.enrollAndWithdrawCourseZodValidation),
  auth(ENUM_USER_ROLE.STUDENT),
  SemesterRagistrationController.enrollIntoCourse
);
router.post(
  '/withdraw-from-course',
  validateRequest(SemesterRegistrationValidation.enrollAndWithdrawCourseZodValidation),
  auth(ENUM_USER_ROLE.STUDENT),
  SemesterRagistrationController.withdrawFromCourse
);
router.post(
  '/confirm-registration',
  auth(ENUM_USER_ROLE.STUDENT),
  SemesterRagistrationController.confirmRegistration
);
router.post(
  '/:id/start-new-semester',
  SemesterRagistrationController.startNewSemester
);

router.get('/get-registrations', auth(ENUM_USER_ROLE.STUDENT), SemesterRagistrationController.getRegistrations);
router.get('/', SemesterRagistrationController.getAllSemesterRegistrations);
router.get('/:id', SemesterRagistrationController.getSingleSemesterRegistration);

router.patch(
  '/:id',
  validateRequest(SemesterRegistrationValidation.updateAcademicSemesterZodSchema),
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  SemesterRagistrationController.updateSemesterRegistration
);

router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  SemesterRagistrationController.deleteSemesterRegistration
);

export const SemesterRagistrationRoutes = {
  router,
};
