import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Check if Firebase is configured
const isFirebaseConfigured = () => {
    return !!(
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_PRIVATE_KEY &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_STORAGE_BUCKET
    );
};

let bucket = null;

// Initialize Firebase Admin SDK only if configured
if (isFirebaseConfigured() && !admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            }),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        });
        bucket = admin.storage().bucket();
        console.log('Firebase Storage initialized successfully');
    } catch (error) {
        console.error('Firebase initialization error:', error.message);
    }
} else if (!isFirebaseConfigured()) {
    console.warn('Firebase Storage not configured. Add FIREBASE_* env variables to enable PDF uploads.');
}

/**
 * Upload a document (PDF) to Firebase Storage
 * @param {string} filePath - Local path to the file
 * @param {string} folder - Folder name in Firebase Storage
 * @returns {Object} - { fileName, url }
 */
export const uploadToFirebase = async (filePath, folder) => {
    if (!bucket) {
        throw new Error('Firebase Storage is not configured. Please add FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, and FIREBASE_STORAGE_BUCKET to your .env file.');
    }

    try {
        const fileName = `${folder}/${Date.now()}_${path.basename(filePath)}`;

        // Upload file to Firebase Storage
        await bucket.upload(filePath, {
            destination: fileName,
            metadata: {
                contentType: 'application/pdf',
                metadata: {
                    firebaseStorageDownloadTokens: Date.now().toString(),
                },
            },
        });

        // Make file publicly accessible
        const file = bucket.file(fileName);
        await file.makePublic();

        // Get public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        // Clean up local file
        try {
            fs.unlinkSync(filePath);
        } catch (err) {
            console.warn('Could not delete local file:', err.message);
        }

        return {
            fileName: fileName,
            url: publicUrl,
        };
    } catch (error) {
        console.error('Firebase upload error:', error);
        // Clean up local file on error
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (err) {
            // Ignore cleanup error
        }
        throw new Error(`Firebase upload failed: ${error.message}`);
    }
};

/**
 * Delete a file from Firebase Storage
 * @param {string} fileName - File name/path in Firebase Storage
 */
export const deleteFromFirebase = async (fileName) => {
    if (!bucket) {
        throw new Error('Firebase Storage is not configured.');
    }

    try {
        await bucket.file(fileName).delete();
        return true;
    } catch (error) {
        console.error('Firebase delete error:', error);
        throw new Error(`Firebase deletion failed: ${error.message}`);
    }
};

export default bucket;
