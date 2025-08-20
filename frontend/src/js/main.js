// =========================================================
// Lógica para inicializar o mapa do Google Maps
// =========================================================

// Esta função será chamada automaticamente pela API do Google Maps
// assim que ela for carregada. Isso garante que o objeto 'google' exista.
window.initMap = async function () {
    // Configura a localização central do mapa (São Paulo como exemplo)
    const centro = { lat: -23.5505, lng: -46.6333 };

    // Carrega a biblioteca do Google Maps e do marcador
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    
    // Cria uma nova instância do mapa
    const mapa = new Map(document.getElementById("map"), {
        zoom: 12, // Define o nível de zoom
        center: centro, // Define a localização central
        mapId: 'YOUR_MAP_ID_HERE' // Substitua pelo seu Map ID, se tiver.
    });

    // Adiciona um marcador (o "pin") na mesma localização central
    const marcador = new AdvancedMarkerElement({
        position: centro,
        map: mapa,
    });
};

// =========================================================
// Carregando o script do Google Maps de forma segura
// =========================================================

// Verifica se a tag de script já existe para evitar duplicatas
if (!document.getElementById('google-maps-script')) {
    // Acessa a chave da API do arquivo .env de forma segura
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (apiKey) {
        // Cria um novo elemento <script> para carregar a API
        const script = document.createElement('script');
        
        // Define o source (URL) do script, incluindo a chave da API e a função de callback
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
        
        // Adiciona atributos para melhorar o carregamento
        script.id = 'google-maps-script';
        script.async = true;
        script.defer = true;
        
        // Adiciona o script ao corpo do documento para que ele seja executado
        document.body.appendChild(script);
    } else {
        // Exibe um erro no console se a chave não for encontrada
        console.error('API Key para o Google Maps não encontrada no arquivo .env');
    }
}