// src/js/togglePassword.js

/**
 * Configura a funcionalidade de alternar visibilidade para um campo de senha.
 *
 * @param {string} passwordInputId O ID do elemento <input type="password">.
 * @param {string} toggleIconId O ID do elemento <span> (geralmente Material Icon) que serve como botão de toggle.
 */
export function setupPasswordToggle(passwordInputId, toggleIconId) {
    const passwordInput = document.getElementById(passwordInputId);
    const toggleIcon = document.getElementById(toggleIconId);

    // Verifica se ambos os elementos existem na página
    if (!passwordInput || !toggleIcon) {
        console.warn(`Elemento de senha (ID: ${passwordInputId}) ou ícone de toggle (ID: ${toggleIconId}) não encontrado(s).`);
        return; // Sai da função se os elementos não existirem
    }

    toggleIcon.addEventListener('click', () => {
        // Alterna o tipo do input entre 'password' e 'text'
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // Altera o ícone visível (visibility_off para olho fechado, visibility para olho aberto)
        if (type === 'password') {
            toggleIcon.textContent = 'visibility_off'; // Olho fechado
        } else {
            toggleIcon.textContent = 'visibility'; // Olho aberto
        }
    });
}