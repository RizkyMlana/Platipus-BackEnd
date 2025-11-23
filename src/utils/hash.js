import bcrypt from 'bcrypt';

const round = 10;

export const hashPassword = async (plain) => {
    const salt = await bcrypt.genSalt(round);
    return bcrypt.hash(plain, salt);
}

export const comparePassword = async (plain, hash) => {
    if (!plain || !hash) throw new Error("Missing data or hash for comparison")
    return bcrypt.compare(plain, hash);
}