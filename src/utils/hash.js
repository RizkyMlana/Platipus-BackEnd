import bcrypt from 'bcrypt';

const round = 10;

export const hashPassword = async (plain) => {
    const salt = await bcrypt.genSalt(round);
    return bcrypt.hash(plain, salt);
}

export const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);