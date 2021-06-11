import { HTML, including, some } from '@bigtest/interactor';
import { test } from '@bigtest/suite';
import {
    DateField,
    TextField,
    FormControl,
    Button,
    Select,
    Switch,
    Tabs,
} from 'material-ui-interactors';
import { login, logout, wait } from './helpers';
import { Page } from './interactors/page';

const currentDate = new Date().toISOString().slice(0, 10);

export default test('Create Page')
    .step(Page().visit('/#/posts/create'))
    .assertion(HTML({ id: 'react-admin-title' }).has({ text: 'Create Post' }))
    .assertion(DateField({ id: 'published_at' }).has({ value: currentDate }))
    .assertion(
        DateField('resources.posts.fields.date').has({ value: currentDate })
    )
    .assertion(
        TextField('resources.posts.fields.url').has({
            value: 'http://google.com',
        })
    )
    .assertion(
        HTML({ className: including('ra-rich-text-input-error') }).absent()
    )
    .child('should validate ArrayInput', test =>
        test
            .step(
                FormControl(including('Backlinks'))
                    .find(Button('Remove'.toUpperCase()))
                    .click()
            )
            .step(TextField('Title').fillIn('foo'))
            .step(TextField('Teaser').fillIn('foo'))
            // NOTE This is hack to fill the contenteditable field
            .step(
                FormControl(including('Body'))
                    .find(HTML({ classList: some('ql-editor') }))
                    .perform(element => (element.innerText = 'foo'))
            )
            .step(wait(500))
            .step(Button('Save and Edit'.toUpperCase()).click())
            .assertion(
                FormControl(including('Backlinks')).has({
                    description: 'Required',
                })
            )
    )
    .child('login as admin', test =>
        test
            .step(logout())
            .step(login('admin', 'password'))
            .child('link author to post', test =>
                test
                    .step(Page().visit('/#/posts/create'))
                    .step(
                        FormControl('Authors')
                            .find(Button('Add'.toUpperCase()))
                            .click()
                    )
                    .child(
                        'should have a working array input with references',
                        test =>
                            test
                                .assertion(
                                    FormControl('Authors')
                                        .find(TextField('User'))
                                        .exists()
                                )
                                .assertion(
                                    FormControl('Authors')
                                        .find(Select('Authors[0].role'))
                                        .absent()
                                )
                    )
                    .child(
                        'should have a working array input with a scoped FormDataConsumer',
                        test =>
                            test
                                .step(
                                    FormControl('Authors')
                                        .find(TextField('User'))
                                        .fillIn('Annamarie Mayer')
                                )
                                .step(
                                    FormControl('Authors')
                                        .find(TextField('User'))
                                        .perform(element =>
                                            element.parentElement.click()
                                        )
                                )
                        // FIXME This doesn't work for some reason
                        // .step(
                        //     HTML({ id: 'downshift-0-menu' })
                        //         .find(MenuItem('Annamarie Mayer'))
                        //         .click()
                        // )
                        // .assertion(
                        //     FormControl('Authors')
                        //         .find(Select('Authors[0].role'))
                        //         .exists()
                        // )
                    )
            )
            .child(
                'should not reset the form value when switching tabs',
                test =>
                    test
                        .step(Page().visit('/#/users/create'))
                        .step(
                            TextField(including('Name')).fillIn(
                                'The real Slim Shady!'
                            )
                        )
                        .step(Tabs().click('Security'.toUpperCase()))
                        .step(Tabs().click('Summary'.toUpperCase()))
                // FIXME Doesn't work because of after we clear a value, it resets to the default one
                // .assertion(
                //     TextField(including('Name')).has({
                //         value: 'The real Slim Shady!',
                //     })
                // )
            )
    )
    .child('fill a new post', test =>
        test
            .step(TextField('Title').fillIn('Test title'))
            .child('fill rest of fields', test =>
                test
                    .step(TextField('Teaser').fillIn('Test teaser'))
                    // NOTE This is hack to fill the contenteditable field
                    .step(
                        FormControl(including('Body'))
                            .find(HTML({ classList: some('ql-editor') }))
                            .perform(
                                element => (element.innerText = 'Test body')
                            )
                    )
                    .step(wait(500))
                    .child(
                        'should redirect to edit page after create success',
                        test =>
                            test
                                .step(
                                    Button(
                                        'Save and Edit'.toUpperCase()
                                    ).click()
                                )
                                .assertion(
                                    Page().has({ url: including('#/posts/14') })
                                )
                                .assertion(
                                    TextField(including('Title')).has({
                                        value: 'Test title',
                                    })
                                )
                                .assertion(
                                    TextField(including('Teaser')).has({
                                        value: 'Test teaser',
                                    })
                                )
                                .child(
                                    'should show body in edit view after creating new post',
                                    test =>
                                        test
                                            .step(
                                                Tabs().click(
                                                    'Body'.toUpperCase()
                                                )
                                            )
                                            .assertion(
                                                HTML({
                                                    classList: some(
                                                        'ql-editor'
                                                    ),
                                                }).has({ text: 'Test body' })
                                            )
                                )
                    )
                    // FIXME BigTest doesn't have simulation for pressing enter key
                    // https://github.com/thefrontside/bigtest/issues/942
                    // .child(
                    //     'should redirect to edit page after submit on enter',
                    //     test =>
                    //         test
                    //             .step(
                    //                 HTML({
                    //                     className: 'simple-form',
                    //                 }).perform(element =>
                    //                     (element as HTMLFormElement).submit()
                    //                 )
                    //             )
                    //             .assertion(
                    //                 Page().has({ url: including('#/posts/14') })
                    //             )
                    //             .assertion(
                    //                 TextField(including('Title')).has({
                    //                     value: 'Test title',
                    //                 })
                    //             )
                    //             .assertion(
                    //                 TextField(including('Teaser')).has({
                    //                     value: 'Test teaser',
                    //                 })
                    //             )
                    // )
                    .child(
                        'should redirect to show page after create success with "Save and show"',
                        test =>
                            test
                                .step(
                                    Button(
                                        'Save and Show'.toUpperCase()
                                    ).click()
                                )
                                .assertion(
                                    Page().has({
                                        url: including('#/posts/14/show'),
                                    })
                                )
                    )
                    .child(
                        'should stay at create page after create success with "Save and add"',
                        test =>
                            test
                                .step(
                                    Button('Save and Add'.toUpperCase()).click()
                                )
                                .assertion(
                                    Page().has({
                                        url: including('#/posts/create'),
                                    })
                                )
                                .assertion(
                                    TextField(including('Title')).has({
                                        value: '',
                                    })
                                )
                    )
                    .child(
                        'should allow to call a custom action updating values before submit',
                        test =>
                            test
                                .step(Switch('Commentable').toggle())
                                .step(
                                    Button(
                                        'Save with Note'.toUpperCase()
                                    ).click()
                                )
                                .step(
                                    Tabs().click('Miscellaneous'.toUpperCase())
                                )
                                .assertion(HTML('10').exists())
                    )
            )
            .child('should not accept creation without required fields', test =>
                test
                    .step(Button('Save and Edit'.toUpperCase()).click())
                    .assertion(
                        TextField('Teaser').is({
                            description: 'Required field',
                        })
                    )
                    .assertion(
                        FormControl(including('Body')).has({
                            description: 'Required',
                        })
                    )
                    .child(
                        'should not show rich text input error message when form is submitted and input is filled with text',
                        test =>
                            test
                                // NOTE This is hack to fill the contenteditable field
                                .step(
                                    FormControl(including('Body'))
                                        .find(
                                            HTML({
                                                classList: some('ql-editor'),
                                            })
                                        )
                                        .perform(
                                            element =>
                                                (element.innerText =
                                                    'Test body')
                                        )
                                )
                                .step(wait(500))
                                .assertion(
                                    FormControl(including('Body')).has({
                                        description: '\u200b',
                                    })
                                )
                    )
            )
            .child(
                'should not reset form values when an input with defaultValue is dynamically added',
                test =>
                    test
                        .assertion(
                            TextField(including('Average note')).has({
                                value: '0',
                            })
                        )
                        .assertion(
                            TextField(including('Title')).has({
                                value: 'Test title',
                            })
                        )
            )
    );
