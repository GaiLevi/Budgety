
// Budget Controller
var budgetController = (function(){
    
    var expense = function(id, description, value, money){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
        this.money = money;
    };
    
    expense.prototype.CalcPercentage = function(totalIncome){
        if(totalIncome > 0){
        this.percentage = Math.round((this.value / totalIncome)* 100);}
        else {
            this.percentage = -1;
        }
    };
    
  
    
    expense.prototype.getPercentage = function(){
        return this.percentage;
    };
    
    var income = function(id, description, value, money){
        this.id = id;
        this.description = description;
        this.value = value;
        this.money = money;
    };   
    
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum = sum + cur.value;
        });
        data.totals[type] = sum;
    };
    
    var data = {
        allItems: {
            exp : [],
            inc : []
        }, 
        totals : {
            exp: 0,
            inc: 0
        },
        
        budget: 0,
        percentage: -1
    };
    
    var getRates = {
            USD: 3.61,
            EUR: 3.88,
            NIS: 1
        }
    
    return {
        addItem: function(type, des, val, mon){
           var ID, newItem;
            // create new ID
            if (data.allItems[type].length > 0){
           ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }  else{
                ID = 0;
            }
            
            /////////
            
            if (mon === 'USD'){
                val = val * getRates.USD;
            } else if(mon === 'EUR'){
                val = val * getRates.EUR;
            } else {val = val * getRates.NIS;}
              
            
            ///////////
            
            // create new item
            
            if (type === 'exp'){
                newItem = new expense(ID, des, val);
            } else if (type === 'inc'){
                newItem = new income(ID, des, val);
            }
            
            data.allItems[type].push(newItem);
            return newItem;
        },
        
        deleteItem: function(type, id){
            var ids, index;
            
            ids = data.allItems[type].map(function(cur){
                return cur.id;
            });
            
            index= ids.indexOf(id);
            if (index !== -1){
                data.allItems[type].splice(index, 1);
            };
        },
        
        calculateBudget: function(){
            
            // calculate total incomes and expenses
            calculateTotal('inc');
            calculateTotal('exp');
            
            // calculate the Budget: income and expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate the presentage of income that we spent
            if(data.totals.inc > 0){
            data.percentage = Math.round((data.totals.exp / data.totals.inc)*100); }     
            else {
                data.percentage = -1;
            }
        },
        
        calculatePercentage: function(){
            data.allItems.exp.forEach(function(cur){
                cur.CalcPercentage(data.totals.inc);
            });    
        },
        
        getPercentage: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },
        
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
       
       testing: function(){
            return console.log(data);
        } 
      } 
    })();


// ***UI Controller****


