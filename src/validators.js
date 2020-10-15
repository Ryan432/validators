import aigle from 'aigle';
import _ from 'lodash';
import moment from 'moment';
import { ValidationError } from './Errors.js';

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const emailRegExPattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
const ipRegExPattern = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/;
const textAndNumberRegExPattern = /^[0-9a-zA-Z]+$/;

class Validators {
	static #processValidationErrors = (errors) => (_.size(errors) > 0 ? errors : { valid: true });

	static validateIp = async ({ keyValue, objectKey, options }) => {
		const validateIpErrors = [];
		if (!ipRegExPattern.test(keyValue)) {
			validateIpErrors.push({
				valid: false,
				message: `The property '${objectKey}' is invalid ip, got '${keyValue}'`
			});
		}

		if (options) {
			if (!_.includes(options, keyValue)) {
				validateIpErrors.push({
					valid: false,
					message: `The property '${objectKey}' can be only one of the options [${options.toString()}].`
				});
			}
		}

		return this.#processValidationErrors(validateIpErrors);
	};

	static validateArray = async ({ type, keyValue, objectKey, validArraySchema }) => {
		let validateArrayErrors = [];
		const isArray = _.isArray(keyValue);
		if (!isArray) {
			validateArrayErrors.push({
				valid: false,
				message: `The property '${objectKey}' data type is invalid required '${type}' got '${typeof keyValue}'.`
			});
		}

		if (validArraySchema && _.size(keyValue) > 0) {
			const { type } = validArraySchema;
			await aigle.each(keyValue, async (iterator, index) => {
				const { objectSchema } = validArraySchema;
				if (type === 'object') {
					try {
						const { allowSchemaKeysOnly = true } = objectSchema;
						delete objectSchema.allowSchemaKeysOnly;
						// if the iterator is an object to needs to validate object, if not, validate the iterator only.
						await this.objectValidator(iterator, objectSchema, undefined, allowSchemaKeysOnly);
					} catch (err) {
						const { extraDetails } = err;
						const { validationErrors } = extraDetails;
						validateArrayErrors = [...validateArrayErrors, ...validationErrors];
					}
				} else {
					const { type } = validArraySchema;
					const schema = {};
					const valueToValidate = {};
					schema[index] = validArraySchema;
					valueToValidate[index] = iterator;

					try {
						await this.objectValidator(valueToValidate, schema);
					} catch (err) {
						validateArrayErrors.push({
							valid: false,
							message: `The property '${objectKey}' is invalid '${type}' at index '${index}', got '${iterator}'`
						});
					}
				}
			});
		}
		return this.#processValidationErrors(validateArrayErrors);
	};

	static validateDate = async ({ objectKey, keyValue, type, format }) => {
		const validFormat = moment(keyValue, format).format(format) === keyValue;
		if (!validFormat) {
			return {
				valid: false,
				message: `The property '${objectKey}' data type is invalid required '${type}' in format '${format}' got '${keyValue}.'`
			};
		}

		return {
			valid: true
		};
	};

	static validateNumber = async ({ keyValue, type, objectKey, minNum, maxNum, numRange, options }) => {
		const validateNumberErrors = [];
		let isNumber = Number(keyValue);
		isNumber = isNumber === 0 ? true : isNumber;

		if (numRange) {
			if ((!_.isArray(numRange) && _.size(numRange) > 2) || _.size(numRange) < 2) {
				throw new ValidationError({
					message: 'numRange should be an array with 2 values, for example: ["minimum", "maximum"].',
					extraDetails: { keyValue, type, objectKey, minNum, maxNum, numRange, options }
				});
			}

			const [min, max] = numRange;
			if (keyValue <= min || keyValue > max) {
				validateNumberErrors.push({
					valid: false,
					message: `The property '${objectKey}' as number range between ${min} to ${max}, got '${keyValue}'.`
				});
			}
		}

		if (!isNumber) {
			validateNumberErrors.push({
				valid: false,
				message: `The property '${objectKey}' data type is invalid required '${type}'.`
			});
		}

		if (minNum) {
			if (keyValue < minNum) {
				validateNumberErrors.push({
					valid: false,
					message: `The property '${objectKey}' as minimum number of ${minNum}, got '${keyValue}'.`
				});
			}
		}

		if (maxNum) {
			if (keyValue > maxNum) {
				validateNumberErrors.push({
					valid: false,
					message: `The property '${objectKey}' as maximum number of ${maxNum}, got '${keyValue}'.`
				});
			}
		}

		if (options) {
			if (!_.includes(options, keyValue)) {
				validateNumberErrors.push({
					valid: false,
					message: `The property '${objectKey}' can be only one of the options ${options.toString()}.`
				});
			}
		}

		return this.#processValidationErrors(validateNumberErrors);
	};

