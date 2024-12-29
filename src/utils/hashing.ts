export const hashCompare = async (password: string, hashedPassword: string) => {
	const isCorrect = await Bun.password.verify(password, hashedPassword);
	return isCorrect;
};

export const passwordHashing = async (password: string) => {
	const hashed = await Bun.password.hash(password, {
		algorithm: "bcrypt",
		cost: 4, // number between 4-31
	});

	return hashed;
};
