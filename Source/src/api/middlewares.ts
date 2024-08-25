import { urlencoded } from 'body-parser';
import busboy from 'connect-busboy';

import { authenticate } from '@medusajs/medusa';
import type {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
  MiddlewaresConfig,
  User,
  UserService,
} from '@medusajs/medusa';

async function registerLoggedInUser(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction,
) {
  let loggedInUser: User | null = null;
  console.log('====================================');
  console.log('EN registerLoggedINUSER MIDDLEWARE');
  console.log('====================================');
  if (req.user && req.user.userId) {
    const userService = req.scope.resolve('userService') as UserService;
    loggedInUser = await userService.retrieve(req.user.userId);
  }

  req.scope.register({
    loggedInUser: {
      resolve: () => loggedInUser,
    },
  });

  next();
}

export const config: MiddlewaresConfig = {
  routes: [
    {
      matcher: '/admin/bannerList',
      middlewares: [authenticate(), registerLoggedInUser],
    },
    {
      matcher: '/admin/uploadBanner',
      middlewares: [authenticate(), registerLoggedInUser],
    },

    {
      matcher: '/banners/upload',
      middlewares: [
        authenticate(),
        // Insert the busboy middle-ware
        busboy({
          highWaterMark: 2 * 1024 * 1024, // Set 2MiB buffer
        }),
      ],
      method: 'POST',
      bodyParser: {
        sizeLimit: 25600, //25Mb
      },
    },
    {
      matcher: '/banners/list',
      middlewares: [
        // authenticate(),
        // Insert the form-data handler
        urlencoded({ extended: true }),
      ],
    },
  ],
  errorHandler: (err, req, res, next) => {
    console.log('====================================');
    console.error('ERROR: en middlewares', err);
    console.log('====================================');
  },
};
