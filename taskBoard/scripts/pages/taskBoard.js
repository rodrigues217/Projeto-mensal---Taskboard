const API_BASE_URL = "https://personal-ga2xwx9j.outsystemscloud.com/TaskBoard_CS/rest/TaskBoard";
const API_BOARD_URL = "https://personal-ga2xwx9j.outsystemscloud.com/TaskBoard_CS/rest/TaskBoard/Boards";

const dropdownButton = document.getElementById('dropdown-button');
const dropdownContent = document.getElementById('dropdown-content');
const columnContainer = document.getElementById('column-container'); // Certifique-se de que esse elemento exista
const tableList = document.getElementById("tableList"); // Certifique-se de que esse elemento exista
const addColumnButton = document.getElementById('add-column-button');

dropdownButton.addEventListener('click', async (event) => {
    event.stopPropagation(); // Impede que o clique no botão feche imediatamente
    const isVisible = dropdownContent.style.display === 'block';
    dropdownContent.style.display = isVisible ? 'none' : 'block'; // Alterna entre 'none' e 'block'
    
    if (!isVisible) {
        await populateDropdown(); // Carrega os boards apenas ao abrir
    }
});

window.addEventListener('click', (event) => {
    if (!event.target.closest('.dropdown')) { // Garante que o clique fora feche o dropdown
        dropdownContent.style.display = 'none';
    }
});
// -----------------------------------------------------PUXA AS BOARDS------------------------------------------
async function populateDropdown() {
    dropdownContent.innerHTML = ''; // Limpa o conteúdo antes de popular
    try {
        const response = await fetch(`${API_BOARD_URL}`);
        if (!response.ok) {
            if (response.status === 422) {
                const errorData = await response.json();
                showError(errorData.Errors[0]);
            } else {
                showError("Aconteceu um erro inesperado, tente novamente.");
            }
            return;
        }

        const boards = await response.json();
        console.log("Boards recebidos:", boards); // Log para depuração
        boards.forEach((board) => {
            const linkItem = document.createElement('li');
            linkItem.innerHTML = `${board.Name}`;
            linkItem.addEventListener('click', (event) => {
                event.preventDefault(); // Previne o comportamento padrão do link
                console.log(`Board ID selecionado: ${board.Id}`); // Log para depuração
                buscarColunas(board.Id); // Passa o ID do board corretamente
            });
            dropdownContent.appendChild(linkItem);
        });
    } catch (error) {
        showError("Falha ao se conectar com o servidor. Tente novamente mais tarde");
    }
}

// -----------------------------------------------------puxa as colunas------------------------------------------

async function buscarColunas(idDoBoard) {
    console.log(`Buscando colunas para BoardId: ${idDoBoard}`); // Log para depuração
    try {
        const response = await fetch(`https://personal-ga2xwx9j.outsystemscloud.com/TaskBoard_CS/rest/TaskBoard/ColumnByBoardId?BoardId=${idDoBoard}`);
        if (!response.ok) {
            console.error("Erro ao buscar colunas. Verifique sua API.");
            return;
        }
        
        const columns = await response.json();
        console.log("Colunas recebidas:", columns); // Log para depuração
        displayColumns(columns);  // Exibe as colunas com o botão de delete
  
    } catch (error) {
        console.error("Erro ao buscar colunas:", error);
    }
  }
  
// -----------------------------------------------------PUXA AS Tarefas------------------------------------------

async function buscarTasks(columnId) {
    try {
        const response = await fetch(`${API_BASE_URL}/TasksByColumnId?ColumnId=${columnId}`);
        if (!response.ok) {
            console.error("Erro ao buscar tasks.");
            return;
        }
        const tasks = await response.json();
        const columnElement = document.querySelector(`.column[data-column-id="${columnId}"]`);
        if (columnElement) {
            const tasksContainer = columnElement.querySelector('.tasks-container');
            tasks.forEach(task => {
                const taskElement = document.createElement('li');
                taskElement.className = 'task';
                taskElement.innerHTML = `<span>${task.Title}</span>`
                tasksContainer.appendChild(taskElement);
            });
        }
    } catch (error) {
        console.error("Erro ao conectar com a API para buscar tasks:", error);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggle-mode');
  
    toggleButton.addEventListener('click', () => {
      const body = document.body;

      // Alterna a classe dark-mode no body
      const isDarkMode = body.classList.toggle('dark-mode');

      // Atualiza o texto do botão de acordo com o modo atual
      toggleButton.textContent = isDarkMode
        ? 'Alternar para Modo Claro'
        : 'Alternar para Modo Escuro';
    });
  });


