document.addEventListener('DOMContentLoaded', () => {
    // === CONFIGURATION ===
    // Define constant passwords for each list
    const PWD_LIST1 = "pass123"; // Password for list1.html (or list1-page)
    const PWD_LIST2 = "secret456"; // Password for list2.html (or list2-page)
    // =====================

    // Determine which page is loaded
    const pageId = document.body.id;
    let listCollectionName; // This will be the name of the Firestore collection for this list
    let requiredPassword;

    if (pageId === 'list1-page') {
        listCollectionName = 'list1Items'; // Firestore collection name for List 1
        requiredPassword = PWD_LIST1;
    } else if (pageId === 'list2-page') {
        listCollectionName = 'list2Items'; // Firestore collection name for List 2
        requiredPassword = PWD_LIST2;
    } else {
        console.warn('Script loaded on an unrecognized page ID for list management:', pageId);
        return;
    }

    // --- Password Authentication ---
    let enteredPassword = prompt(`Please enter the password for ${pageId.replace('-', ' ')}:`);

    if (enteredPassword === null || enteredPassword !== requiredPassword) {
        alert('Incorrect password or cancelled. Access denied!');
        document.body.innerHTML = '<h1>Access Denied!</h1><p>Please go back and try again with the correct password.</p>';
        document.body.style.display = 'block';
        document.body.style.textAlign = 'center';
        document.body.style.marginTop = '50px';
        return;
    }
    // If password is correct, continue

    const addBtn = document.getElementById('addBtn');
    const spotNameInput = document.getElementById('spotName');
    const spotLinkInput = document.getElementById('spotLink');
    const spotListUl = document.getElementById('spotList');

    // --- Real-time Listener for Firestore ---
    // This will automatically load the list AND update it in real-time if changes occur
    // (e.g., another user adds an item)
    if (db && listCollectionName) { // Ensure db is initialized and collection name is set
        db.collection(listCollectionName)
          .orderBy('timestamp', 'asc') // Order items by when they were added
          .onSnapshot((snapshot) => {
            const items = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                items.push({
                    id: doc.id, // Store Firestore's document ID for updates/deletes
                    SpotName: data.SpotName,
                    SpotLink: data.SpotLink,
                    Selected: data.Selected,
                    timestamp: data.timestamp // Keep timestamp for ordering if needed
                });
            });
            renderList(items);
        }, (error) => {
            console.error("Error getting real-time updates: ", error);
            spotListUl.innerHTML = '<li>Error loading list. Please try again.</li>';
        });
    }


    // Function to render the list (mostly same as before)
    function renderList(items) {
        spotListUl.innerHTML = '';
        if (!items || items.length === 0) {
            spotListUl.innerHTML = '<li>No spots added yet.</li>';
            return;
        }

        items.forEach((item) => { // Removed 'index' as Firestore 'id' is better
            const li = document.createElement('li');
            if (item.Selected) {
                li.classList.add('completed');
            }

            const infoDiv = document.createElement('div');
            infoDiv.className = 'spot-info';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'spot-name';
            nameSpan.textContent = item.SpotName;
            infoDiv.appendChild(nameSpan);

            if (item.SpotLink) {
                const linkA = document.createElement('a');
                linkA.href = item.SpotLink;
                linkA.textContent = item.SpotLink;
                linkA.target = '_blank';
                infoDiv.appendChild(linkA);
            }

            li.appendChild(infoDiv);

            const selectBtn = document.createElement('button');
            selectBtn.className = 'select-btn';
            if (item.Selected) {
                selectBtn.classList.add('selected');
                selectBtn.textContent = 'Been';
            } else {
                selectBtn.textContent = 'Been';
            }
            // Store the Firestore document ID in the button for easy access during update
            selectBtn.dataset.id = item.id;
            selectBtn.dataset.selected = item.Selected; // Store current selected status
            li.appendChild(selectBtn);

            spotListUl.appendChild(li);
        });
    }

    // Event listener for the "Add Spot" button
    if (addBtn) {
        addBtn.addEventListener('click', async () => {
            const spotName = spotNameInput.value.trim();
            const spotLink = spotLinkInput.value.trim();

            if (spotName === '') {
                alert('Please enter a name for the spot.');
                return;
            }

            const newItem = {
                SpotName: spotName,
                SpotLink: spotLink,
                Selected: false, // New items are not selected by default
                timestamp: firebase.firestore.FieldValue.serverTimestamp() // Firestore will add a server timestamp
            };

            try {
                // Add the new item to the specific collection in Firestore
                await db.collection(listCollectionName).add(newItem);
                spotNameInput.value = '';
                spotLinkInput.value = '';
            } catch (error) {
                console.error("Error adding document: ", error);
                alert('Failed to add item. Check console for details.');
            }
        });
    }

    // Event listener for toggling selection (using event delegation)
    if (spotListUl) {
        spotListUl.addEventListener('click', async (e) => {
            if (e.target.classList.contains('select-btn')) {
                const docId = e.target.dataset.id;
                const currentSelected = e.target.dataset.selected === 'true'; // Convert string to boolean

                try {
                    // Update the 'Selected' status of the document in Firestore
                    await db.collection(listCollectionName).doc(docId).update({
                        Selected: !currentSelected
                    });
                } catch (error) {
                    console.error("Error updating document: ", error);
                    alert('Failed to update item status. Check console for details.');
                }
            }
        });
    }
});


