// --- CONFIGURAÇÃO DA CONEXÃO COM O SUPABASE ---
// Cole aqui as informações que você pegou na Fase 1 (Passo 2)
const SUPABASE_URL = 'postgresql://postgres.mzxycsromoomomvbexfu:santinho@aws-0-sa-east-1.pooler.supabase.com:6543/postgres';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16eHljc3JvbW9vbW9tdmJleGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMjE5MDIsImV4cCI6MjA2NTU5NzkwMn0.jYCINsBH_l6b-LDr7oXF02SAeCFk4ySB5ZsHkWh3Etw';

// --- INICIALIZAÇÃO DO CLIENTE SUPABASE ---
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// --- SELEÇÃO DOS ELEMENTOS DO HTML ---
const listaDetentos = document.getElementById('lista-detentos');
const formDetento = document.getElementById('form-detento');
const selectCela = document.getElementById('cela');


// --- FUNÇÕES DE INTERAÇÃO COM O BANCO ---

// READ: Carrega celas para o dropdown
async function carregarCelas() {
    const { data, error } = await supabase
        .from('celas')
        .select('id, numero, pavilhoes(nome)'); // Supabase faz o JOIN para nós!

    if (error) {
        console.error('Erro ao buscar celas:', error);
        return;
    }
    
    for (const cela of data) {
        selectCela.innerHTML += `<option value="${cela.id}">Cela ${cela.numero} (Pav. ${cela.pavilhoes.nome})</option>`;
    }
}

// READ: Carrega detentos na tabela
async function carregarDetentos() {
    const { data, error } = await supabase
        .from('detentos')
        .select('id, nome_completo, cpf, celas(numero)'); // Supabase também faz este JOIN!
    
    if (error) {
        console.error('Erro ao buscar detentos:', error);
        return;
    }

    listaDetentos.innerHTML = ''; // Limpa a tabela
    for (const d of data) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${d.id}</td>
            <td>${d.nome_completo}</td>
            <td>${d.cpf}</td>
            <td>${d.celas ? d.celas.numero : 'N/A'}</td>
            <td><button class="btn-deletar" data-id="${d.id}">Deletar</button></td>
        `;
        listaDetentos.appendChild(tr);
    }
}

// CREATE: Salva um novo detento
formDetento.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const cpf = document.getElementById('cpf').value;
    const celaId = document.getElementById('cela').value;

    const { error } = await supabase
        .from('detentos')
        .insert({ nome_completo: nome, cpf: cpf, cela_id: celaId });
    
    if (error) {
        alert('Erro ao salvar detento: ' + error.message);
    } else {
        alert('Detento salvo com sucesso!');
        formDetento.reset();
        carregarDetentos(); // Recarrega a lista
    }
});

// DELETE: Deleta um detento
listaDetentos.addEventListener('click', async (event) => {
    if (event.target.classList.contains('btn-deletar')) {
        const id = event.target.dataset.id;
        
        if (!confirm(`Tem certeza que deseja deletar o detento com ID ${id}?`)) return;

        const { error } = await supabase
            .from('detentos')
            .delete()
            .eq('id', id); // WHERE id = ...

        if (error) {
            alert('Erro ao deletar detento: ' + error.message);
        } else {
            alert('Detento deletado com sucesso!');
            carregarDetentos();
        }
    }
});


// --- CARREGAMENTO INICIAL DA PÁGINA ---
carregarCelas();
carregarDetentos();