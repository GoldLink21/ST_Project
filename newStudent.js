
var ref=firebase.app().database().ref()
var userRef=ref.child('users')

var students=[];

/**@returns {Promise} a promise with the student data in it */
async function getStudent(fn,ln){
    return new Promise((resolve,reject)=>{
        ref.once('value',(snapshot)=>{
            var val=snapshot.val()
            for(p1 in val){
                for(p2 in val[p1]){
                    if(val[p1][p2]['firstName']===fn&&val[p1][p2]['lastName']===ln){
                        resolve(val[p1][p2])
                    }
                }
            }
        })
    })
}

ref.orderByChild("lastName").on('child_added',()=>{})

function setStuData(fn,ln,{min,hours,firstName,lastName,period,year}={}){  
    ref.once('value',(snapshot)=>{
        var val=snapshot.val()
        for(p1 in val){
            for(p2 in val[p1]){
                if(val[p1][p2]['firstName']===fn&&val[p1][p2]['lastName']===ln){
                    var refrence=p1+'/'+p2+'/' //This is the student
                    var updateObj={}
                    if(min)
                        updateObj[refrence+'min']=min
                    if(hours)
                        updateObj[refrence+'hours']=hours
                    if(firstName)
                        updateObj[refrence+'firstName']=firstName
                    if(lastName)
                        updateObj[refrence+'lastName']=lastName
                    if(period)
                        updateObj[refrence+'period']=period
                    if(year)
                        updateObj[refrence+'year']=year

                    ref.update(updateObj)
                }
            }
        }
    })//.then(()=>updateTable())
}

function removeStu(fn,ln){  
    ref.once('value',(snapshot)=>{
        var val=snapshot.val()
        for(p1 in val){
            for(p2 in val[p1]){
                if(val[p1][p2]['firstName']===fn&&val[p1][p2]['lastName']===ln){
                    var refrence=p1+'/'+p2 //This is the student
                    var updateObj={}
                    updateObj[refrence]=null
                    ref.update(updateObj)
                }
            }
        }
    })
}

/**Moves the minutes that are greater than 60 to the hours */
function updateStuHours(){
    ref.once('value',(snapshot)=>{
        var val=snapshot.val()
        for(p1 in val){
            for(p2 in val[p1]){
                if(val[p1][p2].min>=60){
                    var newMin=parseInt(val[p1][p2].min),
                        newHours=parseInt(val[p1][p2].hours)
                    while(newMin>=60){
                        newMin-=60
                        newHours++
                    }
                    setStuData(val[p1][p2].firstName,val[p1][p2].lastName,{min:newMin,hours:newHours})
                }
            }
        }
    })
}

function addToTable(stu){
    var row=document.createElement('tr')
    function addToRow(s){
        var ele=document.createElement('td')
        ele.innerHTML=s
        row.appendChild(ele)
        return ele;
    }
    var table=document.getElementById('stuView')
    
    addToRow(stu.lastName+", "+stu.firstName)
    addToRow(stu.hours+' hours, '+stu.min+' minutes')
    addToRow(stu.period)
    addToRow(stu.year)

    table.appendChild(row)
}

function studentInit(){
    ref.once('value',(snapshot)=>{
        var val=snapshot.val();
        for(p1 in val){
            for(p2 in val[p1]){
                //Adds all the students to the table
                addToTable(val[p1][p2])
            }
        }
    })
}

function listStudentsInConsole(){
    ref.once('value',function(snapshot){
        var val = snapshot.val();
        for(part in val)
            for(prop in val[part])
                console.log(val[part][prop])
    },(errorObject)=>{
        console.log('Read Failed: '+errorObject.code)
    })
}

/**
 * @description Adds a new student to the students array
 * @param {string} firstName The student's first name
 * @param {string} lastName The student's last name
 * @param {number} curHours The current ammount of hours the student has
 * @param {number} curMins The current ammount of minutes out of an hour the student has
 * @param {1|2|3|4|5|6|7} classPeriod The 1st period that the student has the class
 * @param {1|2} year The year the student is enrolled in. 1 || 2
 */
function addStudent(firstName,lastName,classPeriod,year,curHours=0,curMins=0){
    var hasData=(firstName!==undefined&&firstName!==''&&lastName!==undefined&&lastName!==''&&classPeriod!==undefined&&year!==undefined),
        dataGood=(/[1-7]/.test(classPeriod)&&/[1-2]/.test(year)&&parseInt(classPeriod)===parseFloat(classPeriod)&&parseInt(year)===parseFloat(year))
    if(hasData&&dataGood){
        userRef.push({
            firstName:firstName,
            lastName:lastName,
            year:year,
            hours:curHours,
            min:curMins,
            period:classPeriod
        })

        addCompletedWindow(firstName,lastName);
        return true;
    }else{
        alert("Please enter all the requested data");
        return false;
    }
}

var completedWindowTimeout=0,newWindow=false;
const completedWindowTimeoutMax=100;

function addCompletedWindow(first,last){
    var ele=document.getElementById('addedStudent')
    ele.innerHTML=first+' '+last+' was added successfully'
    ele.style.visibility='visible'
    newWindow=true
}

function eleInit(){
    document.getElementById('newStudent').style.visibility='hidden';
    document.getElementById('RemoveStu').style.visibility='visible'
    
}

function showExtraDataInput(){
    document.getElementById('preTime').style.visibility=(document.getElementById('checked').checked)?'visible':'hidden'
}

function toggleNewStudentWindow(){
    var newStu=document.getElementById('newStudent')
    var stuBtn=document.getElementById('studentBtn')
    switch(newStu.style.visibility){
        case 'visible':
            var checked=document.getElementById('checked')
            if(checked.checked)
                checked.click()
            newStu.style.visibility='hidden'
            stuBtn.style.visibility='visible'
            break
        case 'hidden':
            newStu.style.visibility='visible'
            stuBtn.style.visibility='hidden'            
            break
    }
}

function toggleRemoveStudentWindow(){
    var btn=document.getElementById('RemoveStu')
    var window=document.getElementById('RemoveMenu')
    switch(btn.style.visibility){
        case 'visible':
            btn.style.visibility='hidden'
            window.style.visibility='visible'
            break
        case 'hidden':
            btn.style.visibility='visible'
            window.style.visibility='hidden'

    }
}

var completedTimeout=setInterval(()=>{
    if(newWindow&&completedWindowTimeout<completedWindowTimeoutMax)
        completedWindowTimeout++
    else{
        completedWindowTimeout=0
        newWindow=false;
        document.getElementById('addedStudent').style.visibility='hidden'
    }
},60)

function clearTable(){
    var div=document.getElementById('listView')
    var table=div.querySelector('table')
    var rows=table.querySelectorAll('tr')
    for(let i=1;i<rows.length;i++){
        table.removeChild(rows[i])
    }
}

ref.on('child_added',updateAll)
ref.on('child_removed',updateAll)
ref.on('child_changed',updateAll)
ref.on('child_moved',updateAll)

function updateAll(){
    updateStuHours()
    updateTable()
}

function updateTable(){
    clearTable()
    studentInit()
}