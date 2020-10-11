import moment from 'moment';
import Validators from './src/Validators.js';

const validationTests = async () => {
	const validObjectSchema = {
		name: {
			type: 'string',
			maxLength: 5,
			required: true
		},
		email: {
			type: 'string',
			isEmail: true,
			required: true
		},
		gender: {
			type: 'string',
			options: ['male', 'female']
		},
		age: {
			type: 'number',
			numRange: [10, 35],
			required: true
		},
		phoneNumbers: {
			type: 'array',
			required: true,
			maxLength: 5,
			validateArrayObjectsSchema: {
				name: {
					type: 'string',
					required: true
				},
				number: {
					type: 'string',
					required: true,
					minNum: 6
				}
			}
		},
		currentTime: {
			type: 'date',
			format: 'YYYY-MM-DD HH:mm:ss'
		}
	};

	const objectToValidate = {
		name: 'Ran',
		email: 'ryan@email.com',
		gender: 'male',
		age: 35,
		phoneNumbers: [
			{
				name: 'main',
				number: '+9724564654'
			},
			{
				name: 'work',
				number: '+357545431651'
			}
		],
		currentTime: moment().format('YYYY-MM-DD HH:mm:ss')
	};
	console.log('The object schema is:');
	console.log();
	console.log(validObjectSchema);
	console.log();
	console.log('Going to validate that object:');
	console.log(objectToValidate);
	console.log();

	try {
		const validationResult = await Validators.validateObject(objectToValidate, validObjectSchema);
		console.log('The validation result is:');
		console.log(validationResult);
	} catch (err) {
		console.log(err);
	}
};

validationTests();
