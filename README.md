# Validators:

### Global options:

1. required - true / false
   Every object key defecation can be required, by default is false.
2. type - For any validations need to provide type of validation, example: number, string etc..

### Example:

```js
{
	"name": {
		"type": "string",
		"required": true
	}
}
```

---

# Types and available options for each type:

-   All JS types are supported, if types are not listed bellow they have a regular validation of JS with '`typeof`' method.

---

## Strings

All available properties for string values:

1. minLength - represent the minimum length of the string value. [OPTIONAL]
2. maxLength - represent the maximum length of the string value. [OPTIONAL]
3. options - an array of options that the string can be. [OPTIONAL]
4. isEmail - is the string is email? true / false. the email format is `someEmail@domain.co`. [OPTIONAL]
5. textAndNumbers - allow only text and number in the string, numbers from [1-9] and characters [a-z, A-Z]

### Example:

```js
{
	"userType": {
		"type": "string",
		"minLength": 5,
		"maxLength": 15,
		"options": [
			"type1",
			"type2",
			"type3"
		],
		"textAndNumbers": true
	}
}
```

Means the "userType" property must be a string text and number ONLY,
not less then 5 length, not higher the 15 length and ONLY one of the options 'type1', 'type2', 'type3'.

---

## Numbers

All available properties for number values:

1. minNum - represent the minimum number of the number value.[OPTIONAL]
2. maxNum - represent the maximum number of the number value.[OPTIONAL]
3. numRange - represent range that the number can be in between. [OPTIONAL]
4. options - an array of options that the number can be [OPTIONAL]

### Example:

```js
{
	"age": {
		"type": "number",
		"minNum": 10,
		"maxNum": 20,
		"numRange": [10,20]
	}
}
```

Means the "age" property can must be a number, not less then 10 not higher then 20 and between the range 10,20.

## Ips

All available properties for ip values:

1. options - an array of options that the ip can be [OPTIONAL]

### Example:

```js
{
	"ip": {
		"type": "ip",
		"options": [
			"127.0.0.1",
			"0.0.0.0"
		]
	}
}
```

Means the "ip" property needs to be a valid ip and ONLY one of the options "127.0.0.1", "0.0.0.0".

## Dates

All available properties for date values:

1. format - represent the format that the date should be, reference to `moment.js` formats.[REQUIRED]

## Example:

```js
{
	"today": {
		"type": "date",
		"format": "YYYY-MM-DD HH:mm:ss"
	}
}
```

Means the "today" property can be only a date in format "YYYY-MM-DD HH:mm:ss".

## Objects

All available properties for date values:

1. objectSchema - Every object value can have a 'objectSchema' property to validate, in other word nested objects, the objectSchema accept all the validationObjects syntax.

## Example:

```js
{
	"phone": {
		"type": "object",
		"required": true,
		"objectSchema": {
			"name": {
				"type": "string",
				"required": true
			},
			"number": {
				"type": "number",
				"required": true
			}
		}
	}
}
```

Means the "phone" property must be defined and must be an object,
the object of "phone" must contain the properties "name" and "number",
"name" - must be defined and to be a string.
"number" - must be defined and to be a number.

It's possible to validate nested object properties, just defined them properly.

---

## Arrays

All available properties for array values:

1. validArraySchema - represent the types of values of the array.

-   NOTE: if the values of the array is an objects, you must provide a "type": "object" and "objectSchema", look at the example bellow for reference.

## Example:

```js
{
	"ips": {
		"type": "array",
		"required": true,
		"validArraySchema": {
			"type": "object",
			"objectSchema": {
				"name": {
					"type": "string",
					"minLength": 5,
					"textAndNumbers": true,
					"required": true
				},
				"ip": {
					"type": "ip",
					"required": true
				}
			}
		}
	}
}
```

Means the "ips" property must be defined and must be an array,
the values of the array must be an objects, and every object must have "name" and "ip" properties.
The "name" property must be defined, string, text and numbers only and minimum 5 length.
The "ip" property must be defined and to be a valid ip address.

It's possible to validate nested objects inside the array and every value inside the array, just defined them properly.

---

# Methods

## Build Schemas Helpers

#### Use the intellisense of the functions carefully - it will help you a lot!

---

#### Return Email schema:

##### Example:

```js
Validators.email({require: true})

// Will return
{
	"type": "string",
	"isEmail": true,
	"required": true
}

```

---

#### Return Username schema:

##### Example:

```js
Validators.username({ required: true })

// Will return
{
    "type": "string",
    "minNum": 5,
    "required": true,
    "textAndNumbers": true
}

```

---

#### Return Date schema:

##### Example:

```js
Validators.date({ required: true })

// Will return
{
    "type": "date",
    "format": "YYYY-MM-DD HH:mm:ss",
    "required": false
}

```

---

#### Return Id schema:

##### Example:

```js
Validators.id()

// Will return
{
    "type": "number",
    "minNum": 1,
    "required": false
}
```

---

#### Return Number schema:

##### Example:

```js
Validators.number({required: true, minNum: 1, maxNum: 10})

// Will return
{
    "type": "number",
    "required": true,
    "minNum": 1,
    "maxNum": 10
}
```

---

#### Return String schema:

##### Example:

```js
Validators.string({ required: true, minLength: 5 })


// Will return
{
    "type": "string",
    "required": true,
    "minLength": 5
}
```

---

#### Return Ip schema:

##### Example:

