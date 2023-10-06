import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { SemesterRagistrationController } from './semesterRegistration.controller';

const router = express.Router();
router.post(
  '/create-registration',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  SemesterRagistrationController.createSemesterRegistration
);
router.get('/', SemesterRagistrationController.getAllSemesterRegistrations);
router.get('/:id', SemesterRagistrationController.getSingleSemesterRegistration);

router.patch(
  '/:id',
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
