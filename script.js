// Initialisation de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCXVK7CPQ7Fwug-zabRnRyy6Fehn9Jd2NE",
    authDomain: "formulaire-empsi.firebaseapp.com",
    projectId: "formulaire-empsi",
    storageBucket: "formulaire-empsi.firebasestorage.app",
    messagingSenderId: "971121686068",
    appId: "1:971121686068:web:e95610cefecc4d18bd3c61",
    measurementId: "G-TRC03XRF33"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/**
 * Fonction pour afficher les données dans le tableau
 */
function displayData(docs = null) {
    const tableBody = document.getElementById('table-body');
    console.log('Displaying data - docs:', docs);
    tableBody.innerHTML = '';

    const fetchDocs = docs 
        ? Promise.resolve(docs.map(doc => ({ id: doc.id, data: doc.data() })))
        : db.collection('form-submissions').get().then(querySnapshot => 
            querySnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))
        );

    fetchDocs.then((documents) => {
        console.log('Snapshot size:', documents.length);

        documents.forEach(({ id, data }) => {
            console.log('Document data:', data);
            const row = document.createElement('tr');

            const fields = [
                'attentes', 'company', 'conditions', 'dates',
                'email', 'identity', 'informations', 'phone',
                'position', 'sector', 'submissionDate',
                'theme-formation', 'type-formation'
            ];

            fields.forEach((field) => {
                const cell = document.createElement('td');
                cell.textContent = data[field] || 'Non renseigné';
                row.appendChild(cell);
            });

            // Ajouter le bouton de suppression
            const deleteCell = document.createElement('td');
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Supprimer';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener('click', () => deleteData(id));
            deleteCell.appendChild(deleteBtn);
            row.appendChild(deleteCell);

            tableBody.appendChild(row);
        });
    }).catch((error) => {
        console.error('Erreur lors de la récupération des données :', error);
    });
}

/**
 * Fonction pour filtrer les données en fonction de la recherche ou du champ sélectionné
 */
function filterData() {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    const filterField = document.getElementById('filter-select').value;

    console.log('Filtering - Search input:', searchInput);
    console.log('Filtering - Selected field:', filterField);

    db.collection('form-submissions').get()
        .then((querySnapshot) => {
            const filteredDocs = querySnapshot.docs.filter((doc) => {
                const data = doc.data();
                let matches = false;

                if (filterField) {
                    // Filtrer par champ spécifique
                    const fieldValue = String(data[filterField] || '').toLowerCase();
                    matches = fieldValue.includes(searchInput);
                } else {
                    // Recherche globale sur tous les champs
                    matches = Object.values(data).some(value => 
                        String(value).toLowerCase().includes(searchInput)
                    );
                }

                return matches;
            });

            console.log('Filtered documents:', filteredDocs.length);
            displayData(filteredDocs);
        })
        .catch((error) => {
            console.error('Erreur de filtrage :', error);
        });
}

/**
 * Fonction pour supprimer un document de la base de données
 */
function deleteData(id) {
    db.collection('form-submissions').doc(id).delete()
        .then(() => {
            console.log('Document supprimé avec succès');
            displayData(); // Recharger les données après suppression
        })
        .catch((error) => {
            console.error('Erreur lors de la suppression du document :', error);
        });
}

/**
 * Fonction pour remplir les options du menu déroulant de filtre
 */
function populateFilterOptions() {
    const filterSelect = document.getElementById('filter-select');
    filterSelect.innerHTML = '<option value="">Tous les champs</option>'; // Option par défaut

    db.collection('form-submissions').limit(1).get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                const data = querySnapshot.docs[0].data();
                console.log('Available fields:', Object.keys(data));

                Object.keys(data).forEach((key) => {
                    const option = document.createElement('option');
                    option.value = key;
                    option.textContent = key;
                    filterSelect.appendChild(option);
                });
            } else {
                console.warn('Aucun document trouvé pour détecter les champs.');
            }
        })
        .catch((error) => {
            console.error('Erreur lors de la récupération des données :', error);
        });
}

// S'assurer que les événements sont ajoutés après le chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const filterSelect = document.getElementById('filter-select');

    if (searchInput) {
        searchInput.addEventListener('input', filterData);
        console.log('Search input event listener added');
    }

    if (filterSelect) {
        filterSelect.addEventListener('change', filterData);
        console.log('Filter select event listener added');
    }

    // Initialisation
    displayData();
    populateFilterOptions();
});





