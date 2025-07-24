// OAuth.jsx
import { getAuth, signInWithPopup, GoogleAuthProvider, OAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';

// Note: Interface OAuthResult removed. Function returns an object { user, email }.

export const signInWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const auth = getAuth();

        const result = await signInWithPopup(auth, provider);

        // Successful authentication
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken; // Optional chaining in case credential is null
        const user = result.user;
        const email = result.user.email;

        return { user, email };

    } catch (error) {
        // Handle errors for Google sign-in
        console.error('Google Authentication error:', error);
        // Consider re-throwing or returning a specific error structure
        throw error;
    }
};

export const signInWithMicrosoft = async () => {
    try {
        const provider = new OAuthProvider('microsoft.com');
        const auth = getAuth();
        const result = await signInWithPopup(auth, provider);

        // Successful authentication
        const credential = OAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken; // Optional chaining
        const user = result.user;
        const email = user.email;


        return { user, email };
    } catch (error) {
        console.error('Microsoft Authentication error:', error);
        throw error;
    }
};

export const logout = async () => {
    try {
        const auth = getAuth();
        const refreshToken = localStorage.getItem('refresh_token');
        // const signOut = firebaseSignOut; // Not needed, just call firebaseSignOut directly

        // If using a custom backend logout for refresh token invalidation
        if (refreshToken) {
            try {
                // Use the correct backend URL
                await fetch('https://www.api-okestra.africa:8000/auth/logout/', { // Make sure URL is correct
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refresh: refreshToken }),
                });
            } catch (backendLogoutError) {
                 console.error("Backend logout failed:", backendLogoutError);
                 // Decide if failure here should prevent client-side logout
                 // Often, client-side logout should proceed anyway
            } finally {
                // Always remove tokens locally regardless of backend logout success
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('access_token'); // Ensure access token is also removed
            }
        } else {
            // If no refresh token, still remove access token
            localStorage.removeItem('access_token');
        }

        // Perform Firebase client-side sign out
        await firebaseSignOut(auth);

        // Double-check local storage removal (already done above, but safe)
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

    } catch (error) {
        console.error('Error during logout:', error);
        // Clean up local storage even if Firebase sign out fails
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        throw error; // Re-throw the error for the caller to handle if needed
    }
};