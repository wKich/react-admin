import { HTML, including } from '@bigtest/interactor';
import { test } from '@bigtest/suite';
import {
    TextField,
    FormControl,
    Button,
    Select,
    Dialog,
} from 'material-ui-interactors';
import { wait } from './helpers';
import { Page } from './interactors/page';

export default test('Custom Forms')
    .step(Page().visit('/#/comments/create'))
    .child('should allows to preview the selected post', test =>
        test
            .step(
                Select(including('Posts')).choose(
                    'Qui tempore rerum et voluptates'
                )
            )
            .step(Button('Show'.toUpperCase()).click())
            .assertion(
                Dialog('New post')
                    .find(FormControl('Title'))
                    .has({ text: including('Qui tempore rerum et voluptates') })
            )
            .assertion(
                Dialog('New post')
                    .find(FormControl('Teaser'))
                    .has({
                        text: including(
                            'Occaecati rem perferendis dolor aut numquam cupiditate. At tenetur dolores pariatur et libero asperiores porro voluptas. Officiis corporis sed eos repellendus perferendis distinctio hic consequatur.'
                        ),
                    })
            )
    )
    .child('should allows to create a new post', test =>
        test
            .step(Button('Create'.toUpperCase()).click())
            .step(
                Dialog('New post')
                    .find(TextField(including('Title')))
                    .fillIn('Bazinga!')
            )
            .step(
                Dialog('New post')
                    .find(TextField(including('Teaser')))
                    .fillIn('Bazingaaaaaaaa!')
            )
            .step(Dialog('New post').find(Button('Save'.toUpperCase())).click())
            .step(wait(1000))
            .assertion(Select(including('Posts')).has({ value: 'Bazinga!' }))
            .assertion(HTML({ id: 'post_id' }).has({ text: 'Bazinga!' }))
    );
