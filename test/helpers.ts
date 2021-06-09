import { Button, MenuItem, MenuList, TextField } from 'material-ui-interactors';

export const logout = () => ({
    description: 'logut',
    action: async () => {
        await Button({ label: 'Profile' }).click();
        await MenuList().find(MenuItem('Logout')).click();
    },
});

export const login = (login: string, password: string) => ({
    description: `login with ${login}:${password}`,
    action: async () => {
        await TextField('Username').fillIn(login);
        await TextField('Password').fillIn(password);
        await Button('Sign in'.toUpperCase()).click();
    },
});
