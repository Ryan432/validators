import tests from '../tests.js';
import aigle from 'aigle';
import _ from 'lodash';

class Validators {
	static validateObject = async (objectToValidate, validObjectSchema) => {
		const validObjectKeys = Object.keys(validObjectSchema);

		const validationResult = [];

		await aigle.eachLimit(validObjectKeys, 5, async (objectKey) => {
			const keyValue = _.get(objectToValidate, objectKey, 'NotFound');
			const { type, required, minLength, maxLength, minNum, numRange, options, isEmail } = validObjectSchema[objectKey];

			if (keyValue === 'NotFound' && required) {
				validationResult.push({
					valid: false,
					message: `${objectKey} is required and it's missing.`
				});
			}
		});
	};
}

async function validateRequiredAndTypes(data, validKeysAndTypes) {
	const validKeys = Object.keys(validKeysAndTypes);

	const res = [];

	await aigle.eachLimit(validKeys, 5, async (key) => {
		const val = _.get(data, key, 'default');

		if (val !== 'default') {
			if (validKeysAndTypes[key].type === 'array') {
				const isArray = _.isArray(val);
				if (!isArray) {
					res.push({
						valid: false,
						message: `${key} data type is invalid required ${validKeysAndTypes[key].type} got ${typeof val}`
					});
				}

				if (_.has(validKeysAndTypes[key], 'validArrayObjects')) {
					await aigle.eachLimit(val, 10, async (obj, index) => {
						const validatedObjects = await validateModifier(obj, validKeysAndTypes[key].validArrayObjects);

						if (!_.get(validatedObjects, 'valid')) {
							res.push({
								valid: false,
								message: `Array object of ${key} is invalid at index ${index}`,
								data: validatedObjects
							});
						}
					});
				}
			} else if (validKeysAndTypes[key].type === 'date') {
				const validFormat = moment(val, validKeysAndTypes[key].format).format(validKeysAndTypes[key].format) === val;
				if (!validFormat) {
					res.push({
						valid: false,
						message: `${key} data type is invalid required ${validKeysAndTypes[key].type} in format '${validKeysAndTypes[key].format}' got '${val}'`
					});
				}
			} else if (validKeysAndTypes[key].type === 'number') {
				let isNumber = Number(val);
				isNumber = isNumber == 0 ? true : isNumber;
				if (!isNumber) {
					res.push({
						valid: false,
						message: `${key} data type is invalid required ${validKeysAndTypes[key].type}.'`
					});
				}
			} else if (typeof val !== validKeysAndTypes[key].type) {
				res.push({
					valid: false,
					message: `${key} data type is invalid required ${validKeysAndTypes[key].type} got ${typeof val}`
				});
			}

			if (validKeysAndTypes[key].minLength) {
				if (_.size(val) < validKeysAndTypes[key].minLength) {
					res.push({
						valid: false,
						message: `The field ${key} as minimum length of ${validKeysAndTypes[key].minLength}, got ${_.size(val)}`
					});
				}
			}

			if (validKeysAndTypes[key].maxLength) {
				if (_.size(val) > validKeysAndTypes[key].maxLength) {
					res.push({
						valid: false,
						message: `The field ${key} as maximum length of ${validKeysAndTypes[key].maxLength}, got ${val.length}`
					});
				}
			}

			if (validKeysAndTypes[key].minNum) {
				if (val < validKeysAndTypes[key].minNum) {
					res.push({
						valid: false,
						message: `The field ${key} as minimum number of ${validKeysAndTypes[key].minNum}, got ${val}`
					});
				}
			}

			if (validKeysAndTypes[key].numRange) {
				const min = validKeysAndTypes[key].numRange[0];
				const max = validKeysAndTypes[key].numRange[1];
				if (val <= min || val > max) {
					res.push({
						valid: false,
						message: `The field ${key} as number range between ${min} - ${max}, got ${val}`
					});
				}
			}

			if (validKeysAndTypes[key].options) {
				const optionsArr = validKeysAndTypes[key].options;
				if (!optionsArr.includes(val)) {
					res.push({
						valid: false,
						message: `The field ${key} can be only one of the options ${optionsArr.toString()}`
					});
				}
			}

			if (validKeysAndTypes[key].isEmail) {
				const pattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

				if (!pattern.test(val)) {
					res.push({
						valid: false,
						message: `The field is email, got ${val}`
					});
				}
			}
		} else if (val === 'default' && validKeysAndTypes[key].required) {
			res.push({
				valid: false,
				message: `${key} is missing`
			});
		}
	});

	// check if there is a invalid key/value and return it if there is.
	if (_.size(res) !== 0) {
		return res;
	}

	// if all valid return valid = true.
	return {
		valid: true
	};
}

async function validateModifier(data, validKeysAndTypes) {
	const dataKeys = Object.keys(data);
	const validKeys = Object.keys(validKeysAndTypes);
	const res = [];

	await aigle.eachLimit(dataKeys, 1, (key) => {
		if (!_.includes(validKeys, key)) {
			res.push({
				valid: false,
				message: `${key} is not available for modifying`
			});
		}
	});

	const validRaT = await validateRequiredAndTypes(data, validKeysAndTypes);
	if (!_.get(validRaT, 'valid')) {
		res.push(...validRaT);
	}

	if (_.size(res) !== 0) {
		return res;
	}

	return {
		valid: true
	};
}
