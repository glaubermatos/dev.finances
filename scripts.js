const Modal = {
    open(){
        document.querySelector('.modal-overlay').classList.add('active');
    },
    close(){
        document.querySelector('.modal-overlay').classList.remove('active');
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions){
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)
        App.reload();
    },

    remove(index){
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let income = 0;

        Transaction.all.forEach(transaction => {
            if (transaction.amount >= 0) {
                income += transaction.amount
            }
        })

        return income
    },

    expenses(){
        let expense = 0;

        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount
            }
        })
        
        return expense
    },

    total(){
        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index){
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        DOM.transactionsContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index){

        const CSSClass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount);

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSClass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
        `;

        return html;

    },

    updateBalance(){
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())

        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        
        //obtem o total das transações
        const total = Transaction.total()
        //obter o status do balanço
        const balanceCSSClass = total >= 0 ? "positive" : "negative"

        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(total)

        //adiciona classe correspondente ao saldo das transações
        const cardTotal = document.querySelector('.card.total')
        cardTotal.classList.remove('positive', 'negative')
        cardTotal.classList.add(balanceCSSClass)
    },

    clearTransactions(){
        this.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatDate(date) {
        const splittedDate = date.split("-");
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatAmount(value){
        value = Number(value)
        return value * 100;
    },

    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : ""
        
        value = String(value).replace(/\D/g, '')
        
        value = Number(value) / 100
        
        value = value.toLocaleString("pt-BR", {
            style: 'currency',
            currency: 'BRL'
            
        })
        
        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFilds(){
        const { description, amount, date } = Form.getValues()

        if (description.trim() === "" || 
            amount.trim() === "" || 
            date.trim() === "") {
                throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues(){
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description, 
            amount, 
            date
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    save(transaction) {
        Transaction.add(transaction)
        Form.clearFields()
        Modal.close()
    },

    submit(event){
        event.preventDefault()

        try {
            Form.validateFilds()
            const newTransaction = Form.formatValues()
            Form.save(newTransaction)
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {
        // quando a função de callback passa os mesmos parametros pode passar apenas a referencia a função evitando o uss como visto abaixo
        // Transaction.all.forEach((transaction, index) => {
        //    DOM.addTransaction(transaction, index)
        // }) 
        Transaction.all.forEach(DOM.addTransaction)

        Storage.set(Transaction.all)

        DOM.updateBalance()
    },

    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init();