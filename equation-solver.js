// Interactive Equation Solver
// Handles equation rearrangement, unit conversion, and live solving

class EquationSolver {
    constructor(equationData) {
        this.equation = equationData;
        this.selectedVariable = null;
        this.inputValues = {};
        this.result = null;
    }

    // Rearrange equation to solve for selected variable
    rearrangeEquation(variable) {
        this.selectedVariable = variable;
        return this.equation.rearrangements[variable] || this.equation.formula;
    }

    // Convert units to base SI units
    convertToSI(value, unit, variable) {
        const unitConversions = {
            // Length
            'mm': 0.001, 'cm': 0.01, 'm': 1, 'km': 1000, 'in': 0.0254, 'ft': 0.3048,
            // Mass
            'g': 0.001, 'kg': 1, 'lb': 0.453592,
            // Time
            's': 1, 'min': 60, 'h': 3600,
            // Force
            'N': 1, 'kN': 1000, 'lbf': 4.44822,
            // Pressure/Stress
            'Pa': 1, 'kPa': 1000, 'MPa': 1e6, 'GPa': 1e9, 'psi': 6894.76, 'ksi': 6894760,
            // Energy
            'J': 1, 'kJ': 1000, 'cal': 4.184, 'BTU': 1055.06,
            // Power
            'W': 1, 'kW': 1000, 'hp': 745.7,
            // Temperature (offset conversions)
            'K': 1, '°C': 1, '°F': 5/9,
            // Angle
            'rad': 1, 'deg': Math.PI / 180,
            // Velocity
            'm/s': 1, 'km/h': 0.277778, 'ft/s': 0.3048, 'mph': 0.44704,
            // Acceleration
            'm/s²': 1, 'ft/s²': 0.3048, 'g': 9.80665
        };

        // Handle temperature offset
        if (unit === '°C') {
            return parseFloat(value) + 273.15; // Convert to Kelvin
        } else if (unit === '°F') {
            return (parseFloat(value) - 32) * 5/9 + 273.15; // Convert to Kelvin
        }

        // Get base unit from variable definition
        const baseUnit = this.equation.variables[variable]?.unit || '';
        const conversion = unitConversions[unit] || 1;
        
        return parseFloat(value) * conversion;
    }

    // Convert from SI to display unit
    convertFromSI(value, targetUnit) {
        const unitConversions = {
            'mm': 1000, 'cm': 100, 'm': 1, 'km': 0.001, 'in': 39.3701, 'ft': 3.28084,
            'g': 1000, 'kg': 1, 'lb': 2.20462,
            's': 1, 'min': 1/60, 'h': 1/3600,
            'N': 1, 'kN': 0.001, 'lbf': 0.224809,
            'Pa': 1, 'kPa': 0.001, 'MPa': 1e-6, 'GPa': 1e-9, 'psi': 0.000145038, 'ksi': 1.45038e-7,
            'J': 1, 'kJ': 0.001, 'cal': 0.239006, 'BTU': 0.000947817,
            'W': 1, 'kW': 0.001, 'hp': 0.00134102,
            'K': 1, '°C': 1, '°F': 9/5,
            'rad': 1, 'deg': 180 / Math.PI,
            'm/s': 1, 'km/h': 3.6, 'ft/s': 3.28084, 'mph': 2.23694,
            'm/s²': 1, 'ft/s²': 3.28084, 'g': 0.101972
        };

        if (targetUnit === '°C') {
            return parseFloat(value) - 273.15;
        } else if (targetUnit === '°F') {
            return (parseFloat(value) - 273.15) * 9/5 + 32;
        }

        const conversion = unitConversions[targetUnit] || 1;
        return parseFloat(value) * conversion;
    }

    // Solve equation for selected variable
    solve() {
        if (!this.selectedVariable) {
            return null;
        }

        try {
            const solver = this.equation.solvers[this.selectedVariable];
            if (!solver) {
                return null;
            }

            // Convert all input values to SI
            const siValues = {};
            Object.keys(this.inputValues).forEach(varName => {
                if (varName !== this.selectedVariable && this.inputValues[varName]) {
                    const { value, unit } = this.inputValues[varName];
                    siValues[varName] = this.convertToSI(value, unit, varName);
                }
            });

            // Solve using the solver function
            const resultSI = solver(siValues);
            
            // Convert result back to display unit
            const displayUnit = this.equation.variables[this.selectedVariable]?.unit || '';
            this.result = {
                value: resultSI,
                unit: displayUnit,
                displayValue: this.convertFromSI(resultSI, displayUnit)
            };

            return this.result;
        } catch (error) {
            console.error('Error solving equation:', error);
            return null;
        }
    }

    // Set input value for a variable
    setInput(variable, value, unit) {
        if (variable !== this.selectedVariable) {
            this.inputValues[variable] = { value, unit };
        }
    }

    // Clear all inputs
    clear() {
        this.inputValues = {};
        this.result = null;
        this.selectedVariable = null;
    }
}

// Initialize equation solver for a given equation element
function initEquationSolver(equationId, equationData) {
    const solver = new EquationSolver(equationData);
    const equationElement = document.getElementById(equationId);
    
    if (!equationElement) return;

    // Add a "Solve Equation" button to show input fields
    let solveButton = equationElement.querySelector('.show-solver-btn');
    if (!solveButton) {
        solveButton = document.createElement('button');
        solveButton.textContent = 'Solve This Equation';
        solveButton.className = 'show-solver-btn';
        solveButton.style.cssText = 'margin-top: 1rem; padding: 0.8rem 1.5rem; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;';
        solveButton.onclick = () => {
            // Show input fields with first variable as default
            const firstVar = Object.keys(equationData.variables)[0];
            solver.rearrangeEquation(firstVar);
            showInputFields(equationId, firstVar, equationData, solver);
        };
        equationElement.appendChild(solveButton);
    }
}

