// src/js/mapManager.js
// Gerenciador de Mapa utilizando Google Maps JavaScript API

let mapInstance; // Armazena a instância global do mapa
let markers = {}; // Objeto para armazenar marcadores por ID
let directionsService; // Serviço de rotas do Google Maps
let directionsRenderer; // Renderizador de rotas do Google Maps

// Define uma função global que será chamada quando a API do Google Maps carregar (callback)
// Esta função é vital para a inicialização do mapa
window.initMap = () => {
    console.log('Google Maps API carregado!');
    // A instância do mapa será criada dentro de initializeMap quando for chamada pelos outros módulos
};

/**
 * Inicializa o mapa Google Maps em um elemento HTML específico.
 * @param {string} elementId O ID do elemento HTML (div) onde o mapa será exibido.
 * @returns {google.maps.Map} A instância do mapa Google Maps.
 */
export function initializeMap(elementId) {
    if (mapInstance) {
        return mapInstance; // Retorna a instância existente se já inicializado
    }

    const mapElement = document.getElementById(elementId);
    if (!mapElement) {
        console.error(`Elemento com ID '${elementId}' não encontrado para inicializar o mapa.`);
        return null;
    }

    // Define uma localização padrão para o centro do mapa (ex: São Paulo, Brasil)
    const defaultLocation = { lat: -23.55052, lng: -46.633309 }; // São Paulo

    // Cria e armazena a instância do mapa
    mapInstance = new google.maps.Map(mapElement, {
        center: defaultLocation,
        zoom: 13, // Nível de zoom inicial
        mapId: 'SEU_MAP_ID_DO_GOOGLE_CLOUD' // Opcional, mas recomendado para estilos personalizados.
                                            // Crie um ID de mapa no Google Cloud Console (Maps > Map Management)
                                            // Se não tiver, pode remover esta linha por enquanto.
    });

    // Inicializa os serviços de Direções
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({ map: mapInstance });

    console.log('Mapa Google Maps inicializado com sucesso.');
    return mapInstance;
}

/**
 * Atualiza ou cria o marcador de localização do passageiro/motorista no mapa.
 * @param {google.maps.Map} map A instância do mapa.
 * @param {string} markerId Um ID único para o marcador (ex: 'passengerLocation', 'driverLocation').
 * @param {number} lat Latitude da localização.
 * @param {number} lng Longitude da localização.
 * @param {string} title Título do marcador (texto de popup/tooltip).
 * @param {string} iconUrl URL do ícone personalizado para o marcador.
 * @returns {google.maps.Marker} A instância do marcador (novo ou atualizado).
 */
export function updateLocationMarker(map, markerId, lat, lng, title, iconUrl) {
    const position = { lat, lng };

    if (markers[markerId]) {
        // Se o marcador já existe, apenas atualiza sua posição
        markers[markerId].setPosition(position);
    } else {
        // Se o marcador não existe, cria um novo
        markers[markerId] = new google.maps.Marker({
            position: position,
            map: map,
            title: title,
            icon: iconUrl ? {
                url: iconUrl,
                scaledSize: new google.maps.Size(38, 38), // Tamanho do ícone
                anchor: new google.maps.Point(19, 38) // Ponto de ancoragem (base inferior central)
            } : null
        });
    }
    return markers[markerId];
}

/**
 * Adiciona um marcador genérico ao mapa.
 * Usa updateLocationMarker internamente para gerenciar IDs de marcadores.
 * @param {google.maps.Map} map A instância do mapa.
 * @param {string} markerId Um ID único para o marcador (ex: 'origin', 'destination').
 * @param {number} lat Latitude da localização.
 * @param {number} lng Longitude da localização.
 * @param {string} title Título do marcador (texto de popup/tooltip).
 * @param {string} iconUrl URL do ícone personalizado para o marcador.
 * @returns {google.maps.Marker} A instância do marcador.
 */
export function addMarker(map, markerId, lat, lng, title, iconUrl) {
    return updateLocationMarker(map, markerId, lat, lng, title, iconUrl);
}

/**
 * Remove um marcador específico do mapa pelo seu ID.
 * @param {string} markerId O ID do marcador a ser removido.
 */
export function removeMarker(markerId) {
    if (markers[markerId]) {
        markers[markerId].setMap(null); // Remove o marcador do mapa
        delete markers[markerId]; // Remove do nosso objeto de controle
    }
}

