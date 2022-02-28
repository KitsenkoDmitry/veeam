import cn from 'classnames';
import toast, { Toaster } from 'react-hot-toast';
import { useState, HTMLAttributes, Fragment } from 'react';
import { Formik, Field, Form } from 'formik';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import './App.css';

type Values = {
    config: string;
};

type FieldType = 'number' | 'text' | 'textarea' | 'checkbox' | 'date' | 'radio';

type FormConfig = {
    title?: string;
    buttons?: HTMLAttributes<HTMLButtonElement>[];
    items?: {
        type: FieldType;
        name: string;
        label?: string;
        items?: { value: string; label: string }[];
    }[];
};

const hasItems = (config: unknown): config is FormConfig => {
    return Array.isArray((config as FormConfig).items);
};

function App() {
    const [rawConfg, setRawConfig] = useState('');

    const config: FormConfig | null = rawConfg ? JSON.parse(rawConfg) : null;

    return (
        <main className="app">
            <Toaster />
            <h1 className="visually-hidden">Test for veeam</h1>
            <div className="app__content">
                <Tabs>
                    <TabList>
                        <Tab>Config</Tab>
                        <Tab>Result</Tab>
                    </TabList>
                    <TabPanel>
                        <h2 className="visually-hidden">Form config</h2>
                        <Formik
                            initialValues={{ config: rawConfg }}
                            onSubmit={({ config }: Values) => {
                                setRawConfig(config);
                                toast.success('Form was successfully generated. See `result` tab');
                            }}
                            validate={({ config }) => {
                                const errors: Partial<Values> = {};
                                let parsed: unknown = null;
                                if (!config) {
                                    errors.config = 'Required field';
                                } else {
                                    try {
                                        parsed = JSON.parse(config);
                                    } catch {
                                        errors.config = 'Uncorrect JSON';
                                    }
                                }
                                if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                                    errors.config =
                                        'Wrong data: must be an object with keys `title`, `buttons`, `items`';
                                } else {
                                    if (!Object.keys(parsed).some(key => ['title', 'buttons', 'items'].includes(key))) {
                                        errors.config = 'Wrong data: accept only `title`, `buttons`, `items` keys';
                                    } else if (
                                        hasItems(parsed) &&
                                        parsed.items?.some(({ type }) => {
                                            return ![
                                                'number',
                                                'text',
                                                'textarea',
                                                'checkbox',
                                                'date',
                                                'radio',
                                            ].includes(type);
                                        })
                                    ) {
                                        errors.config =
                                            'Wrong data: `items.type` can only be one of `number`, `text`, `textarea`, `checkbox`, `date`, `radio`';
                                    }
                                }

                                return errors;
                            }}
                        >
                            {({ errors, touched }) => {
                                return (
                                    <Form className="app__config">
                                        <label htmlFor="config" className="visually-hidden">
                                            Enter your config
                                        </label>

                                        <Field
                                            id="config"
                                            name="config"
                                            as="textarea"
                                            className={cn('app__config-textarea', {
                                                'app__config-textarea--error': errors.config && touched.config,
                                            })}
                                            rows={10}
                                            placeholder="Enter config in JSON format"
                                        />
                                        {errors.config && touched.config && <p className="error">{errors.config}</p>}

                                        <div className="app__config-controls">
                                            <button type="submit">Apply</button>
                                        </div>
                                    </Form>
                                );
                            }}
                        </Formik>
                    </TabPanel>
                    <TabPanel>
                        <h2 className="visually-hidden">Form result</h2>
                        {config ? (
                            <Formik
                                initialValues={
                                    config.items?.reduce((acc, val) => {
                                        acc[val.name] = '';
                                        return acc;
                                    }, {} as Record<string, string>) || {}
                                }
                                onSubmit={vals => alert(JSON.stringify(vals))}
                                enableReinitialize
                            >
                                <Form>
                                    {config.title && <h3>{config.title}</h3>}
                                    <ul className="form-fields">
                                        {config.items &&
                                            config.items.length > 0 &&
                                            config.items.map(item => (
                                                <li key={item.name + item.label} className="form-field">
                                                    {item.type === 'radio' ? (
                                                        item.items?.map(radio => (
                                                            <Fragment key={radio.label}>
                                                                <label htmlFor={radio.label}>{radio.label}</label>{' '}
                                                                <Field
                                                                    id={radio.label}
                                                                    name={item.name}
                                                                    type="radio"
                                                                    value={radio.value}
                                                                />
                                                            </Fragment>
                                                        ))
                                                    ) : (
                                                        <>
                                                            <label htmlFor={item.name}>{item.label}</label>{' '}
                                                            <Field
                                                                id={item.name}
                                                                name={item.name}
                                                                type={item.type !== 'textarea' ? item.type : undefined}
                                                                as={item.type === 'textarea' ? 'textarea' : undefined}
                                                            />
                                                        </>
                                                    )}
                                                </li>
                                            ))}
                                    </ul>

                                    {config.buttons && config.buttons.length > 0 && (
                                        <div className="app__config-controls">
                                            {config.buttons.map((props, index) => (
                                                <button key={index} {...props} />
                                            ))}
                                        </div>
                                    )}
                                </Form>
                            </Formik>
                        ) : (
                            <p>Fill data in config tab</p>
                        )}
                    </TabPanel>
                </Tabs>
            </div>
            <pre>
                <code>
                    {`      Form generator data example
        {
          "title":"Form title",
          "items":[
            {"label":"Number","name":"number","type":"number"},
            {"label":"Text","name":"text","type":"text"},
            {"label":"Textarea","name":"textarea","type":"textarea"},
            {"label":"Checkbox","name":"checkbox","type":"checkbox"},
            {"label":"Date","name":"date","type":"date"},
            {"type":"radio","name":"radio","items":[
              {"label":"item-1","value":"1"},
              {"label":"item-2","value":"2"}]
            }
          ],
          "buttons":[
            {"children":"Reset","type":"reset"},
            {"children":"Apply","type":"submit"}
          ]
        }`}
                </code>
            </pre>
        </main>
    );
}

export default App;
