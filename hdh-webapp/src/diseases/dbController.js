import {api} from '../common'

var diseasesApi = `${api}/diseases`


export function getDiseases(date, idToken) {
    let endpoint = `${diseasesApi}/dates/${date}`

    return fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
        },
    })
    .then(res => res.json()).then(res => res.data)
}


export function putDisease(date, disease, diseaseDescription, idToken) {
    let endpoint = `${diseasesApi}`

    let data = {
        date: date,
        disease: disease,
        diseaseDescription: diseaseDescription
    }
    return fetch(endpoint, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(data)
    }).then(response => response.json())
}


export function putDiseasesSelected(diseases, idToken) {
    let endpoint = `${diseasesApi}/selected`

    let data = {
        diseases: diseases
    }
    return fetch(endpoint, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(data)
    }).then(response => response.json())
}

