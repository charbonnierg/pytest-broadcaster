# Code Generation

[JSON Schemas](https://github.com/charbonnierg/pytest-broadcaster/blob/main/schemas) are provided for the data models.

They can be used to generate code in various languages:

=== "Python Dataclasses"

    It' possible to generate Python dataclasses from the JSON Schemas:

    First clone the repository:

    ```bash
    git clone https://github.com/charbonnierg/pytest-broadcaster
    cd pytest-broadcaster
    ```

    Then install `datamodel-code-generator`:

    ```bash
    pip install --user datamodel-code-generator
    ```

    Then generate the code:

    ```bash
    datamodel-codegen \
        --input schemas/ \
        --output models/ \
        --input-file-type jsonschema \
        --disable-timestamp \
        --output-model-type=dataclasses.dataclass \
        --use-field-description \
        --use-schema-description
    ```

    The generated code will be in the `models` directory.

=== "Python Pydantic (v2)"

    It' possible to generate Pydantic BaseModel classes from the JSON Schemas:

        First clone the repository:

    ```bash
    git clone https://github.com/charbonnierg/pytest-broadcaster
    cd pytest-broadcaster
    ```

    Then install `datamodel-code-generator`:

    ```bash
    pip install --user datamodel-code-generator
    ```

    Then generate the code:

    ```bash
    datamodel-codegen \
        --input schemas/ \
        --output models/ \
        --input-file-type jsonschema \
        --disable-timestamp \
        --output-model-type=pydantic_v2.BaseModel \
        --use-field-description \
        --use-schema-description
    ```

    The generated code will be in the `models` directory.

=== "Python Pydantic (v1)"

    It' possible to generate Pydantic BaseModel classes from the JSON Schemas:

    First clone the repository:

    ```bash
    git clone https://github.com/charbonnierg/pytest-broadcaster
    cd pytest-broadcaster
    ```

    Then install `datamodel-code-generator`:

    ```bash
    pip install --user datamodel-code-generator
    ```

    Then generate the code:

    ```bash
    datamodel-codegen \
        --input schemas/ \
        --output models/ \
        --input-file-type jsonschema \
        --disable-timestamp \
        --output-model-type=pydantic_v1.BaseModel \
        --use-field-description \
        --use-schema-description
    ```

    The generated code will be in the `models/` directory.


=== "Typescript `.d.ts`"

    It's possible to generate `.d.ts` files for Typescript:

    First clone the repository:

    ```bash
    git clone https://github.com/charbonnierg/pytest-broadcaster
    cd pytest-broadcaster
    ```

    Then install `json-schema-to-typescript`:

    ```bash
    npm install -g json-schema-to-typescript
    ```

    Then generate the code:

    ```bash
    json2ts -i schemas/ -o types/
    ```

    The generated code will be in the `types/` directory.