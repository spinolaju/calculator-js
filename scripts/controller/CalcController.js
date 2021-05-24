class CalcController {

    constructor() {

        this._displayCalcEl = document.querySelector("#display-numbers");
        this._currentDate;
        this._dateEl = document.querySelector("#date");
        this._timeEl = document.querySelector("#time");
        this._locale = 'eng-IE';
        

        this._audioOn = false;
        this._audio = new Audio('btn-click.mp3');

        this._operation = [];
        this._lastOperator = '';
        this._lastNumber = '';


        this.initialize();
        this.initButtonsEvents();
        this.keyEvents();

    }

    initialize() {

        this.setDisplayDateTime();

        setInterval(() => {
            this.setDisplayDateTime();

        }, 1000);

        this.displayLastNumber();
        this.pastFromCbToDisplay();

        document.querySelector('.btn-ac').addEventListener('dblclick', e => {

            this.toggleAudio();
        })
    }

    toggleAudio() {
        this._audioOn = !this._audionOn;
    }

    playAudio() {
        if (this._audioOn) {
            this._audio.currentTime = 0;
            this._audio.play();

        }
    }

    addEventListenerAll(element, events, fn) {

        events.split(' ').forEach(event => {
            element.addEventListener(event, fn, false);
        });
    }

    keyEvents() {

        document.addEventListener('keyup', e => {
            this.playAudio();
            switch (e.key) {
                case '+':
                case '%':
                case '-':
                case '/':
                case '*':
                    this.addOperation(e.key);
                    break;

                case '.':
                    this.addDot();
                    break;

                case '=':
                case 'Enter':
                    this.calc();
                    break;

                case 'Escape':
                    this.clearAll();
                    break;

                case 'Backspace':
                    this.clearEntry();
                    break;

                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    break;

                case 'c':
                    if (e.ctrlKey) this.copyToClipboard();

                default:
                    break;

            }
        })

    }

    btnExec(value) {
        this.playAudio();
        switch (value) {

            case 'sum':
                this.addOperation('+');
                break;

            case 'percentage':
                this.addOperation('%');
                break;

            case 'subtraction':
                this.addOperation('-');
                break;

            case 'division':
                this.addOperation('/');
                break;

            case 'multiplication':
                this.addOperation('*');
                break;

            case 'dot':
                this.addDot();
                break;

            case 'equal':
                this.calc();
                break;

            case 'ac':
                this.clearAll();
                break;

            case 'ce':
                this.clearEntry();
                break;

            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;

            default:
                this.setError();
                break;

        }
    }

    initButtonsEvents() {
        let buttons = document.querySelectorAll(".buttons > g");
        buttons.forEach((btn, index) => {
            this.addEventListenerAll(btn, 'click drag', e => {

                let btnText = btn.className.baseVal.replace("btn-", "");
                this.btnExec(btnText);
            });
        });
    }

    copyToClipboard() {

        let input = document.createElement('input');

        input.value = this.displayCalc;

        document.body.appendChild(input);

        input.select();

        document.execCommand("Copy");
        input.remove();
    }

    pastFromCbToDisplay() {
        document.addEventListener('paste', e => {

            let number = e.clipboardData.getData('Text');

            this.displayCalc = parseFloat(number);

            this.pushOperation(number)
        })

    }


    clearAll() {
        this._operation = [];
        this._lastNumber = '';
        this._lastOperator = '';
        this.displayLastNumber();
    }

    clearEntry() {
        this._operation.pop();
        this.displayLastNumber();
    }

    
    addOperation(value) {
        if (isNaN(this.getLastOperation())) {

            if (this.isOperator(value)) {
                this.setLastOperation(value);

            } else {
                this.pushOperation(value);
                this.displayLastNumber();
            }
        } else {
            if (this.isOperator(value)) {
                this.pushOperation(value);

            }
            else {
                let newNumber = this.getLastOperation().toString() + value.toString();
                this.setLastOperation(newNumber);
                this.displayLastNumber();
            }


        }

    }

    setError() {
        this.displayCalc = "Error";
    }

    addDot() {
        let lastOperation = this.getLastOperation();

        if (typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;
        if (this.isOperator(lastOperation) || !lastOperation) {
            this.pushOperation('0.')
        } else {
            this.setLastOperation(lastOperation.toString() + '.');

        }
        this.displatLastNumber();

    }
    pushOperation(value) {
        this._operation.push(value);

        if (this._operation.length > 3) {
            this.calc();
        }
    }


    getResult() {

        try {
            return eval(this._operation.join(""));
        }
        catch (e) {
            setTimeout(() => {
                this.setError();
            }, 1);
        }
    }

    calc() {
        let last = '';

        this._lastOperator = this.getLastItem();

        if (this._operation.length < 3) {

            let firstItem = this._operation[0];
            this._operation = [firstItem, this._lastOperator, this._lastNumber];
        }

        if (this._operation.length > 3) {
            last = this._operation.pop();
            this._lastNumber = this.getResult();

        } else if (this._operation.length == 3) {
            this._lastNumber = this.getLastItem(false);
        }


        let result = this.getResult();
        if (last == '%') {

            result /= 100;
            this._operation = [result];

        } else {
            this._operation = [result];
            if (last) this._operation.push(last);


        }
        this.displayLastNumber();
    }

    getLastOperation() {

        return this._operation[this._operation.length - 1];
    }

    setLastOperation(value) {
        this._operation[this._operation.length - 1] = value;
    }

    isOperator(value) {
        return (['+', '-', '*', '%', '/'].indexOf(value) > -1);
    }


    getLastItem(isOperator = true) {

        let lastItem;


        for (let i = this._operation.length - 1; i >= 0; i--) {


            if (this.isOperator(this._operation[i]) === isOperator) {
                lastItem = this._operation[i];

                break;


            }
            if (!lastItem) {

                lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
            }
        }
        return lastItem;
    }

    displayLastNumber() {
        let lastNumber = this.getLastItem(false);

        if (!lastNumber) lastNumber = 0;

        this.displayCalc = lastNumber;
    }

    setDisplayDateTime() {
        this.displayDate = this.currentDate.toLocaleDateString(this._locale);
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
    }

    get displayDate() {
        return this._dateEl.innerHTML;
    }
    set displayDate(value) {
        this._dateEl.innerHTML = value;
    }

    get displayTime() {
        return this._timeEl.innerHTML;
    }

    set displayTime(value) {
        this._timeEl.innerHTML = value;
    }
    get displayCalc() {
        return this._displayCalcEl.innerHTML;
    }

    set displayCalc(value) {

        if (value.toString().length > 12) {
            this.setError();
            return false;
        }
        this._displayCalcEl.innerHTML = value;
    }

    get currentDate() {
        return new Date();
    }

    set currentDate(value) {
        this._currentDate = value;
    }

}