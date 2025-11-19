export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
export const generateInviteCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < 12; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};
export const isOTPExpired = (expiryTime) => {
    return new Date() > expiryTime;
};
