import Validators from './src/Validators.js';

const validationTest = async () => {
	const objectToValidate = {
		id: 10,
		email: 'ryan@utopia.tech',
		username: 'Ryan432',
		date: '2020-10-15 18:05:00',
		number: true,
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
	console.log(JSON.stringify({ objectToValidate }, 2, 3));
	console.log();

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

	console.log();
	console.log(JSON.stringify({ validObject }, 2, 3));
	console.log();
	try {
		const validationRes = await Validators.objectValidator(objectToValidate, validObject);
		console.log(validationRes);
	} catch (err) {
		console.log(JSON.stringify({ err }, 2, 5));
	}
};

validationTest();
