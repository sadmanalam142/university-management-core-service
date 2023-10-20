import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { FacultyValidation } from './faculty.validation';
import { FacultyController } from './faculty.controller';

const router = express.Router();
router.post(
  '/create-faculty',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  validateRequest(FacultyValidation.createFacultyZodValidation),
  FacultyController.createFaculty
);
router.get('/', FacultyController.getAllFaculties);
router.get('/my-courses', auth(ENUM_USER_ROLE.FACULTY), FacultyController.getMyCourses);
router.get(
  '/my-course-students',
  auth(ENUM_USER_ROLE.FACULTY),
  FacultyController.getMyCourseStudents
);
router.get('/:id', FacultyController.getSingleFaculty);

router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  validateRequest(FacultyValidation.updateFacultyZodValidation),
  FacultyController.updateFaculty
);
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  FacultyController.deleteFaculty
);

router.post('/:id/assign-courses', auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN), FacultyController.assignCourses)
router.delete('/:id/remove-courses', auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN), FacultyController.removeCourses)

export const FacultyRoutes = {
  router,
};
