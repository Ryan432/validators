import aigle from 'aigle';
import _ from 'lodash';
import moment from 'moment';

const emailRegExPattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

class Validators {
	static validateObject = async (objectToValidate, validObjectSchema, allowSchemaKeysOnly = true) => {
		const validObjectKeys = Object.keys(validObjectSchema);

		const validationErrors = [];

		await aigle.eachLimit(validObjectKeys, 5, async (objectKey) => {
			const { type, required } = validObjectSchema[objectKey];
			const keyValue = _.get(objectToValidate, objectKey, 'NotFound');

			if (keyValue === 'NotFound' && required) {
				validationErrors.push({
					valid: false,
					message: `The property ${objectKey} is required and it's missing.`
				});
			}

			switch (type) {
				case 'array':
					{
						const { validateArrayObjectsSchema } = validObjectSchema[objectKey];
						const isArray = _.isArray(keyValue);
						if (!isArray) {
							validationErrors.push({
								valid: false,
								message: `The property ${objectKey} data type is invalid required ${type} got ${typeof keyValue}`
							});
						}

						if (validateArrayObjectsSchema) {
							await aigle.eachLimit(keyValue, 5, async (obj, index) => {
								const validatedObjects = await this.validateObject(obj, validateArrayObjectsSchema);

								if (!_.get(validatedObjects, 'valid')) {
									validationErrors.push({
										valid: false,
										message: `Array object of ${objectKey} is invalid at index ${index}`,
										data: validatedObjects
									});
								}
							});
						}
					}
					break;

				case 'date':
					{
						const { format } = validObjectSchema[objectKey];
						const validFormat = moment(keyValue, format).format(format) === keyValue;
						if (!validFormat) {
							validationErrors.push({
								valid: false,
								message: `The property ${objectKey} data type is invalid required ${type} in format '${format}' got '${keyValue}.'`
							});
						}
					}
					break;

				case 'number':
					{
						let isNumber = Number(keyValue);
						isNumber = isNumber === 0 ? true : isNumber;
						if (!isNumber) {
							validationErrors.push({
								valid: false,
								message: `The property ${objectKey} data type is invalid required ${type}.'`
							});
						}
					}
					break;
				default:
					{
						let keyValueType = typeof keyValue;
						if (keyValueType !== type) {
							validationErrors.push({
								valid: false,
								message: `The property ${objectKey} data type is invalid, required ${type} got ${keyValueType}`
							});
						}
					}
					break;
			}

			const { minLength, maxLength, minNum, numRange, options, isEmail } = validObjectSchema[objectKey];

			if (minLength) {
				const valueLength = _.size(keyValue);
				if (valueLength < minLength) {
					validationErrors.push({
						valid: false,
						message: `The property ${objectKey} as minimum length of ${minLength}, got ${valueLength} length.`
					});
				}
			}

			if (maxLength) {
				const valueLength = _.size(keyValue);
				if (valueLength > maxLength) {
					validationErrors.push({
						valid: false,
						message: `The property ${objectKey} as maximum length of ${maxLength}, got ${valueLength} length.`
					});
				}
			}

			if (minNum) {
				if (keyValue < minNum) {
					validationErrors.push({
						valid: false,
						message: `The property ${objectKey} as minimum number of ${minNum}, got ${keyValue}.`
					});
				}
			}

			if (numRange) {
				if ((!_.isArray(numRange) && _.size(numRange) > 2) || _.size(numRange) < 2) {
					throw new Error(`numRange should be an array with 2 values, for example: ['minimum', 'maximum'].`);
				}
				const [min, max] = numRange;

				if (keyValue <= min || keyValue > max) {
					validationErrors.push({
						valid: false,
						message: `The property ${objectKey} as number range between ${min} to ${max}, got ${keyValue}.`
					});
				}
			}

			if (options) {
				if (!options.includes(keyValue)) {
					validationErrors.push({
						valid: false,
						message: `The property ${objectKey} can be only one of the options ${options.toString()}.`
					});
				}
			}

			if (isEmail) {
				if (!emailRegExPattern.test(keyValue)) {
					validationErrors.push({
						valid: false,
						message: `The property ${objectKey} is invalid email, got ${keyValue}`
					});
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
						message: `The property ${key} is not a part of the object schema.`,
						schemaAllowedKeys: validObjectKeys
					});
				}
			});
		}

		const isObjectValid = _.size(validationErrors) === 0 ? true : false;
		if (!isObjectValid) {
			return {
				validationErrors,
				validObjectSchema
			};
		}
		return {
			valid: true
		};
	};
}

export default Validators;