```js
Validators.ip({ required: true, options: ['127.0.0.1', '127.0.1.1'] })


// Will return
{
    "type": "ip",
    "required": true,
    "options": [
        "127.0.0.1",
        "127.0.1.1"
    ]
}
```

---

#### Return Object schema:

##### Example:

```js
Validators.object({
			required: true,
			objectSchema: {
				id: Validators.id({ required: true }),
				name: Validators.string({ required: true })
			}
		})


// Will return
{
	"type": "object",
	"required": true,
	"objectSchema": {
		"id": {
			"type": "number",
			"minNum": 1,
			"required": true
		},
		"name": {
			"type": "string",
			"required": true
		}
	}
}
```

---

#### Return Array schema:

##### Example:

```js
Validators.array({
			validArraySchema: {
				type: 'object',
				objectSchema: {
					id: Validators.id({ required: true }),
					name: Validators.string({ required: true })
				}
			}
		})


// Will return
{
	"type": "array",
	"validArraySchema": {
		"type": "object",
		"objectSchema": {
			"id": {
				"type": "number",
				"minNum": 1,
				"required": true
			},
			"name": {
				"type": "string",
				"required": true
			}
		}
	}
}
```

---

# Validate functions

#### Return validation errors or valid: true for valid value, use use the intellisense.

### Validate Ip

```js
Validators.validateIp({ keyValue, objectKey, options });
```

### Validate Array

```js
Validators.validateArray({ type, keyValue, objectKey, validArraySchema });
```

### Validate Date

```js
Validators.validateDate({ objectKey, keyValue, type, format });
```

### Validate Number

```js
Validators.validateNumber({ keyValue, type, objectKey, minNum, maxNum, numRange, options });
```

### Validate String

```js
Validators.validateString({ keyValue, type, objectKey, minLength, maxLength, options, isEmail, textAndNumbers });
```

### Validate JS types - All that doesn't have a special handling by the class.

```js
Validators.validateJSTypes({ keyValue, objectKey, type });
```

### Validate Object

```js
Validators.validateObject({ objectKey, keyValue, type, objectSchema });
```

# Object Validator

### Use to validate an object.

### Use case example:

```js
const validationTest = async () => {
	const objectToValidate = {
		id: 10,
		email: 'ryan@utopia.com',
		username: 'Ryan432',
		date: '2020-10-15 18:05:00',
		number: 5,
		string: 'min length 4',
		ip: '127.0.0.1',
		object: {
			id: 10,
			name: 'object name'
		},
		array: [
			{
				id: 10,
				name: 'array object'
			}
		]
	};

	const validObject = {
		id: Validators.id(),
		email: Validators.email({ required: true }),
		username: Validators.username({ required: true }),
		date: Validators.date(),
		number: Validators.number({ required: true, minNum: 1, maxNum: 10 }),
		string: Validators.string({ required: true, minLength: 5 }),
		ip: Validators.ip({ required: true, options: ['127.0.0.1', '127.0.1.1'] }),
		object: Validators.object({
			required: true,
			objectSchema: {
				id: Validators.id({ required: true }),
				name: Validators.string({ required: true })
			}
		}),
		array: Validators.array({
			validArraySchema: {
				type: 'object',
				objectSchema: {
					id: Validators.id({ required: true }),
					name: Validators.string({ required: true })
				}
			}
		})
	};

	try {
		const validationRes = await Validators.objectValidator(objectToValidate, validObject);
		console.log(validationRes);
	} catch (err) {
		console.log(JSON.stringify({ err }, 2, 5));
	}
};

validationTest();
```

## Success Result - Means all the validations passed successfully, the object is valid based on the schema provided.

```js
// validationRes
{
	valid: true;
}
```

## Failed Results - Return ValidationError

```js
{
	"err": {
		"username": "system",
		"extraDetails": {
			//Inside the validationErrors you have very specific error about the failures.
			"validationErrors": [
				{
					"valid": false,
					"message": "The property 'email' is invalid email, got 'ryan@utopia'."
				},
				{
					"valid": false,
					"message": "The property 'ip' can be only one of the options [127.0.0.1,127.0.1.1]."
				}
			],
			//The valid object schema.
			"validObjectSchema": {
				"id": {
					"type": "number",
					"minNum": 1,
					"required": false
				},
				"email": {
					"type": "string",
					"isEmail": true,
					"required": true
				},
				"username": {
					"type": "string",
					"minNum": 5,
					"required": true,
					"textAndNumbers": true
				},
				"date": {
					"type": "date",
					"format": "YYYY-MM-DD HH:mm:ss",
					"required": false
				},
				"number": {
					"type": "number",
					"required": true,
					"minNum": 1,
					"maxNum": 10
				},
				"string": {
					"type": "string",
					"required": true,
					"minLength": 5
				},
				"ip": {
					"type": "ip",
					"required": true,
					"options": [
						"127.0.0.1",
						"127.0.1.1"
					]
				},
				"object": {
					"type": "object",
					"required": true,
					"objectSchema": {
						"id": {
							"type": "number",
							"minNum": 1,
							"required": true
						},
						"name": {
							"type": "string",
							"required": true
						}
					}
				},
				"array": {
					"type": "array",
					"validArraySchema": {
						"type": "object",
						"objectSchema": {
							"id": {
								"type": "number",
								"minNum": 1,
								"required": true
							},
							"name": {
								"type": "string",
								"required": true
							}
						}
					}
				}
			}
		},
		"stackTrace": "Error\n    at Function.objectValidator (file:///_dirname/backend/src/shared/Validators.js:426:10)"
	}
}

```
