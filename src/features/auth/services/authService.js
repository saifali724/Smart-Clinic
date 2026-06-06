export async function loginWithCredentials(credentials) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        user: {
          email: credentials.email,
          role: credentials.role,
        },
      });
    }, 400);
  });
}