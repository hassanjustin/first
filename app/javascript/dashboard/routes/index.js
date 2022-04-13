import VueRouter from 'vue-router';

import { frontendURL } from '../helper/URLHelper';
import { clearBrowserSessionCookies } from '../store/utils/api';
import authRoute from './auth/auth.routes';
import dashboard from './dashboard/dashboard.routes';
import login from './login/login.routes';
import store from '../store';
import vueActionCable from '../helper/actionCable';

const routes = [
  ...login.routes,
  ...dashboard.routes,
  ...authRoute.routes,
  {
    path: '/',
    redirect: '/app',
  },
];

window.roleWiseRoutes = {
  agent: [],
  administrator: [],
};

const getUserRole = ({ accounts } = {}, accountId) => {
  const currentAccount = accounts.find(account => account.id === accountId);
  return currentAccount ? currentAccount.role : null;
};

// generateRoleWiseRoute - updates window object with agent/admin route
const generateRoleWiseRoute = route => {
  route.forEach(element => {
    if (element.children) {
      generateRoleWiseRoute(element.children);
    }
    if (element.roles) {
      element.roles.forEach(roleEl => {
        window.roleWiseRoutes[roleEl].push(element.name);
      });
    }
  });
};
// Create a object of routes
// accessible by each role.
// returns an object with roles as keys and routeArr as values
generateRoleWiseRoute(routes);

export const router = new VueRouter({ mode: 'history', routes });

const unProtectedRoutes = ['login', 'auth_signup', 'auth_reset_password'];

const authIgnoreRoutes = [
  'auth_confirmation',
  'pushBack',
  'auth_password_edit',
];

function routeIsAccessibleFor(route, role) {
  return window.roleWiseRoutes[role].includes(route);
}

const routeValidators = [
  {
    protected: false,
    loggedIn: true,
    handler: () => {
      const user = store.getters.getCurrentUser;
      return `accounts/${user.account_id}/dashboard`;
    },
  },
  {
    protected: true,
    loggedIn: false,
    handler: () => 'login',
  },
  {
    protected: true,
    loggedIn: true,
    handler: to => {
      const user = store.getters.getCurrentUser;
      const userRole = getUserRole(user, Number(to.params.accountId));
      const isAccessible = routeIsAccessibleFor(to.name, userRole);
      return isAccessible ? null : `accounts/${to.params.accountId}/dashboard`;
    },
  },
  {
    protected: false,
    loggedIn: false,
    handler: () => null,
  },
];

export const validateAuthenticateRoutePermission = (to, from, next) => {
  const isLoggedIn = store.getters.isLoggedIn;
  const isProtectedRoute = !unProtectedRoutes.includes(to.name);
  const strategy = routeValidators.find(
    validator =>
      validator.protected === isProtectedRoute &&
      validator.loggedIn === isLoggedIn
  );
  const nextRoute = strategy.handler(to);
  return nextRoute ? next(frontendURL(nextRoute)) : next();
};

const validateSSOLoginParams = to => {
  const isLoginRoute = to.name === 'login';
  const { email, sso_auth_token: ssoAuthToken } = to.query || {};
  const hasValidSSOParams = email && ssoAuthToken;
  return isLoginRoute && hasValidSSOParams;
};

const validateRouteAccess = (to, from, next) => {
  if (
    window.chatwootConfig.signupEnabled !== 'true' &&
    to.meta &&
    to.meta.requireSignupEnabled
  ) {
    const user = store.getters.getCurrentUser;
    next(frontendURL(`accounts/${user.account_id}/dashboard`));
  }

  if (validateSSOLoginParams(to)) {
    clearBrowserSessionCookies();
    return next();
  }

  if (authIgnoreRoutes.includes(to.name)) {
    return next();
  }
  return validateAuthenticateRoutePermission(to, from, next);
};

export const initalizeRouter = () => {
  const userAuthentication = store.dispatch('setUser');
  userAuthentication.then(() => vueActionCable.init());
  // Validated the user authentication
  // before
  router.beforeEach((to, from, next) => {
    userAuthentication.then(() => {
      if (!to.name) {
        const user = store.getters.getCurrentUser;
        if (user) {
          return next(frontendURL(`accounts/${user.account_id}/dashboard`));
        }
        return next('/app/login');
      }

      return validateRouteAccess(to, from, next);
    });
  });
};

export default router;
