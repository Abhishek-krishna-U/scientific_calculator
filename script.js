
    const numbtn = document.querySelectorAll('.number');
    const opbtns = document.querySelectorAll('.operator');
    const display = document.getElementById('display');
    const dltbtn = document.getElementById('delete');
    const clrbtn = document.getElementById('clear');
    const equal = document.getElementById('equal');
    const degRadBtn = document.getElementById('degRadBtn');
    let isDegreeMode = true; // Tracks the current mode

    let issecond = false;
    let num1 = '';
    let num2 = '';
    let operator = '';
    let stack = [];

    const prefixOps = ['sin', 'cos', 'tan', 'sin-1', 'cos-1', 'tan-1', '√x', '3√x', '10x', 'log', 'ln']; //operators to be prefixed altered in normal calculator functianality

    // The Gamma function calculates factorials for decimal numbers
function gamma(z) {
    const g = 7;
    const C = [
        0.99999999999980993,
        676.5203681218851,
        -1259.1392167224028,
        771.32342877765313,
        -176.61502916214059,
        12.507343278686905,
        -0.13857109526572012,
        9.9843695780195716e-6,
        1.5056327351493116e-7
    ];
    
    if (z < 0.5) {
        return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
    } else {
        z -= 1;
        let x = C[0];
        for (let i = 1; i < g + 2; i++) {
            x += C[i] / (z + i);
        }
        let t = z + g + 0.5;
        return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
    }
}

