import { userRegistrationSchema } from '@ng-realworld/data-access/model';
import { procedure, router } from '../core';

const createUserProcedure = procedure.input(userRegistrationSchema).mutation(({ input }) => {
  return {
    msg: 'userCreateProcedure',
    input,
  };
});
export const userRoute = router({
  createUser: createUserProcedure,
});
