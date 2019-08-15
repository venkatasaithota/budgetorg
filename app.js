//budgetController
var budgetController=(function (){
    var Expense=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;
    }
    Expense.prototype.calcPercentage=function(totalIncome){
        if(totalIncome > 0){
            this.percentage=Math.round((this.value/totalIncome)*100);
        }else{
            this.percentage = -1;
        }
    }
    Expense.prototype.getPercentage =function(){
        return this.percentage;
    }
    var Income=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    }
    var calculateTotal =function(type){
        var sum=0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type]=sum;
    }
    var data={
        allItems:{
            exp:[],
            inc:[]
        },
        totals:
        {
            exp:0,
            inc:0
        },
        budget:0,
        percentage:-1
    }
    return {
        addItem:function(type,des,val){
            var newItem,ID;
            //create new ID
            if(data.allItems[type].length>0){
                ID=data.allItems[type][data.allItems[type].length-1].id+1;
            }
            else{
                ID=0;
            }
            //create new item based on 'inc' or 'exp' type
            if(type==='exp'){
                newItem=new Expense(ID,des,val);
            }
            else if(type === 'inc'){
                newItem=new Income(ID,des,val);
            }
            //push it into our data structure
            data.allItems[type].push(newItem);
            //return the new element
            return newItem;
        },
        deleteItem:function(type,id){
            var ids,index;
            ids=data.allItems[type].map(function(current){
                return current.id;
            });
            index=ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
        },
        calculateBudget:function(){
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc'); 
            //calculate the budget :income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            //calculate the percentage of income that we spent
            if(data.totals.inc >0){
                data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);
            }else{
                data.percentage=-1;
            }
            
        },
        calculatePercentage:function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },
        getPercentages:function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            }); 
            return allPerc;
        },
        getBudget:function(){
            return {
                budget:data.budget,
                percentage:data.percentage,
                totalInc:data.totals.inc,
                totalExp:data.totals.exp
            }
        },

        testing:function(){
            console.log(data)
        }
    }
})();