//  updated factorial function
function factorial(n) {
    // Factorials for negative integers are undefined
    if (n < 0 && Number.isInteger(n)) return NaN; 
    
    // Use  exact loop for whole numbers (more precise for integers)
    if (Number.isInteger(n)) {
        if (n === 0 || n === 1) return 1;
        let res = 1;
        for (let i = 2; i <= n; i++) res *= i;
        return res;
    }
    
    // Use the Gamma function for decimals ( n! = Gamma(n + 1) )
    return gamma(n + 1);
}

    function evaluateScientific(op, val1, val2) {
        const number1 = parseFloat(val1);
        const number2 = parseFloat(val2);

        switch (op) {     // the scientific switch condition 
            case "sin":
                if (isDegreeMode) {
                    if (Math.abs(number1) % 180 === 0) return 0; // Fixes Pi rounding error
                    return Math.sin(number1 * (Math.PI / 180));
                }
                return Math.sin(number1);
                
            case "cos":
                if (isDegreeMode) {
                    if ((Math.abs(number1) - 90) % 180 === 0) return 0;
                    return Math.cos(number1 * (Math.PI / 180));
                }
                return Math.cos(number1);
                
            case "tan":
                if (isDegreeMode) {
                    if ((Math.abs(number1) - 90) % 180 === 0) return "Error";
                    if (Math.abs(number1) % 180 === 0) return 0;
                    return Math.tan(number1 * (Math.PI / 180));
                }
                return Math.tan(number1);
                
            case "sin-1":
                return isDegreeMode ? Math.asin(number1) * (180 / Math.PI) : Math.asin(number1);
            case "cos-1":
                return isDegreeMode ? Math.acos(number1) * (180 / Math.PI) : Math.acos(number1);
            case "tan-1":
                return isDegreeMode ? Math.atan(number1) * (180 / Math.PI) : Math.atan(number1);
            
            case "π":
                return Math.PI;
            case "e":
                return Math.E;
            case "x2":
                return Math.pow(number1, 2);
            case "xy":
                return Math.pow(number1, number2);
            case "√x":
                if(number1 < 0){
                    return Math.sqrt(Math.abs(number1)) + "i"; //handles negative numbers
                }
                return Math.sqrt(number1);
            case "3√x":
                return Math.cbrt(number1);
            case "y√x":
                return Math.pow(number1, 1 / number2); 
            case "10x":
                return Math.pow(10, number1);
            case "1/x": 
                return number1 !== 0 ? 1 / number1 : "Error";
            case "n!":
                return factorial(number1);
            case "log":
                if (number1 < 0) {
                    const realPart = Math.log10(Math.abs(number1));
                    const imaginaryPart = (Math.PI / Math.LN10).toFixed(3);
                    return realPart + " + " + imaginaryPart + "i";
                }
                return Math.log10(number1);
                
            case "ln":
                if (number1 < 0) {
                    const realPart = Math.log(Math.abs(number1)).toFixed(3);
                    const imaginaryPart = Math.PI.toFixed(3);
                    return realPart + " + " + imaginaryPart + "i";
                }
                return Math.log(number1);
           
            default:
                return null;
        }
    }

    numbtn.forEach(function (numbutton) {
        numbutton.addEventListener('click', function () {
            if (prefixOps.includes(operator)) { // if the operator included in prefix list show the operator with the number
                num1 += numbutton.textContent;
                display.value = operator + "(" + num1 + ")";
            } else if (issecond) {    //if the entry is second number store to second  number variable 
                num2 += numbutton.textContent;
                display.value = num2;
            } else {     // otw store to the first number variable 
                num1 += numbutton.textContent;
                display.value = num1;
            }
        });
    });

    opbtns.forEach(function (opbutton) {
        opbutton.addEventListener('click', function () {
            const op = opbutton.dataset.operator;

            // Direct constants
            if (op === "π" || op === "e") {
                const constVal = evaluateScientific(op, 0, 0).toString();
                if (issecond) { // if its a scientific operation calculate and display the result
                    num2 = constVal;
                    display.value = num2;
                } else { // no operation is acrd just show the value of the constants 
                    num1 = constVal;
                    display.value = num1;
                }
                return;
            }

            // Operator selected FIRST
            if (prefixOps.includes(op)) { // if the selected operator is a prefeixop desplay and store the operator first then take the value for first number and store it
                operator = op;
                num1 = ''; 
                display.value = op + "(";
                return;
            }
             if (op === "(") {
                // 1. Save the current state to the stack
                stack.push({ num1, num2, operator, issecond });
                // 2. Wipe  for the inside of the parenthesis
                num1 = ''; num2 = ''; operator = ''; issecond = false;
                display.value = "(";
                return;
            }

            if (op === ")") {
                if (stack.length === 0) return; // Ignore if there is no opening parenthesis

                // 1. Calculate the operations inside the parenthesis right now
                if (operator !== '') {
                    equal.click(); 
                }
                
                let innerResult = num1; // The equal button puts the final answer in num1

                // 2. Pull the paused state out of the stack
                let prevState = stack.pop();
                
                // 3. Drop the new answer into the paused state
                if (prevState.issecond) {
                    num1 = prevState.num1;
                    operator = prevState.operator;
                    num2 = innerResult;
                    issecond = true;
                    display.value = num2;
                } else {
                    num1 = innerResult;
                    issecond = prevState.issecond;
                    operator = prevState.operator;
                    display.value = num1;
                }
                return;
            }
            


            if (op === "-") {
                if (num1 === '') { 
                    num1 = "-";
                    if (prefixOps.includes(operator)) {
                        display.value = operator + "(" + num1 + ")";
                    } else {
                        display.value = num1;
                    }
                    return;
                } else if (issecond && num2 === '') { 
                    num2 = "-";
                    display.value = num2;
                    return;
                }
            }
            if (num1 !== '' && num2 !== '' && operator !== '' && op !== '(' && op !== ')') {
                equal.click(); // Force the calculator to solve the current equation
            }
            

            //  prevent triggering operator state if only a minus sign is typed
            if (num1 === '' || num1 === '-') return;
            
            operator = op;
            issecond = true;
            
        });
    });
     degRadBtn.addEventListener('click', function() {
    isDegreeMode = !isDegreeMode; // Swap the mode
    degRadBtn.textContent = isDegreeMode ? "DEG" : "RAD"; // Update the button text
    });

    equal.addEventListener('click', function () {// actives wn clicking eql btn
        const number1 = parseFloat(num1);
        const number2 = parseFloat(num2);
        let result;

        if (isNaN(number1)) return;

        //  searches if the operation is scientific switch case
        const sciResult = evaluateScientific(operator, num1, num2);

        if (sciResult !== null) { // if it is then return the result from scientific switch
            result = sciResult;
        } else {   // else perform normal operation
            
            switch (operator) {//normal calculator switch case 
                case "+":
                    result = number1 + number2;
                    break;
                case "-":
                    result = number1 - number2;
                    break;
                case "*":
                    result = number1 * number2;
                    break;
                case "/":
                    result = (number2 !== 0) ? number1 / number2 : "Cannot Divide";
                    break;
                case "%":
                    result = (number1 * number2) / 100;
                    break;
                default:
                    result = number1;
            }
        }
        if (typeof result === 'number') {
            result = parseFloat(result.toFixed(10));
        }

        display.value = result;
        num1 = result.toString();
        num2 = "";
        operator = "";
        issecond = false;
    });
    document.addEventListener("keydown", function(event) {
    if (event.key === "Enter" || event.code === "NumpadEnter") {
        event.preventDefault();
        event.stopImmediatePropagation();

        equal.click();
    }
});
    clrbtn.addEventListener("click", function () { // function for clear button 
        num1 = "";
        num2 = "";
        operator = "";
        issecond = false;
        stack = [];
        display.value = "";
    });

    dltbtn.addEventListener("click", function () { // function for delete button 
        if (prefixOps.includes(operator) && num1 !== '') { // if it is scientific op
            num1 = num1.slice(0, -1);
            display.value = operator + "(" + num1 + ")";
        } else if (issecond) { // if the displayed number is second 
            num2 = num2.slice(0, -1);
            display.value = num2;
        } else {  //if the displayed number is first one 
            num1 = num1.slice(0, -1);
            display.value = num1;
        }
    });

    const mode1 = document.getElementById('mode1'); //show the scientific part
    mode1.addEventListener('click', function () {
        document.getElementById('scientificButton').style.display = 'block';
    });

    const mode2 = document.getElementById('mode2');
    mode2.addEventListener('click', function () {
        document.getElementById('scientificButton').style.display = 'none'; // hide the sctfc part
    });
