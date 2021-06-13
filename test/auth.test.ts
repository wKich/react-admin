import { test, including, HTML } from 'bigtest';
// import { bigtestGlobals } from '@bigtest/globals';
import { Button, MenuItem, MenuList, Snackbar } from 'material-ui-interactors';
import { login, logout } from './helpers';
import { Page } from './interactors/page';

// TODO Use `/#/posts` url for visit action
// https://github.com/thefrontside/bigtest/issues/936

export default test('Authentication')
    .step(Page().visit('/#/posts'))
    .child('should go to login page after logout', test =>
        test
            .step(logout())
            .assertion(Page().has({ url: including('#/login') }))
            .child('should redirect to login page when not logged in', test =>
                test
                    .step(Page().visit('/#/posts'))
                    .assertion(Page().has({ url: including('#/login') }))
            )
            .child('should not login with incorrect credentials', test =>
                test
                    .step(login('foo', 'bar'))
                    .assertion(
                        Snackbar('Authentication failed, please retry').exists()
                    )
            )
            .child('should login with correct credentials', test =>
                test
                    .step(login('login', 'password'))
                    .step(Page().visit('/#/posts'))
                    .assertion(Page().has({ url: including('#/posts') }))
            )
    )
    .child('should redirect to initial url keeping query string', test =>
        test
            .step(Button('Add filter'.toUpperCase()).click())
            .step(MenuList().find(MenuItem('Commentable')).click())
            // FIXME This doesn't work
            // .step('setAsNonLogged', () =>
            //     bigtestGlobals.document.defaultView.localStorage.setItem(
            //         'not_authenticated',
            //         'true'
            //     )
            // )
            // TODO https://github.com/thefrontside/bigtest/issues/937
            // .step('reload', () =>
            //     bigtestGlobals.document.defaultView.location.reload()
            // )
            // .step(login('login', 'password'))
            .assertion(Page().has({ url: including('#/posts') }))
            .assertion(HTML('Commentable').exists())
    );
