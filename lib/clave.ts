export const CLAVE_SUPER_SECRETA = process.env.CLAVE_SUPER_SECRETA;
if (!CLAVE_SUPER_SECRETA) {
    throw new Error('Environment variable CLAVE_SUPER_SECRETA is not set.');
}