// Update equation display with rearranged formula
function updateEquationDisplay(equationId, formula, equationData) {
    const equationElement = document.getElementById(equationId);
    const mathElement = equationElement.querySelector('.equation-math');
    
    if (mathElement) {
        mathElement.textContent = formula;
        // Re-render MathJax
        if (window.MathJax) {
            MathJax.typesetPromise([mathElement]).catch((err) => console.error(err));
        }
    }
}

// Show input fields for equation solving
function showInputFields(equationId, solveFor, equationData, solver) {
    const equationElement = document.getElementById(equationId);
    let inputContainer = equationElement.querySelector('.equation-inputs');
    
    if (!inputContainer) {
        inputContainer = document.createElement('div');
        inputContainer.className = 'equation-inputs';
        equationElement.appendChild(inputContainer);
    }
    
    inputContainer.innerHTML = '';
    inputContainer.style.display = 'block';
    
    // Add variable selector
    const selectorGroup = document.createElement('div');
    selectorGroup.className = 'equation-input-group';
    const selectorLabel = document.createElement('label');
    selectorLabel.textContent = 'Solve for:';
    selectorLabel.className = 'equation-input-label';
    const selector = document.createElement('select');
    selector.className = 'equation-unit-select';
    selector.id = `${equationId}-solve-for`;
    selector.style.width = '100%';
    selector.style.marginBottom = '1rem';
    
    Object.keys(equationData.variables).forEach(varName => {
        const option = document.createElement('option');
        option.value = varName;
        option.textContent = `${varName} (${equationData.variables[varName].name})`;
        if (varName === solveFor) {
            option.selected = true;
        }
        selector.appendChild(option);
    });
    
    selector.addEventListener('change', (e) => {
        const newSolveFor = e.target.value;
        solver.rearrangeEquation(newSolveFor);
        updateEquationDisplay(equationId, equationData.rearrangements[newSolveFor] || equationData.formula, equationData);
        showInputFields(equationId, newSolveFor, equationData, solver);
    });
    
    selectorGroup.appendChild(selectorLabel);
    selectorGroup.appendChild(selector);
    inputContainer.appendChild(selectorGroup);
    
    // Get all variables except the one we're solving for
    const inputVars = Object.keys(equationData.variables).filter(v => v !== solveFor);
    
    inputVars.forEach(varName => {
        const varData = equationData.variables[varName];
        const inputGroup = document.createElement('div');
        inputGroup.className = 'equation-input-group';
        
        const label = document.createElement('label');
        label.textContent = `${varName} (${varData.name}):`;
        label.className = 'equation-input-label';
        
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'equation-input-wrapper';
        
        const input = document.createElement('input');
        input.type = 'number';
        input.step = 'any';
        input.placeholder = 'Enter value';
        input.className = 'equation-input';
        input.id = `${equationId}-${varName}-value`;
        
        const unitSelect = document.createElement('select');
        unitSelect.className = 'equation-unit-select';
        unitSelect.id = `${equationId}-${varName}-unit`;
        
        // Add unit options
        const units = varData.units || [varData.unit];
        units.forEach(unit => {
            const option = document.createElement('option');
            option.value = unit;
            option.textContent = unit;
            if (unit === varData.unit) {
                option.selected = true;
            }
            unitSelect.appendChild(option);
        });
        
        inputWrapper.appendChild(input);
        inputWrapper.appendChild(unitSelect);
        
        inputGroup.appendChild(label);
        inputGroup.appendChild(inputWrapper);
        inputContainer.appendChild(inputGroup);
        
        // Add event listeners
        input.addEventListener('input', () => updateEquationResult(equationId, solveFor, equationData, solver));
        unitSelect.addEventListener('change', () => updateEquationResult(equationId, solveFor, equationData, solver));
    });
    
    // Add solve button and result display
    const solveButton = document.createElement('button');
    solveButton.textContent = 'Calculate';
    solveButton.className = 'equation-solve-btn';
    solveButton.onclick = () => updateEquationResult(equationId, solveFor, equationData, solver);
    inputContainer.appendChild(solveButton);
    
    const resultDisplay = document.createElement('div');
    resultDisplay.className = 'equation-result';
    resultDisplay.id = `${equationId}-result`;
    inputContainer.appendChild(resultDisplay);
}

// Update equation result
function updateEquationResult(equationId, solveFor, equationData, solver) {
    const inputVars = Object.keys(equationData.variables).filter(v => v !== solveFor);
    let allFilled = true;
    
    inputVars.forEach(varName => {
        const valueInput = document.getElementById(`${equationId}-${varName}-value`);
        const unitSelect = document.getElementById(`${equationId}-${varName}-unit`);
        
        if (valueInput && unitSelect) {
            const value = parseFloat(valueInput.value);
            const unit = unitSelect.value;
            
            if (!isNaN(value) && value !== '') {
                solver.setInput(varName, value, unit);
            } else {
                allFilled = false;
            }
        }
    });
    
    const resultElement = document.getElementById(`${equationId}-result`);
    if (resultElement) {
        if (allFilled) {
            const result = solver.solve();
            if (result) {
                const varData = equationData.variables[solveFor];
                resultElement.innerHTML = `
                    <div class="equation-result-value">
                        <strong>${solveFor} = ${result.displayValue.toFixed(4)} ${varData.unit}</strong>
                    </div>
                `;
                resultElement.style.display = 'block';
            }
        } else {
            resultElement.style.display = 'none';
        }
    }
}