const toggleMode = document.getElementById('toggle-mode');

toggleMode.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', toggleMode.checked);
});

document.getElementById('LogOut').addEventListener('click', () => {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  });



    

    document.addEventListener("DOMContentLoaded", () => {
        const modal = document.getElementById('column-modal');
        const closeModalButton = document.getElementById('close-modal');
        const createColumnForm = document.getElementById('create-column-form');
        const responseMessage = document.getElementById('responseMessage');
        const columnModal = document.getElementById('column-modal');


        columnModal.style.display = 'none';


        // Abre o modal ao clicar no botão "Adicionar Nova Coluna"
        addColumnButton.addEventListener('click', () => {
            modal.style.display = 'block';
        });

        // Fecha o modal ao clicar no "x"
        closeModalButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        

        // Fecha o modal se o usuário clicar fora da caixa de conteúdo
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Função para criar a coluna
        function createColumn(columnData) {
            const endpoint = `${API_BASE_URL}/Column`;

            fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(columnData),
            })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((errorData) => {
                        throw errorData;
                    });
                }
                return response.json();
            })
            .then((data) => {
                console.log('Coluna criada com sucesso:', data);
                responseMessage.textContent = 'Coluna criada com sucesso!';
                responseMessage.classList.remove('error');
                responseMessage.classList.add('success');
                modal.style.display = 'none'; // Fecha o modal após sucesso
            })
            .catch((errorData) => {
                console.error('Erro ao criar coluna:', errorData);
                responseMessage.textContent = 'Erro ao criar coluna.';
                responseMessage.classList.remove('success');
                responseMessage.classList.add('error');
            });
        }

        // Submete o formulário de criação de coluna
        createColumnForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const boardId = document.getElementById('boardId').value;
            const name = document.getElementById('name').value;
            const position = document.getElementById('position').value;

            const columnData = {
                BoardId: boardId,
                Name: name,
                Position: position,
            };

            createColumn(columnData);
        });
    });
// -----------------------------------------------------puxa as colunas so q com o delete------------------------------------------

function displayColumns(columns) {
    const columnsDisplay = document.getElementById('column-container');
    columnsDisplay.innerHTML = '';  // Limpar colunas antigas

    columns.forEach(column => {
        const columnElement = document.createElement('div');
        columnElement.classList.add('column');
        columnElement.setAttribute('data-column-id', column.Id); // Adiciona um identificador único
        columnElement.innerHTML = ` 
            <button class="delete-column-btn">X</button>
            <h3>${column.Name}</h3>
            <ul class="tasks-container"></ul>
        `;

        const deleteButton = columnElement.querySelector('.delete-column-btn');
        deleteButton.addEventListener('click', async () => {
            const confirmed = confirm(`Deseja realmente apagar a coluna "${column.Name}"`);
            if (confirmed) {
                try {
                    const response = await fetch(`https://personal-ga2xwx9j.outsystemscloud.com/TaskBoard_CS/rest/TaskBoard/Column?ColumnId=${column.Id}`, {
                        method: 'DELETE',
                    });

                    if (response.ok) {
                        alert('Coluna apagada com sucesso!');
                        columnElement.remove(); // Remove a coluna da exibição
                    } else {
                        alert('Erro ao apagar a coluna.');
                    }
                } catch (error) {
                    console.error('Erro ao conectar com a API:', error);
                    alert('Erro ao conectar ao servidor.');
                }
            }
        });

        columnsDisplay.appendChild(columnElement);

        // Chama a função correta para buscar as tasks de cada coluna
        buscarTasks(column.Id);
    });
}

