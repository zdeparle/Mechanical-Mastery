// Template for creating concept pages
// This file contains shared functions and data structures

const conceptPageTemplate = {
    // Generate equation HTML
    generateEquationHTML: function(eqId, equationData) {
        const vars = Object.keys(equationData.variables).map(varName => {
            const varData = equationData.variables[varName];
            return `
                <div class="variable-def">
                    <strong><span class="var-name">${varName}</span> - ${varData.name}</strong>
                    <div class="var-description">${varData.description || ''} (${varData.units ? varData.units.join(', ') : varData.unit})</div>
                </div>
            `;
        }).join('');

        return `
            <div class="equation-item" id="${eqId}">
                <div class="equation-formula">
                    <div class="equation-math">
                        ${equationData.formula}
                    </div>
                </div>
                <div class="variable-definitions">
                    ${vars}
                </div>
            </div>
        `;
    },

    // Initialize all equations for a concept
    initEquations: function(equationsData) {
        Object.keys(equationsData).forEach(eqId => {
            const eqElement = document.getElementById(eqId);
            if (eqElement) {
                const mathElement = eqElement.querySelector('.equation-math');
                if (mathElement) {
                    const formula = equationsData[eqId].formula;
                    
                    // Store original formula for MathJax rendering
                    mathElement.setAttribute('data-formula', formula);
                    mathElement.textContent = formula;
                    
                    // Initialize solver after MathJax renders
                    setTimeout(() => {
                        if (window.MathJax) {
                            MathJax.typesetPromise([mathElement]).then(() => {
                                // After MathJax renders, make variables clickable
                                makeVariablesClickable(eqId, equationsData[eqId], mathElement);
                                initEquationSolver(eqId, equationsData[eqId]);
                            }).catch(err => console.error(err));
                        } else {
                            makeVariablesClickable(eqId, equationsData[eqId], mathElement);
                            initEquationSolver(eqId, equationsData[eqId]);
                        }
                    }, 500);
                }
            }
        });
    }
};

// Make variables clickable in rendered MathJax (simplified - button approach is used instead)
function makeVariablesClickable(eqId, equationData, mathElement) {
    // Variables are selected via dropdown in the input fields
    // This function is kept for compatibility but the button approach is used
}
};

// Tab switching function
function switchTab(tabName) {
    document.querySelectorAll('.concept-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.concept-tab').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
}

