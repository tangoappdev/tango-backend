const express = require('express');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const { db, bucket } = require('../firebase');
const { TANDA_SEQUENCES } = require('../constants');

const router = express.Router();

function normalizeAndLowercase(str) {
    if (!str || typeof str !== 'string') { return ''; }
    return str.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const memoryStorage = multer.memoryStorage();
const upload = multer({
    storage: memoryStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
}).fields([
    { name: 'image', maxCount: 1 },
    { name: 'files[]', maxCount: 4 }
]);

const SIGNED_URL_EXPIRATION_MINUTES = 15;

async function generateV4ReadSignedUrl(filePath) {
    if (!filePath) return null;
    try {
        // This robust logic correctly handles different path formats
        let objectName = filePath;
        if (filePath.startsWith(`https://storage.googleapis.com/${bucketName}/`)) {
            objectName = filePath.substring(`https://storage.googleapis.com/${bucketName}/`.length);
        } else if (filePath.startsWith(`gs://${bucketName}/`)) {
            objectName = filePath.substring(`gs://${bucketName}/`.length);
        }
        if (!objectName) { return null; }

        const options = { version: 'v4', action: 'read', expires: Date.now() + SIGNED_URL_EXPIRATION_MINUTES * 60 * 1000 };
        const [url] = await bucket.file(objectName).getSignedUrl(options);
        return url;
    } catch (error) {
        console.error(`🔥 Failed to generate signed URL for ${filePath}:`, error);
        return null;
    }
}

const findTandaForPreview = async (criteria) => {
    const { tandasRef, requiredType, categoryFilter, excludeIdSet } = criteria;

    const query = tandasRef.where('type', '==', requiredType).where('category', '==', categoryFilter);
    const snapshot = await query.get();

    if (snapshot.empty) {
        console.log(`DATABASE: No tandas found at all for type '${requiredType}' and category '${categoryFilter}'`);
        return null;
    }

    const allCandidates = [];
    snapshot.forEach(doc => allCandidates.push({ id: doc.id, ...doc.data() }));

    const uniqueCandidates = allCandidates.filter(tanda => !excludeIdSet.has(tanda.id));

    if (uniqueCandidates.length > 0) {
        const randomIndex = Math.floor(Math.random() * uniqueCandidates.length);
        return uniqueCandidates[randomIndex];
    } else {
        // Fallback: No unique candidates were found, so we must repeat.
        console.log(`⚠️ No unique '${requiredType}' found. Allowing repeats.`);
        if (allCandidates.length > 0) {
            const randomIndex = Math.floor(Math.random() * allCandidates.length);
            return allCandidates[randomIndex];
        }
        return null;
    }
};

// REWRITTEN: The /preview endpoint is now much smarter
router.get('/preview', async (req, res) => {
    try {
        console.log("\n--- DEBUG: Entering /preview endpoint. ---");
        const { tandaOrder, requiredType, limit = 6, categoryFilter, excludeIds } = req.query;
        console.log("DEBUG: Query params received:", req.query);

        if (!categoryFilter) {
            return res.status(400).json({ message: 'categoryFilter is required.' });
        }
        console.log("DEBUG: Step 1 - categoryFilter check passed.");

        const tandasRef = db.collection('tandas');
        console.log("DEBUG: Step 2 - tandasRef defined.");

        const excludeIdSet = new Set(excludeIds ? excludeIds.split(',') : []);
        console.log(`DEBUG: Step 3 - excludeIdSet created with ${excludeIdSet.size} IDs.`);
        
        const upcomingTandas = [];
        let sequenceArray = [];
        
        if (tandaOrder && TANDA_SEQUENCES[tandaOrder]) {
            sequenceArray = TANDA_SEQUENCES[tandaOrder];
        } else if (requiredType) {
            // For freestyle mode, create an array of the required length
            for(let i = 0; i < parseInt(limit, 10); i++) {
                sequenceArray.push(requiredType);
            }
        }
        console.log("DEBUG: Step 4 - sequenceArray created:", sequenceArray);

        if (sequenceArray.length === 0) {
            throw new Error("No valid sequence or requiredType provided to build a playlist.");
        }

        for (const typeOfTandaInSequence of sequenceArray) {
            console.log(`\nDEBUG: Loop start for type: '${typeOfTandaInSequence}'`);
            const foundTanda = await findTandaForPreview({
                tandasRef,
                requiredType: typeOfTandaInSequence,
                categoryFilter,
                excludeIdSet
            });
            console.log(`DEBUG: Loop end. Found tanda:`, foundTanda ? `${foundTanda.orchestra} (ID: ${foundTanda.id})` : 'null');

            if (foundTanda) {
                upcomingTandas.push(foundTanda);
                excludeIdSet.add(foundTanda.id); // Add to set to avoid duplication within the same batch
            }
        }
        console.log(`DEBUG: Step 5 - Loop finished. Found ${upcomingTandas.length} tandas.`);

        console.log("DEBUG: Step 6 - Starting to generate signed URLs.");
        const tandasWithSignedUrls = await Promise.all(
            upcomingTandas.map(async (tanda) => ({
                ...tanda,
                artwork_signed: await generateV4ReadSignedUrl(tanda.artwork),
                tracks_signed: await Promise.all(tanda.tracks.map(async (track) => ({ ...track, url_signed: await generateV4ReadSignedUrl(track.url) }))),
            }))
        );
        console.log("DEBUG: Step 7 - Finished generating signed URLs. Sending response.");
        
        res.status(200).json({ upcomingTandas: tandasWithSignedUrls });

    } catch (error) {
        // This will now show us the REAL error in the terminal
        console.error('🔥 FINAL CRASH POINT:', error); 
        res.status(500).json({ message: 'Error generating tanda preview.', error: error.message });
    }
});

// Other endpoints remain unchanged...
router.post('/', upload, async (req, res) => {
    // ... your POST logic ...
});

router.get('/:tandaId', async (req, res) => {
    // ... your GET by ID logic ...
});


module.exports = router;