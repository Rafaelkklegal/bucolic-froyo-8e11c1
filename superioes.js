const SUPERIORES_AUTORIZADOS = [
    { nome: "kingdomicegamer", idDiscord: "617468134621708288" },
    { nome: "criador_mirage", idDiscord: "1263086691174842429" } // Para testar rápido no painel
];

function adicionarNaTela(plataforma, item) {
    const tabelaId = plataforma === 'roblox' ? 'tabelaRoblox' : 'tabelaDiscord';
    const tabela = document.getElementById(tabelaId);
    const badgeClass = (item.punicao === 'Exílio Permanente' || item.punicao === 'Banimento') ? 'badge-red' : 'badge-orange';
    const linkUrl = item.linkPerfil ? item.linkPerfil : '#';
    const linkTexto = item.linkPerfil ? 'Acessar Link 🔗' : 'Sem Link';
    const linha = document.createElement('tr');
    
    // Função interna para sanitizar o texto contra XSS (Injeção de código)
    const escaparHTML = (texto) => {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    };

    const thAcao = modoAdminAtivo 
        ? `<td><button style="background: #ef4444; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;" onclick="removerItem('${plataforma}', ${item.id})">Remover</button></td>` 
        : '';

    linha.innerHTML = `
        <td class="username">${escaparHTML(item.usuario)}</td>
        <td>${escaparHTML(item.idUsuario)}</td>
        <td><span class="badge ${badgeClass}">${escaparHTML(item.punicao)}</span></td>
        <td>${escaparHTML(item.motivo)}</td>
        <td><a href="${linkUrl}" target="_blank" class="table-link">${escaparHTML(linkTexto)}</a></td>
        ${thAcao}
    `;
    tabela.appendChild(linha);
}

function removerItem(plataforma, id) {
    if (confirm("Deseja remover este registro?")) {
        let lista = JSON.parse(localStorage.getItem(plataforma)) || [];
        const itemRemovido = lista.find(item => item.id === id);

        if (itemRemovido) {
            lista = lista.filter(item => item.id !== id);
            localStorage.setItem(plataforma, JSON.stringify(lista));
            
            // Nova Auditoria: Avisa no canal do Discord quem removeu a punição
            notificarRemocaoDiscord(plataforma, itemRemovido);
            
            carregarDados();
        }
    }
}

function notificarRemocaoDiscord(plataforma, item) {
    if (!DISCORD_WEBHOOK_URL || DISCORD_WEBHOOK_URL.includes("COLE_AQUI")) return;
    const payload = {
        username: "EB | Auditoria de Registros",
        embeds: [{
            title: `🟢 PUNIÇÃO REVOGADA - EB ${plataforma.toUpperCase()}`,
            color: 3066993, // Verde militar/sucesso
            description: `Um registro de punição foi removido do sistema oficial.`,
            fields: [
                { name: "👤 Ex-Infrator", value: `\`${item.usuario}\``, inline: true },
                { name: "🆔 ID", value: `\`${item.idUsuario}\``, inline: true },
                { name: "⚖️ Punição Constante", value: item.punicao },
                { name: "🛡️ Revogado por", value: `\`${superiorLogadoNome || "Admin Desconhecido"}\``, inline: true }
            ],
            timestamp: new Date().toISOString()
        }]
    };
    fetch(DISCORD_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
}