	static validateJSTypes = async ({ keyValue, objectKey, type }) => {
		const typeOfValue = typeof keyValue;
		if (typeOfValue !== type) {
			return {
				valid: false,
				message: `The property '${objectKey}' data type is invalid, required '${type}' got '${typeOfValue}'`
			};
		}

		return {
			valid: true
		};
	};

	static validateString = async ({ keyValue, type, objectKey, minLength, maxLength, options, isEmail, textAndNumbers }) => {
		const validateStringErrors = [];
		const typeOfValue = typeof keyValue;

		if (typeOfValue !== 'string') {
			validateStringErrors.push({
				valid: false,
				message: `The property '${objectKey}' data type is invalid, required '${type}' got '${keyValue}' ['${typeOfValue}'].`
			});
		}

		if (minLength) {
			const valueLength = _.size(keyValue);
			if (valueLength < minLength) {
				validateStringErrors.push({
					valid: false,
					message: `The property '${objectKey}' as minimum length of ${minLength}, got ${valueLength} length.`
				});
			}
		}

		if (maxLength) {
			const valueLength = _.size(keyValue);
			if (valueLength > maxLength) {
				validateStringErrors.push({
					valid: false,
					message: `The property '${objectKey}' as maximum length of ${maxLength}, got ${valueLength} length.`
				});
			}
		}

		if (options) {
			if (!_.includes(options, keyValue)) {
				validateStringErrors.push({
					valid: false,
					message: `The property '${objectKey}' can be only one of the options [${options.toString()}].`
				});
			}
		}

		if (isEmail) {
			if (!emailRegExPattern.test(keyValue)) {
				validateStringErrors.push({
					valid: false,
					message: `The property '${objectKey}' is invalid email, got '${keyValue}'.`
				});
			}
		}

		if (textAndNumbers) {
			if (!textAndNumberRegExPattern.test(keyValue)) {
				validateStringErrors.push({
					valid: false,
					message: `The property '${objectKey}' is string with text and numbers ONLY, got '${keyValue}'.`
				});
			}
		}

		return this.#processValidationErrors(validateStringErrors);
	};

	static validateObject = async ({ objectKey, keyValue, type, objectSchema }) => {
		const validationObjectErrors = [];
		const isObject = _.isPlainObject(keyValue);
		if (!isObject) {
			validationObjectErrors.push({
				valid: false,
				message: `The property '${objectKey}' data type is invalid required ${type}.'`
			});
		}

		if (objectSchema) {
			try {
				const { allowSchemaKeysOnly = true } = objectSchema;
				delete objectSchema.allowSchemaKeysOnly;

				await this.objectValidator(keyValue, objectSchema, undefined, allowSchemaKeysOnly);
			} catch (err) {
				const { extraDetails } = err;
				const { validationErrors } = extraDetails;
				await aigle.each(validationErrors, (validatorError) => {
					const { isRequired, keyName, schemaAllowedKeys } = validatorError;
					if (isRequired) {
						validationObjectErrors.push({
							valid: false,
							message: `The property '${objectKey}', required a property of '${keyName}' and it's missing.`
						});
					}

					if (schemaAllowedKeys) {
						const { key } = validatorError;
						validationObjectErrors.push({
							valid: false,
							message: `The property '${key}' is not a part of the object schema of '${objectKey}'.`,
							schemaAllowedKeys
						});
					}

					if (!isRequired && !schemaAllowedKeys) {
						validationObjectErrors.push(validatorError);
					}
				});
			}
		}

		return this.#processValidationErrors(validationObjectErrors);
	};