/**
 * Limpa todos os marcadores gerenciados pelo mapManager.js, exceto os especificados.
 * @param {string[]} [excludeIds=[]] Array de IDs de marcadores a serem excluídos da remoção.
 */
export function clearAllMarkers(excludeIds = []) {
    for (const markerId in markers) {
        if (!excludeIds.includes(markerId)) {
            markers[markerId].setMap(null);
            delete markers[markerId];
        }
    }
}


/**
 * Desenha uma rota entre dois ou mais pontos no mapa usando DirectionsService.
 * @param {Object} originLatLng {lat, lng} do ponto de origem.
 * @param {Object} destinationLatLng {lat, lng} do ponto de destino.
 * @param {Object[]} [waypoints=[]] Array de objetos {location: {lat, lng}, stopover: boolean} para pontos intermediários.
 * @returns {Promise<Object>} Promessa que resolve com os detalhes da rota (distância, duração) ou rejeita em caso de erro.
 */
export function drawRoute(originLatLng, destinationLatLng, waypoints = []) {
    return new Promise((resolve, reject) => {
        if (!directionsService || !directionsRenderer) {
            console.error('Serviços de Direções do Google Maps não inicializados.');
            return reject('Map services not ready');
        }

        directionsService.route(
            {
                origin: originLatLng,
                destination: destinationLatLng,
                waypoints: waypoints,
                travelMode: google.maps.TravelMode.DRIVING, // Modo de viagem (carro)
            },
            (response, status) => {
                if (status === 'OK') {
                    directionsRenderer.setDirections(response); // Renderiza a rota no mapa
                    const route = response.routes[0];
                    const leg = route.legs[0]; // Pega a primeira 'perna' da rota (geralmente a principal)

                    // Retorna informações úteis sobre a rota
                    resolve({
                        distance: leg.distance.text, // Ex: "10.5 km"
                        distanceValue: leg.distance.value, // Ex: 10500 (metros)
                        duration: leg.duration.text, // Ex: "15 mins"
                        durationValue: leg.duration.value, // Ex: 900 (segundos)
                    });
                } else {
                    console.error('Erro ao calcular rota:', status, response);
                    reject(status);
                }
            }
        );
    });
}

/**
 * Limpa a rota atualmente exibida no mapa.
 */
export function clearRoute() {
    if (directionsRenderer) {
        directionsRenderer.setDirections({ routes: [] }); // Limpa as direções
    }
}

/**
 * Inicializa o serviço de autocompletar endereços do Google Places.
 * @param {HTMLElement} inputElement O elemento input HTML para o qual o autocomplete será ativado.
 * @param {google.maps.Map} map A instância do mapa para ajustar a visualização.
 * @returns {google.maps.places.Autocomplete} A instância do autocomplete.
 */
export function setupAutocomplete(inputElement, map) {
    if (!google.maps.places) {
        console.error('Google Maps Places library not loaded. Ensure "libraries=places" is in your API script URL.');
        return null;
    }

    const autocomplete = new google.maps.places.Autocomplete(inputElement, {
        types: ['address'], // Sugere apenas endereços
        componentRestrictions: { country: ['br'] } // Restringe para o Brasil
    });

    autocomplete.bindTo('bounds', map); // Ajusta sugestões para a área visível do mapa

    return autocomplete;
}

/**
 * Obtém os detalhes de um local a partir do Autocomplete ou de um Place ID.
 * @param {google.maps.places.Autocomplete} autocompleteInstance Instância do autocomplete ou null.
 * @param {string} placeId O Place ID do local.
 * @returns {Promise<Object>} Promessa que resolve com {lat, lng, address_components, formatted_address}
 */
export function getPlaceDetails(autocompleteInstance = null, placeId = null) {
    return new Promise((resolve, reject) => {
        if (!google.maps.places) {
            return reject('Google Maps Places library not loaded.');
        }

        const service = new google.maps.places.PlacesService(mapInstance); // Requer uma instância de mapa para o serviço

        if (autocompleteInstance) {
            const place = autocompleteInstance.getPlace();
            if (place.geometry) {
                resolve({
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                    address_components: place.address_components,
                    formatted_address: place.formatted_address
                });
            } else {
                reject('No geometry for selected place');
            }
        } else if (placeId) {
            service.getDetails({ placeId: placeId }, (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && place.geometry) {
                    resolve({
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                        address_components: place.address_components,
                        formatted_address: place.formatted_address
                    });
                } else {
                    reject(status);
                }
            });
        } else {
            reject('No autocomplete instance or placeId provided.');
        }
    });
}