var UIController = (function(){
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn: '.add__btn',
        restartBtn: '.restart__btn',
        inputmoney: '.add__money',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
        budgetTitle: '.budget__title'
    };
    
               var formatNumber = function(num, type){
            var numSplit, int ,dec ,sign;
            
            num = Math.abs(num);    
            num = num.toFixed(2);   // מוסיף שתי ספרות עשרוניות אחרי המספר
            
            numSplit = num.split('.');
            int = numSplit[0];
            if (int.length > 3){
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            }

            dec = numSplit[1];
            
            
            type === 'exp' ? sign = '-' : sign = '+';
            return sign + ' ' + int + '.' + dec;
            
    };
    
    var nodeListForEach = function(list, callback){
                for(var i = 0; i < list.length; i++){
                    callback(list[i], i); }
            };
    
    
    

    
    return { 
        getInput: function(){
            return{ 
            type: document.querySelector(DOMstrings.inputType).value, //Will be either inc or exp
            descriprion: document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
            money: document.querySelector(DOMstrings.inputmoney).value
            };
            
        },
        addListItem: function(obj, type){
          var html, newHtml, element;
            if (type === 'inc'){
                element = DOMstrings.incomeContainer;
                
               html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'; 
            }else if (type === 'exp'){
                element = DOMstrings.expensesContainer;
                
               html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },
        
        clearFields: function(){
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + " ," + DOMstrings.inputValue );
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array){
                              current.value = "";
                              });
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if(obj.percentage > 0){
            document.querySelector(DOMstrings.percentageLabel).textContent = (obj.percentage + '%');          
            }else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        
        displayPercentages: function(percentages){
            
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            
                
                nodeListForEach(fields, function(current, index){
                    
                    if(percentages[index] > 0){
                        current.textContent = percentages[index] + '%';
                    } else {
                        current.textContent = '---'; }
                });           
            
        },
        
        displayDate: function() {
            var now, year, month, months;
            
            now = new Date(); 
            months = ['January' ,'February' , 'March', 'April', 'May', 'Juny', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        
        changedType : function(){
            
           var fields =  document.querySelectorAll(
               DOMstrings.inputType + ',' +
               DOMstrings.inputDescription + ',' +
               DOMstrings.inputValue + ',' +
               DOMstrings.inputmoney
            );
            
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        
                budgetColor : function(){
            var budget = budgetController.getBudget();
            var x = budget.budget;
            if (x < 0){
                document.querySelector(DOMstrings.budgetLabel).classList.add('red');
            }else {
                document.querySelector(DOMstrings.budgetLabel).classList.remove('red');
            }
        },
        

        
        
           getDOMstrings : function(){
        return DOMstrings; 
       }
   }
        
})();


// Global APP Controller
var controller = (function(budgetCtrl, UIctrl){
    
    var setupEventListener = function(){
            var DOM = UIctrl.getDOMstrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem); 
        document.querySelector(DOM.restartBtn).addEventListener('click', ctrlRestartBtn);
        
        
        document.addEventListener('keypress', function(event){
        if(event.keyCode === 13 || event.which === 13){   
            ctrlAddItem();
           }          
        }); 
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UIctrl.changedType);
        
    }
         
    
    var updateBudget = function(){
     // 1. Calculate the budget
        budgetCtrl.calculateBudget();      
        
     // 2. Return the budget  
        var budget = budgetCtrl.getBudget();
    
     // 3. Display the budget to the UI
        UIctrl.displayBudget(budget);
    
    /// change the budget colour while minus
       UIctrl.budgetColor(); 
    };
        
    var updatePercentage = function(){
        
        // 1. calculate percentage
        budgetCtrl.calculatePercentage();
        
        // 2. Read percentage from the budger controller.
        var percentages = budgetCtrl.getPercentage();
        
        // 3. update the UI with the new percentages.
        UIctrl.displayPercentages(percentages);
        
    };
    
    var ctrlAddItem = function(){
        var input, newItem;
        
    // 1. Get the filed input data 
    input = UIctrl.getInput();
        
    if (input.descriprion !== "" && !isNaN(input.value) && input.value > 0){
                
    // 2. Add the item to the bugdet controller
    newItem = budgetCtrl.addItem(input.type, input.descriprion, input.value, input.money);
        
    // 3. Add the item to the UI
    UIctrl.addListItem(newItem, input.type);
    
    // 4. Clear the fields
    UIctrl.clearFields();
        
    // 5.Calculate and update the budget    
    updateBudget();}
        
    // 6.Calculate and update the percentages
        updatePercentage();
        
    };
    
        var ctrlDeleteItem = function(event){
            var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
            
            if(itemID){
                splitID = itemID.split('-');
                type = splitID[0];
                ID = parseInt(splitID[1]);
                
                //1. Delete the item from the data structure.
                budgetCtrl.deleteItem(type, ID);
                
                //2. Delete the item from the UI
                UIctrl.deleteListItem(itemID);
                
                //3. update and show the new budget
                updateBudget();
            };
    };
    
    var ctrlRestartBtn = function(){
      location.reload()  
        
    };
    

    
    return { 
        init: function(){
            setupEventListener();
            console.log('App is running');
            UIctrl.displayDate();
            UIctrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
                
            });
        }
    }
    

    
})(budgetController, UIController);

controller.init();