	static objectValidator = async (objectToValidate, validObjectSchema, request, allowSchemaKeysOnly = true) => {
		if (!validObjectSchema) {
			throw new ValidationError('Not provided validObjectSchema.');
		}

		const validObjectKeys = Object.keys(validObjectSchema);
		let validationErrors = [];

		await aigle.eachLimit(validObjectKeys, 5, async (objectKey, index) => {
			const { type, required } = validObjectSchema[objectKey];
			const keyValue = _.get(objectToValidate, objectKey, 'NotFound');
			if (keyValue === 'NotFound' && required) {
				validationErrors.push({
					valid: false,
					message: `The property ${objectKey} is required and it's missing.`,
					isRequired: true,
					keyName: objectKey
				});
			}
			if (keyValue !== 'NotFound') {
				switch (type) {
					case 'array':
						{
							const { validArraySchema } = validObjectSchema[objectKey];
							const validateArray = await this.validateArray({ type, keyValue, objectKey, validArraySchema });
							if (!validateArray.valid) {
								validationErrors = [...validationErrors, ...validateArray];
							}
						}
						break;

					case 'date':
						{
							const { format } = validObjectSchema[objectKey];
							const validDate = await this.validateDate({ objectKey, keyValue, type, format });
							if (!validDate.valid) {
								validationErrors.push(validDate);
							}
						}
						break;

					case 'number':
						{
							const { minNum, maxNum, numRange, options } = validObjectSchema[objectKey];
							const validateNumber = await this.validateNumber({ keyValue, type, objectKey, minNum, maxNum, numRange, options });
							if (!validateNumber.valid) {
								validationErrors = [...validationErrors, ...validateNumber];
								validationErrors.push({
									valid: false,
									message: `The property '${objectKey}' data type is invalid required ${type}.'`
								});
							}
						}
						break;

					case 'string':
						{
							const { minLength, maxLength, options, isEmail, textAndNumbers } = validObjectSchema[objectKey];

							const validateString = await this.validateString({ keyValue, type, objectKey, minLength, maxLength, options, isEmail, textAndNumbers });
							if (!validateString.valid) {
								validationErrors = [...validationErrors, ...validateString];
							}
						}
						break;

					case 'object':
						{
							const { objectSchema } = validObjectSchema[objectKey];
							const validateObject = await this.validateObject({ objectKey, keyValue, type, objectSchema });

							if (!validateObject.valid) {
								validationErrors = [...validationErrors, ...validateObject];
							}
						}
						break;

					case 'ip':
						{
							const { options } = validObjectSchema[objectKey];
							const validateIp = await this.validateIp({ keyValue, objectKey, options });
							if (!validateIp.valid) {
								validationErrors = [...validationErrors, ...validateIp];
							}
						}
						break;
					default:
						{
							const validateJSType = await this.validateJSTypes({ keyValue, objectKey, type });
							if (!validateJSType.valid) {
								validationErrors.push(validateJSType);
							}
						}
						break;
				}
			}
		});

		if (allowSchemaKeysOnly) {
			const objectToValidateKeys = Object.keys(objectToValidate);
			await aigle.eachLimit(objectToValidateKeys, 5, (key) => {
				const keyIsAllowed = _.includes(validObjectKeys, key);
				if (!keyIsAllowed) {
					validationErrors.push({
						valid: false,
						message: `The property '${key}' is not a part of the object schema.`,
						schemaAllowedKeys: validObjectKeys,
						key
					});
				}
			});
		}

		const isObjectValid = _.size(validationErrors) === 0 || false;
		if (!isObjectValid) {
			throw new ValidationError({
				extraDetails: {
					validationErrors,
					validObjectSchema
				},
				request
			});
		}

		return {
			valid: true
		};
	};

	static email = ({ required = false } = {}) => {
		return { type: 'string', isEmail: true, required };
	};

	static username = ({ required = false, minNum = 5, textAndNumbers = true } = {}) => {
		return { type: 'string', minNum, required, textAndNumbers };
	};

	static date = ({ required = false, format = DATE_TIME_FORMAT } = {}) => {
		return { type: 'date', format, required };
	};

	static id = ({ required = false } = {}) => {
		return { type: 'number', minNum: 1, required };
	};

	static number = ({ required, minNum, maxNum, numRange, options } = {}) => {
		return { type: 'number', required, minNum, maxNum, numRange, options };
	};

	static string = ({ required, minLength, maxLength, options, isEmail } = {}) => {
		return { type: 'string', required, minLength, maxLength, options, isEmail };
	};

	static ip = ({ required = false, options = [] } = {}) => {
		const schema = {
			type: 'ip',
			required,
			options
		};
		if (_.size(options) <= 0) {
			delete schema.options;
		}

		return schema;
	};

	static object = ({ required = false, objectSchema = {} } = {}) => {
		const schema = {
			type: 'object',
			required,
			objectSchema
		};
		if (objectSchema === {} && _.size(objectSchema <= 0)) {
			delete schema.objectSchema;
		}

		return schema;
	};

	static array = ({ validArraySchema = {} } = {}) => {
		const schema = { type: 'array', validArraySchema };

		if (validArraySchema === {} && _.size(validArraySchema) <= 0) {
			delete schema.validArraySchema;
		}
		return schema;
	};
}

export default Validators;
