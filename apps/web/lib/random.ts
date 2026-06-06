// generate unique random string and return
// use to make something like /forms/kdzZMM/edit
export function generateRandomString(length: number = 8): string {
    const timestamp = Date.now().toString(36); // Base36 encoded timestamp
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomPart = '';

    // Calculate how many random characters we need after the timestamp
    const randomLength = Math.max(0, length - timestamp.length);

    for (let i = 0; i < randomLength; i++) {
        randomPart += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Combine timestamp and random characters, then shuffle or just return
    // Taking the last 'length' characters ensures it stays at the requested size
    // while keeping the rapidly changing end of the timestamp
    const combined = timestamp + randomPart;
    return combined.slice(-length);
}