//UIController
var uiController=(function (){
    //some code related to ui
    var DOMString={
        inputType:'.add__type',
        inputDescription:'.add__description',
        inputValue:'.add__value',
        inputBtn:'.add__btn',
        expenseContainer:'.expenses__list',
        incomeContainer:'.income__list',
        budgetLabel:'.budget__value',
        incomeLabel:'.budget__income--value',
        expensesLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container:'.container',
        expensesPercLabel:'.item__percentage',
        dateLabel:'.budget__title--month'


    }
    var formatNumber=function(num,type){
        var numSplit,int,dec,type;
        num=Math.abs(num);
        num=num.toFixed(2);
        numSplit=num.split('.');
        int=numSplit[0];
        if(int.length>3){
            int =int.substr(0,int.length-3)+','+int.substr(int.length-3,3);
        }
        dec =numSplit[1];
        return (type === 'exp' ? '-' :'+')+ ' '+int+'.'+dec;
    }
    
    var nodeListForEach = function(list,callback){
        for (var i=0;i<list.length;i++){
            callback(list[i],i);
        }
    }
    return {
        getInput:function(){
            return{
                    type:document.querySelector(DOMString.inputType).value,
                    description:document.querySelector(DOMString.inputDescription).value,
                    value: parseFloat(document.querySelector(DOMString.inputValue).value)
            }
        
        },
        clearFields:function(){
            var fields,fieldsArr;
            fields=document.querySelectorAll(DOMString.inputDescription+','+DOMString.inputValue);
            fieldsArr=Array.prototype.slice.call(fields);
            fieldsArr.forEach(element => {
                        element.value='';                
            });
            fieldsArr[0].focus();
        },
        changeType:function(){
            var fields=document.querySelectorAll(
                DOMString.inputType+','+
                DOMString.inputDescription+','+
                DOMString.inputValue
                );
                nodeListForEach(fields,function(cur){
                    cur.classList.toggle('red-focus');
                })
                document.querySelector(DOMString.inputBtn).classList.toggle('red'); 
        },
        displayBudget:function(obj){
            obj.budget>0?type='inc':type='exp';
                document.querySelector(DOMString.budgetLabel).textContent=formatNumber( obj.budget,type);
                document.querySelector(DOMString.incomeLabel).textContent=formatNumber( obj.totalInc,'inc');
                document.querySelector(DOMString.expensesLabel).textContent=formatNumber( obj.totalExp,'exp');
                if(obj.percentage >0)
                {
                document.querySelector(DOMString.percentageLabel).textContent=obj.percentage ;
                }else{
                    document.querySelector(DOMString.percentageLabel).textContent='---';
                }
            },
            dispalyPercentages:function(percentages){
                var fields = document.querySelectorAll(DOMString.expensesPercLabel);

                nodeListForEach(fields,function(current,index){
                    if(percentages[index]>0){
                        current.textContent =percentages[index]+"%";
                    }else{
                        current.textContent = '---';
                    }
                })
            },
            displayMonth:function(){
                var now,months,month,year;
                now=new Date();
                months=['January','February','March','April','May','June','July','August','September','October','November','December'];
                month=now.getMonth();
                year=now.getFullYear();
                document.querySelector(DOMString.dateLabel).textContent=months[month]+ ' ' + year;
            },
        getDOMStrings:function(){
            return DOMString;
        },
        deleteListItem:function(selectorID){
            var el=document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        addListItem:function(obj,type){
            var html,element,newHtml;
            //create HTML string with placeholder text
            if(type==='inc')
            {
                element =DOMString.incomeContainer;
                html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else if(type ==='exp')
            {
                element=DOMString.expenseContainer;
                html=' <div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            //replace the placeholder text with some actual data
            newHtml=html.replace('%id%',obj.id);
            newHtml=newHtml.replace('%description%',obj.description);
            newHtml=newHtml.replace('%value%',formatNumber(obj.value,type));
            //inserting the html into dom
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml)

        }
    }
})();


// app controller which is for event listeners
var Controller=(function(budctrl,uictrl){
    var setupEventListeners=function(){
        var DOM=uictrl.getDOMStrings()
         //some code related to event listener
    document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem)
    document.addEventListener('keypress',function(event){
        if(event.keyCode===13 || event.which === 13)
        {
            ctrlAddItem();
        }
    });
    document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener('change',uictrl.changeType);
}
    var updatePercentages=function(){
        //1.calculate the percentages.
        budctrl.calculatePercentage();
        //2.return the percentages.
        var percentages=budctrl.getPercentages(); 
        //3.display the percentages to the ui
        uictrl.dispalyPercentages(percentages)
    }
    var updateBudget=function(){
        var budget
        //1.calculate the budget
        budctrl.calculateBudget();
        //2.return the budget
        budget = budctrl.getBudget();
        //3.dispaly the budget to the ui
        uictrl.displayBudget(budget);
    }
    var ctrlAddItem=function(){
        var input,newItem
        //1.get data from input fields
        input = uictrl.getInput();
        if(input.description !=="" && !isNaN(input.value) && input.value >0)
        {
        //2.add the values to budget controller
        newItem = budgetController.addItem(input.type,input.description,input.value);
        //3.add yhe item to ui
        uictrl.addListItem(newItem,input.type)
        //4.clear fields
        uictrl.clearFields();
        //5.calculate and update budget
        updateBudget();
        //6.calculate and update percentages
        updatePercentages();
        }
    }
    var ctrlDeleteItem = function(event){
        var itemID,splitID,type,ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID=itemID.split('-');
            type=splitID[0];
            ID=parseInt(splitID[1]);

            //1.delete the item from the data structure
                budctrl.deleteItem(type,ID);
            //2.delete the item from the ui
                uictrl.deleteListItem(itemID)
            //3.update and show the new budget
                updateBudget();
            //4.calculate and update percentages
                updatePercentages();
        }
    }
   return{
       init:function(){
           console.log('aplication started');
           uictrl.displayMonth();
           uictrl.displayBudget({
            budget:0,
            percentage:-1,
            totalInc:0,
            totalExp:0
           }
           );
           setupEventListeners();
       }
   }
})(budgetController,uiController); 
Controller.init();