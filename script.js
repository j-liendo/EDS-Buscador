document.getElementById('searchBtn').addEventListener('click', buscarInmueble);

// También permite buscar al presionar "Enter"
document.getElementById('codigoInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') buscarInmueble();
});

function buscarInmueble() {
    const codigo = document.getElementById('codigoInput').value.trim().toUpperCase();
    const resultsDiv = document.getElementById('results');
    
    if(!codigo) {
        resultsDiv.innerHTML = '<p class="error">Por favor ingresa un código.</p>';
        return;
    }

    resultsDiv.innerHTML = '<p>Buscando...</p>';

    // Lee el archivo local. IMPORTANTE: Debe llamarse 'inmuebles.txt' y estar en la misma carpeta.
    fetch('inmuebles.txt')
        .then(response => {
            if (!response.ok) throw new Error("No se pudo cargar el archivo");
            return response.text();
        })
        .then(text => {
            const lineas = text.split('\n');
            let encontrado = false;

            // Empezamos en i = 1 para saltar la fila de los encabezados
            for(let i = 1; i < lineas.length; i++) {
                // Separamos por tabulación (\t).
                const columnas = lineas[i].split('\t'); 
                
                // Si la línea está vacía o mal formada, la saltamos
                if(columnas.length < 8) continue; 

                const currentCodigo = columnas[0].trim().toUpperCase();

                if(currentCodigo === codigo) {
                    const agente = columnas[6].trim();
                    const tlfnoRaw = columnas[7].trim();
                    const oficina = columnas[8].trim();

                    // Formatear el teléfono para WhatsApp (limpiar espacios/guiones)
                    let cleanPhone = tlfnoRaw.replace(/\D/g, '');
                    
                    // Aseguramos el código de país (58) para el enlace
                    if (cleanPhone.startsWith('0')) {
                        cleanPhone = '58' + cleanPhone.substring(1);
                    } else if (!cleanPhone.startsWith('58')) {
                        cleanPhone = '58' + cleanPhone;
                    }

                    const whatsappLink = `https://wa.me/${cleanPhone}`;

                    // Construimos la tarjeta de resultado
                    resultsDiv.innerHTML = `
                        <div class="card">
                            <p><strong>Agente:</strong> ${agente}</p>
                            <p><strong>Oficina:</strong> ${oficina}</p>
                            <p><strong>Teléfono:</strong> <a class="whatsapp-link" href="${whatsappLink}" target="_blank">Contactar por WhatsApp (${tlfnoRaw})</a></p>
                        </div>
                    `;
                    encontrado = true;
                    break; // Detiene la búsqueda al encontrarlo
                }
            }

            if(!encontrado) {
                resultsDiv.innerHTML = '<p class="error">Inmueble no encontrado.</p>';
            }
        })
        .catch(err => {
            console.error(err);
            resultsDiv.innerHTML = '<p class="error">Error al leer la base de datos. Verifica que "inmuebles.txt" exista.</p>';
        });
}